import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";
import { SystemUser, userRoles, generatePassword } from "./types";

interface UsersPanelProps {
  systemUsers: SystemUser[];
  onUsersChange: (users: SystemUser[]) => void;
  onBack: () => void;
}

const emptyForm = {
  lastName: "",
  firstName: "",
  middleName: "",
  email: "",
  role: "Администратор",
  department: "",
  password: "",
  status: "active" as const,
};

export default function UsersPanel({ systemUsers, onUsersChange, onBack }: UsersPanelProps) {
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  const handleCopyPassword = () => {
    if (!form.password) return;
    navigator.clipboard.writeText(form.password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
  };

  const openAddUser = () => {
    setEditUser(null);
    setForm(emptyForm);
    setErrors({});
    setShowPassword(false);
    setShowAddUser(true);
  };

  const openEditUser = (u: SystemUser) => {
    setEditUser(u);
    setForm({ lastName: u.lastName, firstName: u.firstName, middleName: u.middleName, email: u.email, role: u.role, department: u.department, password: u.password, status: u.status });
    setErrors({});
    setShowPassword(false);
    setShowAddUser(true);
  };

  const handleSaveUser = () => {
    const newErrors: Partial<typeof emptyForm> = {};
    if (!form.lastName.trim()) newErrors.lastName = "Введите фамилию";
    if (!form.firstName.trim()) newErrors.firstName = "Введите имя";
    if (!form.email.trim()) newErrors.email = "Введите email";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) newErrors.email = "Некорректный email";
    if (Object.keys(newErrors).length) { setErrors(newErrors); return; }

    if (editUser) {
      onUsersChange(systemUsers.map((u) => u.id === editUser.id
        ? { ...u, ...form, lastName: form.lastName.trim(), firstName: form.firstName.trim(), middleName: form.middleName.trim() }
        : u));
    } else {
      onUsersChange([...systemUsers, {
        id: Date.now(),
        lastName: form.lastName.trim().toUpperCase(),
        firstName: form.firstName.trim().toUpperCase(),
        middleName: form.middleName.trim().toUpperCase(),
        email: form.email.trim(),
        role: form.role,
        department: form.department.trim(),
        password: form.password,
        status: form.status,
        registeredAt: new Date().toLocaleDateString("ru-RU"),
      }]);
    }
    setShowAddUser(false);
  };

  const f = (key: keyof typeof emptyForm) => (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm((p) => ({ ...p, [key]: e.target.value }));
    setErrors((p) => ({ ...p, [key]: undefined }));
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
          <Icon name="ChevronLeft" size={16} />
          Настройки
        </button>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm font-medium">Пользователи системы</span>
      </div>

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Icon name="UserCog" size={16} className="text-white" />
            </div>
            <h2 className="font-bold text-base">Пользователи системы</h2>
          </div>
          <Button className="gradient-primary text-white rounded-xl gap-2 shadow-md shadow-purple-200" onClick={openAddUser}>
            <Icon name="Plus" size={15} />
            Добавить пользователя
          </Button>
        </div>

        <div className="p-4 grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-3">
          {systemUsers.map((u) => (
            <div key={u.id} className="bg-background border border-border rounded-xl p-4 flex flex-col gap-3 hover:border-violet-300 dark:hover:border-violet-700 transition-colors">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-white font-bold text-sm">
                    {(u.firstName[0] || "") + (u.lastName[0] || "")}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm truncate">{`${u.lastName} ${u.firstName} ${u.middleName}`.trim()}</p>
                  <p className="text-muted-foreground text-xs truncate">{u.email}</p>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-md text-xs font-medium">{u.role}</span>
                  <span className={`px-2 py-0.5 rounded-md text-xs font-medium ${u.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                    {u.status === "active" ? "Активен" : "Неактивен"}
                  </span>
                </div>
                <Button size="sm" variant="outline" className="h-7 w-7 p-0 rounded-lg" onClick={() => openEditUser(u)}>
                  <Icon name="Pencil" size={13} />
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">Зарегистрирован: {u.registeredAt}</p>
            </div>
          ))}
        </div>
      </div>

      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="UserPlus" size={18} className="text-primary" />
              {editUser ? "Редактировать пользователя" : "Новый пользователь системы"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-3 gap-3">
              <div className="space-y-1.5">
                <Label>Фамилия <span className="text-destructive">*</span></Label>
                <Input className="rounded-xl" placeholder="Иванов" value={form.lastName} onChange={f("lastName")} />
                {errors.lastName && <p className="text-destructive text-xs">{errors.lastName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Имя <span className="text-destructive">*</span></Label>
                <Input className="rounded-xl" placeholder="Иван" value={form.firstName} onChange={f("firstName")} />
                {errors.firstName && <p className="text-destructive text-xs">{errors.firstName}</p>}
              </div>
              <div className="space-y-1.5">
                <Label>Отчество</Label>
                <Input className="rounded-xl" placeholder="Иванович" value={form.middleName} onChange={f("middleName")} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input className="rounded-xl" placeholder="user@isp.ru" value={form.email} onChange={f("email")} />
              {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Подразделение</Label>
              <Input className="rounded-xl" placeholder="Отдел информационной безопасности" value={form.department} onChange={f("department")} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Роль</Label>
                <Select value={form.role} onValueChange={(v) => setForm((p) => ({ ...p, role: v }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{userRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>Статус</Label>
                <Select value={form.status} onValueChange={(v) => setForm((p) => ({ ...p, status: v as "active" | "inactive" }))}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Активен</SelectItem>
                    <SelectItem value="inactive">Неактивен</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Пароль</Label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Input
                    className="rounded-xl pr-10"
                    type={showPassword ? "text" : "password"}
                    placeholder="Введите или сгенерируйте пароль"
                    value={form.password}
                    onChange={f("password")}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                    onClick={() => setShowPassword((p) => !p)}
                  >
                    <Icon name={showPassword ? "EyeOff" : "Eye"} size={16} />
                  </button>
                </div>
                <Button type="button" variant="outline" className="rounded-xl gap-1.5 flex-shrink-0" onClick={handleCopyPassword} disabled={!form.password} title="Скопировать пароль">
                  {copiedPassword ? <Icon name="Check" size={14} className="text-emerald-500" /> : <Icon name="Copy" size={14} />}
                </Button>
                <Button type="button" variant="outline" className="rounded-xl gap-1.5 flex-shrink-0" onClick={() => setForm((p) => ({ ...p, password: generatePassword() }))}>
                  <Icon name="RefreshCw" size={14} />
                  Сгенерировать
                </Button>
              </div>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddUser(false)}>Отменить</Button>
              <Button className="flex-1 rounded-xl gradient-primary text-white gap-2" onClick={handleSaveUser}>
                <Icon name="UserPlus" size={15} />
                {editUser ? "Сохранить" : "Создать"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
