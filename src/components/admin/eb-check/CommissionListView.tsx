import Icon from "@/components/ui/icon";
import { Commission, CheckProtocol, EbOrganization } from "@/data/ebCheckData";
import { GroupBadge } from "./OrgListView";
import { initials } from "./commissions-shared";

export default function CommissionListView({
  org,
  orgComms,
  protocols,
  onBack,
  onCreateComm,
  onEditComm,
  onToggleActive,
}: {
  org: EbOrganization;
  orgComms: Commission[];
  protocols: CheckProtocol[];
  onBack: () => void;
  onCreateComm: () => void;
  onEditComm: (c: Commission) => void;
  onToggleActive: (id: number) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onBack} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold truncate">{org.name}</h2>
          <p className="text-xs text-muted-foreground">{org.inn && `ИНН ${org.inn} · `}Комиссии по проверке знаний ЭБ</p>
        </div>
        <button onClick={onCreateComm}
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
          {orgComms.map((c) => {
            const commProtos = protocols.filter((p) => p.commissionId === c.id);
            const commApproved = commProtos.filter((p) => p.status === "approved").length;
            const commDraft = commProtos.filter((p) => p.status === "draft").length;
            const lastProto = commProtos.sort((a, b) => b.verifyDate.localeCompare(a.verifyDate))[0];
            return (
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
                    <button onClick={() => onToggleActive(c.id)}
                      className="px-3 py-1.5 rounded-xl border border-border text-xs font-medium hover:bg-muted transition-colors">
                      {c.isActive ? "В архив" : "Активировать"}
                    </button>
                    <button onClick={() => onEditComm(c)}
                      className="p-2 rounded-xl border border-border hover:border-primary hover:text-primary transition-colors">
                      <Icon name="Pencil" size={14} />
                    </button>
                  </div>
                </div>

                {commProtos.length > 0 ? (
                  <div className="mt-3 flex items-center gap-2 flex-wrap">
                    <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-muted/60 rounded-xl">
                      <Icon name="FileText" size={12} className="text-muted-foreground" />
                      <span className="text-xs font-semibold">{commProtos.length}</span>
                      <span className="text-xs text-muted-foreground">протоколов</span>
                    </div>
                    {commApproved > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-emerald-50 border border-emerald-100 rounded-xl">
                        <Icon name="CheckCircle2" size={12} className="text-emerald-600" />
                        <span className="text-xs font-semibold text-emerald-700">{commApproved}</span>
                        <span className="text-xs text-emerald-600">утверждено</span>
                      </div>
                    )}
                    {commDraft > 0 && (
                      <div className="flex items-center gap-1.5 px-2.5 py-1.5 bg-amber-50 border border-amber-100 rounded-xl">
                        <Icon name="Clock" size={12} className="text-amber-600" />
                        <span className="text-xs font-semibold text-amber-700">{commDraft}</span>
                        <span className="text-xs text-amber-600">черновик</span>
                      </div>
                    )}
                    {lastProto && (
                      <div className="flex items-center gap-1 text-xs text-muted-foreground ml-auto">
                        <Icon name="Calendar" size={11} />
                        Последняя: {lastProto.verifyDate}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <Icon name="Info" size={12} />
                    Проверок по этой комиссии ещё не проводилось
                  </div>
                )}

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
            );
          })}
        </div>
      )}
    </div>
  );
}
