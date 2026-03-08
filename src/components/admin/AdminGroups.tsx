import { useState, useMemo, useRef, useEffect, useCallback } from "react";
import { createPortal } from "react-dom";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";
import ActivateMenu from "./ActivateMenu";
import UserStatsModal from "./UserStatsModal";
import GroupStatsModal from "./GroupStatsModal";
import { User, CourseAssignment, CourseStatus, allCourses, gradients, userColors, groups, courseDirections } from "./types";
import { MultiSelect, SearchSelect, FilterTags } from "./FilterControls";

interface AdminGroupsProps {
  users: User[];
}

const STATUS_OPTIONS = ["Все", "Обучается", "Завершено", "Не начато"];

function getGroupStatus(members: User[]): string {
  if (members.length === 0) return "Не начато";
  const completed = members.filter((u) => u.assignments.some((a) => a.progress === 100));
  if (completed.length === members.length && members.length > 0) return "Завершено";
  if (members.some((u) => u.assignments.some((a) => a.active))) return "Обучается";
  return "Не начато";
}

function statusBadgeClass(status: string) {
  if (status === "Обучается") return "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300";
  if (status === "Завершено") return "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300";
  return "bg-muted text-muted-foreground";
}

function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function CourseStatusBadge({ status }: { status: CourseStatus }) {
  const map: Record<CourseStatus, { label: string; cls: string }> = {
    pending:   { label: "Ожидает активации", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
    active:    { label: "Идёт обучение",      cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
    completed: { label: "Обучение завершено", cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
    certified: { label: "Удостоверение выдано", cls: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" },
  };
  const { label, cls } = map[status];
  return <span className={`px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${cls}`}>{label}</span>;
}

interface AddCourseModalProps {
  title: string;
  onClose: () => void;
  onAdd: (courseIds: number[]) => void;
  alreadyAssigned?: number[];
}

function AddCourseModal({ title, onClose, onAdd, alreadyAssigned = [] }: AddCourseModalProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [openDirs, setOpenDirs] = useState<number[]>([]);

  const toggleDir = (id: number) =>
    setOpenDirs((p) => p.includes(id) ? p.filter((d) => d !== id) : [...p, id]);

  const toggleCourse = (id: number) =>
    setSelected((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl z-10 w-full max-w-xl mx-4 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-semibold text-base">{title}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {courseDirections.map((dir) => {
            const isOpen = openDirs.includes(dir.id);
            return (
              <div key={dir.id} className="border-b border-border last:border-0">
                <button
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${isOpen ? "bg-violet-50 dark:bg-violet-900/20" : "hover:bg-muted/40"}`}
                  onClick={() => toggleDir(dir.id)}
                >
                  <span className={`font-semibold text-sm ${isOpen ? "text-violet-700 dark:text-violet-300" : ""}`}>{dir.title}</span>
                  <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className={isOpen ? "text-violet-600" : "text-muted-foreground"} />
                </button>
                {isOpen && dir.courses.map((c) => {
                  const isAssigned = alreadyAssigned.includes(c.id);
                  const isPicked = selected.includes(c.id);
                  return (
                    <div key={c.id} className="flex items-center justify-between px-5 py-3 border-t border-border/60 hover:bg-muted/30 transition-colors">
                      <span className="text-sm text-foreground leading-snug pr-3">
                        <span className="font-medium">{c.code}</span> {c.title}
                      </span>
                      {isAssigned ? (
                        <span className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg bg-muted text-muted-foreground">Уже назначен</span>
                      ) : isPicked ? (
                        <button
                          className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-red-100 hover:text-red-600 hover:border-red-300 transition-colors"
                          onClick={() => toggleCourse(c.id)}
                        >Выбрано</button>
                      ) : (
                        <button
                          className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity"
                          onClick={() => toggleCourse(c.id)}
                        >Выбрать</button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border flex gap-3 flex-shrink-0">
          <Button variant="outline" className="rounded-xl flex-1" onClick={onClose}>Отмена</Button>
          <Button
            className="rounded-xl gradient-primary text-white flex-1 gap-2"
            disabled={selected.length === 0}
            onClick={() => { onAdd(selected); onClose(); }}
          >
            <Icon name="Plus" size={15} />
            Добавить ({selected.length})
          </Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminGroups({ users }: AdminGroupsProps) {
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

  const addCourseGroupObj = addCourseForGroup !== null
    ? { group: addCourseForGroup, assigned: [] as number[] }
    : null;

  const addCourseMemberUser = addCourseForMember !== null
    ? localUsers.find((u) => u.id === addCourseForMember)
    : null;

  return (
    <div className="space-y-4">
      {addCourseForGroup !== null && (
        <AddCourseModal
          title={`Назначить курс группе ${addCourseForGroup}`}
          onClose={() => setAddCourseForGroup(null)}
          onAdd={(ids) => addCoursesToGroup(addCourseForGroup, ids)}
        />
      )}
      {addCourseForMember !== null && addCourseMemberUser && (
        <AddCourseModal
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
                const activeAssignments = members.reduce((sum, u) => sum + u.assignments.filter((a) => a.active).length, 0);
                const completedCount = members.filter((u) => u.assignments.some((a) => a.progress === 100)).length;
                const avgGroupProgress = activeAssignments > 0
                  ? Math.round(members.reduce((s, u) => s + u.assignments.filter((a) => a.active).reduce((ss, a) => ss + a.progress, 0), 0) / activeAssignments)
                  : 0;
                const status = getGroupStatus(members);
                const isExpanded = expandedGroups.has(group);

                return (
                  <>
                    <tr
                      key={group}
                      className={`border-b border-border transition-colors cursor-pointer hover:bg-muted/20 ${isExpanded ? "bg-violet-50/50 dark:bg-violet-900/10" : ""} ${selectedGroups.has(group) ? "bg-violet-50/30 dark:bg-violet-900/10" : ""}`}
                      onClick={() => toggleGroup(group)}
                    >
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedGroups.has(group)}
                          onChange={() => toggleSelectOne(group)}
                          className="rounded border-border cursor-pointer accent-violet-600"
                        />
                      </td>
                      <td className="px-4 py-3">
                        <Icon name={isExpanded ? "ChevronDown" : "ChevronRight"} size={16} className="text-muted-foreground" />
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 bg-gradient-to-br ${gradients[idx % gradients.length]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon name="UsersRound" size={14} className="text-white" />
                          </div>
                          <span className="font-medium">{group}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">{members.length} чел.</td>
                      <td className="px-4 py-3">
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusBadgeClass(status)}`}>{status}</span>
                      </td>
                      <td className="px-4 py-3 text-center">{activeAssignments}</td>
                      <td className="px-4 py-3 text-center">{completedCount}</td>

                      {/* Прогресс */}
                      <td className="px-4 py-3">
                        {activeAssignments > 0 ? (
                          <div className="flex items-center gap-2 min-w-[90px]">
                            <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                              <div
                                className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all"
                                style={{ width: `${avgGroupProgress}%` }}
                              />
                            </div>
                            <span className="text-xs font-semibold w-9 text-right">{avgGroupProgress}%</span>
                          </div>
                        ) : (
                          <span className="text-xs text-muted-foreground">—</span>
                        )}
                      </td>

                      {/* Управление группой */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1">
                          <Tip text="Статистика группы">
                            <button
                              className="p-2 rounded-lg hover:bg-cyan-100 dark:hover:bg-cyan-900/30 transition-colors text-cyan-600 dark:text-cyan-400"
                              onClick={() => setGroupStatsFor(group)}
                            >
                              <Icon name="BarChart2" size={16} />
                            </button>
                          </Tip>
                          <Tip text="Редактировать группу">
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                              <Icon name="Pencil" size={16} />
                            </button>
                          </Tip>
                          <Tip text="Активна / Неактивна">
                            <button className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-600">
                              <Icon name="ToggleRight" size={16} />
                            </button>
                          </Tip>
                          <Tip text="Назначить курс группе">
                            <button
                              className="p-2 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-600 dark:text-violet-400"
                              disabled={members.length === 0}
                              onClick={() => { setAddCourseForGroup(group); if (!isExpanded) toggleGroup(group); }}
                            >
                              <Icon name="BookPlus" size={16} />
                            </button>
                          </Tip>
                        </div>
                      </td>
                    </tr>

                    {/* Раскрытая строка — участники группы */}
                    {isExpanded && (
                      <tr key={`${group}-expanded`} className="border-b border-border bg-violet-50/30 dark:bg-violet-900/5">
                        <td colSpan={9} className="px-8 py-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Участники группы {group}
                              </p>
                              <div className="flex items-center gap-2">
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="rounded-xl gap-1.5 text-xs h-7 border-cyan-200 dark:border-cyan-800 text-cyan-600 dark:text-cyan-400 hover:bg-cyan-50 dark:hover:bg-cyan-900/20"
                                  onClick={() => setGroupStatsFor(group)}
                                >
                                  <Icon name="BarChart2" size={12} />
                                  Статистика группы
                                </Button>
                                <Button
                                  size="sm"
                                  className="gradient-primary text-white rounded-xl gap-1.5 text-xs h-7"
                                  onClick={() => setAddCourseForGroup(group)}
                                >
                                  <Icon name="BookPlus" size={12} />
                                  Назначить курс всей группе
                                </Button>
                              </div>
                            </div>

                            {members.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Нет участников</p>
                            ) : (
                              <div className="rounded-xl border border-border overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                      <th className="px-4 py-2.5 w-8"></th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">ФИО</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Курсов назначено</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Завершено</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Прогресс</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Действия</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {members.map((member, mi) => {
                                      const isMemberExpanded = expandedMembers.has(member.id);
                                      const activeCnt = member.assignments.filter((a) => a.active).length;
                                      const completedCnt = member.assignments.filter((a) => a.progress === 100).length;
                                      const avgProgress = activeCnt > 0
                                        ? Math.round(member.assignments.filter((a) => a.active).reduce((s, a) => s + a.progress, 0) / activeCnt)
                                        : 0;

                                      return (
                                        <>
                                          <tr
                                            key={member.id}
                                            className={`${mi > 0 ? "border-t border-border/60" : ""} cursor-pointer hover:bg-muted/20 transition-colors ${isMemberExpanded ? "bg-violet-50/40 dark:bg-violet-900/10" : ""}`}
                                            onClick={() => toggleMember(member.id)}
                                          >
                                            <td className="px-4 py-2.5">
                                              <Icon name={isMemberExpanded ? "ChevronDown" : "ChevronRight"} size={14} className="text-muted-foreground" />
                                            </td>
                                            <td className="px-4 py-2.5">
                                              <div className="flex items-center gap-2">
                                                <div className={`w-7 h-7 bg-gradient-to-br ${userColors[mi % userColors.length]} rounded-md flex items-center justify-center flex-shrink-0`}>
                                                  <span className="text-white font-bold text-[9px]">{member.initials}</span>
                                                </div>
                                                <span className="font-medium text-sm">{member.name}</span>
                                              </div>
                                            </td>
                                            <td className="px-4 py-2.5 text-sm text-muted-foreground">{activeCnt}</td>
                                            <td className="px-4 py-2.5 text-sm text-muted-foreground">{completedCnt}</td>
                                            <td className="px-4 py-2.5">
                                              {activeCnt > 0 ? (
                                                <div className="flex items-center gap-2 min-w-[100px]">
                                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                    <div
                                                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                                                      style={{ width: `${avgProgress}%` }}
                                                    />
                                                  </div>
                                                  <span className="text-xs text-muted-foreground w-8 text-right">{avgProgress}%</span>
                                                </div>
                                              ) : (
                                                <span className="text-xs text-muted-foreground">—</span>
                                              )}
                                            </td>
                                            {/* Действия участника */}
                                            <td className="px-4 py-2.5" onClick={(e) => e.stopPropagation()}>
                                              <div className="flex items-center gap-1">
                                                {member.assignments.length > 0 && (
                                                  <Tip text="Статистика слушателя">
                                                    <button
                                                      className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-muted-foreground hover:text-violet-600"
                                                      onClick={() => setStatsUser(localUsers.find((u) => u.id === member.id) ?? member)}
                                                    >
                                                      <Icon name="BarChart2" size={15} />
                                                    </button>
                                                  </Tip>
                                                )}
                                                <Tip text="Добавить курс участнику">
                                                  <button
                                                    className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-600 dark:text-violet-400"
                                                    onClick={() => { setAddCourseForMember(member.id); if (!isMemberExpanded) toggleMember(member.id); }}
                                                  >
                                                    <Icon name="BookPlus" size={15} />
                                                  </button>
                                                </Tip>
                                              </div>
                                            </td>
                                          </tr>

                                          {/* Курсы участника */}
                                          {isMemberExpanded && (
                                            <tr key={`${member.id}-courses`} className="border-t border-border/60 bg-muted/10">
                                              <td colSpan={6} className="px-10 py-3">
                                                {member.assignments.length === 0 ? (
                                                  <p className="text-xs text-muted-foreground">Курсы не назначены</p>
                                                ) : (
                                                  <div className="rounded-xl border border-border overflow-hidden">
                                                    <table className="w-full text-xs">
                                                      <thead>
                                                        <tr className="border-b border-border bg-muted/30">
                                                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Курс</th>
                                                          <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
                                                          <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Дата активации</th>
                                                          <th className="px-3 py-2 text-left font-medium text-muted-foreground whitespace-nowrap">Дата завершения</th>
                                                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Прогресс</th>
                                                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Статус</th>
                                                          <th className="px-3 py-2 text-left font-medium text-muted-foreground">Действия</th>
                                                        </tr>
                                                      </thead>
                                                      <tbody>
                                                        {member.assignments.map((a, ai) => {
                                                          const course = allCourses.find((c) => c.id === a.courseId)
                                                            ?? courseDirections.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
                                                          if (!course) return null;
                                                          const courseTitle = "title" in course ? course.title : `${"code" in course ? course.code + " " : ""}${course.title}`;
                                                          const courseEmoji = "emoji" in course ? course.emoji : "📚";
                                                          return (
                                                            <tr key={a.courseId} className={`${ai > 0 ? "border-t border-border/60" : ""} hover:bg-muted/20`}>
                                                              <td className="px-3 py-2">
                                                                <div className="flex items-center gap-1.5">
                                                                  <span>{courseEmoji}</span>
                                                                  <span className="font-medium">{courseTitle}</span>
                                                                </div>
                                                              </td>

                                                              {/* Дата назначения / Активировать */}
                                                              <td className="px-3 py-2">
                                                                {!a.activatedAt ? (
                                                                  <ActivateMenu onActivate={(date) => activateCourse(member.id, a.courseId, date)} />
                                                                ) : (
                                                                  <span className="text-muted-foreground text-xs">{a.assignedAt}</span>
                                                                )}
                                                              </td>

                                                              {/* Дата активации */}
                                                              <td className="px-3 py-2 text-muted-foreground">
                                                                {a.activatedAt ?? <span className="opacity-40">—</span>}
                                                              </td>

                                                              {/* Дата завершения */}
                                                              <td className="px-3 py-2 text-muted-foreground">
                                                                {a.completedAt ?? <span className="opacity-40">—</span>}
                                                              </td>

                                                              {/* Прогресс */}
                                                              <td className="px-3 py-2">
                                                                <div className="flex items-center gap-1.5 min-w-[90px]">
                                                                  <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                                                    <div
                                                                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                                                                      style={{ width: `${a.progress}%` }}
                                                                    />
                                                                  </div>
                                                                  <span className="text-muted-foreground w-7 text-right">{a.progress}%</span>
                                                                  <Tip text="Статистика обучения">
                                                                    <button className="p-1 rounded-md hover:bg-muted transition-colors text-muted-foreground hover:text-violet-600 flex-shrink-0">
                                                                      <Icon name="BarChart2" size={12} />
                                                                    </button>
                                                                  </Tip>
                                                                </div>
                                                              </td>

                                                              {/* Статус */}
                                                              <td className="px-3 py-2">
                                                                <CourseStatusBadge status={a.status} />
                                                              </td>

                                                              {/* Действия — иконки */}
                                                              <td className="px-3 py-2">
                                                                <div className="flex items-center gap-0.5">
                                                                  <Tip text={a.active ? "Отключить курс" : "Включить курс"}>
                                                                    <button
                                                                      className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                                                                      onClick={() => toggleAssignment(member.id, a.courseId)}
                                                                    >
                                                                      <Icon name={a.active ? "ToggleRight" : "ToggleLeft"} size={15} />
                                                                    </button>
                                                                  </Tip>
                                                                  <Tip text="Продлить курс">
                                                                    <button
                                                                      className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                                                                      onClick={() => extendCourse(member.id, a.courseId)}
                                                                    >
                                                                      <Icon name="RefreshCw" size={14} />
                                                                    </button>
                                                                  </Tip>
                                                                  <Tip text={a.status === "certified" ? "Удостоверение уже выдано" : "Выдать удостоверение"}>
                                                                    <button
                                                                      className={`p-1.5 rounded-lg transition-colors ${a.status === "certified" ? "text-violet-400 cursor-default" : "text-muted-foreground hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400"}`}
                                                                      onClick={() => a.status !== "certified" && issueCertificate(member.id, a.courseId)}
                                                                    >
                                                                      <Icon name="Award" size={15} />
                                                                    </button>
                                                                  </Tip>
                                                                </div>
                                                              </td>
                                                            </tr>
                                                          );
                                                        })}
                                                      </tbody>
                                                    </table>
                                                  </div>
                                                )}
                                              </td>
                                            </tr>
                                          )}
                                        </>
                                      );
                                    })}
                                  </tbody>
                                </table>
                              </div>
                            )}
                          </div>
                        </td>
                      </tr>
                    )}
                  </>
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