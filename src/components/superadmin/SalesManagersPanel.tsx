import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

// ─── Типы ─────────────────────────────────────────────────────────────────────

interface SalesManager {
  id: number;
  name: string;
  email: string;
  initials: string;
  tenantsCount: number;
  totalSubscriptions: number;
  status: "active" | "inactive";
  createdAt: string;
}

const MOCK_MANAGERS: SalesManager[] = [
  { id: 1, name: "Константин Воронов", email: "k.voronov@platform.ru",  initials: "КВ", tenantsCount: 3, totalSubscriptions: 350, status: "active",   createdAt: "10.01.2025" },
  { id: 2, name: "Людмила Захарова",  email: "l.zaharova@platform.ru", initials: "ЛЗ", tenantsCount: 2, totalSubscriptions: 80,  status: "active",   createdAt: "22.02.2025" },
  { id: 3, name: "Игорь Кузнецов",   email: "i.kuznecov@platform.ru", initials: "ИК", tenantsCount: 0, totalSubscriptions: 0,   status: "inactive", createdAt: "05.11.2024" },
];

const GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
];

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function generatePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── Модал «Учётные данные» ───────────────────────────────────────────────────

function ManagerCredentialsModal({
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

// ─── Модал создания / редактирования ─────────────────────────────────────────

function ManagerModal({
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

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function SalesManagersPanel() {
  const [managers,     setManagers]     = useState<SalesManager[]>(MOCK_MANAGERS);
  const [editManager,  setEditManager]  = useState<SalesManager | null | undefined>(undefined);
  const [credsManager, setCredsManager] = useState<SalesManager | null>(null);

  function handleSave(data: { name: string; email: string; password: string }) {
    if (editManager) {
      setManagers((prev) => prev.map((m) => m.id === editManager.id ? { ...m, name: data.name, email: data.email } : m));
    } else {
      const initials = data.name.split(" ").slice(0, 2).map((w) => w[0]?.toUpperCase() ?? "").join("");
      setManagers((prev) => [...prev, {
        id: Date.now(), name: data.name, email: data.email, initials,
        tenantsCount: 0, totalSubscriptions: 0, status: "active",
        createdAt: new Date().toLocaleDateString("ru-RU"),
      }]);
    }
  }

  function toggleStatus(id: number) {
    setManagers((prev) => prev.map((m) => m.id === id ? { ...m, status: m.status === "active" ? "inactive" : "active" } : m));
  }

  return (
    <div className="space-y-4">
      {editManager !== undefined && (
        <ManagerModal manager={editManager} onClose={() => setEditManager(undefined)} onSave={handleSave} />
      )}
      {credsManager && (
        <ManagerCredentialsModal manager={credsManager} onClose={() => setCredsManager(null)} />
      )}

      <div className="flex justify-end">
        <Button className="gradient-primary text-white rounded-xl gap-2 h-9" onClick={() => setEditManager(null)}>
          <Icon name="Plus" size={15} />
          Добавить менеджера
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {managers.map((m, idx) => (
          <div key={m.id} className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} rounded-xl flex items-center justify-center flex-shrink-0`}>
                  <span className="text-white font-bold text-sm">{m.initials}</span>
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{m.name}</p>
                  <p className="text-xs text-muted-foreground truncate">{m.email}</p>
                </div>
              </div>
              <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex-shrink-0 ${m.status === "active" ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                {m.status === "active" ? "Активен" : "Неактивен"}
              </span>
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{m.tenantsCount}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Тенантов</p>
              </div>
              <div className="bg-muted/40 rounded-xl p-3 text-center">
                <p className="text-2xl font-bold">{m.totalSubscriptions}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Подписок выдано</p>
              </div>
            </div>

            <div className="flex items-center justify-between text-xs text-muted-foreground border-t border-border pt-3">
              <span>Добавлен {m.createdAt}</span>
              <div className="flex items-center gap-1">
                {/* Учётные данные */}
                <button
                  onClick={() => setCredsManager(m)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Учётные данные"
                >
                  <Icon name="KeyRound" size={14} />
                </button>
                {/* Редактировать */}
                <button
                  onClick={() => setEditManager(m)}
                  className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                  title="Редактировать"
                >
                  <Icon name="Pencil" size={13} />
                </button>
                {/* Вкл / Выкл */}
                <button
                  onClick={() => toggleStatus(m.id)}
                  className={`p-1.5 rounded-lg transition-colors ${m.status === "active" ? "text-emerald-500 hover:bg-emerald-100 dark:hover:bg-emerald-900/30 hover:text-emerald-600" : "text-muted-foreground hover:bg-muted hover:text-foreground"}`}
                  title={m.status === "active" ? "Деактивировать" : "Активировать"}
                >
                  <Icon name={m.status === "active" ? "ToggleRight" : "ToggleLeft"} size={18} />
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
