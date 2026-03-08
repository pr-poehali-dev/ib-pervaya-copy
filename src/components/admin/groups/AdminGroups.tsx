import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import UserStatsModal from "@/components/admin/users/UserStatsModal";
import GroupStatsModal from "./GroupStatsModal";
import GroupAddCourseModal from "./GroupAddCourseModal";
import GroupTableRow from "./GroupTableRow";
import { User, CourseAssignment, CourseStatus, allCourses, groups } from "@/components/admin/types";
import { MultiSelect, SearchSelect, FilterTags } from "@/components/admin/shared/FilterControls";
import { useRole } from "@/contexts/RoleContext";

interface AdminGroupsProps {
  users: User[];
}

const STATUS_OPTIONS = ["Все", "Обучается", "Завершено", "Не начато"];

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

export default function AdminGroups({ users }: AdminGroupsProps) {
  const { tenantType } = useRole();
  const canIssueCert = tenantType === "training_center";
  const [filterStatus, setFilterStatus] = useState("Все");
  const [filterOrgs, setFilterOrgs] = useState<string[]>([]);
  const [filterFio, setFilterFio] = useState<string[]>([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedMembers, setExpandedMembers] = useState<Set<number>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [actionsOpen, setActionsOpen] = useState(false);

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

  const orgOptions = useMemo(() => [...new Set(localUsers.map((u) => u.group))], [localUsers]);
  const fioOptions = useMemo(() => localUsers.map((u) => u.name), [localUsers]);
  const courseOptions = useMemo(() => allCourses.map((c) => c.title), []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const members = localUsers.filter((u) => u.group === group);
      const status = getGroupStatus(members);
      if (filterStatus !== "Все" && status !== filterStatus) return false;
      if (filterOrgs.length > 0 && !filterOrgs.includes(group)) return false;
      if (filterFio.length > 0 && !members.some((u) => filterFio.includes(u.name))) return false;
      if (filterCourse) {
        const course = allCourses.find((c) => c.title === filterCourse);
        if (course && !members.some((u) => u.assignments.some((a) => a.courseId === course.id && a.active))) return false;
      }
      return true;
    });
  }, [localUsers, filterStatus, filterOrgs, filterFio, filterCourse]);

  const resetFilters = () => {
    setFilterStatus("Все");
    setFilterOrgs([]);
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
    setExpandedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const toggleMember = (userId: number) => {
    setExpandedMembers((prev) => {
      const next = new Set(prev);
      if (next.has(userId)) next.delete(userId);
      else next.add(userId);
      return next;
    });
  };

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
        a.courseId !== courseId ? a : { ...a, activatedAt: date ?? today(), status: "active" as CourseStatus }
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

  const addCourseMemberUser = addCourseForMember !== null
    ? localUsers.find((u) => u.id === addCourseForMember)
    : null;

  return (
    <div className="space-y-4">
      {!canIssueCert && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <Icon name="Info" size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Выдача удостоверений недоступна — ваш тенант зарегистрирован как <strong>Организация</strong>. Эта функция доступна только <strong>Учебным центрам</strong>.
          </p>
        </div>
      )}
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

      {/* Фильтры + кнопка действий */}
      <div className="flex items-start gap-3">
        <div className="flex-1 bg-card rounded-2xl border border-border px-4 pt-3 pb-3 space-y-2.5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Статус обучения группы</p>
              <SearchSelect options={STATUS_OPTIONS} value={filterStatus} onChange={setFilterStatus} placeholder="Все статусы" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Организация</p>
              <MultiSelect options={orgOptions} selected={filterOrgs} onChange={setFilterOrgs} placeholder="Все организации" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">ФИО обучающегося</p>
              <MultiSelect options={fioOptions} selected={filterFio} onChange={setFilterFio} placeholder="Все слушатели" />
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Курс обучения</p>
              <SearchSelect options={courseOptions} value={filterCourse} onChange={setFilterCourse} placeholder="Все курсы" />
            </div>
          </div>
          <FilterTags
            filterStatus={filterStatus} setFilterStatus={setFilterStatus} defaultStatus="Все"
            filterOrgs={filterOrgs} setFilterOrgs={setFilterOrgs}
            filterFio={filterFio} setFilterFio={setFilterFio}
            filterCourse={filterCourse} setFilterCourse={setFilterCourse}
            onReset={resetFilters}
          />
        </div>

        {/* Кнопка действий */}
        <div className="flex-shrink-0 pt-6">
          <Button
            ref={actionsButtonRef}
            variant="outline"
            className="rounded-xl gap-2 h-9"
            onClick={() => setActionsOpen((p) => !p)}
            disabled={selectedGroups.size === 0}
          >
            <Icon name="Zap" size={15} />
            Действия
            {selectedGroups.size > 0 && (
              <span className="bg-violet-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{selectedGroups.size}</span>
            )}
            <Icon name="ChevronDown" size={14} />
          </Button>
          {actionsOpen && createPortal(
            <div
              ref={actionsMenuRef}
              style={{ position: "absolute", top: actionsPos.top, right: actionsPos.right, zIndex: 9999 }}
              className="bg-background border border-border rounded-xl shadow-2xl w-52 overflow-hidden"
            >
              {[
                { icon: "Send", label: "Отправить пароли" },
                { icon: "Download", label: "Скачать пароли" },
                { icon: "FileText", label: "Сформировать отчёт" },
              ].map((item) => (
                <button
                  key={item.label}
                  className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors text-left"
                  onClick={() => setActionsOpen(false)}
                >
                  <Icon name={item.icon} size={15} className="text-muted-foreground" />
                  {item.label}
                </button>
              ))}
            </div>,
            document.body
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Найдено групп: {filteredGroups.length}
        {selectedGroups.size > 0 && <span className="ml-2 text-violet-600 font-medium">· Выбрано: {selectedGroups.size}</span>}
      </p>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-3 w-8" onClick={(e) => e.stopPropagation()}>
                  <input
                    type="checkbox"
                    checked={allChecked}
                    ref={(el) => { if (el) el.indeterminate = someChecked && !allChecked; }}
                    onChange={toggleSelectAll}
                    className="rounded border-border cursor-pointer accent-violet-600"
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground w-8"></th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Организация</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Группа</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Участников</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Назначений</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Завершили</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Прогресс</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Управление</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group, idx) => {
                const members = localUsers.filter((u) => u.group === group);
                const organization = members[0]?.organization ?? "";
                return (
                <GroupTableRow
                  key={group}
                  group={group}
                  idx={idx}
                  organization={organization}
                  members={members}
                  isExpanded={expandedGroups.has(group)}
                  isSelected={selectedGroups.has(group)}
                  expandedMembers={expandedMembers}
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
                );
              })}
            </tbody>
          </table>
        </div>

        {filteredGroups.length === 0 && (
          <div className="p-10 text-center">
            <Icon name="SearchX" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-medium">Группы не найдены</p>
            <p className="text-muted-foreground text-sm mt-1">Попробуйте изменить условия фильтрации</p>
          </div>
        )}
      </div>
    </div>
  );
}