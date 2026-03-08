import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Icon from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { INITIAL_USERS, ALL_COURSES, COURSE_DIRECTIONS } from "@/data/mockData";
import type { CourseStatus } from "@/components/admin/types";

const ME = INITIAL_USERS[0];

const STATUS_MAP: Record<CourseStatus, { label: string; cls: string; icon: string }> = {
  pending:   { label: "Ожидает активации",   cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",     icon: "Clock" },
  active:    { label: "Идёт обучение",        cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", icon: "PlayCircle" },
  completed: { label: "Завершено",            cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300",         icon: "CheckCircle" },
  certified: { label: "Удостоверение выдано", cls: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300", icon: "Award" },
};

const GRADIENTS = [
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-600",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-rose-500 to-pink-600",
  "from-indigo-500 to-blue-700",
];

type FilterKey = "all" | "active" | "pending" | "completed" | "certified";

const FILTER_OPTIONS: { key: FilterKey; label: string }[] = [
  { key: "all",       label: "Все" },
  { key: "active",    label: "В процессе" },
  { key: "pending",   label: "Ожидают активации" },
  { key: "completed", label: "Завершены" },
  { key: "certified", label: "С удостоверением" },
];

export default function MyLearning() {
  const navigate = useNavigate();
  const [filter, setFilter] = useState<FilterKey>("all");

  const assignments = ME.assignments.map((a) => {
    const course =
      ALL_COURSES.find((c) => c.id === a.courseId) ??
      COURSE_DIRECTIONS.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
    return { ...a, course };
  }).filter((a) => a.course !== undefined);

  const filtered = assignments.filter((a) =>
    filter === "all" ? true : a.status === filter
  );

  const activeCourses = assignments.filter((a) => a.status === "active");
  const completedCourses = assignments.filter((a) => a.status === "completed" || a.status === "certified");
  const totalProgress = activeCourses.length > 0
    ? Math.round(activeCourses.reduce((s, a) => s + a.progress, 0) / activeCourses.length)
    : 0;

  return (
    <Layout>
      <div className="max-w-5xl mx-auto space-y-8">

        {/* Заголовок */}
        <div>
          <h1 className="text-3xl font-bold mb-1">Моё обучение</h1>
          <p className="text-muted-foreground">Курсы, назначенные вам для прохождения</p>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {[
            { label: "Всего курсов",  value: assignments.length,      icon: "BookOpen",   color: "from-violet-500 to-purple-700" },
            { label: "В процессе",    value: activeCourses.length,     icon: "PlayCircle", color: "from-cyan-500 to-blue-600" },
            { label: "Завершено",     value: completedCourses.length,  icon: "CheckCircle",color: "from-emerald-500 to-teal-600" },
            { label: "Удостоверений", value: assignments.filter((a) => a.status === "certified").length, icon: "Award", color: "from-amber-500 to-orange-600" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl border border-border p-4 flex items-center gap-3">
              <div className={`w-10 h-10 bg-gradient-to-br ${s.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                <Icon name={s.icon} size={18} className="text-white" />
              </div>
              <div>
                <p className="text-2xl font-bold leading-none">{s.value}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Общий прогресс по активным */}
        {activeCourses.length > 0 && (
          <div className="bg-card rounded-2xl border border-border p-5">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                  <Icon name="Target" size={20} className="text-violet-600" />
                </div>
                <div>
                  <p className="font-bold">Средний прогресс</p>
                  <p className="text-sm text-muted-foreground">{activeCourses.length} активных курсов</p>
                </div>
              </div>
              <span className="text-2xl font-bold text-violet-600">{totalProgress}%</span>
            </div>
            <Progress value={totalProgress} className="h-2.5" />
          </div>
        )}

        {/* Фильтр */}
        <div className="flex gap-2 flex-wrap">
          {FILTER_OPTIONS.map((f) => {
            const count = f.key === "all"
              ? assignments.length
              : assignments.filter((a) => a.status === f.key).length;
            if (count === 0 && f.key !== "all") return null;
            return (
              <button
                key={f.key}
                onClick={() => setFilter(f.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-all flex items-center gap-1.5 ${
                  filter === f.key
                    ? "gradient-primary text-white shadow-md shadow-purple-200"
                    : "bg-card border border-border text-muted-foreground hover:border-primary hover:text-primary"
                }`}
              >
                {f.label}
                <span className={`text-xs rounded-full px-1.5 py-0.5 leading-none ${filter === f.key ? "bg-white/20" : "bg-muted"}`}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Список курсов */}
        {filtered.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <Icon name="BookOpen" size={40} className="text-muted-foreground mx-auto mb-3" />
            <p className="font-semibold text-lg">Нет курсов в этой категории</p>
            <p className="text-muted-foreground text-sm mt-1">Обратитесь к администратору для назначения курсов</p>
          </div>
        ) : (
          <div className="space-y-3">
            {filtered.map((a, idx) => {
              const course = a.course!;
              const statusInfo = STATUS_MAP[a.status];
              const emoji = "emoji" in course ? course.emoji : "📚";
              const title = "code" in course ? `${course.code} ${course.title}` : course.title;
              const lessons = "lessons" in course ? course.lessons : null;
              const duration = "duration" in course ? course.duration : null;

              return (
                <div
                  key={a.courseId}
                  className="bg-card rounded-2xl border border-border p-5 flex items-center gap-5 hover:shadow-md transition-all cursor-pointer group"
                  onClick={() => a.status === "active" && navigate(`/lesson/${a.courseId}`)}
                >
                  {/* Иконка */}
                  <div className={`w-14 h-14 bg-gradient-to-br ${GRADIENTS[idx % GRADIENTS.length]} rounded-2xl flex items-center justify-center text-2xl flex-shrink-0`}>
                    {emoji}
                  </div>

                  {/* Инфо */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-3">
                      <div className="min-w-0">
                        <p className="font-semibold text-base truncate group-hover:text-primary transition-colors">{title}</p>
                        <div className="flex items-center gap-3 mt-1">
                          {lessons && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Icon name="BookOpen" size={12} />
                              {lessons} уроков
                            </span>
                          )}
                          {duration && (
                            <span className="text-xs text-muted-foreground flex items-center gap-1">
                              <Icon name="Clock" size={12} />
                              {duration}
                            </span>
                          )}
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Icon name="Calendar" size={12} />
                            Назначен: {a.assignedAt}
                          </span>
                        </div>
                      </div>
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5 flex-shrink-0 ${statusInfo.cls}`}>
                        <Icon name={statusInfo.icon} size={12} />
                        {statusInfo.label}
                      </span>
                    </div>

                    {/* Прогресс-бар */}
                    {a.status === "active" && (
                      <div className="mt-3">
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Прогресс</span>
                          <span className="font-medium text-violet-600">{a.progress}%</span>
                        </div>
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-500 to-cyan-500 rounded-full transition-all"
                            style={{ width: `${a.progress}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Даты активации / завершения */}
                    {(a.activatedAt || a.completedAt) && (
                      <div className="flex gap-4 mt-2">
                        {a.activatedAt && (
                          <span className="text-xs text-muted-foreground">Активирован: {a.activatedAt}</span>
                        )}
                        {a.completedAt && (
                          <span className="text-xs text-emerald-600 font-medium">Завершён: {a.completedAt}</span>
                        )}
                      </div>
                    )}
                  </div>

                  {/* Кнопка */}
                  {a.status === "active" && (
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center group-hover:bg-violet-600 transition-colors">
                        <Icon name="ChevronRight" size={18} className="text-violet-600 group-hover:text-white transition-colors" />
                      </div>
                    </div>
                  )}
                  {a.status === "certified" && (
                    <div className="flex-shrink-0">
                      <div className="w-9 h-9 bg-violet-100 dark:bg-violet-900/30 rounded-xl flex items-center justify-center">
                        <Icon name="Award" size={18} className="text-violet-600" />
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}

        {/* Пустой стейт если нет курсов вообще */}
        {assignments.length === 0 && (
          <div className="bg-card rounded-2xl border border-border p-12 text-center space-y-4">
            <div className="w-16 h-16 bg-muted rounded-2xl flex items-center justify-center mx-auto">
              <Icon name="BookOpen" size={28} className="text-muted-foreground" />
            </div>
            <div>
              <p className="font-semibold text-lg">Курсы не назначены</p>
              <p className="text-muted-foreground text-sm mt-1">Обратитесь к администратору для назначения курсов</p>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
