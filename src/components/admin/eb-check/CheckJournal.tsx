import { useState } from "react";
import Icon from "@/components/ui/icon";
import { CheckProtocol, EbOrganization, MOCK_EB_ORGS } from "@/data/ebCheckData";

function downloadProtocolPdf(p: CheckProtocol) {
  const rows = p.candidates.map((c, idx) => {
    const r = p.results.find((x) => x.candidateId === c.id);
    return `
      <tr>
        <td>${idx + 1}</td>
        <td>${c.fio}</td>
        <td>${c.position}</td>
        <td>${c.workplace}</td>
        <td>${c.prevDate || "—"}</td>
        <td>${c.prevGroup || "—"}</td>
        <td>${r?.tech || "—"}</td>
        <td>${r?.safety || "—"}</td>
        <td>${r?.fire || "—"}</td>
        <td>${r?.other || "—"}</td>
        <td><strong>${r?.overall || "—"}</strong></td>
        <td>${p.finalGroup}</td>
        <td>${p.nextVerifyDate}</td>
      </tr>`;
  }).join("");

  const html = `<!DOCTYPE html>
<html lang="ru">
<head>
<meta charset="UTF-8"/>
<title>Протокол ${p.id}</title>
<style>
  body { font-family: Arial, sans-serif; font-size: 10px; margin: 20px; color: #000; }
  h2 { font-size: 13px; text-align: center; margin-bottom: 4px; }
  .sub { font-size: 9px; text-align: center; color: #555; margin-bottom: 16px; }
  .meta { margin-bottom: 12px; line-height: 1.8; }
  .meta b { display: inline-block; min-width: 180px; }
  table { width: 100%; border-collapse: collapse; font-size: 9px; }
  th, td { border: 1px solid #555; padding: 3px 4px; text-align: center; vertical-align: middle; }
  th { background: #f0f0f0; font-size: 8px; }
  td:nth-child(2), td:nth-child(3), td:nth-child(4) { text-align: left; }
  @media print { body { margin: 10mm; } }
</style>
</head>
<body>
<h2>ПРОТОКОЛ № ${p.id}</h2>
<p class="sub">проверки знаний норм и правил работы в электроустановках<br/>
(Приложение № 4 к Приказу Минэнерго РФ от 15.12.2020 № 1210)</p>
<div class="meta">
  <div><b>Организация:</b> ${p.orgName}</div>
  <div><b>Дата проверки:</b> ${p.verifyDate}</div>
  <div><b>Основание:</b> ${p.reason}${p.reasonBasis ? " — " + p.reasonBasis : ""}</div>
  <div><b>Комиссия:</b> ${p.commissionName}</div>
  <div><b>Напряжение:</b> ${p.voltage}</div>
  <div><b>НТД:</b> ${p.ntd.join(", ")}</div>
  <div><b>Следующая проверка:</b> ${p.nextVerifyDate}</div>
</div>
<table>
  <thead>
    <tr>
      <th>№</th>
      <th>ФИО</th>
      <th>Должность</th>
      <th>Место работы</th>
      <th>Пред. дата</th>
      <th>Пред. гр.</th>
      <th>Технич.</th>
      <th>Охрана труда</th>
      <th>Пожар. безоп.</th>
      <th>Прочее</th>
      <th>Итог</th>
      <th>Гр. ЭБ</th>
      <th>Следующая</th>
    </tr>
  </thead>
  <tbody>${rows}</tbody>
</table>
${p.status === "approved" && p.approvedAt ? `<p style="margin-top:16px;font-size:9px;">Утверждён: ${p.approvedAt}</p>` : ""}
</body>
</html>`;

  const w = window.open("", "_blank");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => { w.print(); }, 400);
}

type FilterStatus = "all" | "draft" | "approved";
type JournalView = { type: "orgs" } | { type: "protocols"; orgId: number };

function StatusBadge({ status }: { status: CheckProtocol["status"] }) {
  return status === "approved" ? (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700">Утверждён</span>
  ) : (
    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-700">Черновик</span>
  );
}

function ReasonBadge({ reason }: { reason: CheckProtocol["reason"] }) {
  const cls = reason === "очередная" ? "bg-blue-50 text-blue-700" : reason === "первичная" ? "bg-violet-50 text-violet-700" : "bg-orange-50 text-orange-700";
  return <span className={`text-[10px] px-2 py-0.5 rounded-md font-medium ${cls}`}>{reason.charAt(0).toUpperCase() + reason.slice(1)}</span>;
}

export default function CheckJournal({
  protocols, onEdit, onNew,
}: {
  protocols: CheckProtocol[];
  onEdit: (p: CheckProtocol) => void;
  onNew: (orgId?: number) => void;
}) {
  const [view, setView] = useState<JournalView>({ type: "orgs" });
  const [filterStatus, setFilterStatus] = useState<FilterStatus>("all");
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [orgSearch, setOrgSearch] = useState("");
  const [orgFilter, setOrgFilter] = useState<"all" | "has_draft" | "has_approved">("all");

  // Collect all orgs that appear in protocols + known orgs
  const orgIds = Array.from(new Set([
    ...MOCK_EB_ORGS.map((o) => o.id),
    ...protocols.map((p) => p.orgId).filter(Boolean),
  ]));

  function getOrgName(orgId: number): string {
    const known = MOCK_EB_ORGS.find((o) => o.id === orgId);
    if (known) return known.name;
    const fromProto = protocols.find((p) => p.orgId === orgId);
    return fromProto?.orgName || `Организация ${orgId}`;
  }

  // ─── VIEW: org list ───────────────────────────────────────────────────────
  if (view.type === "orgs") {
    return (
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Журнал проверок знаний ЭБ</h2>
            <p className="text-sm text-muted-foreground mt-0.5">Приложение №4 к Приказу Минэнерго РФ № 796</p>
          </div>
          <button onClick={() => onNew()}
            className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm">
            <Icon name="Plus" size={15} /> Новая проверка
          </button>
        </div>

        {/* Summary counters */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card border border-border rounded-2xl px-4 py-3 text-center">
            <div className="text-2xl font-bold">{protocols.length}</div>
            <div className="text-xs text-muted-foreground">Всего</div>
          </div>
          <div className="bg-emerald-50 border border-emerald-200 rounded-2xl px-4 py-3 text-center">
            <div className="text-2xl font-bold text-emerald-700">{protocols.filter((p) => p.status === "approved").length}</div>
            <div className="text-xs text-emerald-600">Утверждены</div>
          </div>
          <div className="bg-amber-50 border border-amber-200 rounded-2xl px-4 py-3 text-center">
            <div className="text-2xl font-bold text-amber-700">{protocols.filter((p) => p.status === "draft").length}</div>
            <div className="text-xs text-amber-600">Черновики</div>
          </div>
        </div>

        <div className="flex gap-2 flex-wrap items-center">
          <div className="relative flex-1 min-w-48">
            <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              className="w-full border border-border rounded-xl pl-9 pr-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
              placeholder="Поиск по организации..."
              value={orgSearch}
              onChange={(e) => setOrgSearch(e.target.value)}
            />
          </div>
          <div className="flex gap-1 p-1 bg-muted rounded-xl flex-shrink-0">
            {([
              { key: "all", label: "Все" },
              { key: "has_draft", label: "Есть черновики" },
              { key: "has_approved", label: "Есть утверждённые" },
            ] as { key: typeof orgFilter; label: string }[]).map((f) => (
              <button key={f.key} onClick={() => setOrgFilter(f.key)}
                className={`px-3 py-1 rounded-lg text-xs font-semibold transition-all whitespace-nowrap ${orgFilter === f.key ? "bg-card shadow-sm text-foreground" : "text-muted-foreground hover:text-foreground"}`}>
                {f.label}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-3">
          {orgIds.filter((orgId) => {
            const orgProtos = protocols.filter((p) => p.orgId === orgId);
            if (orgSearch.trim() && !getOrgName(orgId).toLowerCase().includes(orgSearch.toLowerCase())) return false;
            if (orgFilter === "has_draft" && !orgProtos.some((p) => p.status === "draft")) return false;
            if (orgFilter === "has_approved" && !orgProtos.some((p) => p.status === "approved")) return false;
            return true;
          }).map((orgId) => {
            const orgProtos = protocols.filter((p) => p.orgId === orgId);
            const approved = orgProtos.filter((p) => p.status === "approved").length;
            const draft = orgProtos.filter((p) => p.status === "draft").length;
            const lastProto = [...orgProtos].sort((a, b) => b.verifyDate.localeCompare(a.verifyDate))[0];
            const orgName = getOrgName(orgId);

            return (
              <div key={orgId} className="bg-card border border-border rounded-2xl p-5 hover:border-primary/40 hover:shadow-sm transition-all group">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    <div className="w-9 h-9 rounded-xl gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                      {orgName.replace(/[^А-ЯA-Z]/g, "").slice(0, 2) || orgName.slice(0, 2).toUpperCase()}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-semibold truncate">{orgName}</div>
                      {lastProto && (
                        <div className="text-xs text-muted-foreground">Последняя проверка: {lastProto.verifyDate}</div>
                      )}
                      {!lastProto && (
                        <div className="text-xs text-muted-foreground">Проверок не проводилось</div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="mt-4 grid grid-cols-4 gap-2">
                  <div className="px-2 py-2 bg-muted/50 rounded-xl text-center">
                    <div className="text-base font-bold">{orgProtos.length}</div>
                    <div className="text-[10px] text-muted-foreground leading-tight">всего</div>
                  </div>
                  <div className="px-2 py-2 bg-emerald-50 border border-emerald-100 rounded-xl text-center">
                    <div className="text-base font-bold text-emerald-700">{approved}</div>
                    <div className="text-[10px] text-emerald-600 leading-tight">утверждено</div>
                  </div>
                  <div className="px-2 py-2 bg-amber-50 border border-amber-100 rounded-xl text-center">
                    <div className="text-base font-bold text-amber-700">{draft}</div>
                    <div className="text-[10px] text-amber-600 leading-tight">черновики</div>
                  </div>
                  <button
                    onClick={() => { setView({ type: "protocols", orgId }); setFilterStatus("all"); setExpandedId(null); }}
                    className="px-2 py-2 rounded-xl border border-border hover:border-primary hover:text-primary hover:bg-primary/5 transition-all text-xs font-semibold flex items-center justify-center gap-1"
                  >
                    Открыть <Icon name="ChevronRight" size={12} />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // ─── VIEW: protocols of org ───────────────────────────────────────────────
  const orgName = getOrgName(view.orgId);
  const orgProtos = protocols.filter((p) => p.orgId === view.orgId);
  const filtered = orgProtos.filter((p) => filterStatus === "all" || p.status === filterStatus);
  const draftCount = orgProtos.filter((p) => p.status === "draft").length;
  const approvedCount = orgProtos.filter((p) => p.status === "approved").length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={() => setView({ type: "orgs" })} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <h2 className="text-base font-bold truncate">{orgName}</h2>
          <p className="text-xs text-muted-foreground">Журнал проверок знаний ЭБ · Приложение №4</p>
        </div>
        <button onClick={() => onNew(view.orgId)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity shadow-sm flex-shrink-0">
          <Icon name="Plus" size={15} /> Новая проверка
        </button>
      </div>

      <div className="grid grid-cols-3 gap-3">
        <div className="bg-card border border-border rounded-2xl px-4 py-3 text-center">
          <div className="text-2xl font-bold">{orgProtos.length}</div>
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
        <button className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs text-muted-foreground hover:border-primary hover:text-primary transition-colors ml-auto">
          <Icon name="Download" size={13} /> Выгрузить (Excel)
        </button>
      </div>

      {filtered.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-center border border-dashed border-border rounded-2xl">
          <Icon name="ClipboardList" size={26} className="text-muted-foreground" />
          <p className="text-sm text-muted-foreground">
            {orgProtos.length === 0 ? "Проверок по этой организации ещё не проводилось" : "Протоколов не найдено"}
          </p>
          {orgProtos.length === 0 && (
            <button onClick={() => onNew(view.orgId)}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
              <Icon name="Plus" size={14} /> Оформить первую проверку
            </button>
          )}
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
                      <StatusBadge status={p.status} />
                      <ReasonBadge reason={p.reason} />
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
                              <span className={`text-xs font-semibold px-2 py-0.5 rounded-md flex-shrink-0 ${
                                r.overall === "неудовл." ? "bg-red-100 text-red-700" :
                                r.overall === "удовл." ? "bg-amber-100 text-amber-700" :
                                r.overall === "хорошо" ? "bg-blue-100 text-blue-700" :
                                "bg-emerald-100 text-emerald-700"
                              }`}>{r.overall}</span>
                            )}
                          </div>
                        );
                      })}
                    </div>

                    <div className="flex gap-2 justify-end flex-wrap">
                      <button onClick={() => downloadProtocolPdf(p)} className="flex items-center gap-1.5 px-3 py-1.5 border border-border rounded-xl text-xs font-medium hover:bg-muted transition-colors">
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