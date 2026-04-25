import type { OrgData, EmailSettings } from "@/types/settings";

// ─── Настройки организации ────────────────────────────────────────────────────
// API: GET /api/org → OrgData

export const DEFAULT_ORG: OrgData = {
  type: "Юридическое лицо",
  opf: "ООО",
  name: 'ООО "УЦ ИСП"',
  externalId: "d2e6fe38-5531-4384-be5a-e93bf83a8c83",
  inn: "9000000001",
  licenseNo: "9999",
  licenseDate: "09.02.2026",
  subscriptionsTotal: 100,
};

// ─── Настройки email ──────────────────────────────────────────────────────────
// API: GET /api/email-settings → EmailSettings

export const DEFAULT_EMAIL_SETTINGS: EmailSettings = {
  hrEmail: "gts@supmin.ru",
  senderEmail: "admin@supmin.ru",
  copyToAdmin: true,
  smtpHost: "smtp.yandex.ru",
  smtpPort: "587",
  smtpUser: "admin@supmin.ru",
  smtpPassword: "",
  smtpFromEmail: "admin@supmin.ru",
  smtpTimeout: "30",
  useTls: true,
  useSsl: false,
};

// ─── Справочники ──────────────────────────────────────────────────────────────

export const ORG_TYPES = ["Юридическое лицо", "ИП", "Физическое лицо"] as const;
export const OPF_TYPES = ["ООО", "АО", "ПАО", "ГБУ", "ФГБУ", "ИП"] as const;
export const USER_ROLES_SYSTEM = ["Администратор", "Менеджер", "Слушатель", "Наблюдатель"] as const;

// ─── Шаблоны email-уведомлений ────────────────────────────────────────────────

export const EMAIL_TEMPLATES = [
  { id: "90days",  title: "За 90 дней до истечения", desc: "Первое напоминание о плановой аттестации"  },
  { id: "30days",  title: "За 30 дней до истечения", desc: "Второе напоминание о плановой аттестации"  },
  { id: "7days",   title: "За 7 дней до истечения",  desc: "Срочное напоминание об аттестации"         },
  { id: "expired", title: "Истечение срока",          desc: "Уведомление об истечении срока аттестации" },
];

// ─── Стили (градиенты и цвета) ────────────────────────────────────────────────

export const GRADIENTS: string[] = [
  "from-violet-500 to-purple-700",
  "from-cyan-500 to-blue-600",
  "from-red-500 to-rose-700",
  "from-emerald-500 to-teal-600",
  "from-amber-500 to-orange-600",
  "from-indigo-500 to-blue-700",
];

export const USER_COLORS: string[] = [
  "from-violet-400 to-purple-600",
  "from-cyan-400 to-blue-500",
  "from-emerald-400 to-teal-500",
  "from-amber-400 to-orange-500",
];