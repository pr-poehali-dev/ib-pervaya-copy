import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { SalesManager } from "./ManagerCredentialsModal";

// ─── Утилиты (локальные копии для независимости модала) ───────────────────────

function generatePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── Компонент ────────────────────────────────────────────────────────────────

export default function ManagerModal({
  manager,
  onClose,
  onSave,
}: {
  manager: SalesManager | null;
  onClose: () => void;
  onSave: (data: { name: string; email: string; password: string }) => void;
}) {
  const isNew = manager === null;
  const [name,       setName]       = useState(manager?.name  ?? "");
  const [email,      setEmail]      = useState(manager?.email ?? "");
  const [password,   setPassword]   = useState(isNew ? generatePassword() : "");
  const [showPass,   setShowPass]   = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  function handleCopyPass() {
    copyToClipboard(password);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 1500);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-base">{isNew ? "Добавить менеджера" : "Редактировать менеджера"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">ФИО</label>
            <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="Фамилия Имя Отчество" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Email</label>
            <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="email@platform.ru" />
          </div>
          {isNew && (
            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Пароль</label>
                <button
                  onClick={() => { setPassword(generatePassword()); setShowPass(true); }}
                  className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline"
                >
                  <Icon name="RefreshCw" size={11} />
                  Сгенерировать
                </button>
              </div>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <input
                    type={showPass ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full h-9 px-3 pr-9 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                  />
                  <button onClick={() => setShowPass((v) => !v)} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
                    <Icon name={showPass ? "EyeOff" : "Eye"} size={14} />
                  </button>
                </div>
                <button
                  onClick={handleCopyPass}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${copiedPass ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "border-border hover:bg-muted text-muted-foreground"}`}
                  title="Скопировать пароль"
                >
                  <Icon name={copiedPass ? "Check" : "Copy"} size={14} />
                </button>
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={() => { onSave({ name, email, password }); onClose(); }}>
            {isNew ? "Создать" : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  );
}
