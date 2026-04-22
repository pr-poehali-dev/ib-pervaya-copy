import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { MaterialType } from "@/components/admin/types";

// ─── Типы ─────────────────────────────────────────────────────────────────────

export type LessonType = "video" | "lecture" | "presentation" | "audio";

export type CourseLesson = {
  id: number;
  title: string;
  type: LessonType;
  ext: string;
  duration?: string;
  description?: string;
};

export type TestQuestion = {
  id: number;
  text: string;
  options: string[];
  correct: number;
};

export type CourseEditorData = {
  title: string;
  code: string;
  hours: string;
  description: string;
  hasTest: boolean;
  dpoAvailable: boolean;
  lessons: CourseLesson[];
  questions: TestQuestion[];
};

// ─── Константы ────────────────────────────────────────────────────────────────

const LESSON_TYPE_MAP: Record<LessonType, { icon: string; label: string; color: string; exts: string[] }> = {
  video:        { icon: "Video",        label: "Видео",        color: "from-rose-500 to-pink-600",    exts: ["MP4", "MOV"] },
  lecture:      { icon: "FileText",     label: "Лекция",       color: "from-violet-500 to-purple-600", exts: ["PDF", "DOCX"] },
  presentation: { icon: "Presentation", label: "Презентация",  color: "from-blue-500 to-indigo-600",  exts: ["PPTX", "PDF"] },
  audio:        { icon: "Mic",          label: "Аудио",        color: "from-amber-500 to-orange-600", exts: ["MP3", "WAV"] },
};

const STEP_LABELS = ["Описание курса", "Уроки и материалы", "Тест"];

// ─── Шаг 1: Описание курса ────────────────────────────────────────────────────

function Step1({
  data, onChange,
}: {
  data: CourseEditorData;
  onChange: (patch: Partial<CourseEditorData>) => void;
}) {
  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="space-y-1">
        <label className="text-sm font-medium">Название курса *</label>
        <input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Например: Вводный инструктаж для новых сотрудников"
          className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1">
          <label className="text-sm font-medium">Код курса</label>
          <input
            value={data.code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="ВИ-01"
            className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 font-mono"
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Количество часов *</label>
          <input
            type="number"
            min="1"
            value={data.hours}
            onChange={(e) => onChange({ hours: e.target.value })}
            placeholder="8"
            className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
      </div>

      <div className="space-y-1">
        <label className="text-sm font-medium">Описание курса</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          placeholder="Опишите цели курса, целевую аудиторию и ключевые темы..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors">
          <input
            type="checkbox"
            checked={data.hasTest}
            onChange={(e) => onChange({ hasTest: e.target.checked })}
            className="rounded accent-violet-600 w-4 h-4 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-sm font-medium">Итоговый тест</p>
            <p className="text-xs text-muted-foreground">Проверка знаний по завершении курса</p>
          </div>
        </label>
        <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors">
          <input
            type="checkbox"
            checked={data.dpoAvailable}
            onChange={(e) => onChange({ dpoAvailable: e.target.checked })}
            className="rounded accent-violet-600 w-4 h-4 mt-0.5 flex-shrink-0"
          />
          <div>
            <p className="text-sm font-medium">Удостоверение ДПО</p>
            <p className="text-xs text-muted-foreground">Выдаётся при успешной сдаче теста</p>
          </div>
        </label>
      </div>
    </div>
  );
}

// ─── Шаг 2: Уроки и материалы ─────────────────────────────────────────────────

function Step2({
  lessons, onChange,
}: {
  lessons: CourseLesson[];
  onChange: (lessons: CourseLesson[]) => void;
}) {
  const [type,    setType]    = useState<LessonType>("video");
  const [ext,     setExt]     = useState("MP4");
  const [title,   setTitle]   = useState("");
  const [dur,     setDur]     = useState("");
  const [desc,    setDesc]    = useState("");
  const [error,   setError]   = useState("");
  const [editId,  setEditId]  = useState<number | null>(null);

  function selectType(t: LessonType) {
    setType(t);
    setExt(LESSON_TYPE_MAP[t].exts[0]);
  }

  function addLesson() {
    if (!title.trim()) { setError("Введите название урока"); return; }
    if (editId !== null) {
      onChange(lessons.map((l) => l.id === editId ? { ...l, title: title.trim(), type, ext, duration: dur.trim() || undefined, description: desc.trim() || undefined } : l));
      setEditId(null);
    } else {
      onChange([...lessons, { id: Date.now(), title: title.trim(), type, ext, duration: dur.trim() || undefined, description: desc.trim() || undefined }]);
    }
    setTitle(""); setDur(""); setDesc(""); setError("");
  }

  function startEdit(l: CourseLesson) {
    setEditId(l.id);
    setTitle(l.title);
    setType(l.type);
    setExt(l.ext);
    setDur(l.duration ?? "");
    setDesc(l.description ?? "");
  }

  function cancelEdit() {
    setEditId(null);
    setTitle(""); setDur(""); setDesc(""); setError("");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Форма добавления */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">{editId !== null ? "Редактировать урок" : "Добавить урок"}</h3>

        {/* Тип урока */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Тип материала</label>
          <div className="grid grid-cols-4 gap-2">
            {(Object.entries(LESSON_TYPE_MAP) as [LessonType, typeof LESSON_TYPE_MAP[LessonType]][]).map(([key, val]) => (
              <button
                key={key}
                onClick={() => selectType(key)}
                className={`flex flex-col items-center gap-1.5 py-3 rounded-xl border-2 text-xs font-medium transition-all ${type === key ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : "border-border text-muted-foreground hover:border-violet-300"}`}
              >
                <div className={`w-7 h-7 bg-gradient-to-br ${val.color} rounded-lg flex items-center justify-center`}>
                  <Icon name={val.icon} size={14} className="text-white" />
                </div>
                {val.label}
              </button>
            ))}
          </div>
        </div>

        {/* Формат файла */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Формат файла</label>
          <div className="flex gap-2">
            {LESSON_TYPE_MAP[type].exts.map((e) => (
              <button
                key={e}
                onClick={() => setExt(e)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${ext === e ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : "border-border text-muted-foreground hover:border-violet-300"}`}
              >
                {e}
              </button>
            ))}
          </div>
        </div>

        {/* Название */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Название урока *</label>
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(""); }}
            placeholder="Например: Урок 1. Основные понятия"
            className={`w-full h-9 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${error ? "border-red-400" : "border-border"}`}
            onKeyDown={(e) => { if (e.key === "Enter") addLesson(); }}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          {/* Длительность */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Длительность</label>
            <input
              value={dur}
              onChange={(e) => setDur(e.target.value)}
              placeholder="45 мин"
              className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>
          {/* Файл */}
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground font-medium">Файл</label>
            <label className="flex items-center gap-2 h-9 px-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-violet-400 transition-colors">
              <Icon name="Upload" size={13} className="text-muted-foreground flex-shrink-0" />
              <span className="text-xs text-muted-foreground truncate">Выбрать {ext}</span>
              <input type="file" className="hidden" accept={`.${ext.toLowerCase()}`} />
            </label>
          </div>
        </div>

        {/* Краткое описание */}
        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Краткое описание урока</label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            rows={2}
            placeholder="О чём этот урок..."
            className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
          />
        </div>

        <div className="flex gap-2">
          {editId !== null && (
            <Button variant="outline" className="rounded-xl" onClick={cancelEdit}>Отмена</Button>
          )}
          <Button className="flex-1 gradient-primary text-white rounded-xl gap-1.5" onClick={addLesson}>
            <Icon name={editId !== null ? "Check" : "Plus"} size={15} />
            {editId !== null ? "Сохранить изменения" : "Добавить урок"}
          </Button>
        </div>
      </div>

      {/* Список уроков */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">
          Уроки курса
          {lessons.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({lessons.length})</span>}
        </h3>

        {lessons.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-2xl text-center">
            <Icon name="BookOpen" size={28} className="text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Уроки не добавлены</p>
            <p className="text-xs text-muted-foreground mt-1">Добавьте хотя бы один урок</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {lessons.map((l, idx) => {
              const info = LESSON_TYPE_MAP[l.type];
              return (
                <div key={l.id} className={`flex items-start gap-3 p-3 bg-card rounded-xl border transition-all ${editId === l.id ? "border-violet-400 bg-violet-50/30 dark:bg-violet-900/10" : "border-border hover:border-violet-200"}`}>
                  <div className="flex-shrink-0 flex flex-col items-center gap-1.5">
                    <span className="text-xs font-mono text-muted-foreground w-5 text-center">{idx + 1}</span>
                    <div className={`w-8 h-8 bg-gradient-to-br ${info.color} rounded-lg flex items-center justify-center`}>
                      <Icon name={info.icon} size={14} className="text-white" />
                    </div>
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{l.title}</p>
                    <div className="flex items-center gap-2 mt-0.5">
                      <span className="text-xs text-muted-foreground">{info.label} · {l.ext}</span>
                      {l.duration && <span className="text-xs text-muted-foreground">· {l.duration}</span>}
                    </div>
                    {l.description && <p className="text-xs text-muted-foreground mt-1 truncate">{l.description}</p>}
                  </div>
                  <div className="flex gap-1 flex-shrink-0">
                    <button
                      onClick={() => startEdit(l)}
                      className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 text-muted-foreground hover:text-violet-600 transition-colors"
                    >
                      <Icon name="Pencil" size={13} />
                    </button>
                    <button
                      onClick={() => onChange(lessons.filter((x) => x.id !== l.id))}
                      className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors"
                    >
                      <Icon name="Trash2" size={13} />
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Шаг 3: Тест ──────────────────────────────────────────────────────────────

function Step3({
  questions, hasTest, onChange,
}: {
  questions: TestQuestion[];
  hasTest: boolean;
  onChange: (questions: TestQuestion[]) => void;
}) {
  const [qText,    setQText]    = useState("");
  const [options,  setOptions]  = useState(["", "", "", ""]);
  const [correct,  setCorrect]  = useState(0);
  const [error,    setError]    = useState("");
  const [editId,   setEditId]   = useState<number | null>(null);
  const [expanded, setExpanded] = useState<number | null>(null);

  function addQuestion() {
    if (!qText.trim()) { setError("Введите текст вопроса"); return; }
    const filled = options.filter((o) => o.trim());
    if (filled.length < 2) { setError("Добавьте хотя бы 2 варианта ответа"); return; }

    const q: TestQuestion = { id: editId ?? Date.now(), text: qText.trim(), options: options.map((o) => o.trim()), correct };
    if (editId !== null) {
      onChange(questions.map((x) => x.id === editId ? q : x));
      setEditId(null);
    } else {
      onChange([...questions, q]);
    }
    setQText(""); setOptions(["", "", "", ""]); setCorrect(0); setError("");
  }

  function startEdit(q: TestQuestion) {
    setEditId(q.id);
    setQText(q.text);
    const opts = [...q.options];
    while (opts.length < 4) opts.push("");
    setOptions(opts);
    setCorrect(q.correct);
    setExpanded(null);
  }

  function cancelEdit() {
    setEditId(null);
    setQText(""); setOptions(["", "", "", ""]); setCorrect(0); setError("");
  }

  if (!hasTest) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center max-w-sm mx-auto">
        <div className="w-16 h-16 bg-muted/40 rounded-2xl flex items-center justify-center mb-4">
          <Icon name="ClipboardList" size={28} className="text-muted-foreground" />
        </div>
        <p className="font-semibold">Тест не включён</p>
        <p className="text-sm text-muted-foreground mt-1">
          Вернитесь на шаг 1 и включите «Итоговый тест», чтобы добавить вопросы
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Форма вопроса */}
      <div className="space-y-4">
        <h3 className="font-semibold text-sm">{editId !== null ? "Редактировать вопрос" : "Добавить вопрос"}</h3>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Текст вопроса *</label>
          <textarea
            value={qText}
            onChange={(e) => { setQText(e.target.value); setError(""); }}
            rows={3}
            placeholder="Сформулируйте вопрос..."
            className={`w-full px-3 py-2 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none ${error && !qText.trim() ? "border-red-400" : "border-border"}`}
          />
        </div>

        <div className="space-y-2">
          <label className="text-xs text-muted-foreground font-medium">Варианты ответов (минимум 2) *</label>
          {options.map((opt, i) => (
            <div key={i} className="flex items-center gap-2">
              <button
                onClick={() => setCorrect(i)}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-all ${correct === i ? "border-emerald-500 bg-emerald-500" : "border-border hover:border-emerald-400"}`}
              >
                {correct === i && <Icon name="Check" size={11} className="text-white" />}
              </button>
              <input
                value={opt}
                onChange={(e) => {
                  const next = [...options];
                  next[i] = e.target.value;
                  setOptions(next);
                }}
                placeholder={`Вариант ${i + 1}${i < 2 ? " *" : ""}`}
                className="flex-1 h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
            </div>
          ))}
          <p className="text-xs text-muted-foreground">Нажмите на кружок рядом с вариантом — это правильный ответ</p>
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="flex gap-2">
          {editId !== null && (
            <Button variant="outline" className="rounded-xl" onClick={cancelEdit}>Отмена</Button>
          )}
          <Button className="flex-1 gradient-primary text-white rounded-xl gap-1.5" onClick={addQuestion}>
            <Icon name={editId !== null ? "Check" : "Plus"} size={15} />
            {editId !== null ? "Сохранить изменения" : "Добавить вопрос"}
          </Button>
        </div>
      </div>

      {/* Список вопросов */}
      <div className="space-y-3">
        <h3 className="font-semibold text-sm">
          Вопросы теста
          {questions.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({questions.length})</span>}
        </h3>

        {questions.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-12 border-2 border-dashed border-border rounded-2xl text-center">
            <Icon name="HelpCircle" size={28} className="text-muted-foreground mb-2" />
            <p className="text-sm font-medium text-muted-foreground">Вопросы не добавлены</p>
            <p className="text-xs text-muted-foreground mt-1">Рекомендуется минимум 5 вопросов</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[460px] overflow-y-auto pr-1">
            {questions.map((q, idx) => (
              <div key={q.id} className={`bg-card rounded-xl border overflow-hidden transition-all ${editId === q.id ? "border-violet-400" : "border-border"}`}>
                <div
                  className="flex items-start gap-3 p-3 cursor-pointer hover:bg-muted/20 transition-colors"
                  onClick={() => setExpanded(expanded === q.id ? null : q.id)}
                >
                  <span className="w-6 h-6 rounded-full bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 text-xs font-bold flex items-center justify-center flex-shrink-0 mt-0.5">{idx + 1}</span>
                  <p className="text-sm flex-1 min-w-0 leading-snug">{q.text}</p>
                  <div className="flex gap-1 flex-shrink-0">
                    <button onClick={(e) => { e.stopPropagation(); startEdit(q); }} className="p-1 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 text-muted-foreground hover:text-violet-600 transition-colors">
                      <Icon name="Pencil" size={12} />
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); onChange(questions.filter((x) => x.id !== q.id)); }} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors">
                      <Icon name="Trash2" size={12} />
                    </button>
                    <Icon name={expanded === q.id ? "ChevronUp" : "ChevronDown"} size={13} className="text-muted-foreground mt-0.5" />
                  </div>
                </div>
                {expanded === q.id && (
                  <div className="border-t border-border px-3 py-2 space-y-1 bg-muted/10">
                    {q.options.filter((o) => o).map((opt, i) => (
                      <div key={i} className={`flex items-center gap-2 text-xs py-1 px-2 rounded-lg ${i === q.correct ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "text-muted-foreground"}`}>
                        {i === q.correct
                          ? <Icon name="CheckCircle" size={12} className="flex-shrink-0" />
                          : <Icon name="Circle" size={12} className="flex-shrink-0" />}
                        {opt}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Главный компонент редактора ──────────────────────────────────────────────

interface CourseEditorProps {
  onClose: () => void;
  onSave: (data: CourseEditorData) => void;
  initialData?: Partial<CourseEditorData>;
  title?: string;
}

export default function CourseEditor({ onClose, onSave, initialData, title = "Новый курс" }: CourseEditorProps) {
  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [stepError, setStepError] = useState("");

  const [data, setData] = useState<CourseEditorData>({
    title:        initialData?.title        ?? "",
    code:         initialData?.code         ?? "",
    hours:        initialData?.hours        ?? "8",
    description:  initialData?.description  ?? "",
    hasTest:      initialData?.hasTest      ?? false,
    dpoAvailable: initialData?.dpoAvailable ?? false,
    lessons:      initialData?.lessons      ?? [],
    questions:    initialData?.questions    ?? [],
  });

  function patch(p: Partial<CourseEditorData>) {
    setData((prev) => ({ ...prev, ...p }));
  }

  function goNext() {
    if (step === 1) {
      if (!data.title.trim()) { setStepError("Введите название курса"); return; }
      if (!data.hours || Number(data.hours) < 1) { setStepError("Укажите количество часов"); return; }
    }
    setStepError("");
    setStep((s) => Math.min(s + 1, 3) as 1 | 2 | 3);
  }

  function goBack() {
    setStepError("");
    setStep((s) => Math.max(s - 1, 1) as 1 | 2 | 3);
  }

  function handleSave() {
    onSave(data);
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      {/* Шапка */}
      <div className="flex items-center gap-4 px-6 py-4 border-b border-border bg-card flex-shrink-0">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Icon name="X" size={18} />
        </button>
        <div className="flex-1">
          <p className="font-bold text-base">{data.title || title}</p>
          <p className="text-xs text-muted-foreground">Редактор курса</p>
        </div>

        {/* Прогресс шагов */}
        <div className="flex items-center gap-2">
          {STEP_LABELS.map((label, i) => {
            const s = (i + 1) as 1 | 2 | 3;
            const done = step > s;
            const active = step === s;
            return (
              <div key={s} className="flex items-center gap-2">
                <button
                  onClick={() => { if (done || (active)) return; }}
                  className={`flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${active ? "bg-violet-600 text-white" : done ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}
                >
                  {done
                    ? <Icon name="CheckCircle" size={13} />
                    : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">{s}</span>
                  }
                  <span className="hidden sm:inline">{label}</span>
                </button>
                {s < 3 && <Icon name="ChevronRight" size={14} className="text-muted-foreground" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto">
        <div className="max-w-5xl mx-auto px-6 py-6">
          {step === 1 && <Step1 data={data} onChange={patch} />}
          {step === 2 && <Step2 lessons={data.lessons} onChange={(lessons) => patch({ lessons })} />}
          {step === 3 && <Step3 questions={data.questions} hasTest={data.hasTest} onChange={(questions) => patch({ questions })} />}
        </div>
      </div>

      {/* Подвал */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card flex-shrink-0">
        <div className="flex items-center gap-2">
          {stepError && (
            <div className="flex items-center gap-1.5 text-sm text-red-500">
              <Icon name="AlertCircle" size={14} />
              {stepError}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step > 1 && (
            <Button variant="outline" className="rounded-xl gap-1.5" onClick={goBack}>
              <Icon name="ChevronLeft" size={15} />
              Назад
            </Button>
          )}
          {step < 3 ? (
            <Button className="gradient-primary text-white rounded-xl gap-1.5" onClick={goNext}>
              Далее
              <Icon name="ChevronRight" size={15} />
            </Button>
          ) : (
            <Button className="gradient-primary text-white rounded-xl gap-1.5" onClick={handleSave}>
              <Icon name="Send" size={15} />
              Отправить на проверку
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
