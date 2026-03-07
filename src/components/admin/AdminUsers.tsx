import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { User, CourseAssignment, CourseStatus, allCourses, gradients, userColors, courseDirections } from "./types";
import { MultiSelect, SearchSelect, FilterTags } from "./FilterControls";

interface AdminUsersProps {
  users: User[];
  filteredUsers: User[];
  toggleCourse: (userId: number, courseId: number) => void;
}

function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function StatusBadge({ status }: { status: CourseStatus }) {
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
  onClose: () => void;
  onAdd: (courseIds: number[]) => void;
  alreadyAssigned: number[];
}

function AddCourseModal({ onClose, onAdd, alreadyAssigned }: AddCourseModalProps) {
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
          <h2 className="font-semibold text-base">Добавить курс</h2>
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

export default function AdminUsers({
  users,
  filteredUsers,
  toggleCourse,
}: AdminUsersProps) {
  const [filterStatus, setFilterStatus] = useState("Все");
  const [filterOrgs, setFilterOrgs] = useState<string[]>([]);
  const [filterFio, setFilterFio] = useState<string[]>([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [actionsOpen, setActionsOpen] = useState(false);

  const [addCourseForUser, setAddCourseForUser] = useState<number | null>(null);
  const [localUsers, setLocalUsers] = useState<User[]>(users);

  const statusOptions = ["Все", "Есть активные курсы", "Завершил курсы", "Без назначений"];
  const orgOptions = useMemo(() => [...new Set(localUsers.map((u) => u.group))], [localUsers]);
  const fioOptions = useMemo(() => localUsers.map((u) => u.name), [localUsers]);
  const courseOptions = useMemo(() => allCourses.map((c) => c.title), []);

  const resetFilters = () => {
    setFilterStatus("Все");
    setFilterOrgs([]);
    setFilterFio([]);
    setFilterCourse("");
  };

  const localFiltered = useMemo(() => {
    return filteredUsers.map((u) => localUsers.find((lu) => lu.id === u.id) ?? u).filter((u) => {
      if (filterStatus === "Есть активные курсы" && !u.assignments.some((a) => a.active)) return false;
      if (filterStatus === "Завершил курсы" && !u.assignments.some((a) => a.progress === 100)) return false;
      if (filterStatus === "Без назначений" && u.assignments.length > 0) return false;
      if (filterOrgs.length > 0 && !filterOrgs.includes(u.group)) return false;
      if (filterFio.length > 0 && !filterFio.includes(u.name)) return false;
      if (filterCourse) {
        const course = allCourses.find((c) => c.title === filterCourse);
        if (course && !u.assignments.some((a) => a.courseId === course.id && a.active)) return false;
      }
      return true;
    });
  }, [filteredUsers, localUsers, filterStatus, filterOrgs, filterFio, filterCourse]);

  const toggleRow = (id: number) => {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const copyLogin = (userId: number, email: string) => {
    navigator.clipboard.writeText(email);
    setCopiedId(userId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const allChecked = localFiltered.length > 0 && localFiltered.every((u) => selectedIds.has(u.id));
  const someChecked = localFiltered.some((u) => selectedIds.has(u.id));

  const toggleSelectAll = () => {
    if (allChecked) {
      setSelectedIds((prev) => { const next = new Set(prev); localFiltered.forEach((u) => next.delete(u.id)); return next; });
    } else {
      setSelectedIds((prev) => { const next = new Set(prev); localFiltered.forEach((u) => next.add(u.id)); return next; });
    }
  };

  const toggleSelectOne = (id: number) => {
    setSelectedIds((prev) => { const next = new Set(prev); if (next.has(id)) next.delete(id); else next.add(id); return next; });
  };

  const activateCourse = (userId: number, courseId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        assignments: u.assignments.map((a) =>
          a.courseId !== courseId ? a : { ...a, activatedAt: today(), status: "active" as CourseStatus }
        ),
      };
    }));
  };

  const extendCourse = (userId: number, courseId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        assignments: u.assignments.map((a) =>
          a.courseId !== courseId ? a : { ...a, status: "active" as CourseStatus, progress: Math.max(0, a.progress - 0) }
        ),
      };
    }));
  };

  const issueCertificate = (userId: number, courseId: number) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        assignments: u.assignments.map((a) =>
          a.courseId !== courseId ? a : { ...a, status: "certified" as CourseStatus, completedAt: a.completedAt ?? today() }
        ),
      };
    }));
  };

  const handleAddCourses = (userId: number, courseIds: number[]) => {
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      const newAssignments: CourseAssignment[] = courseIds
        .filter((id) => !u.assignments.some((a) => a.courseId === id))
        .map((id) => ({ courseId: id, active: true, progress: 0, assignedAt: today(), status: "pending" as CourseStatus }));
      return { ...u, assignments: [...u.assignments, ...newAssignments] };
    }));
  };

  const handleToggleCourse = (userId: number, courseId: number) => {
    toggleCourse(userId, courseId);
    setLocalUsers((prev) => prev.map((u) => {
      if (u.id !== userId) return u;
      return {
        ...u,
        assignments: u.assignments.map((a) =>
          a.courseId !== courseId ? a : { ...a, active: !a.active }
        ),
      };
    }));
  };

  const addCourseUser = addCourseForUser !== null ? localUsers.find((u) => u.id === addCourseForUser) : null;

  return (
    <div className="space-y-4">
      {addCourseForUser !== null && addCourseUser && (
        <AddCourseModal
          onClose={() => setAddCourseForUser(null)}
          onAdd={(ids) => handleAddCourses(addCourseForUser, ids)}
          alreadyAssigned={addCourseUser.assignments.map((a) => a.courseId)}
        />
      )}

      {/* Фильтры + кнопка действий */}
      <div className="flex items-start gap-3">
        <div className="flex-1 bg-card rounded-2xl border border-border px-4 pt-3 pb-3 space-y-2.5">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Статус обучения</p>
              <SearchSelect options={statusOptions} value={filterStatus} onChange={setFilterStatus} placeholder="Все статусы" />
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
        <div className="relative flex-shrink-0 pt-6">
          <Button
            variant="outline"
            className="rounded-xl gap-2 h-9"
            onClick={() => setActionsOpen((p) => !p)}
            disabled={selectedIds.size === 0}
          >
            <Icon name="Zap" size={15} />
            Действия
            {selectedIds.size > 0 && (
              <span className="bg-violet-600 text-white text-xs rounded-full px-1.5 py-0.5 leading-none">{selectedIds.size}</span>
            )}
            <Icon name="ChevronDown" size={14} />
          </Button>
          {actionsOpen && (
            <div className="absolute right-0 top-full mt-1 z-30 bg-background border border-border rounded-xl shadow-xl w-52 overflow-hidden">
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
            </div>
          )}
        </div>
      </div>

      <p className="text-xs text-muted-foreground">
        Найдено: {localFiltered.length}
        {selectedIds.size > 0 && <span className="ml-2 text-violet-600 font-medium">· Выбрано: {selectedIds.size}</span>}
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">ФИО</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Организация / Группа</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Курсы</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Логин</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Управление</th>
              </tr>
            </thead>
            <tbody>
              {localFiltered.map((user, idx) => {
                const isExpanded = expandedRows.has(user.id);
                const activeCourses = user.assignments.filter((a) => a.active);
                const completedCount = user.assignments.filter((a) => a.progress === 100).length;

                return (
                  <>
                    <tr
                      key={user.id}
                      className={`border-b border-border transition-colors cursor-pointer hover:bg-muted/20 ${isExpanded ? "bg-violet-50/50 dark:bg-violet-900/10" : ""} ${selectedIds.has(user.id) ? "bg-violet-50/30 dark:bg-violet-900/10" : ""}`}
                      onClick={() => toggleRow(user.id)}
                    >
                      {/* Чекбокс */}
                      <td className="px-3 py-3" onClick={(e) => e.stopPropagation()}>
                        <input
                          type="checkbox"
                          checked={selectedIds.has(user.id)}
                          onChange={() => toggleSelectOne(user.id)}
                          className="rounded border-border cursor-pointer accent-violet-600"
                        />
                      </td>

                      {/* Expand toggle */}
                      <td className="px-4 py-3">
                        <Icon
                          name={isExpanded ? "ChevronDown" : "ChevronRight"}
                          size={16}
                          className="text-muted-foreground"
                        />
                      </td>

                      {/* ФИО */}
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-8 h-8 bg-gradient-to-br ${userColors[idx % userColors.length]} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <span className="text-white font-bold text-[10px]">{user.initials}</span>
                          </div>
                          <div>
                            <p className="font-medium leading-tight">{user.name}</p>
                            <p className="text-xs text-muted-foreground">{user.role}</p>
                          </div>
                        </div>
                      </td>

                      {/* Организация / Группа */}
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">{user.group}</Badge>
                      </td>

                      {/* Курсы */}
                      <td className="px-4 py-3">
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {activeCourses.length} актив.
                          {completedCount > 0 && ` · ${completedCount} завершено`}
                        </span>
                      </td>

                      {/* Логин */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-muted-foreground truncate max-w-[140px]">{user.email}</span>
                          <button
                            className="text-muted-foreground hover:text-foreground transition-colors flex-shrink-0"
                            title="Скопировать логин"
                            onClick={() => copyLogin(user.id, user.email)}
                          >
                            {copiedId === user.id
                              ? <Icon name="Check" size={13} className="text-emerald-500" />
                              : <Icon name="Copy" size={13} />
                            }
                          </button>
                        </div>
                      </td>

                      {/* Управление */}
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5">
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Редактировать"
                          >
                            <Icon name="Pencil" size={16} />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-600"
                            title="Активен / Неактивен"
                          >
                            <Icon name="ToggleRight" size={16} />
                          </button>
                          <button
                            className="p-2 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-600 dark:text-violet-400"
                            title="Добавить курс"
                            onClick={() => { setAddCourseForUser(user.id); if (!isExpanded) toggleRow(user.id); }}
                          >
                            <Icon name="BookPlus" size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Раскрытая строка — назначенные курсы */}
                    {isExpanded && (
                      <tr key={`${user.id}-expanded`} className="border-b border-border bg-violet-50/30 dark:bg-violet-900/5">
                        <td colSpan={7} className="px-8 py-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Назначенные курсы</p>
                              <button
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-violet-100 dark:bg-violet-900/30 hover:bg-violet-200 dark:hover:bg-violet-900/50 transition-colors text-violet-700 dark:text-violet-300 text-xs font-medium"
                                onClick={() => setAddCourseForUser(user.id)}
                              >
                                <Icon name="Plus" size={13} />
                                Добавить курс
                              </button>
                            </div>
                            {user.assignments.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Курсы не назначены</p>
                            ) : (
                              <div className="rounded-xl border border-border overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Курс</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата активации</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата завершения</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Прогресс</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Статус</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Действия</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {user.assignments.map((a, i) => {
                                      const course = allCourses.find((c) => c.id === a.courseId)
                                        ?? courseDirections.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
                                      if (!course) return null;
                                      const courseTitle = "title" in course ? course.title : `${"code" in course ? course.code + " " : ""}${course.title}`;
                                      const courseEmoji = "emoji" in course ? course.emoji : "📚";
                                      return (
                                        <tr key={a.courseId} className={`${i > 0 ? "border-t border-border/60" : ""} hover:bg-muted/20`}>
                                          <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                              <span className="text-base">{courseEmoji}</span>
                                              <span className="font-medium text-sm">{courseTitle}</span>
                                            </div>
                                          </td>

                                          {/* Дата назначения / кнопка Активировать */}
                                          <td className="px-4 py-2.5">
                                            {!a.activatedAt ? (
                                              <button
                                                className="flex items-center gap-1 px-2 py-1 rounded-lg bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs font-medium hover:bg-amber-200 dark:hover:bg-amber-900/50 transition-colors whitespace-nowrap"
                                                onClick={() => activateCourse(user.id, a.courseId)}
                                              >
                                                <Icon name="Play" size={12} />
                                                Активировать
                                              </button>
                                            ) : (
                                              <span className="text-xs text-muted-foreground">{a.assignedAt}</span>
                                            )}
                                          </td>

                                          {/* Дата активации */}
                                          <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                            {a.activatedAt ?? <span className="text-muted-foreground/50">—</span>}
                                          </td>

                                          {/* Дата завершения */}
                                          <td className="px-4 py-2.5 text-xs text-muted-foreground">
                                            {a.completedAt ?? <span className="text-muted-foreground/50">—</span>}
                                          </td>

                                          {/* Прогресс */}
                                          <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2 min-w-[100px]">
                                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                                <div
                                                  className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                                                  style={{ width: `${a.progress}%` }}
                                                />
                                              </div>
                                              <span className="text-xs text-muted-foreground w-8 text-right">{a.progress}%</span>
                                            </div>
                                          </td>

                                          {/* Статус */}
                                          <td className="px-4 py-2.5">
                                            <StatusBadge status={a.status} />
                                          </td>

                                          {/* Действия */}
                                          <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-0.5">
                                              <button
                                                className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-destructive"
                                                title={a.active ? "Отключить" : "Включить"}
                                                onClick={() => handleToggleCourse(user.id, a.courseId)}
                                              >
                                                <Icon name={a.active ? "ToggleRight" : "ToggleLeft"} size={15} />
                                              </button>
                                              <button
                                                className="p-1.5 rounded-lg hover:bg-blue-100 dark:hover:bg-blue-900/30 transition-colors text-muted-foreground hover:text-blue-600 dark:hover:text-blue-400"
                                                title="Продлить курс"
                                                onClick={() => extendCourse(user.id, a.courseId)}
                                              >
                                                <Icon name="RefreshCw" size={14} />
                                              </button>
                                              <button
                                                className={`p-1.5 rounded-lg transition-colors ${a.status === "certified" ? "text-violet-400 cursor-default" : "text-muted-foreground hover:bg-violet-100 dark:hover:bg-violet-900/30 hover:text-violet-600 dark:hover:text-violet-400"}`}
                                                title={a.status === "certified" ? "Удостоверение уже выдано" : "Выдать удостоверение"}
                                                onClick={() => a.status !== "certified" && issueCertificate(user.id, a.courseId)}
                                              >
                                                <Icon name="Award" size={15} />
                                              </button>
                                            </div>
                                          </td>
                                        </tr>
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

        {localFiltered.length === 0 && (
          <div className="p-10 text-center">
            <Icon name="SearchX" size={28} className="text-muted-foreground mx-auto mb-2" />
            <p className="text-sm text-muted-foreground">Слушатели не найдены</p>
          </div>
        )}
      </div>
    </div>
  );
}