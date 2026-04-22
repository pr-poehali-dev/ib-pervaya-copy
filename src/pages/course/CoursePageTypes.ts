import type { Question } from "@/data/questionsBank";

// ─── Режимы обучения ──────────────────────────────────────────────────────────

export type LearningMode =
  | "menu"
  | "adaptive"
  | "section_test"
  | "final_test"
  | "search_answer"
  | "test_result";

// ─── Ответы и попытки ─────────────────────────────────────────────────────────

export interface QuestionAnswer {
  questionId: number;
  selected: number[];
  isCorrect: boolean;
}

export interface TestAttempt {
  id: number;
  date: string;
  answers: QuestionAnswer[];
  correct: number;
  total: number;
  score: number;
  passed: boolean;
}

// ─── Адаптивный трекинг ───────────────────────────────────────────────────────

export type AdaptiveStatus = "untouched" | "seen" | "almost" | "learned" | "struggling";
export type SectionStatus  = "untouched" | "correct" | "wrong";

export interface AdaptiveRecord {
  history: boolean[];
}

export function getAdaptiveStatus(rec: AdaptiveRecord | undefined): AdaptiveStatus {
  if (!rec || rec.history.length === 0) return "untouched";
  const last3 = rec.history.slice(-3);
  if (last3.length >= 3 && last3.every(Boolean))       return "learned";
  if (last3.length >= 3 && last3.every((v) => !v))     return "struggling";
  if (last3.filter(Boolean).length >= 2)               return "almost";
  return "seen";
}

export const ADAPTIVE_STATUS_CLS: Record<AdaptiveStatus, string> = {
  untouched:  "bg-muted text-muted-foreground",
  seen:       "bg-blue-200 dark:bg-blue-900/50 text-blue-800 dark:text-blue-200",
  almost:     "bg-orange-300 dark:bg-orange-700 text-white",
  learned:    "bg-emerald-500 text-white",
  struggling: "bg-red-500 text-white",
};

export const SECTION_STATUS_CLS: Record<SectionStatus, string> = {
  untouched: "bg-muted text-muted-foreground",
  correct:   "bg-emerald-500 text-white",
  wrong:     "bg-red-500 text-white",
};

// ─── Вспомогательные функции ──────────────────────────────────────────────────

export function isMulti(q: Question): boolean {
  return Array.isArray(q.correct);
}

export function correctArr(q: Question): number[] {
  return Array.isArray(q.correct) ? q.correct : [q.correct];
}

export function checkCorrect(q: Question, selected: number[] | null): boolean {
  if (!selected || selected.length === 0) return false;
  const correct = correctArr(q).slice().sort();
  const sel = selected.slice().sort();
  return correct.length === sel.length && correct.every((v, i) => v === sel[i]);
}

// ─── Константы ────────────────────────────────────────────────────────────────

export const MODES = [
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

export type CourseMaterial = {
  icon: string;
  type: string;
  label: string;
  ext: string;
  url: string;
};

export type NtdDoc = {
  label: string;
  url: string;
};

export const COURSE_MATERIALS: CourseMaterial[] = [
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
