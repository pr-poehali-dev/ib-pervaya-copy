/**
 * ЕДИНАЯ ТОЧКА МОКОВЫХ ДАННЫХ
 *
 * Все компоненты импортируют данные только отсюда.
 * Чтобы подключить реальный API — замените нужную константу на fetch-запрос.
 */

import type {
  User,
  Course,
  CourseDirection,
  CourseAssignment,
  CourseStatus,
} from "@/components/admin/types";

import type {
  OrgData,
  SystemUser,
  EmailSettings,
} from "@/components/admin/settings/types";

// ─── Вспомогательные функции дат ─────────────────────────────────────────────

/** Форматирует Date в строку ДД.ММ.ГГГГ */
function fmt(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

/** Возвращает дату N дней назад от сегодня */
function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
}

/** Возвращает дату N месяцев назад от сегодня */
function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return fmt(d);
}

// ─── Группы ───────────────────────────────────────────────────────────────────
// API: GET /api/groups → string[]

export const GROUPS: string[] = ["ИБ-301", "ИБ-302", "ИБ-303", "ИБ-401", "ИБ-402"];

// ─── Роли слушателей ──────────────────────────────────────────────────────────
// API: GET /api/roles → string[]

export const ROLES: string[] = ["Студент", "Преподаватель", "Наблюдатель"];

// ─── Курсы (базовый каталог) ──────────────────────────────────────────────────
// API: GET /api/courses → Course[]

export const ALL_COURSES: Course[] = [
  { id: 1, title: "Основы информационной безопасности",    category: "ИБ",           emoji: "🔐", lessons: 18, duration: "24 ч" },
  { id: 2, title: "Сетевая безопасность и протоколы",      category: "Сети",         emoji: "🌐", lessons: 14, duration: "18 ч" },
  { id: 3, title: "Этичный хакинг и пентест",              category: "Пентест",      emoji: "🎯", lessons: 22, duration: "30 ч" },
  { id: 4, title: "Управление рисками ИБ",                 category: "Менеджмент",   emoji: "📊", lessons: 12, duration: "16 ч" },
  { id: 5, title: "Криптография и шифрование",             category: "Криптография", emoji: "🔑", lessons: 16, duration: "20 ч" },
  { id: 6, title: "SOC и мониторинг безопасности",         category: "SOC",          emoji: "🛡️", lessons: 20, duration: "28 ч" },
];

// ─── Направления курсов ───────────────────────────────────────────────────────
// API: GET /api/course-directions → CourseDirection[]

export const COURSE_DIRECTIONS: CourseDirection[] = [
  {
    id: 1,
    title: "Промышленная безопасность",
    courses: [
      { id: 101, code: "А.1.",   title: "Основы промышленной безопасности" },
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

// ─── Слушатели ────────────────────────────────────────────────────────────────
// API: GET /api/users → User[]
// Даты назначений охватывают: текущий месяц, прошлый месяц и квартал

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: "Алина Иванова",
    email: "alina.ivanova@company.ru",
    initials: "АИ",
    group: "ИБ-301",
    organization: "ООО «ТехноПром»",
    role: "Студент",
    assignments: [
      { courseId: 1, active: true,  progress: 65,  assignedAt: daysAgo(5),   activatedAt: daysAgo(3),  status: "active"    },
      { courseId: 2, active: true,  progress: 30,  assignedAt: daysAgo(10),                            status: "pending"   },
    ],
  },
  {
    id: 2,
    name: "Дмитрий Смирнов",
    email: "d.smirnov@company.ru",
    initials: "ДС",
    group: "ИБ-301",
    organization: "ООО «ТехноПром»",
    role: "Студент",
    assignments: [
      { courseId: 1, active: true,  progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: monthsAgo(1), status: "certified" },
      { courseId: 3, active: false, progress: 0,   assignedAt: daysAgo(8),                              status: "pending"   },
    ],
  },
  {
    id: 3,
    name: "Мария Козлова",
    email: "m.kozlova@company.ru",
    initials: "МК",
    group: "ИБ-302",
    organization: "АО «СтройГрупп»",
    role: "Студент",
    assignments: [
      { courseId: 4, active: true,  progress: 45,  assignedAt: daysAgo(15),  activatedAt: daysAgo(14), status: "active"    },
      { courseId: 5, active: true,  progress: 20,  assignedAt: daysAgo(3),                             status: "pending"   },
    ],
  },
  {
    id: 4,
    name: "Иван Петров",
    email: "i.petrov@company.ru",
    initials: "ИП",
    group: "ИБ-302",
    organization: "АО «СтройГрупп»",
    role: "Студент",
    assignments: [
      { courseId: 2, active: true,  progress: 80,  assignedAt: daysAgo(20),  activatedAt: daysAgo(18), status: "active"    },
      { courseId: 6, active: true,  progress: 100, assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), completedAt: daysAgo(5), status: "completed" },
    ],
  },
  {
    id: 5,
    name: "Сергей Николаев",
    email: "s.nikolaev@company.ru",
    initials: "СН",
    group: "ИБ-303",
    organization: "ГУП «Энергосеть»",
    role: "Студент",
    assignments: [
      { courseId: 3, active: true,  progress: 55,  assignedAt: daysAgo(7),   activatedAt: daysAgo(6),  status: "active"    },
      { courseId: 4, active: true,  progress: 0,   assignedAt: daysAgo(2),                             status: "pending"   },
    ],
  },
  {
    id: 6,
    name: "Елена Соколова",
    email: "e.sokolova@company.ru",
    initials: "ЕС",
    group: "ИБ-303",
    organization: "ГУП «Энергосеть»",
    role: "Преподаватель",
    assignments: [
      { courseId: 5, active: true,  progress: 90,  assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), status: "active"    },
      { courseId: 6, active: true,  progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: daysAgo(12), status: "certified" },
    ],
  },
  {
    id: 7,
    name: "Андрей Лебедев",
    email: "a.lebedev@company.ru",
    initials: "АЛ",
    group: "ИБ-401",
    organization: "ПАО «МеталлСервис»",
    role: "Студент",
    assignments: [
      { courseId: 1, active: true,  progress: 40,  assignedAt: daysAgo(1),                             status: "pending"   },
    ],
  },
  {
    id: 8,
    name: "Ольга Михайлова",
    email: "o.mikhailova@company.ru",
    initials: "ОМ",
    group: "ИБ-401",
    organization: "ПАО «МеталлСервис»",
    role: "Студент",
    assignments: [
      { courseId: 2, active: true,  progress: 70,  assignedAt: daysAgo(12),  activatedAt: daysAgo(11), status: "active"    },
      { courseId: 3, active: true,  progress: 15,  assignedAt: daysAgo(4),                             status: "pending"   },
    ],
  },
];

// ─── Стили ────────────────────────────────────────────────────────────────────

export const GRADIENTS: string[] = [
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-600",
  "from-red-500 to-rose-700",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-700",
];

export const USER_COLORS: string[] = [
  "from-violet-400 to-purple-600",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
];

// ─── Настройки организации ────────────────────────────────────────────────────
// API: GET /api/org → OrgData

export const DEFAULT_ORG: OrgData = {
  type: "Юридическое лицо",
  opf: "ООО",
  name: 'ООО "УЦ ИСП"',
  externalId: "d2e6fe38-5531-4384-be5a-e93bf83a8c83",
  inn: "9000000001",
  licenseNo: "9999",
  licenseDate: "09.02.2026",
  subscriptionsTotal: 100,
};

// ─── Системные пользователи (администраторы) ──────────────────────────────────
// API: GET /api/system-users → SystemUser[]

export const DEFAULT_SYSTEM_USERS: SystemUser[] = [
  {
    id: 1,
    lastName: "ИВАНОВ",
    firstName: "ИВАН",
    middleName: "ИВАНОВИЧ",
    email: "admin@isp.ru",
    role: "Администратор",
    department: "",
    password: "admin123",
    status: "active",
    registeredAt: "09.02.2026",
  },
  {
    id: 2,
    lastName: "ПЕТРОВ",
    firstName: "ПЁТР",
    middleName: "ПЕТРОВИЧ",
    email: "super@isp.ru",
    role: "Суперадмин",
    department: "",
    password: "super123",
    status: "active",
    registeredAt: "09.02.2026",
  },
  {
    id: 3,
    lastName: "СИДОРОВА",
    firstName: "АННА",
    middleName: "ОЛЕГОВНА",
    email: "manager@isp.ru",
    role: "Менеджер",
    department: "Отдел продаж",
    password: "manager123",
    status: "active",
    registeredAt: "09.02.2026",
  },
  {
    id: 4,
    lastName: "КОЗЛОВ",
    firstName: "АНТОН",
    middleName: "ВИТАЛЬЕВИЧ",
    email: "student@isp.ru",
    role: "Преподаватель",
    department: "",
    password: "student123",
    status: "active",
    registeredAt: "09.02.2026",
  },
];

// ─── Настройки email ──────────────────────────────────────────────────────────
// API: GET /api/email-settings → EmailSettings

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  hrEmail: "gts@supmin.ru",
  senderEmail: "admin@supmin.ru",
  copyToAdmin: true,
  smtpHost: "smtp.yandex.ru",
  smtpPort: "587",
  smtpUser: "admin@supmin.ru",
  smtpPassword: "",
  smtpFromEmail: "admin@supmin.ru",
  smtpTimeout: "30",
  useTls: true,
  useSsl: false,
};

// ─── Справочники форм и ролей ─────────────────────────────────────────────────
// Статичные списки — не требуют API

export const ORG_TYPES = ["Юридическое лицо", "ИП", "Физическое лицо"] as const;
export const OPF_TYPES = ["ООО", "АО", "ПАО", "ГБУ", "ФГБУ", "ИП"] as const;
export const USER_ROLES_SYSTEM = ["Администратор", "Менеджер", "Преподаватель", "Наблюдатель"] as const;

// ─── Шаблоны email-уведомлений ────────────────────────────────────────────────
// API: GET /api/email-templates → EmailTemplate[]

export const EMAIL_TEMPLATES = [
  { id: "90days",  title: "За 90 дней до истечения", desc: "Первое напоминание о плановой аттестации" },
  { id: "30days",  title: "За 30 дней до истечения", desc: "Второе напоминание о плановой аттестации" },
  { id: "7days",   title: "За 7 дней до истечения",  desc: "Срочное напоминание об аттестации" },
  { id: "expired", title: "Истечение срока",          desc: "Уведомление об истечении срока аттестации" },
];