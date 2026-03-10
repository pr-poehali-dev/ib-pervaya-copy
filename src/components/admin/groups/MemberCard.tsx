import Icon from "@/components/ui/icon";
import { User } from "@/components/admin/types";
import { ALL_COURSES } from "@/data/mockData";

interface MemberCardProps {
  user: User;
  onOpen: () => void;
  onStats: () => void;
  onAddCourse: () => void;
}

const GRADIENTS = [
  "from-violet-400 to-purple-600",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
  "from-rose-400 to-pink-500",
  "from-indigo-400 to-blue-600",
];

function getGradient(id: number) {
  return GRADIENTS[id % GRADIENTS.length];
}

export default function MemberCard({ user, onOpen, onStats, onAddCourse }: MemberCardProps) {
  const gradient = getGradient(user.id);
  const activeAssignments = user.assignments.filter((a) => a.active);
  const completedCount = user.assignments.filter((a) => a.progress === 100).length;
  const avgProgress = activeAssignments.length > 0
    ? Math.round(activeAssignments.reduce((s, a) => s + a.progress, 0) / activeAssignments.length)
    : 0;

  const lastCourse = activeAssignments.length > 0
    ? ALL_COURSES.find((c) => c.id === activeAssignments[activeAssignments.length - 1].courseId)
    : null;

  return (
    <div
      className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-4 flex flex-col gap-3 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer"
      onClick={onOpen}
    >
      {/* Аватар + имя */}
      <div className="flex items-center gap-3">
        <div className={`w-12 h-12 rounded-2xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
          <span className="text-white font-bold text-sm">{user.initials}</span>
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm text-foreground truncate">{user.name}</p>
          <p className="text-xs text-muted-foreground truncate">{user.email}</p>
        </div>
      </div>

      {/* Последний курс */}
      {lastCourse && (
        <div className="flex items-center gap-2 bg-muted/50 rounded-xl px-3 py-2">
          <span className="text-base">{lastCourse.emoji}</span>
          <p className="text-xs text-muted-foreground truncate">{lastCourse.title}</p>
        </div>
      )}

      {/* Прогресс */}
      <div className="space-y-1">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Прогресс</span>
          <span className="font-semibold text-foreground">{avgProgress}%</span>
        </div>
        <div className="h-1.5 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all`}
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      </div>

      {/* Статы + кнопки */}
      <div className="flex items-center justify-between">
        <div className="flex gap-3 text-xs text-muted-foreground">
          <span className="flex items-center gap-1">
            <Icon name="BookOpen" size={12} />
            {activeAssignments.length} курс{activeAssignments.length === 1 ? "" : activeAssignments.length < 5 ? "а" : "ов"}
          </span>
          <span className="flex items-center gap-1 text-emerald-600">
            <Icon name="CheckCircle" size={12} />
            {completedCount} завершено
          </span>
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onStats}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            title="Статистика"
          >
            <Icon name="BarChart2" size={13} className="text-muted-foreground" />
          </button>
          <button
            onClick={onAddCourse}
            className="w-7 h-7 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            title="Добавить курс"
          >
            <Icon name="BookPlus" size={13} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
