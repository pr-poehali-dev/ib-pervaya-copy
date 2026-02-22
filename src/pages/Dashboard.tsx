import Layout from "@/components/layout/Layout";
import CourseCard from "@/components/sdo/CourseCard";
import { Progress } from "@/components/ui/progress";
import Icon from "@/components/ui/icon";

const enrolledCourses = [
  {
    id: 1,
    title: "Основы информационной безопасности",
    description: "Базовые принципы защиты информации, угрозы и методы противодействия",
    category: "ИБ",
    duration: "24 ч",
    lessons: 18,
    progress: 65,
    instructor: "А. Петров",
    color: "bg-gradient-to-br from-violet-500 to-purple-700",
    emoji: "🔐",
    isEnrolled: true,
  },
  {
    id: 2,
    title: "Сетевая безопасность и протоколы",
    description: "Защита сетевой инфраструктуры, анализ трафика и настройка firewall",
    category: "Сети",
    duration: "18 ч",
    lessons: 14,
    progress: 30,
    instructor: "М. Сидоров",
    color: "bg-gradient-to-br from-cyan-500 to-blue-600",
    emoji: "🌐",
    isEnrolled: true,
  },
];

const stats = [
  { label: "Курсов пройдено", value: "3", icon: "Trophy", color: "text-amber-500", bg: "icon-bg-amber" },
  { label: "Часов обучения", value: "42", icon: "Clock", color: "text-violet-600", bg: "icon-bg-violet" },
  { label: "Сертификатов", value: "2", icon: "Award", color: "text-emerald-600", bg: "icon-bg-emerald" },
  { label: "Текущий streak", value: "7 дней", icon: "Flame", color: "text-orange-500", bg: "icon-bg-orange" },
];

export default function Dashboard() {
  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold text-foreground mb-1">Добро пожаловать, Алина! 👋</h1>
            <p className="text-muted-foreground">Продолжайте обучение — вы на правильном пути</p>
          </div>
          <div className="text-right text-sm text-muted-foreground">
            <p className="font-medium text-foreground">Суббота, 21 февраля</p>
            <p>2026</p>
          </div>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div key={stat.label} className="bg-card rounded-2xl p-5 border border-border shadow-sm">
              <div className={`w-10 h-10 ${stat.bg} rounded-xl flex items-center justify-center mb-3`}>
                <Icon name={stat.icon} size={20} className={stat.color} />
              </div>
              <p className="text-2xl font-bold text-foreground">{stat.value}</p>
              <p className="text-muted-foreground text-sm mt-0.5">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold">Общий прогресс</h2>
            <span className="text-sm text-muted-foreground">48% выполнено</span>
          </div>
          <Progress value={48} className="h-3 mb-2" />
          <div className="flex justify-between text-xs text-muted-foreground mt-2">
            <span>5 из 10 курсов</span>
            <span>🎯 Цель: закончить к марту</span>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-5">
            <h2 className="text-xl font-bold">Продолжить обучение</h2>
            <a href="/my-learning" className="text-primary text-sm font-medium hover:underline flex items-center gap-1">
              Все курсы <Icon name="ChevronRight" size={16} />
            </a>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {enrolledCourses.map((course) => (
              <CourseCard key={course.id} {...course} />
            ))}
          </div>
        </div>

        <div className="bg-gradient-to-r from-violet-600 to-purple-700 rounded-2xl p-6 text-white">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Следующий урок готов!</h3>
              <p className="text-white/80 text-sm mb-4">Урок 12: Криптографические протоколы</p>
              <button className="bg-white text-violet-700 font-semibold px-5 py-2.5 rounded-xl text-sm hover:bg-white/90 transition-colors">
                Начать урок →
              </button>
            </div>
            <span className="text-6xl opacity-80">🚀</span>
          </div>
        </div>
      </div>
    </Layout>
  );
}