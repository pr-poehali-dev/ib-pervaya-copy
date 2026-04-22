import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  TENANTS,
  COURSE_DIRECTIONS,
} from "@/data/mockData";
import type {
  Tenant,
  TenantType,
  SubscriptionBalance,
  SubscriptionType,
} from "@/components/admin/types";
import { SUBSCRIPTION_LABELS as SUB_LABELS } from "@/components/admin/types";

const DIRECTION_OPTIONS = COURSE_DIRECTIONS.filter((d) => d.id !== 6);

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function generatePassword() {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

function copyToClipboard(text: string) {
  navigator.clipboard.writeText(text).catch(() => {});
}

// ─── Бейдж статуса ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Tenant["status"] }) {
  const map = {
    active:    { label: "Активен",       cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
    suspended: { label: "Приостановлен", cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
    trial:     { label: "Пробный",       cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  };
  const { label, cls } = map[status];
  return <Badge className={`text-xs ${cls}`}>{label}</Badge>;
}

// ─── Бейдж типа тенанта ───────────────────────────────────────────────────────

function TypeBadge({ type }: { type: TenantType }) {
  return (
    <Badge className={`text-xs ${type === "training_center" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
      {type === "training_center" ? "Учебный центр" : "Организация"}
    </Badge>
  );
}

// ─── Мини-блок подписок в строке таблицы ─────────────────────────────────────

function SubscriptionsMini({ subs }: { subs: SubscriptionBalance[] }) {
  const total = subs.reduce((a, s) => a + s.total, 0);
  const used  = subs.reduce((a, s) => a + s.used, 0);
  const pct   = total > 0 ? Math.round((used / total) * 100) : 0;
  const warn  = pct >= 85;
  return (
    <div className="min-w-[110px] space-y-1">
      <div className="flex justify-between text-xs">
        <span className={warn ? "text-red-500 font-medium" : "text-muted-foreground"}>{used} / {total}</span>
        <span className={warn ? "text-red-500 font-medium" : "text-muted-foreground"}>{pct}%</span>
      </div>
      <Progress value={pct} className={`h-1.5 ${warn ? "[&>div]:bg-red-500" : "[&>div]:bg-violet-500"}`} />
    </div>
  );
}

// ─── Модал «Учётные данные» ───────────────────────────────────────────────────

function TenantCredentialsModal({
  tenant,
  onClose,
}: {
  tenant: Tenant;
  onClose: () => void;
}) {
  const [copiedEmail,    setCopiedEmail]    = useState(false);
  const [resetting,      setResetting]      = useState(false);
  const [resetDone,      setResetDone]      = useState(false);
  const [confirmReset,   setConfirmReset]   = useState(false);

  const statusMap = {
    active:    { label: "Активен",       cls: "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 border-emerald-200 dark:border-emerald-800" },
    suspended: { label: "Приостановлен", cls: "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800" },
    trial:     { label: "Пробный",       cls: "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20 border-amber-200 dark:border-amber-800" },
  };
  const st = statusMap[tenant.status];

  function handleCopyEmail() {
    copyToClipboard(tenant.contactEmail);
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
            <p className="text-xs text-muted-foreground mt-0.5">Данные для входа администратора тенанта</p>
          </div>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors flex-shrink-0">
            <Icon name="X" size={16} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Карточка тенанта */}
          <div className="flex items-start gap-3 px-4 py-3 bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl">
            <Icon name="Info" size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <div className="min-w-0">
              <p className="text-sm font-semibold text-blue-800 dark:text-blue-300 truncate">{tenant.name}</p>
              <p className="text-xs text-blue-600 dark:text-blue-400">ИНН: {tenant.inn}</p>
            </div>
          </div>

          {/* Email (логин) */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Email (логин)</label>
            <div className="flex gap-2">
              <div className="flex-1 h-10 px-3 rounded-xl border border-border bg-muted/30 text-sm flex items-center font-mono">
                {tenant.contactEmail}
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

          {/* Имя пользователя + Статус */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Имя пользователя</label>
              <div className="h-10 px-3 rounded-xl border border-border bg-muted/30 text-sm flex items-center font-mono text-muted-foreground">
                {tenant.contactEmail}
              </div>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium uppercase tracking-wide">Статус</label>
              <div className={`h-10 px-3 rounded-xl border text-sm flex items-center font-semibold ${st.cls}`}>
                {st.label}
              </div>
            </div>
          </div>

          {/* Создан + Последний вход */}
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Создан</p>
              <p className="text-sm font-medium">{tenant.createdAt}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide mb-1">Последний вход</p>
              <p className="text-sm font-medium text-muted-foreground">—</p>
            </div>
          </div>

          {/* Уведомление об успешном сбросе */}
          {resetDone && (
            <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
              <Icon name="CheckCircle" size={15} className="text-emerald-600 flex-shrink-0" />
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                Новый пароль отправлен на <span className="font-semibold">{tenant.contactEmail}</span>
              </p>
            </div>
          )}

          {/* Подтверждение сброса */}
          {confirmReset && !resetDone && (
            <div className="flex items-start gap-3 px-4 py-3 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-xl">
              <Icon name="AlertTriangle" size={15} className="text-red-500 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="text-sm font-medium text-red-700 dark:text-red-300">Подтвердите сброс пароля</p>
                <p className="text-xs text-red-600 dark:text-red-400 mt-0.5">Новый пароль будет отправлен на email администратора. Текущий пароль станет недействительным.</p>
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
              resetDone   ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800" :
              confirmReset ? "bg-red-600 hover:bg-red-700 text-white" :
              resetting   ? "bg-muted text-muted-foreground cursor-not-allowed" :
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

// ─── Форма создания / редактирования тенанта ──────────────────────────────────

function TenantModal({
  tenant,
  onClose,
  onCreated,
}: {
  tenant: Tenant | null;
  onClose: () => void;
  onCreated?: (t: Tenant) => void;
}) {
  const isNew = tenant === null;

  const [name,      setName]      = useState(tenant?.name          ?? "");
  const [inn,       setInn]       = useState(tenant?.inn           ?? "");
  const [email,     setEmail]     = useState(tenant?.contactEmail  ?? "");
  const [type,      setType]      = useState<TenantType>(tenant?.type   ?? "organization");
  const [status,    setStatus]    = useState<Tenant["status"]>(tenant?.status ?? "active");
  const [password,  setPassword]  = useState(isNew ? generatePassword() : "");
  const [showPass,  setShowPass]  = useState(false);
  const [copiedPass, setCopiedPass] = useState(false);

  const allDirIds = DIRECTION_OPTIONS.map((d) => d.id);
  const [allowedDirs, setAllowedDirs] = useState<number[]>(tenant?.allowedDirections ?? []);

  const SUB_TYPES: SubscriptionType[] = [
    "industrial_safety",
    "energy_safety",
    "labor_protection",
    "expert_pb",
    "expert_gts",
    "own_courses",
  ];

  const defaultSubs = (): Record<SubscriptionType, number> => {
    const map: Record<string, number> = {};
    if (tenant) tenant.subscriptions.forEach((s) => { map[s.type] = s.total; });
    return map as Record<SubscriptionType, number>;
  };
  const [subLimits, setSubLimits] = useState<Record<SubscriptionType, number>>(defaultSubs());

  function toggleDir(id: number) {
    setAllowedDirs((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  }
  function setLimit(type: SubscriptionType, val: string) {
    setSubLimits((prev) => ({ ...prev, [type]: Number(val) || 0 }));
  }
  function regeneratePassword() {
    const p = generatePassword();
    setPassword(p);
    setShowPass(true);
  }
  function handleCopyPass() {
    copyToClipboard(password);
    setCopiedPass(true);
    setTimeout(() => setCopiedPass(false), 1500);
  }

  const dirForSub: Record<SubscriptionType, number | null> = {
    industrial_safety: 1,
    energy_safety:     2,
    labor_protection:  3,
    expert_pb:         4,
    expert_gts:        5,
    own_courses:       6,
  };

  function handleSave() {
    if (isNew && onCreated) {
      const newTenant: Tenant = {
        id:                Date.now(),
        type,
        name,
        inn,
        contactEmail:      email,
        status,
        allowedDirections: allowedDirs,
        subscriptions:     SUB_TYPES.filter((st) => subLimits[st] > 0).map((st) => ({
          type: st,
          label: SUB_LABELS[st],
          total: subLimits[st],
          used: 0,
        })),
        createdAt: new Date().toLocaleDateString("ru-RU"),
      };
      onCreated(newTenant);
    }
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-2xl shadow-2xl flex flex-col max-h-[90vh]">
        <div className="flex items-center justify-between p-6 border-b border-border flex-shrink-0">
          <h2 className="font-bold text-lg">{isNew ? "Добавить тенанта" : "Редактировать тенанта"}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-6 space-y-5">
          {/* Основные данные */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="text-xs text-muted-foreground">Название организации</label>
              <input value={name} onChange={(e) => setName(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder='ООО «Название»' />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">ИНН</label>
              <input value={inn} onChange={(e) => setInn(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="1234567890" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Email администратора</label>
              <input value={email} onChange={(e) => setEmail(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="admin@org.ru" />
            </div>
          </div>

          {/* Пароль — только при создании */}
          {isNew && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="text-xs text-muted-foreground">Пароль администратора</label>
                <button
                  onClick={regeneratePassword}
                  className="flex items-center gap-1 text-xs text-violet-600 dark:text-violet-400 hover:underline"
                >
                  <Icon name="RefreshCw" size={11} />
                  Сгенерировать новый
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
                  <button
                    onClick={() => setShowPass((v) => !v)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name={showPass ? "EyeOff" : "Eye"} size={14} />
                  </button>
                </div>
                <button
                  onClick={handleCopyPass}
                  className={`w-9 h-9 rounded-xl border flex items-center justify-center transition-all flex-shrink-0 ${copiedPass ? "border-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600" : "border-border hover:bg-muted text-muted-foreground hover:text-foreground"}`}
                  title="Скопировать пароль"
                >
                  <Icon name={copiedPass ? "Check" : "Copy"} size={14} />
                </button>
              </div>
              <p className="text-xs text-muted-foreground flex items-center gap-1">
                <Icon name="Info" size={11} className="flex-shrink-0" />
                Пароль будет отправлен на email администратора при создании тенанта
              </p>
            </div>
          )}

          {/* Тип и статус */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Тип тенанта</label>
              <div className="flex gap-2">
                {(["training_center", "organization"] as TenantType[]).map((t) => (
                  <button key={t} onClick={() => setType(t)} className={`flex-1 py-2 rounded-xl text-xs font-medium border transition-colors ${type === t ? "bg-violet-600 text-white border-violet-600" : "border-border text-muted-foreground hover:bg-muted/60"}`}>
                    {t === "training_center" ? "Учебный центр" : "Организация"}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Статус</label>
              <select value={status} onChange={(e) => setStatus(e.target.value as Tenant["status"])} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                <option value="active">Активен</option>
                <option value="trial">Пробный</option>
                <option value="suspended">Приостановлен</option>
              </select>
            </div>
          </div>

          {/* Доступ к направлениям + лимиты подписок */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Доступ к направлениям и лимиты подписок</p>
              <span className="text-xs text-muted-foreground">(выберите направления и укажите лимит)</span>
            </div>
            <div className="space-y-2">
              {SUB_TYPES.map((subType) => {
                const dirId     = dirForSub[subType];
                const dir       = COURSE_DIRECTIONS.find((d) => d.id === dirId);
                const isOwn     = subType === "own_courses";
                const isAllowed = isOwn
                  ? type !== "organization" || allowedDirs.includes(6)
                  : allowedDirs.includes(dirId ?? 0);
                return (
                  <div key={subType} className={`rounded-xl border transition-colors ${isAllowed ? "border-violet-300 dark:border-violet-700 bg-violet-50/50 dark:bg-violet-900/10" : "border-border bg-muted/20"}`}>
                    <label className="flex items-center gap-3 p-3 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isAllowed}
                        onChange={() => toggleDir(dirId ?? 6)}
                        className="rounded accent-violet-600 w-4 h-4 flex-shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{SUB_LABELS[subType]}</p>
                        {dir  && <p className="text-xs text-muted-foreground">{dir.courses.length} курсов в направлении</p>}
                        {isOwn && <p className="text-xs text-muted-foreground">Курсы загруженные самим тенантом</p>}
                      </div>
                      {isAllowed && (
                        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <label className="text-xs text-muted-foreground whitespace-nowrap">Лимит:</label>
                          <input
                            type="number" min="0"
                            value={subLimits[subType] ?? 0}
                            onChange={(e) => setLimit(subType, e.target.value)}
                            className="w-20 h-7 px-2 rounded-lg border border-border bg-background text-sm text-center focus:outline-none focus:ring-2 focus:ring-violet-500/30"
                          />
                        </div>
                      )}
                    </label>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        <div className="flex gap-2 p-6 border-t border-border flex-shrink-0">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={handleSave}>
            {isNew ? "Создать тенанта" : "Сохранить"}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Детальный просмотр подписок ──────────────────────────────────────────────

function TenantSubscriptionsModal({ tenant, onClose }: { tenant: Tenant; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-bold text-base">{tenant.name}</h2>
            <p className="text-xs text-muted-foreground">Подписки по направлениям</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          {tenant.subscriptions.map((s) => {
            const pct  = s.total > 0 ? Math.round((s.used / s.total) * 100) : 0;
            const warn = pct >= 85;
            return (
              <div key={s.type} className="space-y-1.5">
                <div className="flex justify-between text-sm">
                  <span className="font-medium">{s.label}</span>
                  <span className={warn ? "text-red-500 font-medium" : "text-muted-foreground"}>
                    {s.used} / {s.total} ({pct}%)
                  </span>
                </div>
                <Progress value={pct} className={`h-2 ${warn ? "[&>div]:bg-red-500" : "[&>div]:bg-violet-500"}`} />
              </div>
            );
          })}
        </div>
        <div className="p-6 pt-0">
          <Button variant="outline" className="w-full rounded-xl" onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Главная панель ───────────────────────────────────────────────────────────

export default function TenantsPanel() {
  const [tenants,    setTenants]    = useState<Tenant[]>(TENANTS);
  const [editTenant, setEditTenant] = useState<Tenant | null | undefined>(undefined);
  const [viewSubs,   setViewSubs]   = useState<Tenant | null>(null);
  const [viewCreds,  setViewCreds]  = useState<Tenant | null>(null);
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TenantType>("all");

  const filtered = tenants.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.inn.includes(search);
    const matchType   = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  function handleCreated(t: Tenant) {
    setTenants((prev) => [t, ...prev]);
    setViewCreds(t);
  }

  return (
    <div className="space-y-4">
      {editTenant !== undefined && (
        <TenantModal
          tenant={editTenant}
          onClose={() => setEditTenant(undefined)}
          onCreated={handleCreated}
        />
      )}
      {viewSubs && (
        <TenantSubscriptionsModal tenant={viewSubs} onClose={() => setViewSubs(null)} />
      )}
      {viewCreds && (
        <TenantCredentialsModal tenant={viewCreds} onClose={() => setViewCreds(null)} />
      )}

      {/* Панель фильтров */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск по названию или ИНН..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
          {([["all", "Все"], ["training_center", "УЦ"], ["organization", "Организации"]] as const).map(([val, label]) => (
            <button
              key={val}
              onClick={() => setTypeFilter(val)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${typeFilter === val ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              {label}
            </button>
          ))}
        </div>
        <Button className="gradient-primary text-white rounded-xl gap-2 h-9 flex-shrink-0" onClick={() => setEditTenant(null)}>
          <Icon name="Plus" size={15} />
          Добавить тенанта
        </Button>
      </div>

      {/* Таблица */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Организация</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">ИНН</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Тип</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Направления</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Подписки</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Управление</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((t, idx) => (
                <tr key={t.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 !== 0 ? "bg-muted/5" : ""}`}>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{t.name}</p>
                      <p className="text-xs text-muted-foreground">{t.createdAt}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{t.inn}</td>
                  <td className="px-4 py-3"><TypeBadge type={t.type} /></td>
                  <td className="px-4 py-3">
                    <div className="flex flex-wrap gap-1 max-w-[160px]">
                      {t.allowedDirections.slice(0, 3).map((dirId) => {
                        const dir = COURSE_DIRECTIONS.find((d) => d.id === dirId);
                        return dir ? (
                          <span key={dirId} className="inline-block bg-muted text-muted-foreground text-xs px-1.5 py-0.5 rounded-md" title={dir.title}>
                            {dir.title.split(" ")[0]}
                          </span>
                        ) : null;
                      })}
                      {t.allowedDirections.length > 3 && (
                        <span className="text-xs text-muted-foreground">+{t.allowedDirections.length - 3}</span>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <button onClick={() => setViewSubs(t)} className="hover:opacity-80 transition-opacity">
                      <SubscriptionsMini subs={t.subscriptions} />
                    </button>
                  </td>
                  <td className="px-4 py-3"><StatusBadge status={t.status} /></td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => setViewCreds(t)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Учётные данные"
                      >
                        <Icon name="KeyRound" size={15} />
                      </button>
                      <button
                        onClick={() => setEditTenant(t)}
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Редактировать"
                      >
                        <Icon name="Settings" size={15} />
                      </button>
                      <button
                        className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                        title="Войти как тенант"
                      >
                        <Icon name="LogIn" size={15} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    Тенанты не найдены
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
