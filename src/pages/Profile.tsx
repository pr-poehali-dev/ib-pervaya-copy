import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Icon from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { INITIAL_USERS, COURSE_DIRECTIONS } from "@/data/mockData";

// ─── Достижения ───────────────────────────────────────────────────────────────

const ALL_ACHIEVEMENTS = [
  { id: "first_course",  emoji: "🏆", title: "Первый курс",     desc: "Завершил первый курс",          condition: (c: number) => c >= 1 },
  { id: "three_courses", emoji: "🎓", title: "Три курса",        desc: "Завершил 3 курса",              condition: (c: number) => c >= 3 },
  { id: "certified",     emoji: "📜", title: "Сертифицирован",   desc: "Получил удостоверение ДПО",     condition: (_c: number, cert: number) => cert >= 1 },
  { id: "active_learner",emoji: "🔥", title: "Активный учёный",  desc: "Есть активный курс",            condition: (_c: number, _cert: number, active: number) => active >= 1 },
  { id: "speed",         emoji: "⚡", title: "Быстрый старт",    desc: "Прогресс > 50% за первый курс", condition: (c: number) => c >= 1 },
  { id: "expert",        emoji: "💎", title: "Эксперт",          desc: "10 курсов завершено",           condition: (c: number) => c >= 10 },
];

// ─── Стабильная активность (без Math.random()) ────────────────────────────────

function getActivityData(seed: number): number[] {
  return Array.from({ length: 28 }, (_, i) => {
    const val = ((seed * 9301 + i * 49297 + 233995) % 233280) / 233280;
    return val;
  });
}

// ─── Модальное окно редактирования ────────────────────────────────────────────

function EditProfileModal({
  user,
  onClose,
}: {
  user: { firstName: string; lastName: string; middleName: string; email: string };
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-bold text-base">Данные профиля</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Изменение данных — только через администратора</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Фамилия</label>
            <input value={user.lastName} disabled className="w-full h-9 px-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Имя</label>
            <input value={user.firstName} disabled className="w-full h-9 px-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Отчество</label>
            <input value={user.middleName} disabled className="w-full h-9 px-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Email</label>
            <input value={user.email} disabled className="w-full h-9 px-3 rounded-xl border border-border bg-muted text-sm text-muted-foreground cursor-not-allowed" />
          </div>
          <div className="flex items-center gap-2 px-3 py-2.5 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl">
            <Icon name="Info" size={14} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
            <p className="text-xs text-amber-700 dark:text-amber-300">Для изменения данных обратитесь к администратору</p>
          </div>
        </div>
        <div className="p-6 border-t border-border">
          <Button className="w-full rounded-xl" variant="outline" onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Главная страница профиля ─────────────────────────────────────────────────

export default function Profile() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [editOpen, setEditOpen] = useState(false);

  const studentUser = INITIAL_USERS[0];
  const assignments = studentUser.assignments;

  const completedAssignments = assignments.filter((a) => a.status === "completed" || a.status === "certified");
  const activeAssignments    = assignments.filter((a) => a.status === "active");
  const certifiedAssignments = assignments.filter((a) => a.status === "certified");

  const totalHours = assignments.reduce((sum, a) => {
    const course = COURSE_DIRECTIONS.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
    return sum + (course?.hours ?? 0);
  }, 0);

  const avgScore = assignments
    .filter((a) => a.testScore)
    .reduce((sum, a, _i, arr) => sum + (a.testScore ?? 0) / arr.length, 0);

  const completedWithDetails = completedAssignments.map((a) => {
    const course = COURSE_DIRECTIONS.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
    return { assignment: a, course };
  });

  const achievementConditions = [
    completedAssignments.length,
    certifiedAssignments.length,
    activeAssignments.length,
  ] as const;

  const achievements = ALL_ACHIEVEMENTS.map((a) => ({
    ...a,
    earned: a.condition(achievementConditions[0], achievementConditions[1], achievementConditions[2]),
  }));

  const earnedCount = achievements.filter((a) => a.earned).length;

  const initials = user
    ? `${(user.lastName?.[0] ?? "")}${(user.firstName?.[0] ?? "")}`
    : studentUser.initials;

  const fullName = user
    ? `${user.lastName} ${user.firstName}${user.middleName ? " " + user.middleName : ""}`
    : studentUser.name;

  const email = user?.email ?? studentUser.email;

  const activityData = useMemo(() => getActivityData(studentUser.id), [studentUser.id]);

  const stats = [
    { label: "Курсов завершено", value: completedAssignments.length, icon: "GraduationCap", color: "text-violet-600" },
    { label: "Часов обучения",   value: totalHours,                  icon: "Clock",         color: "text-cyan-600" },
    { label: "Удостоверений",    value: certifiedAssignments.length, icon: "Award",         color: "text-amber-500" },
    { label: "Средний балл",     value: avgScore > 0 ? `${Math.round(avgScore)}%` : "—", icon: "TrendingUp", color: "text-emerald-600" },
  ];

  return (
    <Layout>
      {editOpen && user && (
        <EditProfileModal
          user={{ firstName: user.firstName, lastName: user.lastName, middleName: user.middleName, email: user.email }}
          onClose={() => setEditOpen(false)}
        />
      )}

      <div className="max-w-4xl mx-auto space-y-8">

        {/* Карточка пользователя */}
        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-white text-2xl font-bold">{initials}</span>
            </div>
            <div className="flex-1 min-w-0">
              <h1 className="text-2xl font-bold truncate">{fullName}</h1>
              <p className="text-muted-foreground">{email}</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">{studentUser.role}</Badge>
                <Badge variant="outline">{studentUser.organization}</Badge>
                <Badge variant="outline">Группа {studentUser.group}</Badge>
              </div>
            </div>
            <Button
              variant="outline"
              className="rounded-xl gap-2 flex-shrink-0"
              onClick={() => setEditOpen(true)}
            >
              <Icon name="User" size={15} />
              Мои данные
            </Button>
          </div>
        </div>

        {/* Статистика */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-5 border border-border shadow-sm text-center">
              <Icon name={s.icon} size={24} className={`${s.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-muted-foreground text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

          {/* Завершённые курсы */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold mb-5">Завершённые курсы</h2>
            {completedWithDetails.length === 0 ? (
              <div className="text-center py-8">
                <Icon name="BookOpen" size={32} className="text-muted-foreground mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Завершённых курсов пока нет</p>
                <button
                  onClick={() => navigate("/my-learning")}
                  className="mt-3 text-primary text-sm hover:underline"
                >
                  Перейти к обучению →
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                {completedWithDetails.map(({ assignment, course }) => (
                  <div key={assignment.courseId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3 min-w-0">
                      <div className="bg-emerald-100 dark:bg-emerald-900/30 w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Icon name={assignment.status === "certified" ? "Award" : "CheckCircle2"} size={18} className="text-emerald-600 dark:text-emerald-400" />
                      </div>
                      <div className="min-w-0">
                        <p className="font-medium text-sm truncate">{course?.title ?? "Курс"}</p>
                        <p className="text-xs text-muted-foreground">{assignment.completedAt ?? "—"}</p>
                      </div>
                    </div>
                    {assignment.testScore && (
                      <Badge className="bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-400 border-0 flex-shrink-0">
                        {assignment.testScore}%
                      </Badge>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Достижения */}
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-bold">Достижения</h2>
              <span className="text-sm text-muted-foreground">{earnedCount} / {achievements.length}</span>
            </div>
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((a) => (
                <div
                  key={a.id}
                  className={`text-center p-3 rounded-xl border transition-all ${
                    a.earned
                      ? "border-violet-300 dark:border-violet-700 bg-violet-50 dark:bg-violet-900/10"
                      : "border-border bg-muted/30 opacity-50 grayscale"
                  }`}
                  title={a.desc}
                >
                  <span className="text-2xl block mb-1">{a.emoji}</span>
                  <p className="text-xs font-medium text-foreground leading-tight">{a.title}</p>
                  {!a.earned && <p className="text-[10px] text-muted-foreground mt-0.5">Заблокировано</p>}
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Активность */}
        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-lg font-bold">Активность за последние 28 дней</h2>
            <span className="text-xs text-muted-foreground">{activityData.filter((v) => v > 0.2).length} активных дней</span>
          </div>
          <div className="grid grid-cols-7 gap-1.5">
            {activityData.map((intensity, i) => {
              const cls =
                intensity > 0.7 ? "bg-violet-600" :
                intensity > 0.4 ? "bg-violet-400 dark:bg-violet-700" :
                intensity > 0.2 ? "bg-violet-200 dark:bg-violet-900" : "bg-muted";
              return (
                <div key={i} className={`h-8 rounded-md ${cls}`} title={`День ${i + 1}`} />
              );
            })}
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-muted-foreground">
            <span>Меньше</span>
            <div className="flex gap-1">
              {["bg-muted", "bg-violet-200 dark:bg-violet-900", "bg-violet-400 dark:bg-violet-700", "bg-violet-600"].map((c) => (
                <div key={c} className={`w-4 h-4 rounded-sm ${c}`} />
              ))}
            </div>
            <span>Больше</span>
          </div>
        </div>

        {/* Активные курсы */}
        {activeAssignments.length > 0 && (
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-bold">В процессе обучения</h2>
              <button onClick={() => navigate("/my-learning")} className="text-primary text-sm hover:underline">
                Все курсы →
              </button>
            </div>
            <div className="space-y-3">
              {activeAssignments.map((a) => {
                const course = COURSE_DIRECTIONS.flatMap((d) => d.courses).find((c) => c.id === a.courseId);
                return (
                  <div
                    key={a.courseId}
                    onClick={() => navigate(`/course/${a.courseId}`)}
                    className="flex items-center gap-4 p-3 rounded-xl hover:bg-muted/40 cursor-pointer transition-colors"
                  >
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm truncate">{course?.title ?? "Курс"}</p>
                      <div className="flex items-center gap-2 mt-1.5">
                        <Progress value={a.progress} className="h-1.5 flex-1" />
                        <span className="text-xs text-violet-600 font-semibold flex-shrink-0">{a.progress}%</span>
                      </div>
                    </div>
                    <Icon name="ChevronRight" size={16} className="text-muted-foreground flex-shrink-0" />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}