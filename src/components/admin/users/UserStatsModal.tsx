import Icon from "@/components/ui/icon";
import { User, allCourses, courseDirections, CourseStatus } from "@/components/admin/types";

interface UserStatsModalProps {
  user: User | null;
  onClose: () => void;
}

const STATUS_MAP: Record<CourseStatus, { label: string; cls: string; icon: string }> = {
  pending:   { label: "Ожидает активации", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300", icon: "Clock" },
  active:    { label: "Идёт обучение",      cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", icon: "Play" },
  completed: { label: "Обучение завершено", cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300", icon: "CheckCircle" },
  certified: { label: "Удостоверение выдано", cls: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300", icon: "Award" },
};

function getCourseInfo(courseId: number) {
  const simple = allCourses.find((c) => c.id === courseId);
  if (simple) return { title: simple.title, emoji: simple.emoji, duration: simple.duration, lessons: simple.lessons };
  const dir = courseDirections.flatMap((d) => d.courses).find((c) => c.id === courseId);
  if (dir) return { title: `${dir.code} ${dir.title}`, emoji: "📚", duration: "—", lessons: 0 };
  return { title: `Курс #${courseId}`, emoji: "📚", duration: "—", lessons: 0 };
}

const STATUS_LABELS: Record<CourseStatus, string> = {
  pending: "Ожидает активации",
  active: "Идёт обучение",
  completed: "Обучение завершено",
  certified: "Удостоверение выдано",
};

function exportUserCSV(user: User) {
  const header = ["Курс", "Статус", "Прогресс", "Назначен", "Начато", "Завершено"];
  const rows = user.assignments.map((a) => {
    const info = getCourseInfo(a.courseId);
    return [
      info.title,
      STATUS_LABELS[a.status],
      `${a.progress}%`,
      a.assignedAt,
      a.activatedAt ?? "—",
      a.completedAt ?? "—",
    ];
  });
  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const csv = "\uFEFF" + [header, ...rows].map((r) => r.map(escape).join(";")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Слушатель_${user.name.replace(/\s+/g, "_")}_${new Date().toLocaleDateString("ru")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportUserPDF(user: User, avgProgress: number, completedCount: number, certifiedCount: number) {
  const date = new Date().toLocaleDateString("ru", { day: "2-digit", month: "long", year: "numeric" });
  const rows = user.assignments.map((a) => {
    const info = getCourseInfo(a.courseId);
    return `<tr>
      <td>${info.emoji} ${info.title}</td>
      <td>${STATUS_LABELS[a.status]}</td>
      <td><b>${a.progress}%</b></td>
      <td>${a.assignedAt}</td>
      <td>${a.activatedAt ?? "—"}</td>
      <td>${a.completedAt ?? "—"}</td>
    </tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<title>Карточка слушателя — ${user.name}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 12px; color: #111; padding: 32px; }
  h1 { font-size: 20px; margin-bottom: 2px; }
  .sub { color: #666; font-size: 11px; margin-bottom: 24px; }
  .metrics { display: flex; gap: 14px; margin-bottom: 24px; flex-wrap: wrap; }
  .metric { border: 1px solid #e5e7eb; border-radius: 10px; padding: 10px 18px; text-align: center; min-width: 80px; }
  .metric .val { font-size: 20px; font-weight: 700; color: #7c3aed; }
  .metric .lbl { font-size: 10px; color: #666; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; }
  th { background: #f3f4f6; text-align: left; padding: 8px 10px; font-size: 11px; color: #555; }
  td { padding: 7px 10px; border-bottom: 1px solid #f0f0f0; }
  tr:last-child td { border: none; }
  h2 { font-size: 14px; margin: 20px 0 8px; border-left: 3px solid #7c3aed; padding-left: 8px; }
  @media print { body { padding: 16px; } }
</style></head><body>
<h1>${user.name}</h1>
<div class="sub">${user.role} · Группа ${user.group} · ${user.email} · Сформирован: ${date}</div>
<div class="metrics">
  <div class="metric"><div class="val">${user.assignments.length}</div><div class="lbl">Всего курсов</div></div>
  <div class="metric"><div class="val">${user.assignments.filter(a => a.active).length}</div><div class="lbl">Активных</div></div>
  <div class="metric"><div class="val">${completedCount}</div><div class="lbl">Завершено</div></div>
  <div class="metric"><div class="val">${certifiedCount}</div><div class="lbl">Удостоверений</div></div>
  <div class="metric"><div class="val">${avgProgress}%</div><div class="lbl">Ср. прогресс</div></div>
</div>
<h2>Детализация по курсам</h2>
<table><thead><tr><th>Курс</th><th>Статус</th><th>Прогресс</th><th>Назначен</th><th>Начато</th><th>Завершено</th></tr></thead>
<tbody>${rows || "<tr><td colspan='6'>Курсы не назначены</td></tr>"}</tbody></table>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

function ProgressRing({ value }: { value: number }) {
  const r = 30;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  return (
    <svg width="76" height="76" viewBox="0 0 76 76">
      <circle cx="38" cy="38" r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="7" />
      <circle
        cx="38" cy="38" r={r} fill="none"
        stroke="url(#grad)" strokeWidth="7"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform="rotate(-90 38 38)"
      />
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#6d28d9" />
        </linearGradient>
      </defs>
      <text x="38" y="43" textAnchor="middle" fontSize="13" fontWeight="700" fill="currentColor">{value}%</text>
    </svg>
  );
}

export default function UserStatsModal({ user, onClose }: UserStatsModalProps) {
  if (!user) return null;

  const active = user.assignments.filter((a) => a.active);
  const avgProgress =
    active.length > 0
      ? Math.round(active.reduce((s, a) => s + a.progress, 0) / active.length)
      : 0;
  const completedCount = user.assignments.filter((a) => a.status === "completed" || a.status === "certified").length;
  const certifiedCount = user.assignments.filter((a) => a.status === "certified").length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-2xl max-h-[90vh] overflow-hidden flex flex-col">

        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-400 to-purple-600 rounded-xl flex items-center justify-center text-white font-bold text-sm">
              {user.initials}
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">{user.name}</h2>
              <p className="text-xs text-muted-foreground">{user.role} · {user.group}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportUserCSV(user)}
              title="Скачать Excel (CSV)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileSpreadsheet" size={14} />
              Excel
            </button>
            <button
              onClick={() => exportUserPDF(user, avgProgress, completedCount, certifiedCount)}
              title="Печать / сохранить PDF"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-rose-50 dark:hover:bg-rose-900/20 hover:border-rose-300 dark:hover:border-rose-700 text-muted-foreground hover:text-rose-600 dark:hover:text-rose-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileText" size={14} />
              PDF
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors ml-1"
            >
              <Icon name="X" size={18} />
            </button>
          </div>
        </div>

        {/* Контент */}
        <div className="overflow-y-auto flex-1 p-6 space-y-5">

          {/* Общая сводка */}
          <div className="grid grid-cols-4 gap-3">
            {[
              { label: "Всего курсов", value: user.assignments.length, icon: "BookOpen", color: "text-violet-500", bg: "icon-bg-violet" },
              { label: "Активных", value: active.length, icon: "Play", color: "text-emerald-500", bg: "icon-bg-emerald" },
              { label: "Завершено", value: completedCount, icon: "CheckCircle", color: "text-blue-500", bg: "icon-bg-blue" },
              { label: "Удостоверений", value: certifiedCount, icon: "Award", color: "text-amber-500", bg: "icon-bg-amber" },
            ].map((m) => (
              <div key={m.label} className="bg-card rounded-xl border border-border p-3 flex flex-col gap-1.5">
                <div className={`w-8 h-8 ${m.bg} rounded-lg flex items-center justify-center`}>
                  <Icon name={m.icon} size={15} className={m.color} />
                </div>
                <p className="text-xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground leading-tight">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Средний прогресс */}
          {active.length > 0 && (
            <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-5">
              <ProgressRing value={avgProgress} />
              <div className="flex-1 space-y-2">
                <p className="font-semibold text-sm">Средний прогресс</p>
                <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
                    style={{ width: `${avgProgress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">По {active.length} активным курсам</p>
              </div>
            </div>
          )}

          {/* Детализация по каждому курсу */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Icon name="ListChecks" size={15} className="text-muted-foreground" />
              Детализация по курсам
            </h3>
            {user.assignments.length === 0 ? (
              <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
                Курсы не назначены
              </div>
            ) : (
              <div className="space-y-3">
                {user.assignments.map((a) => {
                  const info = getCourseInfo(a.courseId);
                  const s = STATUS_MAP[a.status];
                  return (
                    <div key={a.courseId} className="bg-card rounded-xl border border-border p-4 space-y-3">
                      {/* Заголовок курса */}
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5 min-w-0">
                          <span className="text-xl">{info.emoji}</span>
                          <div className="min-w-0">
                            <p className="font-semibold text-sm leading-tight truncate">{info.title}</p>
                            {info.lessons > 0 && (
                              <p className="text-xs text-muted-foreground">{info.lessons} уроков · {info.duration}</p>
                            )}
                          </div>
                        </div>
                        <span className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${s.cls}`}>
                          <Icon name={s.icon} size={11} />
                          {s.label}
                        </span>
                      </div>

                      {/* Прогресс-бар */}
                      <div className="space-y-1.5">
                        <div className="flex justify-between text-xs">
                          <span className="text-muted-foreground">Прогресс прохождения</span>
                          <span className="font-bold">{a.progress}%</span>
                        </div>
                        <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all ${a.progress === 100 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-violet-500 to-purple-600"}`}
                            style={{ width: `${a.progress}%` }}
                          />
                        </div>
                      </div>

                      {/* Даты */}
                      <div className="grid grid-cols-3 gap-2">
                        {[
                          { label: "Назначен", value: a.assignedAt, icon: "CalendarPlus" },
                          { label: "Активирован", value: a.activatedAt ?? "—", icon: "Play" },
                          { label: "Завершён", value: a.completedAt ?? "—", icon: "CheckCircle" },
                        ].map((d) => (
                          <div key={d.label} className="bg-muted/40 rounded-lg px-3 py-2">
                            <div className="flex items-center gap-1 mb-0.5">
                              <Icon name={d.icon} size={11} className="text-muted-foreground" />
                              <span className="text-[10px] text-muted-foreground uppercase tracking-wide font-medium">{d.label}</span>
                            </div>
                            <p className="text-sm font-semibold">{d.value}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        {/* Подвал */}
        <div className="border-t border-border px-6 py-3 flex justify-end">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl bg-muted hover:bg-muted/80 text-sm font-medium transition-colors"
          >
            Закрыть
          </button>
        </div>
      </div>
    </div>
  );
}
