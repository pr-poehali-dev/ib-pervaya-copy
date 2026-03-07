export type OrgType = "Юридическое лицо" | "ИП" | "Физическое лицо";
export type OpfType = "ООО" | "АО" | "ПАО" | "ГБУ" | "ФГБУ" | "ИП";
export type ActivePanel = null | "org" | "users" | "email";

export interface OrgData {
  type: OrgType;
  opf: OpfType;
  name: string;
  externalId: string;
  inn: string;
  licenseNo: string;
  licenseDate: string;
}

export interface SystemUser {
  id: number;
  lastName: string;
  firstName: string;
  middleName: string;
  email: string;
  role: string;
  department: string;
  password: string;
  status: "active" | "inactive";
  registeredAt: string;
}

export interface EmailSettings {
  hrEmail: string;
  senderEmail: string;
  copyToAdmin: boolean;
  smtpHost: string;
  smtpPort: string;
  smtpUser: string;
  smtpPassword: string;
  smtpFromEmail: string;
  smtpTimeout: string;
  useTls: boolean;
  useSsl: boolean;
}

export const defaultOrg: OrgData = {
  type: "Юридическое лицо",
  opf: "ООО",
  name: 'ООО "УЦ ИСП"',
  externalId: "d2e6fe38-5531-4384-be5a-e93bf83a8c83",
  inn: "9000000001",
  licenseNo: "9999",
  licenseDate: "09.02.2026",
};

export const defaultUsers: SystemUser[] = [
  {
    id: 1,
    lastName: "ИВАНОВ",
    firstName: "ИВАН",
    middleName: "ИВАНОВИЧ",
    email: "admin@isp.ru",
    role: "Администратор",
    department: "",
    password: "",
    status: "active",
    registeredAt: "09.02.2026",
  },
];

export const defaultEmailSettings: EmailSettings = {
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

export const orgTypes: OrgType[] = ["Юридическое лицо", "ИП", "Физическое лицо"];
export const opfTypes: OpfType[] = ["ООО", "АО", "ПАО", "ГБУ", "ФГБУ", "ИП"];
export const userRoles = ["Администратор", "Менеджер", "Преподаватель", "Наблюдатель"];

export const emailTemplates = [
  { id: "90days", title: "За 90 дней до истечения", desc: "Первое напоминание о плановой аттестации" },
  { id: "30days", title: "За 30 дней до истечения", desc: "Второе напоминание о плановой аттестации" },
  { id: "7days", title: "За 7 дней до истечения", desc: "Срочное напоминание об аттестации" },
  { id: "expired", title: "Истечение срока", desc: "Уведомление об истечении срока аттестации" },
];

export function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}
