import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { TENANTS, COURSE_DIRECTIONS } from "@/data/mockData";
import type { Tenant, TenantType } from "@/components/admin/types";
import { StatusBadge, TypeBadge, SubscriptionsMini } from "./TenantsBadges";
import { TenantCredentialsModal, TenantSubscriptionsModal } from "./TenantsModals";
import { TenantModal } from "./TenantModal";

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
