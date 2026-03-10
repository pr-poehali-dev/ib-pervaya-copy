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
  subscriptionsTotal: number;
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

export function generatePassword() {
  const chars = "ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789!@#$%";
  return Array.from({ length: 12 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
}