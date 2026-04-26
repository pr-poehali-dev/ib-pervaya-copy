/**
 * Утилиты для работы с паролями и буфером обмена
 */

export function generatePassword(): string {
  const chars = "abcdefghjkmnpqrstuvwxyzABCDEFGHJKMNPQRSTUVWXYZ23456789!@#$";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}

export function copyToClipboard(text: string): void {
  navigator.clipboard.writeText(text).catch(() => {});
}
