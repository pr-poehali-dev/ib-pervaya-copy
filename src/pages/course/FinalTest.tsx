import { useState, useEffect, useRef } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import type { Question } from "@/data/questionsBank";
import {
  checkCorrect,
  type QuestionAnswer,
  type SectionStatus,
} from "./CoursePageTypes";
import { AnswerOptions, AnswerResult, QuestionNav } from "./CoursePageShared";

export function FinalTest({
  onFinish,
  isFinal,
  allQuestions,
  onCurrentChange,
  onAnswer,
  navPanel,
  testTimeSec = 30 * 60,
}: {
  onFinish: (answers: QuestionAnswer[]) => void;
  isFinal: boolean;
  allQuestions: Question[];
  onCurrentChange?: (idx: number) => void;
  onAnswer?: (questionId: number, isCorrect: boolean) => void;
  navPanel?: React.ReactNode;
  testTimeSec?: number;
}) {
  const questions = isFinal ? allQuestions.slice(0, 10) : allQuestions.slice(0, 5);
  const [current,        setCurrent]        = useState(0);
  const [draftSelected,  setDraftSelected]  = useState<number[]>([]);
  const [submitted,      setSubmitted]      = useState(false);
  const [sectionAnswers, setSectionAnswers] = useState<QuestionAnswer[]>([]);
  const [finalAnswers,   setFinalAnswers]   = useState<Record<number, number[]>>({});
  const [showConfirm,    setShowConfirm]    = useState(false);

  const TOTAL_SECONDS = testTimeSec > 0 ? testTimeSec : 30 * 60;
  const [timeLeft, setTimeLeft] = useState(TOTAL_SECONDS);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const onFinishRef = useRef(onFinish);
  useEffect(() => { onFinishRef.current = onFinish; }, [onFinish]);

  useEffect(() => {
    if (!isFinal) return;
    intervalRef.current = setInterval(() => {
      setTimeLeft((t) => {
        if (t <= 1) { clearInterval(intervalRef.current!); onFinishRef.current([]); return 0; }
        return t - 1;
      });
    }, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
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

        <div className="flex flex-col-reverse lg:flex-row gap-4 items-start lg:items-start">
          <div className="flex-1 min-w-0 w-full space-y-4">
            <div className="bg-card rounded-2xl border border-border px-4 py-3 flex items-center gap-3">
              <span className="text-xs sm:text-sm text-muted-foreground flex-shrink-0">
                {answeredCount} / {questions.length}
              </span>
              <Progress value={Math.round((answeredCount / questions.length) * 100)} className="h-2 flex-1" />
              <span className={`text-sm font-mono font-semibold flex-shrink-0 flex items-center gap-1 ${timerWarning ? "text-red-500" : "text-muted-foreground"}`}>
                <Icon name="Clock" size={14} />
                {String(minutes).padStart(2, "0")}:{String(seconds).padStart(2, "0")}
              </span>
            </div>

            <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
              <div className="flex items-start justify-between gap-2 mb-4">
                <p className="font-semibold text-sm sm:text-base leading-relaxed">{q.text}</p>
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

      <div className="bg-card rounded-2xl border border-border p-4 sm:p-6">
        <p className="font-semibold text-sm sm:text-base leading-relaxed mb-5">{q.text}</p>
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
      <div className="flex flex-col lg:flex-row gap-4 items-start">
        {sectionBlock}
        {navPanel}
      </div>
    );
  }

  return sectionBlock;
}