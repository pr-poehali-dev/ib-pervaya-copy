import { allCourses, courseDirections } from "@/components/admin/types";

// ─── Типы ────────────────────────────────────────────────────────────────────

export interface LineItem {
  userId: number;
  initials: string;
  name: string;
  organization: string;
  group: string;
  email: string;
  courseId: number;
  courseTitle: string;
  assignedAt: string;
}

export type PeriodPreset = "cur_month" | "prev_month" | "cur_quarter" | "custom";

export type ViewMode = "groups" | "detail";

export const PRESET_OPTIONS: { id: PeriodPreset; label: string; icon: string }[] = [
  { id: "cur_month",   label: "Текущий месяц",   icon: "Calendar" },
  { id: "prev_month",  label: "Прошлый месяц",   icon: "CalendarMinus" },
  { id: "cur_quarter", label: "Текущий квартал", icon: "CalendarRange" },
  { id: "custom",      label: "Свой период",     icon: "CalendarSearch" },
];

// ─── Утилиты дат ─────────────────────────────────────────────────────────────

export function getNow() { return new Date(); }

export function getPeriodBounds(
  preset: PeriodPreset,
  customFrom: string,
  customTo: string,
): { from: Date; to: Date; label: string } {
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

export function parseDMY(s: string): Date | null {
  const p = s.split(".");
  if (p.length !== 3) return null;
  return new Date(+p[2], +p[1] - 1, +p[0]);
}

export function inPeriod(dateStr: string, from: Date, to: Date): boolean {
  const d = parseDMY(dateStr);
  if (!d) return false;
  return d >= from && d <= to;
}

export function dateToInput(d: Date) {
  return d.toISOString().slice(0, 10);
}

export function inputToDMY(s: string) {
  const [y, m, d] = s.split("-");
  return `${d}.${m}.${y}`;
}

export function dmyToInput(s: string) {
  if (!s) return "";
  const [d, m, y] = s.split(".");
  return `${y}-${m}-${d}`;
}

// ─── Курсы ───────────────────────────────────────────────────────────────────

export function getCourseTitle(courseId: number): string {
  const simple = allCourses.find((c) => c.id === courseId);
  if (simple) return simple.title;
  const dir = courseDirections.flatMap((d) => d.courses).find((c) => c.id === courseId);
  if (dir) return `${dir.code} ${dir.title}`;
  return `Курс #${courseId}`;
}

// ─── Экспорт ─────────────────────────────────────────────────────────────────

export function exportSubCSV(
  items: LineItem[],
  periodLabel: string,
  filterOrg: string,
  filterGroup: string,
) {
  const header = ["№", "ФИО", "Email", "Организация", "Группа", "Курс", "Дата назначения"];
  const rows = items.map((r, i) => [String(i + 1), r.name, r.email, r.organization, r.group, r.courseTitle, r.assignedAt]);
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

export function exportSubPDF(
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
      <td>${r.organization}</td>
      <td>${r.group}</td>
      <td>${r.courseTitle}</td>
      <td>${r.assignedAt}</td>
    </tr>`).join("");

  const filterNote = [
    `Период: ${periodLabel}`,
    filterOrg !== "Все" ? `Организация: ${filterOrg}` : "",
    filterGroup !== "Все" ? `Группа: ${filterGroup}` : "",
  ].filter(Boolean).join(" · ");

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<title>Списание подписок — ${periodLabel}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 28px; }
  h1 { font-size: 17px; margin-bottom: 2px; }
  .sub { color: #666; font-size: 10px; margin-bottom: 8px; }
  .filters { background: #f3f4f6; border-radius: 6px; padding: 6px 10px; font-size: 10px; color: #555; margin-bottom: 16px; }
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
<div class="sub">Сформирован: ${date}</div>
<div class="filters">${filterNote}</div>
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
<table><thead><tr><th>№</th><th>ФИО / Email</th><th>Организация</th><th>Группа</th><th>Курс</th><th>Дата назначения</th></tr></thead>
<tbody>${detailRows}</tbody>
<tfoot><tr><td colspan="5">ИТОГО назначений</td><td style="font-weight:700">${items.length}</td></tr></tfoot>
</table>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}