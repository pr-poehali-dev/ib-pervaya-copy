import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { User, initialUsers, groups, roles, getInitials } from "@/components/admin/types";
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
  const [newName, setNewName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [newGroup, setNewGroup] = useState("ИБ-301");
  const [newRole, setNewRole] = useState("Студент");
  const [nameError, setNameError] = useState("");
  const [emailError, setEmailError] = useState("");

  const handleAddUser = () => {
    let valid = true;
    if (!newName.trim()) { setNameError("Введите имя"); valid = false; } else setNameError("");
    if (!newEmail.trim()) { setEmailError("Введите email"); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(newEmail)) { setEmailError("Некорректный email"); valid = false; }
    else setEmailError("");
    if (!valid) return;

    const newUser: User = {
      id: Date.now(),
      name: newName.trim(),
      email: newEmail.trim(),
      initials: getInitials(newName),
      group: newGroup,
      role: newRole,
      assignments: [],
    };
    setUsers((prev) => [...prev, newUser]);
    setShowAddUser(false);
    setNewName("");
    setNewEmail("");
    setNewGroup("ИБ-301");
    setNewRole("Студент");
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
              Добавить пользователя
            </Button>
          </div>
        </div>

        <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
          <DialogContent className="rounded-2xl max-w-md">
            <DialogHeader>
              <DialogTitle className="flex items-center gap-2">
                <Icon name="UserPlus" size={18} className="text-primary" />
                Новый пользователь
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 pt-1">
              <div className="space-y-1.5">
                <Label>Полное имя</Label>
                <Input
                  placeholder="Иван Иванов"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-xl"
                />
                {nameError && <p className="text-destructive text-xs">{nameError}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  placeholder="ivan@company.ru"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="rounded-xl"
                />
                {emailError && <p className="text-destructive text-xs">{emailError}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Группа</Label>
                  <Select value={newGroup} onValueChange={setNewGroup}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {groups.map((g) => (
                        <SelectItem key={g} value={g}>{g}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-1.5">
                  <Label>Роль</Label>
                  <Select value={newRole} onValueChange={setNewRole}>
                    <SelectTrigger className="rounded-xl">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {roles.map((r) => (
                        <SelectItem key={r} value={r}>{r}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="flex gap-2 pt-1">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddUser(false)}>
                  Отмена
                </Button>
                <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={handleAddUser}>
                  Создать
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

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