import Icon from "@/components/ui/icon";
import { User, userColors } from "@/components/admin/types";
import { GroupStats, getCourseInfo, STATUS_MAP } from "./GroupStatsUtils";

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
        stroke="url(#gring2)" strokeWidth="5.5"
        strokeDasharray={`${dash} ${circ}`}
        strokeLinecap="round"
        transform={`rotate(-90 ${cx} ${cx})`}
      />
      <defs>
        <linearGradient id="gring2" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor="#8b5cf6" />
          <stop offset="100%" stopColor="#06b6d4" />
        </linearGradient>
      </defs>
      <text x={cx} y={cx + 4} textAnchor="middle" fontSize="11" fontWeight="700" fill="currentColor">{value}%</text>
    </svg>
  );
}

interface GroupStatsMembersTabProps {
  members: User[];
  stats: GroupStats;
  selectedUser: User | null;
  onSelectUser: (user: User | null) => void;
  onUserStats?: (user: User) => void;
}

export default function GroupStatsMembersTab({
  members,
  stats,
  selectedUser,
  onSelectUser,
  onUserStats,
}: GroupStatsMembersTabProps) {
  if (!selectedUser) {
    return (
      <div className="space-y-2">
        {members.length === 0 ? (
          <div className="bg-card rounded-xl border border-border p-10 text-center text-muted-foreground text-sm">
            В группе нет слушателей
          </div>
        ) : stats.memberStats.map((u) => (
          <div
            key={u.id}
            className="bg-card rounded-xl border border-border p-4 flex items-center gap-4 hover:bg-muted/20 transition-colors cursor-pointer group"
            onClick={() => onSelectUser(u)}
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
    );
  }

  const active = selectedUser.assignments.filter((a) => a.active);
  const avgP = active.length > 0 ? Math.round(active.reduce((s, a) => s + a.progress, 0) / active.length) : 0;
  const completedC = selectedUser.assignments.filter((a) => a.status === "completed" || a.status === "certified").length;
  const certifiedC = selectedUser.assignments.filter((a) => a.status === "certified").length;

  return (
    <div className="space-y-4">
      <button
        onClick={() => onSelectUser(null)}
        className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
      >
        <Icon name="ChevronLeft" size={16} />
        Все слушатели
      </button>

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

      <div className="grid grid-cols-4 gap-3">
        {[
          { label: "Всего курсов",  value: selectedUser.assignments.length, icon: "BookOpen",    color: "text-violet-500",  bg: "icon-bg-violet" },
          { label: "Активных",      value: active.length,                   icon: "Play",        color: "text-emerald-500", bg: "icon-bg-emerald" },
          { label: "Завершено",     value: completedC,                      icon: "CheckCircle", color: "text-blue-500",    bg: "icon-bg-blue" },
          { label: "Удостоверений", value: certifiedC,                      icon: "Award",       color: "text-amber-500",   bg: "icon-bg-amber" },
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
                      { label: "Назначен",   value: a.assignedAt,         icon: "Calendar" },
                      { label: "Начало",     value: a.activatedAt ?? "—", icon: "Play" },
                      { label: "Завершение", value: a.completedAt ?? "—", icon: "CheckCircle" },
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
  );
}
