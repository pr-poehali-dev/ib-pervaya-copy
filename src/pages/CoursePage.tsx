import { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Layout from "@/components/layout/Layout";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import Icon from "@/components/ui/icon";
import { COURSE_DIRECTIONS, INITIAL_USERS } from "@/data/mockData";
import { getQuestionsForCourse } from "@/data/questionsBank";
import {
  MODES,
  COURSE_MATERIALS,
  type LearningMode,
  type QuestionAnswer,
  type TestAttempt,
  type AdaptiveRecord,
  type SectionStatus,
  checkCorrect,
  type CourseMaterial,
  type NtdDoc,
} from "./course/CoursePageTypes";
import { QuestionNav } from "./course/CoursePageShared";
import {
  AdaptiveQuestion,
  FinalTest,
  TestResult,
  SearchAnswerMode,
} from "./course/CoursePageModes";

export default function CoursePage() {
  const { id } = useParams();
  const navigate = useNavigate();

  const courseId = Number(id);
  const dir      = COURSE_DIRECTIONS.find((d) => d.courses.some((c) => c.id === courseId));
  const course   = dir?.courses.find((c) => c.id === courseId);

  const user   = INITIAL_USERS[0];
  const assign = user.assignments.find((a) => a.courseId === courseId);

  const questions = getQuestionsForCourse(courseId);

  const [mode,        setMode]        = useState<LearningMode>("menu");
  const [adaptIdx,    setAdaptIdx]    = useState(0);
  const [adaptAnswered, setAdaptAnswered] = useState(false);
  const [adaptSelected, setAdaptSelected] = useState<number[]>([]);
  const [testAnswers,   setTestAnswers]   = useState<QuestionAnswer[]>([]);
  const [finalTestHistory, setFinalTestHistory] = useState<TestAttempt[]>([]);
  const [showHistory,      setShowHistory]      = useState(false);
  const [historyProtocol,  setHistoryProtocol]  = useState<TestAttempt | null>(null);

  const [openNtd,      setOpenNtd]      = useState<NtdDoc | null>(null);
  const [openMaterial, setOpenMaterial] = useState<CourseMaterial | null>(null);

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

  const title    = course?.title ?? "Курс";
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
                  <table className="w-full text-sm">
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

        {/* Меню режимов */}
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
                      src={`https://docs.google.com/gview?url=${encodeURIComponent(openMaterial.url)}&embedded=true`}
                      className="w-full h-full border-0"
                      title={openMaterial.label}
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
