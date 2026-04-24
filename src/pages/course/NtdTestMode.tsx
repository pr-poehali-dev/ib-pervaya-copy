import { useState, useMemo } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { Question } from "@/data/questionsBank";
import { checkCorrect } from "./CoursePageTypes";
import { AnswerOptions, AnswerResult } from "./CoursePageShared";

// ─── Группировка вопросов по НТД ─────────────────────────────────────────────

function groupByNtd(questions: Question[]): Record<string, Question[]> {
  return questions.reduce<Record<string, Question[]>>((acc, q) => {
    const key = q.ntdRef || "Без источника";
    if (!acc[key]) acc[key] = [];
    acc[key].push(q);
    return acc;
  }, {});
}

// ─── Тест по одному НТД ──────────────────────────────────────────────────────

function NtdQuiz({
  ntdRef,
  ntdFull,
  questions,
  onBack,
}: {
  ntdRef: string;
  ntdFull: string;
  questions: Question[];
  onBack: () => void;
}) {
  const [idx, setIdx]           = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [results, setResults]   = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  const q = questions[idx];

  function handleToggle(i: number) {
    if (answered) return;
    setSelected((prev) =>
      prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]
    );
  }

  function handleSubmit() {
    if (selected.length === 0) return;
    setAnswered(true);
    setResults((prev) => [...prev, checkCorrect(q, selected)]);
  }

  function handleNext() {
    if (idx + 1 >= questions.length) {
      setFinished(true);
    } else {
      setIdx((p) => p + 1);
      setSelected([]);
      setAnswered(false);
    }
  }

  function handleRestart() {
    setIdx(0);
    setSelected([]);
    setAnswered(false);
    setResults([]);
    setFinished(false);
  }

  const correct = results.filter(Boolean).length;
  const score   = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;
  const passed  = score >= 70;

  if (finished) {
    return (
      <div className="space-y-5">
        <div className="flex items-center gap-2">
          <button
            onClick={onBack}
            className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
          >
            <Icon name="ArrowLeft" size={15} />
            К списку НТД
          </button>
        </div>

        <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
          <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${passed ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
            <Icon name={passed ? "Trophy" : "RefreshCw"} size={36} className={passed ? "text-emerald-600" : "text-red-500"} />
          </div>

          <div>
            <p className="text-2xl font-bold mb-1">{score}%</p>
            <p className="text-muted-foreground text-sm">
              {correct} из {results.length} верных ответов
            </p>
          </div>

          <div className={`w-full rounded-xl px-4 py-3 text-sm font-medium ${passed ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"}`}>
            {passed ? "Отличный результат! Вы хорошо знаете этот документ." : "Нужно ещё поработать с этим НТД. Попробуйте ещё раз."}
          </div>

          <div className="bg-muted/40 rounded-xl px-4 py-3 w-full text-left">
            <p className="text-xs text-muted-foreground font-medium mb-0.5">{ntdRef}</p>
            <p className="text-sm text-muted-foreground">{ntdFull}</p>
          </div>

          <div className="flex gap-3 w-full">
            <Button variant="outline" className="flex-1 gap-2" onClick={handleRestart}>
              <Icon name="RefreshCw" size={14} />
              Пройти снова
            </Button>
            <Button className="flex-1 gradient-primary text-white gap-2" onClick={onBack}>
              <Icon name="ArrowLeft" size={14} />
              К списку НТД
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Шапка */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeft" size={15} />
          К списку НТД
        </button>
        <span className="text-xs text-muted-foreground">
          Вопрос {idx + 1} / {questions.length}
        </span>
      </div>

      {/* Бейдж НТД */}
      <div className="flex items-center gap-2 bg-indigo-50 dark:bg-indigo-900/20 border border-indigo-200 dark:border-indigo-800 rounded-xl px-3 py-2">
        <Icon name="BookMarked" size={14} className="text-indigo-600 dark:text-indigo-400 flex-shrink-0" />
        <p className="text-xs text-indigo-700 dark:text-indigo-300 font-medium truncate">{ntdRef}</p>
      </div>

      {/* Прогресс-бар */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-indigo-500 to-blue-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${((idx) / questions.length) * 100}%` }}
        />
      </div>

      {/* Вопрос */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <p className="font-semibold text-base leading-relaxed mb-5">{q.text}</p>
        <AnswerOptions
          question={q}
          selected={selected}
          answered={answered}
          onToggle={handleToggle}
        />
      </div>

      {!answered ? (
        <Button
          className="w-full gradient-primary text-white rounded-xl gap-2"
          disabled={selected.length === 0}
          onClick={handleSubmit}
        >
          Ответить
          <Icon name="CheckCircle" size={15} />
        </Button>
      ) : (
        <AnswerResult
          question={q}
          isCorrect={checkCorrect(q, selected)}
          onNext={handleNext}
          nextLabel={idx + 1 >= questions.length ? "Завершить тест" : "Следующий вопрос"}
        />
      )}
    </div>
  );
}

// ─── Список карточек НТД ──────────────────────────────────────────────────────

export function NtdTestMode({
  questions,
  onBack,
  sectionName,
}: {
  questions: Question[];
  onBack?: () => void;
  sectionName?: string;
}) {
  const [selectedNtd, setSelectedNtd] = useState<string | null>(null);

  const grouped = useMemo(() => groupByNtd(questions), [questions]);
  const ntdKeys = Object.keys(grouped).sort();

  if (selectedNtd) {
    const qs = grouped[selectedNtd] ?? [];
    const fullNtd = qs[0]?.ntd ?? selectedNtd;
    return (
      <NtdQuiz
        ntdRef={selectedNtd}
        ntdFull={fullNtd}
        questions={qs}
        onBack={() => setSelectedNtd(null)}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Шапка */}
      <div className="flex items-center gap-2">
        {onBack && (
          <button onClick={onBack} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors mr-1">
            <Icon name="ArrowLeft" size={15} />
          </button>
        )}
        <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-lg flex items-center justify-center">
          <Icon name="BookMarked" size={13} className="text-white" />
        </div>
        <div>
          <p className="font-semibold text-sm">Тесты по НТД</p>
          {sectionName && <p className="text-xs text-muted-foreground">{sectionName}</p>}
        </div>
        <span className="ml-auto text-xs text-muted-foreground">{ntdKeys.length} документов</span>
      </div>

      <p className="text-sm text-muted-foreground px-1">
        Выберите нормативный документ — пройдёте тест только по вопросам из него
      </p>

      {/* Сетка карточек НТД */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {ntdKeys.map((ntdRef) => {
          const qs = grouped[ntdRef];
          const fullNtd = qs[0]?.ntd ?? ntdRef;
          return (
            <button
              key={ntdRef}
              onClick={() => setSelectedNtd(ntdRef)}
              className="text-left p-4 rounded-2xl border-2 border-indigo-100 dark:border-indigo-900/40 bg-indigo-50 dark:bg-indigo-900/10 hover:border-indigo-400 hover:shadow-md transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="FileText" size={16} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-sm text-indigo-700 dark:text-indigo-300 group-hover:text-indigo-800 dark:group-hover:text-indigo-200 mb-0.5">
                    {ntdRef}
                  </p>
                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {fullNtd}
                  </p>
                </div>
              </div>
              <div className="mt-3 flex items-center justify-between">
                <span className="text-xs text-muted-foreground">
                  {qs.length} {qs.length === 1 ? "вопрос" : qs.length < 5 ? "вопроса" : "вопросов"}
                </span>
                <span className="flex items-center gap-1 text-xs font-medium text-indigo-600 dark:text-indigo-400 group-hover:gap-2 transition-all">
                  Начать
                  <Icon name="ArrowRight" size={13} />
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
}