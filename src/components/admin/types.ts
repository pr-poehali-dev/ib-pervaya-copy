/**
 * ТИПЫ ДАННЫХ
 * Данные (моки) — в src/data/mockData.ts
 */

// ─── Курсы ────────────────────────────────────────────────────────────────────

export type CourseStatus = "pending" | "active" | "completed" | "certified";

/** Статус курса тенанта, созданного самостоятельно */
export type TenantCourseStatus = "draft" | "pending_approval" | "approved" | "rejected";

export type CourseAssignment = {
  courseId: number;
  active: boolean;
  progress: number;
  assignedAt: string;
  activatedAt?: string;
  completedAt?: string;
  status: CourseStatus;
  testScore?: number;
  testPassedAt?: string;
  dpoRequired?: boolean;
};

export type Course = {
  id: number;
  title: string;
  category: string;
  emoji: string;
  lessons: number;
  duration: string;
};

/** Курс в рамках направления (группы курсов) */
export type DirectionCourse = {
  id: number;
  code: string;
  title: string;
  hours?: number;
  hasTest?: boolean;
  dpoAvailable?: boolean;
};

/** Группа курсов (направление) */
export type CourseDirection = {
  id: number;
  title: string;
  subscriptionType: SubscriptionType;
  courses: DirectionCourse[];
};

/** Статус файла материала курса */
export type MaterialStatus = "pending_approval" | "approved" | "rejected";

/** Тип файла материала */
export type MaterialType = "lecture" | "presentation" | "video" | "audio" | "other";

/** Материал курса, загруженный тенантом */
export type CourseMaterial = {
  id: number;
  tenantId: number;
  courseId?: number;       // ID платформенного курса (если привязан)
  tenantCourseId?: number; // ID своего курса (если привязан)
  courseTitle: string;     // Название для отображения
  title: string;           // Название файла/материала
  type: MaterialType;
  ext: string;             // PDF, MP4, MP3, PPTX
  url: string;             // URL файла
  size?: string;           // Размер файла (напр. "2.4 МБ")
  status: MaterialStatus;
  rejectionReason?: string;
  uploadedAt: string;
  approvedAt?: string;
};

/** Материал курса тенанта (облегчённый, для отображения) */
export type TenantCourseMaterial = {
  id: number;
  title: string;
  type: "video" | "lecture" | "presentation" | "audio";
  ext: string;
  duration?: string;
};

/** Документ НТД, прикреплённый к курсу тенанта */
export type TenantCourseNtd = {
  id: number;
  title: string;
  ext: string;
};

/** Режим теста в курсе тенанта */
export type TenantCourseTestMode = "adaptive" | "section" | "final";

/** Курс созданный тенантом самостоятельно */
export type TenantCourse = {
  id: number;
  tenantId: number;
  title: string;
  code?: string;
  hours?: number;
  hasTest?: boolean;
  dpoAvailable?: boolean;
  status: TenantCourseStatus;
  rejectionReason?: string;
  createdAt: string;
  approvedAt?: string;
  description?: string;
  testModes?: TenantCourseTestMode[];
  finalTestQuestions?: number;
  finalTestPassScore?: number;
  finalTestTime?: number;
  materials?: TenantCourseMaterial[];
  ntdFiles?: TenantCourseNtd[];
};

// ─── Подписки ─────────────────────────────────────────────────────────────────

/**
 * Тип подписки соответствует направлению курсов.
 * own_courses — для курсов созданных самим тенантом.
 */
export type SubscriptionType =
  | "industrial_safety"      // Промышленная безопасность
  | "energy_safety"          // Энергобезопасность
  | "labor_protection"       // Охрана труда
  | "expert_pb"              // Подготовка экспертов ПБ
  | "expert_gts"             // Подготовка экспертов ГТС
  | "own_courses";           // Свои курсы (УЦ/Орг)

/** Лимит и использование подписок конкретного типа */
export type SubscriptionBalance = {
  type: SubscriptionType;
  label: string;
  total: number;
  used: number;
};

// ─── Тенанты ──────────────────────────────────────────────────────────────────

export type TenantType = "training_center" | "organization";

/** Организация-клиент внутри УЦ */
export type ClientOrganization = {
  id: number;
  name: string;
  inn: string;
  contactPerson?: string;
  contactEmail?: string;
  contactPhone?: string;
  createdAt: string;
};

export type Tenant = {
  id: number;
  type: TenantType;
  name: string;
  inn: string;
  licenseNo?: string;
  licenseDate?: string;
  contactEmail: string;
  managerName?: string;
  status: "active" | "suspended" | "trial";
  /** Группы курсов, к которым суперадмин открыл доступ */
  allowedDirections: number[];
  /** Балансы подписок по каждому типу */
  subscriptions: SubscriptionBalance[];
  /** Организации-клиенты (только для УЦ) */
  clientOrganizations?: ClientOrganization[];
  createdAt: string;
};

// ─── Группы обучения ──────────────────────────────────────────────────────────

export type GroupStatus = "active" | "completed" | "forming";

export type Group = {
  id: number;
  name: string;
  tenantId: number;
  clientOrganizationId?: number;
  clientOrganizationName?: string;
  inn?: string;
  status: GroupStatus;
  createdAt: string;
  /** ID слушателей в группе */
  userIds: number[];
  /** Курсы назначенные всей группе */
  courseIds: number[];
  /** Создана из STP-заявки */
  fromStpRequestId?: number;
};

// ─── Пользователи ─────────────────────────────────────────────────────────────

export type User = {
  id: number;
  name: string;
  email: string;
  initials: string;
  group: string;
  groupId?: number;
  organization: string;
  clientOrganizationId?: number;
  role: string;
  assignments: CourseAssignment[];
};

// ─── Удостоверения ДПО ────────────────────────────────────────────────────────

export type CertificateStatus = "ready" | "issued";

export type Certificate = {
  id: number;
  userId: number;
  userName: string;
  userEmail: string;
  userOrganization?: string;
  courseId: number;
  courseTitle: string;
  courseCode?: string;
  courseHours?: number;
  testScore: number;
  testPassedAt: string;
  status: CertificateStatus;
  issuedAt?: string;
  issuedBy?: string;
  certificateNumber?: string;
  tenantId: number;
};

// ─── STP-заявки (API-интеграция) ──────────────────────────────────────────────

export type STPRequestStatus = "new" | "in_progress" | "accepted" | "rejected";

export type STPRequestParticipant = {
  name: string;
  email: string;
};

export type STPRequest = {
  id: number;
  externalId?: string;
  status: STPRequestStatus;
  organizationName: string;
  inn?: string;
  courseName: string;
  courseDirectionId?: number;
  participants: STPRequestParticipant[];
  receivedAt: string;
  acceptedAt?: string;
  /** ID группы, созданной при принятии заявки */
  createdGroupId?: number;
  tenantId: number;
};

// ─── Вспомогательные функции ─────────────────────────────────────────────────

export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export const SUBSCRIPTION_LABELS: Record<SubscriptionType, string> = {
  industrial_safety: "Промышленная безопасность",
  energy_safety: "Энергобезопасность",
  labor_protection: "Охрана труда",
  expert_pb: "Подготовка экспертов ПБ",
  expert_gts: "Подготовка экспертов ГТС",
  own_courses: "Свои курсы",
};

// ─── Реэкспорт данных из mockData для обратной совместимости ─────────────────

export {
  INITIAL_USERS as initialUsers,
  ALL_COURSES as allCourses,
  COURSE_DIRECTIONS as courseDirections,
  GROUPS as groups,
  ROLES as roles,
  GRADIENTS as gradients,
  USER_COLORS as userColors,
} from "@/data/mockData";