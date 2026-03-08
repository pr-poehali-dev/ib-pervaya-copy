import { useMemo, useState } from "react";
import Icon from "@/components/ui/icon";
import { User, allCourses } from "@/components/admin/types";
import SubscriptionReportFilters from "./SubscriptionReportFilters";
import { PeriodPreset, getPeriodBounds, inPeriod, getNow, dateToInput, inputToDMY } from "./SubscriptionReportUtils";

function exportAllCSV(users: User[], stats: {
  groupStats: { group: string; users: number; assignments: number; completed: number; avgProgress: number }[];
  courseStats: { title: string; enrolled: number; completed: number; avgProgress: number }[];
}, periodLabel: string, filterOrg: string, filterGroup: string) {
  const date = new Date().toLocaleDateString("ru");

  // Лист 1: по группам
  const groupHeader = ["Группа", "Слушателей", "Назначений", "Завершено", "Ср. прогресс"];
  const groupRows = stats.groupStats.map((g) => [g.group, String(g.users), String(g.assignments), String(g.completed), `${g.avgProgress}%`]);

  // Лист 2: по слушателям
  const userHeader = ["ФИО", "Email", "Роль", "Организация", "Группа", "Курс", "Статус", "Прогресс", "Назначен", "Начато", "Завершено"];
  const statusLabels: Record<string, string> = { pending: "Ожидает активации", active: "Идёт обучение", completed: "Завершено", certified: "Удостоверение выдано" };
  const userRows: string[][] = [];
  users.forEach((u) => {
    if (u.assignments.length === 0) {
      userRows.push([u.name, u.email, u.role, u.organization ?? "", u.group, "—", "—", "—", "—", "—", "—"]);
    } else {
      u.assignments.forEach((a) => {
        const course = allCourses.find((c) => c.id === a.courseId);
        const title = course ? course.title : `Курс #${a.courseId}`;
        userRows.push([u.name, u.email, u.role, u.organization ?? "", u.group, title, statusLabels[a.status] ?? a.status, `${a.progress}%`, a.assignedAt, a.activatedAt ?? "—", a.completedAt ?? "—"]);
      });
    }
  });

  const filterNote = [
    `"Период";"${periodLabel}"`,
    filterOrg !== "Все" ? `"Организация";"${filterOrg}"` : "",
    filterGroup !== "Все" ? `"Группа";"${filterGroup}"` : "",
  ].filter(Boolean).join("\n");

  const escape = (v: string) => `"${v.replace(/"/g, '""')}"`;
  const sep = "\n\n";
  const csv = "\uFEFF"
    + `"Сводная статистика обучения";"${date}"\n`
    + filterNote + "\n\n"
    + `Активность групп\n`
    + [groupHeader, ...groupRows].map((r) => r.map(escape).join(";")).join("\n")
    + sep
    + `Детализация по слушателям\n`
    + [userHeader, ...userRows].map((r) => r.map(escape).join(";")).join("\n");

  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `Статистика_обучения_${date}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

function exportAllPDF(users: User[], stats: {
  totalAssignments: number; totalCompleted: number; totalInProgress: number; avgProgress: number;
  groupStats: { group: string; users: number; assignments: number; completed: number; avgProgress: number }[];
  courseStats: { title: string; enrolled: number; completed: number; avgProgress: number }[];
  topUsers: { name: string; group: string; avgProgress: number; completedCount: number }[];
}, periodLabel: string, filterOrg: string, filterGroup: string) {
  const date = new Date().toLocaleDateString("ru", { day: "2-digit", month: "long", year: "numeric" });
  const statusLabels: Record<string, string> = { pending: "Ожидает", active: "Обучается", completed: "Завершено", certified: "Удостоверение" };

  const filterNote = [
    `Период: ${periodLabel}`,
    filterOrg !== "Все" ? `Организация: ${filterOrg}` : "",
    filterGroup !== "Все" ? `Группа: ${filterGroup}` : "",
  ].filter(Boolean).join(" · ");

  const groupRows = stats.groupStats.map((g) => `<tr><td><b>${g.group}</b></td><td>${g.users}</td><td>${g.assignments}</td><td>${g.completed}</td><td><b>${g.avgProgress}%</b></td></tr>`).join("");
  const courseRows = stats.courseStats.map((c) => `<tr><td>${c.title}</td><td>${c.enrolled}</td><td>${c.completed}</td><td><b>${c.avgProgress}%</b></td></tr>`).join("");
  const topRows = stats.topUsers.map((u, i) => `<tr><td>${i + 1}</td><td>${u.name}</td><td>${u.group}</td><td>${u.completedCount}</td><td><b>${u.avgProgress}%</b></td></tr>`).join("");
  const userRows = users.map((u) => {
    return u.assignments.map((a) => {
      const course = allCourses.find((c) => c.id === a.courseId);
      return `<tr><td>${u.name}</td><td>${u.organization ?? ""}</td><td>${u.group}</td><td>${course?.title ?? `Курс #${a.courseId}`}</td><td>${statusLabels[a.status] ?? a.status}</td><td><b>${a.progress}%</b></td><td>${a.assignedAt}</td><td>${a.completedAt ?? "—"}</td></tr>`;
    }).join("") || `<tr><td>${u.name}</td><td>${u.organization ?? ""}</td><td>${u.group}</td><td colspan="5" style="color:#999">Курсы не назначены</td></tr>`;
  }).join("");

  const html = `<!DOCTYPE html><html lang="ru"><head><meta charset="UTF-8">
<title>Статистика обучения — ${date}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 11px; color: #111; padding: 28px; }
  h1 { font-size: 18px; margin-bottom: 2px; }
  .sub { color: #666; font-size: 10px; margin-bottom: 20px; }
  .filters { background: #f3f4f6; border-radius: 6px; padding: 6px 10px; font-size: 10px; color: #555; margin-bottom: 16px; }
  .metrics { display: flex; gap: 12px; margin-bottom: 20px; flex-wrap: wrap; }
  .metric { border: 1px solid #e5e7eb; border-radius: 8px; padding: 10px 16px; text-align: center; min-width: 70px; }
  .metric .val { font-size: 18px; font-weight: 700; color: #0891b2; }
  .metric .lbl { font-size: 9px; color: #666; margin-top: 2px; }
  table { width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 11px; }
  th { background: #f3f4f6; text-align: left; padding: 6px 8px; color: #555; }
  td { padding: 6px 8px; border-bottom: 1px solid #f0f0f0; }
  tr:last-child td { border: none; }
  h2 { font-size: 13px; margin: 18px 0 6px; border-left: 3px solid #0891b2; padding-left: 7px; page-break-before: auto; }
  @media print { body { padding: 14px; } h2 { page-break-before: auto; } }
</style></head><body>
<h1>Сводная статистика обучения</h1>
<div class="sub">Сформирован: ${date} · Всего слушателей: ${users.length}</div>
<div class="filters">${filterNote}</div>
<div class="metrics">
  <div class="metric"><div class="val">${users.length}</div><div class="lbl">Слушателей</div></div>
  <div class="metric"><div class="val">${stats.totalAssignments}</div><div class="lbl">Назначений</div></div>
  <div class="metric"><div class="val">${stats.totalInProgress}</div><div class="lbl">В процессе</div></div>
  <div class="metric"><div class="val">${stats.totalCompleted}</div><div class="lbl">Завершено</div></div>
  <div class="metric"><div class="val">${stats.avgProgress}%</div><div class="lbl">Ср. прогресс</div></div>
</div>
<h2>Активность групп</h2>
<table><thead><tr><th>Группа</th><th>Слушателей</th><th>Назначений</th><th>Завершили</th><th>Ср. прогресс</th></tr></thead><tbody>${groupRows}</tbody></table>
<h2>Прогресс по курсам</h2>
<table><thead><tr><th>Курс</th><th>Слушателей</th><th>Завершили</th><th>Ср. прогресс</th></tr></thead><tbody>${courseRows}</tbody></table>
<h2>Топ слушателей</h2>
<table><thead><tr><th>#</th><th>ФИО</th><th>Группа</th><th>Завершено</th><th>Ср. прогресс</th></tr></thead><tbody>${topRows}</tbody></table>
<h2>Детализация по слушателям</h2>
<table><thead><tr><th>ФИО</th><th>Организация</th><th>Группа</th><th>Курс</th><th>Статус</th><th>Прогресс</th><th>Назначен</th><th>Завершён</th></tr></thead><tbody>${userRows}</tbody></table>
</body></html>`;

  const win = window.open("", "_blank");
  if (!win) return;
  win.document.write(html);
  win.document.close();
  win.focus();
  setTimeout(() => { win.print(); }, 400);
}

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  users: User[];
}

export default function StatsModal({ open, onClose, users }: StatsModalProps) {
  const [preset, setPreset] = useState<PeriodPreset>("cur_month");
  const [customFrom, setCustomFrom] = useState(dateToInput(new Date(getNow().getFullYear(), 0, 1)));
  const [customTo, setCustomTo] = useState(dateToInput(getNow()));
  const [filterOrg, setFilterOrg] = useState("Все");
  const [filterGroup, setFilterGroup] = useState("Все");

  const { from, to, label: periodLabel } = useMemo(
    () => getPeriodBounds(preset, inputToDMY(customFrom), inputToDMY(customTo)),
    [preset, customFrom, customTo]
  );

  const orgOptions = useMemo(() => ["Все", ...Array.from(new Set(users.map((u) => u.organization ?? "").filter(Boolean))).sort()], [users]);
  const groupOptions = useMemo(() => {
    const base = filterOrg === "Все" ? users : users.filter((u) => (u.organization ?? "") === filterOrg);
    return ["Все", ...Array.from(new Set(base.map((u) => u.group))).sort()];
  }, [users, filterOrg]);

  const filteredUsers = useMemo(() => users.filter((u) => {
    if (filterOrg !== "Все" && (u.organization ?? "") !== filterOrg) return false;
    if (filterGroup !== "Все" && u.group !== filterGroup) return false;
    return u.assignments.some((a) => inPeriod(a.assignedAt, from, to));
  }), [users, filterOrg, filterGroup, from, to]);

  const stats = useMemo(() => {
    const totalAssignments = filteredUsers.reduce(
      (sum, u) => sum + u.assignments.filter((a) => a.active).length,
      0
    );
    const totalCompleted = filteredUsers.reduce(
      (sum, u) => sum + u.assignments.filter((a) => a.progress === 100).length,
      0
    );
    const totalInProgress = filteredUsers.reduce(
      (sum, u) =>
        sum + u.assignments.filter((a) => a.active && a.progress > 0 && a.progress < 100).length,
      0
    );
    const avgProgress =
      totalAssignments > 0
        ? Math.round(
            filteredUsers.reduce(
              (sum, u) =>
                sum + u.assignments.filter((a) => a.active).reduce((s, a) => s + a.progress, 0),
              0
            ) / totalAssignments
          )
        : 0;

    // Статистика по курсам
    const courseStats = allCourses.map((course) => {
      const assignments = filteredUsers.flatMap((u) =>
        u.assignments.filter((a) => a.courseId === course.id && a.active)
      );
      const completed = assignments.filter((a) => a.progress === 100).length;
      const avgP =
        assignments.length > 0
          ? Math.round(assignments.reduce((s, a) => s + a.progress, 0) / assignments.length)
          : 0;
      return {
        ...course,
        enrolled: assignments.length,
        completed,
        avgProgress: avgP,
      };
    });

    // Статистика по группам
    const groupNames = [...new Set(filteredUsers.map((u) => u.group))];
    const groupStats = groupNames.map((group) => {
      const groupUsers = filteredUsers.filter((u) => u.group === group);
      const gAssignments = groupUsers.flatMap((u) => u.assignments.filter((a) => a.active));
      const gCompleted = gAssignments.filter((a) => a.progress === 100).length;
      const gAvg =
        gAssignments.length > 0
          ? Math.round(gAssignments.reduce((s, a) => s + a.progress, 0) / gAssignments.length)
          : 0;
      return {
        group,
        users: groupUsers.length,
        assignments: gAssignments.length,
        completed: gCompleted,
        avgProgress: gAvg,
      };
    });

    // Топ слушателей по прогрессу
    const topUsers = [...filteredUsers]
      .map((u) => {
        const active = u.assignments.filter((a) => a.active);
        const avg =
          active.length > 0
            ? Math.round(active.reduce((s, a) => s + a.progress, 0) / active.length)
            : 0;
        return { ...u, avgProgress: avg, completedCount: active.filter((a) => a.progress === 100).length };
      })
      .sort((a, b) => b.avgProgress - a.avgProgress)
      .slice(0, 5);

    return { totalAssignments, totalCompleted, totalInProgress, avgProgress, courseStats, groupStats, topUsers };
  }, [filteredUsers]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Icon name="BarChart2" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-lg">Статистика обучения</h2>
              <p className="text-muted-foreground text-xs">Прогресс слушателей и активность по группам</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportAllCSV(filteredUsers, stats, periodLabel, filterOrg, filterGroup)}
              title="Скачать Excel (CSV)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileSpreadsheet" size={14} />
              Excel
            </button>
            <button
              onClick={() => exportAllPDF(filteredUsers, stats, periodLabel, filterOrg, filterGroup)}
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

        {/* Фильтры */}
        <SubscriptionReportFilters
          preset={preset}
          onPresetChange={setPreset}
          customFrom={customFrom}
          customTo={customTo}
          onCustomFromChange={setCustomFrom}
          onCustomToChange={setCustomTo}
          filterOrg={filterOrg}
          filterGroup={filterGroup}
          orgOptions={orgOptions}
          groupOptions={groupOptions}
          onFilterOrgChange={(v) => { setFilterOrg(v); setFilterGroup("Все"); }}
          onFilterGroupChange={setFilterGroup}
          onResetFilters={() => { setFilterOrg("Все"); setFilterGroup("Все"); }}
        />

        {/* Контент */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Сводные метрики */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Слушателей", value: filteredUsers.length, icon: "Users", color: "from-violet-500 to-purple-700", bg: "icon-bg-violet", iconColor: "text-violet-500" },
              { label: "Назначений", value: stats.totalAssignments, icon: "BookOpen", color: "from-cyan-500 to-blue-600", bg: "icon-bg-cyan", iconColor: "text-cyan-500" },
              { label: "В процессе", value: stats.totalInProgress, icon: "Clock", color: "from-amber-500 to-orange-600", bg: "icon-bg-amber", iconColor: "text-amber-500" },
              { label: "Завершено", value: stats.totalCompleted, icon: "Trophy", color: "from-emerald-500 to-teal-600", bg: "icon-bg-emerald", iconColor: "text-emerald-500" },
            ].map((m) => (
              <div key={m.label} className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-2">
                <div className={`w-9 h-9 ${m.bg} rounded-xl flex items-center justify-center`}>
                  <Icon name={m.icon} size={18} className={m.iconColor} />
                </div>
                <p className="text-2xl font-bold">{m.value}</p>
                <p className="text-xs text-muted-foreground">{m.label}</p>
              </div>
            ))}
          </div>

          {/* Средний прогресс */}
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <p className="font-semibold text-sm">Средний прогресс по всем назначениям</p>
              <span className="text-2xl font-bold text-cyan-500">{stats.avgProgress}%</span>
            </div>
            <div className="h-3 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 rounded-full transition-all duration-700"
                style={{ width: `${stats.avgProgress}%` }}
              />
            </div>
          </div>

          {/* Статистика по курсам */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Icon name="BookOpen" size={15} className="text-muted-foreground" />
              Прогресс по курсам
            </h3>
            <div className="space-y-2">
              {stats.courseStats.map((c) => (
                <div key={c.id} className="bg-card rounded-xl border border-border p-4">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2 min-w-0">
                      <span className="text-lg">{c.emoji}</span>
                      <span className="font-medium text-sm truncate">{c.title}</span>
                    </div>
                    <div className="flex items-center gap-3 ml-3 shrink-0">
                      <span className="text-xs text-muted-foreground">{c.enrolled} слуш.</span>
                      <span className="text-xs font-semibold text-emerald-500">{c.completed} ✓</span>
                      <span className="text-xs font-bold w-10 text-right">{c.avgProgress}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full transition-all"
                      style={{ width: `${c.avgProgress}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Статистика по группам */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Icon name="UsersRound" size={15} className="text-muted-foreground" />
              Активность групп
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {stats.groupStats.map((g) => (
                <div key={g.group} className="bg-card rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-sm">{g.group}</span>
                    <span className="text-xs text-muted-foreground">{g.users} чел.</span>
                  </div>
                  <div className="flex gap-4 text-xs text-muted-foreground">
                    <span>Назначений: <strong className="text-foreground">{g.assignments}</strong></span>
                    <span>Завершено: <strong className="text-emerald-500">{g.completed}</strong></span>
                  </div>
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-muted-foreground">Средний прогресс</span>
                      <span className="font-bold">{g.avgProgress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-purple-600 rounded-full transition-all"
                        style={{ width: `${g.avgProgress}%` }}
                      />
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Топ слушателей */}
          <div>
            <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
              <Icon name="Trophy" size={15} className="text-muted-foreground" />
              Топ слушателей по прогрессу
            </h3>
            <div className="space-y-2">
              {stats.topUsers.map((u, idx) => (
                <div key={u.id} className="bg-card rounded-xl border border-border px-4 py-3 flex items-center gap-3">
                  <span className={`text-sm font-bold w-5 text-center ${idx === 0 ? "text-amber-500" : idx === 1 ? "text-slate-400" : idx === 2 ? "text-orange-500" : "text-muted-foreground"}`}>
                    {idx + 1}
                  </span>
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-400 to-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold shrink-0">
                    {u.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.group} · {u.completedCount} курс{u.completedCount === 1 ? "" : u.completedCount >= 2 && u.completedCount <= 4 ? "а" : "ов"} завершено</p>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 rounded-full"
                        style={{ width: `${u.avgProgress}%` }}
                      />
                    </div>
                    <span className="text-sm font-bold w-9 text-right">{u.avgProgress}%</span>
                  </div>
                </div>
              ))}
            </div>
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