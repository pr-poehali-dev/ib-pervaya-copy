import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { INITIAL_USERS, COURSE_DIRECTIONS } from "@/data/mockData";

// ─── Определение достижений ───────────────────────────────────────────────────

interface Achievement {
  id: string;
  emoji: string;
  title: string;
  desc: string;
  category: "learning" | "progress" | "expert" | "social";
  xp: number;
  condition: (stats: UserStats) => boolean;
  progress?: (stats: UserStats) => { current: number; total: number };
}

interface UserStats {
  completed: number;
  certified: number;
  active: number;
  total: number;
  totalHours: number;
  avgScore: number;
  maxScore: number;
}

const ACHIEVEMENTS: Achievement[] = [
  {
    id: "first_course",
    emoji: "🏆",
    title: "Первый шаг",
    desc: "Завершите первый курс",
    category: "learning",
    xp: 100,
    condition: (s) => s.completed >= 1,
    progress: (s) => ({ current: Math.min(s.completed, 1), total: 1 }),
  },
  {
    id: "three_courses",
    emoji: "🎓",
    title: "Студент",
    desc: "Завершите 3 курса",
    category: "learning",
    xp: 250,
    condition: (s) => s.completed >= 3,
    progress: (s) => ({ current: Math.min(s.completed, 3), total: 3 }),
  },
  {
    id: "five_courses",
    emoji: "📚",
    title: "Знаток",
    desc: "Завершите 5 курсов",
    category: "learning",
    xp: 500,
    condition: (s) => s.completed >= 5,
    progress: (s) => ({ current: Math.min(s.completed, 5), total: 5 }),
  },
  {
    id: "certified",
    emoji: "📜",
    title: "Сертифицирован",
    desc: "Получите первое удостоверение ДПО",
    category: "expert",
    xp: 300,
    condition: (s) => s.certified >= 1,
    progress: (s) => ({ current: Math.min(s.certified, 1), total: 1 }),
  },
  {
    id: "three_certs",
    emoji: "🏅",
    title: "Мастер ДПО",
    desc: "Получите 3 удостоверения ДПО",
    category: "expert",
    xp: 750,
    condition: (s) => s.certified >= 3,
    progress: (s) => ({ current: Math.min(s.certified, 3), total: 3 }),
  },
  {
    id: "high_score",
    emoji: "⭐",
    title: "Отличник",
    desc: "Сдайте тест на 90% и выше",
    category: "progress",
    xp: 200,
    condition: (s) => s.maxScore >= 90,
    progress: (s) => ({ current: Math.min(Math.round(s.maxScore), 90), total: 90 }),
  },
  {
    id: "perfect_score",
    emoji: "💯",
    title: "Перфекционист",
    desc: "Сдайте тест на 100%",
    category: "progress",
    xp: 500,
    condition: (s) => s.maxScore >= 100,
    progress: (s) => ({ current: Math.min(Math.round(s.maxScore), 100), total: 100 }),
  },
  {
    id: "active_learner",
    emoji: "🔥",
    title: "Активный учёный",
    desc: "Имейте 2 активных курса одновременно",
    category: "learning",
    xp: 150,
    condition: (s) => s.active >= 2,
    progress: (s) => ({ current: Math.min(s.active, 2), total: 2 }),
  },
  {
    id: "hours_40",
    emoji: "⏰",
    title: "40 часов",
    desc: "Наберите 40 часов обучения",
    category: "progress",
    xp: 200,
    condition: (s) => s.totalHours >= 40,
    progress: (s) => ({ current: Math.min(s.totalHours, 40), total: 40 }),
  },
  {
    id: "hours_120",
    emoji: "🕰️",
    title: "120 часов",
    desc: "Наберите 120 часов обучения",
    category: "progress",
    xp: 500,
    condition: (s) => s.totalHours >= 120,
    progress: (s) => ({ current: Math.min(s.totalHours, 120), total: 120 }),
  },
  {
    id: "expert_pb",
    emoji: "🛡️",
    title: "Эксперт ПБ",
    desc: "Завершите курс по подготовке экспертов ПБ",
    category: "expert",
    xp: 600,
    condition: (s) => s.certified >= 1,
  },
  {
    id: "all_active",
    emoji: "🚀",
    title: "Полный вперёд",
    desc: "Запишитесь на 3 и более курсов",
    category: "social",
    xp: 150,
    condition: (s) => s.total >= 3,
    progress: (s) => ({ current: Math.min(s.total, 3), total: 3 }),
  },
];

const CATEGORY_LABELS: Record<Achievement["category"], { label: string; icon: string; color: string }> = {
  learning: { label: "Обучение",   icon: "BookOpen",     color: "text-violet-600" },
  progress: { label: "Прогресс",   icon: "TrendingUp",   color: "text-emerald-600" },
  expert:   { label: "Экспертиза", icon: "Award",        color: "text-amber-500" },
  social:   { label: "Активность", icon: "Users",        color: "text-blue-500" },
};

const XP_LEVELS = [
  { level: 1, title: "Новичок",       xp: 0 },
  { level: 2, title: "Слушатель",     xp: 200 },
  { level: 3, title: "Практикант",    xp: 500 },
  { level: 4, title: "Специалист",    xp: 1000 },
  { level: 5, title: "Эксперт",       xp: 2000 },
  { level: 6, title: "Мастер",        xp: 3500 },
];

export default function Achievements() {
  const navigate = useNavigate();

  const user = INITIAL_USERS[0];
  const assignments = user.assignments;

  const stats: UserStats = {
    completed:  assignments.filter((a) => a.status === "completed" || a.status === "certified").length,
    certified:  assignments.filter((a) => a.status === "certified").length,
    active:     assignments.filter((a) => a.status === "active").length,
    total:      assignments.length,
    totalHours: assignments.reduce((sum, a) => {
      const course = COURSE_DIRECTIONS.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
      return sum + (course?.hours ?? 0);
    }, 0),
    avgScore: (() => {
      const scored = assignments.filter((a) => a.testScore);
      return scored.length > 0 ? scored.reduce((s, a) => s + (a.testScore ?? 0), 0) / scored.length : 0;
    })(),
    maxScore: Math.max(0, ...assignments.map((a) => a.testScore ?? 0)),
  };

  const evaluated = ACHIEVEMENTS.map((a) => ({ ...a, earned: a.condition(stats) }));
  const earnedList = evaluated.filter((a) => a.earned);
  const pendingList = evaluated.filter((a) => !a.earned);

  const totalXP = earnedList.reduce((sum, a) => sum + a.xp, 0);

  const currentLevelData = XP_LEVELS.slice().reverse().find((l) => totalXP >= l.xp) ?? XP_LEVELS[0];
  const nextLevelData = XP_LEVELS.find((l) => l.xp > totalXP);
  const levelProgress = nextLevelData
    ? Math.round(((totalXP - currentLevelData.xp) / (nextLevelData.xp - currentLevelData.xp)) * 100)
    : 100;

  const categories = Array.from(new Set(ACHIEVEMENTS.map((a) => a.category)));

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">

        {/* Заголовок */}
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold mb-1">Достижения</h1>
          <p className="text-sm sm:text-base text-muted-foreground">Ваши награды за успехи в обучении</p>
        </div>

        {/* Карточка уровня и XP */}
        <div className="bg-gradient-to-br from-violet-600 to-purple-700 rounded-2xl p-5 sm:p-6 text-white">
          <div className="flex items-start justify-between gap-3 mb-4">
            <div>
              <p className="text-white/70 text-sm mb-1">Ваш уровень</p>
              <p className="text-2xl sm:text-3xl font-bold">{currentLevelData.title}</p>
              <p className="text-white/70 text-sm mt-1">Уровень {currentLevelData.level}</p>
            </div>
            <div className="text-right flex-shrink-0">
              <p className="text-white/70 text-sm mb-1">Опыт (XP)</p>
              <p className="text-2xl sm:text-3xl font-bold">{totalXP}</p>
              {nextLevelData && (
                <p className="text-white/70 text-xs sm:text-sm mt-1">до {nextLevelData.title}: {nextLevelData.xp - totalXP} XP</p>
              )}
            </div>
          </div>
          {nextLevelData && (
            <>
              <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-1">
                <div className="h-full bg-white rounded-full transition-all" style={{ width: `${levelProgress}%` }} />
              </div>
              <div className="flex justify-between text-xs text-white/60">
                <span>{currentLevelData.xp} XP</span>
                <span>{nextLevelData.xp} XP</span>
              </div>
            </>
          )}
        </div>

        {/* Статистика достижений */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[
            { label: "Получено",   value: earnedList.length,                      icon: "Trophy",   color: "text-amber-500",   bg: "bg-amber-100 dark:bg-amber-900/30" },
            { label: "Всего",      value: ACHIEVEMENTS.length,                    icon: "Target",   color: "text-violet-600",  bg: "bg-violet-100 dark:bg-violet-900/30" },
            { label: "Суммарно XP",value: totalXP,                               icon: "Star",     color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
            { label: "Осталось",   value: pendingList.length,                     icon: "Lock",     color: "text-blue-500",    bg: "bg-blue-100 dark:bg-blue-900/30" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-5 text-center">
              <div className={`w-10 h-10 ${s.bg} rounded-xl flex items-center justify-center mx-auto mb-2`}>
                <Icon name={s.icon} size={18} className={s.color} />
              </div>
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Полученные достижения */}
        {earnedList.length > 0 && (
          <div className="space-y-4">
            <h2 className="text-xl font-bold flex items-center gap-2">
              <Icon name="Trophy" size={20} className="text-amber-500" />
              Получено ({earnedList.length})
            </h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {earnedList.map((a) => {
                const cat = CATEGORY_LABELS[a.category];
                return (
                  <div key={a.id} className="bg-card rounded-2xl border border-violet-200 dark:border-violet-800 bg-violet-50/50 dark:bg-violet-900/10 p-5 flex items-start gap-4">
                    <div className="w-14 h-14 bg-gradient-to-br from-violet-500 to-purple-700 rounded-2xl flex items-center justify-center text-3xl flex-shrink-0">
                      {a.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-start justify-between gap-2">
                        <p className="font-bold text-sm">{a.title}</p>
                        <span className="text-xs font-semibold text-violet-600 dark:text-violet-400 flex-shrink-0">+{a.xp} XP</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                      <div className="flex items-center gap-1 mt-2">
                        <Icon name={cat.icon} size={11} className={cat.color} />
                        <span className={`text-xs ${cat.color}`}>{cat.label}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Заблокированные достижения по категориям */}
        <div className="space-y-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <Icon name="Lock" size={20} className="text-muted-foreground" />
            Ещё не получены ({pendingList.length})
          </h2>

          {categories.map((cat) => {
            const catItems = pendingList.filter((a) => a.category === cat);
            if (catItems.length === 0) return null;
            const catInfo = CATEGORY_LABELS[cat];
            return (
              <div key={cat} className="bg-card rounded-2xl border border-border overflow-hidden">
                <div className="px-5 py-3.5 border-b border-border bg-muted/30 flex items-center gap-2">
                  <Icon name={catInfo.icon} size={15} className={catInfo.color} />
                  <p className="font-semibold text-sm">{catInfo.label}</p>
                  <span className="text-xs text-muted-foreground ml-auto">{catItems.length} достижений</span>
                </div>
                <div className="divide-y divide-border">
                  {catItems.map((a) => {
                    const prog = a.progress?.(stats);
                    const pct  = prog ? Math.round((prog.current / prog.total) * 100) : 0;
                    return (
                      <div key={a.id} className="px-5 py-4 flex items-start gap-4 opacity-70">
                        <div className="w-12 h-12 bg-muted rounded-2xl flex items-center justify-center text-2xl flex-shrink-0 grayscale">
                          {a.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <p className="font-semibold text-sm">{a.title}</p>
                            <span className="text-xs text-muted-foreground flex-shrink-0">+{a.xp} XP</span>
                          </div>
                          <p className="text-xs text-muted-foreground mt-0.5">{a.desc}</p>
                          {prog && (
                            <div className="mt-2 space-y-1">
                              <div className="flex justify-between text-xs text-muted-foreground">
                                <span>Прогресс</span>
                                <span>{prog.current} / {prog.total}</span>
                              </div>
                              <Progress value={pct} className="h-1.5" />
                            </div>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>

        {/* Призыв к действию */}
        {pendingList.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-4 sm:p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 sm:gap-5">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-violet-100 dark:bg-violet-900/30 rounded-2xl flex items-center justify-center flex-shrink-0">
              <Icon name="Zap" size={20} className="text-violet-600 dark:text-violet-400" />
            </div>
            <div className="flex-1">
              <p className="font-bold">Продолжайте обучение!</p>
              <p className="text-sm text-muted-foreground mt-0.5">
                Завершите курсы и сдайте тесты — каждый шаг приближает вас к новым достижениям
              </p>
            </div>
            <button
              onClick={() => navigate("/my-learning")}
              className="w-full sm:w-auto px-4 py-2 rounded-xl gradient-primary text-white text-sm font-medium flex-shrink-0"
            >
              К обучению
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}
