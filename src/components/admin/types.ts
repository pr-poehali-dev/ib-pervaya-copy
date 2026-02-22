export type CourseAssignment = {
  courseId: number;
  active: boolean;
  progress: number;
  assignedAt: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  initials: string;
  group: string;
  role: string;
  assignments: CourseAssignment[];
};

export type Course = {
  id: number;
  title: string;
  category: string;
  emoji: string;
  lessons: number;
  duration: string;
};

export const allCourses: Course[] = [
  { id: 1, title: "Основы информационной безопасности", category: "ИБ", emoji: "🔐", lessons: 18, duration: "24 ч" },
  { id: 2, title: "Сетевая безопасность и протоколы", category: "Сети", emoji: "🌐", lessons: 14, duration: "18 ч" },
  { id: 3, title: "Этичный хакинг и пентест", category: "Пентест", emoji: "🎯", lessons: 22, duration: "30 ч" },
  { id: 4, title: "Управление рисками ИБ", category: "Менеджмент", emoji: "📊", lessons: 12, duration: "16 ч" },
  { id: 5, title: "Криптография и шифрование", category: "Криптография", emoji: "🔑", lessons: 16, duration: "20 ч" },
  { id: 6, title: "SOC и мониторинг безопасности", category: "SOC", emoji: "🛡️", lessons: 20, duration: "28 ч" },
];

export const initialUsers: User[] = [
  {
    id: 1,
    name: "Алина Иванова",
    email: "alina.ivanova@company.ru",
    initials: "АИ",
    group: "ИБ-301",
    role: "Студент",
    assignments: [
      { courseId: 1, active: true, progress: 65, assignedAt: "01.01.2025" },
      { courseId: 2, active: true, progress: 30, assignedAt: "15.01.2025" },
    ],
  },
  {
    id: 2,
    name: "Дмитрий Смирнов",
    email: "d.smirnov@company.ru",
    initials: "ДС",
    group: "ИБ-301",
    role: "Студент",
    assignments: [
      { courseId: 1, active: true, progress: 100, assignedAt: "01.01.2025" },
      { courseId: 3, active: false, progress: 0, assignedAt: "10.02.2025" },
    ],
  },
  {
    id: 3,
    name: "Мария Козлова",
    email: "m.kozlova@company.ru",
    initials: "МК",
    group: "ИБ-302",
    role: "Студент",
    assignments: [
      { courseId: 4, active: true, progress: 45, assignedAt: "05.02.2025" },
    ],
  },
  {
    id: 4,
    name: "Иван Петров",
    email: "i.petrov@company.ru",
    initials: "ИП",
    group: "ИБ-302",
    role: "Студент",
    assignments: [],
  },
];

export const gradients = [
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-600",
  "from-red-500 to-rose-700",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-700",
];

export const userColors = [
  "from-violet-400 to-purple-600",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
];

export const groups = ["ИБ-301", "ИБ-302", "ИБ-303", "ИБ-401", "ИБ-402"];
export const roles = ["Студент", "Преподаватель", "Наблюдатель"];

export function getInitials(name: string) {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}
