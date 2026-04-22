import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import type { Tenant, TenantType, SubscriptionBalance } from "@/components/admin/types";

// ─── Бейдж статуса ────────────────────────────────────────────────────────────

export function StatusBadge({ status }: { status: Tenant["status"] }) {
  const map = {
    active:    { label: "Активен",       cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
    suspended: { label: "Приостановлен", cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
    trial:     { label: "Пробный",       cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
  };
  const { label, cls } = map[status];
  return <Badge className={`text-xs ${cls}`}>{label}</Badge>;
}

// ─── Бейдж типа тенанта ───────────────────────────────────────────────────────

export function TypeBadge({ type }: { type: TenantType }) {
  return (
    <Badge className={`text-xs ${type === "training_center" ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" : "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300"}`}>
      {type === "training_center" ? "Учебный центр" : "Организация"}
    </Badge>
  );
}

// ─── Мини-блок подписок в строке таблицы ─────────────────────────────────────

export function SubscriptionsMini({ subs }: { subs: SubscriptionBalance[] }) {
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
