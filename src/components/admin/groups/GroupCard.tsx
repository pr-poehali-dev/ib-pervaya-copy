import Icon from "@/components/ui/icon";
import { User } from "@/components/admin/types";

interface GroupCardProps {
  group: string;
  members: User[];
  status: string;
  avgProgress: number;
  onOpen: () => void;
  onStats: () => void;
  onAddCourse: () => void;
}

const STATUS_STYLE: Record<string, string> = {
  "Обучается": "bg-emerald-100 text-emerald-700",
  "Завершено":  "bg-blue-100 text-blue-700",
  "Не начато":  "bg-gray-100 text-gray-500",
};

const GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-700",
];

function getGradient(group: string) {
  let hash = 0;
  for (let i = 0; i < group.length; i++) hash = (hash * 31 + group.charCodeAt(i)) & 0xffffffff;
  return GRADIENTS[Math.abs(hash) % GRADIENTS.length];
}

export default function GroupCard({ group, members, status, avgProgress, onOpen, onStats, onAddCourse }: GroupCardProps) {
  const gradient = getGradient(group);
  const completed = members.filter((u) => u.assignments.some((a) => a.progress === 100)).length;
  const active = members.filter((u) => u.assignments.some((a) => a.active && a.progress > 0 && a.progress < 100)).length;
  const totalAssignments = members.reduce((s, u) => s + u.assignments.filter((a) => a.active).length, 0);

  return (
    <div
      className="bg-white dark:bg-slate-900 border border-border rounded-2xl p-5 flex flex-col gap-4 hover:shadow-md hover:border-primary/30 transition-all cursor-pointer group"
      onClick={onOpen}
    >
      {/* Шапка */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className={`w-11 h-11 rounded-xl bg-gradient-to-br ${gradient} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon name="Users" size={20} className="text-white" />
          </div>
          <div>
            <p className="font-bold text-sm text-foreground">{group}</p>
            <p className="text-xs text-muted-foreground">{members.length} слушател{members.length === 1 ? "ь" : members.length < 5 ? "я" : "ей"}</p>
          </div>
        </div>
        <span className={`text-[11px] font-medium px-2.5 py-1 rounded-full flex-shrink-0 ${STATUS_STYLE[status] ?? STATUS_STYLE["Не начато"]}`}>
          {status}
        </span>
      </div>

      {/* Прогресс */}
      <div className="space-y-1.5">
        <div className="flex justify-between text-xs text-muted-foreground">
          <span>Средний прогресс</span>
          <span className="font-semibold text-foreground">{avgProgress}%</span>
        </div>
        <div className="h-2 bg-muted rounded-full overflow-hidden">
          <div
            className={`h-full bg-gradient-to-r ${gradient} rounded-full transition-all`}
            style={{ width: `${avgProgress}%` }}
          />
        </div>
      </div>

      {/* Статы */}
      <div className="grid grid-cols-3 gap-2">
        <div className="text-center bg-muted/50 rounded-xl py-2">
          <p className="font-bold text-sm text-foreground">{totalAssignments}</p>
          <p className="text-[10px] text-muted-foreground">назначений</p>
        </div>
        <div className="text-center bg-muted/50 rounded-xl py-2">
          <p className="font-bold text-sm text-emerald-600">{active}</p>
          <p className="text-[10px] text-muted-foreground">активных</p>
        </div>
        <div className="text-center bg-muted/50 rounded-xl py-2">
          <p className="font-bold text-sm text-blue-600">{completed}</p>
          <p className="text-[10px] text-muted-foreground">завершили</p>
        </div>
      </div>

      {/* Аватары + кнопки */}
      <div className="flex items-center justify-between">
        <div className="flex -space-x-2">
          {members.slice(0, 4).map((m, i) => (
            <div
              key={m.id}
              className={`w-7 h-7 rounded-full bg-gradient-to-br ${GRADIENTS[i % GRADIENTS.length]} border-2 border-white dark:border-slate-900 flex items-center justify-center`}
            >
              <span className="text-white text-[9px] font-bold">{m.initials.slice(0, 2)}</span>
            </div>
          ))}
          {members.length > 4 && (
            <div className="w-7 h-7 rounded-full bg-muted border-2 border-white dark:border-slate-900 flex items-center justify-center">
              <span className="text-muted-foreground text-[9px] font-bold">+{members.length - 4}</span>
            </div>
          )}
        </div>
        <div className="flex gap-1" onClick={(e) => e.stopPropagation()}>
          <button
            onClick={onStats}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            title="Статистика"
          >
            <Icon name="BarChart2" size={15} className="text-muted-foreground" />
          </button>
          <button
            onClick={onAddCourse}
            className="w-8 h-8 rounded-lg hover:bg-muted flex items-center justify-center transition-colors"
            title="Назначить курс"
          >
            <Icon name="BookPlus" size={15} className="text-muted-foreground" />
          </button>
        </div>
      </div>
    </div>
  );
}
