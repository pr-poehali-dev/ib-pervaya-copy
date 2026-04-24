import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import Icon from "@/components/ui/icon";
import { COURSE_DIRECTIONS, INITIAL_USERS } from "@/data/mockData";
import { getQuestionsForCourse } from "@/data/questionsBank";
import {
  type LearningMode,
  type QuestionAnswer,
  type TestAttempt,
  type AdaptiveRecord,
  type SectionStatus,
  checkCorrect,
} from "./course/CoursePageTypes";
import { QuestionNav } from "./course/CoursePageShared";
import {
  AdaptiveQuestion,
  FinalTest,
  TestResult,
  SearchAnswerMode,
} from "./course/CoursePageModes";
import { CourseHeader } from "./course/CourseHeader";
import { CourseHistoryModal } from "./course/CourseHistoryModal";
import { CourseMenu } from "./course/CourseMenu";

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const courseId = Number(id);
  const dir      = COURSE_DIRECTIONS.find((d) => d.courses.some((c) => c.id === courseId));
  const course   = dir?.courses.find((c) => c.id === courseId);

  const user   = INITIAL_USERS[0];
  const assign = user.assignments.find((a) => a.courseId === courseId);

  const questions = getQuestionsForCourse(courseId);

  const [mode,         setMode]         = useState<LearningMode>("menu");
  const [adaptIdx,     setAdaptIdx]     = useState(0);
  const [adaptAnswered, setAdaptAnswered] = useState(false);
  const [adaptSelected, setAdaptSelected] = useState<number[]>([]);
  const [testAnswers,   setTestAnswers]   = useState<QuestionAnswer[]>([]);
  const [finalTestHistory, setFinalTestHistory] = useState<TestAttempt[]>([]);
  const [showHistory,      setShowHistory]      = useState(false);
  const [historyProtocol,  setHistoryProtocol]  = useState<TestAttempt | null>(null);

  const [adaptiveRecords, setAdaptiveRecords] = useState<Record<number, AdaptiveRecord>>({});
  const [sectionStatuses, setSectionStatuses] = useState<Record<number, SectionStatus>>({});
  const [sectionIdx,      setSectionIdx]      = useState(0);

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
        id:     Date.now(),
        date:   new Date().toLocaleDateString("ru-RU"),
        answers,
        correct,
        total,
        score,
        passed: score >= 70,
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
        <CourseHeader dir={dir} course={course} progress={progress} />

        {/* Модалка истории итогового теста */}
        {showHistory && (
          <CourseHistoryModal
            finalTestHistory={finalTestHistory}
            historyProtocol={historyProtocol}
            questions={questions}
            onClose={() => { setShowHistory(false); setHistoryProtocol(null); }}
            onSetProtocol={setHistoryProtocol}
          />
        )}

        {/* Меню режимов + материалы + НТД */}
        {mode === "menu" && (
          <CourseMenu
            course={course}
            dir={dir}
            finalTestHistory={finalTestHistory}
            onSetMode={setMode}
            onShowHistory={() => setShowHistory(true)}
            onSetHistoryProtocol={(attempt) => { setHistoryProtocol(attempt); }}
          />
        )}

        {/* Тесты по НТД */}
        {mode === "ntd_test" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-indigo-500 to-blue-700 rounded-lg flex items-center justify-center">
                <Icon name="BookMarked" size={13} className="text-white" />
              </div>
              <p className="font-semibold text-sm">Тесты по НТД</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center min-h-[240px]">
              <div className="w-14 h-14 bg-indigo-100 dark:bg-indigo-900/30 rounded-2xl flex items-center justify-center">
                <Icon name="BookMarked" size={24} className="text-indigo-600" />
              </div>
              <p className="font-semibold text-base">Тесты по НТД</p>
              <p className="text-sm text-muted-foreground max-w-sm">Вопросы, сгруппированные по нормативным документам. Этот режим находится в разработке.</p>
            </div>
          </div>
        )}

        {/* Избранные вопросы */}
        {mode === "favorites" && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
                <Icon name="Star" size={13} className="text-white" />
              </div>
              <p className="font-semibold text-sm">Избранные вопросы</p>
            </div>
            <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center justify-center gap-3 text-center min-h-[240px]">
              <div className="w-14 h-14 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center">
                <Icon name="Star" size={24} className="text-pink-500" />
              </div>
              <p className="font-semibold text-base">Избранные вопросы</p>
              <p className="text-sm text-muted-foreground max-w-sm">Отмечайте вопросы звёздочкой в адаптивном тренинге — они появятся здесь для быстрого повторения. Этот режим находится в разработке.</p>
            </div>
          </div>
        )}

        {/* Адаптивный тренинг */}
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

        {/* Тест по разделу */}
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

        {/* Итоговый тест */}
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

        {/* Результаты теста */}
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

        {/* Поиск ответа */}
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