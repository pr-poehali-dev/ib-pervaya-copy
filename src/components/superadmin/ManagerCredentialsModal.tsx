import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

// ─── Тип ──────────────────────────────────────────────────────────────────────

export interface SalesManager {
  id: number;
  name: string;
  email: string;
  initials: string;
  tenantsCount: number;
  totalSubscriptions: number;
  status: "active" | "inactive";
  createdAt: string;
}

// ─── Утилита (локальная копия для независимости модала) ────────────────────────

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── Компонент ────────────────────────────────────────────────────────────────

export default function ManagerCredentialsModal({
  manager,
  onClose,
}: {
  manager: SalesManager;
  onClose: () => void;
}) {
  const [copiedEmail,  setCopiedEmail]  = useState(false);
  const [resetting,    setResetting]    = useState(false);
  const [resetDone,    setResetDone]    = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);

  const statusCls = manager.status === "active"
    ? "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800"
    : "text-muted-foreground bg-muted border-border";
  const statusLabel = manager.status === "active" ? "Активен" : "Неактивен";

  function handleCopyEmail() {
    copyToClipboard(manager.email);
    setCopiedEmail(true);
    setTimeout(() => setCopiedEmail(false), 1500);
  }

  function handleResetPassword() {
    if (!confirmReset) { setConfirmReset(true); return; }
    setResetting(true);
    setConfirmReset(false);
    setTimeout(() => { setResetting(false); setResetDone(true); }, 1000);
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-md shadow-2xl flex flex-col">

        {/* Шапка */}
        <div className="flex items-start gap-3 p-5 border-b border-border">
          <div className="w-9 h-9 rounded-xl bg-amber-100 dark:bg-amber-900/30 flex items-center justify-center flex-shrink-0 mt-0.5">
            <Icon name="ShieldAlert" size={18} className="text-amber-600 dark:text-amber-400" />
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="font-bold text-base">Учётные данные</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Данные для входа менеджера продаж</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Email (логин) */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email (логин)</label>
            <div className="flex gap-2">
              <div className="flex-1 h-10 px-3 rounded-xl border border-border bg-muted/30 text-sm flex items-center font-mono">
                {manager.email}
              </div>
              <button
                onClick={handleCopyEmail}
                className={`w-10 h-10 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${copiedEmail ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                title="Скопировать"
              >
                <Icon name={copiedEmail ? "Check" : "Copy"} size={15} />
              </button>
            </div>
          </div>

          {/* Имя + Статус */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Имя пользователя</label>
              <div className="h-10 px-3 rounded-xl border border-border bg-muted/30 text-sm flex items-center font-mono text-muted-foreground truncate">
                {manager.email}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Статус</label>
              <div className={`h-10 px-3 rounded-xl border text-sm flex items-center font-semibold ${statusCls}`}>
                {statusLabel}
              </div>
            </div>
          </div>

          {/* Создан + Последний вход */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Создан</p>
              <p className="text-sm font-medium">{manager.createdAt}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Последний вход</p>
              <p className="text-sm font-medium text-muted-foreground">—</p>
            </div>
          </div>

          {/* Доступные модули */}
          <div>
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">Доступные модули</p>
            <div className="flex flex-wrap gap-1.5">
              {["Тенанты", "Отчёты"].map((mod) => (
                <span key={mod} className="px-2.5 py-1 rounded-lg border border-border text-xs text-muted-foreground bg-muted/30">
                  {mod}
                </span>
              ))}
            </div>
          </div>

          {/* Уведомление сброса */}
          {resetDone && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <Icon name="CheckCircle" size={15} className="text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Новый пароль отправлен на <span className="font-semibold">{manager.email}</span>
              </p>
            </div>
          )}

          {/* Подтверждение сброса */}
          {confirmReset && !resetDone && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
              <Icon name="AlertTriangle" size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Подтвердите сброс пароля</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Новый пароль будет отправлен на email менеджера. Текущий пароль станет недействительным.</p>
              </div>
            </div>
          )}
        </div>

        {/* Кнопки */}
        <div className="flex gap-2 px-5 pb-5 mt-1">
          <button
            onClick={handleResetPassword}
            disabled={resetting || resetDone}
            className={`flex-1 flex items-center justify-center gap-2 h-11 rounded-xl text-sm font-semibold transition-all ${
              resetDone    ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" :
              confirmReset ? "bg-red-600 hover:bg-red-700 text-white" :
              resetting    ? "bg-muted text-muted-foreground cursor-not-allowed" :
                             "bg-red-600 hover:bg-red-700 text-white"
            }`}
          >
            <Icon name={resetDone ? "CheckCircle" : resetting ? "Loader" : "AlertCircle"} size={16} className={resetting ? "animate-spin" : ""} />
            {resetDone ? "Пароль сброшен" : confirmReset ? "Подтвердить сброс" : resetting ? "Отправка…" : "Сбросить пароль"}
          </button>
          <Button variant="outline" className="rounded-xl px-5" onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </div>
  );
}
