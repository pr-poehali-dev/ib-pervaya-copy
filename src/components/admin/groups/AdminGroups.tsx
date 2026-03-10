import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import Icon from "@/components/ui/icon";
import UserStatsModal from "@/components/admin/users/UserStatsModal";
import GroupStatsModal from "./GroupStatsModal";
import GroupAddCourseModal from "./GroupAddCourseModal";
import GroupsBreadcrumbs from "./GroupsBreadcrumbs";
import GroupsFiltersPanel from "./GroupsFiltersPanel";
import GroupsTableView from "./GroupsTableView";
import GroupsCardsView from "./GroupsCardsView";
import { User, CourseAssignment, CourseStatus, allCourses, groups } from "@/components/admin/types";
import { useRole } from "@/contexts/RoleContext";

interface AdminGroupsProps {
  users: User[];
}

type ViewMode = "table" | "cards";
type NavLevel = "groups" | "members" | "member";

function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function getGroupStatus(members: User[]): string {
  if (members.length === 0) return "Не начато";
  const completed = members.filter((u) => u.assignments.some((a) => a.progress === 100));
  if (completed.length === members.length && members.length > 0) return "Завершено";
  if (members.some((u) => u.assignments.some((a) => a.active))) return "Обучается";
  return "Не начато";
}

function getAvgProgress(members: User[]): number {
  const active = members.flatMap((u) => u.assignments.filter((a) => a.active));
  if (active.length === 0) return 0;
  return Math.round(active.reduce((s, a) => s + a.progress, 0) / active.length);
}

export default function AdminGroups({ users }: AdminGroupsProps) {
  const { tenantType } = useRole();
  const canIssueCert = tenantType === "training_center";

  // ─── Вид и навигация ────────────────────────────────────────────────────────
  const [viewMode, setViewMode] = useState<ViewMode>("table");
  const [navLevel, setNavLevel] = useState<NavLevel>("groups");
  const [activeGroup, setActiveGroup] = useState<string | null>(null);
  const [activeMember, setActiveMember] = useState<User | null>(null);

  // ─── Фильтры ─────────────────────────────────────────────────────────────────
  const [filterStatus, setFilterStatus] = useState("Все");
  const [filterOrgs, setFilterOrgs] = useState<string[]>([]);
  const [filterGroups, setFilterGroups] = useState<string[]>([]);
  const [filterFio, setFilterFio] = useState<string[]>([]);
  const [filterCourse, setFilterCourse] = useState("");

  // ─── Таблица: раскрытие/выбор ────────────────────────────────────────────────
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedMembers, setExpandedMembers] = useState<Set<number>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [actionsOpen, setActionsOpen] = useState(false);

  // ─── Данные ──────────────────────────────────────────────────────────────────
  const [localUsers, setLocalUsers] = useState<User[]>(users);
  const [addCourseForGroup, setAddCourseForGroup] = useState<string | null>(null);
  const [addCourseForMember, setAddCourseForMember] = useState<number | null>(null);
  const [statsUser, setStatsUser] = useState<User | null>(null);
  const [groupStatsFor, setGroupStatsFor] = useState<string | null>(null);

  const actionsButtonRef = useRef<HTMLButtonElement>(null);
  const actionsMenuRef = useRef<HTMLDivElement>(null);
  const [actionsPos, setActionsPos] = useState({ top: 0, right: 0 });

  const recalcActionsPos = useCallback(() => {
    if (!actionsButtonRef.current) return;
    const r = actionsButtonRef.current.getBoundingClientRect();
    setActionsPos({ top: r.bottom + window.scrollY + 4, right: window.innerWidth - r.right });
  }, []);

  useEffect(() => {
    if (actionsOpen) recalcActionsPos();
  }, [actionsOpen, recalcActionsPos]);

  useEffect(() => {
    if (!actionsOpen) return;
    const handler = (e: MouseEvent) => {
      const t = e.target as Node;
      if (
        actionsMenuRef.current && !actionsMenuRef.current.contains(t) &&
        actionsButtonRef.current && !actionsButtonRef.current.contains(t)
      ) setActionsOpen(false);
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [actionsOpen]);

  const orgOptions = useMemo(() => [...new Set(localUsers.map((u) => u.organization).filter(Boolean))], [localUsers]);
  const groupOptions = useMemo(() => [...new Set(localUsers.map((u) => u.group))], [localUsers]);
  const fioOptions = useMemo(() => localUsers.map((u) => u.name), [localUsers]);
  const courseOptions = useMemo(() => allCourses.map((c) => c.title), []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const members = localUsers.filter((u) => u.group === group);
      const status = getGroupStatus(members);
      if (filterStatus !== "Все" && status !== filterStatus) return false;
      if (filterOrgs.length > 0 && !members.some((u) => filterOrgs.includes(u.organization))) return false;
      if (filterGroups.length > 0 && !filterGroups.includes(group)) return false;
      if (filterFio.length > 0 && !members.some((u) => filterFio.includes(u.name))) return false;
      if (filterCourse) {
        const course = allCourses.find((c) => c.title === filterCourse);
        if (course && !members.some((u) => u.assignments.some((a) => a.courseId === course.id && a.active))) return false;
      }
      return true;
    });
  }, [localUsers, filterStatus, filterOrgs, filterGroups, filterFio, filterCourse]);

  const resetFilters = () => {
    setFilterStatus("Все");
    setFilterOrgs([]);
    setFilterGroups([]);
    setFilterFio([]);
    setFilterCourse("");
  };

  const allChecked = filteredGroups.length > 0 && filteredGroups.every((g) => selectedGroups.has(g));
  const someChecked = filteredGroups.some((g) => selectedGroups.has(g));

  const toggleSelectAll = () => {
    if (allChecked) {
      setSelectedGroups((prev) => { const next = new Set(prev); filteredGroups.forEach((g) => next.delete(g)); return next; });
    } else {
      setSelectedGroups((prev) => { const next = new Set(prev); filteredGroups.forEach((g) => next.add(g)); return next; });
    }
  };

  const toggleSelectOne = (group: string) => {
    setSelectedGroups((prev) => { const next = new Set(prev); if (next.has(group)) next.delete(group); else next.add(group); return next; });
  };

  const toggleGroup = (group: string) => {
    setExpandedGroups((prev) => { const next = new Set(prev); if (next.has(group)) next.delete(group); else next.add(group); return next; });
  };

  const toggleMember = (userId: number) => {
    setExpandedMembers((prev) => { const next = new Set(prev); if (next.has(userId)) next.delete(userId); else next.add(userId); return next; });
  };

  // ─── Навигация карточного режима ─────────────────────────────────────────────
  function openGroup(group: string) {
    setActiveGroup(group);
    setNavLevel("members");
  }

  function openMember(member: User) {
    setActiveMember(member);
    setNavLevel("member");
  }

  // ─── Мутации данных ───────────────────────────────────────────────────────────
  const addCoursesToMember = (userId: number, courseIds: number[]) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      const newAssignments: CourseAssignment[] = courseIds
        .filter((id) => !u.assignments.some((a) => a.courseId === id))
        .map((id) => ({ courseId: id, active: true, progress: 0, assignedAt: today(), status: "pending" as CourseStatus }));
      return { ...u, assignments: [...u.assignments, ...newAssignments] };
    }));
  };

  const addCoursesToGroup = (group: string, courseIds: number[]) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.group !== group) return u;
      const newAssignments: CourseAssignment[] = courseIds
        .filter((id) => !u.assignments.some((a) => a.courseId === id))
        .map((id) => ({ courseId: id, active: true, progress: 0, assignedAt: today(), status: "pending" as CourseStatus }));
      return { ...u, assignments: [...u.assignments, ...newAssignments] };
    }));
  };

  const activateCourse = (userId: number, courseId: number, date?: string) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return { ...u, assignments: u.assignments.map((a) =>
        a.courseId !== courseId ? a : { ...a, activatedAt: date ?? today(), active: true, status: "active" as CourseStatus }
      )};
    }));
  };

  const extendCourse = (userId: number, courseId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return { ...u, assignments: u.assignments.map((a) =>
        a.courseId !== courseId ? a : { ...a, status: "active" as CourseStatus }
      )};
    }));
  };

  const issueCertificate = (userId: number, courseId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return { ...u, assignments: u.assignments.map((a) =>
        a.courseId !== courseId ? a : { ...a, status: "certified" as CourseStatus, completedAt: a.completedAt ?? today() }
      )};
    }));
  };

  const toggleAssignment = (userId: number, courseId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return { ...u, assignments: u.assignments.map((a) =>
        a.courseId !== courseId ? a : { ...a, active: !a.active }
      )};
    }));
  };

  const handleActivateAll = (_group: string, members: User[]) => {
    const today_ = today();
    members.forEach((u) => {
      u.assignments.filter((a) => !a.activatedAt).forEach((a) => {
        activateCourse(u.id, a.courseId, today_);
      });
    });
  };

  const addCourseMemberUser = addCourseForMember !== null
    ? localUsers.find((u) => u.id === addCourseForMember)
    : null;

  const activeGroupMembers = activeGroup
    ? localUsers.filter((u) => u.group === activeGroup)
    : [];

  return (
    <div className="space-y-4">
      {/* Модалки */}
      {addCourseForGroup !== null && (
        <GroupAddCourseModal
          title={`Назначить курс группе ${addCourseForGroup}`}
          onClose={() => setAddCourseForGroup(null)}
          onAdd={(ids) => addCoursesToGroup(addCourseForGroup, ids)}
        />
      )}
      {addCourseForMember !== null && addCourseMemberUser && (
        <GroupAddCourseModal
          title={`Добавить курс — ${addCourseMemberUser.name}`}
          onClose={() => setAddCourseForMember(null)}
          onAdd={(ids) => addCoursesToMember(addCourseForMember, ids)}
          alreadyAssigned={addCourseMemberUser.assignments.map((a) => a.courseId)}
        />
      )}
      <UserStatsModal user={statsUser} onClose={() => setStatsUser(null)} />
      <GroupStatsModal
        groupName={groupStatsFor}
        users={localUsers}
        onClose={() => setGroupStatsFor(null)}
        onUserStats={(u) => { setGroupStatsFor(null); setStatsUser(u); }}
      />

      {!canIssueCert && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <Icon name="Info" size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Выдача удостоверений недоступна — ваш тенант зарегистрирован как <strong>Организация</strong>. Эта функция доступна только <strong>Учебным центрам</strong>.
          </p>
        </div>
      )}

      {/* Хлебные крошки (только в режиме карточек) */}
      {viewMode === "cards" && (
        <GroupsBreadcrumbs
          navLevel={navLevel}
          activeGroup={activeGroup}
          activeMember={activeMember}
          activeGroupMembers={activeGroupMembers}
          onGoGroups={() => { setNavLevel("groups"); setActiveGroup(null); setActiveMember(null); }}
          onGoMembers={() => { setNavLevel("members"); setActiveMember(null); }}
        />
      )}

      {/* Панель фильтров (только на уровне групп) */}
      {(viewMode === "table" || navLevel === "groups") && (
        <GroupsFiltersPanel
          viewMode={viewMode}
          setViewMode={setViewMode}
          onSwitchToCards={() => { setViewMode("cards"); setNavLevel("groups"); setActiveGroup(null); }}
          filterStatus={filterStatus}
          setFilterStatus={setFilterStatus}
          filterOrgs={filterOrgs}
          setFilterOrgs={setFilterOrgs}
          filterGroups={filterGroups}
          setFilterGroups={setFilterGroups}
          filterFio={filterFio}
          setFilterFio={setFilterFio}
          filterCourse={filterCourse}
          setFilterCourse={setFilterCourse}
          orgOptions={orgOptions}
          groupOptions={groupOptions}
          fioOptions={fioOptions}
          courseOptions={courseOptions}
          onResetFilters={resetFilters}
          selectedGroupsSize={selectedGroups.size}
          actionsOpen={actionsOpen}
          setActionsOpen={setActionsOpen}
          actionsButtonRef={actionsButtonRef}
          actionsMenuRef={actionsMenuRef}
          actionsPos={actionsPos}
        />
      )}

      {/* Режим: таблица */}
      {viewMode === "table" && (
        <GroupsTableView
          filteredGroups={filteredGroups}
          localUsers={localUsers}
          expandedGroups={expandedGroups}
          expandedMembers={expandedMembers}
          selectedGroups={selectedGroups}
          allChecked={allChecked}
          someChecked={someChecked}
          onToggleSelectAll={toggleSelectAll}
          onToggleGroup={toggleGroup}
          onToggleSelect={toggleSelectOne}
          onToggleMember={toggleMember}
          onOpenGroupStats={(g) => setGroupStatsFor(g)}
          onOpenUserStats={(u) => setStatsUser(localUsers.find((lu) => lu.id === u.id) ?? u)}
          onAddCourseForGroup={(g) => setAddCourseForGroup(g)}
          onAddCourseForMember={(userId) => setAddCourseForMember(userId)}
          onActivateCourse={activateCourse}
          onExtendCourse={extendCourse}
          onIssueCertificate={issueCertificate}
          onToggleAssignment={toggleAssignment}
        />
      )}

      {/* Режим: карточки */}
      {viewMode === "cards" && (
        <GroupsCardsView
          navLevel={navLevel}
          filteredGroups={filteredGroups}
          localUsers={localUsers}
          activeGroup={activeGroup}
          activeMember={activeMember}
          activeGroupMembers={activeGroupMembers}
          getGroupStatus={getGroupStatus}
          getAvgProgress={getAvgProgress}
          onOpenGroup={openGroup}
          onOpenMember={openMember}
          onSetGroupStatsFor={(g) => setGroupStatsFor(g)}
          onSetAddCourseForGroup={(g) => setAddCourseForGroup(g)}
          onSetAddCourseForMember={(userId) => setAddCourseForMember(userId)}
          onSetStatsUser={(u) => setStatsUser(u)}
          onActivateAll={handleActivateAll}
          onAddCourse={addCoursesToMember}
          onActivateCourse={activateCourse}
          onExtendCourse={extendCourse}
          onIssueCertificate={issueCertificate}
          onToggleAssignment={toggleAssignment}
        />
      )}
    </div>
  );
}