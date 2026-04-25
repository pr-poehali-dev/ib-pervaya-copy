import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { Question } from "@/data/questionsBank";
import { correctArr, type QuestionAnswer } from "./CoursePageTypes";

// ─── Протокол результатов теста ───────────────────────────────────────────────

export function TestResult({
  answers,
  isFinal,
  onRetry,
  onMenu,
  allQuestions,
}: {
  answers: QuestionAnswer[];
  isFinal: boolean;
  onRetry: () => void;
  onMenu: () => void;
  allQuestions: Question[];
}) {
  const correct = answers.filter((a) => a.isCorrect).length;
  const total   = answers.length;
  const score   = Math.round((correct / total) * 100);
  const passed  = score >= 70;
  const [showProtocol, setShowProtocol] = useState(false);

  return (
    <div className="space-y-5">
      <div className={`rounded-2xl border p-6 text-center ${passed ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"}`}>
        <div className={`w-16 h-16 rounded-full mx-auto mb-4 flex items-center justify-center ${passed ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
          <Icon name={passed ? "Trophy" : "XCircle"} size={32} className={passed ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"} />
        </div>
        <p className={`text-3xl font-bold mb-1 ${passed ? "text-emerald-700 dark:text-emerald-300" : "text-red-600 dark:text-red-400"}`}>
          {score}%
        </p>
        <p className={`text-lg font-semibold mb-2 ${passed ? "text-emerald-800 dark:text-emerald-200" : "text-red-700 dark:text-red-300"}`}>
          {passed ? "Тест сдан!" : "Тест не сдан"}
        </p>
        <p className="text-sm text-muted-foreground">
          Правильных ответов: <strong>{correct}</strong> из <strong>{total}</strong>
        </p>
        {isFinal && passed && (
          <div className="mt-4 flex items-center justify-center gap-2 px-4 py-2 bg-amber-100 dark:bg-amber-900/30 border border-amber-200 dark:border-amber-800 rounded-xl">
            <Icon name="Award" size={16} className="text-amber-600 dark:text-amber-400" />
            <p className="text-sm font-medium text-amber-800 dark:text-amber-200">
              Удостоверение ДПО будет выдано в течение 3 рабочих дней
            </p>
          </div>
        )}
      </div>

      <div className="flex flex-col sm:flex-row gap-2">
        {isFinal && (
          <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={onRetry}>
            <Icon name="RotateCcw" size={15} />
            Попробовать ещё раз
          </Button>
        )}
        <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={onMenu}>
          <Icon name="Home" size={15} />
          На главную курса
        </Button>
        <Button
          variant="outline"
          className="rounded-xl gap-2 sm:px-4"
          onClick={() => setShowProtocol((v) => !v)}
        >
          <Icon name={showProtocol ? "ChevronUp" : "FileText"} size={15} />
          {showProtocol ? "Скрыть протокол" : "Разбор ответов"}
        </Button>
      </div>

      {showProtocol && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-3 border-b border-border bg-muted/30">
            <p className="font-semibold text-sm">Разбор ответов</p>
          </div>
          <div className="divide-y divide-border">
            {answers.map((ans, idx) => {
              const q = allQuestions.find((q) => q.id === ans.questionId);
              if (!q) return null;
              return (
                <div key={ans.questionId} className="px-5 py-4 space-y-2">
                  <div className="flex items-start gap-2">
                    <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${ans.isCorrect ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                      <Icon name={ans.isCorrect ? "Check" : "X"} size={12} className={ans.isCorrect ? "text-emerald-600" : "text-red-500"} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium leading-snug">{idx + 1}. {q.text}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        Ваш ответ: <span className={ans.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>
                          {ans.selected.length > 0 ? ans.selected.map((i) => q.options[i]).join("; ") : "—"}
                        </span>
                      </p>
                      {!ans.isCorrect && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Верно: {correctArr(q).map((i) => q.options[i]).join("; ")}
                        </p>
                      )}
                      <p className="text-xs text-muted-foreground mt-1 flex items-center gap-1">
                        <Icon name="BookOpen" size={11} className="flex-shrink-0" />
                        {q.ntdRef} — {q.ntd}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Поиск ответа на вопрос ───────────────────────────────────────────────────

export function SearchAnswerMode({ onBack, allQuestions }: { onBack: () => void; allQuestions: Question[] }) {
  const [search,   setSearch]   = useState("");
  const [selected, setSelected] = useState<Question | null>(null);

  const filtered = search.length > 2
    ? allQuestions.filter((q) =>
        q.text.toLowerCase().includes(search.toLowerCase()) ||
        q.ntdRef.toLowerCase().includes(search.toLowerCase())
      )
    : [];

  return (
    <div className="space-y-4">
      <div className="bg-card rounded-2xl border border-border p-5">
        <p className="font-semibold mb-3">Поиск ответа на вопрос</p>
        <div className="relative">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Введите текст вопроса или тему..."
            className="w-full h-10 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        {search.length > 0 && search.length <= 2 && (
          <p className="text-xs text-muted-foreground mt-2">Введите не менее 3 символов для поиска</p>
        )}
      </div>

      {selected ? (
        <div className="space-y-4">
          <div className="bg-card rounded-2xl border border-border p-5 space-y-4">
            <p className="font-semibold leading-relaxed">{selected.text}</p>
            <div className="space-y-2">
              {correctArr(selected).map((correctIdx) => (
                <div key={correctIdx} className="px-4 py-3 rounded-xl flex items-center gap-3 bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500">
                  <div className="w-7 h-7 bg-emerald-500 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="Check" size={13} className="text-white" />
                  </div>
                  <span className="text-sm font-medium">{selected.options[correctIdx]}</span>
                </div>
              ))}
            </div>
            <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 flex items-start gap-2">
              <Icon name="BookOpen" size={15} className="text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-medium text-blue-700 dark:text-blue-300">{selected.ntdRef}</p>
                <p className="text-sm text-blue-800 dark:text-blue-200 mt-0.5">{selected.ntd}</p>
              </div>
            </div>
          </div>
          <div className="flex gap-2">
            <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setSelected(null)}>
              К поиску
            </Button>
          </div>
        </div>
      ) : (
        filtered.length > 0 ? (
          <div className="bg-card rounded-2xl border border-border divide-y divide-border overflow-hidden">
            {filtered.map((q) => (
              <button
                key={q.id}
                onClick={() => setSelected(q)}
                className="w-full text-left px-5 py-4 hover:bg-muted/30 transition-colors"
              >
                <p className="text-sm font-medium line-clamp-2">{q.text}</p>
                <p className="text-xs text-muted-foreground mt-1">{q.ntdRef}</p>
              </button>
            ))}
          </div>
        ) : search.length > 2 ? (
          <div className="bg-card rounded-2xl border border-border p-10 text-center">
            <Icon name="SearchX" size={32} className="text-muted-foreground mx-auto mb-3" />
            <p className="text-muted-foreground text-sm">Вопросы не найдены</p>
          </div>
        ) : null
      )}
    </div>
  );
}