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

type ActivePanel = null | "org" | "users" | "email";

export default function AdminSettings() {
  const [activePanel, setActivePanel] = useState<ActivePanel>(null);

  const [org, setOrg] = useState<OrgData>(defaultOrg);
  const [editOrg, setEditOrg] = useState(false);
  const [orgDraft, setOrgDraft] = useState<OrgData>(defaultOrg);
  const [copied, setCopied] = useState(false);

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(defaultUsers);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const [copiedPassword, setCopiedPassword] = useState(false);

  const emptyForm = { lastName: "", firstName: "", middleName: "", email: "", role: "Администратор", department: "", password: "", status: "active" as const };
  const [form, setForm] = useState(emptyForm);
  const [errors, setErrors] = useState<Partial<typeof emptyForm>>({});

  // Email настройки
  const [emailSettings, setEmailSettings] = useState({
    hrEmail: "gts@supmin.ru",
    senderEmail: "admin@supmin.ru",
    copyToAdmin: true,
    smtpHost: "smtp.yandex.ru",
    smtpPort: "587",
    smtpUser: "admin@supmin.ru",
    smtpPassword: "",
    smtpFromEmail: "admin@supmin.ru",
    smtpTimeout: "30",
    useTls: true,
    useSsl: false,
  });
  const [emailSaved, setEmailSaved] = useState(false);
  const [smtpSaved, setSmtpSaved] = useState(false);
  const [showSmtpPassword, setShowSmtpPassword] = useState(false);
  const [testEmail, setTestEmail] = useState("");
  const [testSubject, setTestSubject] = useState("Тест SMTP");
  const [testSent, setTestSent] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<string | null>(null);

  const emailTemplates = [
    { id: "90days", title: "За 90 дней до истечения", desc: "Первое напоминание о плановой аттестации" },
    { id: "30days", title: "За 30 дней до истечения", desc: "Второе напоминание о плановой аттестации" },
    { id: "7days", title: "За 7 дней до истечения", desc: "Срочное напоминание об аттестации" },
    { id: "expired", title: "Истечение срока", desc: "Уведомление об истечении срока аттестации" },
  ];

  const handleCopy = () => {
    navigator.clipboard.writeText(org.externalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleCopyPassword = () => {
    if (!form.password) return;
    navigator.clipboard.writeText(form.password);
    setCopiedPassword(true);
    setTimeout(() => setCopiedPassword(false), 2000);
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
      {/* Карточки — главный экран */}
      {activePanel === null && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {/* Карточка: Данные организации */}
          <div
            className="bg-card rounded-2xl border border-border p-6 cursor-pointer hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100 dark:hover:shadow-violet-900/20 transition-all duration-200 group"
            onClick={() => setActivePanel("org")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
                <Icon name="Building2" size={22} className="text-white" />
              </div>
              <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-violet-500 transition-colors mt-1" />
            </div>
            <h3 className="font-bold text-base mb-1">Данные учебного центра</h3>
            <p className="text-muted-foreground text-sm mb-4">Реквизиты организации, лицензия, внешний ID</p>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Организация</span>
                <span className="text-sm font-medium truncate">{org.name}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-24 flex-shrink-0">ИНН</span>
                <span className="text-sm font-mono">{org.inn}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-24 flex-shrink-0">Лицензия №</span>
                <span className="text-sm">{org.licenseNo} до {org.licenseDate}</span>
              </div>
            </div>
          </div>

          {/* Карточка: Пользователи системы */}
          <div
            className="bg-card rounded-2xl border border-border p-6 cursor-pointer hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100 dark:hover:shadow-violet-900/20 transition-all duration-200 group"
            onClick={() => setActivePanel("users")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
                <Icon name="UserCog" size={22} className="text-white" />
              </div>
              <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-violet-500 transition-colors mt-1" />
            </div>
            <h3 className="font-bold text-base mb-1">Пользователи системы</h3>
            <p className="text-muted-foreground text-sm mb-4">Управление учётными записями администраторов</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-violet-600">{systemUsers.length}</p>
                <p className="text-xs text-muted-foreground">Всего</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-emerald-600">{systemUsers.filter((u) => u.status === "active").length}</p>
                <p className="text-xs text-muted-foreground">Активных</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-muted-foreground">{systemUsers.filter((u) => u.status === "inactive").length}</p>
                <p className="text-xs text-muted-foreground">Неактивных</p>
              </div>
            </div>
          </div>

          {/* Карточка: Настройка электронной почты */}
          <div
            className="bg-card rounded-2xl border border-border p-6 cursor-pointer hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100 dark:hover:shadow-violet-900/20 transition-all duration-200 group"
            onClick={() => setActivePanel("email")}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center">
                <Icon name="Mail" size={22} className="text-white" />
              </div>
              <Icon name="ChevronRight" size={18} className="text-muted-foreground group-hover:text-violet-500 transition-colors mt-1" />
            </div>
            <h3 className="font-bold text-base mb-1">Настройка электронной почты</h3>
            <p className="text-muted-foreground text-sm mb-4">SMTP, уведомления и шаблоны писем</p>
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-28 flex-shrink-0">SMTP-хост</span>
                <span className="text-sm font-medium truncate">{emailSettings.smtpHost}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-28 flex-shrink-0">Email HR</span>
                <span className="text-sm truncate">{emailSettings.hrEmail}</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground w-28 flex-shrink-0">Шаблонов</span>
                <span className="text-sm font-medium">{emailTemplates.length}</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Панель: Данные организации */}
      {activePanel === "org" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setActivePanel(null)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <Icon name="ChevronLeft" size={16} />
              Настройки
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Данные учебного центра</span>
          </div>

          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <div className="px-6 py-4 border-b border-border flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <Icon name="Building2" size={16} className="text-white" />
                </div>
                <h2 className="font-bold text-base">Данные учебного центра / организации</h2>
              </div>
              <Button variant="outline" className="rounded-xl gap-2" onClick={() => { setOrgDraft(org); setEditOrg(true); }}>
                <Icon name="Pencil" size={15} />
                Редактировать
              </Button>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-5">
              {[
                { label: "Тип организации", value: org.type },
                { label: "ОПФ", value: org.opf },
                { label: "Наименование", value: org.name },
                { label: "ИНН", value: org.inn },
                { label: "№ лицензии", value: org.licenseNo },
                { label: "Дата лицензии", value: org.licenseDate },
              ].map((item) => (
                <div key={item.label} className="space-y-1">
                  <p className="text-xs text-muted-foreground">{item.label}</p>
                  <p className="font-medium text-sm">{item.value}</p>
                </div>
              ))}
              <div className="md:col-span-2 space-y-1">
                <p className="text-xs text-muted-foreground">Внешний ID</p>
                <div className="flex items-center gap-2">
                  <p className="font-mono text-sm text-muted-foreground">{org.externalId}</p>
                  <Button size="sm" variant="outline" className="h-7 px-2 text-xs rounded-lg gap-1 flex-shrink-0" onClick={handleCopy}>
                    {copied ? <Icon name="Check" size={12} className="text-emerald-500" /> : <Icon name="Copy" size={12} />}
                    {copied ? "Скопировано" : "Скопировать"}
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Панель: Пользователи системы */}
      {activePanel === "users" && (
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <button onClick={() => setActivePanel(null)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
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

            {/* Карточки пользователей */}
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
        </div>
      )}

      {/* Панель: Настройка электронной почты */}
      {activePanel === "email" && (
        <div className="space-y-5">
          <div className="flex items-center gap-3">
            <button onClick={() => setActivePanel(null)} className="flex items-center gap-1.5 text-muted-foreground hover:text-foreground transition-colors text-sm">
              <Icon name="ChevronLeft" size={16} />
              Настройки
            </button>
            <span className="text-muted-foreground">/</span>
            <span className="text-sm font-medium">Настройка электронной почты</span>
          </div>

          {/* Секция 1: Email уведомлений */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
            <h3 className="font-bold text-base">Настройки email уведомлений</h3>

            <div className="space-y-1.5">
              <Label>Email отдела кадров (HR)</Label>
              <Input className="rounded-xl" value={emailSettings.hrEmail} onChange={(e) => setEmailSettings((p) => ({ ...p, hrEmail: e.target.value }))} />
              <p className="text-xs text-emerald-600 dark:text-emerald-400">На этот адрес будут приходить все критичные уведомления</p>
            </div>

            <div className="space-y-1.5">
              <Label>Email отправителя</Label>
              <Input className="rounded-xl" value={emailSettings.senderEmail} onChange={(e) => setEmailSettings((p) => ({ ...p, senderEmail: e.target.value }))} />
              <p className="text-xs text-muted-foreground">От имени этого адреса отправляются уведомления</p>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setEmailSettings((p) => ({ ...p, copyToAdmin: !p.copyToAdmin }))}
                className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${emailSettings.copyToAdmin ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
              >
                <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailSettings.copyToAdmin ? "translate-x-5" : ""}`} />
              </button>
              <div>
                <p className="text-sm font-medium">Копия администратору</p>
                <p className="text-xs text-muted-foreground">Отправлять копию всех уведомлений администратору системы</p>
              </div>
            </div>

            <div className="border-t border-border pt-5 space-y-3">
              <h4 className="font-semibold text-sm">Шаблоны писем</h4>
              <div className="border border-border rounded-xl overflow-hidden">
                {emailTemplates.map((t, i) => (
                  <div key={t.id} className={`flex items-center justify-between px-4 py-3.5 hover:bg-muted/30 transition-colors ${i > 0 ? "border-t border-border" : ""}`}>
                    <div>
                      <p className="text-sm font-medium">{t.title}</p>
                      <p className="text-xs text-muted-foreground">{t.desc}</p>
                    </div>
                    <button
                      className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
                      onClick={() => setEditingTemplate(t.id)}
                    >
                      <Icon name="SquarePen" size={14} />
                      Изменить
                    </button>
                  </div>
                ))}
              </div>
            </div>

            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2"
              onClick={() => { setEmailSaved(true); setTimeout(() => setEmailSaved(false), 2000); }}
            >
              {emailSaved ? <Icon name="Check" size={15} /> : <Icon name="Save" size={15} />}
              {emailSaved ? "Сохранено!" : "Сохранить настройки"}
            </Button>
          </div>

          {/* Секция 2: SMTP */}
          <div className="bg-card rounded-2xl border border-border p-6 space-y-5">
            <h3 className="font-bold text-base">Исходящая почта (SMTP)</h3>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <Label>SMTP-хост</Label>
                <Input className="rounded-xl" value={emailSettings.smtpHost} onChange={(e) => setEmailSettings((p) => ({ ...p, smtpHost: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>SMTP-порт</Label>
                <Input className="rounded-xl" value={emailSettings.smtpPort} onChange={(e) => setEmailSettings((p) => ({ ...p, smtpPort: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Пользователь SMTP</Label>
                <Input className="rounded-xl" value={emailSettings.smtpUser} onChange={(e) => setEmailSettings((p) => ({ ...p, smtpUser: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Пароль SMTP</Label>
                <div className="relative">
                  <Input className="rounded-xl pr-10" type={showSmtpPassword ? "text" : "password"} value={emailSettings.smtpPassword} onChange={(e) => setEmailSettings((p) => ({ ...p, smtpPassword: e.target.value }))} />
                  <button type="button" className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground" onClick={() => setShowSmtpPassword((p) => !p)}>
                    <Icon name={showSmtpPassword ? "EyeOff" : "Eye"} size={16} />
                  </button>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label>Email отправителя</Label>
                <Input className="rounded-xl" value={emailSettings.smtpFromEmail} onChange={(e) => setEmailSettings((p) => ({ ...p, smtpFromEmail: e.target.value }))} />
              </div>
              <div className="space-y-1.5">
                <Label>Таймаут (сек.)</Label>
                <Input className="rounded-xl" value={emailSettings.smtpTimeout} onChange={(e) => setEmailSettings((p) => ({ ...p, smtpTimeout: e.target.value }))} />
              </div>
            </div>

            <div className="space-y-3">
              {[
                { key: "useTls" as const, label: "Использовать TLS", desc: "TLS применяется для шифрования соединения." },
                { key: "useSsl" as const, label: "Использовать SSL", desc: "При включённом SSL TLS не используется автоматически." },
              ].map((item) => (
                <div key={item.key} className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => setEmailSettings((p) => ({ ...p, [item.key]: !p[item.key] }))}
                    className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${emailSettings[item.key] ? "bg-emerald-500" : "bg-muted-foreground/30"}`}
                  >
                    <span className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full shadow transition-transform ${emailSettings[item.key] ? "translate-x-5" : ""}`} />
                  </button>
                  <div>
                    <p className="text-sm font-medium">{item.label}</p>
                    <p className="text-xs text-muted-foreground">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

            <Button
              className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl gap-2"
              onClick={() => { setSmtpSaved(true); setTimeout(() => setSmtpSaved(false), 2000); }}
            >
              {smtpSaved ? <Icon name="Check" size={15} /> : <Icon name="Save" size={15} />}
              {smtpSaved ? "Сохранено!" : "Сохранить настройки"}
            </Button>

            {/* Тестовое письмо */}
            <div className="border-t border-border pt-5 space-y-4">
              <div>
                <h4 className="font-semibold text-sm">Тестовое письмо</h4>
                <p className="text-xs text-muted-foreground mt-0.5">Отправьте пробное письмо, чтобы проверить SMTP-настройки.</p>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Email получателя</Label>
                  <Input className="rounded-xl" placeholder="test@company.ru" value={testEmail} onChange={(e) => setTestEmail(e.target.value)} />
                </div>
                <div className="space-y-1.5">
                  <Label>Тема (опционально)</Label>
                  <Input className="rounded-xl" placeholder="Тест SMTP" value={testSubject} onChange={(e) => setTestSubject(e.target.value)} />
                </div>
              </div>
              <Button
                variant="outline"
                className="rounded-xl gap-2"
                onClick={() => { setTestSent(true); setTimeout(() => setTestSent(false), 3000); }}
              >
                {testSent ? <Icon name="CheckCircle" size={15} className="text-emerald-500" /> : <Icon name="Send" size={15} />}
                {testSent ? "Письмо отправлено!" : "Отправить тестовое письмо"}
              </Button>
            </div>
          </div>
        </div>
      )}

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