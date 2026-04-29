import { Commission, CommissionMember, EbGroup } from "@/data/ebCheckData";

export const EB_GROUPS: EbGroup[] = ["II", "III до 1000В", "III до и выше 1000В", "IV", "V"];

export function initials(fio: string) {
  return fio.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

export type MemberDraft = {
  tmpId: string;
  fio: string;
  position: string;
  ebGroup: EbGroup;
  isFromSdo: boolean;
  sdoUserId?: number;
  realId?: number;
};

export type CommissionForm = {
  name: string;
  chairman: MemberDraft;
  members: MemberDraft[];
};

export function draftFromMember(m: CommissionMember): MemberDraft {
  return { tmpId: String(m.id), fio: m.fio, position: m.position, ebGroup: m.ebGroup, isFromSdo: m.isFromSdo, sdoUserId: m.sdoUserId, realId: m.id };
}

export function emptyMember(): MemberDraft {
  return { tmpId: String(Date.now() + Math.random()), fio: "", position: "", ebGroup: "IV", isFromSdo: false };
}

export function emptyForm(): CommissionForm {
  return { name: "", chairman: emptyMember(), members: [emptyMember(), emptyMember(), emptyMember()] };
}

export function formFromCommission(c: Commission): CommissionForm {
  return { name: c.name, chairman: draftFromMember(c.chairman), members: c.members.map(draftFromMember) };
}
