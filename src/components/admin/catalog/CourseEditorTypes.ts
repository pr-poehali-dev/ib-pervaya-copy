// ─── Типы ─────────────────────────────────────────────────────────────────────

export type MaterialType = "video" | "lecture" | "presentation" | "audio";

export type CourseMaterialFile = {
  id: number;
  title: string;
  type: MaterialType;
  ext: string;
  duration?: string;
};

export type NtdFile = {
  id: number;
  title: string;
  ext: string;
};

export type TestMode = "adaptive" | "section" | "final";

export type CourseEditorData = {
  title: string;
  code: string;
  hours: string;
  description: string;
  dpoAvailable: boolean;
  testModes: TestMode[];
  finalTestQuestions: string;
  finalTestPassScore: string;
  finalTestTime: string;
  materials: CourseMaterialFile[];
  ntdFiles: NtdFile[];
  directionId?: number;
};

export type EditorDirection = {
  id: number;
  title: string;
};

// ─── Карта материалов ─────────────────────────────────────────────────────────

export const MAT_MAP: Record<MaterialType, { icon: string; label: string; color: string; exts: string[] }> = {
  video:        { icon: "Video",        label: "Видео",       color: "from-rose-500 to-pink-600",     exts: ["MP4", "MOV"] },
  lecture:      { icon: "FileText",     label: "Лекция",      color: "from-violet-500 to-purple-600", exts: ["PDF", "DOCX"] },
  presentation: { icon: "Presentation", label: "Презентация", color: "from-blue-500 to-indigo-600",   exts: ["PPTX", "PDF"] },
  audio:        { icon: "Mic",          label: "Аудио",       color: "from-amber-500 to-orange-600",  exts: ["MP3", "WAV"] },
};

export const NTD_EXTS = ["PDF", "DOCX", "DOC", "RTF"];

export const STEPS = [
  { n: 1, label: "Описание",  icon: "BookOpen" },
  { n: 2, label: "Тесты",     icon: "ClipboardList" },
  { n: 3, label: "Материалы", icon: "FolderOpen" },
  { n: 4, label: "НТД",       icon: "FileCheck" },
];

export const TEST_MODES: { key: TestMode; label: string; desc: string; icon: string }[] = [
  { key: "adaptive", label: "Адаптивный тренинг",  desc: "Вопросы подбираются по слабым местам слушателя в процессе прохождения курса", icon: "Zap" },
  { key: "section",  label: "Тест по разделу",     desc: "Проверочный тест в конце каждого раздела курса",                              icon: "LayoutList" },
  { key: "final",    label: "Итоговый тест",        desc: "Финальная аттестация по всему курсу с ограничением по времени",               icon: "GraduationCap" },
];

// ─── Утилиты ──────────────────────────────────────────────────────────────────

export function downloadTemplate() {
  const headers = ["№ вопроса", "Текст вопроса", "Вариант ответа", "Верно (1=да)", "Наименование НТД", "Выдержка из НТД"];
  const rows = [
    headers,
    ["1", "Какой документ регламентирует требования промышленной безопасности?", "А. ФЗ-116 «О промышленной безопасности»", "1", "ФЗ-116", "Статья 1. Основные понятия..."],
    ["", "", "Б. ФЗ-52 «О санитарном благополучии»", "", "", ""],
    ["", "", "В. ГОСТ Р 12.0.001", "", "", ""],
    ["", "", "Г. СП 2.2.3670-20", "", "", ""],
    ["2", "Кто несёт ответственность за производственный контроль?", "А. Руководитель организации", "1", "ФЗ-116, ст. 11", "Организации, эксплуатирующие ОПО..."],
    ["", "", "Б. Главный инженер", "", "", ""],
    ["", "", "В. Сотрудник охраны труда", "", "", ""],
    ["", "", "Г. Ростехнадзор", "", "", ""],
  ];
  const csv = rows.map((r) => r.map((c) => `"${c}"`).join(";")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = "шаблон_вопросов.csv"; a.click();
  URL.revokeObjectURL(url);
}
