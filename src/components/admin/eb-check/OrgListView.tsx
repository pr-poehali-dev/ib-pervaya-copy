import Icon from "@/components/ui/icon";
import { innError } from "@/utils/validation";
import { Commission, CheckProtocol, EbOrganization } from "@/data/ebCheckData";

export function GroupBadge({ group }: { group: string }) {
  const cls =
    group === "V" ? "bg-purple-100 text-purple-700" :
    group === "IV" ? "bg-blue-100 text-blue-700" :
    group === "III до и выше 1000В" ? "bg-cyan-100 text-cyan-700" :
    group === "III до 1000В" ? "bg-teal-100 text-teal-700" :
    "bg-gray-100 text-gray-600";
  return <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded-md ${cls}`}>{group}</span>;
}

export default function OrgListView({
  orgs,
  commissions,
  protocols,
  orgForm,
  editingOrgId,
  formErrors,
  onOrgCreate,
  onOrgEdit,
  onOrgFormChange,
  onOrgSave,
  onOrgFormCancel,
  onOpenOrg,
}: {
  orgs: EbOrganization[];
  commissions: Commission[];
  protocols: CheckProtocol[];
  orgForm: { name: string; inn: string } | null;
  editingOrgId: number | null;
  formErrors: string[];
  onOrgCreate: () => void;
  onOrgEdit: (org: EbOrganization) => void;
  onOrgFormChange: (f: { name: string; inn: string }) => void;
  onOrgSave: () => void;
  onOrgFormCancel: () => void;
  onOpenOrg: (orgId: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Организации</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Выберите организацию для управления комиссиями</p>
        </div>
        <button onClick={onOrgCreate}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
          <Icon name="Plus" size={15} />
          Добавить организацию
        </button>
      </div>

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
                value={orgForm.name} onChange={(e) => onOrgFormChange({ ...orgForm, name: e.target.value })}
                placeholder="ООО «Название»" />
            </div>
            <div className="flex flex-col gap-1.5">
              <label className="text-xs font-semibold text-muted-foreground uppercase">ИНН</label>
              <input className={`border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 transition-colors ${innError(orgForm.inn) ? "border-red-400 focus:ring-red-400/30" : "border-border focus:ring-primary/30"}`}
                value={orgForm.inn} onChange={(e) => onOrgFormChange({ ...orgForm, inn: e.target.value.replace(/\D/g, "").slice(0, 12) })}
                placeholder="7701234567" maxLength={12} />
              {innError(orgForm.inn) && <p className="text-xs text-red-500">{innError(orgForm.inn)}</p>}
            </div>
          </div>
          <div className="flex gap-2 justify-end">
            <button onClick={onOrgFormCancel}
              className="px-4 py-2 rounded-xl border border-border text-sm hover:bg-muted transition-colors">Отмена</button>
            <button onClick={onOrgSave}
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
          const orgProtocols = protocols.filter((p) => p.orgId === org.id);
          const approvedProtos = orgProtocols.filter((p) => p.status === "approved").length;
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
                <button onClick={() => onOrgEdit(org)}
                  className="p-1.5 rounded-lg border border-border text-muted-foreground hover:border-primary hover:text-primary transition-colors opacity-0 group-hover:opacity-100 flex-shrink-0">
                  <Icon name="Pencil" size={13} />
                </button>
              </div>

              <div className="mt-4 grid grid-cols-4 gap-2">
                <div className="px-2 py-2 bg-muted/50 rounded-xl text-center">
                  <div className="text-base font-bold">{orgComms.length}</div>
                  <div className="text-[10px] text-muted-foreground leading-tight">комиссий</div>
                </div>
                <div className="px-2 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                  <div className="text-base font-bold text-emerald-700">{activeComms}</div>
                  <div className="text-[10px] text-emerald-600 leading-tight">активных</div>
                </div>
                <div className="px-2 py-2 bg-blue-50 border border-blue-100 rounded-xl text-center">
                  <div className="text-base font-bold text-blue-700">{orgProtocols.length}</div>
                  <div className="text-[10px] text-blue-600 leading-tight">протоколов</div>
                </div>
                <div className="px-2 py-2 bg-violet-50 border border-violet-100 rounded-xl text-center">
                  <div className="text-base font-bold text-violet-700">{approvedProtos}</div>
                  <div className="text-[10px] text-violet-600 leading-tight">утверждено</div>
                </div>
              </div>

              <button onClick={() => onOpenOrg(org.id)}
                className="mt-3 w-full flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl border border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-xs font-semibold">
                Управление комиссиями
                <Icon name="ChevronRight" size={13} />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
}