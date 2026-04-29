import { useState } from "react";
import {
  Commission, CommissionMember, EbOrganization, CheckProtocol,
  MOCK_COMMISSIONS, MOCK_EB_ORGS,
} from "@/data/ebCheckData";
import {
  MemberDraft, CommissionForm,
  draftFromMember, emptyMember, emptyForm, formFromCommission,
} from "./commissions-shared";
import OrgListView from "./OrgListView";
import CommissionListView from "./CommissionListView";
import CommissionFormView from "./CommissionFormView";

type View =
  | { type: "orgs" }
  | { type: "commissions"; orgId: number }
  | { type: "edit-commission"; orgId: number; commId: number | null };

export default function CommissionsPanel({ protocols = [] }: { protocols?: CheckProtocol[] }) {
  const [orgs, setOrgs] = useState<EbOrganization[]>(MOCK_EB_ORGS);
  const [commissions, setCommissions] = useState<Commission[]>(MOCK_COMMISSIONS);
  const [view, setView] = useState<View>({ type: "orgs" });

  const [orgForm, setOrgForm] = useState<{ name: string; inn: string } | null>(null);
  const [editingOrgId, setEditingOrgId] = useState<number | null>(null);
  const [commForm, setCommForm] = useState<CommissionForm | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"chairman" | string>("chairman");

  // ─── Org handlers ─────────────────────────────────────────────────────────
  function openOrgCreate() {
    setOrgForm({ name: "", inn: "" });
    setEditingOrgId(null);
    setFormErrors([]);
  }

  function openOrgEdit(org: EbOrganization) {
    setOrgForm({ name: org.name, inn: org.inn });
    setEditingOrgId(org.id);
    setFormErrors([]);
  }

  function saveOrg() {
    if (!orgForm) return;
    if (!orgForm.name.trim()) { setFormErrors(["Укажите наименование организации"]); return; }
    setFormErrors([]);
    if (editingOrgId) {
      setOrgs(orgs.map((o) => o.id === editingOrgId ? { ...o, ...orgForm } : o));
    } else {
      setOrgs([...orgs, { id: Date.now(), name: orgForm.name, inn: orgForm.inn }]);
    }
    setOrgForm(null);
    setEditingOrgId(null);
  }

  // ─── Commission handlers ───────────────────────────────────────────────────
  function openCommCreate(orgId: number) {
    setCommForm(emptyForm());
    setFormErrors([]);
    setView({ type: "edit-commission", orgId, commId: null });
  }

  function openCommEdit(orgId: number, c: Commission) {
    setCommForm(formFromCommission(c));
    setFormErrors([]);
    setView({ type: "edit-commission", orgId, commId: c.id });
  }

  function validateComm(f: CommissionForm): string[] {
    const errs: string[] = [];
    if (!f.name.trim()) errs.push("Укажите наименование комиссии");
    if (!f.chairman.fio.trim()) errs.push("Укажите председателя");
    if (f.members.length < 3) errs.push("Минимум 3 члена комиссии (п.58 Приказа № 796)");
    if (f.members.some((m) => !m.fio.trim())) errs.push("Заполните ФИО всех членов");
    const highGroup = f.members.filter((m) => m.ebGroup === "IV" || m.ebGroup === "V");
    if (highGroup.length < 1) errs.push("Хотя бы один член должен иметь группу ЭБ IV или V");
    return errs;
  }

  function saveCommission(orgId: number, commId: number | null) {
    if (!commForm) return;
    const errs = validateComm(commForm);
    if (errs.length) { setFormErrors(errs); return; }
    setFormErrors([]);

    const nextId = Math.max(0, ...commissions.map((c) => c.id)) + 1;

    const toMember = (d: MemberDraft, fallbackId: number): CommissionMember => ({
      id: d.realId ?? fallbackId,
      fio: d.fio, position: d.position, ebGroup: d.ebGroup,
      isFromSdo: d.isFromSdo, sdoUserId: d.sdoUserId,
    });

    if (commId) {
      setCommissions(commissions.map((c) => {
        if (c.id !== commId) return c;
        return {
          ...c,
          name: commForm.name,
          chairman: toMember(commForm.chairman, c.chairman.id),
          members: commForm.members.map((m, i) => toMember(m, c.members[i]?.id ?? 200 + i)),
        };
      }));
    } else {
      const newC: Commission = {
        id: nextId, orgId,
        name: commForm.name,
        chairman: toMember(commForm.chairman, nextId * 10),
        members: commForm.members.map((m, i) => toMember(m, nextId * 10 + i + 1)),
        isActive: true,
        createdAt: new Date().toLocaleDateString("ru-RU"),
      };
      setCommissions([...commissions, newC]);
    }
    setCommForm(null);
    setView({ type: "commissions", orgId });
  }

  function toggleCommActive(id: number) {
    setCommissions(commissions.map((c) => c.id === id ? { ...c, isActive: !c.isActive } : c));
  }

  // ─── Member / picker handlers ─────────────────────────────────────────────
  function updateMember(target: "chairman" | string, patch: Partial<MemberDraft>) {
    if (!commForm) return;
    if (target === "chairman") {
      setCommForm({ ...commForm, chairman: { ...commForm.chairman, ...patch } });
    } else {
      setCommForm({
        ...commForm,
        members: commForm.members.map((m) => m.tmpId === target ? { ...m, ...patch } : m),
      });
    }
  }

  function addMember() {
    if (!commForm) return;
    setCommForm({ ...commForm, members: [...commForm.members, emptyMember()] });
  }

  function removeMember(tmpId: string) {
    if (!commForm) return;
    setCommForm({ ...commForm, members: commForm.members.filter((m) => m.tmpId !== tmpId) });
  }

  function pickMember(m: CommissionMember) {
    updateMember(pickerTarget, { fio: m.fio, position: m.position, ebGroup: m.ebGroup, isFromSdo: m.isFromSdo, sdoUserId: m.sdoUserId, realId: m.id });
    setPickerOpen(false);
  }

  // ─── Render ───────────────────────────────────────────────────────────────
  if (view.type === "orgs") {
    return (
      <OrgListView
        orgs={orgs}
        commissions={commissions}
        protocols={protocols}
        orgForm={orgForm}
        editingOrgId={editingOrgId}
        formErrors={formErrors}
        onOrgCreate={openOrgCreate}
        onOrgEdit={openOrgEdit}
        onOrgFormChange={setOrgForm}
        onOrgSave={saveOrg}
        onOrgFormCancel={() => { setOrgForm(null); setFormErrors([]); }}
        onOpenOrg={(orgId) => setView({ type: "commissions", orgId })}
      />
    );
  }

  if (view.type === "commissions") {
    const org = orgs.find((o) => o.id === view.orgId)!;
    const orgComms = commissions.filter((c) => c.orgId === view.orgId);
    return (
      <CommissionListView
        org={org}
        orgComms={orgComms}
        protocols={protocols}
        onBack={() => setView({ type: "orgs" })}
        onCreateComm={() => openCommCreate(org.id)}
        onEditComm={(c) => openCommEdit(org.id, c)}
        onToggleActive={toggleCommActive}
      />
    );
  }

  if (view.type === "edit-commission" && commForm) {
    const org = orgs.find((o) => o.id === view.orgId)!;
    return (
      <CommissionFormView
        orgName={org.name}
        isNew={view.commId === null}
        commForm={commForm}
        formErrors={formErrors}
        pickerOpen={pickerOpen}
        pickerTarget={pickerTarget}
        onBack={() => { setCommForm(null); setFormErrors([]); setView({ type: "commissions", orgId: view.orgId }); }}
        onFormNameChange={(name) => setCommForm({ ...commForm, name })}
        onUpdateMember={updateMember}
        onAddMember={addMember}
        onRemoveMember={removeMember}
        onOpenPicker={(target) => { setPickerTarget(target); setPickerOpen(true); }}
        onClosePicker={() => setPickerOpen(false)}
        onPickMember={pickMember}
        onSave={() => saveCommission(view.orgId, view.commId)}
      />
    );
  }

  return null;
}
