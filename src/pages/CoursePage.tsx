import { useState, useEffect, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { COURSE_DIRECTIONS, INITIAL_USERS } from "@/data/mockData";
import { getQuestionsForCourse, type Question } from "@/data/questionsBank";

// ─── Типы ─────────────────────────────────────────────────────────────────────

type LearningMode = "menu" | "adaptive" | "section_test" | "final_test" | "search_answer" | "test_result";

interface QuestionAnswer {
  questionId: number;
  selected: number[];
  isCorrect: boolean;
}

// История попыток итогового теста
interface TestAttempt {
  id: number;
  date: string;
  answers: QuestionAnswer[];
  correct: number;
  total: number;
  score: number;
  passed: boolean;
}

// Адаптивный тренинг: история ответов на каждый вопрос (последние 3)
type AdaptiveStatus = "untouched" | "seen" | "almost" | "learned" | "struggling";
type SectionStatus  = "untouched" | "correct" | "wrong";

interface AdaptiveRecord {
  /** последние до 3 результатов: true=верно, false=неверно */
  history: boolean[];
}

function getAdaptiveStatus(rec: AdaptiveRecord | undefined): AdaptiveStatus {
  if (!rec || rec.history.length === 0) return "untouched";
  const h = rec.history;
  const last3 = h.slice(-3);
  if (last3.length >= 3 && last3.every(Boolean))  return "learned";
  if (last3.length >= 3 && last3.every((v) => !v)) return "struggling";
  const correct = last3.filter(Boolean).length;
  if (correct >= 2) return "almost";
  return "seen";
}

const ADAPTIVE_STATUS_CLS: Record<AdaptiveStatus, string> = {
  untouched:  "bg-muted text-muted-foreground",
  seen:       "bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200",
  almost:     "bg-orange-300 dark:bg-orange-700 text-white",
  learned:    "bg-emerald-500 text-white",
  struggling: "bg-red-500 text-white",
};

const SECTION_STATUS_CLS: Record<SectionStatus, string> = {
  untouched: "bg-muted text-muted-foreground",
  correct:   "bg-emerald-500 text-white",
  wrong:     "bg-red-500 text-white",
};

// ─── Навигация по вопросам ────────────────────────────────────────────────────

function QuestionNav({
  questions,
  currentIdx,
  onJump,
  mode,
  adaptiveRecords,
  sectionStatuses,
  finishButton,
  answeredCls,
}: {
  questions: Question[];
  currentIdx: number;
  onJump: (idx: number) => void;
  mode: "adaptive" | "section";
  adaptiveRecords?: Record<number, AdaptiveRecord>;
  sectionStatuses?: Record<number, SectionStatus>;
  finishButton?: React.ReactNode;
  answeredCls?: string;
}) {
  const [visible, setVisible] = useState(true);

  const legend = mode === "adaptive" ? [
    { cls: "bg-emerald-500",                   label: "Изучен (3 верных подряд)" },
    { cls: "bg-orange-300 dark:bg-orange-700", label: "Почти (2 из 3 верных)" },
    { cls: "bg-blue-200 dark:bg-blue-900/50",  label: "Отвечали хотя бы раз" },
    { cls: "bg-muted",                         label: "Ещё не отвечали" },
    { cls: "bg-red-500",                       label: "Часто неверно (3 подряд)" },
  ] : finishButton ? [
    { cls: "bg-blue-500", label: "Ответ дан" },
    { cls: "bg-muted",    label: "Не отвечен" },
  ] : [
    { cls: "bg-emerald-500", label: "Правильный ответ" },
    { cls: "bg-red-500",     label: "Неправильный ответ" },
    { cls: "bg-muted",       label: "Ещё не отвечали" },
  ];

  if (!visible) {
    return (
      <div className="flex-shrink-0">
        <button
          onClick={() => setVisible(true)}
          className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
          title="Показать навигацию по вопросам"
        >
          <Icon name="LayoutGrid" size={16} />
          <span className="text-[10px] font-medium [writing-mode:vertical-lr] rotate-180">Вопросы</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-52">
      {/* Заголовок с кнопкой скрыть */}
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Вопросы
        </span>
        <button
          onClick={() => setVisible(false)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <Icon name="PanelRightClose" size={13} />
          Скрыть
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-3 space-y-3">
          {/* Сетка кнопок */}
          <div className="grid grid-cols-5 gap-1.5">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentIdx;
              let cls = "";
              if (mode === "adaptive") {
                const status = getAdaptiveStatus(adaptiveRecords?.[q.id]);
                cls = ADAPTIVE_STATUS_CLS[status];
              } else {
                const status = sectionStatuses?.[q.id] ?? "untouched";
                const base = SECTION_STATUS_CLS[status];
                // Заменяем зелёный на кастомный если передан answeredCls
                cls = (answeredCls && status === "correct") ? answeredCls : base;
              }
              return (
                <button
                  key={q.id}
                  onClick={() => onJump(idx)}
                  className={`w-8 h-8 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${cls} ${
                    isCurrent ? "ring-2 ring-violet-500 ring-offset-1 scale-110" : "hover:scale-105"
                  }`}
                  title={`Вопрос ${idx + 1}`}
                >
                  {idx + 1}
                </button>
              );
            })}
          </div>

          {/* Легенда */}
          <div className="space-y-1.5 pt-1 border-t border-border">
            {legend.map((l) => (
              <div key={l.label} className="flex items-center gap-2">
                <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${l.cls}`} />
                <span className="text-[10px] text-muted-foreground leading-tight">{l.label}</span>
              </div>
            ))}
          </div>
          {finishButton && (
            <div className="pt-1 border-t border-border">{finishButton}</div>
          )}
        </div>
    </div>
  );
}

// ─── Вспомогательные функции ─────────────────────────────────────────────────

function isMulti(q: Question): boolean {
  return Array.isArray(q.correct);
}

function correctArr(q: Question): number[] {
  return Array.isArray(q.correct) ? q.correct : [q.correct];
}

function checkCorrect(q: Question, selected: number[] | null): boolean {
  if (!selected || selected.length === 0) return false;
  const correct = correctArr(q).slice().sort();
  const sel = selected.slice().sort();
  return correct.length === sel.length && correct.every((v, i) => v === sel[i]);
}

// ─── Единый компонент вариантов ответа ───────────────────────────────────────

function AnswerOptions({
  question,
  selected,
  answered,
  onToggle,
}: {
  question: Question;
  selected: number[];
  answered: boolean;
  onToggle: (idx: number) => void;
}) {
  const correct = correctArr(question);
  const multiAnswer = isMulti(question);

  return (
    <div className="space-y-2.5">
      {multiAnswer && !answered && (
        <p className="text-xs text-muted-foreground px-1">Выберите все верные варианты</p>
      )}
      {question.options.map((opt, idx) => {
        const isSelected = selected.includes(idx);
        const isCorrectOpt = correct.includes(idx);

        let cls = "border-border bg-background hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10 cursor-pointer";
        if (!answered && isSelected) {
          cls = "border-violet-500 bg-violet-50 dark:bg-violet-900/20";
        } else if (answered) {
          if (isCorrectOpt) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
          else if (isSelected && !isCorrectOpt) cls = "border-red-400 bg-red-50 dark:bg-red-900/20";
          else cls = "border-border bg-muted/40 opacity-60";
        }

        return (
          <button
            key={idx}
            disabled={answered}
            onClick={() => onToggle(idx)}
            className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${cls}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border-2 transition-all ${
              answered && isCorrectOpt ? "bg-emerald-500 border-emerald-500" :
              answered && isSelected && !isCorrectOpt ? "bg-red-400 border-red-400" :
              !answered && isSelected ? "bg-violet-600 border-violet-600" :
              "border-muted-foreground/40 bg-background"
            }`}>
              {((!answered && isSelected) || (answered && (isCorrectOpt || (isSelected && !isCorrectOpt)))) && (
                <Icon name="Check" size={13} className="text-white" />
              )}
            </span>
            <span className="text-sm flex-1">{opt}</span>
            {answered && isCorrectOpt && (
              <Icon name="CheckCircle" size={16} className="text-emerald-500 ml-auto flex-shrink-0" />
            )}
            {answered && isSelected && !isCorrectOpt && (
              <Icon name="XCircle" size={16} className="text-red-400 ml-auto flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Блок с результатом и НТД ─────────────────────────────────────────────────

function AnswerResult({
  question,
  isCorrect,
  onNext,
  nextLabel,
}: {
  question: Question;
  isCorrect: boolean;
  onNext: () => void;
  nextLabel: string;
}) {
  const correctText = correctArr(question).map((i) => question.options[i]).join("; ");
  return (
    <div className={`rounded-2xl border p-5 space-y-3 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"}`}>
      <div className="flex items-center gap-2">
        <Icon name={isCorrect ? "CheckCircle" : "XCircle"} size={18} className={isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"} />
        <p className={`font-semibold ${isCorrect ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}`}>
          {isCorrect ? "Верно!" : `Неверно. Правильный ответ: ${correctText}`}
        </p>
      </div>
      <div className="flex items-start gap-2">
        <Icon name="BookOpen" size={15} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-0.5">{question.ntdRef}</p>
          <p className="text-sm text-muted-foreground">{question.ntd}</p>
        </div>
      </div>
      <Button className="gradient-primary text-white rounded-xl w-full gap-2" onClick={onNext}>
        {nextLabel}
        <Icon name="ChevronRight" size={15} />
      </Button>
    </div>
  );
}

// ─── Компонент вопроса (адаптивный тренинг) ──────────────────────────────────

function AdaptiveQuestion({
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

// ─── Итоговый тест ────────────────────────────────────────────────────────────

function FinalTest({
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
  const [current,  setCurrent]  = useState(0);
  // Для итогового: answers — Map questionId → selected[], можно перезаписывать
  // Для секционного: старая логика с submitted
  const [draftSelected, setDraftSelected] = useState<number[]>([]);
  const [submitted,     setSubmitted]     = useState(false);
  const [sectionAnswers, setSectionAnswers] = useState<QuestionAnswer[]>([]);
  // Итоговый тест: все ответы сразу, можно менять
  const [finalAnswers, setFinalAnswers] = useState<Record<number, number[]>>({});

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

  // ── Итоговый тест: выбор ──────────────────────────────────────────────────

  // текущий черновик для итогового — берём из сохранённых или пустой
  const finalCurrentSelected = finalAnswers[q.id] ?? [];

  function handleFinalToggle(idx: number) {
    const prev = finalAnswers[q.id] ?? [];
    const next = prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx];
    setFinalAnswers((fa) => ({ ...fa, [q.id]: next }));
  }

  function handleFinalSubmit() {
    const sel = finalAnswers[q.id] ?? [];
    if (sel.length === 0) return;
    // переходим к следующему неотвеченному или следующему по порядку
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

  const answeredCount = questions.filter((qq) => (finalAnswers[qq.id]?.length ?? 0) > 0).length;

  // ── Секционный тест: старая логика ───────────────────────────────────────

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

  const [showConfirm, setShowConfirm] = useState(false);
  const isLastQuestion = current === questions.length - 1;
  const currentAnswered = (finalAnswers[q?.id]?.length ?? 0) > 0;

  if (isFinal) {
    // используем "seen" (синий) для отвеченных вопросов
    const navStatuses: Record<number, SectionStatus> = {};
    questions.forEach((qq) => {
      navStatuses[qq.id] = (finalAnswers[qq.id]?.length ?? 0) > 0 ? "correct" : "untouched";
    });

    return (
      <>
      {/* Модалка подтверждения завершения */}
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
        {/* Левая часть — вопрос */}
        <div className="flex-1 min-w-0 space-y-4">
          {/* Прогресс + таймер */}
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

          {/* Вопрос */}
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

        {/* Правая часть — навигация */}
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

// ─── Протокол результатов ─────────────────────────────────────────────────────

function TestResult({
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
      {/* Итог */}
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
            <p className="text-sm font-medium text-amber-800 dark:text-amber-300">
              Удостоверение ДПО готово к выдаче администратором УЦ
            </p>
          </div>
        )}
      </div>

      {/* Кнопки */}
      <div className="flex gap-2">
        <Button variant="outline" className="flex-1 rounded-xl gap-2" onClick={onMenu}>
          <Icon name="Home" size={15} />
          На главную курса
        </Button>
        {!passed && (
          <Button className="flex-1 gradient-primary text-white rounded-xl gap-2" onClick={onRetry}>
            <Icon name="RefreshCw" size={15} />
            Повторить тест
          </Button>
        )}
        <Button
          variant="outline"
          className="rounded-xl gap-2"
          onClick={() => setShowProtocol(!showProtocol)}
        >
          <Icon name="FileText" size={15} />
          Протокол
        </Button>
      </div>

      {/* Протокол разбора */}
      {showProtocol && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <div className="px-5 py-4 border-b border-border">
            <p className="font-semibold text-sm">Протокол ответов</p>
            <p className="text-xs text-muted-foreground">Подробный разбор каждого вопроса</p>
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

// ─── Режим «Ответ на вопрос» ──────────────────────────────────────────────────

function SearchAnswerMode({ onBack, allQuestions }: { onBack: () => void; allQuestions: Question[] }) {
  const [search, setSearch] = useState("");
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

// ─── Меню режимов ─────────────────────────────────────────────────────────────

const MODES = [
  {
    key: "adaptive" as LearningMode,
    icon: "Zap",
    title: "Адаптивный тренинг",
    desc: "Вопрос → ответ → разбор + ссылка на НТД. Идеально для подготовки",
    color: "from-violet-500 to-purple-700",
    bg: "bg-violet-50 dark:bg-violet-900/10 border-violet-200 dark:border-violet-800",
  },
  {
    key: "section_test" as LearningMode,
    icon: "ClipboardList",
    title: "Тест по разделу",
    desc: "5 вопросов подряд, затем разбор ошибок. Закрепление пройденного",
    color: "from-cyan-500 to-blue-600",
    bg: "bg-cyan-50 dark:bg-cyan-900/10 border-cyan-200 dark:border-cyan-800",
  },
  {
    key: "final_test" as LearningMode,
    icon: "GraduationCap",
    title: "Итоговый тест",
    desc: "10 вопросов без подсказок, 30 минут. При сдаче 70%+ — выдаётся удостоверение ДПО",
    color: "from-emerald-500 to-teal-600",
    bg: "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800",
  },
  {
    key: "search_answer" as LearningMode,
    icon: "Search",
    title: "Ответ на вопрос",
    desc: "Поиск по тексту вопроса — мгновенный ответ и ссылка на НТД",
    color: "from-amber-500 to-orange-600",
    bg: "bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800",
  },
];

// ─── Главная страница ─────────────────────────────────────────────────────────

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const courseId = Number(id);
  const dir      = COURSE_DIRECTIONS.find((d) => d.courses.some((c) => c.id === courseId));
  const course   = dir?.courses.find((c) => c.id === courseId);

  const user     = INITIAL_USERS[0];
  const assign   = user.assignments.find((a) => a.courseId === courseId);

  // Выбираем банк вопросов по направлению курса
  const questions = getQuestionsForCourse(courseId);

  const [mode, setMode]         = useState<LearningMode>("menu");
  const [adaptIdx, setAdaptIdx] = useState(0);
  const [adaptAnswered, setAdaptAnswered] = useState(false);
  const [adaptSelected, setAdaptSelected] = useState<number[]>([]);
  const [testAnswers, setTestAnswers]     = useState<QuestionAnswer[]>([]);
  const [finalTestHistory, setFinalTestHistory] = useState<TestAttempt[]>([]);
  const [showHistory, setShowHistory]           = useState(false);
  const [historyProtocol, setHistoryProtocol]   = useState<TestAttempt | null>(null);

  type CourseMaterial = { icon: string; type: string; label: string; ext: string; url: string };
  type NtdDoc = { label: string; url: string };
  const [openNtd, setOpenNtd] = useState<NtdDoc | null>(null);
  const [openMaterial, setOpenMaterial] = useState<CourseMaterial | null>(null);

  const COURSE_MATERIALS: CourseMaterial[] = [
    {
      icon: "FileText", type: "Лекция", label: "Лекция 1. Основные понятия и определения", ext: "PDF",
      url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-techniques.pdf",
    },
    {
      icon: "FileText", type: "Лекция", label: "Лекция 2. Требования нормативных документов", ext: "PDF",
      url: "https://unec.edu.az/application/uploads/2014/12/pdf-sample.pdf",
    },
    {
      icon: "Presentation", type: "Презентация", label: "Презентация. Обзор законодательной базы", ext: "PPTX",
      url: "https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit",
    },
    {
      icon: "Presentation", type: "Презентация", label: "Презентация. Практические примеры и разбор случаев", ext: "PPTX",
      url: "https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit",
    },
    {
      icon: "Video", type: "Видео", label: "Видеолекция. Введение в курс", ext: "MP4",
      url: "https://www.w3schools.com/html/mov_bbb.mp4",
    },
    {
      icon: "Mic", type: "Аудио", label: "Аудиолекция. Ключевые требования и нормы", ext: "MP3",
      url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    },
  ];

  // Трекинг адаптивного тренинга
  const [adaptiveRecords, setAdaptiveRecords] = useState<Record<number, AdaptiveRecord>>({});
  // Трекинг теста по разделу
  const [sectionStatuses, setSectionStatuses] = useState<Record<number, SectionStatus>>({});
  // Текущий вопрос теста по разделу (для навигации)
  const [sectionIdx, setSectionIdx] = useState(0);

  function handleAdaptToggle(idx: number) {
    if (adaptAnswered) return;
    setAdaptSelected((prev) => prev.includes(idx) ? prev.filter((i) => i !== idx) : [...prev, idx]);
  }

  function handleAdaptSubmit() {
    if (adaptSelected.length === 0) return;
    const q = questions[adaptIdx];
    const correct = checkCorrect(q, adaptSelected);
    setAdaptiveRecords((prev) => {
      const rec = prev[q.id] ?? { history: [] };
      const newHistory = [...rec.history, correct].slice(-3);
      return { ...prev, [q.id]: { history: newHistory } };
    });
    setAdaptAnswered(true);
  }

  function handleAdaptNext() {
    setAdaptIdx((p) => (p + 1) % questions.length);
    setAdaptAnswered(false);
    setAdaptSelected([]);
  }

  function handleAdaptJump(idx: number) {
    setAdaptIdx(idx);
    setAdaptAnswered(false);
    setAdaptSelected([]);
  }

  function handleSectionAnswer(questionId: number, isCorrect: boolean) {
    setSectionStatuses((prev) => ({
      ...prev,
      [questionId]: isCorrect ? "correct" : "wrong",
    }));
  }

  function handleTestFinish(answers: QuestionAnswer[], isFinalTest = false) {
    setTestAnswers(answers);
    if (isFinalTest) {
      const correct = answers.filter((a) => a.isCorrect).length;
      const total   = answers.length;
      const score   = Math.round((correct / total) * 100);
      const attempt: TestAttempt = {
        id:      Date.now(),
        date:    new Date().toLocaleDateString("ru-RU"),
        answers,
        correct,
        total,
        score,
        passed:  score >= 70,
      };
      setFinalTestHistory((prev) => [attempt, ...prev]);
    }
    setMode("test_result");
  }

  function resetToMenu() {
    setMode("menu");
    setAdaptIdx(0);
    setAdaptAnswered(false);
    setAdaptSelected([]);
    setTestAnswers([]);
    setSectionStatuses({});
    setSectionIdx(0);
  }

  const title   = course?.title ?? "Курс";
  const progress = assign?.progress ?? 0;

  return (
    <Layout>
      <div className="w-full max-w-7xl mx-auto space-y-5">
        {/* Хлебные крошки */}
        <button
          onClick={() => mode === "menu" ? navigate("/my-learning") : resetToMenu()}
          className="flex items-center gap-2 text-muted-foreground hover:text-foreground transition-colors text-sm"
        >
          <Icon name="ArrowLeft" size={16} />
          {mode === "menu" ? "Моё обучение" : "На главную курса"}
        </button>

        {/* Шапка курса */}
        <div className="bg-card rounded-2xl border border-border px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center flex-shrink-0 text-lg">
              🏭
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground leading-none mb-0.5">{dir?.title}{course?.code && <span className="font-mono ml-1.5">{course.code}</span>}</p>
                  <h1 className="font-bold text-sm leading-snug truncate">{title}</h1>
                </div>
                <div className="flex items-center gap-1.5 flex-shrink-0">
                  {course?.hours && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1"><Icon name="Clock" size={12} />{course.hours} ч</span>
                  )}
                  {course?.hasTest && (
                    <Badge className="bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs">Тест</Badge>
                  )}
                  {course?.dpoAvailable && (
                    <Badge className="bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300 text-xs">ДПО</Badge>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2 mt-1.5">
                <Progress value={progress} className="h-1 flex-1" />
                <span className="text-xs text-muted-foreground flex-shrink-0">{progress}%</span>
              </div>
            </div>
          </div>
        </div>

        {/* Контент по режиму */}
        {/* Модалка истории итогового теста */}
        {showHistory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
            <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-2xl flex flex-col max-h-[80vh]">
              <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
                <div>
                  <p className="font-bold">История итогового тестирования</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{finalTestHistory.length} попыток</p>
                </div>
                <button onClick={() => { setShowHistory(false); setHistoryProtocol(null); }} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
                  <Icon name="X" size={18} />
                </button>
              </div>
              <div className="overflow-y-auto flex-1">
                {historyProtocol ? (
                  <div className="p-4 space-y-3">
                    <button onClick={() => setHistoryProtocol(null)} className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
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
                            <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${ans.isCorrect ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                              <Icon name={ans.isCorrect ? "Check" : "X"} size={11} className={ans.isCorrect ? "text-emerald-600" : "text-red-500"} />
                            </div>
                            <div className="min-w-0">
                              <p className="text-xs font-medium leading-snug">{idx + 1}. {q.text}</p>
                              {!ans.isCorrect && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                                  Верно: {correctArr(q).map((i) => q.options[i]).join("; ")}
                                </p>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                ) : finalTestHistory.length === 0 ? (
                  <div className="p-10 text-center">
                    <Icon name="ClipboardList" size={32} className="text-muted-foreground mx-auto mb-2" />
                    <p className="text-sm text-muted-foreground">Попыток пока нет</p>
                  </div>
                ) : (
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Дата</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Результат</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Статус</th>
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {finalTestHistory.map((attempt) => (
                        <tr key={attempt.id} className="border-b border-border last:border-0">
                          <td className="px-4 py-3 text-muted-foreground">{attempt.date}</td>
                          <td className="px-4 py-3 font-semibold">{attempt.correct} / {attempt.total} ({attempt.score}%)</td>
                          <td className="px-4 py-3">
                            <span className={`px-2 py-0.5 rounded-lg text-xs font-medium ${attempt.passed ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300"}`}>
                              {attempt.passed ? "Сдал" : "Не сдал"}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <button onClick={() => setHistoryProtocol(attempt)} className="text-xs text-primary hover:underline">
                              Протокол
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          </div>
        )}

        {mode === "menu" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium px-1">Выберите режим обучения</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODES.filter((m) => !(!course?.hasTest && (m.key === "section_test" || m.key === "final_test"))).map((m) => {
                if (m.key === "final_test" && course?.hasTest) {
                  const best = finalTestHistory.length > 0
                    ? finalTestHistory.reduce((a, b) => a.score > b.score ? a : b)
                    : null;
                  return (
                    <div key={m.key} className={`p-5 rounded-2xl border-2 ${m.bg} space-y-3`}>
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 bg-gradient-to-br ${m.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                          <Icon name={m.icon} size={18} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="font-semibold text-sm mb-0.5">{m.title}</p>
                          <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                        </div>
                      </div>
                      {best && (
                        <div className="bg-background/60 rounded-xl px-3 py-2.5 flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2 min-w-0">
                            <Icon name={best.passed ? "Trophy" : "TrendingUp"} size={14} className={best.passed ? "text-amber-500 flex-shrink-0" : "text-muted-foreground flex-shrink-0"} />
                            <span className="text-xs font-medium truncate">
                              Лучший: {best.correct} из {best.total} · {best.date}
                            </span>
                          </div>
                          <button
                            onClick={(e) => { e.stopPropagation(); setHistoryProtocol(best); setShowHistory(true); }}
                            className="text-xs text-primary hover:underline flex-shrink-0"
                          >
                            Протокол
                          </button>
                        </div>
                      )}
                      <div className="flex gap-2 mt-1">
                        <button
                          onClick={() => setMode(m.key)}
                          className={`flex-1 py-2 rounded-xl text-xs font-semibold text-white bg-gradient-to-r ${m.color} hover:opacity-90 transition-opacity`}
                        >
                          {finalTestHistory.length > 0 ? "Пройти ещё раз" : "Начать тест"}
                        </button>
                        <button
                          onClick={() => setShowHistory(true)}
                          className="px-3 py-2 rounded-xl text-xs font-medium border border-border bg-background/60 hover:bg-muted/40 transition-colors flex items-center gap-1.5"
                        >
                          <Icon name="History" size={13} />
                          История
                        </button>
                      </div>
                    </div>
                  );
                }
                return (
                  <button
                    key={m.key}
                    onClick={() => setMode(m.key)}
                    className={`text-left p-5 rounded-2xl border-2 transition-all hover:shadow-md group ${m.bg}`}
                  >
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 bg-gradient-to-br ${m.color} rounded-xl flex items-center justify-center flex-shrink-0`}>
                        <Icon name={m.icon} size={18} className="text-white" />
                      </div>
                      <div>
                        <p className="font-semibold text-sm mb-1">{m.title}</p>
                        <p className="text-xs text-muted-foreground leading-relaxed">{m.desc}</p>
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Модалка просмотра материала */}
            {openMaterial && (
              <div className="fixed inset-0 z-50 flex flex-col bg-background">
                {/* Шапка */}
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-700 rounded-lg flex items-center justify-center">
                    <Icon name={openMaterial.icon} size={15} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{openMaterial.label}</p>
                    <p className="text-xs text-muted-foreground">{openMaterial.type} · {openMaterial.ext}</p>
                  </div>
                  <button
                    onClick={() => setOpenMaterial(null)}
                    className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <Icon name="X" size={18} />
                  </button>
                </div>

                {/* Область просмотра */}
                <div className="flex-1 overflow-hidden relative">
                  {openMaterial.ext === "MP4" && (
                    <div className="w-full h-full flex items-center justify-center bg-black p-4">
                      <video
                        key={openMaterial.url}
                        src={openMaterial.url}
                        controls
                        autoPlay
                        className="max-w-full max-h-full rounded-xl shadow-2xl"
                        style={{ maxHeight: "calc(100vh - 64px)" }}
                      >
                        Ваш браузер не поддерживает видео.
                      </video>
                    </div>
                  )}

                  {openMaterial.ext === "MP3" && (
                    <div className="w-full h-full flex items-center justify-center p-6">
                      <div className="w-full max-w-lg space-y-6 text-center">
                        <div className="w-28 h-28 bg-gradient-to-br from-violet-500 to-purple-700 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                          <Icon name="Mic" size={44} className="text-white" />
                        </div>
                        <div>
                          <p className="font-bold text-xl">{openMaterial.label}</p>
                          <p className="text-muted-foreground text-sm mt-1">Аудиоматериал курса</p>
                        </div>
                        <div className="bg-card rounded-2xl border border-border p-5">
                          <audio
                            key={openMaterial.url}
                            src={openMaterial.url}
                            controls
                            autoPlay
                            className="w-full"
                          >
                            Ваш браузер не поддерживает аудио.
                          </audio>
                        </div>
                      </div>
                    </div>
                  )}

                  {openMaterial.ext === "PDF" && (
                    <iframe
                      key={openMaterial.url}
                      src={openMaterial.url}
                      className="w-full h-full border-0"
                      title={openMaterial.label}
                    />
                  )}

                  {openMaterial.ext === "PPTX" && (
                    <iframe
                      key={openMaterial.url}
                      src={`${openMaterial.url.replace("/edit", "/embed")}`}
                      className="w-full h-full border-0"
                      title={openMaterial.label}
                      allowFullScreen
                    />
                  )}
                </div>
              </div>
            )}

            {/* Материалы курса */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-violet-500 to-purple-700 rounded-xl flex items-center justify-center">
                  <Icon name="FolderOpen" size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Материалы курса</p>
                  <p className="text-xs text-muted-foreground">Лекции, презентации, видео и аудио</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {COURSE_MATERIALS.map((m) => (
                  <button
                    key={m.label}
                    onClick={() => setOpenMaterial(m)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 bg-muted/40 hover:bg-muted/70 rounded-xl transition-colors group text-left"
                  >
                    <Icon name={m.icon} size={14} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1 min-w-0 truncate group-hover:text-foreground transition-colors">{m.label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">{m.ext}</span>
                    <Icon name="ChevronRight" size={14} className="text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>

            {/* Модалка просмотра НТД */}
            {openNtd && (
              <div className="fixed inset-0 z-50 flex flex-col bg-background">
                <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card flex-shrink-0">
                  <div className="w-8 h-8 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-lg flex items-center justify-center">
                    <Icon name="FileText" size={15} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm truncate">{openNtd.label}</p>
                    <p className="text-xs text-muted-foreground">Нормативно-технический документ · PDF</p>
                  </div>
                  <button
                    onClick={() => setOpenNtd(null)}
                    className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0"
                  >
                    <Icon name="X" size={18} />
                  </button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <iframe
                    key={openNtd.url}
                    src={openNtd.url}
                    className="w-full h-full border-0"
                    title={openNtd.label}
                  />
                </div>
              </div>
            )}

            {/* Библиотека НТД */}
            <div className="bg-card rounded-2xl border border-border p-5">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-9 h-9 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-xl flex items-center justify-center">
                  <Icon name="Library" size={16} className="text-white" />
                </div>
                <div>
                  <p className="font-semibold text-sm">Библиотека НТД</p>
                  <p className="text-xs text-muted-foreground">Нормативно-технические документы по курсу</p>
                </div>
              </div>
              <div className="space-y-1.5">
                {(dir?.id === 2
                  ? [
                      { label: "ПТЭЭП «Правила технической эксплуатации электроустановок потребителей»", url: "https://docs.cntd.ru/document/1200031625" },
                      { label: "ПОТЭУ «Правила по охране труда при эксплуатации электроустановок»",      url: "https://www.consultant.ru/document/cons_doc_LAW_171985/" },
                      { label: "ПУЭ «Правила устройства электроустановок»",                              url: "https://docs.cntd.ru/document/1200030216" },
                      { label: "Приказ Минэнерго № 261 «Инструкция по применению средств защиты»",      url: "https://docs.cntd.ru/document/1200069862" },
                    ]
                  : dir?.id === 3
                  ? [
                      { label: "ТК РФ — Трудовой кодекс Российской Федерации",                                    url: "https://www.consultant.ru/document/cons_doc_LAW_34683/" },
                      { label: "ФЗ-426 «О специальной оценке условий труда»",                                     url: "https://www.consultant.ru/document/cons_doc_LAW_156555/" },
                      { label: "ФЗ-125 «Об обязательном социальном страховании от несчастных случаев»",           url: "https://www.consultant.ru/document/cons_doc_LAW_17696/" },
                      { label: "ПП РФ № 2464 «О порядке обучения по охране труда»",                              url: "https://www.consultant.ru/document/cons_doc_LAW_428609/" },
                    ]
                  : dir?.id === 4
                  ? [
                      { label: "ФЗ-116 «О промышленной безопасности опасных производственных объектов»",  url: "https://www.consultant.ru/document/cons_doc_LAW_15234/" },
                      { label: "ПП РФ № 467 «Об аттестации экспертов в области промышленной безопасности»", url: "https://www.consultant.ru/document/cons_doc_LAW_194838/" },
                      { label: "Приказ Ростехнадзора № 538 «Порядок осуществления экспертизы ПБ»",         url: "https://docs.cntd.ru/document/499031789" },
                    ]
                  : dir?.id === 5
                  ? [
                      { label: "ФЗ-117 «О безопасности гидротехнических сооружений»",   url: "https://www.consultant.ru/document/cons_doc_LAW_16446/" },
                      { label: "ПП РФ № 986 «Критерии классификации ГТС»",               url: "https://www.consultant.ru/document/cons_doc_LAW_49455/" },
                      { label: "СП 39.13330.2012 «Плотины из грунтовых материалов»",    url: "https://docs.cntd.ru/document/1200092717" },
                    ]
                  : [
                      { label: "ФЗ-116 «О промышленной безопасности опасных производственных объектов»", url: "https://www.consultant.ru/document/cons_doc_LAW_15234/" },
                      { label: "ПП РФ № 263 «Об организации и осуществлении производственного контроля»", url: "https://www.consultant.ru/document/cons_doc_LAW_36585/" },
                      { label: "Приказ Ростехнадзора № 471 «Об утверждении руководства по безопасности»", url: "https://docs.cntd.ru/document/499032558" },
                    ]
                ).map((doc) => (
                  <button
                    key={doc.label}
                    onClick={() => setOpenNtd(doc)}
                    className="w-full flex items-center gap-3 px-3 py-2.5 bg-muted/40 hover:bg-muted/70 rounded-xl transition-colors group text-left"
                  >
                    <Icon name="FileText" size={14} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1 min-w-0 truncate group-hover:text-foreground transition-colors">{doc.label}</span>
                    <span className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded flex-shrink-0">PDF</span>
                    <Icon name="ChevronRight" size={14} className="text-muted-foreground flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </button>
                ))}
              </div>
            </div>
          </div>
        )}

        {mode === "adaptive" && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-700 rounded-lg flex items-center justify-center">
                  <Icon name="Zap" size={13} className="text-white" />
                </div>
                <p className="font-semibold text-sm">Адаптивный тренинг</p>
              </div>
              <span className="text-xs text-muted-foreground">Вопрос {adaptIdx + 1} / {questions.length}</span>
            </div>
            <div className="flex gap-4 items-start">
              <div className="flex-1 min-w-0">
                <AdaptiveQuestion
                  question={questions[adaptIdx]}
                  onToggle={handleAdaptToggle}
                  onSubmit={handleAdaptSubmit}
                  onNext={handleAdaptNext}
                  answered={adaptAnswered}
                  selected={adaptSelected}
                />
              </div>
              <QuestionNav
                questions={questions}
                currentIdx={adaptIdx}
                onJump={handleAdaptJump}
                mode="adaptive"
                adaptiveRecords={adaptiveRecords}
              />
            </div>
          </div>
        )}

        {mode === "section_test" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center">
                <Icon name="ClipboardList" size={13} className="text-white" />
              </div>
              <p className="font-semibold text-sm">Тест по разделу</p>
            </div>
            <FinalTest
              onFinish={handleTestFinish}
              isFinal={false}
              allQuestions={questions}
              onCurrentChange={setSectionIdx}
              onAnswer={handleSectionAnswer}
              navPanel={
                <QuestionNav
                  questions={questions.slice(0, 5)}
                  currentIdx={sectionIdx}
                  onJump={() => {}}
                  mode="section"
                  sectionStatuses={sectionStatuses}
                />
              }
            />
          </div>
        )}

        {mode === "final_test" && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 flex-wrap">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                  <Icon name="GraduationCap" size={13} className="text-white" />
                </div>
                <p className="font-semibold text-sm">Итоговый тест</p>
              </div>
              <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl px-3 py-1.5">
                <Icon name="AlertCircle" size={13} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
                <p className="text-xs text-amber-800 dark:text-amber-300">
                  {Math.min(10, questions.length)} вопросов · 30 мин · Без подсказок · Порог: 70%
                </p>
              </div>
            </div>
            <FinalTest onFinish={(ans) => handleTestFinish(ans, true)} isFinal={true} allQuestions={questions} />
          </div>
        )}

        {mode === "test_result" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Icon name="FileText" size={13} className="text-white" />
              </div>
              <p className="font-semibold text-sm">Результаты теста</p>
            </div>
            <TestResult
              answers={testAnswers}
              isFinal={true}
              onRetry={() => { setTestAnswers([]); setMode("final_test"); }}
              onMenu={resetToMenu}
              allQuestions={questions}
            />
          </div>
        )}

        {mode === "search_answer" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-amber-500 to-orange-600 rounded-lg flex items-center justify-center">
                <Icon name="Search" size={13} className="text-white" />
              </div>
              <p className="font-semibold text-sm">Ответ на вопрос</p>
            </div>
            <SearchAnswerMode onBack={resetToMenu} allQuestions={questions} />
          </div>
        )}
      </div>
    </Layout>
  );
}