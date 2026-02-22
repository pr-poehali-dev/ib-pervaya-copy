import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { User, allCourses, gradients, userColors, groups } from "./types";
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

export default function AdminGroups({ users }: AdminGroupsProps) {
  const [filterStatus, setFilterStatus] = useState("Все");
  const [filterOrgs, setFilterOrgs] = useState<string[]>([]);
  const [filterFio, setFilterFio] = useState<string[]>([]);
  const [filterCourse, setFilterCourse] = useState("");
  const [expandedGroups, setExpandedGroups] = useState<Set<string>>(new Set());
  const [expandedMembers, setExpandedMembers] = useState<Set<number>>(new Set());
  const [selectedGroups, setSelectedGroups] = useState<Set<string>>(new Set());
  const [actionsOpen, setActionsOpen] = useState(false);

  const orgOptions = useMemo(() => [...new Set(users.map((u) => u.group))], [users]);
  const fioOptions = useMemo(() => users.map((u) => u.name), [users]);
  const courseOptions = useMemo(() => allCourses.map((c) => c.title), []);

  const filteredGroups = useMemo(() => {
    return groups.filter((group) => {
      const members = users.filter((u) => u.group === group);
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
  }, [users, filterStatus, filterOrgs, filterFio, filterCourse]);

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

  return (
    <div className="space-y-4">
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
        <div className="relative flex-shrink-0 pt-6">
          <Button
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
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredGroups.map((group, idx) => {
                const members = users.filter((u) => u.group === group);
                const activeAssignments = members.reduce((sum, u) => sum + u.assignments.filter((a) => a.active).length, 0);
                const completedCount = members.filter((u) => u.assignments.some((a) => a.progress === 100)).length;
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
                      <td className="px-4 py-3" onClick={(e) => e.stopPropagation()}>
                        <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 gap-1" disabled={members.length === 0}>
                          <Icon name="Plus" size={12} />
                          Назначить курс
                        </Button>
                      </td>
                    </tr>

                    {/* Раскрытая строка — участники группы */}
                    {isExpanded && (
                      <tr key={`${group}-expanded`} className="border-b border-border bg-violet-50/30 dark:bg-violet-900/5">
                        <td colSpan={8} className="px-8 py-4">
                          <div className="space-y-3">
                            <div className="flex items-center justify-between">
                              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                                Участники группы {group}
                              </p>
                              <Button size="sm" className="gradient-primary text-white rounded-xl gap-1.5 text-xs h-7">
                                <Icon name="BookOpen" size={12} />
                                Назначить курс всей группе
                              </Button>
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
                                          </tr>

                                          {/* Курсы участника */}
                                          {isMemberExpanded && member.assignments.length > 0 && (
                                            <tr key={`${member.id}-courses`} className="border-t border-border/60 bg-muted/10">
                                              <td colSpan={5} className="px-10 py-3">
                                                <div className="space-y-1.5">
                                                  {member.assignments.map((a) => {
                                                    const course = allCourses.find((c) => c.id === a.courseId);
                                                    if (!course) return null;
                                                    return (
                                                      <div key={a.courseId} className="flex items-center gap-3">
                                                        <span className="text-sm">{course.emoji}</span>
                                                        <span className="text-sm text-foreground flex-1">{course.title}</span>
                                                        <div className="flex items-center gap-2 w-32">
                                                          <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                                                            <div
                                                              className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full"
                                                              style={{ width: `${a.progress}%` }}
                                                            />
                                                          </div>
                                                          <span className="text-xs text-muted-foreground w-8 text-right">{a.progress}%</span>
                                                        </div>
                                                        {a.progress === 100 ? (
                                                          <span className="text-xs px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">Завершён</span>
                                                        ) : a.active ? (
                                                          <span className="text-xs px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">Активен</span>
                                                        ) : (
                                                          <span className="text-xs px-2 py-0.5 rounded-md bg-muted text-muted-foreground">Отключён</span>
                                                        )}
                                                      </div>
                                                    );
                                                  })}
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