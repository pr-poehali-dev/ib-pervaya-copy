import { useState, useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { CERTIFICATES } from "@/data/mockData";
import type { Certificate, CertificateStatus } from "@/components/admin/types";

// ─── Бейдж статуса удостоверения ─────────────────────────────────────────────

function CertBadge({ status }: { status: CertificateStatus }) {
  const map: Record<CertificateStatus, { label: string; cls: string }> = {
    ready:  { label: "Готов к выдаче", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
    issued: { label: "Выдан",          cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
  };
  const { label, cls } = map[status];
  return <Badge className={`text-xs ${cls}`}>{label}</Badge>;
}

// ─── Мок вопросов теста ───────────────────────────────────────────────────────

type TestQuestion = {
  num: number;
  text: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
};

function generateTestQuestions(courseTitle: string, score: number): TestQuestion[] {
  const total = 20;
  const correctCount = Math.round((score / 100) * total);
  const base: Omit<TestQuestion, "num" | "correct">[] = [
    { text: "Какой документ регламентирует требования промышленной безопасности?", userAnswer: "Федеральный закон № 116-ФЗ", correctAnswer: "Федеральный закон № 116-ФЗ" },
    { text: "Что является основным требованием при допуске к работе на опасных объектах?", userAnswer: "Наличие удостоверения и инструктажа", correctAnswer: "Наличие удостоверения и инструктажа" },
    { text: "Периодичность проверки знаний по промышленной безопасности:", userAnswer: "Раз в год", correctAnswer: "Раз в 5 лет" },
    { text: "Какой орган осуществляет надзор за промышленной безопасностью?", userAnswer: "Ростехнадзор", correctAnswer: "Ростехнадзор" },
    { text: "Что такое план локализации и ликвидации аварий (ПЛЛА)?", userAnswer: "Документ о порядке действий при аварии", correctAnswer: "Документ о порядке действий при аварии" },
    { text: "Срок хранения актов о расследовании несчастных случаев:", userAnswer: "10 лет", correctAnswer: "45 лет" },
    { text: "Кто несёт ответственность за безопасное состояние ОПО?", userAnswer: "Руководитель организации", correctAnswer: "Руководитель организации" },
    { text: "Что означает аббревиатура ОПО?", userAnswer: "Опасный производственный объект", correctAnswer: "Опасный производственный объект" },
    { text: "Обязательное условие для получения лицензии на ОПО:", userAnswer: "Страхование гражданской ответственности", correctAnswer: "Страхование гражданской ответственности" },
    { text: "Классы опасности производственных объектов:", userAnswer: "I–IV", correctAnswer: "I–IV" },
    { text: "Минимальный возраст работника для допуска к работе на ОПО:", userAnswer: "18 лет", correctAnswer: "18 лет" },
    { text: "Периодичность технического освидетельствования сосудов под давлением:", userAnswer: "Каждые 2 года", correctAnswer: "Каждые 4 года" },
    { text: "Что должно быть указано в наряд-допуске?", userAnswer: "Перечень работ и меры безопасности", correctAnswer: "Перечень работ и меры безопасности" },
    { text: "При каком давлении сосуд считается работающим под давлением?", userAnswer: "Свыше 0,07 МПа", correctAnswer: "Свыше 0,07 МПа" },
    { text: "Что такое декларация промышленной безопасности?", userAnswer: "Отчёт о рисках ОПО", correctAnswer: "Документ с оценкой риска аварий" },
    { text: "Периодичность учебных тревог на ОПО I–II класса:", userAnswer: "Раз в год", correctAnswer: "Раз в полгода" },
    { text: "Кто проводит аттестацию работников в области промышленной безопасности?", userAnswer: "Ростехнадзор", correctAnswer: "Ростехнадзор" },
    { text: "Срок действия удостоверения о проверке знаний по ПБ:", userAnswer: "5 лет", correctAnswer: "5 лет" },
    { text: "Что относится к средствам индивидуальной защиты?", userAnswer: "Каски, перчатки, очки, спецодежда", correctAnswer: "Каски, перчатки, очки, спецодежда" },
    { text: `Основной нормативный документ, регулирующий деятельность в области «${courseTitle.slice(0, 30)}»:`, userAnswer: "Технические регламенты и федеральные нормы", correctAnswer: "Технические регламенты и федеральные нормы" },
  ];
  return base.map((q, i) => ({
    ...q,
    num: i + 1,
    correct: i < correctCount,
    userAnswer: i < correctCount ? q.correctAnswer : q.userAnswer,
  }));
}

// ─── Модал протокола тестирования ─────────────────────────────────────────────

function TestProtocolModal({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
  const questions = generateTestQuestions(cert.courseTitle, cert.testScore);
  const correct = questions.filter((q) => q.correct).length;
  const total = questions.length;
  const passed = cert.testScore >= 70;

  function handlePrint() {
    const el = document.getElementById("protocol-print-area");
    if (!el) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`<html><head><title>Протокол тестирования</title><style>
      body { font-family: Arial, sans-serif; font-size: 12pt; padding: 20mm; }
      table { width: 100%; border-collapse: collapse; margin-top: 12px; }
      th, td { border: 1px solid #ccc; padding: 6px 8px; text-align: left; }
      th { background: #f0f0f0; }
      .ok { color: #16a34a; } .fail { color: #dc2626; }
      h2 { margin-bottom: 4px; } p { margin: 2px 0; }
    </style></head><body>${el.innerHTML}</body></html>`);
    win.document.close();
    win.focus();
    win.print();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-2xl flex flex-col max-h-[90vh]">
        {/* Шапка */}
        <div className="flex items-center justify-between p-6 border-b border-border shrink-0">
          <div>
            <h3 className="font-semibold text-base">Протокол тестирования</h3>
            <p className="text-xs text-muted-foreground mt-0.5">{cert.userName} · {cert.testPassedAt}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Содержимое */}
        <div className="overflow-y-auto flex-1 p-6 space-y-4" id="protocol-print-area">
          {/* Шапка протокола */}
          <div className="bg-muted/40 rounded-xl p-4 space-y-1 text-sm">
            <div className="flex justify-between"><span className="text-muted-foreground">Слушатель</span><span className="font-medium">{cert.userName}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Организация</span><span>{cert.userOrganization ?? "—"}</span></div>
            <div className="flex justify-between gap-4"><span className="text-muted-foreground shrink-0">Курс</span><span className="text-right">{cert.courseTitle}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Дата тестирования</span><span>{cert.testPassedAt}</span></div>
            <div className="flex justify-between"><span className="text-muted-foreground">Результат</span>
              <span className={`font-bold ${passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}`}>
                {cert.testScore}% ({correct}/{total}) — {passed ? "Зачтено" : "Не зачтено"}
              </span>
            </div>
          </div>

          {/* Итоговая полоса */}
          <div className="space-y-1">
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Правильных ответов</span>
              <span>{correct} из {total}</span>
            </div>
            <div className="h-2 bg-muted rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${passed ? "bg-emerald-500" : "bg-red-500"}`}
                style={{ width: `${cert.testScore}%` }}
              />
            </div>
          </div>

          {/* Таблица вопросов */}
          <div className="border border-border rounded-xl overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-muted/40 border-b border-border">
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground w-8">№</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Вопрос</th>
                  <th className="px-3 py-2 text-left font-medium text-muted-foreground">Ответ слушателя</th>
                  <th className="px-3 py-2 text-center font-medium text-muted-foreground w-16">Итог</th>
                </tr>
              </thead>
              <tbody>
                {questions.map((q) => (
                  <tr key={q.num} className={`border-b border-border last:border-0 ${q.correct ? "" : "bg-red-50/40 dark:bg-red-900/10"}`}>
                    <td className="px-3 py-2 text-muted-foreground">{q.num}</td>
                    <td className="px-3 py-2">{q.text}</td>
                    <td className="px-3 py-2 text-muted-foreground">
                      {q.correct ? q.userAnswer : (
                        <span className="text-red-500 dark:text-red-400">{q.userAnswer !== q.correctAnswer ? q.userAnswer || "—" : q.userAnswer}</span>
                      )}
                    </td>
                    <td className="px-3 py-2 text-center">
                      {q.correct
                        ? <Icon name="CheckCircle" size={15} className="text-emerald-500 mx-auto" />
                        : <Icon name="XCircle" size={15} className="text-red-500 mx-auto" />
                      }
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Кнопки */}
        <div className="p-6 pt-0 flex gap-2 shrink-0 border-t border-border mt-4">
          <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={handlePrint}>
            <Icon name="Printer" size={15} />
            Печать протокола
          </Button>
          <Button variant="outline" className="rounded-xl px-4" onClick={onClose}>Закрыть</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Шаблон удостоверения ─────────────────────────────────────────────────────

function CertificateTemplate({ cert }: { cert: Certificate }) {
  const today = new Date().toLocaleDateString("ru-RU", { day: "2-digit", month: "long", year: "numeric" });
  const certNum = cert.certificateNumber ?? `ДПО-${new Date().getFullYear()}-${String(cert.id).padStart(3, "0")}`;

  return (
    <div
      id="certificate-template"
      className="bg-white text-black"
      style={{
        width: "297mm",
        minHeight: "210mm",
        padding: "20mm 25mm",
        fontFamily: "Times New Roman, serif",
        position: "relative",
        boxSizing: "border-box",
      }}
    >
      {/* Рамка */}
      <div style={{
        position: "absolute", inset: "8mm",
        border: "3px solid #1a1a6e",
        borderRadius: "4px",
        pointerEvents: "none",
      }} />
      <div style={{
        position: "absolute", inset: "10mm",
        border: "1px solid #1a1a6e",
        borderRadius: "3px",
        pointerEvents: "none",
      }} />

      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        {/* Шапка */}
        <p style={{ fontSize: "11pt", marginBottom: "4mm", color: "#1a1a6e", letterSpacing: "1px" }}>
          МИНИСТЕРСТВО ОБРАЗОВАНИЯ И НАУКИ РОССИЙСКОЙ ФЕДЕРАЦИИ
        </p>
        <p style={{ fontSize: "12pt", fontWeight: "bold", marginBottom: "8mm", color: "#1a1a6e" }}>
          ООО «УЦ ИСП»
        </p>
        <p style={{ fontSize: "10pt", marginBottom: "2mm", color: "#555" }}>
          Лицензия на осуществление образовательной деятельности № 9999 от 09.02.2026
        </p>

        <div style={{ margin: "8mm 0 4mm", borderBottom: "1px solid #1a1a6e" }} />

        {/* Заголовок */}
        <p style={{ fontSize: "20pt", fontWeight: "bold", letterSpacing: "3px", color: "#1a1a6e", margin: "6mm 0 2mm" }}>
          УДОСТОВЕРЕНИЕ
        </p>
        <p style={{ fontSize: "14pt", letterSpacing: "2px", color: "#1a1a6e", marginBottom: "8mm" }}>
          О ПОВЫШЕНИИ КВАЛИФИКАЦИИ
        </p>
        <p style={{ fontSize: "9pt", color: "#777", marginBottom: "6mm" }}>№ {certNum}</p>

        {/* Тело */}
        <p style={{ fontSize: "12pt", marginBottom: "4mm" }}>
          Настоящее удостоверение выдано
        </p>
        <p style={{ fontSize: "16pt", fontWeight: "bold", borderBottom: "1px solid #333", display: "inline-block", paddingBottom: "1mm", marginBottom: "6mm", minWidth: "200mm" }}>
          {cert.userName}
        </p>

        <p style={{ fontSize: "11pt", marginBottom: "4mm", lineHeight: "1.6" }}>
          в том, что он(а) в период с {cert.testPassedAt} по {cert.issuedAt ?? today} прошёл(а) обучение
          по дополнительной профессиональной программе повышения квалификации:
        </p>

        <p style={{ fontSize: "13pt", fontWeight: "bold", fontStyle: "italic", margin: "4mm 0 2mm", color: "#1a1a6e" }}>
          «{cert.courseTitle}»
        </p>
        {cert.courseCode && (
          <p style={{ fontSize: "10pt", color: "#555", marginBottom: "2mm" }}>({cert.courseCode})</p>
        )}
        <p style={{ fontSize: "11pt", marginBottom: "6mm" }}>
          Объём программы: <strong>{cert.courseHours ?? "—"} академических часов</strong>
        </p>

        <p style={{ fontSize: "11pt", marginBottom: "8mm" }}>
          Итоговая аттестация пройдена с результатом: <strong>{cert.testScore}%</strong>
        </p>

        <div style={{ margin: "4mm 0", borderBottom: "1px solid #1a1a6e" }} />

        {/* Подписи */}
        <div style={{ display: "flex", justifyContent: "space-between", marginTop: "8mm", fontSize: "10pt" }}>
          <div style={{ textAlign: "left" }}>
            <p style={{ marginBottom: "12mm" }}>Дата выдачи: <strong>{cert.issuedAt ?? today}</strong></p>
            <p>Регистрационный номер: <strong>{certNum}</strong></p>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ width: "60mm", height: "60mm", border: "1px dashed #aaa", borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", color: "#aaa", fontSize: "9pt" }}>
              М.П.
            </div>
          </div>
          <div style={{ textAlign: "right" }}>
            <p style={{ marginBottom: "12mm" }}>Директор</p>
            <p style={{ borderTop: "1px solid #333", paddingTop: "1mm" }}>
              {cert.issuedBy ?? "________________"}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Модальное окно выдачи удостоверения ──────────────────────────────────────

function IssueCertModal({
  cert,
  onClose,
  onIssue,
}: {
  cert: Certificate;
  onClose: () => void;
  onIssue: (certNum: string, issuedBy: string) => void;
}) {
  const [certNum,  setCertNum]  = useState(`ДПО-${new Date().getFullYear()}-${String(cert.id).padStart(3, "0")}`);
  const [issuedBy, setIssuedBy] = useState("Иванов И.И.");
  const [showPreview, setShowPreview] = useState(false);
  const printRef = useRef<HTMLDivElement>(null);

  function handlePrint() {
    const content = document.getElementById("certificate-template");
    if (!content) return;
    const win = window.open("", "_blank");
    if (!win) return;
    win.document.write(`
      <html><head><title>Удостоверение ДПО</title>
      <style>
        @page { size: A4 landscape; margin: 0; }
        body { margin: 0; }
        #certificate-template { page-break-inside: avoid; }
      </style>
      </head><body>${content.outerHTML}</body></html>
    `);
    win.document.close();
    win.focus();
    win.print();
  }

  const previewCert: Certificate = {
    ...cert,
    certificateNumber: certNum,
    issuedBy,
    issuedAt: new Date().toLocaleDateString("ru-RU"),
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-bold text-base">Выдача удостоверения ДПО</h2>
            <p className="text-xs text-muted-foreground">{cert.userName} · {cert.courseTitle}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl p-4 flex items-center gap-3">
            <Icon name="CheckCircle" size={18} className="text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div>
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300">Тест сдан успешно</p>
              <p className="text-xs text-emerald-700 dark:text-emerald-400">Результат: {cert.testScore}% · Дата: {cert.testPassedAt}</p>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Номер удостоверения</label>
              <input value={certNum} onChange={(e) => setCertNum(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Подписант</label>
              <input value={issuedBy} onChange={(e) => setIssuedBy(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
          </div>
          <Button
            variant="outline"
            className="w-full rounded-xl gap-2"
            onClick={() => setShowPreview(!showPreview)}
          >
            <Icon name={showPreview ? "EyeOff" : "Eye"} size={15} />
            {showPreview ? "Скрыть предпросмотр" : "Предпросмотр"}
          </Button>

          {showPreview && (
            <div className="border border-border rounded-xl overflow-hidden" style={{ transform: "scale(0.35)", transformOrigin: "top left", height: "105mm", marginBottom: "-68%" }}>
              <div ref={printRef}>
                <CertificateTemplate cert={previewCert} />
              </div>
            </div>
          )}
        </div>
        <div className="flex gap-2 p-6 border-t border-border">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button variant="outline" className="rounded-xl gap-2" onClick={handlePrint}>
            <Icon name="Printer" size={15} />
            Печать
          </Button>
          <Button className="flex-1 rounded-xl gradient-primary text-white gap-2" onClick={() => onIssue(certNum, issuedBy)}>
            <Icon name="Award" size={15} />
            Выдать
          </Button>
        </div>
      </div>

      {/* Скрытый шаблон для печати */}
      {showPreview && (
        <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
          <CertificateTemplate cert={previewCert} />
        </div>
      )}
    </div>
  );
}

// ─── Главная панель удостоверений ─────────────────────────────────────────────

export default function CertificatesPanel() {
  const [certs, setCerts] = useState<Certificate[]>(CERTIFICATES);
  const [issueTarget, setIssueTarget] = useState<Certificate | null>(null);
  const [tab, setTab] = useState<"ready" | "issued">("ready");
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [viewCert, setViewCert] = useState<Certificate | null>(null);
  const [protocolCert, setProtocolCert] = useState<Certificate | null>(null);
  const [filterOrg, setFilterOrg] = useState<string>("");

  const ready  = certs.filter((c) => c.status === "ready");
  const issued = certs.filter((c) => c.status === "issued");
  const orgOptions = [...new Set(issued.map((c) => c.userOrganization).filter(Boolean))] as string[];

  function handleIssue(certNum: string, issuedBy: string) {
    if (!issueTarget) return;
    setCerts((prev) =>
      prev.map((c) =>
        c.id === issueTarget.id
          ? {
              ...c,
              status: "issued",
              issuedAt: new Date().toLocaleDateString("ru-RU"),
              issuedBy,
              certificateNumber: certNum,
            }
          : c
      )
    );
    setIssueTarget(null);
  }

  const list = tab === "ready"
    ? ready
    : issued.filter((c) => !filterOrg || c.userOrganization === filterOrg);

  function toggleSelect(id: number) {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  }

  function toggleSelectAll() {
    if (selectedIds.size === list.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(list.map((c) => c.id)));
    }
  }

  return (
    <div className="space-y-4">
      {issueTarget && (
        <IssueCertModal
          cert={issueTarget}
          onClose={() => setIssueTarget(null)}
          onIssue={handleIssue}
        />
      )}
      {protocolCert && (
        <TestProtocolModal cert={protocolCert} onClose={() => setProtocolCert(null)} />
      )}

      {/* Модал просмотра выданного удостоверения */}
      {viewCert && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <div className="bg-card rounded-2xl border border-border shadow-xl w-full max-w-md space-y-0 overflow-hidden">
            <div className="flex items-center justify-between p-6 border-b border-border">
              <div>
                <h3 className="font-semibold text-base">Удостоверение ДПО</h3>
                <p className="text-xs text-muted-foreground mt-0.5">{viewCert.certificateNumber ?? "—"}</p>
              </div>
              <button onClick={() => setViewCert(null)} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
                <Icon name="X" size={18} />
              </button>
            </div>
            <div className="p-6 space-y-2 text-sm">
              <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Слушатель</span><span className="font-medium">{viewCert.userName}</span></div>
              <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Организация</span><span>{viewCert.userOrganization ?? "—"}</span></div>
              <div className="flex justify-between py-1 border-b border-border/50 gap-4"><span className="text-muted-foreground shrink-0">Курс</span><span className="text-right">{viewCert.courseTitle}</span></div>
              <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Код</span><span className="font-mono">{viewCert.courseCode ?? "—"}</span></div>
              <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Часов</span><span>{viewCert.courseHours ? `${viewCert.courseHours} ч` : "—"}</span></div>
              <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Результат</span><span className="font-semibold text-emerald-600 dark:text-emerald-400">{viewCert.testScore}%</span></div>
              <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Дата теста</span><span>{viewCert.testPassedAt}</span></div>
              <div className="flex justify-between py-1 border-b border-border/50"><span className="text-muted-foreground">Дата выдачи</span><span>{viewCert.issuedAt ?? "—"}</span></div>
              <div className="flex justify-between py-1"><span className="text-muted-foreground">Выдал</span><span>{viewCert.issuedBy ?? "—"}</span></div>
            </div>
            <div className="p-6 pt-0 space-y-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl gap-2 text-sm"
                  onClick={() => {
                    const content = document.getElementById("cert-view-template");
                    if (!content) return;
                    const win = window.open("", "_blank");
                    if (!win) return;
                    win.document.write(`<html><head><title>Удостоверение ДПО</title><style>@page{size:A4 landscape;margin:0}body{margin:0}</style></head><body>${content.outerHTML}</body></html>`);
                    win.document.close();
                    win.focus();
                    win.print();
                  }}
                >
                  <Icon name="Eye" size={15} />
                  Показать удостоверение
                </Button>
                <Button
                  variant="outline"
                  className="flex-1 rounded-xl gap-2 text-sm"
                  onClick={() => {
                    const content = document.getElementById("cert-view-template");
                    if (!content) return;
                    const blob = new Blob([`<html><head><style>@page{size:A4 landscape;margin:0}body{margin:0}</style></head><body>${content.outerHTML}</body></html>`], { type: "text/html" });
                    const a = document.createElement("a");
                    a.href = URL.createObjectURL(blob);
                    a.download = `${viewCert.certificateNumber ?? "certificate"}.html`;
                    a.click();
                  }}
                >
                  <Icon name="Download" size={15} />
                  Скачать
                </Button>
              </div>
              <Button variant="outline" className="w-full rounded-xl text-sm" onClick={() => setViewCert(null)}>Закрыть</Button>
            </div>
            {/* Скрытый шаблон для печати/скачивания */}
            <div style={{ position: "fixed", left: "-9999px", top: 0 }}>
              <div id="cert-view-template">
                <CertificateTemplate cert={viewCert} />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Переключатель */}
      <div className="flex gap-2">
        <button
          onClick={() => setTab("ready")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${tab === "ready" ? "gradient-primary text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted/60"}`}
        >
          <Icon name="Clock" size={15} />
          Готовы к выдаче
          {ready.length > 0 && (
            <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {ready.length}
            </span>
          )}
        </button>
        <button
          onClick={() => setTab("issued")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${tab === "issued" ? "gradient-primary text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted/60"}`}
        >
          <Icon name="Award" size={15} />
          Выданные ({issued.length})
        </button>
      </div>

      {/* Уведомление */}
      {tab === "ready" && ready.length > 0 && (
        <div className="flex items-center gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <Icon name="AlertCircle" size={16} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">{ready.length} слушателей</span> успешно сдали итоговый тест и ожидают выдачи удостоверения ДПО.
          </p>
        </div>
      )}

      {/* Панель действий и фильтров — только для вкладки «Выданные» */}
      {tab === "issued" && (
        <div className="flex items-center gap-2 flex-wrap">
          {/* Фильтр по организации */}
          <select
            value={filterOrg}
            onChange={(e) => setFilterOrg(e.target.value)}
            className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 text-foreground"
          >
            <option value="">Все организации</option>
            {orgOptions.map((org) => (
              <option key={org} value={org}>{org}</option>
            ))}
          </select>
          {filterOrg && (
            <button
              onClick={() => setFilterOrg("")}
              className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground"
            >
              <Icon name="X" size={12} />
              Сбросить
            </button>
          )}
          {selectedIds.size > 0 && (
            <span className="text-sm text-muted-foreground">Выбрано: {selectedIds.size}</span>
          )}
          <div className="ml-auto flex gap-2">
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2 text-sm"
              disabled={selectedIds.size === 0}
            >
              <Icon name="Printer" size={14} />
              Печать
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="rounded-xl gap-2 text-sm"
              disabled={selectedIds.size === 0}
            >
              <Icon name="Download" size={14} />
              Скачать
            </Button>
          </div>
        </div>
      )}

      {/* Таблица */}
      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-3 py-3 w-8">
                  <input
                    type="checkbox"
                    className="rounded border-border"
                    checked={list.length > 0 && selectedIds.size === list.length}
                    onChange={toggleSelectAll}
                  />
                </th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Организация</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Слушатель</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Курс</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Код</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Часов</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Результат</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Дата теста</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действие</th>
              </tr>
            </thead>
            <tbody>
              {list.map((cert, idx) => (
                <tr key={cert.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${selectedIds.has(cert.id) ? "bg-primary/5" : idx % 2 !== 0 ? "bg-muted/5" : ""}`}>
                  <td className="px-3 py-3 w-8">
                    <input
                      type="checkbox"
                      className="rounded border-border"
                      checked={selectedIds.has(cert.id)}
                      onChange={() => toggleSelect(cert.id)}
                    />
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm max-w-[160px] truncate" title={cert.userOrganization}>{cert.userOrganization ?? "—"}</p>
                  </td>
                  <td className="px-4 py-3">
                    <div>
                      <p className="font-medium">{cert.userName}</p>
                      <p className="text-xs text-muted-foreground">{cert.userEmail}</p>
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <p className="text-sm max-w-[200px] truncate" title={cert.courseTitle}>{cert.courseTitle}</p>
                  </td>
                  <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{cert.courseCode ?? "—"}</td>
                  <td className="px-4 py-3 text-muted-foreground">{cert.courseHours ? `${cert.courseHours} ч` : "—"}</td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${cert.testScore >= 80 ? "text-emerald-600 dark:text-emerald-400" : "text-amber-600 dark:text-amber-400"}`}>
                        {cert.testScore}%
                      </span>
                      <button
                        title="Посмотреть протокол"
                        className="text-muted-foreground hover:text-foreground transition-colors"
                        onClick={() => setProtocolCert(cert)}
                      >
                        <Icon name="FileText" size={14} />
                      </button>
                    </div>
                  </td>
                  <td className="px-4 py-3 text-muted-foreground">{cert.testPassedAt}</td>
                  <td className="px-4 py-3">
                    <div className="space-y-1">
                      <CertBadge status={cert.status} />
                      {cert.status === "issued" && cert.certificateNumber && (
                        <p className="text-xs text-muted-foreground font-mono">{cert.certificateNumber}</p>
                      )}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    {cert.status === "ready" ? (
                      <Button
                        size="sm"
                        className="rounded-lg gradient-primary text-white text-xs h-7 px-3 gap-1"
                        onClick={() => setIssueTarget(cert)}
                      >
                        <Icon name="Award" size={12} />
                        Выдать
                      </Button>
                    ) : (
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          className="rounded-lg text-xs h-7 px-3 gap-1"
                          onClick={() => setViewCert(cert)}
                        >
                          <Icon name="Eye" size={12} />
                          Просмотреть
                        </Button>
                      </div>
                    )}
                  </td>
                </tr>
              ))}
              {list.length === 0 && (
                <tr>
                  <td colSpan={10} className="px-4 py-12 text-center">
                    <div className="flex flex-col items-center gap-3">
                      <div className="w-12 h-12 bg-muted/40 rounded-2xl flex items-center justify-center">
                        <Icon name="Award" size={22} className="text-muted-foreground" />
                      </div>
                      <p className="text-muted-foreground text-sm">
                        {tab === "ready" ? "Нет слушателей, готовых к получению удостоверения" : "Удостоверения ещё не выдавались"}
                      </p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}