import { useState } from "react";
import Layout from "@/components/layout/Layout";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";

const allCourses = [
  { id: 1, title: "Основы информационной безопасности", category: "ИБ", emoji: "🔐", lessons: 18, duration: "24 ч" },
  { id: 2, title: "Сетевая безопасность и протоколы", category: "Сети", emoji: "🌐", lessons: 14, duration: "18 ч" },
  { id: 3, title: "Этичный хакинг и пентест", category: "Пентест", emoji: "🎯", lessons: 22, duration: "30 ч" },
  { id: 4, title: "Управление рисками ИБ", category: "Менеджмент", emoji: "📊", lessons: 12, duration: "16 ч" },
  { id: 5, title: "Криптография и шифрование", category: "Криптография", emoji: "🔑", lessons: 16, duration: "20 ч" },
  { id: 6, title: "SOC и мониторинг безопасности", category: "SOC", emoji: "🛡️", lessons: 20, duration: "28 ч" },
];

type CourseAssignment = {
  courseId: number;
  active: boolean;
  progress: number;
  assignedAt: string;
};

type User = {
  id: number;
  name: string;
  email: string;
  initials: string;
  group: string;
  role: string;
  assignments: CourseAssignment[];
};

const initialUsers: User[] = [
  {
    id: 1,
    name: "Алина Иванова",
    email: "alina.ivanova@company.ru",
    initials: "АИ",
    group: "ИБ-301",
    role: "Студент",
    assignments: [
      { courseId: 1, active: true, progress: 65, assignedAt: "01.01.2025" },
      { courseId: 2, active: true, progress: 30, assignedAt: "15.01.2025" },
    ],
  },
  {
    id: 2,
    name: "Дмитрий Смирнов",
    email: "d.smirnov@company.ru",
    initials: "ДС",
    group: "ИБ-301",
    role: "Студент",
    assignments: [
      { courseId: 1, active: true, progress: 100, assignedAt: "01.01.2025" },
      { courseId: 3, active: false, progress: 0, assignedAt: "10.02.2025" },
    ],
  },
  {
    id: 3,
    name: "Мария Козлова",
    email: "m.kozlova@company.ru",
    initials: "МК",
    group: "ИБ-302",
    role: "Студент",
    assignments: [
      { courseId: 4, active: true, progress: 45, assignedAt: "05.02.2025" },
    ],
  },
  {
    id: 4,
    name: "Иван Петров",
    email: "i.petrov@company.ru",
    initials: "ИП",
    group: "ИБ-302",
    role: "Студент",
    assignments: [],
  },
];

const gradients = [
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-600",
  "from-red-500 to-rose-700",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-700",
];

const userColors = [
  "from-violet-400 to-purple-600",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
];

const groups = ["ИБ-301", "ИБ-302", "ИБ-303", "ИБ-401", "ИБ-402"];
const roles = ["Студент", "Преподаватель", "Наблюдатель"];

function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export default function Admin() {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [search, setSearch] = useState("");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"users" | "courses">("users");
  const [showAddUser, setShowAddUser] = useState(false);
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
              {
                courseId,
                active: true,
                progress: 0,
                assignedAt: new Date().toLocaleDateString("ru-RU"),
              },
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
            {
              courseId,
              active: true,
              progress: 0,
              assignedAt: new Date().toLocaleDateString("ru-RU"),
            },
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
          <Button
            className="gradient-primary text-white rounded-xl shadow-md shadow-purple-200 gap-2"
            onClick={() => setShowAddUser(true)}
          >
            <Icon name="UserPlus" size={16} />
            Добавить пользователя
          </Button>
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
                  placeholder="Иванов Иван Иванович"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="rounded-xl"
                />
                {nameError && <p className="text-destructive text-xs">{nameError}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  placeholder="ivanov@company.ru"
                  value={newEmail}
                  onChange={(e) => setNewEmail(e.target.value)}
                  className="rounded-xl"
                  type="email"
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

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Пользователей", value: users.length, icon: "Users", color: "from-violet-500 to-purple-700" },
            { label: "Курсов доступно", value: allCourses.length, icon: "BookOpen", color: "from-cyan-500 to-blue-600" },
            { label: "Назначений активно", value: totalAssignments, icon: "CheckCircle", color: "from-emerald-500 to-teal-600" },
            { label: "Курсов завершено", value: totalCompleted, icon: "Trophy", color: "from-amber-500 to-orange-600" },
          ].map((stat) => (
            <div key={stat.label} className="bg-white rounded-2xl p-4 border border-border shadow-sm">
              <div className={`w-9 h-9 bg-gradient-to-br ${stat.color} rounded-xl flex items-center justify-center mb-3`}>
                <Icon name={stat.icon} size={18} className="text-white" />
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-muted-foreground text-xs mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Вкладки */}
        <div className="flex gap-2">
          {([
            { key: "users", icon: "Users", label: "Пользователи" },
            { key: "courses", icon: "BookOpen", label: "Обзор курсов" },
          ] as const).map((tab) => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key)}
              className={`flex flex-col items-center gap-1 px-6 py-3 rounded-xl text-xs font-medium transition-all ${
                activeTab === tab.key
                  ? "gradient-primary text-white shadow-md shadow-purple-200"
                  : "bg-white border border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              <Icon name={tab.icon} size={20} />
              {tab.label}
            </button>
          ))}
        </div>

        {activeTab === "users" && (
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-5">
            {/* Список пользователей */}
            <div className="lg:col-span-2 space-y-3">
              <div className="relative">
                <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Поиск пользователей..."
                  className="pl-9 rounded-xl text-sm"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                />
              </div>

              <div className="space-y-2">
                {filteredUsers.map((user, idx) => (
                  <div
                    key={user.id}
                    onClick={() => setSelectedUser(user)}
                    className={`bg-white rounded-2xl p-4 border cursor-pointer transition-all hover:shadow-md ${
                      selectedUser?.id === user.id
                        ? "border-primary shadow-md shadow-purple-100"
                        : "border-border"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 bg-gradient-to-br ${userColors[idx % userColors.length]} rounded-xl flex items-center justify-center flex-shrink-0`}
                      >
                        <span className="text-white font-bold text-xs">{user.initials}</span>
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm truncate">{user.name}</p>
                        <p className="text-muted-foreground text-xs truncate">{user.email}</p>
                      </div>
                      <div className="text-right flex-shrink-0">
                        <Badge variant="secondary" className="text-xs">{user.group}</Badge>
                        <p className="text-muted-foreground text-xs mt-1">
                          {user.assignments.filter((a) => a.active).length} курс.
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Детали пользователя */}
            <div className="lg:col-span-3">
              {selectedUser ? (
                <div className="bg-white rounded-2xl border border-border p-5 space-y-5">
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
                    <p className="font-semibold text-sm mb-3 text-muted-foreground uppercase tracking-wide">
                      Назначение курсов
                    </p>
                    <div className="space-y-2">
                      {allCourses.map((course, idx) => {
                        const assignment = selectedUser.assignments.find((a) => a.courseId === course.id);
                        const isAssigned = !!assignment;
                        const isActive = assignment?.active ?? false;

                        return (
                          <div
                            key={course.id}
                            className="flex items-center gap-3 p-3 rounded-xl border border-border hover:bg-muted/30 transition-all"
                          >
                            <div
                              className={`w-9 h-9 bg-gradient-to-br ${gradients[idx]} rounded-xl flex items-center justify-center flex-shrink-0 text-base`}
                            >
                              {course.emoji}
                            </div>
                            <div className="flex-1 min-w-0">
                              <p className="font-medium text-sm truncate">{course.title}</p>
                              {isAssigned && (
                                <div className="flex items-center gap-2 mt-0.5">
                                  <div className="flex-1 h-1.5 bg-muted rounded-full overflow-hidden">
                                    <div
                                      className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
                                      style={{ width: `${assignment!.progress}%` }}
                                    />
                                  </div>
                                  <span className="text-xs text-muted-foreground">{assignment!.progress}%</span>
                                </div>
                              )}
                            </div>
                            <div className="flex-shrink-0">
                              {!isAssigned ? (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs rounded-lg"
                                  onClick={() => toggleCourse(selectedUser.id, course.id)}
                                >
                                  <Icon name="Plus" size={14} className="mr-1" />
                                  Назначить
                                </Button>
                              ) : isActive ? (
                                <Button
                                  size="sm"
                                  className="h-8 text-xs rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white"
                                  onClick={() => toggleCourse(selectedUser.id, course.id)}
                                >
                                  <Icon name="CheckCircle" size={14} className="mr-1" />
                                  Активен
                                </Button>
                              ) : (
                                <Button
                                  size="sm"
                                  variant="outline"
                                  className="h-8 text-xs rounded-lg text-muted-foreground"
                                  onClick={() => toggleCourse(selectedUser.id, course.id)}
                                >
                                  <Icon name="PauseCircle" size={14} className="mr-1" />
                                  Отключён
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
                <div className="bg-white rounded-2xl border border-border p-10 flex flex-col items-center justify-center text-center h-full min-h-[300px]">
                  <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center mb-4">
                    <Icon name="UserSearch" size={24} className="text-muted-foreground" />
                  </div>
                  <p className="font-semibold text-foreground">Выберите пользователя</p>
                  <p className="text-muted-foreground text-sm mt-1">
                    Нажмите на пользователя слева, чтобы управлять его курсами
                  </p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === "courses" && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {allCourses.map((course, idx) => {
              const enrolled = users.filter((u) =>
                u.assignments.some((a) => a.courseId === course.id && a.active)
              );
              const completed = users.filter((u) =>
                u.assignments.some((a) => a.courseId === course.id && a.progress === 100)
              );
              const avgProgress =
                enrolled.length > 0
                  ? Math.round(
                      enrolled.reduce((sum, u) => {
                        const a = u.assignments.find((a) => a.courseId === course.id);
                        return sum + (a?.progress ?? 0);
                      }, 0) / enrolled.length
                    )
                  : 0;

              return (
                <div key={course.id} className="bg-white rounded-2xl border border-border p-4 space-y-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 bg-gradient-to-br ${gradients[idx]} rounded-xl flex items-center justify-center text-xl`}
                    >
                      {course.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-semibold text-sm leading-tight truncate">{course.title}</p>
                      <Badge variant="secondary" className="text-xs mt-0.5">{course.category}</Badge>
                    </div>
                  </div>

                  <div className="space-y-1.5 text-sm">
                    <div className="flex justify-between text-muted-foreground">
                      <span>Слушателей</span>
                      <span className="font-medium text-foreground">{enrolled.length}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Завершили</span>
                      <span className="font-medium text-foreground">{completed.length}</span>
                    </div>
                    <div className="flex justify-between text-muted-foreground">
                      <span>Средний прогресс</span>
                      <span className="font-medium text-foreground">{avgProgress}%</span>
                    </div>
                  </div>

                  {enrolled.length > 0 && (
                    <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                      <div
                        className={`h-full bg-gradient-to-r ${gradients[idx]} rounded-full`}
                        style={{ width: `${avgProgress}%` }}
                      />
                    </div>
                  )}

                  {enrolled.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {enrolled.map((u, i) => (
                        <div
                          key={u.id}
                          title={u.name}
                          className={`w-7 h-7 bg-gradient-to-br ${userColors[i % userColors.length]} rounded-lg flex items-center justify-center`}
                        >
                          <span className="text-white font-bold text-[10px]">{u.initials}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </Layout>
  );
}