import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Icon from "@/components/ui/icon";

type OrgType = "Юридическое лицо" | "ИП" | "Физическое лицо";
type OpfType = "ООО" | "АО" | "ПАО" | "ГБУ" | "ФГБУ" | "ИП";

interface OrgData {
  type: OrgType;
  opf: OpfType;
  name: string;
  externalId: string;
  inn: string;
  licenseNo: string;
  licenseDate: string;
}

interface SystemUser {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
  email: string;
  role: string;
  department: string;
  password: string;
  status: "active" | "inactive";
  registeredAt: string;
}

const defaultOrg: OrgData = {
  type: "Юридическое лицо",
  opf: "ООО",
  name: 'ООО "УЦ ИСП"',
  externalId: "d2e6fe38-5531-4384-be5a-e93bf83a8c83",
  inn: "9000000001",
  licenseNo: "9999",
  licenseDate: "09.02.2026",
};

const defaultUsers: SystemUser[] = [
  {
    id: 1,
    lastName: "ИВАНОВ",
    firstName: "ИВАН",
    middleName: "ИВАНОВИЧ",
    email: "admin@isp.ru",
    role: "Администратор",
    department: "",
    password: "",
    status: "active",
    registeredAt: "09.02.2026",
  },
];

const orgTypes: OrgType[] = ["Юридическое лицо", "ИП", "Физическое лицо"];
const opfTypes: OpfType[] = ["ООО", "АО", "ПАО", "ГБУ", "ФГБУ", "ИП"];
const userRoles = ["Администратор", "Менеджер", "Преподаватель", "Наблюдатель"];

function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export default function AdminSettings() {
  const [org, setOrg] = useState<OrgData>(defaultOrg);
  const [editOrg, setEditOrg] = useState(false);
  const [orgDraft, setOrgDraft] = useState<OrgData>(defaultOrg);
  const [copied, setCopied] = useState(false);

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(defaultUsers);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);

  const emptyForm = { lastName: "", firstName: "", middleName: "", email: "", role: "Администратор", department: "", password: "", status: "active" as const };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  const handleCopy = () => {
    navigator.clipboard.writeText(org.externalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveOrg = () => { setOrg(orgDraft); setEditOrg(false); };

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

    const fullName = `${form.lastName.trim()} ${form.firstName.trim()}${form.middleName.trim() ? " " + form.middleName.trim() : ""}`.toUpperCase();

    if (editUser) {
      setSystemUsers((prev) => prev.map((u) => u.id === editUser.id
        ? { ...u, ...form, lastName: form.lastName.trim(), firstName: form.firstName.trim(), middleName: form.middleName.trim() }
        : u));
    } else {
      setSystemUsers((prev) => [...prev, {
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
    <div className="space-y-6">
      {/* Данные организации */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border">
          <h2 className="font-bold text-base">Данные учебного центра / организации</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["Тип организации", "ОПФ", "Наименование", "Внешний ID", "ИНН", "№ лицензии", "Дата лицензии", "Действия"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-border last:border-0">
                <td className="px-4 py-3 whitespace-nowrap">{org.type}</td>
                <td className="px-4 py-3 whitespace-nowrap">{org.opf}</td>
                <td className="px-4 py-3 whitespace-nowrap font-medium">{org.name}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-xs text-muted-foreground truncate max-w-[180px]">{org.externalId}</span>
                    <Button size="sm" variant="outline" className="h-7 px-2 text-xs rounded-lg flex-shrink-0 gap-1" onClick={handleCopy}>
                      {copied ? <Icon name="Check" size={12} className="text-emerald-500" /> : <Icon name="Copy" size={12} />}
                      {copied ? "Скопировано" : "Скопировать"}
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono">{org.inn}</td>
                <td className="px-4 py-3 whitespace-nowrap">{org.licenseNo}</td>
                <td className="px-4 py-3 whitespace-nowrap">{org.licenseDate}</td>
                <td className="px-4 py-3">
                  <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg" onClick={() => { setOrgDraft(org); setEditOrg(true); }}>
                    <Icon name="Pencil" size={14} />
                  </Button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Пользователи системы */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-6 py-4 border-b border-border flex items-center justify-between">
          <h2 className="font-bold text-base">Пользователи системы</h2>
          <Button className="gradient-primary text-white rounded-xl gap-2 shadow-md shadow-purple-200" onClick={openAddUser}>
            <Icon name="Plus" size={15} />
            Добавить пользователя
          </Button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                {["ФИО", "Email", "Роль", "Статус", "Дата регистрации", "Действия"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {systemUsers.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{`${u.lastName} ${u.firstName} ${u.middleName}`.trim()}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-medium">{u.role}</span>
                  </td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${u.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                      {u.status === "active" ? "Активен" : "Неактивен"}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.registeredAt}</td>
                  <td className="px-4 py-3">
                    <Button size="sm" variant="outline" className="h-8 w-8 p-0 rounded-lg" onClick={() => openEditUser(u)}>
                      <Icon name="Pencil" size={14} />
                    </Button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Диалог редактирования организации */}
      <Dialog open={editOrg} onOpenChange={setEditOrg}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="Building2" size={18} className="text-primary" />
              Данные организации
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>Тип организации</Label>
                <Select value={orgDraft.type} onValueChange={(v) => setOrgDraft({ ...orgDraft, type: v as OrgType })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{orgTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label>ОПФ</Label>
                <Select value={orgDraft.opf} onValueChange={(v) => setOrgDraft({ ...orgDraft, opf: v as OpfType })}>
                  <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                  <SelectContent>{opfTypes.map((t) => <SelectItem key={t} value={t}>{t}</SelectItem>)}</SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Наименование</Label>
              <Input className="rounded-xl" value={orgDraft.name} onChange={(e) => setOrgDraft({ ...orgDraft, name: e.target.value })} />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1.5">
                <Label>ИНН</Label>
                <Input className="rounded-xl" value={orgDraft.inn} onChange={(e) => setOrgDraft({ ...orgDraft, inn: e.target.value })} />
              </div>
              <div className="space-y-1.5">
                <Label>№ лицензии</Label>
                <Input className="rounded-xl" value={orgDraft.licenseNo} onChange={(e) => setOrgDraft({ ...orgDraft, licenseNo: e.target.value })} />
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Дата лицензии</Label>
              <Input className="rounded-xl" value={orgDraft.licenseDate} onChange={(e) => setOrgDraft({ ...orgDraft, licenseDate: e.target.value })} placeholder="дд.мм.гггг" />
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setEditOrg(false)}>Отмена</Button>
              <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={handleSaveOrg}>Сохранить</Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Диалог добавления/редактирования пользователя */}
      <Dialog open={showAddUser} onOpenChange={setShowAddUser}>
        <DialogContent className="rounded-2xl max-w-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="UserPlus" size={18} className="text-primary" />
              {editUser ? "Редактировать пользователя" : "Новый пользователь системы"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            {/* ФИО */}
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

            {/* Email */}
            <div className="space-y-1.5">
              <Label>Email <span className="text-destructive">*</span></Label>
              <Input className="rounded-xl" placeholder="user@isp.ru" value={form.email} onChange={f("email")} />
              {errors.email && <p className="text-destructive text-xs">{errors.email}</p>}
            </div>

            {/* Подразделение */}
            <div className="space-y-1.5">
              <Label>Подразделение</Label>
              <Input className="rounded-xl" placeholder="Отдел информационной безопасности" value={form.department} onChange={f("department")} />
            </div>

            {/* Роль и статус */}
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

            {/* Пароль */}
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
                <Button
                  type="button"
                  variant="outline"
                  className="rounded-xl gap-1.5 flex-shrink-0"
                  onClick={() => setForm((p) => ({ ...p, password: generatePassword() }))}
                >
                  <Icon name="RefreshCw" size={14} />
                  Сгенерировать
                </Button>
              </div>
            </div>

            {/* Кнопки */}
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
