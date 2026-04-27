import Icon from "@/components/ui/icon";
import type { Question } from "@/data/questionsBank";
import type { TestAttempt } from "./CoursePageTypes";

export function CourseHistoryModal({
  finalTestHistory,
  historyProtocol,
  questions,
  onClose,
  onSetProtocol,
}: {
  finalTestHistory: TestAttempt[];
  historyProtocol: TestAttempt | null;
  questions: Question[];
  onClose: () => void;
  onSetProtocol: (attempt: TestAttempt | null) => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <p className="font-bold">История итогового тестирования</p>
            <p className="text-xs text-muted-foreground mt-0.5">{finalTestHistory.length} попыток</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="overflow-y-auto overflow-x-hidden flex-1">
          {historyProtocol ? (
            <div className="p-4 space-y-3">
              <button
                onClick={() => onSetProtocol(null)}
                className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground"
              >
                <Icon name="ArrowLeft" size={14} /> Назад к истории
              </button>
              <div className={`rounded-xl px-4 py-3 flex items-center gap-3 ${historyProtocol.passed ? "bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800"}`}>
                <Icon name={historyProtocol.passed ? "Trophy" : "XCircle"} size={18} className={historyProtocol.passed ? "text-emerald-600" : "text-red-500"} />
                <div>
                  <p className="font-semibold text-sm">{historyProtocol.score}% · {historyProtocol.correct} из {historyProtocol.total} верно</p>
                  <p className="text-xs text-muted-foreground">{historyProtocol.date}</p>
                </div>
              </div>
              <div className="space-y-2">
                {historyProtocol.answers.map((ans, idx) => {
                  const q = questions.find((q) => q.id === ans.questionId);
                  if (!q) return null;
                  return (
                    <div key={ans.questionId} className="bg-card rounded-xl border border-border p-3 flex gap-3">
                      <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${ans.isCorrect ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                        <Icon name={ans.isCorrect ? "Check" : "X"} size={11} className={ans.isCorrect ? "text-emerald-600" : "text-red-500"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium leading-snug">{idx + 1}. {q.text}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Ваш ответ: <span className={ans.isCorrect ? "text-emerald-600" : "text-red-500"}>
                            {ans.selected.length > 0 ? ans.selected.map((i) => q.options[i]).join("; ") : "—"}
                          </span>
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ) : finalTestHistory.length === 0 ? (
            <div className="p-10 text-center text-muted-foreground text-sm">
              Попыток пока нет
            </div>
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-sm min-w-[300px] sm:min-w-[380px]">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">№</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">Дата</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">Результат</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs">Статус</th>
                  <th className="px-4 py-2 text-left font-medium text-muted-foreground text-xs"></th>
                </tr>
              </thead>
              <tbody>
                {finalTestHistory.map((attempt, idx) => (
                  <tr key={attempt.id} className="border-b border-border last:border-0">
                    <td className="px-4 py-3 text-muted-foreground">{idx + 1}</td>
                    <td className="px-4 py-3 text-muted-foreground">{attempt.date}</td>
                    <td className="px-4 py-3 font-semibold">{attempt.correct} / {attempt.total} ({attempt.score}%)</td>
                    <td className="px-4 py-3">
                      <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${attempt.passed ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"}`}>
                        {attempt.passed ? "Сдал" : "Не сдал"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <button onClick={() => onSetProtocol(attempt)} className="text-xs text-primary hover:underline">
                        Протокол
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}