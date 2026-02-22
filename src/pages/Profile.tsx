import Layout from "@/components/layout/Layout";
import Icon from "@/components/ui/icon";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";

const achievements = [
  { emoji: "🏆", title: "Первый курс", desc: "Завершил первый курс", earned: true },
  { emoji: "🔥", title: "Неделя подряд", desc: "7 дней без пропусков", earned: true },
  { emoji: "⚡", title: "Быстрый старт", desc: "5 уроков за день", earned: true },
  { emoji: "🎯", title: "Отличник", desc: "100% в тесте", earned: false },
  { emoji: "🚀", title: "Марафон", desc: "30 дней подряд", earned: false },
  { emoji: "💎", title: "Эксперт", desc: "10 курсов завершено", earned: false },
];

const completedCourses = [
  { title: "Введение в кибербезопасность", date: "Янв 2026", grade: 95 },
  { title: "Основы Linux для ИБ", date: "Дек 2025", grade: 88 },
  { title: "OSINT и разведка", date: "Ноя 2025", grade: 92 },
];

export default function Profile() {
  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div className="bg-card rounded-2xl p-8 border border-border shadow-sm">
          <div className="flex items-start gap-6">
            <div className="w-20 h-20 gradient-primary rounded-2xl flex items-center justify-center shrink-0">
              <span className="text-white text-2xl font-bold">АИ</span>
            </div>
            <div className="flex-1">
              <h1 className="text-2xl font-bold">Алина Иванова</h1>
              <p className="text-muted-foreground">alina.ivanova@company.ru</p>
              <div className="flex flex-wrap gap-2 mt-3">
                <Badge variant="secondary">Студент</Badge>
                <Badge variant="outline">Информационная безопасность</Badge>
                <Badge variant="outline">Группа ИБ-301</Badge>
              </div>
            </div>
            <button className="border border-border text-foreground px-4 py-2 rounded-xl text-sm font-medium hover:border-primary hover:text-primary transition-colors flex items-center gap-2">
              <Icon name="Edit2" size={15} />
              Редактировать
            </button>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { label: "Курсов завершено", value: "3", icon: "GraduationCap", color: "text-violet-600" },
            { label: "Часов обучения", value: "42", icon: "Clock", color: "text-cyan-600" },
            { label: "Сертификатов", value: "2", icon: "Award", color: "text-amber-500" },
            { label: "Средний балл", value: "91%", icon: "TrendingUp", color: "text-emerald-600" },
          ].map((s) => (
            <div key={s.label} className="bg-card rounded-2xl p-5 border border-border shadow-sm text-center">
              <Icon name={s.icon} size={24} className={`${s.color} mx-auto mb-2`} />
              <p className="text-2xl font-bold">{s.value}</p>
              <p className="text-muted-foreground text-xs mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold mb-5">Завершённые курсы</h2>
            <div className="space-y-4">
              {completedCourses.map((c) => (
                <div key={c.title} className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="icon-bg-emerald w-9 h-9 rounded-xl flex items-center justify-center">
                      <Icon name="CheckCircle2" size={18} className="text-emerald-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{c.title}</p>
                      <p className="text-xs text-muted-foreground">{c.date}</p>
                    </div>
                  </div>
                  <Badge className="icon-bg-emerald text-emerald-700 dark:text-emerald-400 border-0">{c.grade}%</Badge>
                </div>
              ))}
            </div>
          </div>

          <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
            <h2 className="text-lg font-bold mb-5">Достижения</h2>
            <div className="grid grid-cols-3 gap-3">
              {achievements.map((a) => (
                <div
                  key={a.title}
                  className={`text-center p-3 rounded-xl border transition-all ${
                    a.earned
                      ? "border-violet-300 dark:border-violet-700 icon-bg-violet"
                      : "border-border bg-muted/30 opacity-50 grayscale"
                  }`}
                  title={a.desc}
                >
                  <span className="text-2xl block mb-1">{a.emoji}</span>
                  <p className="text-xs font-medium text-foreground leading-tight">{a.title}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <h2 className="text-lg font-bold mb-5">Активность за последний месяц</h2>
          <div className="grid grid-cols-7 gap-1.5">
            {Array.from({ length: 28 }).map((_, i) => {
              const intensity = Math.random();
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
      </div>
    </Layout>
  );
}
