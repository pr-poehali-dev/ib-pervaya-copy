/**
 * Утилиты и константы для чат-компонентов
 */

import type { ChatThreadStatus } from "@/types/chat";

// ─── Форматирование времени ───────────────────────────────────────────────────

/**
 * @param iso — ISO-строка даты
 * @param withSuffix — добавлять " назад" (по умолчанию false)
 */
export function formatRelativeTime(iso: string, withSuffix = false): string {
  const now = new Date();
  const date = new Date(iso);
  const diffMs = now.getTime() - date.getTime();
  const diffMin = Math.floor(diffMs / 60000);
  const diffH = Math.floor(diffMin / 60);
  const diffD = Math.floor(diffH / 24);

  const s = withSuffix ? " назад" : "";

  if (diffMin < 1) return "только что";
  if (diffMin < 60) return `${diffMin} мин${s}`;
  if (diffH < 24) return `${diffH} ч${s}`;
  if (diffD < 7) return `${diffD} д${s}`;
  return date.toLocaleDateString("ru-RU", { day: "numeric", month: "short" });
}

// ─── Роли пользователей ───────────────────────────────────────────────────────

export const ROLE_LABELS: Record<string, string> = {
  student:       "Слушатель",
  admin:         "Администратор",
  manager:       "Менеджер",
  sales_manager: "Менеджер продаж",
  superadmin:    "Суперадмин",
  support:       "Техподдержка",
};

// ─── Статусы тредов ───────────────────────────────────────────────────────────

export const STATUS_CONFIG: Record<ChatThreadStatus, { label: string; className: string }> = {
  new:         { label: "Новое",    className: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-400" },
  in_progress: { label: "В работе", className: "bg-blue-100 text-blue-700 dark:bg-blue-900/40 dark:text-blue-400" },
  resolved:    { label: "Решено",   className: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-400" },
};
