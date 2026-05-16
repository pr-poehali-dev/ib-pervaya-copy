import { useState, useMemo } from "react";
import { TENANTS } from "@/data/tenants";
import { INITIAL_USERS } from "@/data/users";
import { ALL_COURSES } from "@/data/courses";
import type { Tenant } from "@/types/admin";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { MONTHS, YEARS, QUARTERS } from "./ReportsPeriodSelector";
import type { PeriodMode } from "./ReportsPeriodSelector";

// ─── Генерация строк детального отчёта ───────────────────────────────────────

interface WriteoffRow {
  tenantName: string;
  tenantInn: string;
  course: string;
  date: string;
  userName: string;
}

function generateRows(tenants: Tenant[], months: number[], year: number): WriteoffRow[] {
  const rows: WriteoffRow[] = [];
  const users = INITIAL_USERS;
  const courses = ALL_COURSES;

  tenants.forEach((tenant) => {
    const tenantUsers = users.filter(
      (u) => u.tenantId === tenant.id || (tenant.id === 1 && !u.tenantId)
    );

    tenant.subscriptions.forEach((sub) => {
      if (sub.total === 0) return;

      months.forEach((month) => {
        const seed = (tenant.id * 17 + month * 7 + year + sub.type.length) % 100;
        const writeoff = Math.max(0, Math.round((seed / 100) * sub.used));

        for (let i = 0; i < writeoff; i++) {
          const user = tenantUsers[i % Math.max(tenantUsers.length, 1)];
          const course = courses.find(
            (c) => c.direction === sub.type || i % courses.length === courses.indexOf(c)
          ) ?? courses[i % courses.length];

          const day = ((tenant.id * 3 + i * 7 + month) % 28) + 1;
          const dateStr = `${String(day).padStart(2, "0")}.${String(month + 1).padStart(2, "0")}.${year}`;

          rows.push({
            tenantName: tenant.name,
            tenantInn: tenant.inn ?? "—",
            course: course?.title ?? sub.label,
            date: dateStr,
            userName: user
              ? `${user.lastName ?? ""} ${user.firstName ?? ""} ${user.middleName ?? ""}`.trim()
              : "Сотрудник " + (i + 1),
          });
        }
      });
    });
  });

  return rows;
}

// ─── Утилиты периода ─────────────────────────────────────────────────────────

function getMonthsList(
  mode: PeriodMode,
  month: number,
  quarter: number,
  customFrom: { month: number; year: number },
  customTo: { month: number; year: number },
  year: number,
): { months: number[]; year: number; label: string } {
  const curYear = new Date().getFullYear();
  if (mode === "month") return { months: [month], year, label: `${MONTHS[month]} ${year}` };
  if (mode === "quarter") return { months: QUARTERS[quarter].months, year, label: `${QUARTERS[quarter].label} ${year}` };
  if (mode === "year") return { months: [0,1,2,3,4,5,6,7,8,9,10,11], year, label: `${year} год` };
  if (mode === "prev_year") return { months: [0,1,2,3,4,5,6,7,8,9,10,11], year: curYear - 1, label: `${curYear - 1} год` };
  const fromM = customFrom.month;
  const toM = customTo.month;
  const mList = fromM <= toM
    ? Array.from({ length: toM - fromM + 1 }, (_, i) => fromM + i)
    : [fromM];
  return { months: mList, year: customFrom.year, label: `${MONTHS[fromM]} – ${MONTHS[toM]} ${customFrom.year}` };
}

// ─── Экспорт CSV ──────────────────────────────────────────────────────────────

function exportCSV(rows: WriteoffRow[], label: string) {
  const header = ["Тенант", "ИНН тенанта", "Курс", "Дата списания", "ФИО обучающегося"];
  const data = rows.map((r) => [r.tenantName, r.tenantInn, r.course, r.date, r.userName]);
  const csv = [header, ...data].map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `пользовательский_отчёт_${label.replace(/\s/g, "_")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

// ─── Типы вкладок периода ─────────────────────────────────────────────────────

type CustomPeriodMode = "month" | "quarter" | "year" | "prev_year" | "custom";

const PERIOD_TABS: { key: CustomPeriodMode; label: string }[] = [
  { key: "month",     label: "Месяц" },
  { key: "quarter",   label: "Квартал" },
  { key: "year",      label: "Текущий год" },
  { key: "prev_year", label: "Прошлый год" },
  { key: "custom",    label: "Период" },
];

// ─── Компонент ────────────────────────────────────────────────────────────────

export default function CustomReportPanel() {
  const allTenants = TENANTS;
  const curDate = new Date();
  const curMonth = curDate.getMonth();
  const curYear = curDate.getFullYear();

  const [selectedTenants, setSelectedTenants] = useState<number[]>(allTenants.map((t) => t.id));
  const [periodMode, setPeriodMode] = useState<CustomPeriodMode>("month");
  const [month, setMonth] = useState(curMonth);
  const [quarter, setQuarter] = useState(Math.floor(curMonth / 3));
  const [year, setYear] = useState(curYear);
  const [customFrom, setCustomFrom] = useState({ month: 0, year: curYear });
  const [customTo, setCustomTo] = useState({ month: curMonth, year: curYear });

  const { months, year: activeYear, label } = useMemo(
    () => getMonthsList(periodMode as PeriodMode, month, quarter, customFrom, customTo, year),
    [periodMode, month, quarter, customFrom, customTo, year],
  );

  const activeTenants = allTenants.filter((t) => selectedTenants.includes(t.id));

  const rows = useMemo(
    () => generateRows(activeTenants, months, activeYear),
    [activeTenants, months, activeYear],
  );

  function toggleTenant(id: number) {
    setSelectedTenants((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );
  }

  function toggleAll() {
    setSelectedTenants(
      selectedTenants.length === allTenants.length ? [] : allTenants.map((t) => t.id)
    );
  }

  return (
    <div className="space-y-4">
      {/* Шапка */}
      <div className="bg-card rounded-2xl border border-border p-5 space-y-5">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="SlidersHorizontal" size={18} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-base">Пользовательский отчёт</p>
            <p className="text-xs text-muted-foreground">
              Детализация по каждому списанию подписки ·{" "}
              <span className="font-medium text-foreground">{label}</span>
              {" · "}
              <span className="font-medium text-foreground">{rows.length} строк</span>
            </p>
          </div>
          <Button
            size="sm"
            className="ml-auto gap-2 bg-blue-600 hover:bg-blue-700 text-white"
            onClick={() => exportCSV(rows, label)}
            disabled={rows.length === 0}
          >
            <Icon name="FileSpreadsheet" size={14} />
            Скачать Excel
          </Button>
        </div>

        {/* Выбор тенантов */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Тенанты</p>
            <button
              onClick={toggleAll}
              className="text-xs text-blue-600 hover:text-blue-700 font-medium"
            >
              {selectedTenants.length === allTenants.length ? "Снять все" : "Выбрать все"}
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {allTenants.map((t) => {
              const active = selectedTenants.includes(t.id);
              return (
                <button
                  key={t.id}
                  onClick={() => toggleTenant(t.id)}
                  className={`px-3 py-1.5 rounded-xl border text-xs font-medium transition-colors ${
                    active
                      ? "bg-blue-600 border-blue-600 text-white"
                      : "border-border text-muted-foreground hover:border-blue-400 hover:text-foreground"
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>
        </div>

        {/* Переключатель периода */}
        <div className="space-y-3">
          <div className="flex gap-1 bg-muted/40 rounded-xl p-1 w-fit flex-wrap">
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

          <div className="flex items-center gap-2 flex-wrap">
            {periodMode === "month" && (
              <>
                <select
                  value={month}
                  onChange={(e) => setMonth(Number(e.target.value))}
                  className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                >
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                >
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </>
            )}
            {periodMode === "quarter" && (
              <>
                <select
                  value={quarter}
                  onChange={(e) => setQuarter(Number(e.target.value))}
                  className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                >
                  {QUARTERS.map((q, i) => <option key={i} value={i}>{q.label}</option>)}
                </select>
                <select
                  value={year}
                  onChange={(e) => setYear(Number(e.target.value))}
                  className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                >
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </>
            )}
            {periodMode === "year" && (
              <select
                value={year}
                onChange={(e) => setYear(Number(e.target.value))}
                className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
              >
                {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
              </select>
            )}
            {periodMode === "custom" && (
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={customFrom.month}
                  onChange={(e) => setCustomFrom({ ...customFrom, month: Number(e.target.value) })}
                  className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                >
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select
                  value={customFrom.year}
                  onChange={(e) => setCustomFrom({ ...customFrom, year: Number(e.target.value) })}
                  className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                >
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
                <span className="text-xs text-muted-foreground">—</span>
                <select
                  value={customTo.month}
                  onChange={(e) => setCustomTo({ ...customTo, month: Number(e.target.value) })}
                  className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                >
                  {MONTHS.map((m, i) => <option key={i} value={i}>{m}</option>)}
                </select>
                <select
                  value={customTo.year}
                  onChange={(e) => setCustomTo({ ...customTo, year: Number(e.target.value) })}
                  className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none"
                >
                  {YEARS.map((y) => <option key={y} value={y}>{y}</option>)}
                </select>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Таблица */}
      {rows.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <Icon name="FileX" size={32} className="text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Нет данных за выбранный период</p>
        </div>
      ) : (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/30 border-b border-border">
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-8">№</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Тенант</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ИНН тенанта</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Курс</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Дата списания</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">ФИО обучающегося</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((row, idx) => (
                  <tr
                    key={idx}
                    className={`border-t border-border hover:bg-muted/10 transition-colors ${idx % 2 !== 0 ? "bg-muted/5" : ""}`}
                  >
                    <td className="px-4 py-2.5 text-xs text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-2.5 font-medium text-sm">{row.tenantName}</td>
                    <td className="px-4 py-2.5 text-sm font-mono text-muted-foreground">{row.tenantInn}</td>
                    <td className="px-4 py-2.5 text-sm">{row.course}</td>
                    <td className="px-4 py-2.5 text-sm text-muted-foreground">{row.date}</td>
                    <td className="px-4 py-2.5 text-sm">{row.userName}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
