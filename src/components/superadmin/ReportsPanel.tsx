import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { TENANTS } from "@/data/mockData";
import type { Tenant } from "@/components/admin/types";

// ─── Утилиты ──────────────────────────────────────────────────────────────────

const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

const YEARS = [2025, 2026];

function getCurrentMonthYear() {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
}

// Генерируем мок-данные списаний за месяц на основе subscriptions тенанта
function getMonthlyWriteoffs(tenant: Tenant, month: number, year: number) {
  // Детерминированный мок: используем id тенанта + месяц как сид
  return tenant.subscriptions.map((s) => {
    const seed = (tenant.id * 17 + month * 7 + year + s.type.length) % 100;
    const writeoff = Math.max(0, Math.round((seed / 100) * s.used));
    return {
      ...s,
      writeoff,
      remaining: s.total - writeoff,
    };
  }).filter((s) => s.total > 0);
}

// ─── Экспорт в Excel (CSV) ────────────────────────────────────────────────────

function exportToExcel(month: number, year: number) {
  const monthLabel = MONTHS[month];
  const rows: string[][] = [];

  rows.push([`Закрытие месяца: ${monthLabel} ${year}`]);
  rows.push([]);
  rows.push(["Тенант", "ИНН", "Направление", "Лимит подписок", "Списано за месяц", "Остаток", "% использования"]);

  TENANTS.forEach((tenant) => {
    const writeoffs = getMonthlyWriteoffs(tenant, month, year);
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
    // Итоговая строка по тенанту
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
  a.download = `закрытие_месяца_${monthLabel}_${year}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Статус-бейдж тенанта ─────────────────────────────────────────────────────

function StatusDot({ status }: { status: Tenant["status"] }) {
  const cls =
    status === "active"    ? "bg-emerald-500" :
    status === "trial"     ? "bg-amber-400" :
                             "bg-red-500";
  return <span className={`inline-block w-2 h-2 rounded-full flex-shrink-0 ${cls}`} />;
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function ReportsPanel() {
  const { month: curMonth, year: curYear } = getCurrentMonthYear();
  const [month,        setMonth]        = useState(curMonth);
  const [year,         setYear]         = useState(curYear);
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([TENANTS[0]?.id]));

  function toggleRow(id: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  const totalWriteoffAll = TENANTS.reduce((sum, t) => {
    const wo = getMonthlyWriteoffs(t, month, year);
    return sum + wo.reduce((a, s) => a + s.writeoff, 0);
  }, 0);

  const totalLimitAll = TENANTS.reduce((sum, t) => {
    return sum + t.subscriptions.reduce((a, s) => a + s.total, 0);
  }, 0);

  return (
    <div className="space-y-5">

      {/* Заголовок отчёта */}
      <div className="bg-card rounded-2xl border border-border p-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="FileSpreadsheet" size={18} className="text-white" />
            </div>
            <div>
              <p className="font-bold text-base">Закрытие месяца</p>
              <p className="text-xs text-muted-foreground">Итоги списания подписок по каждому тенанту</p>
            </div>
          </div>

          {/* Выбор периода */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {MONTHS.map((m, i) => (
                <option key={i} value={i}>{m}</option>
              ))}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {YEARS.map((y) => (
                <option key={y} value={y}>{y}</option>
              ))}
            </select>
            <Button
              className="h-9 gap-2 rounded-xl gradient-primary text-white flex-shrink-0"
              onClick={() => exportToExcel(month, year)}
            >
              <Icon name="Download" size={15} />
              Скачать Excel
            </Button>
          </div>
        </div>

        {/* Итоговые цифры */}
        <div className="grid grid-cols-3 gap-3 mt-5">
          <div className="bg-muted/40 rounded-xl px-4 py-3 text-center">
            <p className="text-xs text-muted-foreground mb-1">Тенантов в периоде</p>
            <p className="text-2xl font-bold">{TENANTS.length}</p>
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
        {TENANTS.map((tenant) => {
          const writeoffs    = getMonthlyWriteoffs(tenant, month, year);
          const totalWriteoff = writeoffs.reduce((a, s) => a + s.writeoff, 0);
          const totalLimit    = writeoffs.reduce((a, s) => a + s.total, 0);
          const totalPct      = totalLimit > 0 ? Math.round((totalWriteoff / totalLimit) * 100) : 0;
          const isExpanded    = expandedRows.has(tenant.id);

          return (
            <div key={tenant.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              {/* Строка тенанта */}
              <button
                onClick={() => toggleRow(tenant.id)}
                className="w-full flex items-center gap-4 px-5 py-4 hover:bg-muted/20 transition-colors text-left"
              >
                <div className="flex items-center gap-2 flex-shrink-0">
                  <StatusDot status={tenant.status} />
                </div>

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
                    <p className="text-xs text-muted-foreground">Списано за {MONTHS[month]}</p>
                    <p className="font-bold text-lg text-violet-600 dark:text-violet-400">{totalWriteoff}</p>
                  </div>
                  <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
                </div>
              </button>

              {/* Детализация по направлениям */}
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
                                <Progress
                                  value={pct}
                                  className={`h-1.5 flex-1 ${warn ? "[&>div]:bg-red-500" : "[&>div]:bg-violet-500"}`}
                                />
                                <span className={`text-xs w-8 text-right flex-shrink-0 ${warn ? "text-red-500 font-medium" : "text-muted-foreground"}`}>
                                  {pct}%
                                </span>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                      {/* Итоговая строка */}
                      <tr className="border-t-2 border-border bg-muted/20">
                        <td className="px-5 py-3 font-bold text-xs uppercase tracking-wide text-muted-foreground">Итого</td>
                        <td className="px-4 py-3 text-right font-bold">{totalLimit}</td>
                        <td className="px-4 py-3 text-right font-bold text-violet-600 dark:text-violet-400">{totalWriteoff}</td>
                        <td className="px-4 py-3 text-right font-bold">{totalLimit - totalWriteoff}</td>
                        <td className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <Progress
                              value={totalPct}
                              className={`h-1.5 flex-1 ${totalPct >= 80 ? "[&>div]:bg-red-500" : "[&>div]:bg-violet-500"}`}
                            />
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