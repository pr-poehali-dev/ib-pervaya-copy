import { useState } from "react";
import { TENANTS } from "@/data/mockData";
import type { Tenant } from "@/components/admin/types";
import ReportsPeriodSelector, {
  MONTHS,
  YEARS,
  QUARTERS,
  type PeriodMode,
} from "./ReportsPeriodSelector";
import ReportsTenantRow, { getWriteoffsForMonths } from "./ReportsTenantRow";

// ─── Утилиты ──────────────────────────────────────────────────────────────────

function getCurrentDate() {
  const now = new Date();
  return { month: now.getMonth(), year: now.getFullYear() };
}

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

// ─── Главный компонент ────────────────────────────────────────────────────────

interface ReportsPanelProps {
  tenants?: Tenant[];
}

export default function ReportsPanel({ tenants: tenantsProp }: ReportsPanelProps = {}) {
  const tenantsList = tenantsProp ?? TENANTS;

  const { month: curMonth, year: curYear } = getCurrentDate();

  const [periodMode,  setPeriodMode]  = useState<PeriodMode>("month");
  const [month,       setMonth]       = useState(curMonth);
  const [quarter,     setQuarter]     = useState(Math.floor(curMonth / 3));
  const [year,        setYear]        = useState(curYear);
  const [customFrom,  setCustomFrom]  = useState({ month: 0,        year: curYear });
  const [customTo,    setCustomTo]    = useState({ month: curMonth,  year: curYear });
  const [expandedRows, setExpandedRows] = useState<Set<number>>(new Set([tenantsList[0]?.id]));

  function toggleRow(id: number) {
    setExpandedRows((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  const { months: activeMonths, year: activeYear, label: periodLabel } = getMonthsList(
    periodMode, month, quarter, customFrom, customTo, year,
  );

  const totalWriteoffAll = tenantsList.reduce((sum, t) => {
    const wo = getWriteoffsForMonths(t, activeMonths, activeYear);
    return sum + wo.reduce((a, s) => a + s.writeoff, 0);
  }, 0);
  const totalLimitAll = tenantsList.reduce((sum, t) =>
    sum + t.subscriptions.reduce((a, s) => a + s.total, 0), 0,
  );

  return (
    <div className="space-y-5">
      <ReportsPeriodSelector
        periodMode={periodMode}  setPeriodMode={setPeriodMode}
        month={month}            setMonth={setMonth}
        quarter={quarter}        setQuarter={setQuarter}
        year={year}              setYear={setYear}
        customFrom={customFrom}  setCustomFrom={setCustomFrom}
        customTo={customTo}      setCustomTo={setCustomTo}
        periodLabel={periodLabel}
        tenantsList={tenantsList}
        totalWriteoffAll={totalWriteoffAll}
        totalLimitAll={totalLimitAll}
        activeMonths={activeMonths}
        activeYear={activeYear}
        onExport={() => exportToExcel(periodLabel, activeMonths, activeYear, tenantsList)}
      />

      {/* Таблица по тенантам */}
      <div className="space-y-2">
        {tenantsList.map((tenant) => (
          <ReportsTenantRow
            key={tenant.id}
            tenant={tenant}
            activeMonths={activeMonths}
            activeYear={activeYear}
            isExpanded={expandedRows.has(tenant.id)}
            onToggle={() => toggleRow(tenant.id)}
          />
        ))}
      </div>
    </div>
  );
}
