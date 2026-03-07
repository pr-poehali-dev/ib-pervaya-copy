import { useMemo } from "react";
import Icon from "@/components/ui/icon";
import { User, allCourses } from "@/components/admin/types";

interface StatsModalProps {
  open: boolean;
  onClose: () => void;
  users: User[];
}

export default function StatsModal({ open, onClose, users }: StatsModalProps) {
  const stats = useMemo(() => {
    const totalAssignments = users.reduce(
      (sum, u) => sum + u.assignments.filter((a) => a.active).length,
      0
    );
    const totalCompleted = users.reduce(
      (sum, u) => sum + u.assignments.filter((a) => a.progress === 100).length,
      0
    );
    const totalInProgress = users.reduce(
      (sum, u) =>
        sum + u.assignments.filter((a) => a.active && a.progress > 0 && a.progress < 100).length,
      0
    );
    const avgProgress =
      totalAssignments > 0
        ? Math.round(
            users.reduce(
              (sum, u) =>
                sum + u.assignments.filter((a) => a.active).reduce((s, a) => s + a.progress, 0),
              0
            ) / totalAssignments
          )
        : 0;

    // Статистика по курсам
    const courseStats = allCourses.map((course) => {
      const assignments = users.flatMap((u) =>
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
    const groupNames = [...new Set(users.map((u) => u.group))];
    const groupStats = groupNames.map((group) => {
      const groupUsers = users.filter((u) => u.group === group);
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
    const topUsers = [...users]
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
  }, [users]);

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
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
          >
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Контент */}
        <div className="overflow-y-auto flex-1 p-6 space-y-6">
          {/* Сводные метрики */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {[
              { label: "Слушателей", value: users.length, icon: "Users", color: "from-violet-500 to-purple-700", bg: "icon-bg-violet", iconColor: "text-violet-500" },
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
