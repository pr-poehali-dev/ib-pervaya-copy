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
import { User, CourseStatus, GroupEnrollment, getInitials } from "@/components/admin/types";
import { INITIAL_USERS, GROUPS_DATA, ALL_COURSES } from "@/data/mockData";
import { today } from "@/data/dateUtils";

function todayRu(): string {
  return today();
}

export function useAdminData() {
  // ─── Данные ──────────────────────────────────────────────────────────────
  const [users, setUsers] = useState<User[]>([]);
  const [groups, setGroups] = useState<typeof GROUPS_DATA>([]);

  // ─── Состояние загрузки ───────────────────────────────────────────────────
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = setTimeout(() => {
      try {
        setUsers(INITIAL_USERS);
        setGroups([...GROUPS_DATA]);
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
          u.enrollments.some((e) => e.groupName.toLowerCase().includes(search.toLowerCase()))
      ),
    [users, search]
  );

  // ─── Статистика ───────────────────────────────────────────────────────────
  const totalAssignments = useMemo(
    () =>
      users.reduce(
        (s, u) =>
          s +
          u.enrollments.reduce((es, e) => es + e.assignments.filter((a) => a.active).length, 0) +
          u.assignments.filter((a) => a.active).length,
        0
      ),
    [users]
  );
  const totalCompleted = useMemo(
    () =>
      users.reduce(
        (s, u) =>
          s +
          u.enrollments.reduce(
            (es, e) => es + e.assignments.filter((a) => a.active && a.progress === 100).length,
            0
          ) +
          u.assignments.filter((a) => a.active && a.progress === 100).length,
        0
      ),
    [users]
  );

  // ─── Мутации пользователей ───────────────────────────────────────────────

  /** Добавить нового слушателя */
  function addUser(params: {
    lastName: string;
    firstName: string;
    middleName: string;
    email: string;
    groupId?: number;
    groupName?: string;
    role: string;
    organization: string;
    courseIds: number[];
  }): User {
    const fullName = [params.lastName, params.firstName, params.middleName]
      .map((s) => s.trim())
      .filter(Boolean)
      .join(" ");

    const enrollments: GroupEnrollment[] =
      params.groupId && params.groupName
        ? [
            {
              groupId: params.groupId,
              groupName: params.groupName,
              assignments: params.courseIds.map((courseId) => ({
                courseId,
                active: true,
                progress: 0,
                assignedAt: todayRu(),
                status: "pending" as CourseStatus,
              })),
            },
          ]
        : [];

    const individualAssignments =
      !params.groupId
        ? params.courseIds.map((courseId) => ({
            courseId,
            active: true,
            progress: 0,
            assignedAt: todayRu(),
            status: "pending" as CourseStatus,
          }))
        : [];

    const newUser: User = {
      id: Date.now(),
      name: fullName,
      email: params.email.trim(),
      initials: getInitials(fullName),
      enrollments,
      assignments: individualAssignments,
      role: params.role,
      organization: params.organization.trim(),
    };

    setUsers((prev) => [...prev, newUser]);
    return newUser;
  }

  /** Включить / отключить назначение курса слушателю (индивидуальные курсы) */
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

  /** Включить / отключить курс слушателя в группе */
  function toggleGroupCourse(userId: number, groupId: number, courseId: number) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return {
          ...u,
          enrollments: u.enrollments.map((e) => {
            if (e.groupId !== groupId) return e;
            const exists = e.assignments.find((a) => a.courseId === courseId);
            if (exists) {
              return {
                ...e,
                assignments: e.assignments.map((a) =>
                  a.courseId === courseId ? { ...a, active: !a.active } : a
                ),
              };
            }
            return {
              ...e,
              assignments: [
                ...e.assignments,
                {
                  courseId,
                  active: true,
                  progress: 0,
                  assignedAt: todayRu(),
                  status: "pending" as CourseStatus,
                },
              ],
            };
          }),
        };
      })
    );
  }

  /** Активировать курс в группе */
  function activateCourse(userId: number, courseId: number, date: string, groupId?: number) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        if (groupId !== undefined) {
          return {
            ...u,
            enrollments: u.enrollments.map((e) => {
              if (e.groupId !== groupId) return e;
              return {
                ...e,
                assignments: e.assignments.map((a) =>
                  a.courseId !== courseId
                    ? a
                    : { ...a, activatedAt: date, status: "active" as CourseStatus, progress: 0 }
                ),
              };
            }),
          };
        }
        return {
          ...u,
          assignments: u.assignments.map((a) =>
            a.courseId !== courseId
              ? a
              : { ...a, activatedAt: date, status: "active" as CourseStatus, progress: 0 }
          ),
        };
      })
    );
  }

  /** Выдать удостоверение */
  function issueCertificate(userId: number, courseId: number, groupId?: number) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        if (groupId !== undefined) {
          return {
            ...u,
            enrollments: u.enrollments.map((e) => {
              if (e.groupId !== groupId) return e;
              return {
                ...e,
                assignments: e.assignments.map((a) =>
                  a.courseId !== courseId
                    ? a
                    : {
                        ...a,
                        status: "certified" as CourseStatus,
                        progress: 100,
                        completedAt: a.completedAt ?? todayRu(),
                      }
                ),
              };
            }),
          };
        }
        return {
          ...u,
          assignments: u.assignments.map((a) =>
            a.courseId !== courseId
              ? a
              : {
                  ...a,
                  status: "certified" as CourseStatus,
                  progress: 100,
                  completedAt: a.completedAt ?? todayRu(),
                }
          ),
        };
      })
    );
  }

  /** Добавить курсы всем членам группы */
  function addCoursesToGroup(groupId: number, courseIds: number[]) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    setUsers((prev) =>
      prev.map((u) => {
        const enrollment = u.enrollments.find((e) => e.groupId === groupId);
        if (!enrollment) return u;
        const existingIds = enrollment.assignments.map((a) => a.courseId);
        const newAssignments = courseIds
          .filter((id) => !existingIds.includes(id))
          .map((courseId) => ({
            courseId,
            active: true,
            progress: 0,
            assignedAt: todayRu(),
            status: "pending" as CourseStatus,
          }));
        return {
          ...u,
          enrollments: u.enrollments.map((e) =>
            e.groupId !== groupId
              ? e
              : { ...e, assignments: [...e.assignments, ...newAssignments] }
          ),
        };
      })
    );
  }

  /** Добавить курсы конкретному слушателю (индивидуальные) */
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

  /** Зачислить пользователя в группу */
  function enrollUserToGroup(userId: number, groupId: number) {
    const group = groups.find((g) => g.id === groupId);
    if (!group) return;
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        if (u.enrollments.some((e) => e.groupId === groupId)) return u;
        const newEnrollment: GroupEnrollment = {
          groupId,
          groupName: group.name,
          assignments: [],
        };
        return { ...u, enrollments: [...u.enrollments, newEnrollment] };
      })
    );
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId ? g : { ...g, userIds: [...g.userIds, userId] }
      )
    );
  }

  /** Отчислить пользователя из группы */
  function unenrollUserFromGroup(userId: number, groupId: number) {
    setUsers((prev) =>
      prev.map((u) => {
        if (u.id !== userId) return u;
        return { ...u, enrollments: u.enrollments.filter((e) => e.groupId !== groupId) };
      })
    );
    setGroups((prev) =>
      prev.map((g) =>
        g.id !== groupId ? g : { ...g, userIds: g.userIds.filter((id) => id !== userId) }
      )
    );
  }

  // ─── Мутации групп ────────────────────────────────────────────────────────

  /** Добавить новую группу */
  function addGroup(name: string) {
    if (groups.some((g) => g.name === name)) return;
    const newGroup = {
      id: Date.now(),
      name,
      tenantId: 1,
      status: "forming" as const,
      createdAt: todayRu(),
      userIds: [],
      courseIds: [],
    };
    setGroups((prev) => [...prev, newGroup]);
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
    toggleGroupCourse,
    activateCourse,
    issueCertificate,
    addCoursesToGroup,
    addCoursesToUser,
    enrollUserToGroup,
    unenrollUserFromGroup,
    // мутации групп
    addGroup,
  };
}
