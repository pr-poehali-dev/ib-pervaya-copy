import Icon from "@/components/ui/icon";
import { CommissionMember, EbGroup, MOCK_SDO_MEMBERS } from "@/data/ebCheckData";
import { MemberDraft, CommissionForm, EB_GROUPS, initials } from "./commissions-shared";
import { GroupBadge } from "./OrgListView";

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

export default function CommissionFormView({
  orgName,
  isNew,
  commForm,
  formErrors,
  pickerOpen,
  pickerTarget,
  onBack,
  onFormNameChange,
  onUpdateMember,
  onAddMember,
  onRemoveMember,
  onOpenPicker,
  onClosePicker,
  onPickMember,
  onSave,
}: {
  orgName: string;
  isNew: boolean;
  commForm: CommissionForm;
  formErrors: string[];
  pickerOpen: boolean;
  pickerTarget: "chairman" | string;
  onBack: () => void;
  onFormNameChange: (name: string) => void;
  onUpdateMember: (target: "chairman" | string, patch: Partial<MemberDraft>) => void;
  onAddMember: () => void;
  onRemoveMember: (tmpId: string) => void;
  onOpenPicker: (target: "chairman" | string) => void;
  onClosePicker: () => void;
  onPickMember: (m: CommissionMember) => void;
  onSave: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <div>
          <h2 className="text-base font-bold">{isNew ? "Новая комиссия" : "Редактировать комиссию"}</h2>
          <p className="text-xs text-muted-foreground">{orgName}</p>
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

      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Наименование комиссии</h3>
        <input className="w-full border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
          value={commForm.name} onChange={(e) => onFormNameChange(e.target.value)}
          placeholder="Центральная комиссия по проверке знаний..." />
        <p className="text-xs text-muted-foreground">По п.51 Приказа Минэнерго РФ № 796 комиссия должна состоять из не менее 5 человек (председатель + ≥3 членов)</p>
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Председатель</h3>
        <MemberEditor
          member={commForm.chairman}
          onUpdate={(p) => onUpdateMember("chairman", p)}
          onPickSdo={() => onOpenPicker("chairman")}
        />
      </div>

      <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
            Члены комиссии <span className="normal-case font-normal">({commForm.members.length} / мин. 3)</span>
          </h3>
          <button onClick={onAddMember}
            className="flex items-center gap-1 text-xs font-semibold text-primary hover:text-primary/80 transition-colors">
            <Icon name="Plus" size={13} /> Добавить
          </button>
        </div>
        <div className="space-y-3">
          {commForm.members.map((m, idx) => (
            <div key={m.tmpId} className="border border-border/60 rounded-xl p-3 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">Член #{idx + 1}</span>
                <button onClick={() => onRemoveMember(m.tmpId)}
                  className="p-1 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors">
                  <Icon name="Trash2" size={13} />
                </button>
              </div>
              <MemberEditor
                member={m}
                onUpdate={(p) => onUpdateMember(m.tmpId, p)}
                onPickSdo={() => onOpenPicker(m.tmpId)}
              />
            </div>
          ))}
        </div>
      </div>

      <div className="flex gap-2 justify-end">
        <button onClick={onBack}
          className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Отмена</button>
        <button onClick={onSave}
          className="px-5 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
          {isNew ? "Создать комиссию" : "Сохранить"}
        </button>
      </div>

      {pickerOpen && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-bold text-sm">Выбрать из СДО</h3>
              <button onClick={onClosePicker} className="p-1.5 rounded-lg hover:bg-muted transition-colors">
                <Icon name="X" size={15} />
              </button>
            </div>
            <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
              {MOCK_SDO_MEMBERS.map((m) => (
                <button key={m.id} onClick={() => onPickMember(m)}
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
