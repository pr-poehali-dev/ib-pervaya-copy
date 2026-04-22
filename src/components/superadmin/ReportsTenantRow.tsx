import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import type { Tenant } from "@/components/admin/types";

// ─── Статус-точка тенанта ─────────────────────────────────────────────────────

function StatusDot({ status }: { status: Tenant["status"] }) {
  const cls =
    status === "active" ? "bg-emerald-500" :
    status === "trial"  ? "bg-amber-400"   : "bg-red-500";
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${cls}`} />;
}

// ─── Агрегация данных по набору месяцев ──────────────────────────────────────

export function getWriteoffsForMonths(tenant: Tenant, months: number[], year: number) {
  const combined: Record<string, { label: string; total: number; writeoff: number; type: string }> = {};

  months.forEach((month) => {
    tenant.subscriptions.forEach((s) => {
      if (s.total === 0) return;
      const seed = (tenant.id * 17 + month * 7 + year + s.type.length) % 100;
      const writeoff = Math.max(0, Math.round((seed / 100) * s.used));
      if (!combined[s.type]) {
        combined[s.type] = { label: s.label, total: s.total, writeoff: 0, type: s.type };
      }
      combined[s.type].writeoff += writeoff;
    });
  });

  return Object.values(combined).map((s) => ({
    ...s,
    remaining: s.total - s.writeoff,
  }));
}

// ─── Компонент ряда тенанта ───────────────────────────────────────────────────

interface ReportsTenantRowProps {
  tenant: Tenant;
  activeMonths: number[];
  activeYear: number;
  isExpanded: boolean;
  onToggle: () => void;
}

export default function ReportsTenantRow({
  tenant,
  activeMonths,
  activeYear,
  isExpanded,
  onToggle,
}: ReportsTenantRowProps) {
  const writeoffs     = getWriteoffsForMonths(tenant, activeMonths, activeYear);
  const totalWriteoff = writeoffs.reduce((a, s) => a + s.writeoff, 0);
  const totalLimit    = writeoffs.reduce((a, s) => a + s.total, 0);
  const totalPct      = totalLimit > 0 ? Math.round((totalWriteoff / totalLimit) * 100) : 0;

  return (
    <div className="bg-card rounded-2xl border border-border overflow-hidden">
      <button
        onClick={onToggle}
        className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors text-left"
      >
        <StatusDot status={tenant.status} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{tenant.name}</p>
            <span className="text-xs text-muted-foreground font-mono">ИНН {tenant.inn}</span>
          </div>
          <div className="flex items-center gap-3 mt-1.5">
            <Progress
              value={totalPct}
              className={`h-1.5 w-32 flex-shrink-0 ${totalPct >= 80 ? "[&>div]:bg-red-500" : "[&>div]:bg-violet-500"}`}
            />
            <span className={`text-xs font-medium ${totalPct >= 80 ? "text-red-500" : "text-muted-foreground"}`}>
              {totalWriteoff} / {totalLimit} ({totalPct}%)
            </span>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-shrink-0">
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Списано за период</p>
            <p className="font-bold text-lg text-violet-600 dark:text-violet-400">{totalWriteoff}</p>
          </div>
          <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
        </div>
      </button>

      {isExpanded && (
        <div className="border-t border-border">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-muted/30">
                <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Направление</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Лимит</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Списано</th>
                <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Остаток</th>
                <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-36">Загрузка</th>
              </tr>
            </thead>
            <tbody>
              {writeoffs.map((s, idx) => {
                const pct  = s.total > 0 ? Math.round((s.writeoff / s.total) * 100) : 0;
                const warn = pct >= 80;
                return (
                  <tr key={s.type} className={`border-t border-border hover:bg-muted/10 transition-colors ${idx % 2 !== 0 ? "bg-muted/5" : ""}`}>
                    <td className="px-5 py-3 font-medium">{s.label}</td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{s.total}</td>
                    <td className={`px-4 py-3 text-right font-semibold ${warn ? "text-red-500" : "text-violet-600 dark:text-violet-400"}`}>
                      {s.writeoff}
                    </td>
                    <td className="px-4 py-3 text-right text-muted-foreground">{s.remaining}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <Progress value={pct} className={`h-1.5 flex-1 ${warn ? "[&>div]:bg-red-500" : "[&>div]:bg-violet-500"}`} />
                        <span className={`text-xs w-8 text-right flex-shrink-0 ${warn ? "text-red-500" : "text-muted-foreground"}`}>
                          {pct}%
                        </span>
                      </div>
                    </td>
                  </tr>
                );
              })}
              <tr className="border-t-2 border-border bg-muted/20">
                <td className="px-5 py-3 font-bold text-xs uppercase tracking-wide text-muted-foreground">Итого</td>
                <td className="px-4 py-3 text-right font-bold">{totalLimit}</td>
                <td className="px-4 py-3 text-right font-bold text-violet-600 dark:text-violet-400">{totalWriteoff}</td>
                <td className="px-4 py-3 text-right font-bold">{totalLimit - totalWriteoff}</td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Progress value={totalPct} className={`h-1.5 flex-1 ${totalPct >= 80 ? "[&>div]:bg-red-500" : "[&>div]:bg-violet-500"}`} />
                    <span className={`text-xs w-8 text-right flex-shrink-0 font-medium ${totalPct >= 80 ? "text-red-500" : "text-muted-foreground"}`}>
                      {totalPct}%
                    </span>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
