import { CourseStatus } from "@/components/admin/types";

export default function UserStatusBadge({ status }: { status: CourseStatus }) {
  const map: Record<CourseStatus, { label: string; cls: string }> = {
    pending:   { label: "Ожидает активации",   cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
    active:    { label: "Идёт обучение",        cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
    completed: { label: "Обучение завершено",   cls: "bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300" },
    certified: { label: "Удостоверение выдано", cls: "bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300" },
  };
  const { label, cls } = map[status];
  return <span className={`px-2 py-0.5 rounded-md text-xs font-medium whitespace-nowrap ${cls}`}>{label}</span>;
}
