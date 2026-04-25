import { useState } from "react";
import Layout from "@/components/layout/Layout";
import CourseCard from "@/components/sdo/CourseCard";
import Icon from "@/components/ui/icon";
import { Input } from "@/components/ui/input";

const allCourses = [
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
  {
    id: 3,
    title: "Этичный хакинг и пентест",
    description: "Методологии тестирования на проникновение, инструменты и практика",
    category: "Пентест",
    duration: "30 ч",
    lessons: 22,
    instructor: "Д. Козлов",
    color: "bg-gradient-to-br from-red-500 to-rose-700",
    emoji: "🎯",
    isEnrolled: false,
  },
  {
    id: 4,
    title: "Управление рисками ИБ",
    description: "Методы оценки, анализа и минимизации рисков информационной безопасности",
    category: "Менеджмент",
    duration: "16 ч",
    lessons: 12,
    instructor: "Н. Волков",
    color: "bg-gradient-to-br from-emerald-500 to-teal-600",
    emoji: "📊",
    isEnrolled: false,
  },
  {
    id: 5,
    title: "Криптография и шифрование",
    description: "Симметричное и асимметричное шифрование, хэш-функции, PKI",
    category: "Криптография",
    duration: "20 ч",
    lessons: 16,
    instructor: "С. Морозов",
    color: "bg-gradient-to-br from-amber-500 to-orange-600",
    emoji: "🔑",
    isEnrolled: false,
  },
  {
    id: 6,
    title: "SOC и мониторинг безопасности",
    description: "Построение центра мониторинга, SIEM системы, реагирование на инциденты",
    category: "SOC",
    duration: "28 ч",
    lessons: 20,
    instructor: "А. Белов",
    color: "bg-gradient-to-br from-indigo-500 to-blue-700",
    emoji: "🛡️",
    isEnrolled: false,
  },
];

const categories = ["Все", "ИБ", "Сети", "Пентест", "Менеджмент", "Криптография", "SOC"];

export default function Courses() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Все");

  const filtered = allCourses.filter((c) => {
    const matchSearch = c.title.toLowerCase().includes(search.toLowerCase());
    const matchCat = activeCategory === "Все" || c.category === activeCategory;
    return matchSearch && matchCat;
  });

  return (
    <Layout>
      <div className="max-w-6xl mx-auto space-y-8">
        <div>
          <h1 className="text-3xl font-bold mb-1">Каталог курсов</h1>
          <p className="text-muted-foreground">Выберите курс и начните обучение прямо сейчас</p>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1">
            <Icon name="Search" size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Поиск по курсам..."
              className="pl-10 rounded-xl"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="flex gap-2 flex-wrap">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-xl text-sm font-medium transition-all ${
                activeCategory === cat
                  ? "gradient-primary text-white shadow-md shadow-purple-200"
                  : "bg-card border border-border text-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((course) => (
            <CourseCard key={course.id} {...course} />
          ))}
        </div>

        {filtered.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <span className="text-4xl block mb-3">🔍</span>
            <p className="font-medium">Ничего не найдено</p>
            <p className="text-sm mt-1">Попробуйте изменить фильтры</p>
          </div>
        )}
      </div>
    </Layout>
  );
}
