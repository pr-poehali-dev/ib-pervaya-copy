export type CourseStatus = "pending" | "active" | "completed" | "certified";

export type CourseAssignment = {
  courseId: number;
  active: boolean;
  progress: number;
  assignedAt: string;
  activatedAt?: string;
  completedAt?: string;
  status: CourseStatus;
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

export type CourseDirection = {
  id: number;
  title: string;
  courses: { id: number; code: string; title: string }[];
};

export const courseDirections: CourseDirection[] = [
  {
    id: 1,
    title: "Промышленная безопасность",
    courses: [
      { id: 101, code: "А.1.", title: "Основы промышленной безопасности" },
      { id: 102, code: "Б.1.1.", title: "Эксплуатация химически опасных производственных объектов" },
      { id: 103, code: "Б.1.2.", title: "Эксплуатация опасных производственных объектов нефтегазоперерабатывающих и нефтехимических производств" },
      { id: 104, code: "Б.1.3.", title: "Эксплуатация опасных производственных объектов сжиженного природного газа" },
      { id: 105, code: "Б.1.4.", title: "Эксплуатация хлорных объектов" },
      { id: 106, code: "Б.1.5.", title: "Эксплуатация производств минеральных удобрений" },
      { id: 107, code: "Б.1.6.", title: "Эксплуатация аммиачных холодильных установок" },
      { id: 108, code: "Б.1.7.", title: "Эксплуатация опасных производственных объектов складов нефти и нефтепродуктов" },
    ],
  },
  {
    id: 2,
    title: "Энергобезопасность",
    courses: [
      { id: 201, code: "Э.1.", title: "Правила технической эксплуатации электроустановок" },
      { id: 202, code: "Э.2.", title: "Охрана труда при эксплуатации электроустановок" },
      { id: 203, code: "Э.3.", title: "Безопасность работ в электроустановках" },
    ],
  },
  {
    id: 3,
    title: "Экология",
    courses: [
      { id: 301, code: "Эк.1.", title: "Основы экологического законодательства" },
      { id: 302, code: "Эк.2.", title: "Обращение с отходами производства и потребления" },
      { id: 303, code: "Эк.3.", title: "Нормирование и контроль в области охраны окружающей среды" },
    ],
  },
  {
    id: 4,
    title: "Охрана труда",
    courses: [
      { id: 401, code: "ОТ.1.", title: "Общие вопросы охраны труда" },
      { id: 402, code: "ОТ.2.", title: "Обучение и проверка знаний требований охраны труда" },
      { id: 403, code: "ОТ.3.", title: "Специальная оценка условий труда" },
      { id: 404, code: "ОТ.4.", title: "Расследование и учёт несчастных случаев на производстве" },
    ],
  },
  {
    id: 5,
    title: "Обеспечение экологической безопасности",
    courses: [
      { id: 501, code: "ЭкБ.1.", title: "Обеспечение экологической безопасности руководителями и специалистами" },
      { id: 502, code: "ЭкБ.2.", title: "Обращение с опасными отходами" },
    ],
  },
  {
    id: 6,
    title: "Информационные технологии",
    courses: [
      { id: 601, code: "ИТ.1.", title: "Основы информационной безопасности" },
      { id: 602, code: "ИТ.2.", title: "Защита персональных данных" },
      { id: 603, code: "ИТ.3.", title: "Кибербезопасность на предприятии" },
    ],
  },
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
      { courseId: 1, active: true, progress: 65, assignedAt: "01.01.2025", activatedAt: "03.01.2025", status: "active" },
      { courseId: 2, active: true, progress: 30, assignedAt: "15.01.2025", status: "pending" },
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
      { courseId: 1, active: true, progress: 100, assignedAt: "01.01.2025", activatedAt: "02.01.2025", completedAt: "20.02.2025", status: "certified" },
      { courseId: 3, active: false, progress: 0, assignedAt: "10.02.2025", status: "pending" },
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
      { courseId: 4, active: true, progress: 45, assignedAt: "05.02.2025", activatedAt: "06.02.2025", status: "active" },
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