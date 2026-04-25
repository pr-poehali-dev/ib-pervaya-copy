import type { Certificate, STPRequest } from "@/types/admin";

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
      { name: "Громов Виктор Алексеевич",  email: "gromov@gazhimtech.ru"   },
      { name: "Назарова Ирина Петровна",    email: "nazarova@gazhimtech.ru" },
      { name: "Попов Сергей Михайлович",    email: "popov@gazhimtech.ru"    },
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
      { name: "Андрей Лебедев",  email: "a.lebedev@company.ru"   },
      { name: "Ольга Михайлова", email: "o.mikhailova@company.ru" },
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
      { name: "Тимофеев Алексей Игоревич", email: "timofeev@himresurs.ru" },
      { name: "Семёнова Ольга Николаевна", email: "semenova@himresurs.ru" },
    ],
    receivedAt: daysAgo(2),
    tenantId: 1,
  },
];