import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CheckProtocol } from "@/data/ebCheckData";

type FilterStatus = "all" | "draft" | "approved";

export default function CheckJournal({
  protocols, onEdit, onNew,
}: {
  protocols: CheckProtocol[];
  onEdit: (p: CheckProtocol) => void;
  onNew: () => void;
}) {
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [filterOrg, setFilterOrg] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const orgs = Array.from(new Set(protocols.map((p) => p.orgName).filter(Boolean)));
  const filtered = protocols.filter((p) => {
    if (filterStatus !== "all" && p.status !== filterStatus) return false;
    if (filterOrg && p.orgName !== filterOrg) return false;
    return true;
  });

  const draftCount = protocols.filter((p) => p.status === "draft").length;
  const approvedCount = protocols.filter((p) => p.status === "approved").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold">Журнал проверок знаний ЭБ</h2>
          <p className="text-sm text-muted-foreground mt-0.5">Приложение №4 к Приказу Минэнерго РФ № 796</p>
        </div>
        <button onClick={onNew}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
          <Icon name="Plus" size={15} /> Новая проверка
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl px-4 py-3 text-center">
          <div className="text-2xl font-bold">{protocols.length}</div>
          <div className="text-xs text-muted-foreground">Всего</div>
        </div>
        <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-center">
          <div className="text-2xl font-bold text-emerald-700">{approvedCount}</div>
          <div className="text-xs text-emerald-600">Утверждены</div>
        </div>
        <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
          <div className="text-2xl font-bold text-amber-700">{draftCount}</div>
          <div className="text-xs text-amber-600">Черновики</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 items-center">
        <div className="flex gap-1 p-1 bg-muted rounded-xl">
          {(["all", "approved", "draft"] as FilterStatus[]).map((s) => (
            <button key={s} onClick={() => setFilterStatus(s)}
              className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all ${filterStatus === s ? "bg-card shadow-sm" : "text-muted-foreground hover:text-foreground"}`}>
              {s === "all" ? "Все" : s === "approved" ? "Утверждённые" : "Черновики"}
            </button>
          ))}
        </div>
        {orgs.length > 0 && (
          <select className="border border-border rounded-xl px-3 py-1.5 text-xs bg-background focus:outline-none"
            value={filterOrg} onChange={(e) => setFilterOrg(e.target.value)}>
            <option value="">Все организации</option>
            {orgs.map((o) => <option key={o} value={o}>{o}</option>)}
          </select>
        )}
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors ml-auto">
          <Icon name="Download" size={13} /> Выгрузить (Excel)
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-border rounded-2xl">
          <Icon name="ClipboardList" size={26} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">Протоколов не найдено</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((p) => {
            const expanded = expandedId === p.id;
            return (
              <div key={p.id} className={`bg-card border rounded-2xl overflow-hidden transition-all ${expanded ? "border-primary/40 shadow-sm" : "border-border"}`}>
                <button className="w-full flex items-center gap-3 px-5 py-4 text-left hover:bg-muted/20 transition-colors"
                  onClick={() => setExpandedId(expanded ? null : p.id)}>
                  <div className={`w-2 h-2 rounded-full flex-shrink-0 ${p.status === "approved" ? "bg-emerald-500" : "bg-amber-400"}`} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="font-bold text-sm">{p.id}</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${p.status === "approved" ? "bg-emerald-100 text-emerald-700" : "bg-amber-100 text-amber-700"}`}>
                        {p.status === "approved" ? "Утверждён" : "Черновик"}
                      </span>
                      <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${p.reason === "очередная" ? "bg-blue-50 text-blue-700" : p.reason === "первичная" ? "bg-violet-50 text-violet-700" : "bg-orange-50 text-orange-700"}`}>
                        {p.reason.charAt(0).toUpperCase() + p.reason.slice(1)}
                      </span>
                    </div>
                    <div className="text-xs text-muted-foreground mt-0.5 truncate">{p.commissionName}</div>
                  </div>
                  <div className="text-right flex-shrink-0 hidden sm:block">
                    <div className="text-sm font-semibold">{p.verifyDate}</div>
                    <div className="text-xs text-muted-foreground">{p.candidates.length} чел.</div>
                  </div>
                  <Icon name={expanded ? "ChevronUp" : "ChevronDown"} size={15} className="text-muted-foreground flex-shrink-0" />
                </button>

                {expanded && (
                  <div className="px-5 pb-5 space-y-3 border-t border-border/50">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3">
                      {[
                        { label: "Дата", value: p.verifyDate },
                        { label: "Группа ЭБ", value: p.finalGroup },
                        { label: "Следующая", value: p.nextVerifyDate },
                        { label: "Напряжение", value: p.voltage },
                      ].map((item) => (
                        <div key={item.label}>
                          <div className="text-xs text-muted-foreground">{item.label}</div>
                          <div className="text-sm font-semibold mt-0.5">{item.value}</div>
                        </div>
                      ))}
                    </div>

                    <div className="space-y-1.5">
                      {p.candidates.map((c) => {
                        const r = p.results.find((x) => x.candidateId === c.id);
                        return (
                          <div key={c.id} className="flex items-center gap-3 px-3 py-2 bg-muted/40 rounded-xl">
                            <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-[10px] font-bold flex-shrink-0">
                              {c.fio.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="text-xs font-semibold truncate">{c.fio}</div>
                              <div className="text-[10px] text-muted-foreground">{c.position}</div>
                            </div>
                            {r && (
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${r.overall === "неудовл." ? "bg-red-100 text-red-700" : r.overall === "удовл." ? "bg-amber-100 text-amber-700" : r.overall === "хорошо" ? "bg-blue-100 text-blue-700" : "bg-emerald-100 text-emerald-700"}`}>
                                {r.overall}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 justify-end flex-wrap">
                      <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs font-medium hover:bg-muted transition-colors">
                        <Icon name="FileText" size={12} /> Скачать PDF
                      </button>
                      {p.status === "draft" && (
                        <button onClick={() => onEdit(p)}
                          className="flex items-center gap-1.5 px-3 py-1.5 border border-primary/40 bg-primary/5 text-primary rounded-xl text-xs font-medium hover:bg-primary/10 transition-colors">
                          <Icon name="Pencil" size={12} /> Продолжить оформление
                        </button>
                      )}
                    </div>
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
