/**
 * ТИПЫ ДАННЫХ
 * Данные (моки) — в src/data/mockData.ts
 */

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
  organization: string;
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

export type CourseDirection = {
  id: number;
  title: string;
  courses: { id: number; code: string; title: string }[];
};

// ─── Вспомогательные функции ─────────────────────────────────────────────────

export function getInitials(name: string): string {
  const parts = name.trim().split(" ");
  if (parts.length >= 2) return (parts[0][0] + parts[1][0]).toUpperCase();
  return name.slice(0, 2).toUpperCase();
}

// ─── Реэкспорт данных из mockData для обратной совместимости ─────────────────
// Позволяет старым импортам вида `import { initialUsers } from "./types"` продолжать работать

export {
  INITIAL_USERS as initialUsers,
  ALL_COURSES as allCourses,
  COURSE_DIRECTIONS as courseDirections,
  GROUPS as groups,
  ROLES as roles,
  GRADIENTS as gradients,
  USER_COLORS as userColors,
} from "@/data/mockData";