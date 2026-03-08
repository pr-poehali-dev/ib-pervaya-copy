import Icon from "@/components/ui/icon";
import { GroupStats, STATUS_MAP } from "./GroupStatsUtils";

interface GroupStatsCoursesTabProps {
  stats: GroupStats;
}

export default function GroupStatsCoursesTab({ stats }: GroupStatsCoursesTabProps) {
  return (
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
  );
}
