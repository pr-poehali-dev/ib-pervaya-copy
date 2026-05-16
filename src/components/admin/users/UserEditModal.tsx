import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { User } from "@/components/admin/types";
import { ROLES } from "@/data/users";

interface UserEditModalProps {
  user: User;
  onSave: (updated: User) => void;
  onClose: () => void;
}

export default function UserEditModal({ user, onSave, onClose }: UserEditModalProps) {
  const nameParts = user.name.trim().split(" ");
  const [lastName,   setLastName]   = useState(user.lastName   ?? nameParts[0] ?? "");
  const [firstName,  setFirstName]  = useState(user.firstName  ?? nameParts[1] ?? "");
  const [middleName, setMiddleName] = useState(user.middleName ?? nameParts[2] ?? "");
  const [email,      setEmail]      = useState(user.email);
  const [phone,      setPhone]      = useState(user.phone ?? "");
  const [position,   setPosition]   = useState(user.position ?? "");
  const [role,       setRole]       = useState(user.role);

  const [emailError, setEmailError] = useState("");

  function validate() {
    if (!lastName.trim() || !firstName.trim()) return false;
    if (!email.trim() || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setEmailError("Введите корректный email");
      return false;
    }
    return true;
  }

  function handleSave() {
    if (!validate()) return;
    const fullName = [lastName, firstName, middleName].filter(Boolean).join(" ");
    const initials = `${lastName[0] ?? ""}${firstName[0] ?? ""}`.toUpperCase();
    onSave({
      ...user,
      name: fullName,
      lastName,
      firstName,
      middleName,
      email,
      phone,
      position,
      role,
      initials,
    });
    onClose();
  }

  const inputCls = "w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-2xl max-h-[calc(100vh-2rem)] flex flex-col">

        {/* Шапка */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center">
              <Icon name="UserPen" size={16} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-sm">Редактировать слушателя</h2>
              <p className="text-xs text-muted-foreground">{user.name}</p>
            </div>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground">
            <Icon name="X" size={16} />
          </button>
        </div>

        {/* Форма */}
        <div className="p-5 space-y-3 overflow-y-auto flex-1">

          {/* ФИО */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">ФИО</p>
          <div className="grid grid-cols-1 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Фамилия <span className="text-red-500">*</span></label>
              <input value={lastName} onChange={(e) => setLastName(e.target.value)} className={inputCls} placeholder="Иванов" />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Имя <span className="text-red-500">*</span></label>
                <input value={firstName} onChange={(e) => setFirstName(e.target.value)} className={inputCls} placeholder="Иван" />
              </div>
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Отчество</label>
                <input value={middleName} onChange={(e) => setMiddleName(e.target.value)} className={inputCls} placeholder="Иванович" />
              </div>
            </div>
          </div>

          {/* Контакты */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Контакты</p>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Email <span className="text-red-500">*</span></label>
            <input
              value={email}
              onChange={(e) => { setEmail(e.target.value); setEmailError(""); }}
              className={`${inputCls} ${emailError ? "border-red-400" : ""}`}
              placeholder="user@company.ru"
              type="email"
            />
            {emailError && <p className="text-xs text-red-500">{emailError}</p>}
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Телефон</label>
            <input value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} placeholder="+7 (999) 000-00-00" />
          </div>

          {/* Должность и роль */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Должность</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Должность</label>
              <input value={position} onChange={(e) => setPosition(e.target.value)} className={inputCls} placeholder="Инженер" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Роль</label>
              <select value={role} onChange={(e) => setRole(e.target.value)} className={inputCls}>
                {ROLES.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
          </div>

          {/* Организация (только чтение) */}
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide pt-1">Организация</p>
          <div className="grid grid-cols-2 gap-2">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Организация</label>
              <input value={user.organization} disabled className={`${inputCls} opacity-60 cursor-not-allowed bg-muted`} />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Группа</label>
              <input value={user.group} disabled className={`${inputCls} opacity-60 cursor-not-allowed bg-muted`} />
            </div>
          </div>
          <p className="text-xs text-muted-foreground">Для смены организации или группы используйте соответствующие разделы.</p>
        </div>

        {/* Кнопки */}
        <div className="flex gap-2 p-5 border-t border-border flex-shrink-0">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button
            className="flex-1 rounded-xl gradient-primary text-white"
            onClick={handleSave}
            disabled={!lastName.trim() || !firstName.trim() || !email.trim()}
          >
            <Icon name="Check" size={15} className="mr-1.5" />
            Сохранить
          </Button>
        </div>
      </div>
    </div>
  );
}
