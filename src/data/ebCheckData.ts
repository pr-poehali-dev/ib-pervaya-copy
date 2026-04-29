export type EbGroup = "II" | "III до 1000В" | "III до и выше 1000В" | "IV" | "V";

export type PersonnelCategory =
  | "административно-технический"
  | "диспетчерский"
  | "оперативный"
  | "оперативно-ремонтный"
  | "ремонтный"
  | "вспомогательный";

export type NtdItem = "ПУЭ" | "ПТБ" | "ПТЭ" | "ППБ" | "Другие";

export type CommissionMember = {
  id: number;
  fio: string;
  position: string;
  ebGroup: EbGroup;
  isFromSdo: boolean;
  sdoUserId?: number;
};

export type Commission = {
  id: number;
  orgId: number;
  name: string;
  chairman: CommissionMember;
  members: CommissionMember[];
  isActive: boolean;
  createdAt: string;
};

export type EbOrganization = {
  id: number;
  name: string;
  inn: string;
};

export type CheckCandidate = {
  id: number;
  fio: string;
  workplace: string;
  position: string;
  category: PersonnelCategory;
  prevDate: string;
  prevGroup: EbGroup;
  prevGrade: string;
  sdoUserId?: number;
};

export type CandidateResult = {
  candidateId: number;
  tech: string;
  safety: string;
  fire: string;
  other: string;
  overall: string;
};

export type CheckProtocol = {
  id: string;
  status: "draft" | "approved";
  createdAt: string;
  approvedAt?: string;
  commissionId: number;
  commissionName: string;
  orgId: number;
  orgName: string;
  verifyDate: string;
  reason: "очередная" | "первичная" | "внеочередная";
  reasonBasis?: string;
  ntd: NtdItem[];
  candidates: CheckCandidate[];
  results: CandidateResult[];
  finalGroup: EbGroup;
  voltage: "до 1000 В" | "до и свыше 1000 В" | "не применяется";
  probationDays: number;
  nextVerifyDate: string;
};

export const MOCK_EB_ORGS: EbOrganization[] = [
  { id: 1, name: "ООО «ТехноПром»", inn: "7701234567" },
  { id: 2, name: "АО «СтройГрупп»", inn: "7702345678" },
  { id: 3, name: "ПАО «ЭнергоСервис»", inn: "7703456789" },
];

export const MOCK_SDO_MEMBERS: CommissionMember[] = [
  { id: 101, fio: "Иванов Иван Иванович", position: "Главный энергетик", ebGroup: "V", isFromSdo: true, sdoUserId: 1 },
  { id: 102, fio: "Петров Пётр Петрович", position: "Начальник службы ЭБ", ebGroup: "IV", isFromSdo: true, sdoUserId: 2 },
  { id: 103, fio: "Сидоров Сергей Сергеевич", position: "Инженер-энергетик", ebGroup: "IV", isFromSdo: true, sdoUserId: 3 },
  { id: 104, fio: "Новикова Наталья Николаевна", position: "Начальник ПТО", ebGroup: "IV", isFromSdo: true, sdoUserId: 4 },
  { id: 105, fio: "Козлов Константин Константинович", position: "Ведущий инженер", ebGroup: "V", isFromSdo: false },
  { id: 106, fio: "Морозов Михаил Михайлович", position: "Инженер по ОТ", ebGroup: "III до и выше 1000В", isFromSdo: false },
  { id: 107, fio: "Волков Виктор Васильевич", position: "Электромонтёр 6 разр.", ebGroup: "IV", isFromSdo: false },
  { id: 108, fio: "Зайцев Захар Зиновьевич", position: "Мастер электроучастка", ebGroup: "V", isFromSdo: false },
];

export const MOCK_COMMISSIONS: Commission[] = [
  {
    id: 1, orgId: 1,
    name: "Центральная комиссия по проверке знаний",
    chairman: MOCK_SDO_MEMBERS[0],
    members: [MOCK_SDO_MEMBERS[1], MOCK_SDO_MEMBERS[2], MOCK_SDO_MEMBERS[4], MOCK_SDO_MEMBERS[5]],
    isActive: true, createdAt: "10.01.2026",
  },
  {
    id: 2, orgId: 1,
    name: "Комиссия подразделения №2",
    chairman: MOCK_SDO_MEMBERS[1],
    members: [MOCK_SDO_MEMBERS[2], MOCK_SDO_MEMBERS[6], MOCK_SDO_MEMBERS[7]],
    isActive: true, createdAt: "15.02.2026",
  },
  {
    id: 3, orgId: 2,
    name: "Комиссия по проверке знаний АО «СтройГрупп»",
    chairman: MOCK_SDO_MEMBERS[3],
    members: [MOCK_SDO_MEMBERS[4], MOCK_SDO_MEMBERS[5], MOCK_SDO_MEMBERS[6]],
    isActive: false, createdAt: "20.03.2026",
  },
  {
    id: 4, orgId: 3,
    name: "Постоянно действующая комиссия ПАО «ЭнергоСервис»",
    chairman: MOCK_SDO_MEMBERS[7],
    members: [MOCK_SDO_MEMBERS[0], MOCK_SDO_MEMBERS[2], MOCK_SDO_MEMBERS[5]],
    isActive: true, createdAt: "05.04.2026",
  },
];

export const MOCK_CANDIDATES: CheckCandidate[] = [
  { id: 1, fio: "Чирков Александр Михайлович", workplace: "ООО «ТехноПром»", position: "Инженер по ПБ", category: "административно-технический", prevDate: "2025-01-19", prevGroup: "III до и выше 1000В", prevGrade: "удовл.", sdoUserId: 5 },
  { id: 2, fio: "Кузнецова Елена Викторовна", workplace: "ООО «ТехноПром»", position: "Оперативный диспетчер", category: "диспетчерский", prevDate: "2024-11-05", prevGroup: "IV", prevGrade: "хорошо", sdoUserId: 6 },
  { id: 3, fio: "Смирнов Дмитрий Алексеевич", workplace: "ООО «ТехноПром»", position: "Электромонтёр", category: "ремонтный", prevDate: "2023-09-10", prevGroup: "III до 1000В", prevGrade: "отл.", sdoUserId: 7 },
];

export const MOCK_PROTOCOLS: CheckProtocol[] = [
  {
    id: "ЭБ-2026-001", status: "approved", createdAt: "15.04.2026", approvedAt: "15.04.2026",
    commissionId: 1, commissionName: "Центральная комиссия по проверке знаний",
    orgId: 1, orgName: "ООО «ТехноПром»",
    verifyDate: "2026-04-15", reason: "очередная",
    ntd: ["ПУЭ", "ПТБ", "ПТЭ"],
    candidates: [MOCK_CANDIDATES[0], MOCK_CANDIDATES[1]],
    results: [
      { candidateId: 1, tech: "хорошо", safety: "хорошо", fire: "удовл.", other: "хорошо", overall: "хорошо" },
      { candidateId: 2, tech: "отл.", safety: "хорошо", fire: "хорошо", other: "отл.", overall: "хорошо" },
    ],
    finalGroup: "IV", voltage: "до и свыше 1000 В", probationDays: 12, nextVerifyDate: "2027-04-15",
  },
  {
    id: "ЭБ-2026-002", status: "draft", createdAt: "28.04.2026",
    commissionId: 2, commissionName: "Комиссия подразделения №2",
    orgId: 1, orgName: "ООО «ТехноПром»",
    verifyDate: "2026-05-05", reason: "первичная",
    ntd: ["ПУЭ", "ПТБ", "ПТЭ", "ППБ"],
    candidates: [MOCK_CANDIDATES[2]],
    results: [],
    finalGroup: "III до 1000В", voltage: "до 1000 В", probationDays: 0, nextVerifyDate: "2027-05-05",
  },
];
