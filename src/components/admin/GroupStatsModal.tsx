import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { User, allCourses, courseDirections, CourseStatus, userColors } from "@/components/admin/types";

interface GroupStatsModalProps {
  groupName: string | null;
  users: User[];
  onClose: () => void;
  onUserStats?: (user: User) => void;
}

const STATUS_MAP: Record<CourseStatus, { label: string; cls: string; icon: string }> = {
  pending:   { label: "Ожидает",   cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",     icon: "Clock" },
  active:    { label: "Обучается", cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", icon: "Play" },
  completed: { label: "Завершено", cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",         icon: "CheckCircle" },
  certified: { label: "Удостоверение", cls: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300", icon: "Award" },
};

function getCourseInfo(courseId: number) {
  const simple = allCourses.find((c) => c.id === courseId);
  if (simple) return { title: simple.title, emoji: simple.emoji, duration: simple.duration };
  const dir = courseDirections.flatMap((d) => d.courses).find((c) => c.id === courseId);
  if (dir) return { title: `${dir.code} ${dir.title}`, emoji: "📚", duration: "—" };
  return { title: `Курс #${courseId}`, emoji: "📚", duration: "—" };
}

function ProgressRing({ value, size = 64 }: { value: number; size?: number }) {
  const r = size / 2 - 6;
  const circ = 2 * Math.PI * r;
  const dash = (value / 100) * circ;
  const cx = size / 2;
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={cx} cy={cx} r={r} fill="none" stroke="hsl(var(--muted))" strokeWidth="5.5" />
      <circle
        cx={cx} cy={cx} r={r} fill="none"
        stroke="url(#gring)" strokeWidth="5.5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
      />
      <defs>
        <linearGradient id="gring" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <text x={cx} y={cx + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">{value}%</text>
    </svg>
  );
}

type Tab = "overview" | "courses" | "members";

export default function GroupStatsModal({ groupName, users, onClose, onUserStats }: GroupStatsModalProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const members = useMemo(
    () => users.filter((u) => u.group === groupName),
    [users, groupName]
  );

  const stats = useMemo(() => {
    const totalAssignments = members.reduce((s, u) => s + u.assignments.filter((a) => a.active).length, 0);
    const completed = members.reduce((s, u) => s + u.assignments.filter((a) => a.progress === 100).length, 0);
    const certified = members.reduce((s, u) => s + u.assignments.filter((a) => a.status === "certified").length, 0);
    const inProgress = members.reduce((s, u) => s + u.assignments.filter((a) => a.active && a.progress > 0 && a.progress < 100).length, 0);
    const avgProgress = totalAssignments > 0
      ? Math.round(members.reduce((s, u) => s + u.assignments.filter((a) => a.active).reduce((ss, a) => ss + a.progress, 0), 0) / totalAssignments)
      : 0;

    const courseMap = new Map<number, { enrolled: number; completed: number; sumProgress: number }>();
    members.forEach((u) => {
      u.assignments.forEach((a) => {
        const prev = courseMap.get(a.courseId) ?? { enrolled: 0, completed: 0, sumProgress: 0 };
        courseMap.set(a.courseId, {
          enrolled: prev.enrolled + (a.active ? 1 : 0),
          completed: prev.completed + (a.progress === 100 ? 1 : 0),
          sumProgress: prev.sumProgress + (a.active ? a.progress : 0),
        });
      });
    });

    const courseStats = Array.from(courseMap.entries()).map(([courseId, v]) => {
      const info = getCourseInfo(courseId);
      return {
        courseId,
        ...info,
        enrolled: v.enrolled,
        completed: v.completed,
        avgProgress: v.enrolled > 0 ? Math.round(v.sumProgress / v.enrolled) : 0,
      };
    }).sort((a, b) => b.enrolled - a.enrolled);

    const memberStats = members.map((u) => {
      const active = u.assignments.filter((a) => a.active);
      const avg = active.length > 0 ? Math.round(active.reduce((s, a) => s + a.progress, 0) / active.length) : 0;
      return {
        ...u,
        avgProgress: avg,
        completedCount: u.assignments.filter((a) => a.progress === 100).length,
        activeCount: active.length,
      };
    }).sort((a, b) => b.avgProgress - a.avgProgress);

    return { totalAssignments, completed, certified, inProgress, avgProgress, courseStats, memberStats };
  }, [members]);

  if (!groupName) return null;

  const tabs: { id: Tab; label: string; icon: string }[] = [
    { id: "overview", label: "Сводка", icon: "LayoutDashboard" },
    { id: "courses",  label: "Курсы",  icon: "BookOpen" },
    { id: "members",  label: "Слушатели", icon: "Users" },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-background rounded-2xl border border-border shadow-2xl w-full max-w-3xl max-h-[92vh] overflow-hidden flex flex-col">

        {/* Шапка */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-cyan-500 rounded-xl flex items-center justify-center">
              <Icon name="UsersRound" size={20} className="text-white" />
            </div>
            <div>
              <h2 className="font-bold text-base leading-tight">Статистика группы {groupName}</h2>
              <p className="text-xs text-muted-foreground">{members.length} слушателей · {stats.totalAssignments} назначений</p>
            </div>
          </div>
          <button onClick={onClose} className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Табы */}
        <div className="flex gap-1 px-6 pt-3 flex-shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                tab === t.id
                  ? "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300"
                  : "text-muted-foreground hover:bg-muted/60"
              }`}
            >
              <Icon name={t.icon} size={14} />
              {t.label}
            </button>
          ))}
        </div>

        {/* Контент */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4">

          {/* === СВОДКА === */}
          {tab === "overview" && (
            <>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {[
                  { label: "Слушателей",  value: members.length,          icon: "Users",       color: "text-violet-500", bg: "icon-bg-violet" },
                  { label: "Назначений",  value: stats.totalAssignments,  icon: "BookOpen",    color: "text-cyan-500",   bg: "icon-bg-cyan" },
                  { label: "В процессе",  value: stats.inProgress,        icon: "Clock",       color: "text-amber-500",  bg: "icon-bg-amber" },
                  { label: "Завершено",   value: stats.completed,         icon: "Trophy",      color: "text-emerald-500",bg: "icon-bg-emerald" },
                ].map((m) => (
                  <div key={m.label} className="bg-card rounded-2xl border border-border p-4 flex flex-col gap-2">
                    <div className={`w-9 h-9 ${m.bg} rounded-xl flex items-center justify-center`}>
                      <Icon name={m.icon} size={17} className={m.color} />
                    </div>
                    <p className="text-2xl font-bold">{m.value}</p>
                    <p className="text-xs text-muted-foreground">{m.label}</p>
                  </div>
                ))}
              </div>

              {/* Средний прогресс */}
              <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-5">
                <ProgressRing value={stats.avgProgress} size={70} />
                <div className="flex-1 space-y-2">
                  <p className="font-semibold text-sm">Средний прогресс группы</p>
                  <div className="h-2.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all duration-700"
                      style={{ width: `${stats.avgProgress}%` }}
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">По {stats.totalAssignments} активным назначениям · {stats.certified} удостоверений</p>
                </div>
              </div>

              {/* Топ слушателей */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Icon name="Trophy" size={14} className="text-amber-500" />
                  Топ слушателей по прогрессу
                </h3>
                <div className="space-y-2">
                  {stats.memberStats.slice(0, 5).map((u, i) => (
                    <div key={u.id} className="flex items-center gap-3 bg-card rounded-xl border border-border px-4 py-2.5">
                      <span className={`text-xs font-bold w-5 text-center ${i === 0 ? "text-amber-500" : i === 1 ? "text-muted-foreground" : "text-muted-foreground/60"}`}>
                        {i + 1}
                      </span>
                      <div className={`w-8 h-8 rounded-lg bg-gradient-to-br ${userColors[u.id % userColors.length]} flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
                        {u.initials}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{u.name}</p>
                        <p className="text-xs text-muted-foreground">{u.activeCount} активных · {u.completedCount} завершено</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-20 h-1.5 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                            style={{ width: `${u.avgProgress}%` }}
                          />
                        </div>
                        <span className="text-sm font-bold w-10 text-right">{u.avgProgress}%</span>
                      </div>
                      <button
                        className="ml-1 w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => { setSelectedUser(u); setTab("members"); }}
                        title="Карточка слушателя"
                      >
                        <Icon name="ChevronRight" size={14} />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* === КУРСЫ === */}
          {tab === "courses" && (
            <div className="space-y-3">
              {stats.courseStats.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground text-sm">
                  Курсы не назначены
                </div>
              ) : stats.courseStats.map((c) => (
                <div key={c.courseId} className="bg-card rounded-xl border border-border p-4 space-y-3">
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <span className="text-xl">{c.emoji}</span>
                      <div className="min-w-0">
                        <p className="font-semibold text-sm leading-tight truncate">{c.title}</p>
                        <p className="text-xs text-muted-foreground">{c.duration}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4 flex-shrink-0">
                      <div className="text-center">
                        <p className="text-base font-bold">{c.enrolled}</p>
                        <p className="text-xs text-muted-foreground">слуш.</p>
                      </div>
                      <div className="text-center">
                        <p className="text-base font-bold text-emerald-500">{c.completed}</p>
                        <p className="text-xs text-muted-foreground">завершили</p>
                      </div>
                      <div className="text-center w-12">
                        <p className="text-base font-bold text-violet-500">{c.avgProgress}%</p>
                        <p className="text-xs text-muted-foreground">средний</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all"
                        style={{ width: `${c.avgProgress}%` }}
                      />
                    </div>
                    {c.enrolled > 0 && (
                      <div className="flex gap-1 pt-1 flex-wrap">
                        {stats.memberStats.filter((u) => u.assignments.some((a) => a.courseId === c.courseId && a.active)).map((u) => {
                          const a = u.assignments.find((as) => as.courseId === c.courseId)!;
                          const s = STATUS_MAP[a.status];
                          return (
                            <span key={u.id} className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${s.cls}`}>
                              {u.initials} · {a.progress}%
                            </span>
                          );
                        })}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* === СЛУШАТЕЛИ === */}
          {tab === "members" && !selectedUser && (
            <div className="space-y-2">
              {members.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground text-sm">
                  В группе нет слушателей
                </div>
              ) : stats.memberStats.map((u) => (
                <div
                  key={u.id}
                  className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors cursor-pointer group"
                  onClick={() => setSelectedUser(u)}
                >
                  <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${userColors[u.id % userColors.length]} flex items-center justify-center text-white text-sm font-bold flex-shrink-0`}>
                    {u.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm">{u.name}</p>
                    <p className="text-xs text-muted-foreground">{u.role} · {u.email}</p>
                  </div>
                  <div className="flex items-center gap-5 flex-shrink-0">
                    <div className="text-center hidden sm:block">
                      <p className="text-sm font-bold">{u.activeCount}</p>
                      <p className="text-xs text-muted-foreground">активных</p>
                    </div>
                    <div className="text-center hidden sm:block">
                      <p className="text-sm font-bold text-emerald-500">{u.completedCount}</p>
                      <p className="text-xs text-muted-foreground">завершено</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full"
                          style={{ width: `${u.avgProgress}%` }}
                        />
                      </div>
                      <span className="text-sm font-bold w-10 text-right">{u.avgProgress}%</span>
                    </div>
                  </div>
                  <Icon name="ChevronRight" size={16} className="text-muted-foreground group-hover:text-foreground transition-colors" />
                </div>
              ))}
            </div>
          )}

          {/* === ДЕТАЛИ СЛУШАТЕЛЯ === */}
          {tab === "members" && selectedUser && (
            <div className="space-y-4">
              <button
                onClick={() => setSelectedUser(null)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                <Icon name="ChevronLeft" size={16} />
                Все слушатели
              </button>

              {/* Заголовок слушателя */}
              <div className="bg-card rounded-2xl border border-border p-5 flex items-center gap-4">
                <div className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${userColors[selectedUser.id % userColors.length]} flex items-center justify-center text-white text-lg font-bold flex-shrink-0`}>
                  {selectedUser.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className="font-bold text-base">{selectedUser.name}</h3>
                  <p className="text-sm text-muted-foreground">{selectedUser.role} · {selectedUser.email}</p>
                </div>
                {onUserStats && (
                  <button
                    onClick={() => onUserStats(selectedUser)}
                    className="flex items-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:bg-muted text-sm text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Icon name="ExternalLink" size={14} />
                    Подробнее
                  </button>
                )}
              </div>

              {/* Мини-метрики слушателя */}
              {(() => {
                const active = selectedUser.assignments.filter((a) => a.active);
                const avgP = active.length > 0 ? Math.round(active.reduce((s, a) => s + a.progress, 0) / active.length) : 0;
                const completedC = selectedUser.assignments.filter((a) => a.status === "completed" || a.status === "certified").length;
                const certifiedC = selectedUser.assignments.filter((a) => a.status === "certified").length;
                return (
                  <>
                    <div className="grid grid-cols-4 gap-3">
                      {[
                        { label: "Всего курсов",  value: selectedUser.assignments.length, icon: "BookOpen",    color: "text-violet-500", bg: "icon-bg-violet" },
                        { label: "Активных",       value: active.length,                  icon: "Play",        color: "text-emerald-500",bg: "icon-bg-emerald" },
                        { label: "Завершено",      value: completedC,                     icon: "CheckCircle", color: "text-blue-500",   bg: "icon-bg-blue" },
                        { label: "Удостоверений",  value: certifiedC,                     icon: "Award",       color: "text-amber-500",  bg: "icon-bg-amber" },
                      ].map((m) => (
                        <div key={m.label} className="bg-card rounded-xl border border-border p-3 flex flex-col gap-1.5">
                          <div className={`w-8 h-8 ${m.bg} rounded-lg flex items-center justify-center`}>
                            <Icon name={m.icon} size={14} className={m.color} />
                          </div>
                          <p className="text-xl font-bold">{m.value}</p>
                          <p className="text-xs text-muted-foreground leading-tight">{m.label}</p>
                        </div>
                      ))}
                    </div>

                    {active.length > 0 && (
                      <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
                        <ProgressRing value={avgP} size={60} />
                        <div className="flex-1 space-y-1.5">
                          <p className="font-semibold text-sm">Средний прогресс</p>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all"
                              style={{ width: `${avgP}%` }}
                            />
                          </div>
                          <p className="text-xs text-muted-foreground">По {active.length} активным курсам</p>
                        </div>
                      </div>
                    )}
                  </>
                );
              })()}

              {/* Курсы слушателя */}
              <div>
                <h3 className="font-semibold text-sm mb-3 flex items-center gap-2">
                  <Icon name="ListChecks" size={14} className="text-muted-foreground" />
                  Детализация по курсам
                </h3>
                {selectedUser.assignments.length === 0 ? (
                  <div className="bg-card rounded-xl border border-border p-8 text-center text-muted-foreground text-sm">
                    Курсы не назначены
                  </div>
                ) : (
                  <div className="space-y-2.5">
                    {selectedUser.assignments.map((a) => {
                      const info = getCourseInfo(a.courseId);
                      const s = STATUS_MAP[a.status];
                      return (
                        <div key={a.courseId} className="bg-card rounded-xl border border-border p-4 space-y-3">
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <span className="text-xl">{info.emoji}</span>
                              <div className="min-w-0">
                                <p className="font-semibold text-sm leading-tight truncate">{info.title}</p>
                                <p className="text-xs text-muted-foreground">{info.duration}</p>
                              </div>
                            </div>
                            <span className={`shrink-0 flex items-center gap-1 px-2 py-0.5 rounded-md text-xs font-medium ${s.cls}`}>
                              <Icon name={s.icon} size={11} />
                              {s.label}
                            </span>
                          </div>
                          <div className="space-y-1.5">
                            <div className="flex justify-between text-xs">
                              <span className="text-muted-foreground">Прогресс</span>
                              <span className="font-bold">{a.progress}%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all ${a.progress === 100 ? "bg-gradient-to-r from-emerald-500 to-teal-500" : "bg-gradient-to-r from-violet-500 to-cyan-500"}`}
                                style={{ width: `${a.progress}%` }}
                              />
                            </div>
                          </div>
                          <div className="grid grid-cols-3 gap-2 text-xs">
                            {[
                              { label: "Назначен",  value: a.assignedAt,    icon: "Calendar" },
                              { label: "Начало",    value: a.activatedAt ?? "—", icon: "Play" },
                              { label: "Завершение",value: a.completedAt ?? "—", icon: "CheckCircle" },
                            ].map((d) => (
                              <div key={d.label} className="bg-muted/40 rounded-lg p-2.5 text-center">
                                <p className="text-muted-foreground mb-0.5">{d.label}</p>
                                <p className="font-semibold">{d.value}</p>
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
          )}

        </div>
      </div>
    </div>
  );
}
