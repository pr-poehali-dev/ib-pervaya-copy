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

export default function MyLearning() {
  const totalProgress = Math.round(
    enrolledCourses.reduce((acc, c) => acc + (c.progress ?? 0), 0) / enrolledCourses.length
  );

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Моё обучение</h1>
          <p className="text-muted-foreground">Курсы, на которые вы записаны</p>
        </div>

        <div className="bg-card rounded-2xl p-6 border border-border shadow-sm">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 icon-bg-violet rounded-xl flex items-center justify-center">
                <Icon name="Target" size={20} className="text-violet-600" />
              </div>
              <div>
                <p className="font-bold">Общий прогресс</p>
                <p className="text-sm text-muted-foreground">{enrolledCourses.length} активных курса</p>
              </div>
            </div>
            <span className="text-2xl font-bold text-primary">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {enrolledCourses.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>
      </div>
    </Layout>
  );
}