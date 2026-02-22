import { useState, useMemo } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { User, allCourses, gradients, userColors, groups } from "./types";
import { MultiSelect, SearchSelect, FilterTags } from "./FilterControls";

interface AdminGroupsProps {
  users: User[];
}

type ViewMode = "card" | "table";

const STATUS_OPTIONS = ["Все", "Обучается", "Завершено", "Не начато"];

function getGroupStatus(members: User[]): string {
  if (members.length === 0) return "Не начато";
  const completed = members.filter((u) => u.assignments.some((a) => a.progress === 100));
  if (completed.length === members.length) return "Завершено";
  if (members.some((u) => u.assignments.some((a) => a.active))) return "Обучается";
  return "Не начато";
}

export default function AdminGroups({ users }: AdminGroupsProps) {
  const [viewMode, setViewMode] = useState<ViewMode>("card");
  const [filterStatus, setFilterStatus] = useState("Все");
  const [filterOrgs, setFilterOrgs] = useState<string[]>([]);
  const [filterFio, setFilterFio] = useState<string[]>([]);
  const [filterCourse, setFilterCourse] = useState("");

  // Собираем уникальные организации (используем группы как "организации" пока нет орг-данных)
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

  const hasFilters = filterStatus !== "Все" || filterOrgs.length > 0 || filterFio.length > 0 || filterCourse;

  const resetFilters = () => {
    setFilterStatus("Все");
    setFilterOrgs([]);
    setFilterFio([]);
    setFilterCourse("");
  };

  return (
    <div className="space-y-4">
      {/* Шапка с переключателем вида */}
      <div className="flex items-center justify-between gap-3">
        <p className="text-muted-foreground text-sm">Назначение курсов сразу для всей группы</p>
        <div className="flex items-center gap-1 bg-muted rounded-xl p-1">
          <button
            onClick={() => setViewMode("card")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "card" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon name="LayoutGrid" size={14} />
            Карточки
          </button>
          <button
            onClick={() => setViewMode("table")}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${viewMode === "table" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon name="Table" size={14} />
            Таблица
          </button>
        </div>
      </div>

      {/* Фильтры */}
      <div className="bg-card rounded-2xl border border-border px-4 pt-3 pb-3 space-y-2.5">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {/* Статус обучения */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Статус обучения группы</p>
            <SearchSelect options={STATUS_OPTIONS} value={filterStatus} onChange={setFilterStatus} placeholder="Все статусы" />
          </div>
          {/* Организация */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">Организация</p>
            <MultiSelect options={orgOptions} selected={filterOrgs} onChange={setFilterOrgs} placeholder="Все организации" />
          </div>
          {/* ФИО обучающегося */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground">ФИО обучающегося</p>
            <MultiSelect options={fioOptions} selected={filterFio} onChange={setFilterFio} placeholder="Все слушатели" />
          </div>
          {/* Курс обучения */}
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

      {/* Результат */}
      <p className="text-xs text-muted-foreground">Найдено групп: {filteredGroups.length}</p>

      {/* Вид: Карточки */}
      {viewMode === "card" && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {filteredGroups.map((group, idx) => {
            const members = users.filter((u) => u.group === group);
            const activeAssignments = members.reduce((sum, u) => sum + u.assignments.filter((a) => a.active).length, 0);
            const status = getGroupStatus(members);
            const statusColor = status === "Обучается" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
              : status === "Завершено" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
              : "bg-muted text-muted-foreground";
            return (
              <div key={group} className="bg-card rounded-2xl border border-border p-5 space-y-4">
                <div className="flex items-center gap-3">
                  <div className={`w-11 h-11 bg-gradient-to-br ${gradients[idx % gradients.length]} rounded-xl flex items-center justify-center`}>
                    <Icon name="UsersRound" size={20} className="text-white" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="font-bold text-base">Группа {group}</p>
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${statusColor}`}>{status}</span>
                    </div>
                    <p className="text-muted-foreground text-xs">{members.length} чел. · {activeAssignments} активных назначений</p>
                  </div>
                </div>
                {members.length > 0 ? (
                  <div className="flex flex-wrap gap-1.5">
                    {members.map((u, i) => (
                      <div key={u.id} title={u.name} className={`w-8 h-8 bg-gradient-to-br ${userColors[i % userColors.length]} rounded-lg flex items-center justify-center`}>
                        <span className="text-white font-bold text-[10px]">{u.initials}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground text-xs">Нет участников</p>
                )}
                <div className="space-y-1.5">
                  {allCourses.slice(0, 3).map((course) => {
                    const assignedCount = members.filter((u) => u.assignments.some((a) => a.courseId === course.id && a.active)).length;
                    return (
                      <div key={course.id} className="flex items-center gap-2 text-sm">
                        <span>{course.emoji}</span>
                        <span className="flex-1 truncate text-xs text-muted-foreground">{course.title}</span>
                        <Badge variant={assignedCount > 0 ? "secondary" : "outline"} className="text-xs">
                          {assignedCount}/{members.length}
                        </Badge>
                      </div>
                    );
                  })}
                </div>
                <Button variant="outline" size="sm" className="w-full rounded-xl text-xs" disabled={members.length === 0}>
                  <Icon name="Plus" size={14} className="mr-1.5" />
                  Назначить курс группе
                </Button>
              </div>
            );
          })}
        </div>
      )}

      {/* Вид: Таблица */}
      {viewMode === "table" && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  {["Группа", "Участников", "Статус", "Активных назначений", "Завершили", "Действия"].map((h) => (
                    <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filteredGroups.map((group, idx) => {
                  const members = users.filter((u) => u.group === group);
                  const activeAssignments = members.reduce((sum, u) => sum + u.assignments.filter((a) => a.active).length, 0);
                  const completed = members.filter((u) => u.assignments.some((a) => a.progress === 100)).length;
                  const status = getGroupStatus(members);
                  const statusColor = status === "Обучается" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300"
                    : status === "Завершено" ? "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"
                    : "bg-muted text-muted-foreground";
                  return (
                    <tr key={group} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
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
                        <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${statusColor}`}>{status}</span>
                      </td>
                      <td className="px-4 py-3 text-center">{activeAssignments}</td>
                      <td className="px-4 py-3 text-center">{completed}</td>
                      <td className="px-4 py-3">
                        <Button variant="outline" size="sm" className="rounded-lg text-xs h-7 gap-1" disabled={members.length === 0}>
                          <Icon name="Plus" size={12} />
                          Назначить курс
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {filteredGroups.length === 0 && (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <Icon name="SearchX" size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="font-medium">Группы не найдены</p>
          <p className="text-muted-foreground text-sm mt-1">Попробуйте изменить условия фильтрации</p>
        </div>
      )}
    </div>
  );
}