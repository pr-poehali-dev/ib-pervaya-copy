import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { User, initialUsers, groups, roles, getInitials, allCourses, courseDirections } from "@/components/admin/types";
import AdminUsers from "@/components/admin/AdminUsers";
import AdminGroups from "@/components/admin/AdminGroups";
import AdminCourses from "@/components/admin/AdminCourses";
import AdminSettings from "@/components/admin/AdminSettings";

export default function Admin() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"stp" | "groups" | "users" | "courses" | "reports" | "settings">("stp");
  const [showAddUser, setShowAddUser] = useState(false);
  const [showAddGroup, setShowAddGroup] = useState(false);
  const [newGroupName, setNewGroupName] = useState("");
  const [newGroupError, setNewGroupError] = useState("");
  const [newLastName, setNewLastName] = useState("");
  const [newFirstName, setNewFirstName] = useState("");
  const [newMiddleName, setNewMiddleName] = useState("");
  const [newOrg, setNewOrg] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newGroup, setNewGroup] = useState("ИБ-301");
  const [newRole, setNewRole] = useState("Студент");
  const [selectedCourses, setSelectedCourses] = useState<number[]>([]);
  const [showCoursesPicker, setShowCoursesPicker] = useState(false);
  const [openDirections, setOpenDirections] = useState<number[]>([1]);
  const toggleDirection = (id: number) => setOpenDirections((p) => p.includes(id) ? p.filter((d) => d !== id) : [...p, id]);
  const [showGroupDropdown, setShowGroupDropdown] = useState(false);
  const [selectedListenerGroup, setSelectedListenerGroup] = useState<string>("");
  const [newGroupForListener, setNewGroupForListener] = useState("");
  const [availableGroups, setAvailableGroups] = useState<string[]>([...groups]);
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleAddUser = () => {
    let valid = true;
    if (!newLastName.trim()) { setNameError("Введите фамилию"); valid = false; } else setNameError("");
    if (!newEmail.trim()) { setEmailError("Введите email"); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { setEmailError("Некорректный email"); valid = false; }
    else setEmailError("");
    if (!valid) return;

    const fullName = [newLastName.trim(), newFirstName.trim(), newMiddleName.trim()].filter(Boolean).join(" ");
    const newUser: User = {
      id: Date.now(),
      name: fullName,
      email: newEmail.trim(),
      initials: getInitials(fullName),
      group: newGroup,
      role: newRole,
      assignments: selectedCourses.map((courseId) => ({ courseId, active: true, progress: 0, assignedAt: new Date().toLocaleDateString("ru-RU") })),
    };
    setUsers((prev) => [...prev, newUser]);
    setShowAddUser(false);
    setNewLastName(""); setNewFirstName(""); setNewMiddleName(""); setNewOrg("");
    setNewEmail(""); setNewGroup("ИБ-301"); setNewRole("Студент"); setSelectedCourses([]);
    setSelectedListenerGroup(""); setShowGroupDropdown(false);
    setSelectedUser(newUser);
  };

  const filteredUsers = users.filter(
    (u) =>
      u.name.toLowerCase().includes(search.toLowerCase()) ||
      u.email.toLowerCase().includes(search.toLowerCase()) ||
      u.group.toLowerCase().includes(search.toLowerCase())
  );

  const toggleCourse = (userId: number, courseId: number) => {
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
        } else {
          return {
            ...u,
            assignments: [
              ...u.assignments,
              { courseId, active: true, progress: 0, assignedAt: new Date().toLocaleDateString("ru-RU") },
            ],
          };
        }
      })
    );
    setSelectedUser((prev) => {
      if (!prev || prev.id !== userId) return prev;
      const exists = prev.assignments.find((a) => a.courseId === courseId);
      if (exists) {
        return {
          ...prev,
          assignments: prev.assignments.map((a) =>
            a.courseId === courseId ? { ...a, active: !a.active } : a
          ),
        };
      } else {
        return {
          ...prev,
          assignments: [
            ...prev.assignments,
            { courseId, active: true, progress: 0, assignedAt: new Date().toLocaleDateString("ru-RU") },
          ],
        };
      }
    });
  };

  const totalAssignments = users.reduce((sum, u) => sum + u.assignments.filter((a) => a.active).length, 0);
  const totalCompleted = users.reduce(
    (sum, u) => sum + u.assignments.filter((a) => a.progress === 100).length,
    0
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-6">
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Icon name="ShieldCheck" size={20} className="text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold leading-tight">Панель администратора</h1>
              <p className="text-muted-foreground text-sm">Управление пользователями и курсами</p>
            </div>
          </div>
          <div className="flex gap-2">
            <Button
              variant="outline"
              className="rounded-xl gap-2"
              onClick={() => setShowAddGroup(true)}
            >
              <Icon name="FolderPlus" size={16} />
              Добавить группу
            </Button>
            <Button
              className="gradient-primary text-white rounded-xl shadow-md shadow-purple-200 gap-2"
              onClick={() => setShowAddUser(true)}
            >
              <Icon name="UserPlus" size={16} />
              Добавить слушателя
            </Button>
          </div>
        </div>

        {/* Оверлей для диалога добавления слушателя */}
        {showAddUser && (
          <div className="fixed inset-0 z-50 flex items-center justify-center">
            {/* Затемнение */}
            <div className="absolute inset-0 bg-black/50" onClick={() => { setShowAddUser(false); setShowCoursesPicker(false); }} />

            {/* Основное окно — сдвигается влево при открытии панели курсов */}
            <div
              className={`relative bg-background rounded-2xl shadow-2xl z-10 w-full max-w-lg mx-4 flex flex-col max-h-[90vh] overflow-y-auto transition-all duration-300 ${showCoursesPicker ? "-translate-x-[220px]" : ""}`}
            >
              {/* Заголовок */}
              <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                <h2 className="font-semibold text-base">Создание/редактирование слушателя</h2>
                <button onClick={() => { setShowAddUser(false); setShowCoursesPicker(false); }} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="X" size={18} />
                </button>
              </div>

              <div className="p-6 space-y-4">
                {/* ФИО */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <Label>Фамилия <span className="text-destructive">*</span></Label>
                    <Input className="rounded-xl" placeholder="Иванов" value={newLastName} onChange={(e) => { setNewLastName(e.target.value); setNameError(""); }} />
                    {nameError && <p className="text-destructive text-xs">{nameError}</p>}
                  </div>
                  <div className="space-y-1.5">
                    <Label>Имя <span className="text-destructive">*</span></Label>
                    <Input className="rounded-xl" placeholder="Иван" value={newFirstName} onChange={(e) => setNewFirstName(e.target.value)} />
                  </div>
                  <div className="space-y-1.5">
                    <Label>Отчество</Label>
                    <Input className="rounded-xl" placeholder="Иванович" value={newMiddleName} onChange={(e) => setNewMiddleName(e.target.value)} />
                  </div>
                </div>

                {/* Наименование организации */}
                <div className="space-y-1.5">
                  <Label>Наименование организации <span className="text-destructive">*</span></Label>
                  <Input className="rounded-xl" value={newOrg} onChange={(e) => setNewOrg(e.target.value)} />
                </div>

                {/* Email */}
                <div className="space-y-1.5">
                  <Label>Электронная почта пользователя <span className="text-destructive">*</span></Label>
                  <Input className="rounded-xl" value={newEmail} onChange={(e) => { setNewEmail(e.target.value); setEmailError(""); }} />
                  {emailError && <p className="text-destructive text-xs">{emailError}</p>}
                </div>

                {/* Кнопки действий */}
                <div className="flex gap-2 flex-wrap">
                  <Button
                    type="button"
                    className={`rounded-xl gap-2 text-white ${showCoursesPicker ? "bg-violet-700" : "gradient-primary"}`}
                    onClick={() => setShowCoursesPicker((p) => !p)}
                  >
                    <Icon name="BookOpen" size={15} />
                    Добавить/редактировать курсы
                  </Button>
                  <div className="relative">
                    <Button
                      type="button"
                      className={`rounded-xl gap-2 text-white ${showGroupDropdown ? "bg-violet-700" : "gradient-primary"}`}
                      onClick={() => { setShowGroupDropdown((p) => !p); setShowCoursesPicker(false); }}
                    >
                      <Icon name="Users" size={15} />
                      {selectedListenerGroup ? selectedListenerGroup : "Добавить к группе обучения"}
                      <Icon name={showGroupDropdown ? "ChevronUp" : "ChevronDown"} size={14} />
                    </Button>

                    {showGroupDropdown && (
                      <div className="absolute left-0 top-full mt-1 z-30 bg-background border border-border rounded-xl shadow-xl w-72 overflow-hidden">
                        {/* Существующие группы */}
                        <div className="px-3 py-2 border-b border-border">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Существующие группы</p>
                        </div>
                        <div className="max-h-44 overflow-y-auto">
                          {availableGroups.map((g) => (
                            <button
                              key={g}
                              type="button"
                              className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted/60 transition-colors flex items-center justify-between ${selectedListenerGroup === g ? "text-violet-600 font-medium" : ""}`}
                              onClick={() => { setSelectedListenerGroup(g); setNewGroup(g); setShowGroupDropdown(false); }}
                            >
                              {g}
                              {selectedListenerGroup === g && <Icon name="Check" size={14} className="text-violet-600" />}
                            </button>
                          ))}
                        </div>
                        {/* Создать новую группу */}
                        <div className="border-t border-border px-3 py-2.5 space-y-2">
                          <p className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Создать новую группу</p>
                          <div className="flex gap-2">
                            <Input
                              className="rounded-lg h-8 text-sm"
                              placeholder="Название группы"
                              value={newGroupForListener}
                              onChange={(e) => setNewGroupForListener(e.target.value)}
                              onKeyDown={(e) => {
                                if (e.key === "Enter" && newGroupForListener.trim()) {
                                  const g = newGroupForListener.trim();
                                  setAvailableGroups((p) => [...p, g]);
                                  setSelectedListenerGroup(g);
                                  setNewGroup(g);
                                  setNewGroupForListener("");
                                  setShowGroupDropdown(false);
                                }
                              }}
                            />
                            <Button
                              type="button"
                              size="sm"
                              className="gradient-primary text-white rounded-lg h-8 px-3"
                              disabled={!newGroupForListener.trim()}
                              onClick={() => {
                                const g = newGroupForListener.trim();
                                if (!g) return;
                                setAvailableGroups((p) => [...p, g]);
                                setSelectedListenerGroup(g);
                                setNewGroup(g);
                                setNewGroupForListener("");
                                setShowGroupDropdown(false);
                              }}
                            >
                              <Icon name="Plus" size={14} />
                            </Button>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>

                {/* Выбранные курсы */}
                <div className="space-y-1.5">
                  <p className="font-semibold text-sm">Выбранные курсы:</p>
                  <div className="border border-border rounded-xl px-4 py-3 min-h-[52px]">
                    {selectedCourses.length === 0
                      ? <p className="text-muted-foreground text-sm">Пока не выбрано ни одного курса.</p>
                      : <div className="flex flex-wrap gap-1.5">
                          {selectedCourses.map((id) => {
                            const found = courseDirections.flatMap((d) => d.courses).find((c) => c.id === id);
                            return found ? (
                              <span key={id} className="flex items-center gap-1 px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-medium">
                                {found.code} {found.title}
                                <button onClick={() => setSelectedCourses((p) => p.filter((i) => i !== id))} className="hover:text-destructive ml-0.5">×</button>
                              </span>
                            ) : null;
                          })}
                        </div>
                    }
                  </div>
                </div>

                {/* Кнопки */}
                <div className="flex gap-2 justify-end pt-1">
                  <Button variant="outline" className="rounded-xl px-6" onClick={() => { setShowAddUser(false); setShowCoursesPicker(false); }}>Отмена</Button>
                  <Button className="rounded-xl gradient-primary text-white gap-2 px-6" onClick={handleAddUser}>
                    <Icon name="Save" size={15} />
                    Сохранить
                  </Button>
                </div>
              </div>
            </div>

            {/* Боковая панель выбора курсов */}
            <div
              className={`absolute right-0 top-0 h-full w-[640px] bg-background shadow-2xl z-20 flex flex-col transition-transform duration-300 ${showCoursesPicker ? "translate-x-0" : "translate-x-full"}`}
            >
              <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
                <h3 className="font-semibold text-base">Выбор курсов</h3>
                <button onClick={() => setShowCoursesPicker(false)} className="text-muted-foreground hover:text-foreground transition-colors">
                  <Icon name="X" size={18} />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {courseDirections.map((dir) => {
                  const isOpen = openDirections.includes(dir.id);
                  return (
                    <div key={dir.id} className="border-b border-border last:border-0">
                      {/* Заголовок направления */}
                      <button
                        className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${isOpen ? "bg-violet-50 dark:bg-violet-900/20" : "hover:bg-muted/40"}`}
                        onClick={() => toggleDirection(dir.id)}
                      >
                        <span className={`font-semibold text-sm ${isOpen ? "text-violet-700 dark:text-violet-300" : ""}`}>{dir.title}</span>
                        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className={isOpen ? "text-violet-600" : "text-muted-foreground"} />
                      </button>
                      {/* Курсы направления */}
                      {isOpen && (
                        <div>
                          {dir.courses.map((c) => (
                            <div key={c.id} className="flex items-center justify-between px-5 py-3 border-t border-border/60 hover:bg-muted/30 transition-colors">
                              <span className="text-sm text-foreground leading-snug pr-3">
                                <span className="font-medium">{c.code}</span> {c.title}
                              </span>
                              {selectedCourses.includes(c.id)
                                ? <button
                                    className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-red-100 hover:text-red-600 hover:border-red-300 transition-colors"
                                    onClick={() => setSelectedCourses((p) => p.filter((id) => id !== c.id))}
                                  >Выбрано</button>
                                : <button
                                    className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity"
                                    onClick={() => setSelectedCourses((p) => [...p, c.id])}
                                  >Выбрать</button>
                              }
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>

              <div className="p-4 border-t border-border flex-shrink-0">
                <Button className="w-full gradient-primary text-white rounded-xl gap-2" onClick={() => setShowCoursesPicker(false)}>
                  <Icon name="CheckCircle" size={16} />
                  Завершить выбор курсов
                </Button>
              </div>
            </div>
          </div>
        )}

        <Dialog open={showAddGroup} onOpenChange={setShowAddGroup}>
          <DialogContent className="rounded-2xl max-w-sm">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="FolderPlus" size={18} className="text-primary" />
                Новая группа
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label>Название группы</Label>
                <Input
                  placeholder="ИБ-501"
                  value={newGroupName}
                  onChange={(e) => setNewGroupName(e.target.value)}
                  className="rounded-xl"
                />
                {newGroupError && <p className="text-destructive text-xs">{newGroupError}</p>}
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => { setShowAddGroup(false); setNewGroupName(""); setNewGroupError(""); }}>
                  Отмена
                </Button>
                <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={() => {
                  if (!newGroupName.trim()) { setNewGroupError("Введите название"); return; }
                  setShowAddGroup(false);
                  setNewGroupName("");
                  setNewGroupError("");
                }}>
                  Создать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Пользователей", value: users.length, icon: "Users", color: "from-violet-500 to-purple-700" },
            { label: "Курсов доступно", value: 6, icon: "BookOpen", color: "from-cyan-500 to-blue-600" },
            { label: "Назначений активно", value: totalAssignments, icon: "CheckCircle", color: "from-emerald-500 to-teal-600" },
            { label: "Курсов завершено", value: totalCompleted, icon: "Trophy", color: "from-amber-500 to-orange-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl px-4 py-3 border border-border shadow-sm flex items-center gap-3">
              <div className={`w-8 h-8 bg-gradient-to-br ${stat.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon name={stat.icon} size={16} className="text-white" />
              </div>
              <div>
                <p className="text-xl font-bold leading-none">{stat.value}</p>
                <p className="text-muted-foreground text-xs mt-0.5">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        <div className="flex gap-2">
          {([
            { key: "stp", icon: "ShieldAlert", label: "STP Индекс Безопасности" },
            { key: "groups", icon: "UsersRound", label: "Обучение групп" },
            { key: "users", icon: "Users", label: "Индивидуальное обучение" },
            { key: "courses", icon: "BookOpen", label: "Курсы платформы" },
            { key: "reports", icon: "BarChart2", label: "Отчёты" },
            { key: "settings", icon: "Settings", label: "Настройки" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "gradient-primary text-white shadow-md shadow-purple-200"
                  : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <Icon name={tab.icon} size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <AdminUsers
            users={users}
            filteredUsers={filteredUsers}
            search={search}
            setSearch={setSearch}
            selectedUser={selectedUser}
            setSelectedUser={setSelectedUser}
            toggleCourse={toggleCourse}
          />
        )}

        {activeTab === "stp" && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-card rounded-2xl border border-border p-8 flex flex-col items-center justify-center text-center space-y-4">
              <div className="w-14 h-14 icon-bg-violet rounded-2xl flex items-center justify-center">
                <Icon name="FileInput" size={26} className="text-violet-500" />
              </div>
              <div>
                <p className="font-bold text-base">Заявки из STP</p>
                <p className="text-muted-foreground text-sm mt-1">
                  Заявки на обучение будут поступать автоматически после подключения интеграции с STP.
                </p>
              </div>
              <div className="flex items-center gap-2 px-4 py-2 icon-bg-amber border border-amber-200 dark:border-amber-800 rounded-xl">
                <Icon name="Clock" size={14} className="text-amber-500" />
                <span className="text-amber-700 dark:text-amber-400 text-sm font-medium">Ожидает интеграции</span>
              </div>
            </div>
          </div>
        )}

        {activeTab === "groups" && <AdminGroups users={users} />}

        {activeTab === "courses" && <AdminCourses users={users} />}

        {activeTab === "reports" && (
          <div className="bg-card rounded-2xl border border-border p-10 flex flex-col items-center justify-center text-center min-h-[400px] space-y-4">
            <div className="w-16 h-16 icon-bg-emerald rounded-2xl flex items-center justify-center">
              <Icon name="BarChart2" size={28} className="text-emerald-600" />
            </div>
            <div>
              <p className="font-bold text-lg">Отчёты</p>
              <p className="text-muted-foreground text-sm mt-1 max-w-sm">
                Сводные отчёты по обучению: прогресс сотрудников, выполнение планов, статистика по группам и курсам.
              </p>
            </div>
            <div className="flex items-center gap-2 px-4 py-2 icon-bg-amber border border-amber-200 dark:border-amber-800 rounded-xl">
              <Icon name="Clock" size={14} className="text-amber-500" />
              <span className="text-amber-700 dark:text-amber-400 text-sm font-medium">В разработке</span>
            </div>
          </div>
        )}

        {activeTab === "settings" && <AdminSettings />}
      </div>
    </Layout>
  );
}