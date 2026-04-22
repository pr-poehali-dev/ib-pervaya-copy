import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import type { Certificate } from "@/components/admin/types";

// ─── Мок вопросов теста ───────────────────────────────────────────────────────

type TestQuestion = {
  num: number;
  text: string;
  correct: boolean;
  userAnswer: string;
  correctAnswer: string;
};

export function generateTestQuestions(courseTitle: string, score: number): TestQuestion[] {
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

export default function TestProtocolModal({ cert, onClose }: { cert: Certificate; onClose: () => void }) {
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
