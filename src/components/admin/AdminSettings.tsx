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
  fullName: string;
  email: string;
  role: string;
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
  { id: 1, fullName: "ИВАНОВ ИВАН ИВАНОВИЧ", email: "admin@isp.ru", role: "Администратор", registeredAt: "09.02.2026" },
];

const orgTypes: OrgType[] = ["Юридическое лицо", "ИП", "Физическое лицо"];
const opfTypes: OpfType[] = ["ООО", "АО", "ПАО", "ГБУ", "ФГБУ", "ИП"];
const userRoles = ["Администратор", "Менеджер", "Преподаватель", "Наблюдатель"];

export default function AdminSettings() {
  const [org, setOrg] = useState<OrgData>(defaultOrg);
  const [editOrg, setEditOrg] = useState(false);
  const [orgDraft, setOrgDraft] = useState<OrgData>(defaultOrg);
  const [copied, setCopied] = useState(false);

  const [systemUsers, setSystemUsers] = useState<SystemUser[]>(defaultUsers);
  const [showAddUser, setShowAddUser] = useState(false);
  const [editUser, setEditUser] = useState<SystemUser | null>(null);

  const [uName, setUName] = useState("");
  const [uEmail, setUEmail] = useState("");
  const [uRole, setURole] = useState("Администратор");
  const [uNameErr, setUNameErr] = useState("");
  const [uEmailErr, setUEmailErr] = useState("");

  const handleCopy = () => {
    navigator.clipboard.writeText(org.externalId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSaveOrg = () => {
    setOrg(orgDraft);
    setEditOrg(false);
  };

  const openAddUser = () => {
    setEditUser(null);
    setUName(""); setUEmail(""); setURole("Администратор");
    setUNameErr(""); setUEmailErr("");
    setShowAddUser(true);
  };

  const openEditUser = (u: SystemUser) => {
    setEditUser(u);
    setUName(u.fullName); setUEmail(u.email); setURole(u.role);
    setUNameErr(""); setUEmailErr("");
    setShowAddUser(true);
  };

  const handleSaveUser = () => {
    let valid = true;
    if (!uName.trim()) { setUNameErr("Введите ФИО"); valid = false; } else setUNameErr("");
    if (!uEmail.trim()) { setUEmailErr("Введите email"); valid = false; }
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(uEmail)) { setUEmailErr("Некорректный email"); valid = false; }
    else setUEmailErr("");
    if (!valid) return;

    if (editUser) {
      setSystemUsers((prev) => prev.map((u) => u.id === editUser.id ? { ...u, fullName: uName.trim(), email: uEmail.trim(), role: uRole } : u));
    } else {
      setSystemUsers((prev) => [...prev, {
        id: Date.now(),
        fullName: uName.trim().toUpperCase(),
        email: uEmail.trim(),
        role: uRole,
        registeredAt: new Date().toLocaleDateString("ru-RU"),
      }]);
    }
    setShowAddUser(false);
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
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-7 px-2 text-xs rounded-lg flex-shrink-0"
                      onClick={handleCopy}
                    >
                      {copied ? <Icon name="Check" size={12} className="text-emerald-500" /> : <Icon name="Copy" size={12} />}
                      {copied ? "Скопировано" : "Скопировать"}
                    </Button>
                  </div>
                </td>
                <td className="px-4 py-3 whitespace-nowrap font-mono">{org.inn}</td>
                <td className="px-4 py-3 whitespace-nowrap">{org.licenseNo}</td>
                <td className="px-4 py-3 whitespace-nowrap">{org.licenseDate}</td>
                <td className="px-4 py-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="h-8 w-8 p-0 rounded-lg"
                    onClick={() => { setOrgDraft(org); setEditOrg(true); }}
                  >
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
                {["ФИО", "Email", "Роль", "Дата регистрации", "Действия"].map((h) => (
                  <th key={h} className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {systemUsers.map((u) => (
                <tr key={u.id} className="border-b border-border last:border-0 hover:bg-muted/30 transition-colors">
                  <td className="px-4 py-3 font-medium">{u.fullName}</td>
                  <td className="px-4 py-3 text-muted-foreground">{u.email}</td>
                  <td className="px-4 py-3">
                    <span className="px-2.5 py-1 bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 rounded-lg text-xs font-medium">
                      {u.role}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{u.registeredAt}</td>
                  <td className="px-4 py-3">
                    <Button
                      size="sm"
                      variant="outline"
                      className="h-8 w-8 p-0 rounded-lg"
                      onClick={() => openEditUser(u)}
                    >
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
        <DialogContent className="rounded-2xl max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Icon name="UserPlus" size={18} className="text-primary" />
              {editUser ? "Редактировать пользователя" : "Новый пользователь системы"}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 pt-1">
            <div className="space-y-1.5">
              <Label>ФИО</Label>
              <Input className="rounded-xl" placeholder="Иванов Иван Иванович" value={uName} onChange={(e) => setUName(e.target.value)} />
              {uNameErr && <p className="text-destructive text-xs">{uNameErr}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Email</Label>
              <Input className="rounded-xl" placeholder="user@isp.ru" value={uEmail} onChange={(e) => setUEmail(e.target.value)} />
              {uEmailErr && <p className="text-destructive text-xs">{uEmailErr}</p>}
            </div>
            <div className="space-y-1.5">
              <Label>Роль</Label>
              <Select value={uRole} onValueChange={setURole}>
                <SelectTrigger className="rounded-xl"><SelectValue /></SelectTrigger>
                <SelectContent>{userRoles.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="flex gap-2 pt-1">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowAddUser(false)}>Отмена</Button>
              <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={handleSaveUser}>
                {editUser ? "Сохранить" : "Добавить"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
