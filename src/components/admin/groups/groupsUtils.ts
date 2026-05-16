import { User } from "@/components/admin/types";

export function today(): string {
  const d = new Date();
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export function getGroupStatus(members: User[]): string {
  if (members.length === 0) return "Не начато";
  const completed = members.filter((u) => u.assignments.length > 0 && u.assignments.every((a) => a.progress === 100));
  if (completed.length === members.length && members.length > 0) return "Завершено";
  if (members.some((u) => u.assignments.some((a) => a.active))) return "Обучается";
  return "Не начато";
}

export function getAvgProgress(members: User[]): number {
  const active = members.flatMap((u) => u.assignments.filter((a) => a.active));
  if (active.length === 0) return 0;
  return Math.round(active.reduce((s, a) => s + a.progress, 0) / active.length);
}