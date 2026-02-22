import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { User, allCourses, gradients, userColors } from "./types";
import { MultiSelect, SearchSelect, FilterTags } from "./FilterControls";

interface AdminUsersProps {
  users: User[];
  filteredUsers: User[];
  toggleCourse: (userId: number, courseId: number) => void;
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

  const statusOptions = ["Все", "Есть активные курсы", "Завершил курсы", "Без назначений"];
  const orgOptions = useMemo(() => [...new Set(users.map((u) => u.group))], [users]);
  const fioOptions = useMemo(() => users.map((u) => u.name), [users]);
  const courseOptions = useMemo(() => allCourses.map((c) => c.title), []);

  const resetFilters = () => {
    setFilterStatus("Все");
    setFilterOrgs([]);
    setFilterFio([]);
    setFilterCourse("");
  };

  const localFiltered = useMemo(() => {
    return filteredUsers.filter((u) => {
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
  }, [filteredUsers, filterStatus, filterOrgs, filterFio, filterCourse]);

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

  return (
    <div className="space-y-4">
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
                        <div className="flex items-center gap-1">
                          <button
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            title="Редактировать"
                          >
                            <Icon name="Pencil" size={14} />
                          </button>
                          <button
                            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-600"
                            title="Активен / Неактивен"
                          >
                            <Icon name="ToggleRight" size={14} />
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* Раскрытая строка — назначенные курсы */}
                    {isExpanded && (
                      <tr key={`${user.id}-expanded`} className="border-b border-border bg-violet-50/30 dark:bg-violet-900/5">
                        <td colSpan={7} className="px-8 py-4">
                          <div className="space-y-3">
                            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Назначенные курсы</p>
                            {user.assignments.length === 0 ? (
                              <p className="text-sm text-muted-foreground">Курсы не назначены</p>
                            ) : (
                              <div className="rounded-xl border border-border overflow-hidden">
                                <table className="w-full text-sm">
                                  <thead>
                                    <tr className="border-b border-border bg-muted/30">
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Курс</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Прогресс</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Статус</th>
                                      <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Действия</th>
                                    </tr>
                                  </thead>
                                  <tbody>
                                    {user.assignments.map((a, i) => {
                                      const course = allCourses.find((c) => c.id === a.courseId);
                                      if (!course) return null;
                                      return (
                                        <tr key={a.courseId} className={`${i > 0 ? "border-t border-border/60" : ""} hover:bg-muted/20`}>
                                          <td className="px-4 py-2.5">
                                            <div className="flex items-center gap-2">
                                              <span className="text-base">{course.emoji}</span>
                                              <span className="font-medium text-sm">{course.title}</span>
                                            </div>
                                          </td>
                                          <td className="px-4 py-2.5 text-xs text-muted-foreground">{a.assignedAt}</td>
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
                                          <td className="px-4 py-2.5">
                                            {a.progress === 100 ? (
                                              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">Завершён</span>
                                            ) : a.active ? (
                                              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">Активен</span>
                                            ) : (
                                              <span className="px-2 py-0.5 rounded-md text-xs font-medium bg-muted text-muted-foreground">Отключён</span>
                                            )}
                                          </td>
                                          <td className="px-4 py-2.5">
                                            <button
                                              className="text-xs text-muted-foreground hover:text-destructive transition-colors"
                                              onClick={() => toggleCourse(user.id, a.courseId)}
                                            >
                                              {a.active ? "Отключить" : "Включить"}
                                            </button>
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