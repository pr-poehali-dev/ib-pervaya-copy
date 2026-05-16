import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { TENANTS, COURSE_DIRECTIONS } from "@/data/mockData";
import type { Tenant, TenantType } from "@/components/admin/types";
import { StatusBadge, SubscriptionsMini } from "./TenantsBadges";
import { TenantCredentialsModal, TenantSubscriptionsModal } from "./TenantsModals";
import { TenantModal } from "./TenantModal";
import TenantCard from "./TenantCard";
import TenantsFiltersBar from "./TenantsFiltersBar";

type ViewMode = "table" | "cards";

interface TenantsPanelProps {
  initialTenants?: Tenant[];
  canCreate?: boolean;
  canEdit?: boolean;
}

// ─── Сокращённый бейдж типа для таблицы ──────────────────────────────────────

function TypeBadgeShort({ type }: { type: TenantType }) {
  return (
    <Badge className={`text-xs ${type === "training_center" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
      {type === "training_center" ? "УЦ" : "Орг."}
    </Badge>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function TenantsPanel({ initialTenants, canCreate = true, canEdit = true }: TenantsPanelProps) {
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

      <TenantsFiltersBar
        search={search}           setSearch={setSearch}
        typeFilter={typeFilter}   setTypeFilter={setTypeFilter}
        viewMode={viewMode}       setViewMode={setViewMode}
        canCreate={canCreate}     onAdd={() => setEditTenant(null)}
      />

      <p className="text-xs text-muted-foreground">
        Показано <span className="font-medium text-foreground">{filtered.length}</span> из <span className="font-medium text-foreground">{tenants.length}</span> тенантов
      </p>

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
                        {canEdit && (
                          <button onClick={() => setEditTenant(t)} className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Редактировать">
                            <Icon name="Settings" size={15} />
                          </button>
                        )}
                        {canEdit && (
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground" title="Войти как тенант">
                            <Icon name="LogIn" size={15} />
                          </button>
                        )}
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
                canEdit={canEdit}
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