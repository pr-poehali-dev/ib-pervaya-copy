import { useState } from "react";
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
  selected: number | null;
  isCorrect: boolean;
}

// ─── Компонент вопроса (адаптивный тренинг) ──────────────────────────────────

function AdaptiveQuestion({
  question,
  onAnswer,
  onNext,
  answered,
  selected,
  onSubmit,
}: {
  question: Question;
  onAnswer: (idx: number) => void;
  onNext: () => void;
  onSubmit: () => void;
  answered: boolean;
  selected: number | null;
}) {
  const isCorrect = selected === question.correct;

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-border p-6">
        <p className="font-semibold text-base leading-relaxed mb-5">{question.text}</p>
        <div className="space-y-2.5">
          {question.options.map((opt, idx) => {
            let cls = "border-border bg-background hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10 cursor-pointer";
            if (!answered && selected === idx) {
              cls = "border-violet-500 bg-violet-50 dark:bg-violet-900/20";
            } else if (answered) {
              if (idx === question.correct) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
              else if (idx === selected && !isCorrect) cls = "border-red-400 bg-red-50 dark:bg-red-900/20";
              else cls = "border-border bg-muted/40 opacity-60";
            }
            return (
              <button
                key={idx}
                disabled={answered}
                onClick={() => onAnswer(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${cls}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  answered && idx === question.correct ? "bg-emerald-500 text-white" :
                  answered && idx === selected && !isCorrect ? "bg-red-400 text-white" :
                  !answered && selected === idx ? "bg-violet-600 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm">{opt}</span>
                {answered && idx === question.correct && (
                  <Icon name="CheckCircle" size={16} className="text-emerald-500 ml-auto flex-shrink-0" />
                )}
                {answered && idx === selected && !isCorrect && (
                  <Icon name="XCircle" size={16} className="text-red-400 ml-auto flex-shrink-0" />
                )}
              </button>
            );
          })}
        </div>
      </div>

      {!answered ? (
        <Button
          className="w-full gradient-primary text-white rounded-xl gap-2"
          disabled={selected === null}
          onClick={onSubmit}
        >
          Ответить
          <Icon name="CheckCircle" size={15} />
        </Button>
      ) : (
        <div className={`rounded-2xl border p-5 space-y-3 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"}`}>
          <div className="flex items-center gap-2">
            <Icon name={isCorrect ? "CheckCircle" : "XCircle"} size={18} className={isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"} />
            <p className={`font-semibold ${isCorrect ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}`}>
              {isCorrect ? "Верно!" : `Неверно. Правильный ответ: ${question.options[question.correct]}`}
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
            Следующий вопрос
            <Icon name="ChevronRight" size={15} />
          </Button>
        </div>
      )}
    </div>
  );
}

// ─── Итоговый тест ────────────────────────────────────────────────────────────

function FinalTest({ onFinish, isFinal, allQuestions }: { onFinish: (answers: QuestionAnswer[]) => void; isFinal: boolean; allQuestions: Question[] }) {
  const questions = isFinal ? allQuestions.slice(0, 10) : allQuestions.slice(0, 5);
  const [current,   setCurrent]   = useState(0);
  const [selected,  setSelected]  = useState<number | null>(null);
  const [submitted, setSubmitted] = useState(false);
  const [answers,   setAnswers]   = useState<QuestionAnswer[]>([]);
  const timeLimit = isFinal ? 30 : 15;

  const q = questions[current];
  const isCorrect = selected !== null && selected === q.correct;
  const progress = Math.round((current / questions.length) * 100);

  function handleSubmit() {
    if (selected === null) return;
    setSubmitted(true);
  }

  function handleNext() {
    if (selected === null) return;
    const ans: QuestionAnswer = {
      questionId: q.id,
      selected,
      isCorrect: selected === q.correct,
    };
    const newAnswers = [...answers, ans];
    setAnswers(newAnswers);
    setSelected(null);
    setSubmitted(false);
    if (current + 1 >= questions.length) {
      onFinish(newAnswers);
    } else {
      setCurrent((p) => p + 1);
    }
  }

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-border p-4 flex items-center gap-4">
        <div className="flex-1">
          <div className="flex items-center justify-between text-sm mb-1.5">
            <span className="text-muted-foreground">Вопрос {current + 1} из {questions.length}</span>
            <div className="flex items-center gap-1.5 text-muted-foreground">
              <Icon name="Clock" size={14} />
              <span>{timeLimit} мин</span>
            </div>
          </div>
          <Progress value={progress} className="h-2" />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border p-6">
        <p className="font-semibold text-base leading-relaxed mb-5">{q.text}</p>
        <div className="space-y-2.5">
          {q.options.map((opt, idx) => {
            let cls = "border-border bg-background hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 cursor-pointer";
            if (!submitted && selected === idx) {
              cls = "border-violet-500 bg-violet-50 dark:bg-violet-900/20";
            } else if (submitted) {
              if (idx === q.correct) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
              else if (idx === selected && !isCorrect) cls = "border-red-400 bg-red-50 dark:bg-red-900/20";
              else cls = "border-border bg-muted/40 opacity-60";
            }
            return (
              <button
                key={idx}
                disabled={submitted}
                onClick={() => setSelected(idx)}
                className={`w-full text-left px-4 py-3 rounded-xl border-2 transition-all flex items-center gap-3 ${cls}`}
              >
                <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${
                  submitted && idx === q.correct ? "bg-emerald-500 text-white" :
                  submitted && idx === selected && !isCorrect ? "bg-red-400 text-white" :
                  !submitted && selected === idx ? "bg-violet-600 text-white" :
                  "bg-muted text-muted-foreground"
                }`}>
                  {String.fromCharCode(65 + idx)}
                </span>
                <span className="text-sm">{opt}</span>
                {submitted && idx === q.correct && <Icon name="CheckCircle" size={16} className="text-emerald-500 ml-auto flex-shrink-0" />}
                {submitted && idx === selected && !isCorrect && <Icon name="XCircle" size={16} className="text-red-400 ml-auto flex-shrink-0" />}
              </button>
            );
          })}
        </div>
      </div>

      {!submitted ? (
        <Button
          className="w-full gradient-primary text-white rounded-xl gap-2"
          disabled={selected === null}
          onClick={handleSubmit}
        >
          Ответить
          <Icon name="CheckCircle" size={15} />
        </Button>
      ) : (
        <div className={`rounded-2xl border p-5 space-y-3 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"}`}>
          <div className="flex items-center gap-2">
            <Icon name={isCorrect ? "CheckCircle" : "XCircle"} size={18} className={isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"} />
            <p className={`font-semibold ${isCorrect ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}`}>
              {isCorrect ? "Верно!" : `Неверно. Правильный ответ: ${q.options[q.correct]}`}
            </p>
          </div>
          <div className="flex items-start gap-2">
            <Icon name="BookOpen" size={15} className="text-muted-foreground flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-muted-foreground font-medium mb-0.5">{q.ntdRef}</p>
              <p className="text-sm text-muted-foreground">{q.ntd}</p>
            </div>
          </div>
          <Button className="w-full gradient-primary text-white rounded-xl gap-2" onClick={handleNext}>
            {current + 1 >= questions.length ? "Завершить тест" : "Следующий вопрос"}
            <Icon name={current + 1 >= questions.length ? "CheckCircle" : "ChevronRight"} size={15} />
          </Button>
        </div>
      )}
    </div>
  );
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
                        Ваш ответ: <span className={ans.isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-500"}>{ans.selected !== null ? q.options[ans.selected] : "—"}</span>
                      </p>
                      {!ans.isCorrect && (
                        <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-0.5">
                          Верно: {q.options[q.correct]}
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
              {selected.options.map((opt, idx) => (
                <div key={idx} className={`px-4 py-3 rounded-xl flex items-center gap-3 ${idx === selected.correct ? "bg-emerald-50 dark:bg-emerald-900/20 border-2 border-emerald-500" : "bg-muted/40 border border-border"}`}>
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${idx === selected.correct ? "bg-emerald-500 text-white" : "bg-muted text-muted-foreground"}`}>
                    {String.fromCharCode(65 + idx)}
                  </span>
                  <span className="text-sm">{opt}</span>
                  {idx === selected.correct && <Icon name="CheckCircle" size={15} className="text-emerald-500 ml-auto" />}
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

  const [mode, setMode]       = useState<LearningMode>("menu");
  const [adaptIdx, setAdaptIdx] = useState(0);
  const [adaptAnswered, setAdaptAnswered] = useState(false);
  const [adaptSelected, setAdaptSelected] = useState<number | null>(null);
  const [testAnswers, setTestAnswers] = useState<QuestionAnswer[]>([]);

  function handleAdaptAnswer(idx: number) {
    if (adaptAnswered) return;
    setAdaptSelected(idx);
  }

  function handleAdaptSubmit() {
    if (adaptSelected === null) return;
    setAdaptAnswered(true);
  }

  function handleAdaptNext() {
    setAdaptIdx((p) => (p + 1) % questions.length);
    setAdaptAnswered(false);
    setAdaptSelected(null);
  }

  function handleTestFinish(answers: QuestionAnswer[]) {
    setTestAnswers(answers);
    setMode("test_result");
  }

  function resetToMenu() {
    setMode("menu");
    setAdaptIdx(0);
    setAdaptAnswered(false);
    setAdaptSelected(null);
    setTestAnswers([]);
  }

  const title   = course?.title ?? "Курс";
  const progress = assign?.progress ?? 0;

  return (
    <Layout>
      <div className="max-w-3xl mx-auto space-y-5">
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
        {mode === "menu" && (
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground font-medium px-1">Выберите режим обучения</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {MODES.filter((m) => !(!course?.hasTest && (m.key === "section_test" || m.key === "final_test"))).map((m) => (
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
              ))}
            </div>

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
                  ? ["ПТЭЭП «Правила технической эксплуатации электроустановок потребителей»", "ПОТЭУ «Правила по охране труда при эксплуатации электроустановок»", "ПУЭ «Правила устройства электроустановок»", "Приказ Минэнерго № 261 «Инструкция по применению средств защиты»"]
                  : dir?.id === 3
                  ? ["ТК РФ — Трудовой кодекс Российской Федерации", "ФЗ-426 «О специальной оценке условий труда»", "ФЗ-125 «Об обязательном социальном страховании от несчастных случаев»", "ПП РФ № 2464 «О порядке обучения по охране труда»"]
                  : dir?.id === 4
                  ? ["ФЗ-116 «О промышленной безопасности опасных производственных объектов»", "ПП РФ № 467 «Об аттестации экспертов в области промышленной безопасности»", "Приказ Ростехнадзора № 538 «Порядок осуществления экспертизы ПБ»"]
                  : dir?.id === 5
                  ? ["ФЗ-117 «О безопасности гидротехнических сооружений»", "ПП РФ № 986 «Критерии классификации ГТС»", "СП 39.13330.2012 «Плотины из грунтовых материалов»"]
                  : ["ФЗ-116 «О промышленной безопасности опасных производственных объектов»", "ПП РФ № 263 «Об организации и осуществлении производственного контроля»", "Приказ Ростехнадзора № 471 «Об утверждении руководства по безопасности»"]
                ).map((doc) => (
                  <div key={doc} className="flex items-center gap-3 px-3 py-2.5 bg-muted/40 rounded-xl">
                    <Icon name="FileText" size={14} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm flex-1 min-w-0 truncate">{doc}</span>
                    <button className="text-primary hover:opacity-80 flex-shrink-0">
                      <Icon name="Download" size={14} />
                    </button>
                  </div>
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
            <AdaptiveQuestion
              question={questions[adaptIdx]}
              onAnswer={handleAdaptAnswer}
              onSubmit={handleAdaptSubmit}
              onNext={handleAdaptNext}
              answered={adaptAnswered}
              selected={adaptSelected}
            />
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
            <FinalTest onFinish={handleTestFinish} isFinal={false} allQuestions={questions} />
          </div>
        )}

        {mode === "final_test" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-lg flex items-center justify-center">
                <Icon name="GraduationCap" size={13} className="text-white" />
              </div>
              <p className="font-semibold text-sm">Итоговый тест</p>
            </div>
            <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-center gap-2">
              <Icon name="AlertCircle" size={15} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
              <p className="text-sm text-amber-800 dark:text-amber-300">
                {Math.min(10, questions.length)} вопросов · 30 минут · Подсказки недоступны · Порог сдачи: 70%
              </p>
            </div>
            <FinalTest onFinish={handleTestFinish} isFinal={true} allQuestions={questions} />
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