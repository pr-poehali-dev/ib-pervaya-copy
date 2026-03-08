import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { User, allCourses, courseDirections, userColors, gradients } from "@/components/admin/types";

interface SubscriptionReportModalProps {
  open: boolean;
  onClose: () => void;
  users: User[];
}

interface LineItem {
  userId: number;
  initials: string;
  name: string;
  group: string;
  email: string;
  courseId: number;
  courseTitle: string;
  assignedAt: string;
}

type PeriodPreset = "cur_month" | "prev_month" | "cur_quarter" | "custom";

function getNow() { return new Date(); }

function getPeriodBounds(preset: PeriodPreset, customFrom: string, customTo: string): { from: Date; to: Date; label: string } {
  const now = getNow();
  const y = now.getFullYear();
  const m = now.getMonth();

  if (preset === "cur_month") {
    return {
      from: new Date(y, m, 1),
      to: new Date(y, m + 1, 0),
      label: now.toLocaleDateString("ru", { month: "long", year: "numeric" }),
    };
  }
  if (preset === "prev_month") {
    const pm = m === 0 ? 11 : m - 1;
    const py = m === 0 ? y - 1 : y;
    return {
      from: new Date(py, pm, 1),
      to: new Date(py, pm + 1, 0),
      label: new Date(py, pm, 1).toLocaleDateString("ru", { month: "long", year: "numeric" }),
    };
  }
  if (preset === "cur_quarter") {
    const q = Math.floor(m / 3);
    return {
      from: new Date(y, q * 3, 1),
      to: new Date(y, q * 3 + 3, 0),
      label: `${q + 1} квартал ${y}`,
    };
  }
  // custom
  const [fd, fm, fy] = (customFrom || "01.01.2000").split(".").map(Number);
  const [td, tm, ty] = (customTo || "31.12.2099").split(".").map(Number);
  return {
    from: new Date(fy, fm - 1, fd),
    to: new Date(ty, tm - 1, td),
    label: `${customFrom} — ${customTo}`,
  };
}

function parseDMY(s: string): Date | null {
  const p = s.split(".");
  if (p.length !== 3) return null;
  return new Date(+p[2], +p[1] - 1, +p[0]);
}

function inPeriod(dateStr: string, from: Date, to: Date): boolean {
  const d = parseDMY(dateStr);
  if (!d) return false;
  return d >= from && d <= to;
}

function dateToInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

function inputToDMY(s: string) {
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
}

function dmyToInput(s: string) {
  if (!s) return "";
  const [d, m, y] = s.split(".");
  return `${y}-${m}-${d}`;
}

function getCourseTitle(courseId: number): string {
  const simple = allCourses.find((c) => c.id === courseId);
  if (simple) return simple.title;
  const dir = courseDirections.flatMap((d) => d.courses).find((c) => c.id === courseId);
  if (dir) return `${dir.code} ${dir.title}`;
  return `Курс #${courseId}`;
}

function exportSubCSV(items: LineItem[], periodLabel: string, filterOrg: string, filterGroup: string) {
  const header = ["№", "ФИО", "Email", "Группа", "Курс", "Дата назначения"];
  const rows = items.map((r, i) => [String(i + 1), r.name, r.email, r.group, r.courseTitle, r.assignedAt]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = "\uFEFF"
    + `"Отчёт: Списание подписок";"Период: ${periodLabel}"\n`
    + (filterOrg !== "Все" ? `"Организация";"${filterOrg}"\n` : "")
    + (filterGroup !== "Все" ? `"Группа";"${filterGroup}"\n` : "")
    + `"Итого назначений";"${items.length}"\n\n`
    + [header, ...rows].map((r) => r.map(escape).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Списание_подписок_${new Date().toLocaleDateString("ru")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportSubPDF(
  items: LineItem[],
  periodLabel: string,
  groupSummary: { group: string; count: number }[],
  filterOrg: string,
  filterGroup: string,
) {
  const date = new Date().toLocaleDateString("ru", { day: "2-digit", month: "long", year: "numeric" });
  const groupRows = groupSummary.map((g) =>
    `<tr><td><b>${g.group}</b></td><td style="font-weight:700">${g.count}</td></tr>`).join("");
  const detailRows = items.map((r, i) => `
    <tr>
      <td style="color:#666">${i + 1}</td>
      <td><b>${r.name}</b><br><span style="color:#999;font-size:10px">${r.email}</span></td>
      <td>${r.group}</td>
      <td>${r.courseTitle}</td>
      <td>${r.assignedAt}</td>
    </tr>`).join("");

  const filterNote = [
    filterOrg !== "Все" ? `Организация: ${filterOrg}` : "",
    filterGroup !== "Все" ? `Группа: ${filterGroup}` : "",
  ].filter(Boolean).join(" · ");

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<title>Списание подписок — ${periodLabel}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 28px; }
  h1 { font-size: 17px; margin-bottom: 2px; }
  .sub { color: #666; font-size: 10px; margin-bottom: 18px; }
  .info { display:flex; gap:14px; margin-bottom:18px; flex-wrap:wrap; }
  .info-item { border:1px solid #e5e7eb; border-radius:8px; padding:9px 15px; }
  .info-item .val { font-size:16px; font-weight:700; color:#7c3aed; }
  .info-item .lbl { font-size:9px; color:#888; margin-top:1px; }
  table { width:100%; border-collapse:collapse; margin-bottom:18px; }
  th { background:#f3f4f6; text-align:left; padding:6px 8px; color:#555; font-size:10px; }
  td { padding:6px 8px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
  tr:last-child td { border:none; }
  h2 { font-size:12px; margin:16px 0 5px; border-left:3px solid #7c3aed; padding-left:6px; }
  tfoot td { font-weight:700; background:#f9fafb; }
  @media print { body { padding:14px; } }
</style></head><body>
<h1>Списание подписок за период</h1>
<div class="sub">Период: ${periodLabel}${filterNote ? " · " + filterNote : ""} · Сформирован: ${date}</div>
<div class="info">
  <div class="info-item"><div class="val">${items.length}</div><div class="lbl">Назначений</div></div>
  <div class="info-item"><div class="val">${new Set(items.map(i => i.userId)).size}</div><div class="lbl">Слушателей</div></div>
  <div class="info-item"><div class="val">${groupSummary.length}</div><div class="lbl">Групп</div></div>
</div>
<h2>Сводка по группам</h2>
<table><thead><tr><th>Группа</th><th>Назначений</th></tr></thead>
<tbody>${groupRows}
<tr style="background:#f9fafb"><td style="font-weight:700">ИТОГО</td><td style="font-weight:700">${items.length}</td></tr>
</tbody></table>
<h2>Детализация</h2>
<table><thead><tr><th>№</th><th>ФИО / Email</th><th>Группа</th><th>Курс</th><th>Дата назначения</th></tr></thead>
<tbody>${detailRows}</tbody>
<tfoot><tr><td colspan="4">ИТОГО назначений</td><td style="font-weight:700">${items.length}</td></tr></tfoot>
</table>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

type ViewMode = "groups" | "detail";

const PRESET_OPTIONS: { id: PeriodPreset; label: string; icon: string }[] = [
  { id: "cur_month",   label: "Текущий месяц",    icon: "Calendar" },
  { id: "prev_month",  label: "Прошлый месяц",    icon: "CalendarMinus" },
  { id: "cur_quarter", label: "Текущий квартал",  icon: "CalendarRange" },
  { id: "custom",      label: "Свой период",      icon: "CalendarSearch" },
];

export default function SubscriptionReportModal({ open, onClose, users }: SubscriptionReportModalProps) {
  const [preset, setPreset] = useState<PeriodPreset>("cur_month");
  const [customFrom, setCustomFrom] = useState(dateToInput(new Date(getNow().getFullYear(), 0, 1)));
  const [customTo,   setCustomTo]   = useState(dateToInput(getNow()));
  const [filterOrg,   setFilterOrg]   = useState("Все");
  const [filterGroup, setFilterGroup] = useState("Все");
  const [view, setView] = useState<ViewMode>("groups");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const { from, to, label: periodLabel } = useMemo(
    () => getPeriodBounds(preset, inputToDMY(customFrom), inputToDMY(customTo)),
    [preset, customFrom, customTo]
  );

  const orgOptions  = useMemo(() => ["Все", ...Array.from(new Set(users.map((u) => u.group))).sort()], [users]);
  // В данных нет отдельного поля "организация", группа = организация; "группа" — это подгруппа
  // Используем группы как организации, а подгруппы берём из группы (первые буквы до цифры)
  const groupOptions = useMemo(() => {
    const base = filterOrg === "Все" ? users : users.filter((u) => u.group === filterOrg);
    return ["Все", ...Array.from(new Set(base.map((u) => u.group))).sort()];
  }, [users, filterOrg]);

  const lineItems = useMemo<LineItem[]>(() => {
    const items: LineItem[] = [];
    users.forEach((u) => {
      if (filterOrg !== "Все" && u.group !== filterOrg) return;
      if (filterGroup !== "Все" && u.group !== filterGroup) return;
      u.assignments.forEach((a) => {
        if (inPeriod(a.assignedAt, from, to)) {
          items.push({
            userId: u.id,
            initials: u.initials,
            name: u.name,
            group: u.group,
            email: u.email,
            courseId: a.courseId,
            courseTitle: getCourseTitle(a.courseId),
            assignedAt: a.assignedAt,
          });
        }
      });
    });
    return items;
  }, [users, from, to, filterOrg, filterGroup]);

  const groupSummary = useMemo(() => {
    const map = new Map<string, { count: number; items: LineItem[] }>();
    lineItems.forEach((item) => {
      const prev = map.get(item.group) ?? { count: 0, items: [] };
      map.set(item.group, { count: prev.count + 1, items: [...prev.items, item] });
    });
    return Array.from(map.entries())
      .map(([group, v], idx) => ({ group, count: v.count, items: v.items, idx }))
      .sort((a, b) => b.count - a.count);
  }, [lineItems]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
              <Icon name="CreditCard" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Списание подписок за период</h2>
              <p className="text-xs text-muted-foreground">Детализация назначений по организациям и группам</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSubCSV(lineItems, periodLabel, filterOrg, filterGroup)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileSpreadsheet" size={14} />
              Excel
            </button>
            <button
              onClick={() => exportSubPDF(lineItems, periodLabel, groupSummary, filterOrg, filterGroup)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-700 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileText" size={14} />
              PDF
            </button>
            <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors ml-1">
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Параметры */}
        <div className="px-6 py-4 border-b border-border bg-muted/20 flex-shrink-0 space-y-4">

          {/* Период */}
          <div className="space-y-2">
            <p className="text-xs font-medium text-muted-foreground">Период</p>
            <div className="flex flex-wrap gap-2">
              {PRESET_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPreset(p.id)}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-sm font-medium border transition-colors ${
                    preset === p.id
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border-border text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  <Icon name={p.icon} size={14} />
                  {p.label}
                </button>
              ))}
            </div>
            {preset === "custom" && (
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">С</span>
                  <input
                    type="date"
                    value={customFrom}
                    onChange={(e) => setCustomFrom(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 cursor-pointer"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground whitespace-nowrap">По</span>
                  <input
                    type="date"
                    value={customTo}
                    min={customFrom}
                    onChange={(e) => setCustomTo(e.target.value)}
                    className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 focus:border-violet-400 cursor-pointer"
                  />
                </div>
              </div>
            )}
          </div>

          {/* Фильтры */}
          <div className="flex flex-wrap gap-3">
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Организация</p>
              <select
                value={filterOrg}
                onChange={(e) => { setFilterOrg(e.target.value); setFilterGroup("Все"); }}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
              >
                {orgOptions.map((o) => <option key={o} value={o}>{o === "Все" ? "Все организации" : o}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <p className="text-xs text-muted-foreground">Группа</p>
              <select
                value={filterGroup}
                onChange={(e) => setFilterGroup(e.target.value)}
                className="px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 cursor-pointer"
              >
                {groupOptions.map((g) => <option key={g} value={g}>{g === "Все" ? "Все группы" : g}</option>)}
              </select>
            </div>
            {(filterOrg !== "Все" || filterGroup !== "Все") && (
              <div className="flex items-end">
                <button
                  onClick={() => { setFilterOrg("Все"); setFilterGroup("Все"); }}
                  className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border text-sm text-muted-foreground hover:text-foreground hover:bg-muted/40 transition-colors"
                >
                  <Icon name="X" size={13} />
                  Сбросить
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Сводка */}
        <div className="flex items-center gap-6 px-6 py-3 border-b border-border flex-shrink-0 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-violet-500">{lineItems.length}</span>
            <span className="text-xs text-muted-foreground">назначений</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-cyan-500">{new Set(lineItems.map((i) => i.userId)).size}</span>
            <span className="text-xs text-muted-foreground">слушателей</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xl font-bold text-blue-500">{groupSummary.length}</span>
            <span className="text-xs text-muted-foreground">групп</span>
          </div>
          <div className="ml-auto flex items-center gap-2 bg-violet-50 dark:bg-violet-900/20 border border-violet-200 dark:border-violet-800 rounded-xl px-4 py-2">
            <Icon name="Calendar" size={14} className="text-violet-500" />
            <span className="text-xs text-muted-foreground">Период:</span>
            <span className="text-sm font-semibold text-violet-700 dark:text-violet-300">{periodLabel}</span>
          </div>
        </div>

        {/* Переключатель вида */}
        <div className="flex gap-1 px-6 pt-3 flex-shrink-0">
          {([["groups", "UsersRound", "По группам"], ["detail", "List", "Детализация"]] as const).map(([id, icon, label]) => (
            <button
              key={id}
              onClick={() => setView(id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                view === id
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <Icon name={icon} size={14} />
              {label}
            </button>
          ))}
        </div>

        {/* Контент */}
        <div className="overflow-y-auto flex-1 p-6">
          {lineItems.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full py-16 text-center gap-3">
              <div className="w-14 h-14 bg-muted rounded-2xl flex items-center justify-center">
                <Icon name="CreditCard" size={26} className="text-muted-foreground" />
              </div>
              <p className="font-semibold text-sm">Нет назначений за выбранный период</p>
              <p className="text-xs text-muted-foreground">Попробуйте изменить период или сбросить фильтры</p>
            </div>
          ) : view === "groups" ? (
            <div className="space-y-3">
              {groupSummary.map((g) => {
                const isOpen = expandedGroup === g.group;
                return (
                  <div key={g.group} className="bg-card rounded-2xl border border-border overflow-hidden">
                    <button
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30 ${isOpen ? "bg-violet-50/50 dark:bg-violet-900/10" : ""}`}
                      onClick={() => setExpandedGroup(isOpen ? null : g.group)}
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradients[g.idx % gradients.length]} flex items-center justify-center flex-shrink-0`}>
                        <Icon name="UsersRound" size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{g.group}</p>
                        <p className="text-xs text-muted-foreground">{new Set(g.items.map(i => i.userId)).size} слушателей</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-xl font-bold text-violet-600 dark:text-violet-400">{g.count}</p>
                          <p className="text-xs text-muted-foreground">назначений</p>
                        </div>
                        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
                      </div>
                    </button>

                    {isOpen && (
                      <div className="border-t border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Слушатель</th>
                              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Курс</th>
                              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
                            </tr>
                          </thead>
                          <tbody>
                            {g.items.map((item, ii) => (
                              <tr key={`${item.userId}-${item.courseId}`} className={`${ii > 0 ? "border-t border-border/50" : ""} hover:bg-muted/10 transition-colors`}>
                                <td className="px-5 py-2.5">
                                  <div className="flex items-center gap-2">
                                    <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${userColors[item.userId % userColors.length]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                                      {item.initials}
                                    </div>
                                    <div>
                                      <p className="font-medium text-sm leading-tight">{item.name}</p>
                                      <p className="text-xs text-muted-foreground">{item.email}</p>
                                    </div>
                                  </div>
                                </td>
                                <td className="px-4 py-2.5 text-sm text-muted-foreground max-w-[200px]">
                                  <span className="block truncate">{item.courseTitle}</span>
                                </td>
                                <td className="px-4 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{item.assignedAt}</td>
                              </tr>
                            ))}
                            <tr className="border-t border-border bg-muted/20">
                              <td colSpan={2} className="px-5 py-2 text-xs font-semibold text-muted-foreground">Итого по {g.group}</td>
                              <td className="px-4 py-2 font-bold text-violet-600 dark:text-violet-400 text-sm">{g.count} назн.</td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                );
              })}

              {/* Итого */}
              <div className="flex items-center justify-between bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl px-6 py-4 text-white">
                <div className="flex items-center gap-2">
                  <Icon name="CreditCard" size={18} />
                  <span className="font-semibold">ИТОГО назначений за {periodLabel}</span>
                </div>
                <span className="text-2xl font-bold">{lineItems.length}</span>
              </div>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-10">№</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Слушатель</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Группа</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Курс</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
                  </tr>
                </thead>
                <tbody>
                  {lineItems.map((item, i) => (
                    <tr key={`${item.userId}-${item.courseId}-${i}`} className="border-b border-border/60 hover:bg-muted/20 transition-colors">
                      <td className="px-4 py-3 text-xs text-muted-foreground">{i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <div className={`w-7 h-7 rounded-lg bg-gradient-to-br ${userColors[item.userId % userColors.length]} flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0`}>
                            {item.initials}
                          </div>
                          <div>
                            <p className="font-medium leading-tight">{item.name}</p>
                            <p className="text-xs text-muted-foreground">{item.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="px-2.5 py-1 rounded-lg bg-muted text-xs font-medium">{item.group}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground max-w-[200px]">
                        <span className="block truncate">{item.courseTitle}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{item.assignedAt}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/30">
                    <td colSpan={4} className="px-4 py-3 font-bold text-sm">ИТОГО назначений</td>
                    <td className="px-4 py-3 font-bold text-violet-600 dark:text-violet-400 text-base">{lineItems.length}</td>
                  </tr>
                </tfoot>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
