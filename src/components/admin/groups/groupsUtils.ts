import { User, CourseAssignment } from "@/components/admin/types";

export function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export function getMemberAssignments(user: User, groupId: number): CourseAssignment[] {
  return user.enrollments.find((e) => e.groupId === groupId)?.assignments ?? [];
}

export function getGroupStatus(members: User[], groupId: number): string {
  if (members.length === 0) return "Не начато";
  const allAssignments = members.map((u) => getMemberAssignments(u, groupId));
  const completed = members.filter((_, i) => {
    const assignments = allAssignments[i];
    return assignments.length > 0 && assignments.every((a) => a.progress === 100);
  });
  if (completed.length === members.length && members.length > 0) return "Завершено";
  if (allAssignments.some((assignments) => assignments.some((a) => a.active))) return "Обучается";
  return "Не начато";
}

export function getAvgProgress(members: User[], groupId: number): number {
  const active = members.flatMap((u) => getMemberAssignments(u, groupId).filter((a) => a.active));
  if (active.length === 0) return 0;
  return Math.round(active.reduce((s, a) => s + a.progress, 0) / active.length);
}