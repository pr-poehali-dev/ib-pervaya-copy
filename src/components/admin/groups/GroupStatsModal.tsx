import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { User } from "@/components/admin/types";
import { getCourseInfo, exportCSV, exportPDF, GroupStats } from "./GroupStatsUtils";
import GroupStatsOverviewTab from "./GroupStatsOverviewTab";
import GroupStatsCoursesTab from "./GroupStatsCoursesTab";
import GroupStatsMembersTab from "./GroupStatsMembersTab";

interface GroupStatsModalProps {
  groupName: string | null;
  users: User[];
  onClose: () => void;
  onUserStats?: (user: User) => void;
}

type Tab = "overview" | "courses" | "members";

export default function GroupStatsModal({ groupName, users, onClose, onUserStats }: GroupStatsModalProps) {
  const [tab, setTab] = useState<Tab>("overview");
  const [selectedUser, setSelectedUser] = useState<User | null>(null);

  const members = useMemo(
    () => users.filter((u) => u.group === groupName),
    [users, groupName]
  );

  const stats: GroupStats = useMemo(() => {
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
    { id: "overview", label: "Сводка",     icon: "LayoutDashboard" },
    { id: "courses",  label: "Курсы",      icon: "BookOpen" },
    { id: "members",  label: "Слушатели",  icon: "Users" },
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
          <div className="flex items-center gap-2">
            <button
              onClick={() => exportCSV(groupName!, members)}
              title="Скачать Excel (CSV)"
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border hover:bg-emerald-50 dark:hover:bg-emerald-900/20 hover:border-emerald-300 dark:hover:border-emerald-700 text-muted-foreground hover:text-emerald-600 dark:hover:text-emerald-400 text-xs font-medium transition-colors"
            >
              <Icon name="FileSpreadsheet" size={14} />
              Excel
            </button>
            <button
              onClick={() => exportPDF(groupName!, members, stats)}
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

        {/* Табы */}
        <div className="flex gap-1 px-6 pt-3 flex-shrink-0">
          {tabs.map((t) => (
            <button
              key={t.id}
              onClick={() => { setTab(t.id); setSelectedUser(null); }}
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
          {tab === "overview" && (
            <GroupStatsOverviewTab
              members={members}
              stats={stats}
              onSelectMember={(u) => { setSelectedUser(u); setTab("members"); }}
            />
          )}

          {tab === "courses" && (
            <GroupStatsCoursesTab stats={stats} />
          )}

          {tab === "members" && (
            <GroupStatsMembersTab
              members={members}
              stats={stats}
              selectedUser={selectedUser}
              onSelectUser={setSelectedUser}
              onUserStats={onUserStats}
            />
          )}
        </div>
      </div>
    </div>
  );
}
