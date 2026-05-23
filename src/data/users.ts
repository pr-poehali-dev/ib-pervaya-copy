import type { User, Group } from "@/types/admin";
import type { SystemUser } from "@/types/settings";
import { fmt, daysAgo, monthsAgo } from "@/data/dateUtils";

// ─── Роли слушателей ──────────────────────────────────────────────────────────

export const ROLES: string[] = ["Студент", "Преподаватель", "Наблюдатель"];

// ─── Группы обучения ──────────────────────────────────────────────────────────
// API: GET /api/groups → Group[]

export const GROUPS_DATA: Group[] = [
  { id: 1, name: "ПБ-2024/01",   tenantId: 1, clientOrganizationId: 1, clientOrganizationName: "ООО «ТехноПром»",       inn: "7701234567", status: "active",   createdAt: monthsAgo(2),  userIds: [1, 2, 23, 24],           courseIds: [101, 102] },
  { id: 2, name: "ОТ-2024/02",   tenantId: 1, clientOrganizationId: 2, clientOrganizationName: "АО «СтройГрупп»",       inn: "7702345678", status: "active",   createdAt: monthsAgo(1),  userIds: [3, 4],              courseIds: [301] },
  { id: 3, name: "ЭНБ-2024/01",  tenantId: 1, clientOrganizationId: 3, clientOrganizationName: "ГУП «Энергосеть»",      inn: "7703456789", status: "active",   createdAt: daysAgo(10),   userIds: [5, 6],              courseIds: [201] },
  { id: 4, name: "ПБ-2024/02",   tenantId: 1, clientOrganizationId: 4, clientOrganizationName: "ПАО «МеталлСервис»",    inn: "7704567890", status: "forming",  createdAt: daysAgo(3),    userIds: [7, 8],              courseIds: [101],  fromStpRequestId: 2 },
  { id: 5, name: "ЭПБ-2026/01",  tenantId: 1, clientOrganizationId: 5, clientOrganizationName: "АО «ХимРесурс»",        inn: "7705678901", status: "active",   createdAt: monthsAgo(3),  userIds: [9, 10, 11, 12, 22, 25, 26], courseIds: [401, 402] },
  { id: 6, name: "ОТ-2025/03",   tenantId: 1, clientOrganizationId: 2, clientOrganizationName: "АО «СтройГрупп»",       inn: "7702345678", status: "active",   createdAt: monthsAgo(1),  userIds: [13, 14, 15],        courseIds: [301, 302] },
  { id: 7, name: "ПБ-2025/03",   tenantId: 1, clientOrganizationId: 6, clientOrganizationName: "ООО «ГазПромСервис»",   inn: "7706789012", status: "active",   createdAt: monthsAgo(2),  userIds: [16, 17, 18, 19],    courseIds: [101, 103] },
  { id: 8, name: "ЭНБ-2025/02",  tenantId: 1, clientOrganizationId: 3, clientOrganizationName: "ГУП «Энергосеть»",      inn: "7703456789", status: "active",   createdAt: daysAgo(20),   userIds: [20, 21, 27, 28],    courseIds: [201, 202] },
  { id: 9, name: "ОТ-2026/01",   tenantId: 1, clientOrganizationId: 7, clientOrganizationName: "ЗАО «РосТехМонтаж»",   inn: "7707890123", status: "active",   createdAt: daysAgo(45),   userIds: [29, 30, 31, 32],    courseIds: [301, 303, 304] },
  { id: 10, name: "ПБ-2026/02",  tenantId: 1, clientOrganizationId: 1, clientOrganizationName: "ООО «ТехноПром»",       inn: "7701234567", status: "forming",  createdAt: daysAgo(7),    userIds: [33, 34, 35],        courseIds: [101, 102, 103] },
];

// Вспомогательный массив для быстрого доступа к имени группы по id
export const GROUPS: string[] = GROUPS_DATA.map((g) => g.name);

// ─── Слушатели ────────────────────────────────────────────────────────────────
// API: GET /api/users → User[]

export const INITIAL_USERS: User[] = [
  // ─── Группа 1: ПБ-2024/01 — ООО «ТехноПром» ─────────────────────────────
  {
    id: 1,
    name: "Алина Иванова",
    lastName: "ИВАНОВА", firstName: "АЛИНА", middleName: "СЕРГЕЕВНА",
    phone: "+7 (916) 234-56-78",
    position: "Инженер по ОТ",
    email: "alina.ivanova@technoprom.ru",
    initials: "АИ",
    organization: "ООО «ТехноПром»",
    clientOrganizationId: 1,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 1,
        groupName: "ПБ-2024/01",
        assignments: [
          {
            courseId: 101, active: true, progress: 65, assignedAt: daysAgo(35), activatedAt: daysAgo(30), status: "active", dpoRequired: true,
            history: [
              { date: daysAgo(35), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(30), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 102, active: false, progress: 0, assignedAt: daysAgo(35), status: "pending", dpoRequired: true,
            history: [
              { date: daysAgo(35), action: "Курс назначен", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 2,
    name: "Дмитрий Смирнов",
    lastName: "СМИРНОВ", firstName: "ДМИТРИЙ", middleName: "АЛЕКСАНДРОВИЧ",
    phone: "+7 (903) 111-22-33",
    position: "Начальник производства",
    email: "d.smirnov@technoprom.ru",
    initials: "ДС",
    organization: "ООО «ТехноПром»",
    clientOrganizationId: 1,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 1,
        groupName: "ПБ-2024/01",
        assignments: [
          {
            courseId: 101, active: true, progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: monthsAgo(1), status: "certified", testScore: 92, testPassedAt: monthsAgo(1), dpoRequired: true,
            history: [
              { date: monthsAgo(2), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Выдано удостоверение", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 102, active: false, progress: 0, assignedAt: daysAgo(8), status: "pending", dpoRequired: true,
            history: [
              { date: daysAgo(8), action: "Курс назначен", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 23,
    name: "Виктория Панова",
    lastName: "ПАНОВА", firstName: "ВИКТОРИЯ", middleName: "ЮРЬЕВНА",
    phone: "+7 (926) 445-67-89",
    position: "Специалист по ПБ",
    email: "v.panova@technoprom.ru",
    initials: "ВП",
    organization: "ООО «ТехноПром»",
    clientOrganizationId: 1,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 1,
        groupName: "ПБ-2024/01",
        assignments: [
          {
            courseId: 101, active: true, progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: daysAgo(15), status: "completed", testScore: 78, testPassedAt: daysAgo(15), dpoRequired: true,
            history: [
              { date: monthsAgo(2), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 102, active: true, progress: 35, assignedAt: daysAgo(20), activatedAt: daysAgo(18), status: "active", dpoRequired: true,
            history: [
              { date: daysAgo(20), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(18), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 24,
    name: "Михаил Рябов",
    lastName: "РЯБОВ", firstName: "МИХАИЛ", middleName: "ОЛЕГОВИЧ",
    phone: "+7 (915) 778-90-12",
    position: "Мастер участка",
    email: "m.ryabov@technoprom.ru",
    initials: "МР",
    organization: "ООО «ТехноПром»",
    clientOrganizationId: 1,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 1,
        groupName: "ПБ-2024/01",
        assignments: [
          {
            courseId: 101, active: false, progress: 0, assignedAt: daysAgo(5), status: "pending", dpoRequired: true,
            history: [
              { date: daysAgo(5), action: "Курс назначен", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 102, active: false, progress: 0, assignedAt: daysAgo(5), status: "pending", dpoRequired: true,
            history: [
              { date: daysAgo(5), action: "Курс назначен", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },

  // ─── Группа 2: ОТ-2024/02 — АО «СтройГрупп» ─────────────────────────────
  {
    id: 3,
    name: "Мария Козлова",
    lastName: "КОЗЛОВА", firstName: "МАРИЯ", middleName: "ВЛАДИМИРОВНА",
    phone: "+7 (917) 321-43-65",
    position: "Специалист по ОТ",
    email: "m.kozlova@stroigrupp.ru",
    initials: "МК",
    organization: "АО «СтройГрупп»",
    clientOrganizationId: 2,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 2,
        groupName: "ОТ-2024/02",
        assignments: [
          {
            courseId: 301, active: true, progress: 45, assignedAt: daysAgo(15), activatedAt: daysAgo(14), status: "active", dpoRequired: false,
            history: [
              { date: daysAgo(15), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(14), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 4,
    name: "Иван Петров",
    lastName: "ПЕТРОВ", firstName: "ИВАН", middleName: "НИКОЛАЕВИЧ",
    phone: "+7 (905) 654-32-10",
    position: "Прораб",
    email: "i.petrov@stroigrupp.ru",
    initials: "ИП",
    organization: "АО «СтройГрупп»",
    clientOrganizationId: 2,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 2,
        groupName: "ОТ-2024/02",
        assignments: [
          {
            courseId: 301, active: true, progress: 100, assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), completedAt: daysAgo(5), status: "completed", testScore: 88, testPassedAt: daysAgo(5), dpoRequired: false,
            history: [
              { date: monthsAgo(1), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
      {
        groupId: 3,
        groupName: "ЭНБ-2024/01",
        assignments: [
          {
            courseId: 201, active: true, progress: 80, assignedAt: daysAgo(20), activatedAt: daysAgo(18), status: "active", dpoRequired: true,
            history: [
              { date: daysAgo(20), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(18), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },

  // ─── Группа 3: ЭНБ-2024/01 — ГУП «Энергосеть» ───────────────────────────
  {
    id: 5,
    name: "Сергей Николаев",
    lastName: "НИКОЛАЕВ", firstName: "СЕРГЕЙ", middleName: "БОРИСОВИЧ",
    phone: "+7 (919) 555-44-33",
    position: "Электромонтёр",
    email: "s.nikolaev@energoset.ru",
    initials: "СН",
    organization: "ГУП «Энергосеть»",
    clientOrganizationId: 3,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 3,
        groupName: "ЭНБ-2024/01",
        assignments: [
          {
            courseId: 201, active: true, progress: 55, assignedAt: daysAgo(7), activatedAt: daysAgo(6), status: "active", dpoRequired: true,
            history: [
              { date: daysAgo(7), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(6), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          { courseId: 202, active: false, progress: 0, assignedAt: daysAgo(2), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },
  {
    id: 6,
    name: "Елена Соколова",
    lastName: "СОКОЛОВА", firstName: "ЕЛЕНА", middleName: "ИГОРЕВНА",
    phone: "+7 (910) 888-77-66",
    position: "Главный энергетик",
    email: "e.sokolova@energoset.ru",
    initials: "ЕС",
    organization: "ГУП «Энергосеть»",
    clientOrganizationId: 3,
    role: "Преподаватель",
    assignments: [],
    enrollments: [
      {
        groupId: 3,
        groupName: "ЭНБ-2024/01",
        assignments: [
          {
            courseId: 201, active: true, progress: 90, assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), status: "active", dpoRequired: true,
            history: [
              { date: monthsAgo(1), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 202, active: true, progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: daysAgo(12), status: "certified", testScore: 96, testPassedAt: daysAgo(12), dpoRequired: true,
            history: [
              { date: monthsAgo(2), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
              { date: daysAgo(12), action: "Выдано удостоверение", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },

  // ─── Группа 4: ПБ-2024/02 — ПАО «МеталлСервис» ──────────────────────────
  {
    id: 7,
    name: "Андрей Лебедев",
    lastName: "ЛЕБЕДЕВ", firstName: "АНДРЕЙ", middleName: "ВИТАЛЬЕВИЧ",
    phone: "+7 (925) 112-33-44",
    position: "Технолог",
    email: "a.lebedev@metallservis.ru",
    initials: "АЛ",
    organization: "ПАО «МеталлСервис»",
    clientOrganizationId: 4,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 4,
        groupName: "ПБ-2024/02",
        assignments: [
          { courseId: 101, active: false, progress: 0, assignedAt: daysAgo(1), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },
  {
    id: 8,
    name: "Ольга Михайлова",
    lastName: "МИХАЙЛОВА", firstName: "ОЛЬГА", middleName: "ДМИТРИЕВНА",
    phone: "+7 (909) 223-44-55",
    position: "Инженер-технолог",
    email: "o.mikhailova@metallservis.ru",
    initials: "ОМ",
    organization: "ПАО «МеталлСервис»",
    clientOrganizationId: 4,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 4,
        groupName: "ПБ-2024/02",
        assignments: [
          { courseId: 101, active: false, progress: 0, assignedAt: daysAgo(1), status: "pending", dpoRequired: true },
          { courseId: 102, active: false, progress: 0, assignedAt: daysAgo(1), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },

  // ─── Группа 5: ЭПБ-2026/01 — АО «ХимРесурс» ─────────────────────────────
  {
    id: 9,
    name: "Роман Зайцев",
    lastName: "ЗАЙЦЕВ", firstName: "РОМАН", middleName: "ПАВЛОВИЧ",
    phone: "+7 (911) 334-55-66",
    position: "Ведущий эксперт ПБ",
    email: "r.zaitsev@himresurs.ru",
    initials: "РЗ",
    organization: "АО «ХимРесурс»",
    clientOrganizationId: 5,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 5,
        groupName: "ЭПБ-2026/01",
        assignments: [
          {
            courseId: 401, active: true, progress: 78, assignedAt: monthsAgo(3), activatedAt: monthsAgo(3), status: "active", dpoRequired: true,
            history: [
              { date: monthsAgo(3), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(3), action: "Курс активирован", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Курс продлён", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 402, active: true, progress: 55, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), status: "active", dpoRequired: true,
            history: [
              { date: monthsAgo(2), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 10,
    name: "Наталья Орлова",
    lastName: "ОРЛОВА", firstName: "НАТАЛЬЯ", middleName: "АНДРЕЕВНА",
    phone: "+7 (912) 445-66-77",
    position: "Эксперт ПБ",
    email: "n.orlova@himresurs.ru",
    initials: "НО",
    organization: "АО «ХимРесурс»",
    clientOrganizationId: 5,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 5,
        groupName: "ЭПБ-2026/01",
        assignments: [
          {
            courseId: 401, active: true, progress: 100, assignedAt: monthsAgo(3), activatedAt: monthsAgo(3), completedAt: monthsAgo(1), status: "certified", testScore: 89, testPassedAt: monthsAgo(1), dpoRequired: true,
            history: [
              { date: monthsAgo(3), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(3), action: "Курс активирован", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Выдано удостоверение", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 402, active: true, progress: 40, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), status: "active", dpoRequired: true,
            history: [
              { date: monthsAgo(2), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 11,
    name: "Виктор Кузнецов",
    lastName: "КУЗНЕЦОВ", firstName: "ВИКТОР", middleName: "МАКСИМОВИЧ",
    phone: "+7 (920) 556-77-88",
    position: "Главный эксперт ПБ",
    email: "v.kuznetsov@himresurs.ru",
    initials: "ВК",
    organization: "АО «ХимРесурс»",
    clientOrganizationId: 5,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 5,
        groupName: "ЭПБ-2026/01",
        assignments: [
          {
            courseId: 401, active: true, progress: 100, assignedAt: monthsAgo(3), activatedAt: monthsAgo(3), completedAt: monthsAgo(1), status: "certified", testScore: 94, testPassedAt: monthsAgo(1), dpoRequired: true,
            history: [
              { date: monthsAgo(3), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(3), action: "Курс активирован", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Выдано удостоверение", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 402, active: true, progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: daysAgo(7), status: "certified", testScore: 91, testPassedAt: daysAgo(7), dpoRequired: true,
            history: [
              { date: monthsAgo(2), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
              { date: daysAgo(7), action: "Выдано удостоверение", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 12,
    name: "Татьяна Белова",
    lastName: "БЕЛОВА", firstName: "ТАТЬЯНА", middleName: "СЕМЁНОВНА",
    phone: "+7 (921) 667-88-99",
    position: "Эксперт-аналитик",
    email: "t.belova@himresurs.ru",
    initials: "ТБ",
    organization: "АО «ХимРесурс»",
    clientOrganizationId: 5,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 5,
        groupName: "ЭПБ-2026/01",
        assignments: [
          {
            courseId: 401, active: false, progress: 30, assignedAt: monthsAgo(3), activatedAt: monthsAgo(2), status: "active", dpoRequired: true,
            history: [
              { date: monthsAgo(3), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
              { date: daysAgo(10), action: "Курс отключён", by: "Иванов И.И." },
            ],
          },
          { courseId: 402, active: false, progress: 0, assignedAt: monthsAgo(1), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },
  {
    id: 25,
    name: "Артём Громов",
    lastName: "ГРОМОВ", firstName: "АРТЁМ", middleName: "ВАЛЕРЬЕВИЧ",
    phone: "+7 (922) 778-99-00",
    position: "Технический директор",
    email: "a.gromov@himresurs.ru",
    initials: "АГ",
    organization: "АО «ХимРесурс»",
    clientOrganizationId: 5,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 5,
        groupName: "ЭПБ-2026/01",
        assignments: [
          {
            courseId: 401, active: true, progress: 100, assignedAt: monthsAgo(3), activatedAt: monthsAgo(3), completedAt: monthsAgo(1), status: "certified", testScore: 86, testPassedAt: monthsAgo(1), dpoRequired: true,
            history: [
              { date: monthsAgo(3), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(3), action: "Курс активирован", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Выдано удостоверение", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 402, active: true, progress: 62, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), status: "active", dpoRequired: true,
            history: [
              { date: monthsAgo(2), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 26,
    name: "Людмила Щербакова",
    lastName: "ЩЕРБАКОВА", firstName: "ЛЮДМИЛА", middleName: "ЕВГЕНЬЕВНА",
    phone: "+7 (923) 889-00-11",
    position: "Эксперт ПБ",
    email: "l.scherbakova@himresurs.ru",
    initials: "ЛЩ",
    organization: "АО «ХимРесурс»",
    clientOrganizationId: 5,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 5,
        groupName: "ЭПБ-2026/01",
        assignments: [
          {
            courseId: 401, active: true, progress: 48, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), status: "active", dpoRequired: true,
            history: [
              { date: monthsAgo(2), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          { courseId: 402, active: false, progress: 0, assignedAt: monthsAgo(1), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },

  // ─── Группа 6: ОТ-2025/03 — АО «СтройГрупп» ─────────────────────────────
  {
    id: 13,
    name: "Алексей Морозов",
    lastName: "МОРОЗОВ", firstName: "АЛЕКСЕЙ", middleName: "ГЕННАДЬЕВИЧ",
    phone: "+7 (924) 990-11-22",
    position: "Специалист по ОТ",
    email: "a.morozov@stroigrupp.ru",
    initials: "АМ",
    organization: "АО «СтройГрупп»",
    clientOrganizationId: 2,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 6,
        groupName: "ОТ-2025/03",
        assignments: [
          {
            courseId: 301, active: true, progress: 60, assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), status: "active", dpoRequired: false,
            history: [
              { date: monthsAgo(1), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          { courseId: 302, active: false, progress: 0, assignedAt: daysAgo(5), status: "pending", dpoRequired: false },
        ],
      },
    ],
  },
  {
    id: 14,
    name: "Светлана Попова",
    lastName: "ПОПОВА", firstName: "СВЕТЛАНА", middleName: "НИКОЛАЕВНА",
    phone: "+7 (925) 001-22-33",
    position: "Инженер по ОТ",
    email: "s.popova@stroigrupp.ru",
    initials: "СП",
    organization: "АО «СтройГрупп»",
    clientOrganizationId: 2,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 6,
        groupName: "ОТ-2025/03",
        assignments: [
          {
            courseId: 301, active: true, progress: 100, assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), completedAt: daysAgo(3), status: "completed", testScore: 85, testPassedAt: daysAgo(3), dpoRequired: false,
            history: [
              { date: monthsAgo(1), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 302, active: true, progress: 70, assignedAt: daysAgo(5), activatedAt: daysAgo(4), status: "active", dpoRequired: false,
            history: [
              { date: daysAgo(5), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(4), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 15,
    name: "Дмитрий Волков",
    lastName: "ВОЛКОВ", firstName: "ДМИТРИЙ", middleName: "ЕВГЕНЬЕВИЧ",
    phone: "+7 (913) 112-23-34",
    position: "Руководитель группы",
    email: "d.volkov@stroigrupp.ru",
    initials: "ДВ",
    organization: "АО «СтройГрупп»",
    clientOrganizationId: 2,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 6,
        groupName: "ОТ-2025/03",
        assignments: [
          {
            courseId: 301, active: true, progress: 25, assignedAt: monthsAgo(1), activatedAt: daysAgo(10), status: "active", dpoRequired: false,
            history: [
              { date: monthsAgo(1), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(10), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          { courseId: 302, active: false, progress: 0, assignedAt: daysAgo(5), status: "pending", dpoRequired: false },
        ],
      },
    ],
  },

  // ─── Группа 7: ПБ-2025/03 — ООО «ГазПромСервис» ─────────────────────────
  {
    id: 16,
    name: "Игорь Федоров",
    lastName: "ФЕДОРОВ", firstName: "ИГОРЬ", middleName: "СТАНИСЛАВОВИЧ",
    phone: "+7 (914) 223-34-45",
    position: "Главный инженер",
    email: "i.fedorov@gazpromservis.ru",
    initials: "ИФ",
    organization: "ООО «ГазПромСервис»",
    clientOrganizationId: 6,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 7,
        groupName: "ПБ-2025/03",
        assignments: [
          {
            courseId: 101, active: true, progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: monthsAgo(1), status: "certified", testScore: 97, testPassedAt: monthsAgo(1), dpoRequired: true,
            history: [
              { date: monthsAgo(2), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Выдано удостоверение", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 103, active: true, progress: 85, assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), status: "active", dpoRequired: true,
            history: [
              { date: monthsAgo(1), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 17,
    name: "Юлия Новикова",
    lastName: "НОВИКОВА", firstName: "ЮЛИЯ", middleName: "РОМАНОВНА",
    phone: "+7 (915) 334-45-56",
    position: "Инженер ПБ",
    email: "yu.novikova@gazpromservis.ru",
    initials: "ЮН",
    organization: "ООО «ГазПромСервис»",
    clientOrganizationId: 6,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 7,
        groupName: "ПБ-2025/03",
        assignments: [
          {
            courseId: 101, active: true, progress: 72, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), status: "active", dpoRequired: true,
            history: [
              { date: monthsAgo(2), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          { courseId: 103, active: false, progress: 0, assignedAt: monthsAgo(1), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },
  {
    id: 18,
    name: "Павел Семёнов",
    lastName: "СЕМЁНОВ", firstName: "ПАВЕЛ", middleName: "АРТУРОВИЧ",
    phone: "+7 (916) 445-56-67",
    position: "Начальник отдела ПБ",
    email: "p.semenov@gazpromservis.ru",
    initials: "ПС",
    organization: "ООО «ГазПромСервис»",
    clientOrganizationId: 6,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 7,
        groupName: "ПБ-2025/03",
        assignments: [
          {
            courseId: 101, active: true, progress: 100, assignedAt: monthsAgo(2), activatedAt: monthsAgo(2), completedAt: monthsAgo(1), status: "certified", testScore: 82, testPassedAt: monthsAgo(1), dpoRequired: true,
            history: [
              { date: monthsAgo(2), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(2), action: "Курс активирован", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Выдано удостоверение", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 103, active: true, progress: 50, assignedAt: monthsAgo(1), activatedAt: monthsAgo(1), status: "active", dpoRequired: true,
            history: [
              { date: monthsAgo(1), action: "Курс назначен", by: "Иванов И.И." },
              { date: monthsAgo(1), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 19,
    name: "Марина Титова",
    lastName: "ТИТОВА", firstName: "МАРИНА", middleName: "ОЛЕГОВНА",
    phone: "+7 (917) 556-67-78",
    position: "Специалист ПБ",
    email: "m.titova@gazpromservis.ru",
    initials: "МТ",
    organization: "ООО «ГазПромСервис»",
    clientOrganizationId: 6,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 7,
        groupName: "ПБ-2025/03",
        assignments: [
          { courseId: 101, active: false, progress: 0, assignedAt: monthsAgo(2), status: "pending", dpoRequired: true },
          { courseId: 103, active: false, progress: 0, assignedAt: monthsAgo(1), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },

  // ─── Группа 8: ЭНБ-2025/02 — ГУП «Энергосеть» ───────────────────────────
  {
    id: 20,
    name: "Константин Жуков",
    lastName: "ЖУКОВ", firstName: "КОНСТАНТИН", middleName: "МИХАЙЛОВИЧ",
    phone: "+7 (918) 667-78-89",
    position: "Электрик",
    email: "k.zhukov@energoset.ru",
    initials: "КЖ",
    organization: "ГУП «Энергосеть»",
    clientOrganizationId: 3,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 8,
        groupName: "ЭНБ-2025/02",
        assignments: [
          {
            courseId: 201, active: true, progress: 40, assignedAt: daysAgo(20), activatedAt: daysAgo(18), status: "active", dpoRequired: true,
            history: [
              { date: daysAgo(20), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(18), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          { courseId: 202, active: false, progress: 0, assignedAt: daysAgo(5), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },
  {
    id: 21,
    name: "Анастасия Громова",
    lastName: "ГРОМОВА", firstName: "АНАСТАСИЯ", middleName: "ПЕТРОВНА",
    phone: "+7 (919) 778-89-90",
    position: "Инженер-электрик",
    email: "a.gromova@energoset.ru",
    initials: "АГ",
    organization: "ГУП «Энергосеть»",
    clientOrganizationId: 3,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 8,
        groupName: "ЭНБ-2025/02",
        assignments: [
          {
            courseId: 201, active: true, progress: 65, assignedAt: daysAgo(20), activatedAt: daysAgo(19), status: "active", dpoRequired: true,
            history: [
              { date: daysAgo(20), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(19), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 202, active: true, progress: 20, assignedAt: daysAgo(5), activatedAt: daysAgo(4), status: "active", dpoRequired: true,
            history: [
              { date: daysAgo(5), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(4), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 27,
    name: "Фёдор Козырев",
    lastName: "КОЗЫРЕВ", firstName: "ФЁДОР", middleName: "АЛЕКСЕЕВИЧ",
    phone: "+7 (920) 889-90-01",
    position: "Старший электромонтёр",
    email: "f.kozyrev@energoset.ru",
    initials: "ФК",
    organization: "ГУП «Энергосеть»",
    clientOrganizationId: 3,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 8,
        groupName: "ЭНБ-2025/02",
        assignments: [
          {
            courseId: 201, active: true, progress: 100, assignedAt: daysAgo(25), activatedAt: daysAgo(24), completedAt: daysAgo(5), status: "certified", testScore: 91, testPassedAt: daysAgo(5), dpoRequired: true,
            history: [
              { date: daysAgo(25), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(24), action: "Курс активирован", by: "Иванов И.И." },
              { date: daysAgo(5), action: "Выдано удостоверение", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 202, active: true, progress: 85, assignedAt: daysAgo(15), activatedAt: daysAgo(14), status: "active", dpoRequired: true,
            history: [
              { date: daysAgo(15), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(14), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
        ],
      },
    ],
  },
  {
    id: 28,
    name: "Нина Лазарева",
    lastName: "ЛАЗАРЕВА", firstName: "НИНА", middleName: "БОРИСОВНА",
    phone: "+7 (921) 990-01-12",
    position: "Диспетчер",
    email: "n.lazareva@energoset.ru",
    initials: "НЛ",
    organization: "ГУП «Энергосеть»",
    clientOrganizationId: 3,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 8,
        groupName: "ЭНБ-2025/02",
        assignments: [
          {
            courseId: 201, active: true, progress: 15, assignedAt: daysAgo(8), activatedAt: daysAgo(6), status: "active", dpoRequired: true,
            history: [
              { date: daysAgo(8), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(6), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          { courseId: 202, active: false, progress: 0, assignedAt: daysAgo(3), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },

  // ─── Группа 9: ОТ-2026/01 — ЗАО «РосТехМонтаж» ─────────────────────────
  {
    id: 29,
    name: "Георгий Кириллов",
    lastName: "КИРИЛЛОВ", firstName: "ГЕОРГИЙ", middleName: "АНАТОЛЬЕВИЧ",
    phone: "+7 (922) 101-12-23",
    position: "Начальник по ОТ",
    email: "g.kirillov@rostexmontazh.ru",
    initials: "ГК",
    organization: "ЗАО «РосТехМонтаж»",
    clientOrganizationId: 7,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 9,
        groupName: "ОТ-2026/01",
        assignments: [
          {
            courseId: 301, active: true, progress: 100, assignedAt: daysAgo(45), activatedAt: daysAgo(44), completedAt: daysAgo(10), status: "completed", testScore: 90, testPassedAt: daysAgo(10), dpoRequired: false,
            history: [
              { date: daysAgo(45), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(44), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 303, active: true, progress: 75, assignedAt: daysAgo(30), activatedAt: daysAgo(29), status: "active", dpoRequired: false,
            history: [
              { date: daysAgo(30), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(29), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          { courseId: 304, active: false, progress: 0, assignedAt: daysAgo(10), status: "pending", dpoRequired: false },
        ],
      },
    ],
  },
  {
    id: 30,
    name: "Оксана Крылова",
    lastName: "КРЫЛОВА", firstName: "ОКСАНА", middleName: "ИГОРЕВНА",
    phone: "+7 (923) 212-23-34",
    position: "Специалист по ОТ",
    email: "o.krylova@rostexmontazh.ru",
    initials: "ОК",
    organization: "ЗАО «РосТехМонтаж»",
    clientOrganizationId: 7,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 9,
        groupName: "ОТ-2026/01",
        assignments: [
          {
            courseId: 301, active: true, progress: 100, assignedAt: daysAgo(45), activatedAt: daysAgo(44), completedAt: daysAgo(8), status: "completed", testScore: 75, testPassedAt: daysAgo(8), dpoRequired: false,
            history: [
              { date: daysAgo(45), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(44), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          {
            courseId: 303, active: true, progress: 50, assignedAt: daysAgo(30), activatedAt: daysAgo(28), status: "active", dpoRequired: false,
            history: [
              { date: daysAgo(30), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(28), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          { courseId: 304, active: false, progress: 0, assignedAt: daysAgo(10), status: "pending", dpoRequired: false },
        ],
      },
    ],
  },
  {
    id: 31,
    name: "Борис Шевченко",
    lastName: "ШЕВЧЕНКО", firstName: "БОРИС", middleName: "ЛЕОНИДОВИЧ",
    phone: "+7 (924) 323-34-45",
    position: "Монтажник",
    email: "b.shevchenko@rostexmontazh.ru",
    initials: "БШ",
    organization: "ЗАО «РосТехМонтаж»",
    clientOrganizationId: 7,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 9,
        groupName: "ОТ-2026/01",
        assignments: [
          {
            courseId: 301, active: true, progress: 30, assignedAt: daysAgo(45), activatedAt: daysAgo(40), status: "active", dpoRequired: false,
            history: [
              { date: daysAgo(45), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(40), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          { courseId: 303, active: false, progress: 0, assignedAt: daysAgo(30), status: "pending", dpoRequired: false },
          { courseId: 304, active: false, progress: 0, assignedAt: daysAgo(10), status: "pending", dpoRequired: false },
        ],
      },
    ],
  },
  {
    id: 32,
    name: "Валентина Мельник",
    lastName: "МЕЛЬНИК", firstName: "ВАЛЕНТИНА", middleName: "ИВАНОВНА",
    phone: "+7 (925) 434-45-56",
    position: "Бухгалтер",
    email: "v.melnik@rostexmontazh.ru",
    initials: "ВМ",
    organization: "ЗАО «РосТехМонтаж»",
    clientOrganizationId: 7,
    role: "Наблюдатель",
    assignments: [],
    enrollments: [
      {
        groupId: 9,
        groupName: "ОТ-2026/01",
        assignments: [
          { courseId: 301, active: false, progress: 0, assignedAt: daysAgo(7), status: "pending", dpoRequired: false },
          { courseId: 303, active: false, progress: 0, assignedAt: daysAgo(7), status: "pending", dpoRequired: false },
          { courseId: 304, active: false, progress: 0, assignedAt: daysAgo(7), status: "pending", dpoRequired: false },
        ],
      },
    ],
  },

  // ─── Группа 10: ПБ-2026/02 — ООО «ТехноПром» (формируется) ──────────────
  {
    id: 33,
    name: "Николай Аверин",
    lastName: "АВЕРИН", firstName: "НИКОЛАЙ", middleName: "СТЕПАНОВИЧ",
    phone: "+7 (926) 545-56-67",
    position: "Директор по производству",
    email: "n.averin@technoprom.ru",
    initials: "НА",
    organization: "ООО «ТехноПром»",
    clientOrganizationId: 1,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 10,
        groupName: "ПБ-2026/02",
        assignments: [
          { courseId: 101, active: false, progress: 0, assignedAt: daysAgo(3), status: "pending", dpoRequired: true },
          { courseId: 102, active: false, progress: 0, assignedAt: daysAgo(3), status: "pending", dpoRequired: true },
          { courseId: 103, active: false, progress: 0, assignedAt: daysAgo(3), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },
  {
    id: 34,
    name: "Екатерина Власова",
    lastName: "ВЛАСОВА", firstName: "ЕКАТЕРИНА", middleName: "СЕРГЕЕВНА",
    phone: "+7 (927) 656-67-78",
    position: "Инженер по ПБ",
    email: "e.vlasova@technoprom.ru",
    initials: "ЕВ",
    organization: "ООО «ТехноПром»",
    clientOrganizationId: 1,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 10,
        groupName: "ПБ-2026/02",
        assignments: [
          { courseId: 101, active: false, progress: 0, assignedAt: daysAgo(3), status: "pending", dpoRequired: true },
          { courseId: 102, active: false, progress: 0, assignedAt: daysAgo(3), status: "pending", dpoRequired: true },
          { courseId: 103, active: false, progress: 0, assignedAt: daysAgo(3), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },
  {
    id: 35,
    name: "Степан Чернов",
    lastName: "ЧЕРНОВ", firstName: "СТЕПАН", middleName: "ВЛАДИМИРОВИЧ",
    phone: "+7 (928) 767-78-89",
    position: "Слесарь-ремонтник",
    email: "s.chernov@technoprom.ru",
    initials: "СЧ",
    organization: "ООО «ТехноПром»",
    clientOrganizationId: 1,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 10,
        groupName: "ПБ-2026/02",
        assignments: [
          { courseId: 101, active: false, progress: 0, assignedAt: daysAgo(3), status: "pending", dpoRequired: true },
          { courseId: 102, active: false, progress: 0, assignedAt: daysAgo(3), status: "pending", dpoRequired: true },
          { courseId: 103, active: false, progress: 0, assignedAt: daysAgo(3), status: "pending", dpoRequired: true },
        ],
      },
    ],
  },

  // ─── Слушатель без группы (эксперт) ──────────────────────────────────────
  {
    id: 22,
    name: "Сергей Эксперт",
    lastName: "ЭКСПЕРТ", firstName: "СЕРГЕЙ", middleName: "ПЕТРОВИЧ",
    phone: "+7 (929) 878-89-90",
    position: "Эксперт",
    email: "s.expert@expertpb.ru",
    initials: "СЭ",
    organization: "ООО «ЭкспертПБ»",
    clientOrganizationId: 5,
    role: "Студент",
    assignments: [],
    enrollments: [
      {
        groupId: 5,
        groupName: "ЭПБ-2026/01",
        assignments: [
          {
            courseId: 401, active: true, progress: 20, assignedAt: daysAgo(10), activatedAt: daysAgo(8), status: "active", dpoRequired: false,
            history: [
              { date: daysAgo(10), action: "Курс назначен", by: "Иванов И.И." },
              { date: daysAgo(8), action: "Курс активирован", by: "Иванов И.И." },
            ],
          },
          { courseId: 402, active: false, progress: 0, assignedAt: daysAgo(3), status: "pending", dpoRequired: false },
        ],
      },
    ],
  },
];

// ─── Системные пользователи (для авторизации) ─────────────────────────────────
// API: GET /api/system-users → SystemUser[]

export const DEFAULT_SYSTEM_USERS: SystemUser[] = [
  { id: 1, lastName: "ИВАНОВ",   firstName: "ИВАН",      middleName: "ИВАНОВИЧ",   email: "admin@isp.ru",           role: "Администратор",    department: "",                    password: "admin123",   status: "active", registeredAt: "09.02.2026" },
  { id: 2, lastName: "ПЕТРОВ",   firstName: "ПЁТР",      middleName: "ПЕТРОВИЧ",   email: "super@isp.ru",           role: "Суперадмин",       department: "",                    password: "super123",   status: "active", registeredAt: "09.02.2026" },
  { id: 3, lastName: "СИДОРОВА", firstName: "АННА",      middleName: "ОЛЕГОВНА",   email: "manager@isp.ru",         role: "Менеджер",         department: "Отдел продаж",        password: "manager123", status: "active", registeredAt: "09.02.2026" },
  { id: 4, lastName: "КОЗЛОВ",   firstName: "АНТОН",     middleName: "ВИТАЛЬЕВИЧ", email: "student@isp.ru",         role: "Слушатель",        department: "",                    password: "student123", status: "active", registeredAt: "09.02.2026" },
  { id: 5, lastName: "ВОРОНОВ",  firstName: "КОНСТАНТИН",middleName: "АЛЕКСЕЕВИЧ", email: "sales@isp.ru",           role: "Менеджер продаж",  department: "Отдел продаж",        password: "sales123",   status: "active", registeredAt: "10.01.2025" },
  { id: 6, lastName: "СИДОРОВА", firstName: "ЕЛЕНА",     middleName: "ВИКТОРОВНА", email: "support@isp.ru",         role: "Специалист ТП",    department: "Техническая поддержка", password: "support123", status: "active", registeredAt: "15.03.2025" },
  { id: 7, lastName: "ЭКСПЕРТ",  firstName: "СЕРГЕЙ",    middleName: "ПЕТРОВИЧ",   email: "s.expert@expertpb.ru",   role: "Слушатель",        department: "Слушатели",           password: "expert123",  status: "active", registeredAt: "24.04.2026" },
];
