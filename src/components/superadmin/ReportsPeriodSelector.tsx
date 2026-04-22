import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { Tenant } from "@/components/admin/types";

// ─── Константы (экспортируются для использования в ReportsPanel) ──────────────

export const MONTHS = [
  "Январь", "Февраль", "Март", "Апрель", "Май", "Июнь",
  "Июль", "Август", "Сентябрь", "Октябрь", "Ноябрь", "Декабрь",
];

export const YEARS = [2024, 2025, 2026];

export const QUARTERS = [
  { label: "I квартал (янв–мар)",   months: [0, 1, 2]  },
  { label: "II квартал (апр–июн)",  months: [3, 4, 5]  },
  { label: "III квартал (июл–сен)", months: [6, 7, 8]  },
  { label: "IV квартал (окт–дек)",  months: [9, 10, 11] },
];

export type PeriodMode = "month" | "quarter" | "year" | "custom";

// ─── Вкладки периода ──────────────────────────────────────────────────────────

const PERIOD_TABS: { key: PeriodMode; label: string }[] = [
  { key: "month",   label: "Месяц"   },
  { key: "quarter", label: "Квартал" },
  { key: "year",    label: "Год"     },
  { key: "custom",  label: "Период"  },
];

// ─── Пропсы ───────────────────────────────────────────────────────────────────

interface ReportsPeriodSelectorProps {
  periodMode: PeriodMode;
  setPeriodMode: (v: PeriodMode) => void;
  month: number;
  setMonth: (v: number) => void;
  quarter: number;
  setQuarter: (v: number) => void;
  year: number;
  setYear: (v: number) => void;
  customFrom: { month: number; year: number };
  setCustomFrom: (v: { month: number; year: number }) => void;
  customTo: { month: number; year: number };
  setCustomTo: (v: { month: number; year: number }) => void;
  periodLabel: string;
  tenantsList: Tenant[];
  totalWriteoffAll: number;
  totalLimitAll: number;
  activeMonths: number[];
  activeYear: number;
  onExport: () => void;
}

// ─── Компонент ────────────────────────────────────────────────────────────────

export default function ReportsPeriodSelector({
  periodMode, setPeriodMode,
  month, setMonth,
  quarter, setQuarter,
  year, setYear,
  customFrom, setCustomFrom,
  customTo, setCustomTo,
  periodLabel,
  tenantsList,
  totalWriteoffAll,
  totalLimitAll,
  onExport,
}: ReportsPeriodSelectorProps) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
      {/* Шапка */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
          <Icon name="FileSpreadsheet" size={18} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-base">Закрытие периода</p>
          <p className="text-xs text-muted-foreground">
            Итоги списания подписок по каждому тенанту ·{" "}
            <span className="font-medium text-foreground">{periodLabel}</span>
          </p>
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
            <select
              value={month}
              onChange={(e) => setMonth(Number(e.target.value))}
              className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </>
        )}

        {/* Квартал */}
        {periodMode === "quarter" && (
          <>
            <select
              value={quarter}
              onChange={(e) => setQuarter(Number(e.target.value))}
              className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {QUARTERS.map((q, i) => <option key={i} value={i}>{q.label}</option>)}
            </select>
            <select
              value={year}
              onChange={(e) => setYear(Number(e.target.value))}
              className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </>
        )}

        {/* Год */}
        {periodMode === "year" && (
          <select
            value={year}
            onChange={(e) => setYear(Number(e.target.value))}
            className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          >
            {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
          </select>
        )}

        {/* Произвольный период */}
        {periodMode === "custom" && (
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs text-muted-foreground">С</span>
            <select
              value={customFrom.month}
              onChange={(e) => setCustomFrom({ ...customFrom, month: Number(e.target.value) })}
              className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select
              value={customFrom.year}
              onChange={(e) => setCustomFrom({ ...customFrom, year: Number(e.target.value) })}
              className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
            <span className="text-xs text-muted-foreground">по</span>
            <select
              value={customTo.month}
              onChange={(e) => setCustomTo({ ...customTo, month: Number(e.target.value) })}
              className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
            </select>
            <select
              value={customTo.year}
              onChange={(e) => setCustomTo({ ...customTo, year: Number(e.target.value) })}
              className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
            </select>
          </div>
        )}

        <Button
          className="h-9 gap-2 rounded-xl gradient-primary text-white flex-shrink-0 ml-auto"
          onClick={onExport}
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
  );
}
