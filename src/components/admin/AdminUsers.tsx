import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { User, allCourses, gradients, userColors, groups, roles } from "./types";
import { MultiSelect, SearchSelect, FilterTags } from "./FilterControls";

interface AdminUsersProps {
  users: User[];
  filteredUsers: User[];
  search: string;
  setSearch: (v: string) => void;
  selectedUser: User | null;
  setSelectedUser: (u: User | null) => void;
  toggleCourse: (userId: number, courseId: number) => void;
}

export default function AdminUsers({
  users,
  filteredUsers,
  search,
  setSearch,
  selectedUser,
  setSelectedUser,
  toggleCourse,
}: AdminUsersProps) {
  const [filterStatus, setFilterStatus] = useState("Все");
  const [filterOrgs, setFilterOrgs] = useState<string[]>([]);
  const [filterFio, setFilterFio] = useState<string[]>([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set());
  const [copiedId, setCopiedId] = useState<number | null>(null);

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

  return (
    <div className="space-y-4">
      {/* Фильтры */}
      <div className="bg-card rounded-2xl border border-border px-4 pt-3 pb-3 space-y-2.5">
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

      <p className="text-xs text-muted-foreground">Найдено: {localFiltered.length}</p>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
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
                      className={`border-b border-border transition-colors cursor-pointer hover:bg-muted/20 ${isExpanded ? "bg-violet-50/50 dark:bg-violet-900/10" : ""}`}
                      onClick={() => toggleRow(user.id)}
                    >
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
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <div className="flex items-center gap-1.5 flex-wrap">
                          <span className="text-xs text-muted-foreground whitespace-nowrap">
                            {activeCourses.length} актив.
                            {completedCount > 0 && ` · ${completedCount} завершено`}
                          </span>
                          <Button
                            size="sm"
                            variant="outline"
                            className="h-6 px-2 text-xs rounded-lg gap-1"
                            onClick={() => { setSelectedUser(user); toggleRow(user.id); }}
                          >
                            <Icon name="Plus" size={11} />
                            Назначить
                          </Button>
                        </div>
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
                        <td colSpan={6} className="px-8 py-4">
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
                            {/* Кнопка назначить новый курс */}
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-xl gap-1.5 text-xs"
                              onClick={() => setSelectedUser(user)}
                            >
                              <Icon name="Plus" size={13} />
                              Назначить курс
                            </Button>
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

      {/* Панель назначения курсов (справа) */}
      {selectedUser && (
        <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${userColors[users.findIndex((u) => u.id === selectedUser.id) % userColors.length]} rounded-xl flex items-center justify-center`}>
                <span className="text-white font-bold text-xs">{selectedUser.initials}</span>
              </div>
              <div>
                <p className="font-bold text-sm">{selectedUser.name}</p>
                <p className="text-xs text-muted-foreground">{selectedUser.email}</p>
              </div>
            </div>
            <button onClick={() => setSelectedUser(null)} className="text-muted-foreground hover:text-foreground">
              <Icon name="X" size={16} />
            </button>
          </div>
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Назначение курсов</p>
          <div className="space-y-2">
            {allCourses.map((course, idx) => {
              const assignment = selectedUser.assignments.find((a) => a.courseId === course.id);
              const isAssigned = !!assignment;
              const isActive = assignment?.active ?? false;
              return (
                <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-all">
                  <div className={`w-8 h-8 bg-gradient-to-br ${gradients[idx]} rounded-lg flex items-center justify-center flex-shrink-0 text-sm`}>
                    {course.emoji}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{course.title}</p>
                    {isAssigned && (
                      <div className="flex items-center gap-2 mt-0.5">
                        <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                          <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full" style={{ width: `${assignment!.progress}%` }} />
                        </div>
                        <span className="text-xs text-muted-foreground">{assignment!.progress}%</span>
                      </div>
                    )}
                  </div>
                  <div className="flex-shrink-0">
                    {!isAssigned ? (
                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg" onClick={() => toggleCourse(selectedUser.id, course.id)}>
                        <Icon name="Plus" size={13} className="mr-1" />Назначить
                      </Button>
                    ) : isActive ? (
                      <Button size="sm" className="h-7 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => toggleCourse(selectedUser.id, course.id)}>
                        <Icon name="CheckCircle" size={13} className="mr-1" />Активен
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline" className="h-7 text-xs rounded-lg text-muted-foreground" onClick={() => toggleCourse(selectedUser.id, course.id)}>
                        <Icon name="PauseCircle" size={13} className="mr-1" />Отключён
                      </Button>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}