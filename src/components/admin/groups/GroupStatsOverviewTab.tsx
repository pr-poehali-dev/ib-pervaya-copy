import Icon from "@/components/ui/icon";
import { User, userColors } from "@/components/admin/types";
import { GroupStats } from "./GroupStatsUtils";

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

interface GroupStatsOverviewTabProps {
  members: User[];
  stats: GroupStats;
  onSelectMember: (user: User) => void;
}

export default function GroupStatsOverviewTab({ members, stats, onSelectMember }: GroupStatsOverviewTabProps) {
  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Слушателей",  value: members.length,         icon: "Users",    color: "text-violet-500",  bg: "icon-bg-violet" },
          { label: "Назначений",  value: stats.totalAssignments, icon: "BookOpen", color: "text-cyan-500",    bg: "icon-bg-cyan" },
          { label: "В процессе",  value: stats.inProgress,       icon: "Clock",    color: "text-amber-500",   bg: "icon-bg-amber" },
          { label: "Завершено",   value: stats.completed,        icon: "Trophy",   color: "text-emerald-500", bg: "icon-bg-emerald" },
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
                onClick={() => onSelectMember(u)}
                title="Карточка слушателя"
              >
                <Icon name="ChevronRight" size={14} />
              </button>
            </div>
          ))}
        </div>
      </div>
    </>
  );
}
