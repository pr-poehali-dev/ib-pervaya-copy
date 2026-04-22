import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Question } from "@/data/questionsBank";
import {
  checkCorrect,
  correctArr,
  type QuestionAnswer,
  type SectionStatus,
} from "./CoursePageTypes";
import { AnswerOptions, AnswerResult, QuestionNav } from "./CoursePageShared";

// ─── Адаптивный тренинг: один вопрос ─────────────────────────────────────────

export function AdaptiveQuestion({
  question,
  onToggle,
  onNext,
  onSubmit,
  answered,
  selected,
}: {
  question: Question;
  onToggle: (idx: number) => void;
  onNext: () => void;
  onSubmit: () => void;
  answered: boolean;
  selected: number[];
}) {
  const isCorrect = checkCorrect(question, selected);

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-border p-6">
        <p className="font-semibold text-base leading-relaxed mb-5">{question.text}</p>
        <AnswerOptions question={question} selected={selected} answered={answered} onToggle={onToggle} />
      </div>

      {!answered ? (
        <Button
          className="w-full gradient-primary text-white rounded-xl gap-2"
          disabled={selected.length === 0}
          onClick={onSubmit}
        >
          Ответить
          <Icon name="CheckCircle" size={15} />
        </Button>
      ) : (
        <AnswerResult question={question} isCorrect={isCorrect} onNext={onNext} nextLabel="Следующий вопрос" />
      )}
    </div>
  );
}

// ─── Итоговый / секционный тест ───────────────────────────────────────────────

export function FinalTest({
  onFinish,
  isFinal,
  allQuestions,
  onCurrentChange,
  onAnswer,
  navPanel,
}: {
  onFinish: (answers: QuestionAnswer[]) => void;
  isFinal: boolean;
  allQuestions: Question[];
  onCurrentChange?: (idx: number) => void;
  onAnswer?: (questionId: number, isCorrect: boolean) => void;
  navPanel?: React.ReactNode;
}) {
  const questions = isFinal ? allQuestions.slice(0, 10) : allQuestions.slice(0, 5);
  const [current,       setCurrent]       = useState(0);
  const [draftSelected, setDraftSelected] = useState<number[]>([]);
  const [submitted,     setSubmitted]     = useState(false);
  const [sectionAnswers, setSectionAnswers] = useState<QuestionAnswer[]>([]);
  const [finalAnswers,  setFinalAnswers]  = useState<Record<number, number[]>>({});
  const [showConfirm,   setShowConfirm]   = useState(false);

  const TOTAL_SECONDS = 30 * 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!isFinal) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(intervalRef.current!); onFinishFinal(); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isFinal]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const timerWarning = timeLeft < 5 * 60;

  const q = questions[current];
  const progress = Math.round((current / questions.length) * 100);
  const finalCurrentSelected = finalAnswers[q.id] ?? [];
  const answeredCount = questions.filter((qq) => (finalAnswers[qq.id]?.length ?? 0) > 0).length;
  const isLastQuestion = current === questions.length - 1;
  const currentAnswered = (finalAnswers[q?.id]?.length ?? 0) > 0;

  function handleFinalToggle(idx: number) {
    const prev = finalAnswers[q.id] ?? [];
    const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
    setFinalAnswers((fa) => ({ ...fa, [q.id]: next }));
  }

  function handleFinalSubmit() {
    const sel = finalAnswers[q.id] ?? [];
    if (sel.length === 0) return;
    const nextUnanswered = questions.findIndex((qq, i) => i > current && !(finalAnswers[qq.id]?.length));
    const nextIdx = nextUnanswered !== -1 ? nextUnanswered : (current + 1 < questions.length ? current + 1 : current);
    if (nextIdx !== current) {
      setCurrent(nextIdx);
      onCurrentChange?.(nextIdx);
    }
  }

  function onFinishFinal() {
    if (intervalRef.current) clearInterval(intervalRef.current);
    const result: QuestionAnswer[] = questions.map((qq) => ({
      questionId: qq.id,
      selected:   finalAnswers[qq.id] ?? [],
      isCorrect:  checkCorrect(qq, finalAnswers[qq.id] ?? []),
    }));
    onFinish(result);
  }

  function handleToggle(idx: number) {
    if (submitted) return;
    setDraftSelected((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
  }

  function handleSectionSubmit() {
    if (draftSelected.length === 0) return;
    onAnswer?.(q.id, checkCorrect(q, draftSelected));
    setSubmitted(true);
  }

  function handleSectionNext() {
    const ans: QuestionAnswer = { questionId: q.id, selected: draftSelected, isCorrect: checkCorrect(q, draftSelected) };
    const newAnswers = [...sectionAnswers, ans];
    setSectionAnswers(newAnswers);
    setDraftSelected([]);
    setSubmitted(false);
    if (current + 1 >= questions.length) {
      onFinish(newAnswers);
    } else {
      const next = current + 1;
      setCurrent(next);
      onCurrentChange?.(next);
    }
  }

  // ── Рендер итогового теста ────────────────────────────────────────────────

  if (isFinal) {
    const navStatuses: Record<number, SectionStatus> = {};
    questions.forEach((qq) => {
      navStatuses[qq.id] = (finalAnswers[qq.id]?.length ?? 0) > 0 ? "correct" : "untouched";
    });

    return (
      <>
        {showConfirm && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-2xl border border-border w-full max-w-sm p-6 shadow-2xl space-y-4">
              <div className="flex items-start gap-3">
                <div className="w-10 h-10 bg-amber-100 dark:bg-amber-900/30 rounded-xl flex items-center justify-center flex-shrink-0">
                  <Icon name="AlertCircle" size={20} className="text-amber-600 dark:text-amber-400" />
                </div>
                <div>
                  <p className="font-bold">Завершить тест?</p>
                  <p className="text-sm text-muted-foreground mt-1">
                    Отвечено {answeredCount} из {questions.length} вопросов.
                    {answeredCount < questions.length && ` ${questions.length - answeredCount} вопрос(ов) остались без ответа.`}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                <Button variant="outline" className="flex-1 rounded-xl" onClick={() => setShowConfirm(false)}>
                  Вернуться
                </Button>
                <Button className="flex-1 gradient-primary text-white rounded-xl" onClick={() => { setShowConfirm(false); onFinishFinal(); }}>
                  Завершить
                </Button>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 items-start">
          <div className="flex-1 min-w-0 space-y-4">
            <div className="bg-card rounded-2xl border border-border px-4 py-3 flex items-center gap-4">
              <span className="text-sm text-muted-foreground flex-shrink-0">
                {answeredCount} / {questions.length} отвечено
              </span>
              <Progress value={Math.round((answeredCount / questions.length) * 100)} className="h-2 flex-1" />
              <span className={`text-sm font-mono font-semibold flex-shrink-0 flex items-center gap-1 ${timerWarning ? "text-red-500" : "text-muted-foreground"}`}>
                <Icon name="Clock" size={14} />
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>

            <div className="bg-card rounded-2xl border border-border p-6">
              <div className="flex items-start justify-between gap-2 mb-4">
                <p className="font-semibold text-base leading-relaxed">{q.text}</p>
                {(finalAnswers[q.id]?.length ?? 0) > 0 && (
                  <span className="text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-lg flex-shrink-0">Отвечен</span>
                )}
              </div>
              <AnswerOptions
                question={q}
                selected={finalCurrentSelected}
                answered={false}
                onToggle={handleFinalToggle}
              />
            </div>

            <div className="space-y-2">
              <Button
                className="w-full gradient-primary text-white rounded-xl gap-2"
                disabled={finalCurrentSelected.length === 0}
                onClick={handleFinalSubmit}
              >
                {isLastQuestion ? "Ответить" : "Ответить и далее"}
                <Icon name="ChevronRight" size={15} />
              </Button>
              {isLastQuestion && currentAnswered && (
                <Button
                  variant="outline"
                  className="w-full rounded-xl gap-2 border-emerald-500 text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-900/20"
                  onClick={() => setShowConfirm(true)}
                >
                  <Icon name="CheckCircle" size={15} />
                  Завершить тест
                </Button>
              )}
            </div>
          </div>

          <QuestionNav
            questions={questions}
            currentIdx={current}
            onJump={(idx) => { setCurrent(idx); onCurrentChange?.(idx); }}
            mode="section"
            sectionStatuses={navStatuses}
            finishButton={
              <Button
                className="w-full gradient-primary text-white rounded-xl gap-1.5"
                onClick={() => setShowConfirm(true)}
              >
                <Icon name="CheckCircle" size={14} />
                Завершить тест
              </Button>
            }
            answeredCls="bg-blue-500 text-white"
          />
        </div>
      </>
    );
  }

  // ── Рендер секционного теста ──────────────────────────────────────────────

  const sectionBlock = (
    <div className="space-y-5 flex-1 min-w-0">
      <div className="bg-card rounded-2xl border border-border px-4 py-3 flex items-center gap-4">
        <span className="text-sm text-muted-foreground flex-shrink-0">Вопрос {current + 1} / {questions.length}</span>
        <Progress value={progress} className="h-2 flex-1" />
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <p className="font-semibold text-base leading-relaxed mb-5">{q.text}</p>
        <AnswerOptions question={q} selected={draftSelected} answered={submitted} onToggle={handleToggle} />
      </div>

      {!submitted ? (
        <Button
          className="w-full gradient-primary text-white rounded-xl gap-2"
          disabled={draftSelected.length === 0}
          onClick={handleSectionSubmit}
        >
          Ответить
          <Icon name="CheckCircle" size={15} />
        </Button>
      ) : (
        <AnswerResult
          question={q}
          isCorrect={checkCorrect(q, draftSelected)}
          onNext={handleSectionNext}
          nextLabel={current + 1 >= questions.length ? "Завершить тест" : "Следующий вопрос"}
        />
      )}
    </div>
  );

  if (navPanel) {
    return (
      <div className="flex gap-4 items-start">
        {sectionBlock}
        {navPanel}
      </div>
    );
  }

  return sectionBlock;
}

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

      <div className="flex gap-2">
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
          className="rounded-xl gap-2 px-4"
          onClick={() => setShowProtocol((v) => !v)}
        >
          <Icon name={showProtocol ? "ChevronUp" : "FileText"} size={15} />
          {showProtocol ? "Скрыть" : "Протокол"}
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
