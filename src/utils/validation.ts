/** Проверяет ИНН: 10 цифр (юрлицо) или 12 цифр (физлицо) */
export function validateInn(inn: string): { valid: boolean; error?: string } {
  if (!inn) return { valid: true }; // пустое — не ошибка (поле необязательное)
  const digits = inn.replace(/\D/g, "");
  if (digits !== inn) return { valid: false, error: "ИНН должен содержать только цифры" };
  if (digits.length !== 10 && digits.length !== 12) {
    return { valid: false, error: "ИНН должен содержать 10 (юрлицо) или 12 (физлицо) цифр" };
  }
  return { valid: true };
}

/** Возвращает строку ошибки или undefined */
export function innError(inn: string): string | undefined {
  return validateInn(inn).error;
}
