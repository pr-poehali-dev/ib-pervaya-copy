import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TENANTS } from "@/data/mockData";
import type { Tenant } from "@/components/admin/types";

// ─── Константы ────────────────────────────────────────────────────────────────

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const YEARS = [2024, 2025, 2026];

const QUARTERS = [
  { label: "I квартал (янв–мар)",   months: [0, 1, 2]  },
  { label: "II квартал (апр–июн)",  months: [3, 4, 5]  },
  { label: "III квартал (июл–сен)", months: [6, 7, 8]  },
  { label: "IV квартал (окт–дек)",  months: [9, 10, 11] },
];

type PeriodMode = "month" | "quarter" | "year" | "custom";

function getCurrentDate() {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
}

// ─── Агрегация данных по набору месяцев ──────────────────────────────────────

function getWriteoffsForMonths(tenant: Tenant, months: number[], year: number) {
  // Суммируем списания по всем месяцам периода
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

// ─── Построение списка месяцев по выбранному режиму ──────────────────────────

function getMonthsList(
  mode: PeriodMode,
  month: number,
  quarter: number,
  customFrom: { month: number; year: number },
  customTo: { month: number; year: number },
  year: number,
): { months: number[]; year: number; label: string } {
  if (mode === "month") {
    return { months: [month], year, label: `${MONTHS[month]} ${year}` };
  }
  if (mode === "quarter") {
    return { months: QUARTERS[quarter].months, year, label: `${QUARTERS[quarter].label} ${year}` };
  }
  if (mode === "year") {
    return { months: [0,1,2,3,4,5,6,7,8,9,10,11], year, label: `${year} год` };
  }
  // custom — только в рамках одного года (упрощение)
  const fromM = customFrom.month;
  const toM   = customTo.month;
  const mList = fromM <= toM
    ? Array.from({ length: toM - fromM + 1 }, (_, i) => fromM + i)
    : [fromM];
  return {
    months: mList,
    year: customFrom.year,
    label: `${MONTHS[fromM]} – ${MONTHS[toM]} ${customFrom.year}`,
  };
}

// ─── Экспорт в CSV ────────────────────────────────────────────────────────────

function exportToExcel(
  periodLabel: string,
  months: number[],
  year: number,
  tenantsList: Tenant[],
) {
  const rows: string[][] = [];
  rows.push([`Закрытие периода: ${periodLabel}`]);
  rows.push([]);
  rows.push(["Тенант", "ИНН", "Направление", "Лимит", "Списано за период", "Остаток", "% использования"]);

  tenantsList.forEach((tenant) => {
    const writeoffs = getWriteoffsForMonths(tenant, months, year);
    writeoffs.forEach((s, idx) => {
      const pct = s.total > 0 ? Math.round((s.writeoff / s.total) * 100) : 0;
      rows.push([
        idx === 0 ? tenant.name : "",
        idx === 0 ? tenant.inn  : "",
        s.label,
        String(s.total),
        String(s.writeoff),
        String(s.remaining),
        `${pct}%`,
      ]);
    });
    const totalWriteoff = writeoffs.reduce((a, s) => a + s.writeoff, 0);
    const totalLimit    = writeoffs.reduce((a, s) => a + s.total, 0);
    rows.push(["", "", "ИТОГО", String(totalLimit), String(totalWriteoff), String(totalLimit - totalWriteoff), ""]);
    rows.push([]);
  });

  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `отчёт_${periodLabel.replace(/\s/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Статус-точка тенанта ─────────────────────────────────────────────────────

function StatusDot({ status }: { status: Tenant["status"] }) {
  const cls =
    status === "active" ? "bg-emerald-500" :
    status === "trial"  ? "bg-amber-400"   : "bg-red-500";
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${cls}`} />;
}

// ─── Главный компонент ────────────────────────────────────────────────────────

interface ReportsPanelProps {
  tenants?: Tenant[];
}

export default function ReportsPanel({ tenants: tenantsProp }: ReportsPanelProps = {}) {
  const tenantsList = tenantsProp ?? TENANTS;

  const { month: curMonth, year: curYear } = getCurrentDate();

  const [periodMode, setPeriodMode] = useState<PeriodMode>("month");
  const [month,    setMonth]    = useState(curMonth);
  const [quarter,  setQuarter]  = useState(Math.floor(curMonth / 3));
  const [year,     setYear]     = useState(curYear);
  const [customFrom, setCustomFrom] = useState({ month: 0,        year: curYear });
  const [customTo,   setCustomTo]   = useState({ month: curMonth, year: curYear });
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([tenantsList[0]?.id]));

  function toggleRow(id: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  const { months: activeMonths, year: activeYear, label: periodLabel } = getMonthsList(
    periodMode, month, quarter, customFrom, customTo, year
  );

  const totalWriteoffAll = tenantsList.reduce((sum, t) => {
    const wo = getWriteoffsForMonths(t, activeMonths, activeYear);
    return sum + wo.reduce((a, s) => a + s.writeoff, 0);
  }, 0);
  const totalLimitAll = tenantsList.reduce((sum, t) =>
    sum + t.subscriptions.reduce((a, s) => a + s.total, 0), 0
  );

  const PERIOD_TABS: { key: PeriodMode; label: string }[] = [
    { key: "month",   label: "Месяц"  },
    { key: "quarter", label: "Квартал" },
    { key: "year",    label: "Год"    },
    { key: "custom",  label: "Период" },
  ];

  return (
    <div className="space-y-5">

      {/* Шапка отчёта */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="FileSpreadsheet" size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-base">Закрытие периода</p>
            <p className="text-xs text-muted-foreground">Итоги списания подписок по каждому тенанту · <span className="font-medium text-foreground">{periodLabel}</span></p>
          </div>
        </div>

        {/* Переключатель типа периода */}
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-fit">
          {PERIOD_TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => setPeriodMode(t.key)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                periodMode === t.key
                  ? "bg-background shadow text-foreground"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {/* Контролы периода */}
        <div className="flex items-center gap-2 flex-wrap">

          {/* Месяц */}
          {periodMode === "month" && (
            <>
              <select value={month} onChange={(e) => setMonth(Number(e.target.value))}
                className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}

          {/* Квартал */}
          {periodMode === "quarter" && (
            <>
              <select value={quarter} onChange={(e) => setQuarter(Number(e.target.value))}
                className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                {QUARTERS.map((q, i) => <option key={i} value={i}>{q.label}</option>)}
              </select>
              <select value={year} onChange={(e) => setYear(Number(e.target.value))}
                className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </>
          )}

          {/* Год */}
          {periodMode === "year" && (
            <select value={year} onChange={(e) => setYear(Number(e.target.value))}
              className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          )}

          {/* Произвольный период */}
          {periodMode === "custom" && (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-muted-foreground">С</span>
              <select value={customFrom.month}
                onChange={(e) => setCustomFrom((p) => ({ ...p, month: Number(e.target.value) }))}
                className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={customFrom.year}
                onChange={(e) => setCustomFrom((p) => ({ ...p, year: Number(e.target.value) }))}
                className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
              <span className="text-xs text-muted-foreground">по</span>
              <select value={customTo.month}
                onChange={(e) => setCustomTo((p) => ({ ...p, month: Number(e.target.value) }))}
                className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
              </select>
              <select value={customTo.year}
                onChange={(e) => setCustomTo((p) => ({ ...p, year: Number(e.target.value) }))}
                className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30">
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            </div>
          )}

          <Button
            className="h-9 gap-2 rounded-xl gradient-primary text-white flex-shrink-0 ml-auto"
            onClick={() => exportToExcel(periodLabel, activeMonths, activeYear, tenantsList)}
          >
            <Icon name="Download" size={15} />
            Скачать Excel
          </Button>
        </div>

        {/* Сводные цифры */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-muted/40 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Тенантов в периоде</p>
            <p className="text-2xl font-bold">{tenantsList.length}</p>
          </div>
          <div className="bg-muted/40 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Списано подписок</p>
            <p className="text-2xl font-bold text-violet-600 dark:text-violet-400">{totalWriteoffAll}</p>
          </div>
          <div className="bg-muted/40 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Общий лимит</p>
            <p className="text-2xl font-bold">{totalLimitAll}</p>
          </div>
        </div>
      </div>

      {/* Таблица по тенантам */}
      <div className="space-y-2">
        {tenantsList.map((tenant) => {
          const writeoffs     = getWriteoffsForMonths(tenant, activeMonths, activeYear);
          const totalWriteoff = writeoffs.reduce((a, s) => a + s.writeoff, 0);
          const totalLimit    = writeoffs.reduce((a, s) => a + s.total, 0);
          const totalPct      = totalLimit > 0 ? Math.round((totalWriteoff / totalLimit) * 100) : 0;
          const isExpanded    = expandedRows.has(tenant.id);

          return (
            <div key={tenant.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <button
                onClick={() => toggleRow(tenant.id)}
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
                                <span className={`text-xs w-8 text-right flex-shrink-0 ${warn ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
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
        })}
      </div>
    </div>
  );
}