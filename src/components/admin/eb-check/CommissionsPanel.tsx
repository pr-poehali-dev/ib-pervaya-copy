import { useState } from "react";
import Icon from "@/components/ui/icon";
import {
  Commission, CommissionMember, EbGroup, EbOrganization,
  MOCK_COMMISSIONS, MOCK_EB_ORGS, MOCK_SDO_MEMBERS,
} from "@/data/ebCheckData";

const EB_GROUPS: EbGroup[] = ["II", "III до 1000В", "III до и выше 1000В", "IV", "V"];

function GroupBadge({ group }: { group: EbGroup }) {
  const cls =
    group === "V" ? "bg-purple-100 text-purple-700" :
    group === "IV" ? "bg-blue-100 text-blue-700" :
    group === "III до и выше 1000В" ? "bg-cyan-100 text-cyan-700" :
    group === "III до 1000В" ? "bg-teal-100 text-teal-700" :
    "bg-gray-100 text-gray-600";
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cls}`}>{group}</span>;
}

function initials(fio: string) {
  return fio.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

type MemberDraft = {
  tmpId: string;
  fio: string;
  position: string;
  ebGroup: EbGroup;
  isFromSdo: boolean;
  sdoUserId?: number;
  realId?: number;
};

type CommissionForm = {
  name: string;
  chairman: MemberDraft;
  members: MemberDraft[];
};

function draftFromMember(m: CommissionMember): MemberDraft {
  return { tmpId: String(m.id), fio: m.fio, position: m.position, ebGroup: m.ebGroup, isFromSdo: m.isFromSdo, sdoUserId: m.sdoUserId, realId: m.id };
}

function emptyMember(): MemberDraft {
  return { tmpId: String(Date.now() + Math.random()), fio: "", position: "", ebGroup: "IV", isFromSdo: false };
}

function emptyForm(): CommissionForm {
  return { name: "", chairman: emptyMember(), members: [emptyMember(), emptyMember(), emptyMember()] };
}

function formFromCommission(c: Commission): CommissionForm {
  return { name: c.name, chairman: draftFromMember(c.chairman), members: c.members.map(draftFromMember) };
}

type View = { type: "orgs" } | { type: "commissions"; orgId: number } | { type: "edit-commission"; orgId: number; commId: number | null };

export default function CommissionsPanel() {
  const [orgs, setOrgs] = useState<EbOrganization[]>(MOCK_EB_ORGS);
  const [commissions, setCommissions] = useState<Commission[]>(MOCK_COMMISSIONS);
  const [view, setView] = useState<View>({ type: "orgs" });

  const [orgForm, setOrgForm] = useState<{ name: string; inn: string } | null>(null);
  const [editingOrgId, setEditingOrgId] = useState<number | null>(null);
  const [commForm, setCommForm] = useState<CommissionForm | null>(null);
  const [formErrors, setFormErrors] = useState<string[]>([]);
  const [pickerOpen, setPickerOpen] = useState(false);
  const [pickerTarget, setPickerTarget] = useState<"chairman" | string>("chairman");

  function openOrgCreate() {
    setOrgForm({ name: "", inn: "" });
    setEditingOrgId(null);
  }

  function openOrgEdit(org: EbOrganization) {
    setOrgForm({ name: org.name, inn: org.inn });
    setEditingOrgId(org.id);
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
        return { ...c, name: commForm.name, chairman: toMember(commForm.chairman, c.chairman.id), members: commForm.members.map((m, i) => toMember(m, c.members[i]?.id ?? 200 + i)) };
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

  function openPicker(target: "chairman" | string) {
    setPickerTarget(target);
    setPickerOpen(true);
  }

  function pickMember(m: CommissionMember) {
    updateMember(pickerTarget, { fio: m.fio, position: m.position, ebGroup: m.ebGroup, isFromSdo: m.isFromSdo, sdoUserId: m.sdoUserId, realId: m.id });
    setPickerOpen(false);
  }

  // ─── VIEW: org list ───────────────────────────────────────────────────────
  if (view.type === "orgs") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Организации</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Выберите организацию для управления комиссиями</p>
          </div>
          <button onClick={openOrgCreate}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
            <Icon name="Plus" size={15} />
            Добавить организацию
          </button>
        </div>

        {/* Org create/edit inline form */}
        {orgForm !== null && (
          <div className="bg-card border border-primary/30 rounded-2xl p-5 space-y-3">
            <h3 className="text-sm font-semibold">{editingOrgId ? "Редактировать организацию" : "Новая организация"}</h3>
            {formErrors.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-red-600">
                <Icon name="AlertCircle" size={13} /> {e}
              </div>
            ))}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Наименование</label>
                <input className="border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={orgForm.name} onChange={(e) => setOrgForm({ ...orgForm, name: e.target.value })}
                  placeholder="ООО «Название»" />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">ИНН</label>
                <input className="border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={orgForm.inn} onChange={(e) => setOrgForm({ ...orgForm, inn: e.target.value })}
                  placeholder="7701234567" maxLength={12} />
              </div>
            </div>
            <div className="flex gap-2 justify-end">
              <button onClick={() => { setOrgForm(null); setFormErrors([]); }}
                className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Отмена</button>
              <button onClick={saveOrg}
                className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                {editingOrgId ? "Сохранить" : "Создать"}
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {orgs.map((org) => {
            const orgComms = commissions.filter((c) => c.orgId === org.id);
            const activeComms = orgComms.filter((c) => c.isActive).length;
            return (
              <div key={org.id} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <div className="w-8 h-8 rounded-lg gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                        {org.name.replace(/[^А-ЯA-Z]/g, "").slice(0, 2) || org.name.slice(0, 2).toUpperCase()}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-semibold truncate">{org.name}</div>
                        {org.inn && <div className="text-xs text-muted-foreground">ИНН {org.inn}</div>}
                      </div>
                    </div>
                  </div>
                  <button onClick={() => openOrgEdit(org)}
                    className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                    <Icon name="Pencil" size={13} />
                  </button>
                </div>

                <div className="mt-4 flex items-center gap-3">
                  <div className="flex-1 px-3 py-2 bg-muted/50 rounded-xl text-center">
                    <div className="text-lg font-bold">{orgComms.length}</div>
                    <div className="text-[10px] text-muted-foreground">комиссий</div>
                  </div>
                  <div className="flex-1 px-3 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                    <div className="text-lg font-bold text-emerald-700">{activeComms}</div>
                    <div className="text-[10px] text-emerald-600">активных</div>
                  </div>
                  <button onClick={() => setView({ type: "commissions", orgId: org.id })}
                    className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-xs font-semibold">
                    Открыть
                    <Icon name="ChevronRight" size={13} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── VIEW: commissions of org ─────────────────────────────────────────────
  if (view.type === "commissions") {
    const org = orgs.find((o) => o.id === view.orgId)!;
    const orgComms = commissions.filter((c) => c.orgId === view.orgId);

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => setView({ type: "orgs" })} className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <div className="flex-1 min-w-0">
            <h2 className="text-base font-bold truncate">{org.name}</h2>
            <p className="text-xs text-muted-foreground">{org.inn && `ИНН ${org.inn} · `}Комиссии по проверке знаний ЭБ</p>
          </div>
          <button onClick={() => openCommCreate(org.id)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm flex-shrink-0">
            <Icon name="Plus" size={15} />
            Новая комиссия
          </button>
        </div>

        {orgComms.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-border rounded-2xl">
            <Icon name="Users" size={28} className="text-muted-foreground" />
            <div>
              <p className="text-sm font-medium">Нет комиссий</p>
              <p className="text-xs text-muted-foreground mt-0.5">Создайте первую комиссию для этой организации</p>
            </div>
          </div>
        ) : (
          <div className="space-y-3">
            {orgComms.map((c) => (
              <div key={c.id} className="bg-card border border-border rounded-2xl p-5">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-semibold text-sm">{c.name}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${c.isActive ? "bg-emerald-100 text-emerald-700" : "bg-muted text-muted-foreground"}`}>
                        {c.isActive ? "Активна" : "Архив"}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5">Создана {c.createdAt}</div>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <button onClick={() => toggleCommActive(c.id)}
                      className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors">
                      {c.isActive ? "В архив" : "Активировать"}
                    </button>
                    <button onClick={() => openCommEdit(org.id, c)}
                      className="p-2 rounded-xl border border-border hover:border-primary hover:text-primary transition-colors">
                      <Icon name="Pencil" size={14} />
                    </button>
                  </div>
                </div>

                {/* Chairman */}
                <div className="mt-4 flex items-center gap-3 px-3 py-2.5 bg-primary/5 border border-primary/20 rounded-xl">
                  <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                    {initials(c.chairman.fio)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="text-[10px] text-muted-foreground">Председатель</div>
                    <div className="text-sm font-semibold truncate">{c.chairman.fio}</div>
                    <div className="text-xs text-muted-foreground truncate">{c.chairman.position}</div>
                  </div>
                  <GroupBadge group={c.chairman.ebGroup} />
                </div>

                {/* Members */}
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {c.members.map((m) => (
                    <div key={m.id} className="flex items-center gap-1.5 px-2 py-1 bg-muted/60 border border-border rounded-lg">
                      <div className="w-5 h-5 rounded-full bg-primary/15 flex items-center justify-center text-primary text-[9px] font-bold flex-shrink-0">
                        {initials(m.fio)}
                      </div>
                      <span className="text-xs font-medium max-w-[90px] truncate">{m.fio.split(" ")[0]}</span>
                      <GroupBadge group={m.ebGroup} />
                    </div>
                  ))}
                </div>
                {c.members.length < 3 && (
                  <div className="flex items-center gap-1.5 mt-2 text-xs text-amber-600">
                    <Icon name="AlertTriangle" size={12} />
                    Требуется минимум 3 члена
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    );
  }

  // ─── VIEW: edit / create commission ──────────────────────────────────────
  if (view.type === "edit-commission" && commForm) {
    const org = orgs.find((o) => o.id === view.orgId)!;
    const isNew = view.commId === null;

    return (
      <div className="space-y-4">
        <div className="flex items-center gap-3">
          <button onClick={() => { setCommForm(null); setFormErrors([]); setView({ type: "commissions", orgId: view.orgId }); }}
            className="p-2 rounded-xl hover:bg-muted transition-colors">
            <Icon name="ArrowLeft" size={18} />
          </button>
          <div>
            <h2 className="text-base font-bold">{isNew ? "Новая комиссия" : "Редактировать комиссию"}</h2>
            <p className="text-xs text-muted-foreground">{org.name}</p>
          </div>
        </div>

        {formErrors.length > 0 && (
          <div className="flex flex-col gap-1 px-4 py-3 bg-red-50 border border-red-200 rounded-2xl">
            {formErrors.map((e, i) => (
              <div key={i} className="flex items-center gap-2 text-xs text-red-700">
                <Icon name="AlertCircle" size={13} className="flex-shrink-0" /> {e}
              </div>
            ))}
          </div>
        )}

        {/* Name */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Наименование комиссии</h3>
          <input className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={commForm.name} onChange={(e) => setCommForm({ ...commForm, name: e.target.value })}
            placeholder="Центральная комиссия по проверке знаний..." />
          <p className="text-xs text-muted-foreground">По п.51 Приказа Минэнерго РФ № 796 комиссия должна состоять из не менее 5 человек (председатель + ≥3 членов)</p>
        </div>

        {/* Chairman */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Председатель</h3>
          <MemberEditor member={commForm.chairman} onUpdate={(p) => updateMember("chairman", p)} onPickSdo={() => openPicker("chairman")} />
        </div>

        {/* Members */}
        <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
              Члены комиссии <span className="normal-case font-normal">({commForm.members.length} / мин. 3)</span>
            </h3>
            <button onClick={addMember}
              className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
              <Icon name="Plus" size={13} /> Добавить
            </button>
          </div>
          <div className="space-y-3">
            {commForm.members.map((m, idx) => (
              <div key={m.tmpId} className="border border-border/60 rounded-xl p-3 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground font-semibold">Член #{idx + 1}</span>
                  <button onClick={() => removeMember(m.tmpId)}
                    className="p-1 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
                <MemberEditor member={m} onUpdate={(p) => updateMember(m.tmpId, p)} onPickSdo={() => openPicker(m.tmpId)} />
              </div>
            ))}
          </div>
        </div>

        <div className="flex gap-2 justify-end">
          <button onClick={() => { setCommForm(null); setFormErrors([]); setView({ type: "commissions", orgId: view.orgId }); }}
            className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Отмена</button>
          <button onClick={() => saveCommission(view.orgId, view.commId)}
            className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            {isNew ? "Создать комиссию" : "Сохранить"}
          </button>
        </div>

        {/* SDO picker modal */}
        {pickerOpen && (
          <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-sm">Выбрать из СДО</h3>
                <button onClick={() => setPickerOpen(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                  <Icon name="X" size={15} />
                </button>
              </div>
              <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                {MOCK_SDO_MEMBERS.map((m) => (
                  <button key={m.id} onClick={() => pickMember(m)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border border-border hover:border-primary hover:bg-primary/5 text-left transition-all">
                    <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {initials(m.fio)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-semibold truncate">{m.fio}</div>
                      <div className="text-xs text-muted-foreground truncate">{m.position}</div>
                    </div>
                    <GroupBadge group={m.ebGroup} />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  }

  return null;
}

function MemberEditor({
  member, onUpdate, onPickSdo,
}: {
  member: MemberDraft;
  onUpdate: (p: Partial<MemberDraft>) => void;
  onPickSdo: () => void;
}) {
  return (
    <div className="space-y-2">
      <button type="button" onClick={onPickSdo}
        className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-dashed border-primary/50 text-primary text-xs font-medium hover:bg-primary/5 transition-colors">
        <Icon name="Search" size={12} />
        Выбрать из СДО
        {member.isFromSdo && <Icon name="CheckCircle2" size={12} className="text-emerald-500 ml-1" />}
      </button>
      <div className="grid grid-cols-2 gap-2">
        <div className="flex flex-col gap-1 col-span-2">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">ФИО</label>
          <input className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={member.fio} onChange={(e) => onUpdate({ fio: e.target.value, isFromSdo: false })}
            placeholder="Фамилия Имя Отчество" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Должность</label>
          <input className="border border-border rounded-lg px-3 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={member.position} onChange={(e) => onUpdate({ position: e.target.value })}
            placeholder="Главный энергетик" />
        </div>
        <div className="flex flex-col gap-1">
          <label className="text-[10px] font-semibold text-muted-foreground uppercase">Группа ЭБ</label>
          <select className="border border-border rounded-lg px-2 py-1.5 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
            value={member.ebGroup} onChange={(e) => onUpdate({ ebGroup: e.target.value as EbGroup })}>
            {EB_GROUPS.map((g) => <option key={g} value={g}>{g}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
}
