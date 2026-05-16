import Icon from "@/components/ui/icon";
import type { Tenant } from "@/components/admin/types";

interface DeadlineAlertsProps {
  tenants: Tenant[];
}

function parseDate(str?: string): Date | null {
  if (!str) return null;
  const [d, m, y] = str.split(".").map(Number);
  if (!d || !m || !y) return null;
  return new Date(y, m - 1, d);
}

function daysUntil(date: Date): number {
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.ceil((date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
}

export default function DeadlineAlerts({ tenants }: DeadlineAlertsProps) {
  const alerts: { type: "license" | "subscription"; tenantName: string; label: string; severity: "critical" | "warning" }[] = [];

  tenants.forEach((t) => {
    // Проверка лицензии
    const licDate = parseDate(t.licenseDate);
    if (licDate) {
      const days = daysUntil(licDate);
      if (days <= 30) {
        alerts.push({
          type: "license",
          tenantName: t.name,
          label: days <= 0
            ? `Лицензия истекла (${t.licenseDate})`
            : days <= 7
            ? `Лицензия истекает через ${days} дн. (${t.licenseDate})`
            : `Лицензия истекает через ${days} дн. (${t.licenseDate})`,
          severity: days <= 7 ? "critical" : "warning",
        });
      }
    }

    // Проверка подписок
    t.subscriptions.forEach((sub) => {
      if (sub.total === 0) return;
      const pct = Math.round((sub.used / sub.total) * 100);
      if (pct >= 95) {
        alerts.push({
          type: "subscription",
          tenantName: t.name,
          label: `«${sub.label}» исчерпана на ${pct}% (${sub.used}/${sub.total})`,
          severity: "critical",
        });
      } else if (pct >= 85) {
        alerts.push({
          type: "subscription",
          tenantName: t.name,
          label: `«${sub.label}» заполнена на ${pct}% (${sub.used}/${sub.total})`,
          severity: "warning",
        });
      }
    });
  });

  if (alerts.length === 0) return null;

  const critical = alerts.filter((a) => a.severity === "critical");
  const warnings = alerts.filter((a) => a.severity === "warning");

  return (
    <div className="space-y-2">
      {critical.length > 0 && (
        <div className="rounded-2xl border border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="AlertTriangle" size={15} className="text-red-600 dark:text-red-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-red-700 dark:text-red-300">Требует внимания</span>
          </div>
          <div className="space-y-1.5">
            {critical.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-red-700 dark:text-red-300">
                <span className="font-medium flex-shrink-0">{a.tenantName}:</span>
                <span>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
      {warnings.length > 0 && (
        <div className="rounded-2xl border border-amber-200 dark:border-amber-800 bg-amber-50 dark:bg-amber-900/10 p-4">
          <div className="flex items-center gap-2 mb-2">
            <Icon name="AlertCircle" size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <span className="text-sm font-semibold text-amber-700 dark:text-amber-300">Предупреждения</span>
          </div>
          <div className="space-y-1.5">
            {warnings.map((a, i) => (
              <div key={i} className="flex items-start gap-2 text-xs text-amber-700 dark:text-amber-300">
                <span className="font-medium flex-shrink-0">{a.tenantName}:</span>
                <span>{a.label}</span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
