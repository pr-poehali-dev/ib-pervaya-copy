import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { User, allCourses, courseDirections, userColors, gradients } from "@/components/admin/types";

interface SubscriptionReportModalProps {
  open: boolean;
  onClose: () => void;
  users: User[];
}

// Тарифные планы (цена за 1 назначение/подписку)
const TARIFF_OPTIONS = [
  { id: "base",    label: "Базовый",       price: 1500  },
  { id: "standart",label: "Стандарт",      price: 2500  },
  { id: "pro",     label: "Профессионал",  price: 4000  },
  { id: "corp",    label: "Корпоративный", price: 6000  },
];

const PERIOD_OPTIONS = [
  { id: "jan25",  label: "Январь 2025",    from: "01.01.2025", to: "31.01.2025" },
  { id: "feb25",  label: "Февраль 2025",   from: "01.02.2025", to: "28.02.2025" },
  { id: "mar25",  label: "Март 2025",      from: "01.03.2025", to: "31.03.2025" },
  { id: "q125",   label: "I квартал 2025", from: "01.01.2025", to: "31.03.2025" },
  { id: "h125",   label: "I полугодие 2025", from: "01.01.2025", to: "30.06.2025" },
  { id: "all",    label: "Всё время",      from: "01.01.2000", to: "31.12.2099" },
];

function parseDate(s: string): Date | null {
  const parts = s.split(".");
  if (parts.length !== 3) return null;
  return new Date(+parts[2], +parts[1] - 1, +parts[0]);
}

function inPeriod(dateStr: string, from: string, to: string): boolean {
  const d = parseDate(dateStr);
  const f = parseDate(from);
  const t = parseDate(to);
  if (!d || !f || !t) return false;
  return d >= f && d <= t;
}

function getCourseTitle(courseId: number): string {
  const simple = allCourses.find((c) => c.id === courseId);
  if (simple) return simple.title;
  const dir = courseDirections.flatMap((d) => d.courses).find((c) => c.id === courseId);
  if (dir) return `${dir.code} ${dir.title}`;
  return `Курс #${courseId}`;
}

function fmt(n: number) {
  return n.toLocaleString("ru-RU") + " ₽";
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
  price: number;
}

function exportSubCSV(items: LineItem[], period: string, tariff: string, total: number) {
  const header = ["№", "ФИО", "Email", "Группа", "Курс", "Дата назначения", "Сумма, ₽"];
  const rows = items.map((r, i) => [String(i + 1), r.name, r.email, r.group, r.courseTitle, r.assignedAt, String(r.price)]);
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = "\uFEFF"
    + `"Отчёт: Списание подписок за период";"${period}"\n`
    + `"Тариф";"${tariff}"\n`
    + `"Итого";"${total} ₽"\n\n`
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
  period: string,
  tariffLabel: string,
  tariffPrice: number,
  total: number,
  groupSummary: { group: string; count: number; sum: number }[]
) {
  const date = new Date().toLocaleDateString("ru", { day: "2-digit", month: "long", year: "numeric" });
  const groupRows = groupSummary.map((g) => `
    <tr><td><b>${g.group}</b></td><td>${g.count}</td><td><b>${g.sum.toLocaleString("ru")} ₽</b></td></tr>`).join("");
  const detailRows = items.map((r, i) => `
    <tr>
      <td style="color:#666">${i + 1}</td>
      <td><b>${r.name}</b><br><span style="color:#999;font-size:10px">${r.email}</span></td>
      <td>${r.group}</td>
      <td>${r.courseTitle}</td>
      <td>${r.assignedAt}</td>
      <td style="text-align:right;font-weight:600">${r.price.toLocaleString("ru")} ₽</td>
    </tr>`).join("");

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<title>Списание подписок — ${period}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 28px; }
  h1 { font-size: 17px; margin-bottom: 2px; }
  .sub { color: #666; font-size: 10px; margin-bottom: 18px; }
  .info { display:flex; gap:16px; margin-bottom:18px; flex-wrap:wrap; }
  .info-item { border:1px solid #e5e7eb; border-radius:8px; padding:9px 15px; }
  .info-item .val { font-size:15px; font-weight:700; color:#7c3aed; }
  .info-item .lbl { font-size:9px; color:#888; margin-top:1px; }
  .total { font-size:18px; font-weight:700; color:#16a34a; }
  table { width:100%; border-collapse:collapse; margin-bottom:18px; }
  th { background:#f3f4f6; text-align:left; padding:6px 8px; color:#555; font-size:10px; }
  td { padding:6px 8px; border-bottom:1px solid #f0f0f0; vertical-align:top; }
  tr:last-child td { border:none; }
  h2 { font-size:12px; margin:16px 0 5px; border-left:3px solid #7c3aed; padding-left:6px; }
  @media print { body { padding:14px; } }
</style></head><body>
<h1>Списание подписок за период</h1>
<div class="sub">Период: ${period} · Тариф: ${tariffLabel} (${tariffPrice.toLocaleString("ru")} ₽/назначение) · Сформирован: ${date}</div>
<div class="info">
  <div class="info-item"><div class="val">${items.length}</div><div class="lbl">Назначений</div></div>
  <div class="info-item"><div class="val">${new Set(items.map(i => i.userId)).size}</div><div class="lbl">Слушателей</div></div>
  <div class="info-item"><div class="val">${groupSummary.length}</div><div class="lbl">Групп</div></div>
  <div class="info-item"><div class="val total">${total.toLocaleString("ru")} ₽</div><div class="lbl">Итого к списанию</div></div>
</div>
<h2>Сводка по группам</h2>
<table><thead><tr><th>Группа</th><th>Назначений</th><th>Сумма</th></tr></thead>
<tbody>${groupRows}</tbody></table>
<h2>Детализация</h2>
<table><thead><tr><th>№</th><th>ФИО / Email</th><th>Группа</th><th>Курс</th><th>Дата назначения</th><th style="text-align:right">Сумма</th></tr></thead>
<tbody>${detailRows}</tbody>
<tfoot><tr style="background:#f9fafb"><td colspan="5" style="font-weight:700;padding:8px">ИТОГО</td><td style="font-weight:700;text-align:right;padding:8px;color:#16a34a">${total.toLocaleString("ru")} ₽</td></tr></tfoot>
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

export default function SubscriptionReportModal({ open, onClose, users }: SubscriptionReportModalProps) {
  const [periodId, setPeriodId] = useState("q125");
  const [tariffId, setTariffId] = useState("standart");
  const [view, setView] = useState<ViewMode>("groups");
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const period = PERIOD_OPTIONS.find((p) => p.id === periodId)!;
  const tariff = TARIFF_OPTIONS.find((t) => t.id === tariffId)!;

  const lineItems = useMemo<LineItem[]>(() => {
    const items: LineItem[] = [];
    users.forEach((u) => {
      u.assignments.forEach((a) => {
        if (inPeriod(a.assignedAt, period.from, period.to)) {
          items.push({
            userId: u.id,
            initials: u.initials,
            name: u.name,
            group: u.group,
            email: u.email,
            courseId: a.courseId,
            courseTitle: getCourseTitle(a.courseId),
            assignedAt: a.assignedAt,
            price: tariff.price,
          });
        }
      });
    });
    return items;
  }, [users, period, tariff]);

  const total = lineItems.length * tariff.price;

  const groupSummary = useMemo(() => {
    const map = new Map<string, { count: number; items: LineItem[] }>();
    lineItems.forEach((item) => {
      const prev = map.get(item.group) ?? { count: 0, items: [] };
      map.set(item.group, { count: prev.count + 1, items: [...prev.items, item] });
    });
    return Array.from(map.entries())
      .map(([group, v], idx) => ({ group, count: v.count, sum: v.count * tariff.price, items: v.items, idx }))
      .sort((a, b) => b.count - a.count);
  }, [lineItems, tariff]);

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
              <p className="text-xs text-muted-foreground">Детализация по организациям, группам и слушателям</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportSubCSV(lineItems, period.label, tariff.label, total)}
              title="Скачать Excel (CSV)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileSpreadsheet" size={14} />
              Excel
            </button>
            <button
              onClick={() => exportSubPDF(lineItems, period.label, tariff.label, tariff.price, total, groupSummary)}
              title="Печать / сохранить PDF"
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

        {/* Параметры отчёта */}
        <div className="flex flex-wrap gap-4 px-6 py-4 border-b border-border bg-muted/20 flex-shrink-0">
          {/* Период */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Период</p>
            <div className="flex flex-wrap gap-1.5">
              {PERIOD_OPTIONS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPeriodId(p.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    periodId === p.id
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border-border text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {p.label}
                </button>
              ))}
            </div>
          </div>

          {/* Тариф */}
          <div className="space-y-1">
            <p className="text-xs text-muted-foreground font-medium">Тариф</p>
            <div className="flex flex-wrap gap-1.5">
              {TARIFF_OPTIONS.map((t) => (
                <button
                  key={t.id}
                  onClick={() => setTariffId(t.id)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-colors ${
                    tariffId === t.id
                      ? "bg-violet-600 text-white border-violet-600"
                      : "border-border text-muted-foreground hover:bg-muted/60"
                  }`}
                >
                  {t.label} · {t.price.toLocaleString("ru")} ₽
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Сводка */}
        <div className="flex items-center gap-5 px-6 py-3 border-b border-border flex-shrink-0 flex-wrap">
          {[
            { label: "Назначений", value: String(lineItems.length), color: "text-violet-500" },
            { label: "Слушателей", value: String(new Set(lineItems.map((i) => i.userId)).size), color: "text-cyan-500" },
            { label: "Групп", value: String(groupSummary.length), color: "text-blue-500" },
          ].map((m) => (
            <div key={m.label} className="flex items-center gap-2">
              <span className={`text-lg font-bold ${m.color}`}>{m.value}</span>
              <span className="text-xs text-muted-foreground">{m.label}</span>
            </div>
          ))}
          <div className="ml-auto flex items-center gap-2 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800 rounded-xl px-4 py-2">
            <Icon name="CreditCard" size={16} className="text-emerald-600 dark:text-emerald-400" />
            <span className="text-sm text-muted-foreground">Итого к списанию:</span>
            <span className="text-lg font-bold text-emerald-600 dark:text-emerald-400">{fmt(total)}</span>
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
              <p className="text-xs text-muted-foreground">Попробуйте выбрать другой период</p>
            </div>
          ) : view === "groups" ? (
            /* === По группам === */
            <div className="space-y-3">
              {groupSummary.map((g) => {
                const isOpen = expandedGroup === g.group;
                return (
                  <div key={g.group} className="bg-card rounded-2xl border border-border overflow-hidden">
                    {/* Заголовок группы */}
                    <button
                      className={`w-full flex items-center gap-4 px-5 py-4 text-left transition-colors hover:bg-muted/30 ${isOpen ? "bg-violet-50/50 dark:bg-violet-900/10" : ""}`}
                      onClick={() => setExpandedGroup(isOpen ? null : g.group)}
                    >
                      <div className={`w-9 h-9 rounded-xl bg-gradient-to-br ${gradients[g.idx % gradients.length]} flex items-center justify-center flex-shrink-0`}>
                        <Icon name="UsersRound" size={16} className="text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-semibold text-sm">{g.group}</p>
                        <p className="text-xs text-muted-foreground">{g.count} назначений</p>
                      </div>
                      <div className="flex items-center gap-4 flex-shrink-0">
                        <div className="text-right">
                          <p className="text-base font-bold text-emerald-600 dark:text-emerald-400">{fmt(g.sum)}</p>
                          <p className="text-xs text-muted-foreground">{fmt(tariff.price)} × {g.count}</p>
                        </div>
                        <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
                      </div>
                    </button>

                    {/* Раскрытые слушатели */}
                    {isOpen && (
                      <div className="border-t border-border">
                        <table className="w-full text-sm">
                          <thead>
                            <tr className="border-b border-border bg-muted/30">
                              <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Слушатель</th>
                              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Курс</th>
                              <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
                              <th className="px-4 py-2.5 text-right text-xs font-medium text-muted-foreground">Сумма</th>
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
                                  <span className="truncate block">{item.courseTitle}</span>
                                </td>
                                <td className="px-4 py-2.5 text-sm text-muted-foreground whitespace-nowrap">{item.assignedAt}</td>
                                <td className="px-4 py-2.5 text-right font-semibold text-sm">{fmt(item.price)}</td>
                              </tr>
                            ))}
                            <tr className="border-t border-border bg-muted/20">
                              <td colSpan={3} className="px-5 py-2.5 text-xs font-semibold text-muted-foreground">Итого по группе {g.group}</td>
                              <td className="px-4 py-2.5 text-right font-bold text-emerald-600 dark:text-emerald-400">{fmt(g.sum)}</td>
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
                  <span className="font-semibold">ИТОГО к списанию за {period.label}</span>
                </div>
                <span className="text-2xl font-bold">{fmt(total)}</span>
              </div>
            </div>
          ) : (
            /* === Детализация === */
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead className="sticky top-0 z-10">
                  <tr className="border-b border-border bg-muted/50">
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground w-10">№</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Слушатель</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Группа</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Курс</th>
                    <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground whitespace-nowrap">Дата назначения</th>
                    <th className="px-4 py-3 text-right text-xs font-medium text-muted-foreground">Сумма</th>
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
                        <span className="truncate block">{item.courseTitle}</span>
                      </td>
                      <td className="px-4 py-3 text-sm text-muted-foreground whitespace-nowrap">{item.assignedAt}</td>
                      <td className="px-4 py-3 text-right font-semibold text-sm">{fmt(item.price)}</td>
                    </tr>
                  ))}
                </tbody>
                <tfoot>
                  <tr className="border-t border-border bg-muted/30">
                    <td colSpan={5} className="px-4 py-3 font-bold text-sm">ИТОГО</td>
                    <td className="px-4 py-3 text-right font-bold text-emerald-600 dark:text-emerald-400 text-base">{fmt(total)}</td>
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
