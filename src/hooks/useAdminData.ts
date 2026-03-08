/**
 * useAdminData — единый хук данных для Admin-панели.
 *
 * Сейчас использует моковые данные из src/data/mockData.ts.
 *
 * ═══ КАК ПОДКЛЮЧИТЬ API ═══════════════════════════════════════════════════════
 *
 * 1. Замените инициализацию состояния на загрузку с сервера:
 *
 *    const [users, setUsers] = useState<User[]>([]);
 *
 *    useEffect(() => {
 *      setLoading(true);
 *      fetch('/api/users')
 *        .then(r => { if (!r.ok) throw new Error('Ошибка загрузки'); return r.json(); })
 *        .then(data => { setUsers(data); setLoading(false); })
 *        .catch(e => { setError(e.message); setLoading(false); });
 *    }, []);
 *
 * 2. Мутации (addUser, toggleCourse и т.д.) — замените на POST/PATCH:
 *
 *    const addUser = async (user: User) => {
 *      const res = await fetch('/api/users', { method: 'POST', body: JSON.stringify(user) });
 *      const created = await res.json();
 *      setUsers(prev => [...prev, created]);
 *    };
 *
 * 3. Группы и курсы — аналогично через GET /api/groups, /api/courses.
 * ══════════════════════════════════════════════════════════════════════════════
 */

import { useState, useMemo, useEffect } from "react";
import { User, CourseStatus, getInitials } from "@/components/admin/types";
import { INITIAL_USERS, GROUPS, ALL_COURSES } from "@/data/mockData";

function todayRu(): string {
  return new Date().toLocaleDateString("ru-RU");
}

export function useAdminData() {
  // ─── Данные ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<string[]>([]);

  // ─── Состояние загрузки ───────────────────────────────────────────────────
  // При подключении API: setLoading(true) перед fetch, setLoading(false) в then/catch
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Имитируем загрузку с задержкой (удалить при подключении реального API)
  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setUsers(INITIAL_USERS);
        setGroups([...GROUPS]);
        setLoading(false);
      } catch (e) {
        setError("Ошибка загрузки данных");
        setLoading(false);
      }
    }, 600);
    return () => clearTimeout(timer);
  }, []);

  // ─── Поиск ───────────────────────────────────────────────────────────────
  const [search, setSearch] = useState("");

  const filteredUsers = useMemo(
    () =>
      users.filter(
        (u) =>
          u.name.toLowerCase().includes(search.toLowerCase()) ||
          u.email.toLowerCase().includes(search.toLowerCase()) ||
          u.group.toLowerCase().includes(search.toLowerCase())
      ),
    [users, search]
  );

  // ─── Статистика ───────────────────────────────────────────────────────────
  const totalAssignments = useMemo(
    () => users.reduce((s, u) => s + u.assignments.filter((a) => a.active).length, 0),
    [users]
  );
  const totalCompleted = useMemo(
    () => users.reduce((s, u) => s + u.assignments.filter((a) => a.progress === 100).length, 0),
    [users]
  );

  // ─── Мутации пользователей ───────────────────────────────────────────────

  /** Добавить нового слушателя */
  function addUser(params: {
    lastName: string;
    firstName: string;
    middleName: string;
    email: string;
    group: string;
    role: string;
    courseIds: number[];
  }): User {
    const fullName = [params.lastName, params.firstName, params.middleName]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");

    const newUser: User = {
      id: Date.now(),
      name: fullName,
      email: params.email.trim(),
      initials: getInitials(fullName),
      group: params.group,
      role: params.role,
      assignments: params.courseIds.map((courseId) => ({
        courseId,
        active: true,
        progress: 0,
        assignedAt: todayRu(),
        status: "pending" as CourseStatus,
      })),
    };

    setUsers((prev) => [...prev, newUser]);
    return newUser;
  }

  /** Включить / отключить назначение курса слушателю */
  function toggleCourse(userId: number, courseId: number) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const exists = u.assignments.find((a) => a.courseId === courseId);
        if (exists) {
          return {
            ...u,
            assignments: u.assignments.map((a) =>
              a.courseId === courseId ? { ...a, active: !a.active } : a
            ),
          };
        }
        return {
          ...u,
          assignments: [
            ...u.assignments,
            {
              courseId,
              active: true,
              progress: 0,
              assignedAt: todayRu(),
              status: "pending" as CourseStatus,
            },
          ],
        };
      })
    );
  }

  /** Активировать курс (установить дату начала) */
  function activateCourse(userId: number, courseId: number, date: string) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          assignments: u.assignments.map((a) =>
            a.courseId !== courseId
              ? a
              : { ...a, activatedAt: date, status: "active" as CourseStatus }
          ),
        };
      })
    );
  }

  /** Выдать удостоверение */
  function issueCertificate(userId: number, courseId: number) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          assignments: u.assignments.map((a) =>
            a.courseId !== courseId
              ? a
              : {
                  ...a,
                  status: "certified" as CourseStatus,
                  completedAt: a.completedAt ?? todayRu(),
                }
          ),
        };
      })
    );
  }

  /** Добавить курсы группе слушателей */
  function addCoursesToGroup(group: string, courseIds: number[]) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.group !== group) return u;
        const newAssignments = courseIds
          .filter((id) => !u.assignments.some((a) => a.courseId === id))
          .map((courseId) => ({
            courseId,
            active: true,
            progress: 0,
            assignedAt: todayRu(),
            status: "pending" as CourseStatus,
          }));
        return { ...u, assignments: [...u.assignments, ...newAssignments] };
      })
    );
  }

  /** Добавить курсы конкретному слушателю */
  function addCoursesToUser(userId: number, courseIds: number[]) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        const newAssignments = courseIds
          .filter((id) => !u.assignments.some((a) => a.courseId === id))
          .map((courseId) => ({
            courseId,
            active: true,
            progress: 0,
            assignedAt: todayRu(),
            status: "pending" as CourseStatus,
          }));
        return { ...u, assignments: [...u.assignments, ...newAssignments] };
      })
    );
  }

  // ─── Мутации групп ────────────────────────────────────────────────────────

  /** Добавить новую группу */
  function addGroup(name: string) {
    if (!groups.includes(name)) {
      setGroups((prev) => [...prev, name]);
    }
  }

  return {
    // данные
    users,
    groups,
    courses: ALL_COURSES,
    // состояние загрузки
    loading,
    error,
    // поиск
    search,
    setSearch,
    filteredUsers,
    // статистика
    totalAssignments,
    totalCompleted,
    // мутации пользователей
    addUser,
    toggleCourse,
    activateCourse,
    issueCertificate,
    addCoursesToGroup,
    addCoursesToUser,
    // мутации групп
    addGroup,
  };
}