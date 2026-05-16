/**
 * ТИПЫ ДОМЕННОЙ МОДЕЛИ — Администрирование
 * Данные (моки) — в src/data/
 */

// ─── Курсы ────────────────────────────────────────────────────────────────────

export type CourseStatus = "pending" | "active" | "completed" | "certified";

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

export type DirectionCourse = {
  id: number;
  code: string;
  title: string;
  hours?: number;
  hasTest?: boolean;
  dpoAvailable?: boolean;
  finalTestPassScore?: number;
  finalTestTime?: number;
};

export type CourseDirection = {
  id: number;
  title: string;
  subscriptionType: SubscriptionType;
  courses: DirectionCourse[];
};

export type MaterialStatus = "pending_approval" | "approved" | "rejected";

export type MaterialType = "lecture" | "presentation" | "video" | "audio" | "other";

export type CourseMaterial = {
  id: number;
  tenantId: number;
  courseId?: number;
  tenantCourseId?: number;
  courseTitle: string;
  title: string;
  type: MaterialType;
  ext: string;
  url: string;
  size?: string;
  status: MaterialStatus;
  rejectionReason?: string;
  uploadedAt: string;
  approvedAt?: string;
};

export type TenantCourseMaterial = {
  id: number;
  title: string;
  type: "video" | "lecture" | "presentation" | "audio";
  ext: string;
  duration?: string;
};

export type TenantCourseNtd = {
  id: number;
  title: string;
  ext: string;
};

export type TenantCourseTestMode = "adaptive" | "section" | "final";

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

export type SubscriptionType =
  | "industrial_safety"
  | "energy_safety"
  | "labor_protection"
  | "expert_pb"
  | "expert_gts"
  | "own_courses";

export type SubscriptionBalance = {
  tenantId?: number;
  type: SubscriptionType;
  label: string;
  total: number;
  used: number;
};

// ─── Тенанты ──────────────────────────────────────────────────────────────────

export type TenantType = "training_center" | "organization";

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
  allowedDirections: number[];
  subscriptions: SubscriptionBalance[];
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
  userIds: number[];
  courseIds: number[];
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
  activatedAt?: string;
  testScore: number;
  testPassedAt: string;
  status: CertificateStatus;
  issuedAt?: string;
  issuedBy?: string;
  certificateNumber?: string;
  tenantId: number;
};

// ─── STP-заявки ───────────────────────────────────────────────────────────────

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
  createdGroupId?: number;
  tenantId: number;
};

// ─── Вспомогательные функции ──────────────────────────────────────────────────

export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

export const SUBSCRIPTION_LABELS: Record<SubscriptionType, string> = {
  industrial_safety: "Промышленная безопасность",
  energy_safety:     "Энергобезопасность",
  labor_protection:  "Охрана труда",
  expert_pb:         "Подготовка экспертов ПБ",
  expert_gts:        "Подготовка экспертов ГТС",
  own_courses:       "Свои курсы",
};