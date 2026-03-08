import { User, allCourses, courseDirections, CourseStatus } from "@/components/admin/types";

export const STATUS_MAP: Record<CourseStatus, { label: string; cls: string; icon: string }> = {
  pending:   { label: "Ожидает",      cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",       icon: "Clock" },
  active:    { label: "Обучается",    cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", icon: "Play" },
  completed: { label: "Завершено",    cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",            icon: "CheckCircle" },
  certified: { label: "Удостоверение",cls: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300",   icon: "Award" },
};

export const STATUS_LABELS: Record<CourseStatus, string> = {
  pending: "Ожидает активации",
  active: "Идёт обучение",
  completed: "Завершено",
  certified: "Удостоверение выдано",
};

export function getCourseInfo(courseId: number) {
  const simple = allCourses.find((c) => c.id === courseId);
  if (simple) return { title: simple.title, emoji: simple.emoji, duration: simple.duration };
  const dir = courseDirections.flatMap((d) => d.courses).find((c) => c.id === courseId);
  if (dir) return { title: `${dir.code} ${dir.title}`, emoji: "📚", duration: "—" };
  return { title: `Курс #${courseId}`, emoji: "📚", duration: "—" };
}

export interface GroupStats {
  totalAssignments: number;
  completed: number;
  certified: number;
  inProgress: number;
  avgProgress: number;
  courseStats: {
    courseId: number;
    title: string;
    emoji: string;
    duration: string;
    enrolled: number;
    completed: number;
    avgProgress: number;
  }[];
  memberStats: (User & {
    avgProgress: number;
    completedCount: number;
    activeCount: number;
  })[];
}

export function exportCSV(groupName: string, members: User[]) {
  const header = ["ФИО", "Email", "Роль", "Курс", "Статус", "Прогресс", "Назначен", "Начато", "Завершено"];
  const rows: string[][] = [];
  members.forEach((u) => {
    if (u.assignments.length === 0) {
      rows.push([u.name, u.email, u.role, "—", "—", "—", "—", "—", "—"]);
    } else {
      u.assignments.forEach((a) => {
        const info = getCourseInfo(a.courseId);
        rows.push([
          u.name, u.email, u.role, info.title,
          STATUS_LABELS[a.status], `${a.progress}%`,
          a.assignedAt, a.activatedAt ?? "—", a.completedAt ?? "—",
        ]);
      });
    }
  });

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(escape).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Статистика_${groupName}_${new Date().toLocaleDateString("ru")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportPDF(groupName: string, members: User[], stats: GroupStats) {
  const date = new Date().toLocaleDateString("ru", { day: "2-digit", month: "long", year: "numeric" });
  const membersRows = stats.memberStats.map((u) => `
    <tr><td>${u.name}</td><td>${u.email}</td><td>${u.role}</td><td>${u.activeCount}</td><td>${u.completedCount}</td><td><b>${u.avgProgress}%</b></td></tr>`).join("");
  const coursesRows = stats.courseStats.map((c) => `
    <tr><td>${c.title}</td><td>${c.enrolled}</td><td>${c.completed}</td><td><b>${c.avgProgress}%</b></td></tr>`).join("");

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<title>Статистика группы ${groupName}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 32px; }
  h1 { font-size: 20px; margin-bottom: 4px; }
  .sub { color: #666; font-size: 11px; margin-bottom: 24px; }
  .metrics { display: flex; gap: 16px; margin-bottom: 24px; }
  .metric { border: 1px solid #e5e7eb; border-radius: 10px; padding: 12px 20px; flex: 1; text-align: center; }
  .metric .val { font-size: 22px; font-weight: 700; color: #7c3aed; }
  .metric .lbl { font-size: 10px; color: #666; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 24px; }
  th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 11px; color: #555; }
  td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; }
  tr:last-child td { border: none; }
  h2 { font-size: 14px; margin: 20px 0 8px; border-left: 3px solid #7c3aed; padding-left: 8px; }
  @media print { body { padding: 16px; } }
</style></head><body>
<h1>Статистика группы ${groupName}</h1>
<div class="sub">Сформирован: ${date} · ${members.length} слушателей · ${stats.totalAssignments} назначений</div>
<div class="metrics">
  <div class="metric"><div class="val">${members.length}</div><div class="lbl">Слушателей</div></div>
  <div class="metric"><div class="val">${stats.totalAssignments}</div><div class="lbl">Назначений</div></div>
  <div class="metric"><div class="val">${stats.inProgress}</div><div class="lbl">В процессе</div></div>
  <div class="metric"><div class="val">${stats.completed}</div><div class="lbl">Завершено</div></div>
  <div class="metric"><div class="val">${stats.certified}</div><div class="lbl">Удостоверений</div></div>
  <div class="metric"><div class="val">${stats.avgProgress}%</div><div class="lbl">Средний прогресс</div></div>
</div>
<h2>Прогресс по курсам</h2>
<table><thead><tr><th>Курс</th><th>Слушателей</th><th>Завершили</th><th>Ср. прогресс</th></tr></thead>
<tbody>${coursesRows}</tbody></table>
<h2>Слушатели</h2>
<table><thead><tr><th>ФИО</th><th>Email</th><th>Роль</th><th>Активных курсов</th><th>Завершено</th><th>Ср. прогресс</th></tr></thead>
<tbody>${membersRows}</tbody></table>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}
