import { useState, useCallback } from "react";
import Icon from "@/components/ui/icon";
import {
  Commission, CheckCandidate, CandidateResult, EbGroup, NtdItem,
  CheckProtocol, PersonnelCategory, MOCK_COMMISSIONS, MOCK_CANDIDATES,
} from "@/data/ebCheckData";

const EB_GROUPS: EbGroup[] = ["II", "III до 1000В", "III до и выше 1000В", "IV", "V"];
const ALL_NTD: NtdItem[] = ["ПУЭ", "ПТБ", "ПТЭ", "ППБ", "Другие"];
const GRADES = ["", "отл.", "хорошо", "удовл.", "неудовл."];
const CATEGORIES: PersonnelCategory[] = [
  "административно-технический", "диспетчерский", "оперативный",
  "оперативно-ремонтный", "ремонтный", "вспомогательный",
];

function calcOverall(r: { tech: string; safety: string; fire: string; other: string }): string {
  const vals = [r.tech, r.safety, r.fire, r.other].filter(Boolean);
  if (!vals.length) return "—";
  if (vals.includes("неудовл.")) return "неудовл.";
  if (vals.every((v) => v === "отл.")) return "отл.";
  if (vals.every((v) => v === "отл." || v === "хорошо")) return "хорошо";
  return "удовл.";
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr);
  d.setDate(d.getDate() + days);
  return d.toISOString().slice(0, 10);
}

function OverallBadge({ grade }: { grade: string }) {
  const cls =
    grade === "отл." ? "bg-emerald-100 text-emerald-700" :
    grade === "хорошо" ? "bg-blue-100 text-blue-700" :
    grade === "удовл." ? "bg-amber-100 text-amber-700" :
    grade === "неудовл." ? "bg-red-100 text-red-700" :
    "bg-muted text-muted-foreground";
  return <span className={`text-xs font-semibold px-2 py-0.5 rounded-md ${cls}`}>{grade || "—"}</span>;
}

type WizardStep = 1 | 2 | 3 | 4;

type WizardState = {
  commissionId: number | null;
  verifyDate: string;
  reason: "очередная" | "первичная" | "внеочередная";
  reasonBasis: string;
  ntd: NtdItem[];
  candidates: CheckCandidate[];
  results: Record<number, { tech: string; safety: string; fire: string; other: string }>;
  finalGroup: EbGroup;
  voltage: "до 1000 В" | "до и свыше 1000 В" | "не применяется";
  probationDays: number;
  nextVerifyDate: string;
};

const STEP_LABELS = ["Комиссия и сессия", "Проверяемые", "Результаты", "Заключение"];

export default function CheckWizard({
  onSave, onCancel, editProtocol, commissions, defaultOrgId,
}: {
  onSave: (p: CheckProtocol) => void;
  onCancel: () => void;
  editProtocol?: CheckProtocol;
  commissions?: Commission[];
  defaultOrgId?: number;
}) {
  const allCommissions = commissions ?? MOCK_COMMISSIONS;
  const availableCommissions = defaultOrgId
    ? allCommissions.filter((c) => c.orgId === defaultOrgId)
    : allCommissions;

  const [step, setStep] = useState<WizardStep>(1);
  const [state, setState] = useState<WizardState>(() => {
    if (editProtocol) {
      const r: Record<number, { tech: string; safety: string; fire: string; other: string }> = {};
      editProtocol.results.forEach((res) => { r[res.candidateId] = { tech: res.tech, safety: res.safety, fire: res.fire, other: res.other }; });
      return {
        commissionId: editProtocol.commissionId, verifyDate: editProtocol.verifyDate,
        reason: editProtocol.reason, reasonBasis: editProtocol.reasonBasis ?? "",
        ntd: editProtocol.ntd, candidates: editProtocol.candidates, results: r,
        finalGroup: editProtocol.finalGroup, voltage: editProtocol.voltage,
        probationDays: editProtocol.probationDays, nextVerifyDate: editProtocol.nextVerifyDate,
      };
    }
    return {
      commissionId: null, verifyDate: new Date().toISOString().slice(0, 10),
      reason: "очередная", reasonBasis: "", ntd: ["ПУЭ", "ПТБ", "ПТЭ"],
      candidates: [], results: {}, finalGroup: "IV",
      voltage: "до и свыше 1000 В", probationDays: 0, nextVerifyDate: "",
    };
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [showCandidatePicker, setShowCandidatePicker] = useState(false);

  const commission = availableCommissions.find((c) => c.id === state.commissionId) ?? null;
  const update = useCallback((patch: Partial<WizardState>) => setState((p) => ({ ...p, ...patch })), []);

  function validateStep(s: WizardStep): string[] {
    if (s === 1) {
      if (!state.commissionId) return ["Выберите комиссию"];
      if (!state.verifyDate) return ["Укажите дату проверки"];
      if (state.reason === "внеочередная" && !state.reasonBasis.trim()) return ["Укажите основание внеочередной проверки"];
      if (!state.ntd.length) return ["Выберите хотя бы один НТД"];
    }
    if (s === 2 && !state.candidates.length) return ["Добавьте хотя бы одного проверяемого"];
    if (s === 3) {
      const unfilled = state.candidates.filter((c) => { const r = state.results[c.id]; return !r?.tech || !r?.safety || !r?.fire || !r?.other; });
      if (unfilled.length) return [`Заполните оценки: ${unfilled.map((c) => c.fio.split(" ")[0]).join(", ")}`];
      const fail = state.candidates.some((c) => { const r = state.results[c.id]; return r && calcOverall(r) === "неудовл."; });
      if (fail) return ["Один из проверяемых получил «неудовл.». Допуск запрещён (п.63). Повторная проверка — не позднее 1 месяца."];
    }
    return [];
  }

  function goNext() {
    const errs = validateStep(step);
    if (errs.length) { setErrors(errs); return; }
    setErrors([]);
    if (step === 3) {
      const isAT = state.candidates[0]?.category === "административно-технический";
      update({ nextVerifyDate: addDays(state.verifyDate, isAT ? 1095 : 365) });
    }
    setStep((s) => (s + 1) as WizardStep);
  }

  function handleSave(approve: boolean) {
    const results: CandidateResult[] = state.candidates.map((c) => {
      const r = state.results[c.id] ?? { tech: "", safety: "", fire: "", other: "" };
      return { candidateId: c.id, ...r, overall: calcOverall(r) };
    });
    onSave({
      id: editProtocol?.id ?? `ЭБ-${new Date().getFullYear()}-${String(Date.now()).slice(-3)}`,
      status: approve ? "approved" : "draft",
      createdAt: editProtocol?.createdAt ?? new Date().toLocaleDateString("ru-RU"),
      approvedAt: approve ? new Date().toLocaleDateString("ru-RU") : undefined,
      commissionId: state.commissionId!, commissionName: commission?.name ?? "",
      orgId: commission?.orgId ?? 0, orgName: "",
      verifyDate: state.verifyDate, reason: state.reason,
      reasonBasis: state.reasonBasis || undefined, ntd: state.ntd,
      candidates: state.candidates, results,
      finalGroup: state.finalGroup, voltage: state.voltage,
      probationDays: state.probationDays, nextVerifyDate: state.nextVerifyDate,
    });
  }

  const hasAnyFail = state.candidates.some((c) => { const r = state.results[c.id]; return r && calcOverall(r) === "неудовл."; });
  const needsProbation = ["диспетчерский", "оперативный", "оперативно-ремонтный"].includes(state.candidates[0]?.category ?? "");

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <button onClick={onCancel} className="p-2 rounded-xl hover:bg-muted transition-colors">
          <Icon name="ArrowLeft" size={18} />
        </button>
        <h2 className="text-base font-bold">{editProtocol ? `Протокол ${editProtocol.id}` : "Новая проверка знаний ЭБ"}</h2>
      </div>

      {/* Stepper */}
      <div className="flex gap-1">
        {STEP_LABELS.map((label, i) => {
          const s = (i + 1) as WizardStep;
          const done = s < step;
          const active = s === step;
          return (
            <button key={s} onClick={() => done && setStep(s)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold flex-1 justify-center transition-all ${active ? "gradient-primary text-white shadow-md" : done ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-pointer" : "bg-muted text-muted-foreground cursor-default"}`}>
              {done ? <Icon name="CheckCircle2" size={12} /> : <span className="w-3.5 h-3.5 rounded-full border-2 border-current flex items-center justify-center text-[9px]">{s}</span>}
              <span className="hidden sm:inline truncate">{label}</span>
            </button>
          );
        })}
      </div>

      {errors.length > 0 && (
        <div className={`flex flex-col gap-1 px-4 py-3 rounded-2xl border ${hasAnyFail ? "bg-red-50 border-red-200" : "bg-amber-50 border-amber-200"}`}>
          {errors.map((e, i) => (
            <div key={i} className={`flex items-start gap-2 text-sm ${hasAnyFail ? "text-red-700" : "text-amber-700"}`}>
              <Icon name={hasAnyFail ? "XCircle" : "AlertTriangle"} size={13} className="flex-shrink-0 mt-0.5" /> {e}
            </div>
          ))}
        </div>
      )}

      {/* STEP 1 */}
      {step === 1 && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Параметры проверки</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Дата</label>
                <input type="date" className="border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={state.verifyDate} onChange={(e) => update({ verifyDate: e.target.value })} />
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Причина</label>
                <select className="border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={state.reason} onChange={(e) => update({ reason: e.target.value as WizardState["reason"] })}>
                  <option value="очередная">Очередная</option>
                  <option value="первичная">Первичная</option>
                  <option value="внеочередная">Внеочередная</option>
                </select>
              </div>
              {state.reason === "внеочередная" && (
                <div className="flex flex-col gap-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Основание</label>
                  <input className="border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={state.reasonBasis} onChange={(e) => update({ reasonBasis: e.target.value })} placeholder="Приказ №12 от 10.03.2026" />
                </div>
              )}
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Комиссия</h3>
            {availableCommissions.filter((c) => c.isActive).length === 0 ? (
              <p className="text-sm text-muted-foreground">Нет активных комиссий. Создайте комиссию в разделе «Комиссии».</p>
            ) : (
              availableCommissions.filter((c) => c.isActive).map((c) => (
                <button key={c.id} onClick={() => update({ commissionId: c.id })}
                  className={`w-full flex items-start gap-3 px-4 py-3 rounded-xl border text-left transition-all ${state.commissionId === c.id ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                  <div className={`w-4 h-4 rounded-full border-2 mt-0.5 flex-shrink-0 ${state.commissionId === c.id ? "border-primary bg-primary" : "border-muted-foreground"}`} />
                  <div>
                    <div className="text-sm font-semibold">{c.name}</div>
                    <div className="text-xs text-muted-foreground">Председатель: {c.chairman.fio} · {c.members.length + 1} участников</div>
                  </div>
                </button>
              ))
            )}
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Проверяемые НТД</h3>
            <div className="flex flex-wrap gap-2">
              {ALL_NTD.map((item) => (
                <button key={item} onClick={() => update({ ntd: state.ntd.includes(item) ? state.ntd.filter((n) => n !== item) : [...state.ntd, item] })}
                  className={`px-3 py-1.5 rounded-xl border text-sm font-medium transition-all ${state.ntd.includes(item) ? "border-primary bg-primary/10 text-primary" : "border-border text-muted-foreground"}`}>
                  {item}
                </button>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">Незаполненные НТД в протоколе будут зачёркнуты</p>
          </div>
        </div>
      )}

      {/* STEP 2 */}
      {step === 2 && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Список проверяемых</h3>
              <p className="text-xs text-muted-foreground mt-0.5">Добавьте сотрудников из базы СДО</p>
            </div>
            <button onClick={() => setShowCandidatePicker(true)}
              className="flex items-center gap-1.5 px-3 py-2 rounded-xl gradient-primary text-white text-xs font-semibold hover:opacity-90 transition-opacity">
              <Icon name="UserPlus" size={13} /> Добавить из СДО
            </button>
          </div>

          {state.candidates.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-10 gap-2 border border-dashed border-border rounded-xl">
              <Icon name="Users" size={22} className="text-muted-foreground" />
              <p className="text-sm text-muted-foreground">Нет проверяемых</p>
            </div>
          ) : (
            <div className="space-y-2">
              {state.candidates.map((c, idx) => (
                <div key={c.id} className="flex items-start gap-3 px-4 py-3 border border-border rounded-xl">
                  <div className="w-7 h-7 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">{idx + 1}</div>
                  <div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-2 min-w-0">
                    <div>
                      <div className="text-sm font-semibold">{c.fio}</div>
                      <div className="text-xs text-muted-foreground">{c.position} · {c.workplace}</div>
                    </div>
                    <div className="flex flex-col gap-1">
                      <label className="text-[10px] font-semibold text-muted-foreground uppercase">Категория</label>
                      <select className="border border-border rounded-lg px-2 py-1 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                        value={c.category}
                        onChange={(e) => update({ candidates: state.candidates.map((x) => x.id === c.id ? { ...x, category: e.target.value as PersonnelCategory } : x) })}>
                        {CATEGORIES.map((cat) => <option key={cat} value={cat}>{cat.charAt(0).toUpperCase() + cat.slice(1)}</option>)}
                      </select>
                    </div>
                    {c.prevDate && <div className="text-xs text-muted-foreground md:col-span-2">Пред. проверка: {c.prevDate} · {c.prevGroup} · {c.prevGrade}</div>}
                  </div>
                  <button onClick={() => update({ candidates: state.candidates.filter((x) => x.id !== c.id) })}
                    className="p-1.5 rounded-lg hover:bg-red-50 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {showCandidatePicker && (
            <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
              <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md p-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="font-bold text-sm">Выбрать проверяемых</h3>
                  <button onClick={() => setShowCandidatePicker(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Icon name="X" size={15} /></button>
                </div>
                <div className="space-y-1.5 max-h-64 overflow-y-auto pr-1">
                  {MOCK_CANDIDATES.map((c) => {
                    const added = !!state.candidates.find((x) => x.id === c.id);
                    return (
                      <button key={c.id} onClick={() => { if (!added) update({ candidates: [...state.candidates, c] }); }} disabled={added}
                        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl border text-left transition-all ${added ? "border-emerald-200 bg-emerald-50/50 cursor-default" : "border-border hover:border-primary hover:bg-primary/5"}`}>
                        <div className="w-8 h-8 rounded-full gradient-primary flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
                          {c.fio.split(" ").map((w) => w[0]).join("").slice(0, 2)}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-semibold truncate">{c.fio}</div>
                          <div className="text-xs text-muted-foreground truncate">{c.position}</div>
                        </div>
                        {added && <Icon name="CheckCircle2" size={15} className="text-emerald-500 flex-shrink-0" />}
                      </button>
                    );
                  })}
                </div>
                <button onClick={() => setShowCandidatePicker(false)}
                  className="w-full px-4 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
                  Готово ({state.candidates.length})
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* STEP 3 */}
      {step === 3 && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <div>
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Результаты по разделам</h3>
            <p className="text-xs text-muted-foreground mt-0.5">При &gt;30% неверных ответов — «неудовл.»</p>
          </div>
          {state.candidates.map((c) => {
            const r = state.results[c.id] ?? { tech: "", safety: "", fire: "", other: "" };
            const overall = calcOverall(r);
            return (
              <div key={c.id} className={`border rounded-xl p-4 space-y-3 ${overall === "неудовл." ? "border-red-200 bg-red-50/30" : "border-border"}`}>
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <div className="text-sm font-semibold">{c.fio}</div>
                    <div className="text-xs text-muted-foreground">{c.position}</div>
                  </div>
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                    Итог: <OverallBadge grade={overall} />
                    {overall === "неудовл." && <Icon name="AlertCircle" size={13} className="text-red-500" />}
                  </div>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {(["tech", "safety", "fire", "other"] as const).map((field) => {
                    const labels = { tech: "Устройство", safety: "Охрана труда", fire: "Пожарная БЗ", other: "Другие правила" };
                    return (
                      <div key={field} className="flex flex-col gap-1">
                        <label className="text-[10px] font-semibold text-muted-foreground uppercase">{labels[field]}</label>
                        <select
                          className={`border rounded-lg px-2 py-1.5 text-xs bg-background focus:outline-none focus:ring-2 focus:ring-primary/30 ${r[field] === "неудовл." ? "border-red-300 bg-red-50" : r[field] ? "border-emerald-200" : "border-border"}`}
                          value={r[field]}
                          onChange={(e) => update({ results: { ...state.results, [c.id]: { ...r, [field]: e.target.value } } })}>
                          {GRADES.map((g) => <option key={g} value={g}>{g || "—"}</option>)}
                        </select>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* STEP 4 */}
      {step === 4 && (
        <div className="space-y-4">
          <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Заключение</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Итоговая группа ЭБ</label>
                <select className="border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={state.finalGroup} onChange={(e) => update({ finalGroup: e.target.value as EbGroup })}>
                  {EB_GROUPS.map((g) => <option key={g} value={g}>{g} группа</option>)}
                </select>
              </div>
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">К работам в ЭУ напряжением</label>
                {(["до 1000 В", "до и свыше 1000 В", "не применяется"] as const).map((v) => (
                  <label key={v} className="flex items-center gap-2 cursor-pointer mt-0.5">
                    <input type="radio" value={v} checked={state.voltage === v} onChange={() => update({ voltage: v })} className="accent-primary" />
                    <span className="text-sm">{v}</span>
                  </label>
                ))}
              </div>
              {needsProbation && (
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-semibold text-muted-foreground uppercase">Дублирование (рабочих смен)</label>
                  <input type="number" min={0} className="border border-border rounded-xl px-3 py-2 text-sm bg-background w-28 focus:outline-none focus:ring-2 focus:ring-primary/30"
                    value={state.probationDays} onChange={(e) => update({ probationDays: parseInt(e.target.value) || 0 })} />
                  <p className="text-xs text-muted-foreground">Для диспетчерского, оперативного, опер.-ремонтного (п.66)</p>
                </div>
              )}
              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-semibold text-muted-foreground uppercase">Дата следующей проверки</label>
                <input type="date" className="border border-border rounded-xl px-3 py-2 text-sm bg-background focus:outline-none focus:ring-2 focus:ring-primary/30"
                  value={state.nextVerifyDate} onChange={(e) => update({ nextVerifyDate: e.target.value })} />
                <p className="text-xs text-muted-foreground">Авторасчёт: +365 дней или +1095 (АТ без работ в ЭУ)</p>
              </div>
            </div>
          </div>

          <div className="bg-card border border-border rounded-2xl p-5 space-y-3">
            <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Подписание</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <button className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Icon name="ShieldCheck" size={15} /> Загрузить КЭП председателя
              </button>
              <button className="flex items-center gap-2 px-3 py-2.5 border border-dashed border-border rounded-xl text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                <Icon name="Upload" size={15} /> Скан подписи проверяемого
              </button>
            </div>
          </div>

          <button onClick={() => setShowPreview(true)}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 border border-border rounded-2xl text-sm font-medium hover:bg-muted transition-colors">
            <Icon name="Eye" size={15} /> Предпросмотр протокола (Приложение №2)
          </button>
        </div>
      )}

      {/* Footer */}
      <div className="flex items-center justify-between pt-4 border-t border-border">
        <button onClick={step === 1 ? onCancel : () => { setErrors([]); setStep((s) => (s - 1) as WizardStep); }}
          className="flex items-center gap-1.5 px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
          <Icon name="ArrowLeft" size={14} /> {step === 1 ? "Отмена" : "Назад"}
        </button>
        {step < 4 ? (
          <button onClick={goNext}
            className="flex items-center gap-1.5 px-5 py-2 rounded-xl gradient-primary text-white text-sm font-semibold hover:opacity-90 transition-opacity">
            Далее <Icon name="ArrowRight" size={14} />
          </button>
        ) : (
          <div className="flex gap-2">
            <button onClick={() => handleSave(false)}
              className="px-4 py-2 rounded-xl border border-border text-sm font-medium hover:bg-muted transition-colors">
              Черновик
            </button>
            <button onClick={() => handleSave(true)}
              className="flex items-center gap-1.5 px-5 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-semibold transition-colors">
              <Icon name="CheckCircle2" size={14} /> Утвердить
            </button>
          </div>
        )}
      </div>

      {/* Preview modal */}
      {showPreview && commission && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between p-5 border-b border-border sticky top-0 bg-card">
              <h3 className="font-bold text-sm">Предпросмотр · Приложение №2</h3>
              <button onClick={() => setShowPreview(false)} className="p-1.5 rounded-lg hover:bg-muted transition-colors"><Icon name="X" size={15} /></button>
            </div>
            <div className="p-6 font-serif text-sm leading-relaxed space-y-3">
              <h2 className="text-center font-bold">ПРОТОКОЛ ПРОВЕРКИ ЗНАНИЙ</h2>
              <p><b>Дата:</b> <u>{state.verifyDate}</u> · <b>Причина:</b> <u>{state.reason}</u></p>
              <p><b>Комиссия:</b> <u>{commission.name}</u><br />
              Председатель: <u>{commission.chairman.fio}, {commission.chairman.position}, гр. {commission.chairman.ebGroup}</u><br />
              Члены: {commission.members.map((m) => `${m.fio} (гр. ${m.ebGroup})`).join(", ")}</p>
              <p><b>НТД:</b> {ALL_NTD.map((n) => state.ntd.includes(n) ? <span key={n}>{n} </span> : <span key={n} className="line-through text-muted-foreground">{n} </span>)}</p>
              <hr />
              {state.candidates.map((c, i) => {
                const r = state.results[c.id] ?? { tech: "", safety: "", fire: "", other: "" };
                return (
                  <div key={c.id} className="space-y-1">
                    <p><b>{i + 1}. {c.fio}</b> — {c.position}</p>
                    <p>Устройство — <u>{r.tech || "—"}</u>, ОТ — <u>{r.safety || "—"}</u>, ПБ — <u>{r.fire || "—"}</u>, Другие — <u>{r.other || "—"}</u></p>
                    <p>Общая оценка: <b><u>{calcOverall(r)}</u></b></p>
                  </div>
                );
              })}
              <hr />
              <p>Группа ЭБ: <u><b>{state.finalGroup}</b></u> · Напряжение: <u>{state.voltage}</u></p>
              {needsProbation && <p>Дублирование: <u>{state.probationDays} рабочих смен</u></p>}
              <p>Следующая проверка: <u>{state.nextVerifyDate || "—"}</u></p>
              <div className="flex justify-between mt-4 text-xs">
                <span>Председатель: _________ / {commission.chairman.fio.split(" ")[0]} /</span>
                <span>Ознакомлен: _________ / {state.candidates[0]?.fio.split(" ")[0] ?? "—"} /</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}