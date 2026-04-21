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
  SUBSCRIPTION_LABELS,
} from "@/components/admin/types";
import { SUBSCRIPTION_LABELS as SUB_LABELS } from "@/components/admin/types";

const DIRECTION_OPTIONS = COURSE_DIRECTIONS.filter((d) => d.id !== 6);

// ─── Бейдж статуса ────────────────────────────────────────────────────────────

function StatusBadge({ status }: { status: Tenant["status"] }) {
  const map = {
    active:    { label: "Активен",     cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
    suspended: { label: "Приостановлен", cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
    trial:     { label: "Пробный",     cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  };
  const { label, cls } = map[status];
  return <Badge className={`text-xs ${cls}`}>{label}</Badge>;
}

// ─── Типовой бейдж тенанта ────────────────────────────────────────────────────

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

// ─── Модальное окно управления тенантом ───────────────────────────────────────

function TenantModal({ tenant, onClose }: { tenant: Tenant | null; onClose: () => void }) {
  const isNew = tenant === null;

  const [name,   setName]   = useState(tenant?.name ?? "");
  const [inn,    setInn]    = useState(tenant?.inn ?? "");
  const [email,  setEmail]  = useState(tenant?.contactEmail ?? "");
  const [type,   setType]   = useState<TenantType>(tenant?.type ?? "organization");
  const [status, setStatus] = useState<Tenant["status"]>(tenant?.status ?? "active");

  const allDirIds = DIRECTION_OPTIONS.map((d) => d.id);
  const [allowedDirs, setAllowedDirs] = useState<number[]>(
    tenant?.allowedDirections ?? []
  );

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
    if (tenant) {
      tenant.subscriptions.forEach((s) => { map[s.type] = s.total; });
    }
    return map as Record<SubscriptionType, number>;
  };

  const [subLimits, setSubLimits] = useState<Record<SubscriptionType, number>>(defaultSubs());

  function toggleDir(id: number) {
    setAllowedDirs((prev) =>
      prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]
    );
  }

  function setLimit(type: SubscriptionType, val: string) {
    setSubLimits((prev) => ({ ...prev, [type]: Number(val) || 0 }));
  }

  const dirForSub: Record<SubscriptionType, number | null> = {
    industrial_safety: 1,
    energy_safety: 2,
    labor_protection: 3,
    expert_pb: 4,
    expert_gts: 5,
    own_courses: 6,
  };

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

          {/* Доступ к направлениям курсов + лимиты подписок */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <p className="text-sm font-medium">Доступ к направлениям и лимиты подписок</p>
              <span className="text-xs text-muted-foreground">(выберите направления и укажите лимит)</span>
            </div>

            <div className="space-y-2">
              {SUB_TYPES.map((subType) => {
                const dirId = dirForSub[subType];
                const dir = COURSE_DIRECTIONS.find((d) => d.id === dirId);
                const isOwn = subType === "own_courses";
                const isAllowed = isOwn ? type !== "organization" || allowedDirs.includes(6) : allowedDirs.includes(dirId ?? 0);

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
                        {dir && <p className="text-xs text-muted-foreground">{dir.courses.length} курсов в направлении</p>}
                        {isOwn && <p className="text-xs text-muted-foreground">Курсы загруженные самим тенантом</p>}
                      </div>
                      {isAllowed && (
                        <div className="flex items-center gap-2 flex-shrink-0" onClick={(e) => e.stopPropagation()}>
                          <label className="text-xs text-muted-foreground whitespace-nowrap">Лимит:</label>
                          <input
                            type="number"
                            min="0"
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
          <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={onClose}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Детальный просмотр подписок тенанта ─────────────────────────────────────

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
            const pct = s.total > 0 ? Math.round((s.used / s.total) * 100) : 0;
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
          {tenant.subscriptions.length === 0 && (
            <p className="text-sm text-muted-foreground text-center py-4">Подписки не назначены</p>
          )}
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
  const [tenants, setTenants] = useState<Tenant[]>(TENANTS);
  const [editTenant, setEditTenant] = useState<Tenant | null | undefined>(undefined);
  const [viewSubs, setViewSubs] = useState<Tenant | null>(null);
  const [search, setSearch] = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TenantType>("all");

  const filtered = tenants.filter((t) => {
    const matchSearch = t.name.toLowerCase().includes(search.toLowerCase()) || t.inn.includes(search);
    const matchType   = typeFilter === "all" || t.type === typeFilter;
    return matchSearch && matchType;
  });

  return (
    <div className="space-y-4">
      {editTenant !== undefined && (
        <TenantModal tenant={editTenant} onClose={() => setEditTenant(undefined)} />
      )}
      {viewSubs && (
        <TenantSubscriptionsModal tenant={viewSubs} onClose={() => setViewSubs(null)} />
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
                      <button onClick={() => setEditTenant(t)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Редактировать">
                        <Icon name="Settings" size={15} />
                      </button>
                      <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Войти как тенант">
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
