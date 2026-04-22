import Icon from "@/components/ui/icon";
import { COURSE_DIRECTIONS } from "@/data/mockData";
import type { Tenant } from "@/components/admin/types";
import { TypeBadge, StatusBadge } from "./TenantsBadges";

interface TenantCardProps {
  tenant: Tenant;
  onCreds: () => void;
  onEdit: () => void;
  onSubs: () => void;
  canEdit: boolean;
}

export default function TenantCard({
  tenant,
  onCreds,
  onEdit,
  onSubs,
  canEdit,
}: TenantCardProps) {
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
