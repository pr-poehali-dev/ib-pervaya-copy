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
  setSelectedUser: (u: User) => void;
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

  const statusOptions = ["Все", "Есть активные курсы", "Завершил курсы", "Без назначений"];
  const orgOptions = useMemo(() => [...new Set(users.map((u) => u.group))], [users]);
  const fioOptions = useMemo(() => users.map((u) => u.name), [users]);
  const courseOptions = useMemo(() => allCourses.map((c) => c.title), []);

  const hasFilters = filterStatus !== "Все" || filterOrgs.length > 0 || filterFio.length > 0 || filterCourse;

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

      <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
        <div className="lg:col-span-2 space-y-3">
          <p className="text-xs text-muted-foreground">Найдено: {localFiltered.length}</p>
          <div className="space-y-2">
            {localFiltered.map((user, idx) => (
              <div
                key={user.id}
                onClick={() => setSelectedUser(user)}
                className={`bg-card rounded-2xl p-4 border cursor-pointer transition-all hover:shadow-md ${
                  selectedUser?.id === user.id ? "border-primary shadow-md shadow-purple-100" : "border-border"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 bg-gradient-to-br ${userColors[idx % userColors.length]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                    <span className="text-white font-bold text-xs">{user.initials}</span>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{user.name}</p>
                    <p className="text-muted-foreground text-xs truncate">{user.email}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <Badge variant="secondary" className="text-xs">{user.group}</Badge>
                    <p className="text-muted-foreground text-xs mt-1">{user.assignments.filter((a) => a.active).length} курс.</p>
                  </div>
                </div>
              </div>
            ))}
            {localFiltered.length === 0 && (
              <div className="bg-card rounded-2xl border border-border p-8 text-center">
                <Icon name="SearchX" size={28} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Слушатели не найдены</p>
              </div>
            )}
          </div>
        </div>

        <div className="lg:col-span-3">
          {selectedUser ? (
            <div className="bg-card rounded-2xl border border-border p-5 space-y-5">
              <div className="flex items-center gap-4">
                <div className={`w-14 h-14 bg-gradient-to-br ${userColors[users.findIndex(u => u.id === selectedUser.id) % userColors.length]} rounded-2xl flex items-center justify-center`}>
                  <span className="text-white font-bold text-lg">{selectedUser.initials}</span>
                </div>
                <div>
                  <p className="font-bold text-lg">{selectedUser.name}</p>
                  <p className="text-muted-foreground text-sm">{selectedUser.email}</p>
                  <div className="flex gap-2 mt-1">
                    <Badge variant="secondary">{selectedUser.group}</Badge>
                    <Badge variant="outline">{selectedUser.role}</Badge>
                  </div>
                </div>
              </div>

              <div>
                <p className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">Назначение курсов</p>
                <div className="space-y-2">
                  {allCourses.map((course, idx) => {
                    const assignment = selectedUser.assignments.find((a) => a.courseId === course.id);
                    const isAssigned = !!assignment;
                    const isActive = assignment?.active ?? false;
                    return (
                      <div key={course.id} className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-all">
                        <div className={`w-9 h-9 bg-gradient-to-br ${gradients[idx]} rounded-xl flex items-center justify-center flex-shrink-0 text-base`}>
                          {course.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-medium text-sm truncate">{course.title}</p>
                          {isAssigned && (
                            <div className="flex items-center gap-2 mt-0.5">
                              <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all" style={{ width: `${assignment!.progress}%` }} />
                              </div>
                              <span className="text-xs text-muted-foreground">{assignment!.progress}%</span>
                            </div>
                          )}
                        </div>
                        <div className="flex-shrink-0">
                          {!isAssigned ? (
                            <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg" onClick={() => toggleCourse(selectedUser.id, course.id)}>
                              <Icon name="Plus" size={14} className="mr-1" />Назначить
                            </Button>
                          ) : isActive ? (
                            <Button size="sm" className="h-8 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white" onClick={() => toggleCourse(selectedUser.id, course.id)}>
                              <Icon name="CheckCircle" size={14} className="mr-1" />Активен
                            </Button>
                          ) : (
                            <Button size="sm" variant="outline" className="h-8 text-xs rounded-lg text-muted-foreground" onClick={() => toggleCourse(selectedUser.id, course.id)}>
                              <Icon name="PauseCircle" size={14} className="mr-1" />Отключён
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4">
                <Icon name="UserSearch" size={24} className="text-muted-foreground" />
              </div>
              <p className="font-semibold text-foreground">Выберите пользователя</p>
              <p className="text-muted-foreground text-sm mt-1">Нажмите на пользователя слева, чтобы управлять его курсами</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
