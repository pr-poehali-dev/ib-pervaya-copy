import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";
import { useAuth } from "@/contexts/AuthContext";
import { INITIAL_USERS, COURSE_DIRECTIONS } from "@/data/mockData";

const GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
];

const EMOJIS = ["🏭", "⚡", "🦺", "📋", "🌊", "☣️"];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6)  return "Доброй ночи";
  if (h < 12) return "Доброе утро";
  if (h < 18) return "Добрый день";
  return "Добрый вечер";
}

function formatDate(): { day: string; date: string } {
  const now = new Date();
  const day = now.toLocaleDateString("ru-RU", { weekday: "long" });
  const date = now.toLocaleDateString("ru-RU", { day: "numeric", month: "long", year: "numeric" });
  return { day: day[0].toUpperCase() + day.slice(1), date };
}

export default function Dashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();

  const studentUser = INITIAL_USERS[0] ?? null;
  const assignments = studentUser?.assignments ?? [];

  const activeAssignments = assignments.filter((a) => a.status === "active");
  const completedAssignments = assignments.filter((a) => a.status === "completed" || a.status === "certified");
  const certifiedAssignments = assignments.filter((a) => a.status === "certified");

  const totalProgress = activeAssignments.length > 0
    ? Math.round(activeAssignments.reduce((s, a) => s + a.progress, 0) / activeAssignments.length)
    : 0;

  const totalHours = assignments.reduce((sum, a) => {
    const course = COURSE_DIRECTIONS.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
    return sum + (course?.hours ?? 0);
  }, 0);

  const firstName = user?.firstName ?? "Слушатель";
  const { day, date } = formatDate();

  const stats = [
    { label: "Курсов завершено",  value: completedAssignments.length, icon: "Trophy",       color: "text-amber-500",   bg: "bg-amber-100 dark:bg-amber-900/30" },
    { label: "Часов обучения",    value: totalHours,                  icon: "Clock",        color: "text-violet-600",  bg: "bg-violet-100 dark:bg-violet-900/30" },
    { label: "Удостоверений",     value: certifiedAssignments.length, icon: "Award",        color: "text-emerald-600", bg: "bg-emerald-100 dark:bg-emerald-900/30" },
    { label: "Активных курсов",   value: activeAssignments.length,    icon: "PlayCircle",   color: "text-blue-500",    bg: "bg-blue-100 dark:bg-blue-900/30" },
  ];

  const activeCourses = activeAssignments.map((a) => {
    const course = COURSE_DIRECTIONS.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
    const dir    = COURSE_DIRECTIONS.find((d) => d.courses.some((c) => c.id === a.courseId));
    return { assignment: a, course, dir };
  }).filter((x) => x.course);

  const nextCourse = activeCourses[0];

  return (
    <Layout>
      <div className="space-y-4 sm:space-y-8">

        {/* Заголовок */}
        <div className="flex items-start justify-between gap-3">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground mb-1">
              {getGreeting()}, {firstName}! 👋
            </h1>
            <p className="text-sm sm:text-base text-muted-foreground">Продолжайте обучение — вы на правильном пути</p>
          </div>
          <div className="text-right text-sm text-muted-foreground flex-shrink-0">
            <p className="font-medium text-foreground">{day}</p>
            <p>{date}</p>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 sm:gap-3">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-xl px-3 py-2.5 sm:px-4 sm:py-3 border border-border shadow-sm flex items-center gap-2 sm:gap-3">
              <div className={`w-7 h-7 sm:w-8 sm:h-8 ${stat.bg} rounded-lg flex items-center justify-center flex-shrink-0`}>
                <Icon name={stat.icon} size={14} className={stat.color} />
              </div>
              <div className="min-w-0">
                <p className="text-base sm:text-lg font-bold text-foreground leading-none">{stat.value}</p>
                <p className="text-muted-foreground text-[10px] sm:text-xs mt-0.5 truncate">{stat.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Прогресс */}
        {activeAssignments.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">Средний прогресс по активным курсам</h2>
              <span className="text-sm font-semibold text-violet-600">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-3 mb-2" />
            <div className="flex justify-between text-xs text-muted-foreground mt-2">
              <span>{activeAssignments.length} активных · {completedAssignments.length} завершено</span>
              <span>Всего {assignments.length} курсов</span>
            </div>
          </div>
        )}

        {/* Активные курсы */}
        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Продолжить обучение</h2>
            <button
              onClick={() => navigate("/my-learning")}
              className="text-primary text-sm font-medium hover:underline flex items-center gap-1"
            >
              Все курсы <Icon name="ChevronRight" size={16} />
            </button>
          </div>

          {activeCourses.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-5 sm:p-10 text-center">
              <div className="w-14 h-14 bg-muted/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="BookOpen" size={24} className="text-muted-foreground" />
              </div>
              <p className="font-semibold">Нет активных курсов</p>
              <p className="text-sm text-muted-foreground mt-1">Обратитесь к администратору для назначения курсов</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {activeCourses.map(({ assignment, course, dir }, idx) => (
                <div
                  key={assignment.courseId}
                  onClick={() => navigate(`/course/${assignment.courseId}`)}
                  className="bg-card rounded-2xl border border-border p-5 cursor-pointer hover:shadow-md hover:border-violet-300 dark:hover:border-violet-700 transition-all group"
                >
                  <div className="flex items-start gap-4">
                    <div className={`w-14 h-14 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                      {EMOJIS[idx % EMOJIS.length]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-xs text-muted-foreground mb-0.5">{dir?.title}</p>
                      <p className="font-semibold text-sm leading-snug group-hover:text-violet-600 transition-colors line-clamp-2">{course?.title}</p>
                      {course?.code && <p className="text-xs text-muted-foreground font-mono mt-0.5">{course.code}</p>}
                    </div>
                  </div>
                  <div className="mt-4 space-y-1.5">
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>Прогресс</span>
                      <span className="font-semibold text-violet-600">{assignment.progress}%</span>
                    </div>
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all"
                        style={{ width: `${assignment.progress}%` }}
                      />
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs text-muted-foreground truncate">{course?.hours} ч · {assignment.activatedAt}</span>
                    <span className="text-xs text-violet-600 font-medium flex items-center gap-1 group-hover:gap-2 transition-all">
                      Продолжить <Icon name="ChevronRight" size={13} />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Баннер следующего курса */}
        {nextCourse && (
          <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-5 sm:p-6 text-white">
            <div className="flex items-center justify-between gap-4">
              <div className="min-w-0">
                <h3 className="text-lg sm:text-xl font-bold mb-1">Продолжите там, где остановились</h3>
                <p className="text-white/80 text-sm mb-4 line-clamp-2">
                  {nextCourse.course?.title} — {nextCourse.assignment.progress}% завершено
                </p>
                <button
                  onClick={() => navigate(`/course/${nextCourse.assignment.courseId}`)}
                  className="bg-white text-violet-700 font-semibold px-4 sm:px-5 py-2.5 rounded-xl text-sm hover:bg-white/90 transition-colors"
                >
                  Продолжить обучение →
                </button>
              </div>
              <span className="text-4xl sm:text-6xl opacity-80 flex-shrink-0">🚀</span>
            </div>
          </div>
        )}

        {/* Ожидают активации */}
        {assignments.filter((a) => a.status === "pending").length > 0 && (
          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-5 flex items-center gap-4">
            <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
              <Icon name="Clock" size={20} className="text-amber-600 dark:text-amber-400" />
            </div>
            <div className="flex-1">
              <p className="font-semibold text-amber-800 dark:text-amber-300 text-sm">
                {assignments.filter((a) => a.status === "pending").length} курса ожидают активации
              </p>
              <p className="text-xs text-amber-700 dark:text-amber-400 mt-0.5">
                Обратитесь к администратору для активации назначенных курсов
              </p>
            </div>
            <button
              onClick={() => navigate("/my-learning")}
              className="px-3 py-1.5 bg-amber-600 text-white text-xs font-medium rounded-lg hover:bg-amber-700 transition-colors flex-shrink-0"
            >
              Посмотреть
            </button>
          </div>
        )}
      </div>
    </Layout>
  );
}