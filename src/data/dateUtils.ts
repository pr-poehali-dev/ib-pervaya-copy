/**
 * Утилиты для работы с датами
 * Формат: DD.MM.YYYY
 */

export function fmt(d: Date): string {
  return `${String(d.getDate()).padStart(2, "0")}.${String(d.getMonth() + 1).padStart(2, "0")}.${d.getFullYear()}`;
}

export function daysAgo(n: number): string {
  const d = new Date(); d.setDate(d.getDate() - n); return fmt(d);
}

export function monthsAgo(n: number): string {
  const d = new Date(); d.setMonth(d.getMonth() - n); return fmt(d);
}

/** Сегодняшняя дата в формате DD.MM.YYYY */
export function today(): string {
  return fmt(new Date());
}
