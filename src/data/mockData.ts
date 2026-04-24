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
  Tenant,
  Group,
  ClientOrganization,
  Certificate,
  STPRequest,
  TenantCourse,
  SubscriptionBalance,
} from "@/components/admin/types";

import type {
  OrgData,
  SystemUser,
  EmailSettings,
} from "@/components/admin/settings/types";

// ─── Вспомогательные функции дат ─────────────────────────────────────────────

function fmt(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function daysAgo(n: number): string {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return fmt(d);
}

function monthsAgo(n: number): string {
  const d = new Date();
  d.setMonth(d.getMonth() - n);
  return fmt(d);
}

// ─── Роли слушателей ──────────────────────────────────────────────────────────

export const ROLES: string[] = ["Студент", "Преподаватель", "Наблюдатель"];

// ─── Группы (legacy, строковые) ───────────────────────────────────────────────
// Используется в старых компонентах. Новые данные — GROUPS_DATA

export const GROUPS: string[] = [
  "ПБ-2024/01",
  "ОТ-2024/02",
  "ЭНБ-2024/01",
  "ПБ-2024/02",
  "ЭПБ-2026/01",
  "ОТ-2025/03",
  "ПБ-2025/03",
  "ЭНБ-2025/02",
];

// ─── Направления курсов (группы курсов) ──────────────────────────────────────
// API: GET /api/course-directions → CourseDirection[]
// id совпадает с subscriptionType для упрощения связки

export const COURSE_DIRECTIONS: CourseDirection[] = [
  {
    id: 1,
    title: "Промышленная безопасность",
    subscriptionType: "industrial_safety",
    courses: [
      { id: 101, code: "А.1.",   title: "Основы промышленной безопасности",                                                                             hours: 72,  hasTest: true, dpoAvailable: true  },
      { id: 102, code: "Б.1.1.", title: "Эксплуатация химически опасных производственных объектов",                                                     hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 103, code: "Б.1.2.", title: "Эксплуатация опасных производственных объектов нефтегазоперерабатывающих и нефтехимических производств",        hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 104, code: "Б.1.3.", title: "Эксплуатация опасных производственных объектов сжиженного природного газа",                                    hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 105, code: "Б.1.4.", title: "Эксплуатация хлорных объектов",                                                                                hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 106, code: "Б.1.5.", title: "Эксплуатация производств минеральных удобрений",                                                               hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 107, code: "Б.1.6.", title: "Эксплуатация аммиачных холодильных установок",                                                                 hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 108, code: "Б.1.7.", title: "Эксплуатация опасных производственных объектов складов нефти и нефтепродуктов",                                hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 109, code: "Б.2.1.", title: "Эксплуатация подъёмных сооружений",                                                                            hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 110, code: "Б.3.1.", title: "Эксплуатация объектов горнорудной и нерудной промышленности",                                                  hours: 40,  hasTest: true, dpoAvailable: true  },
    ],
  },
  {
    id: 2,
    title: "Энергобезопасность",
    subscriptionType: "energy_safety",
    courses: [
      { id: 201, code: "Э.1.",  title: "Правила технической эксплуатации электроустановок потребителей",                                                hours: 72,  hasTest: true, dpoAvailable: true  },
      { id: 202, code: "Э.2.",  title: "Охрана труда при эксплуатации электроустановок",                                                                hours: 40,  hasTest: true, dpoAvailable: true  },
      { id: 203, code: "Э.3.",  title: "Безопасность работ в электроустановках",                                                                        hours: 40,  hasTest: true, dpoAvailable: false },
      { id: 204, code: "Э.4.",  title: "Правила устройства электроустановок",                                                                           hours: 40,  hasTest: true, dpoAvailable: false },
    ],
  },
  {
    id: 3,
    title: "Охрана труда",
    subscriptionType: "labor_protection",
    courses: [
      { id: 301, code: "ОТ.1.", title: "Общие вопросы охраны труда и функционирования СУОТ",                                                            hours: 40,  hasTest: true, dpoAvailable: false },
      { id: 302, code: "ОТ.2.", title: "Обучение и проверка знаний требований охраны труда",                                                            hours: 16,  hasTest: true, dpoAvailable: false },
      { id: 303, code: "ОТ.3.", title: "Специальная оценка условий труда",                                                                              hours: 40,  hasTest: true, dpoAvailable: false },
      { id: 304, code: "ОТ.4.", title: "Расследование и учёт несчастных случаев на производстве",                                                       hours: 16,  hasTest: true, dpoAvailable: false },
      { id: 305, code: "ОТ.5.", title: "Оказание первой помощи пострадавшим на производстве",                                                           hours: 16,  hasTest: false, dpoAvailable: false },
    ],
  },
  {
    id: 4,
    title: "Подготовка экспертов ПБ",
    subscriptionType: "expert_pb",
    courses: [
      { id: 401, code: "ЭПБ.1.", title: "Подготовка экспертов в области промышленной безопасности",                                                     hours: 120, hasTest: true, dpoAvailable: true  },
      { id: 402, code: "ЭПБ.2.", title: "Повышение квалификации экспертов в области промышленной безопасности",                                         hours: 72,  hasTest: true, dpoAvailable: true  },
    ],
  },
  {
    id: 5,
    title: "Подготовка экспертов ГТС",
    subscriptionType: "expert_gts",
    courses: [
      { id: 501, code: "ЭГС.1.", title: "Подготовка экспертов в области безопасности гидротехнических сооружений",                                      hours: 120, hasTest: true, dpoAvailable: true  },
      { id: 502, code: "ЭГС.2.", title: "Повышение квалификации экспертов в области безопасности ГТС",                                                  hours: 72,  hasTest: true, dpoAvailable: true  },
    ],
  },
  {
    id: 6,
    title: "Свои курсы",
    subscriptionType: "own_courses",
    courses: [],
  },
];

// ─── Курсы (базовый каталог, legacy) ──────────────────────────────────────────

export const ALL_COURSES: Course[] = [
  { id: 101, title: "Основы промышленной безопасности",                       category: "Промышленная безопасность", emoji: "🏭", lessons: 18, duration: "72 ч" },
  { id: 201, title: "Правила технической эксплуатации электроустановок",      category: "Энергобезопасность",        emoji: "⚡", lessons: 14, duration: "72 ч" },
  { id: 301, title: "Общие вопросы охраны труда и функционирования СУОТ",     category: "Охрана труда",              emoji: "🦺", lessons: 12, duration: "40 ч" },
  { id: 401, title: "Подготовка экспертов в области промышленной безопасности", category: "Эксперты ПБ",             emoji: "📋", lessons: 22, duration: "120 ч" },
  { id: 501, title: "Подготовка экспертов в области безопасности ГТС",        category: "Эксперты ГТС",              emoji: "🌊", lessons: 20, duration: "120 ч" },
  { id: 102, title: "Эксплуатация химически опасных производственных объектов", category: "Промышленная безопасность", emoji: "☣️", lessons: 10, duration: "40 ч" },
];

// ─── Организации-клиенты ──────────────────────────────────────────────────────
// API: GET /api/client-organizations → ClientOrganization[]

export const CLIENT_ORGANIZATIONS: ClientOrganization[] = [
  { id: 1, name: "ООО «ТехноПром»",      inn: "7701234567", contactPerson: "Сидоров А.В.", contactEmail: "sidorov@tehnoprom.ru",  createdAt: monthsAgo(6) },
  { id: 2, name: "АО «СтройГрупп»",      inn: "7702345678", contactPerson: "Белова Е.С.",  contactEmail: "belova@stroygrupp.ru", createdAt: monthsAgo(4) },
  { id: 3, name: "ГУП «Энергосеть»",     inn: "7703456789", contactPerson: "Морозов К.В.", contactEmail: "morozov@energoset.ru", createdAt: monthsAgo(3) },
  { id: 4, name: "ПАО «МеталлСервис»",   inn: "7704567890", contactPerson: "Волков Д.П.",  contactEmail: "volkov@metallserv.ru", createdAt: monthsAgo(2) },
  { id: 5, name: "ООО «ГазХимТех»",      inn: "7705678901", contactPerson: "Орлов Н.А.",   contactEmail: "orlov@gazhimtech.ru",  createdAt: daysAgo(20)  },
];

// ─── Тенанты ──────────────────────────────────────────────────────────────────
// API: GET /api/tenants → Tenant[]

export const TENANTS: Tenant[] = [
  {
    id: 1,
    type: "training_center",
    name: 'ООО "УЦ ИСП"',
    inn: "9000000001",
    licenseNo: "9999",
    licenseDate: "09.02.2026",
    contactEmail: "admin@isp.ru",
    managerName: "Иванов И.И.",
    status: "active",
    allowedDirections: [1, 2, 3, 4, 5, 6],
    subscriptions: [
      { type: "industrial_safety", label: "Промышленная безопасность", total: 50, used: 12 },
      { type: "energy_safety",     label: "Энергобезопасность",        total: 30, used: 8  },
      { type: "labor_protection",  label: "Охрана труда",              total: 20, used: 5  },
      { type: "expert_pb",         label: "Подготовка экспертов ПБ",   total: 10, used: 2  },
      { type: "expert_gts",        label: "Подготовка экспертов ГТС",  total: 10, used: 1  },
      { type: "own_courses",       label: "Свои курсы",                total: 15, used: 3  },
    ],
    clientOrganizations: CLIENT_ORGANIZATIONS,
    createdAt: monthsAgo(6),
  },
  {
    id: 2,
    type: "organization",
    name: "ПАО «НефтеГаз»",
    inn: "7700000002",
    contactEmail: "admin@neftegaz.ru",
    managerName: "Смирнов Д.К.",
    status: "active",
    allowedDirections: [1, 2],
    subscriptions: [
      { type: "industrial_safety", label: "Промышленная безопасность", total: 20, used: 14 },
      { type: "energy_safety",     label: "Энергобезопасность",        total: 10, used: 6  },
    ],
    createdAt: monthsAgo(4),
  },
  {
    id: 3,
    type: "organization",
    name: 'ООО "СтройМаш"',
    inn: "7700000003",
    contactEmail: "admin@stroymash.ru",
    managerName: "Сидорова А.О.",
    status: "trial",
    allowedDirections: [3],
    subscriptions: [
      { type: "labor_protection",  label: "Охрана труда",              total: 5, used: 2   },
    ],
    createdAt: daysAgo(15),
  },
];

// ─── Группы обучения ──────────────────────────────────────────────────────────
// API: GET /api/groups → Group[]

export const GROUPS_DATA: Group[] = [
  {
    id: 1,
    name: "ПБ-2024/01",
    tenantId: 1,
    clientOrganizationId: 1,
    clientOrganizationName: "ООО «ТехноПром»",
    inn: "7701234567",
    status: "active",
    createdAt: monthsAgo(2),
    userIds: [1, 2],
    courseIds: [101, 102],
  },
  {
    id: 2,
    name: "ОТ-2024/02",
    tenantId: 1,
    clientOrganizationId: 2,
    clientOrganizationName: "АО «СтройГрупп»",
    inn: "7702345678",
    status: "active",
    createdAt: monthsAgo(1),
    userIds: [3, 4],
    courseIds: [301],
  },
  {
    id: 3,
    name: "ЭНБ-2024/01",
    tenantId: 1,
    clientOrganizationId: 3,
    clientOrganizationName: "ГУП «Энергосеть»",
    inn: "7703456789",
    status: "active",
    createdAt: daysAgo(10),
    userIds: [5, 6],
    courseIds: [201],
  },
  {
    id: 4,
    name: "ПБ-2024/02",
    tenantId: 1,
    clientOrganizationId: 4,
    clientOrganizationName: "ПАО «МеталлСервис»",
    inn: "7704567890",
    status: "forming",
    createdAt: daysAgo(3),
    userIds: [7, 8],
    courseIds: [101],
    fromStpRequestId: 2,
  },
  {
    id: 5,
    name: "ЭПБ-2026/01",
    tenantId: 1,
    clientOrganizationId: 5,
    clientOrganizationName: "АО «ХимРесурс»",
    inn: "7705678901",
    status: "active",
    createdAt: monthsAgo(3),
    userIds: [9, 10, 11, 12, 22],
    courseIds: [401, 402],
  },
  {
    id: 6,
    name: "ОТ-2025/03",
    tenantId: 1,
    clientOrganizationId: 2,
    clientOrganizationName: "АО «СтройГрупп»",
    inn: "7702345678",
    status: "active",
    createdAt: monthsAgo(1),
    userIds: [13, 14, 15],
    courseIds: [301, 302],
  },
  {
    id: 7,
    name: "ПБ-2025/03",
    tenantId: 1,
    clientOrganizationId: 6,
    clientOrganizationName: "ООО «ГазПромСервис»",
    inn: "7706789012",
    status: "active",
    createdAt: monthsAgo(2),
    userIds: [16, 17, 18, 19],
    courseIds: [101, 103],
  },
  {
    id: 8,
    name: "ЭНБ-2025/02",
    tenantId: 1,
    clientOrganizationId: 3,
    clientOrganizationName: "ГУП «Энергосеть»",
    inn: "7703456789",
    status: "active",
    createdAt: daysAgo(20),
    userIds: [20, 21],
    courseIds: [201, 202],
  },
];

// ─── Слушатели ────────────────────────────────────────────────────────────────
// API: GET /api/users → User[]

export const INITIAL_USERS: User[] = [
  {
    id: 1,
    name: "Алина Иванова",
    email: "alina.ivanova@company.ru",
    initials: "АИ",
    group: "ПБ-2024/01",
    groupId: 1,
    organization: "ООО «ТехноПром»",
    clientOrganizationId: 1,
    role: "Студент",
    assignments: [
      { courseId: 101, active: true,  progress: 65,  assignedAt: daysAgo(5),   activatedAt: daysAgo(3),  status: "active",    dpoRequired: true  },
      { courseId: 102, active: false, progress: 0,   assignedAt: daysAgo(10),                            status: "pending",   dpoRequired: true  },
    ],
  },
  {
    id: 2,
    name: "Дмитрий Смирнов",
    email: "d.smirnov@company.ru",
    initials: "ДС",
    group: "ПБ-2024/01",
    groupId: 1,
    organization: "ООО «ТехноПром»",
    clientOrganizationId: 1,
    role: "Студент",
    assignments: [
      { courseId: 101, active: true,  progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: monthsAgo(1), status: "certified", testScore: 92, testPassedAt: monthsAgo(1), dpoRequired: true },
      { courseId: 102, active: false, progress: 0,   assignedAt: daysAgo(8),                              status: "pending",   dpoRequired: true  },
    ],
  },
  {
    id: 3,
    name: "Мария Козлова",
    email: "m.kozlova@company.ru",
    initials: "МК",
    group: "ОТ-2024/02",
    groupId: 2,
    organization: "АО «СтройГрупп»",
    clientOrganizationId: 2,
    role: "Студент",
    assignments: [
      { courseId: 301, active: true,  progress: 45,  assignedAt: daysAgo(15),  activatedAt: daysAgo(14), status: "active",    dpoRequired: false },
      { courseId: 101, active: false, progress: 0,   assignedAt: daysAgo(3),                             status: "pending",   dpoRequired: true  },
    ],
  },
  {
    id: 4,
    name: "Иван Петров",
    email: "i.petrov@company.ru",
    initials: "ИП",
    group: "ОТ-2024/02",
    groupId: 2,
    organization: "АО «СтройГрупп»",
    clientOrganizationId: 2,
    role: "Студент",
    assignments: [
      { courseId: 201, active: true,  progress: 80,  assignedAt: daysAgo(20),  activatedAt: daysAgo(18), status: "active",    dpoRequired: true  },
      { courseId: 301, active: true,  progress: 100, assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), completedAt: daysAgo(5), status: "completed", testScore: 88, testPassedAt: daysAgo(5), dpoRequired: false },
    ],
  },
  {
    id: 5,
    name: "Сергей Николаев",
    email: "s.nikolaev@company.ru",
    initials: "СН",
    group: "ЭНБ-2024/01",
    groupId: 3,
    organization: "ГУП «Энергосеть»",
    clientOrganizationId: 3,
    role: "Студент",
    assignments: [
      { courseId: 201, active: true,  progress: 55,  assignedAt: daysAgo(7),   activatedAt: daysAgo(6),  status: "active",    dpoRequired: true  },
      { courseId: 202, active: false, progress: 0,   assignedAt: daysAgo(2),                             status: "pending",   dpoRequired: true  },
    ],
  },
  {
    id: 6,
    name: "Елена Соколова",
    email: "e.sokolova@company.ru",
    initials: "ЕС",
    group: "ЭНБ-2024/01",
    groupId: 3,
    organization: "ГУП «Энергосеть»",
    clientOrganizationId: 3,
    role: "Преподаватель",
    assignments: [
      { courseId: 201, active: true,  progress: 90,  assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), status: "active",    dpoRequired: true  },
      { courseId: 202, active: true,  progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: daysAgo(12), status: "certified", testScore: 96, testPassedAt: daysAgo(12), dpoRequired: true },
    ],
  },
  {
    id: 7,
    name: "Андрей Лебедев",
    email: "a.lebedev@company.ru",
    initials: "АЛ",
    group: "ПБ-2024/02",
    groupId: 4,
    organization: "ПАО «МеталлСервис»",
    clientOrganizationId: 4,
    role: "Студент",
    assignments: [
      { courseId: 101, active: false, progress: 0,   assignedAt: daysAgo(1),                             status: "pending",   dpoRequired: true  },
    ],
  },
  {
    id: 8,
    name: "Ольга Михайлова",
    email: "o.mikhailova@company.ru",
    initials: "ОМ",
    group: "ПБ-2024/02",
    groupId: 4,
    organization: "ПАО «МеталлСервис»",
    clientOrganizationId: 4,
    role: "Студент",
    assignments: [
      { courseId: 101, active: false, progress: 0,   assignedAt: daysAgo(1),                             status: "pending",   dpoRequired: true  },
      { courseId: 102, active: false, progress: 0,   assignedAt: daysAgo(1),                             status: "pending",   dpoRequired: true  },
    ],
  },
  // ── Группа ЭПБ-2026/01 · АО «ХимРесурс» ─────────────────────────────────
  {
    id: 9,
    name: "Роман Зайцев",
    email: "r.zaitsev@himresurs.ru",
    initials: "РЗ",
    group: "ЭПБ-2026/01",
    groupId: 5,
    organization: "АО «ХимРесурс»",
    clientOrganizationId: 5,
    role: "Студент",
    assignments: [
      { courseId: 401, active: true,  progress: 78,  assignedAt: monthsAgo(3), activatedAt: monthsAgo(3), status: "active",    dpoRequired: true  },
      { courseId: 402, active: true,  progress: 55,  assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), status: "active",    dpoRequired: true  },
    ],
  },
  {
    id: 10,
    name: "Наталья Орлова",
    email: "n.orlova@himresurs.ru",
    initials: "НО",
    group: "ЭПБ-2026/01",
    groupId: 5,
    organization: "АО «ХимРесурс»",
    clientOrganizationId: 5,
    role: "Студент",
    assignments: [
      { courseId: 401, active: true,  progress: 100, assignedAt: monthsAgo(3), activatedAt: monthsAgo(3), completedAt: monthsAgo(1), status: "certified", testScore: 89, testPassedAt: monthsAgo(1), dpoRequired: true },
      { courseId: 402, active: true,  progress: 40,  assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), status: "active",    dpoRequired: true  },
    ],
  },
  {
    id: 11,
    name: "Виктор Кузнецов",
    email: "v.kuznetsov@himresurs.ru",
    initials: "ВК",
    group: "ЭПБ-2026/01",
    groupId: 5,
    organization: "АО «ХимРесурс»",
    clientOrganizationId: 5,
    role: "Студент",
    assignments: [
      { courseId: 401, active: true,  progress: 100, assignedAt: monthsAgo(3), activatedAt: monthsAgo(3), completedAt: monthsAgo(1), status: "certified", testScore: 94, testPassedAt: monthsAgo(1), dpoRequired: true },
      { courseId: 402, active: true,  progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: daysAgo(7),   status: "certified", testScore: 91, testPassedAt: daysAgo(7),   dpoRequired: true },
    ],
  },
  {
    id: 12,
    name: "Татьяна Белова",
    email: "t.belova@himresurs.ru",
    initials: "ТБ",
    group: "ЭПБ-2026/01",
    groupId: 5,
    organization: "АО «ХимРесурс»",
    clientOrganizationId: 5,
    role: "Студент",
    assignments: [
      { courseId: 401, active: false, progress: 30,  assignedAt: monthsAgo(3), activatedAt: monthsAgo(2), status: "active",    dpoRequired: true  },
      { courseId: 402, active: false, progress: 0,   assignedAt: monthsAgo(1),                            status: "pending",   dpoRequired: true  },
    ],
  },
  // ── Группа ОТ-2025/03 · АО «СтройГрупп» ─────────────────────────────────
  {
    id: 13,
    name: "Алексей Морозов",
    email: "a.morozov@stroigrupp.ru",
    initials: "АМ",
    group: "ОТ-2025/03",
    groupId: 6,
    organization: "АО «СтройГрупп»",
    clientOrganizationId: 2,
    role: "Студент",
    assignments: [
      { courseId: 301, active: true,  progress: 60,  assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), status: "active",    dpoRequired: false },
      { courseId: 302, active: false, progress: 0,   assignedAt: daysAgo(5),                              status: "pending",   dpoRequired: false },
    ],
  },
  {
    id: 14,
    name: "Светлана Попова",
    email: "s.popova@stroigrupp.ru",
    initials: "СП",
    group: "ОТ-2025/03",
    groupId: 6,
    organization: "АО «СтройГрупп»",
    clientOrganizationId: 2,
    role: "Студент",
    assignments: [
      { courseId: 301, active: true,  progress: 100, assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), completedAt: daysAgo(3), status: "completed", testScore: 85, testPassedAt: daysAgo(3), dpoRequired: false },
      { courseId: 302, active: true,  progress: 70,  assignedAt: daysAgo(5),   activatedAt: daysAgo(4),   status: "active",    dpoRequired: false },
    ],
  },
  {
    id: 15,
    name: "Дмитрий Волков",
    email: "d.volkov@stroigrupp.ru",
    initials: "ДВ",
    group: "ОТ-2025/03",
    groupId: 6,
    organization: "АО «СтройГрупп»",
    clientOrganizationId: 2,
    role: "Студент",
    assignments: [
      { courseId: 301, active: true,  progress: 25,  assignedAt: monthsAgo(1), activatedAt: daysAgo(10), status: "active",    dpoRequired: false },
      { courseId: 302, active: false, progress: 0,   assignedAt: daysAgo(5),                             status: "pending",   dpoRequired: false },
    ],
  },
  // ── Группа ПБ-2025/03 · ООО «ГазПромСервис» ─────────────────────────────
  {
    id: 16,
    name: "Игорь Федоров",
    email: "i.fedorov@gazpromservis.ru",
    initials: "ИФ",
    group: "ПБ-2025/03",
    groupId: 7,
    organization: "ООО «ГазПромСервис»",
    clientOrganizationId: 6,
    role: "Студент",
    assignments: [
      { courseId: 101, active: true,  progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: monthsAgo(1), status: "certified", testScore: 97, testPassedAt: monthsAgo(1), dpoRequired: true },
      { courseId: 103, active: true,  progress: 85,  assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), status: "active",    dpoRequired: true  },
    ],
  },
  {
    id: 17,
    name: "Юлия Новикова",
    email: "yu.novikova@gazpromservis.ru",
    initials: "ЮН",
    group: "ПБ-2025/03",
    groupId: 7,
    organization: "ООО «ГазПромСервис»",
    clientOrganizationId: 6,
    role: "Студент",
    assignments: [
      { courseId: 101, active: true,  progress: 72,  assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), status: "active",    dpoRequired: true  },
      { courseId: 103, active: false, progress: 0,   assignedAt: monthsAgo(1),                            status: "pending",   dpoRequired: true  },
    ],
  },
  {
    id: 18,
    name: "Павел Семёнов",
    email: "p.semenov@gazpromservis.ru",
    initials: "ПС",
    group: "ПБ-2025/03",
    groupId: 7,
    organization: "ООО «ГазПромСервис»",
    clientOrganizationId: 6,
    role: "Студент",
    assignments: [
      { courseId: 101, active: true,  progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: monthsAgo(1), status: "certified", testScore: 82, testPassedAt: monthsAgo(1), dpoRequired: true },
      { courseId: 103, active: true,  progress: 50,  assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), status: "active",    dpoRequired: true  },
    ],
  },
  {
    id: 19,
    name: "Марина Титова",
    email: "m.titova@gazpromservis.ru",
    initials: "МТ",
    group: "ПБ-2025/03",
    groupId: 7,
    organization: "ООО «ГазПромСервис»",
    clientOrganizationId: 6,
    role: "Студент",
    assignments: [
      { courseId: 101, active: false, progress: 0,   assignedAt: monthsAgo(2),                            status: "pending",   dpoRequired: true  },
      { courseId: 103, active: false, progress: 0,   assignedAt: monthsAgo(1),                            status: "pending",   dpoRequired: true  },
    ],
  },
  // ── Группа ЭНБ-2025/02 · ГУП «Энергосеть» ───────────────────────────────
  {
    id: 20,
    name: "Константин Жуков",
    email: "k.zhukov@energoset.ru",
    initials: "КЖ",
    group: "ЭНБ-2025/02",
    groupId: 8,
    organization: "ГУП «Энергосеть»",
    clientOrganizationId: 3,
    role: "Студент",
    assignments: [
      { courseId: 201, active: true,  progress: 40,  assignedAt: daysAgo(20), activatedAt: daysAgo(18), status: "active",    dpoRequired: true  },
      { courseId: 202, active: false, progress: 0,   assignedAt: daysAgo(5),                            status: "pending",   dpoRequired: true  },
    ],
  },
  {
    id: 21,
    name: "Анастасия Громова",
    email: "a.gromova@energoset.ru",
    initials: "АГ",
    group: "ЭНБ-2025/02",
    groupId: 8,
    organization: "ГУП «Энергосеть»",
    clientOrganizationId: 3,
    role: "Студент",
    assignments: [
      { courseId: 201, active: true,  progress: 65,  assignedAt: daysAgo(20), activatedAt: daysAgo(19), status: "active",    dpoRequired: true  },
      { courseId: 202, active: true,  progress: 20,  assignedAt: daysAgo(5),  activatedAt: daysAgo(4),  status: "active",    dpoRequired: true  },
    ],
  },
  {
    id: 22,
    name: "Сергей Эксперт",
    email: "s.expert@expertpb.ru",
    initials: "СЭ",
    group: "ЭПБ-2026/01",
    groupId: 5,
    organization: "ООО «ЭкспертПБ»",
    clientOrganizationId: 2,
    role: "Студент",
    assignments: [
      { courseId: 401, active: true,  progress: 20,  assignedAt: daysAgo(10), activatedAt: daysAgo(8), status: "active", dpoRequired: false },
      { courseId: 402, active: false, progress: 0,   assignedAt: daysAgo(3),                           status: "pending", dpoRequired: false },
    ],
  },
];

// ─── Удостоверения ДПО ────────────────────────────────────────────────────────
// API: GET /api/certificates → Certificate[]

export const CERTIFICATES: Certificate[] = [
  {
    id: 1,
    userId: 2,
    userName: "Дмитрий Смирнов",
    userEmail: "d.smirnov@company.ru",
    userOrganization: "ООО «ТехноПром»",
    courseId: 101,
    courseTitle: "Основы промышленной безопасности",
    courseCode: "А.1.",
    courseHours: 72,
    activatedAt: monthsAgo(2),
    testScore: 92,
    testPassedAt: monthsAgo(1),
    status: "issued",
    issuedAt: daysAgo(25),
    issuedBy: "Иванов И.И.",
    certificateNumber: "ДПО-2024-001",
    tenantId: 1,
  },
  {
    id: 2,
    userId: 6,
    userName: "Елена Соколова",
    userEmail: "e.sokolova@company.ru",
    userOrganization: "ГУП «Энергосеть»",
    courseId: 202,
    courseTitle: "Охрана труда при эксплуатации электроустановок",
    courseCode: "Э.2.",
    courseHours: 40,
    activatedAt: monthsAgo(2),
    testScore: 96,
    testPassedAt: daysAgo(12),
    status: "ready",
    tenantId: 1,
  },
  {
    id: 3,
    userId: 11,
    userName: "Виктор Кузнецов",
    userEmail: "v.kuznetsov@himresurs.ru",
    userOrganization: "АО «ХимРесурс»",
    courseId: 401,
    courseTitle: "Экспертиза промышленной безопасности",
    courseCode: "Э.1.",
    courseHours: 80,
    activatedAt: monthsAgo(3),
    testScore: 94,
    testPassedAt: monthsAgo(1),
    status: "issued",
    issuedAt: daysAgo(20),
    issuedBy: "Иванов И.И.",
    certificateNumber: "ДПО-2024-002",
    tenantId: 1,
  },
  {
    id: 4,
    userId: 16,
    userName: "Игорь Федоров",
    userEmail: "i.fedorov@gazpromservis.ru",
    userOrganization: "ООО «ГазПромСервис»",
    courseId: 101,
    courseTitle: "Основы промышленной безопасности",
    courseCode: "А.1.",
    courseHours: 72,
    activatedAt: monthsAgo(2),
    testScore: 97,
    testPassedAt: monthsAgo(1),
    status: "issued",
    issuedAt: daysAgo(15),
    issuedBy: "Петрова С.А.",
    certificateNumber: "ДПО-2024-003",
    tenantId: 1,
  },
  {
    id: 5,
    userId: 10,
    userName: "Наталья Орлова",
    userEmail: "n.orlova@himresurs.ru",
    userOrganization: "АО «ХимРесурс»",
    courseId: 401,
    courseTitle: "Экспертиза промышленной безопасности",
    courseCode: "Э.1.",
    courseHours: 80,
    activatedAt: monthsAgo(2),
    testScore: 89,
    testPassedAt: monthsAgo(1),
    status: "ready",
    tenantId: 1,
  },
];

// ─── STP-заявки ───────────────────────────────────────────────────────────────
// API: GET /api/stp-requests → STPRequest[]

export const STP_REQUESTS: STPRequest[] = [
  {
    id: 1,
    externalId: "STP-2024-0041",
    status: "new",
    organizationName: "ООО «ГазХимТех»",
    inn: "7705678901",
    courseName: "Основы промышленной безопасности (А.1.)",
    courseDirectionId: 1,
    participants: [
      { name: "Громов Виктор Алексеевич",   email: "gromov@gazhimtech.ru"   },
      { name: "Назарова Ирина Петровна",     email: "nazarova@gazhimtech.ru" },
      { name: "Попов Сергей Михайлович",     email: "popov@gazhimtech.ru"    },
    ],
    receivedAt: daysAgo(1),
    tenantId: 1,
  },
  {
    id: 2,
    externalId: "STP-2024-0038",
    status: "accepted",
    organizationName: "ПАО «МеталлСервис»",
    inn: "7704567890",
    courseName: "Основы промышленной безопасности (А.1.)",
    courseDirectionId: 1,
    participants: [
      { name: "Андрей Лебедев",   email: "a.lebedev@company.ru"  },
      { name: "Ольга Михайлова",  email: "o.mikhailova@company.ru" },
    ],
    receivedAt: daysAgo(4),
    acceptedAt: daysAgo(3),
    createdGroupId: 4,
    tenantId: 1,
  },
  {
    id: 3,
    externalId: "STP-2024-0035",
    status: "new",
    organizationName: "ЗАО «ХимРесурс»",
    inn: "7706789012",
    courseName: "Эксплуатация химически опасных производственных объектов (Б.1.1.)",
    courseDirectionId: 1,
    participants: [
      { name: "Тимофеев Алексей Игоревич",  email: "timofeev@himresurs.ru" },
      { name: "Семёнова Ольга Николаевна",  email: "semenova@himresurs.ru" },
    ],
    receivedAt: daysAgo(2),
    tenantId: 1,
  },
];

// ─── Курсы тенанта (свои курсы) ───────────────────────────────────────────────
// API: GET /api/tenant-courses → TenantCourse[]

export const TENANT_COURSES: TenantCourse[] = [
  {
    id: 1001,
    tenantId: 1,
    title: "Вводный инструктаж для новых сотрудников",
    code: "ВИ-01",
    hours: 8,
    hasTest: true,
    dpoAvailable: false,
    status: "approved",
    createdAt: monthsAgo(2),
    approvedAt: monthsAgo(2),
    description: "Курс для новых сотрудников: правила внутреннего распорядка, охрана труда, пожарная безопасность.",
    testModes: ["adaptive", "final"],
    finalTestQuestions: 20,
    finalTestPassScore: 70,
    finalTestTime: 30,
    materials: [
      { id: 101, title: "Лекция 1. Правила внутреннего трудового распорядка", type: "lecture",      ext: "PDF"  },
      { id: 102, title: "Презентация. Требования охраны труда",               type: "presentation", ext: "PPTX" },
      { id: 103, title: "Видеолекция. Инструктаж по ПБ",                      type: "video",        ext: "MP4"  },
    ],
    ntdFiles: [
      { id: 201, title: "ФЗ-197 «Трудовой кодекс РФ»",               ext: "PDF" },
      { id: 202, title: "Правила внутреннего распорядка предприятия", ext: "DOCX" },
    ],
  },
  {
    id: 1002,
    tenantId: 1,
    title: "Пожарная безопасность на предприятии",
    code: "ПБ-01",
    hours: 16,
    hasTest: true,
    dpoAvailable: false,
    status: "pending_approval",
    createdAt: daysAgo(5),
    description: "Требования пожарной безопасности, действия при пожаре, первичные средства пожаротушения.",
    testModes: ["section", "final"],
    finalTestQuestions: 25,
    finalTestPassScore: 75,
    finalTestTime: 45,
    materials: [
      { id: 111, title: "Лекция 1. Основы пожарной безопасности",        type: "lecture",      ext: "PDF"  },
      { id: 112, title: "Лекция 2. Первичные средства пожаротушения",     type: "lecture",      ext: "PDF"  },
      { id: 113, title: "Аудиолекция. Действия при обнаружении пожара",   type: "audio",        ext: "MP3"  },
      { id: 114, title: "Презентация. Эвакуационные пути и выходы",       type: "presentation", ext: "PPTX" },
    ],
    ntdFiles: [
      { id: 211, title: "ФЗ-69 «О пожарной безопасности»",               ext: "PDF"  },
      { id: 212, title: "ПП РФ №1479 — Правила ПБ в РФ",                ext: "PDF"  },
      { id: 213, title: "ГОСТ 12.1.004-91 — Пожарная безопасность",      ext: "PDF"  },
    ],
  },
  {
    id: 1003,
    tenantId: 2,
    title: "Охрана труда для руководителей и специалистов",
    code: "ОТ-02",
    hours: 40,
    hasTest: true,
    dpoAvailable: true,
    status: "pending_approval",
    createdAt: daysAgo(3),
    description: "Программа ДПО по охране труда для руководителей организаций и специалистов служб ОТ.",
    testModes: ["adaptive", "section", "final"],
    finalTestQuestions: 30,
    finalTestPassScore: 80,
    finalTestTime: 60,
    materials: [
      { id: 121, title: "Модуль 1. Законодательная база охраны труда",      type: "lecture",      ext: "PDF"  },
      { id: 122, title: "Модуль 2. Спецоценка условий труда",               type: "lecture",      ext: "PDF"  },
      { id: 123, title: "Видеокурс. Расследование несчастных случаев",      type: "video",        ext: "MP4"  },
      { id: 124, title: "Презентация. Обязательные инструктажи",            type: "presentation", ext: "PPTX" },
      { id: 125, title: "Лекция 5. Обеспечение СИЗ",                        type: "lecture",      ext: "DOCX" },
    ],
    ntdFiles: [
      { id: 221, title: "ТК РФ, Раздел X — Охрана труда",                  ext: "PDF"  },
      { id: 222, title: "ФЗ-426 «О специальной оценке условий труда»",     ext: "PDF"  },
      { id: 223, title: "Приказ Минтруда №772н — Единые типовые нормы СИЗ", ext: "PDF"  },
    ],
  },
  {
    id: 1004,
    tenantId: 1,
    title: "Электробезопасность. Группа II",
    code: "ЭБ-II",
    hours: 12,
    hasTest: true,
    dpoAvailable: false,
    status: "rejected",
    rejectionReason: "Необходимо добавить модуль по практическим навыкам оказания первой помощи при поражении электрическим током.",
    createdAt: daysAgo(14),
    materials: [
      { id: 131, title: "Лекция 1. Действие электрического тока на организм", type: "lecture", ext: "PDF" },
      { id: 132, title: "Видео. Правила работы с электрооборудованием",        type: "video",   ext: "MP4" },
    ],
    ntdFiles: [
      { id: 231, title: "ПТЭЭП — Правила технической эксплуатации", ext: "PDF" },
      { id: 232, title: "ПУЭ — Правила устройства электроустановок", ext: "PDF" },
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

// ─── Системные пользователи ───────────────────────────────────────────────────

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
    role: "Слушатель",
    department: "",
    password: "student123",
    status: "active",
    registeredAt: "09.02.2026",
  },
  {
    id: 5,
    lastName: "ВОРОНОВ",
    firstName: "КОНСТАНТИН",
    middleName: "АЛЕКСЕЕВИЧ",
    email: "sales@isp.ru",
    role: "Менеджер продаж",
    department: "Отдел продаж",
    password: "sales123",
    status: "active",
    registeredAt: "10.01.2025",
  },
  {
    id: 6,
    lastName: "СИДОРОВА",
    firstName: "ЕЛЕНА",
    middleName: "ВИКТОРОВНА",
    email: "support@isp.ru",
    role: "Специалист ТП",
    department: "Техническая поддержка",
    password: "support123",
    status: "active",
    registeredAt: "15.03.2025",
  },
  {
    id: 7,
    lastName: "ЭКСПЕРТ",
    firstName: "СЕРГЕЙ",
    middleName: "ПЕТРОВИЧ",
    email: "s.expert@expertpb.ru",
    role: "Слушатель",
    department: "Слушатели",
    password: "expert123",
    status: "active",
    registeredAt: "24.04.2026",
  },
];

// ─── Настройки email ──────────────────────────────────────────────────────────

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

// ─── Справочники ──────────────────────────────────────────────────────────────

export const ORG_TYPES = ["Юридическое лицо", "ИП", "Физическое лицо"] as const;
export const OPF_TYPES = ["ООО", "АО", "ПАО", "ГБУ", "ФГБУ", "ИП"] as const;
export const USER_ROLES_SYSTEM = ["Администратор", "Менеджер", "Слушатель", "Наблюдатель"] as const;

// ─── Шаблоны email-уведомлений ────────────────────────────────────────────────

export const EMAIL_TEMPLATES = [
  { id: "90days",  title: "За 90 дней до истечения", desc: "Первое напоминание о плановой аттестации" },
  { id: "30days",  title: "За 30 дней до истечения", desc: "Второе напоминание о плановой аттестации" },
  { id: "7days",   title: "За 7 дней до истечения",  desc: "Срочное напоминание об аттестации" },
  { id: "expired", title: "Истечение срока",          desc: "Уведомление об истечении срока аттестации" },
];