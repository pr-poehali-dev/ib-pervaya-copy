import type { Tenant, ClientOrganization, TenantCourse, SubscriptionBalance } from "@/components/admin/types";

// ─── Вспомогательные функции дат ─────────────────────────────────────────────

function fmt(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return fmt(d);
}

function monthsAgo(n: number): string {
  const d = new Date(); d.setMonth(d.getMonth() - n); return fmt(d);
}

// ─── Организации-клиенты ──────────────────────────────────────────────────────
// API: GET /api/client-organizations → ClientOrganization[]

export const CLIENT_ORGANIZATIONS: ClientOrganization[] = [
  { id: 1, name: "ООО «ТехноПром»",    inn: "7701234567", contactPerson: "Сидоров А.В.", contactEmail: "sidorov@tehnoprom.ru",  createdAt: monthsAgo(6) },
  { id: 2, name: "АО «СтройГрупп»",    inn: "7702345678", contactPerson: "Белова Е.С.",  contactEmail: "belova@stroygrupp.ru", createdAt: monthsAgo(4) },
  { id: 3, name: "ГУП «Энергосеть»",   inn: "7703456789", contactPerson: "Морозов К.В.", contactEmail: "morozov@energoset.ru", createdAt: monthsAgo(3) },
  { id: 4, name: "ПАО «МеталлСервис»", inn: "7704567890", contactPerson: "Волков Д.П.",  contactEmail: "volkov@metallserv.ru", createdAt: monthsAgo(2) },
  { id: 5, name: "ООО «ГазХимТех»",    inn: "7705678901", contactPerson: "Орлов Н.А.",   contactEmail: "orlov@gazhimtech.ru",  createdAt: daysAgo(20)  },
  { id: 6, name: "ООО «ГазПромСервис»",inn: "7706789012", contactPerson: "Фёдоров И.К.", contactEmail: "fedorov@gazpromservis.ru", createdAt: monthsAgo(5) },
  { id: 7, name: "АО «ХимРесурс»",     inn: "7707890123", contactPerson: "Захаров В.Н.", contactEmail: "zaharov@himresurs.ru", createdAt: monthsAgo(3) },
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
      { type: "labor_protection", label: "Охрана труда", total: 5, used: 2 },
    ],
    createdAt: daysAgo(15),
  },
];

// ─── Балансы подписок ─────────────────────────────────────────────────────────
// API: GET /api/subscription-balances → SubscriptionBalance[]

export const SUBSCRIPTION_BALANCES: SubscriptionBalance[] = [
  { tenantId: 1, type: "industrial_safety", label: "Промышленная безопасность", total: 50, used: 12 },
  { tenantId: 1, type: "energy_safety",     label: "Энергобезопасность",        total: 30, used: 8  },
  { tenantId: 1, type: "labor_protection",  label: "Охрана труда",              total: 20, used: 5  },
  { tenantId: 1, type: "expert_pb",         label: "Подготовка экспертов ПБ",   total: 10, used: 2  },
  { tenantId: 1, type: "expert_gts",        label: "Подготовка экспертов ГТС",  total: 10, used: 1  },
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
      { id: 201, title: "ФЗ-197 «Трудовой кодекс РФ»",               ext: "PDF"  },
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
      { id: 111, title: "Лекция 1. Основы пожарной безопасности",      type: "lecture",      ext: "PDF" },
      { id: 112, title: "Лекция 2. Первичные средства пожаротушения",  type: "lecture",      ext: "PDF" },
      { id: 113, title: "Аудиолекция. Действия при обнаружении пожара",type: "audio",        ext: "MP3" },
      { id: 114, title: "Презентация. Эвакуационные пути и выходы",    type: "presentation", ext: "PPTX"},
    ],
    ntdFiles: [
      { id: 211, title: "ФЗ-69 «О пожарной безопасности»",            ext: "PDF" },
      { id: 212, title: "ПП РФ №1479 — Правила ПБ в РФ",             ext: "PDF" },
      { id: 213, title: "ГОСТ 12.1.004-91 — Пожарная безопасность",  ext: "PDF" },
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
      { id: 121, title: "Модуль 1. Законодательная база охраны труда",    type: "lecture",      ext: "PDF"  },
      { id: 122, title: "Модуль 2. Спецоценка условий труда",             type: "lecture",      ext: "PDF"  },
      { id: 123, title: "Видеокурс. Расследование несчастных случаев",    type: "video",        ext: "MP4"  },
      { id: 124, title: "Презентация. Обязательные инструктажи",          type: "presentation", ext: "PPTX" },
      { id: 125, title: "Лекция 5. Обеспечение СИЗ",                      type: "lecture",      ext: "DOCX" },
    ],
    ntdFiles: [
      { id: 221, title: "ТК РФ, Раздел X — Охрана труда",                 ext: "PDF" },
      { id: 222, title: "ФЗ-426 «О специальной оценке условий труда»",    ext: "PDF" },
      { id: 223, title: "Приказ Минтруда №772н — Единые типовые нормы СИЗ",ext: "PDF"},
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
