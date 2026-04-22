import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { TENANTS, COURSE_DIRECTIONS } from "@/data/mockData";
import type { Tenant, TenantType } from "@/components/admin/types";
import { StatusBadge, TypeBadge, SubscriptionsMini } from "./TenantsBadges";
import { TenantCredentialsModal, TenantSubscriptionsModal } from "./TenantsModals";
import { TenantModal } from "./TenantModal";

type ViewMode = "table" | "cards";

interface TenantsPanelProps {
  initialTenants?: Tenant[];
  canCreate?: boolean;
}

// ─── Сокращённый бейдж типа для таблицы ──────────────────────────────────────

function TypeBadgeShort({ type }: { type: TenantType }) {
  return (
    <Badge className={`text-xs ${type === "training_center" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
      {type === "training_center" ? "УЦ" : "Орг."}
    </Badge>
  );
}

// ─── Карточка тенанта ─────────────────────────────────────────────────────────

function TenantCard({
  tenant,
  onCreds,
  onEdit,
  onSubs,
  canEdit,
}: {
  tenant: Tenant;
  onCreds: () => void;
  onEdit: () => void;
  onSubs: () => void;
  canEdit: boolean;
}) {
  const total = tenant.subscriptions.reduce((a, s) => a + s.total, 0);
  const used  = tenant.subscriptions.reduce((a, s) => a + s.used, 0);
  const pct   = total > 0 ? Math.round((used / total) * 100) : 0;
  const warn  = pct >= 85;

  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4 flex flex-col">
      {/* Шапка карточки */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-3 min-w-0">
          <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="Building2" size={18} className="text-white" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate" title={tenant.name}>{tenant.name}</p>
            <p className="text-xs text-muted-foreground font-mono">ИНН: {tenant.inn}</p>
          </div>
        </div>
        <div className="flex items-center gap-1.5 flex-shrink-0">
          <TypeBadge type={tenant.type} />
          <StatusBadge status={tenant.status} />
        </div>
      </div>

      {/* Менеджер продаж */}
      {tenant.managerName && (
        <div className="flex items-center gap-2 text-xs text-muted-foreground">
          <Icon name="UserCheck" size={13} className="flex-shrink-0" />
          <span className="truncate">{tenant.managerName}</span>
        </div>
      )}

      {/* Подписки */}
      <button onClick={onSubs} className="w-full text-left hover:opacity-80 transition-opacity">
        <div className="space-y-1.5">
          <div className="flex items-center justify-between text-xs">
            <span className="text-muted-foreground">Подписки</span>
            <span className={warn ? "text-red-500 font-medium" : "text-muted-foreground"}>{used}/{total} · {pct}%</span>
          </div>
          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
            <div className={`h-full rounded-full transition-all ${warn ? "bg-red-500" : "bg-violet-500"}`} style={{ width: `${pct}%` }} />
          </div>
        </div>
      </button>

      {/* Направления */}
      <div className="flex flex-wrap gap-1">
        {tenant.allowedDirections.slice(0, 4).map((dirId) => {
          const dir = COURSE_DIRECTIONS.find((d) => d.id === dirId);
          return dir ? (
            <span key={dirId} className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded-md" title={dir.title}>
              {dir.title.split(" ")[0]}
            </span>
          ) : null;
        })}
        {tenant.allowedDirections.length > 4 && (
          <span className="text-[10px] text-muted-foreground">+{tenant.allowedDirections.length - 4}</span>
        )}
      </div>

      {/* Дата + кнопки */}
      <div className="flex items-center justify-between pt-1 border-t border-border mt-auto">
        <span className="text-xs text-muted-foreground">{tenant.createdAt}</span>
        <div className="flex items-center gap-1">
          <button onClick={onCreds} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Учётные данные">
            <Icon name="KeyRound" size={14} />
          </button>
          {canEdit && (
            <button onClick={onEdit} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Редактировать">
              <Icon name="Settings" size={14} />
            </button>
          )}
          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Войти как тенант">
            <Icon name="LogIn" size={14} />
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function TenantsPanel({ initialTenants, canCreate = true }: TenantsPanelProps) {
  const [tenants,    setTenants]    = useState<Tenant[]>(initialTenants ?? TENANTS);
  const [editTenant, setEditTenant] = useState<Tenant | null | undefined>(undefined);
  const [viewSubs,   setViewSubs]   = useState<Tenant | null>(null);
  const [viewCreds,  setViewCreds]  = useState<Tenant | null>(null);
  const [search,     setSearch]     = useState("");
  const [typeFilter, setTypeFilter] = useState<"all" | TenantType>("all");
  const [viewMode,   setViewMode]   = useState<ViewMode>("table");

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
        <TenantModal tenant={editTenant} onClose={() => setEditTenant(undefined)} onCreated={handleCreated} />
      )}
      {viewSubs && (
        <TenantSubscriptionsModal tenant={viewSubs} onClose={() => setViewSubs(null)} />
      )}
      {viewCreds && (
        <TenantCredentialsModal tenant={viewCreds} onClose={() => setViewCreds(null)} />
      )}

      {/* Панель фильтров */}
      <div className="flex flex-wrap items-center gap-3 sticky top-0 z-10 bg-background/95 backdrop-blur-sm py-2 -mx-1 px-1 rounded-xl">
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

        {/* Переключатель вида */}
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
          <button
            onClick={() => setViewMode("table")}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === "table" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title="Таблица"
          >
            <Icon name="LayoutList" size={15} />
          </button>
          <button
            onClick={() => setViewMode("cards")}
            className={`p-1.5 rounded-lg transition-colors ${viewMode === "cards" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            title="Карточки"
          >
            <Icon name="LayoutGrid" size={15} />
          </button>
        </div>

        {canCreate && (
          <Button className="gradient-primary text-white rounded-xl gap-2 h-9 flex-shrink-0" onClick={() => setEditTenant(null)}>
            <Icon name="Plus" size={15} />
            Добавить тенанта
          </Button>
        )}
      </div>

      {/* ── Таблица ─────────────────────────────────────────────────────────── */}
      {viewMode === "table" && (
        <div className="bg-card rounded-2xl border border-border overflow-x-auto">
          <div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Менеджер продаж</th>
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
                    <td className="px-4 py-3 text-xs text-muted-foreground">
                      {t.managerName ? (
                        <span className="flex items-center gap-1.5">
                          <Icon name="UserCheck" size={12} className="flex-shrink-0" />
                          {t.managerName}
                        </span>
                      ) : <span className="text-muted-foreground/50">—</span>}
                    </td>
                    <td className="px-4 py-3">
                      <div>
                        <p className="font-medium">{t.name}</p>
                        <p className="text-xs text-muted-foreground">{t.createdAt}</p>
                      </div>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground font-mono text-xs">{t.inn}</td>
                    <td className="px-4 py-3"><TypeBadgeShort type={t.type} /></td>
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
                        <button onClick={() => setViewCreds(t)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Учётные данные">
                          <Icon name="KeyRound" size={15} />
                        </button>
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
                    <td colSpan={8} className="px-4 py-10 text-center text-muted-foreground text-sm">
                      Тенанты не найдены
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── Карточки ────────────────────────────────────────────────────────── */}
      {viewMode === "cards" && (
        filtered.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border px-4 py-10 text-center text-muted-foreground text-sm">
            Тенанты не найдены
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
            {filtered.map((t) => (
              <TenantCard
                key={t.id}
                tenant={t}
                canEdit={true}
                onCreds={() => setViewCreds(t)}
                onEdit={() => setEditTenant(t)}
                onSubs={() => setViewSubs(t)}
              />
            ))}
          </div>
        )
      )}
    </div>
  );
}