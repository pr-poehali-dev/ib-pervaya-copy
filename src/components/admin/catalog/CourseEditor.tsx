import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";

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
};

// ─── Карта материалов ─────────────────────────────────────────────────────────

const MAT_MAP: Record<MaterialType, { icon: string; label: string; color: string; exts: string[] }> = {
  video:        { icon: "Video",        label: "Видео",       color: "from-rose-500 to-pink-600",     exts: ["MP4", "MOV"] },
  lecture:      { icon: "FileText",     label: "Лекция",      color: "from-violet-500 to-purple-600", exts: ["PDF", "DOCX"] },
  presentation: { icon: "Presentation", label: "Презентация", color: "from-blue-500 to-indigo-600",   exts: ["PPTX", "PDF"] },
  audio:        { icon: "Mic",          label: "Аудио",       color: "from-amber-500 to-orange-600",  exts: ["MP3", "WAV"] },
};

const NTD_EXTS = ["PDF", "DOCX", "DOC", "RTF"];

const STEPS = [
  { n: 1, label: "Описание",  icon: "BookOpen" },
  { n: 2, label: "Тесты",     icon: "ClipboardList" },
  { n: 3, label: "Материалы", icon: "FolderOpen" },
  { n: 4, label: "НТД",       icon: "FileCheck" },
];

// ─── Скачать шаблон тестов ────────────────────────────────────────────────────

function downloadTemplate() {
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

// ─── Шаг 1: Описание курса ────────────────────────────────────────────────────

function Step1({ data, onChange }: { data: CourseEditorData; onChange: (p: Partial<CourseEditorData>) => void }) {
  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Название курса *</label>
        <input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Например: Вводный инструктаж для новых сотрудников"
          className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Код курса</label>
          <input
            value={data.code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="ВИ-01"
            className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Количество часов *</label>
          <input
            type="number" min="1"
            value={data.hours}
            onChange={(e) => onChange({ hours: e.target.value })}
            placeholder="8"
            className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Описание курса</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          placeholder="Цели курса, целевая аудитория, ключевые темы..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
        />
      </div>
      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors">
        <input
          type="checkbox"
          checked={data.dpoAvailable}
          onChange={(e) => onChange({ dpoAvailable: e.target.checked })}
          className="rounded accent-violet-600 w-4 h-4 mt-0.5 flex-shrink-0"
        />
        <div>
          <p className="text-sm font-medium">Удостоверение ДПО</p>
          <p className="text-xs text-muted-foreground">При успешной сдаче итогового теста выдаётся удостоверение о повышении квалификации</p>
        </div>
      </label>
    </div>
  );
}

// ─── Шаг 2: Тесты ────────────────────────────────────────────────────────────

const TEST_MODES: { key: TestMode; label: string; desc: string; icon: string }[] = [
  { key: "adaptive", label: "Адаптивный тренинг",  desc: "Вопросы подбираются по слабым местам слушателя в процессе прохождения курса", icon: "Zap" },
  { key: "section",  label: "Тест по разделу",     desc: "Проверочный тест в конце каждого раздела курса",                              icon: "LayoutList" },
  { key: "final",    label: "Итоговый тест",        desc: "Финальная аттестация по всему курсу с ограничением по времени",               icon: "GraduationCap" },
];

function Step2({ data, onChange }: { data: CourseEditorData; onChange: (p: Partial<CourseEditorData>) => void }) {
  const [uploaded, setUploaded] = useState<string | null>(null);

  function toggleMode(m: TestMode) {
    const cur = data.testModes;
    onChange({ testModes: cur.includes(m) ? cur.filter((x) => x !== m) : [...cur, m] });
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">

      {/* Загрузка базы вопросов */}
      <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center flex-shrink-0">
            <Icon name="Table" size={18} className="text-white" />
          </div>
          <div className="flex-1">
            <p className="font-semibold text-sm">База вопросов</p>
            <p className="text-xs text-muted-foreground">Загрузите файл по шаблону</p>
          </div>
          <button
            onClick={downloadTemplate}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl border border-border text-xs font-medium text-muted-foreground hover:text-foreground hover:border-violet-400 transition-all"
          >
            <Icon name="Download" size={13} />
            Скачать шаблон
          </button>
        </div>

        <div className="bg-muted/40 rounded-xl p-3 space-y-2">
          <p className="text-xs font-medium">Формат файла (.xlsx / .csv):</p>
          <div className="flex flex-wrap gap-1.5">
            {["№ вопроса", "Текст вопроса", "Вариант ответа", "Верно (1=да)", "Наименование НТД", "Выдержка из НТД"].map((h) => (
              <span key={h} className="bg-background border border-border rounded px-2 py-0.5 text-xs font-mono">{h}</span>
            ))}
          </div>
          <p className="text-xs text-muted-foreground">
            Один вопрос = несколько строк (по одной на каждый вариант ответа). «1» в столбце «Верно» — правильный ответ, допустимо несколько. Без объединения ячеек.
          </p>
        </div>

        {uploaded ? (
          <div className="flex items-center gap-3 px-4 py-3 bg-emerald-50 dark:bg-emerald-900/10 border border-emerald-200 dark:border-emerald-800 rounded-xl">
            <Icon name="CheckCircle" size={16} className="text-emerald-600 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-emerald-800 dark:text-emerald-300 truncate">{uploaded}</p>
              <p className="text-xs text-emerald-600 dark:text-emerald-400">Файл загружен успешно</p>
            </div>
            <button onClick={() => setUploaded(null)} className="p-1 rounded-lg hover:bg-emerald-100 dark:hover:bg-emerald-900/30 text-emerald-600 transition-colors">
              <Icon name="X" size={14} />
            </button>
          </div>
        ) : (
          <label className="flex items-center gap-3 px-4 py-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all">
            <Icon name="Upload" size={18} className="text-muted-foreground flex-shrink-0" />
            <div>
              <p className="text-sm font-medium">Загрузить файл с вопросами</p>
              <p className="text-xs text-muted-foreground">.xlsx или .csv — по шаблону выше</p>
            </div>
            <input
              type="file"
              className="hidden"
              accept=".xlsx,.csv"
              onChange={(e) => { if (e.target.files?.[0]) setUploaded(e.target.files[0].name); }}
            />
          </label>
        )}
      </div>

      {/* Где применять */}
      <div className="space-y-3">
        <p className="font-semibold text-sm">Где применять тесты</p>
        <div className="space-y-2">
          {TEST_MODES.map((m) => {
            const active = data.testModes.includes(m.key);
            return (
              <label key={m.key} className={`flex items-start gap-3 cursor-pointer p-4 rounded-xl border-2 transition-all ${active ? "border-violet-500 bg-violet-50 dark:bg-violet-900/10" : "border-border hover:border-violet-300"}`}>
                <input
                  type="checkbox"
                  checked={active}
                  onChange={() => toggleMode(m.key)}
                  className="rounded accent-violet-600 w-4 h-4 mt-0.5 flex-shrink-0"
                />
                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 transition-colors ${active ? "bg-violet-600" : "bg-muted"}`}>
                  <Icon name={m.icon} size={15} className={active ? "text-white" : "text-muted-foreground"} />
                </div>
                <div>
                  <p className="text-sm font-medium">{m.label}</p>
                  <p className="text-xs text-muted-foreground">{m.desc}</p>
                </div>
              </label>
            );
          })}
        </div>
      </div>

      {/* Настройки итогового */}
      {data.testModes.includes("final") && (
        <div className="bg-card border border-border rounded-2xl p-5 space-y-4">
          <p className="font-semibold text-sm flex items-center gap-2">
            <Icon name="GraduationCap" size={16} className="text-violet-600" />
            Параметры итогового теста
          </p>
          <div className="grid grid-cols-3 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Вопросов в тесте</label>
              <input
                type="number" min="1"
                value={data.finalTestQuestions}
                onChange={(e) => onChange({ finalTestQuestions: e.target.value })}
                placeholder="20"
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
              <p className="text-xs text-muted-foreground">Случайная выборка из базы</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Проходной балл, %</label>
              <input
                type="number" min="1" max="100"
                value={data.finalTestPassScore}
                onChange={(e) => onChange({ finalTestPassScore: e.target.value })}
                placeholder="70"
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
              <p className="text-xs text-muted-foreground">Минимум для сдачи</p>
            </div>
            <div className="space-y-1.5">
              <label className="text-xs text-muted-foreground font-medium">Время, мин</label>
              <input
                type="number" min="0"
                value={data.finalTestTime}
                onChange={(e) => onChange({ finalTestTime: e.target.value })}
                placeholder="60"
                className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
              />
              <p className="text-xs text-muted-foreground">0 = без ограничений</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

// ─── Шаг 3: Материалы ────────────────────────────────────────────────────────

function Step3({ data, onChange }: { data: CourseEditorData; onChange: (p: Partial<CourseEditorData>) => void }) {
  const [type,  setType]  = useState<MaterialType>("video");
  const [ext,   setExt]   = useState("MP4");
  const [title, setTitle] = useState("");
  const [dur,   setDur]   = useState("");
  const [error, setError] = useState("");

  function selectType(t: MaterialType) { setType(t); setExt(MAT_MAP[t].exts[0]); }

  function add() {
    if (!title.trim()) { setError("Введите название материала"); return; }
    onChange({ materials: [...data.materials, { id: Date.now(), title: title.trim(), type, ext, duration: dur.trim() || undefined }] });
    setTitle(""); setDur(""); setError("");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <p className="font-semibold text-sm">Добавить материал</p>

        <div className="grid grid-cols-4 gap-2">
          {(Object.entries(MAT_MAP) as [MaterialType, typeof MAT_MAP[MaterialType]][]).map(([key, val]) => (
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

        <div className="flex gap-2">
          {MAT_MAP[type].exts.map((e) => (
            <button key={e} onClick={() => setExt(e)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${ext === e ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : "border-border text-muted-foreground hover:border-violet-300"}`}
            >{e}</button>
          ))}
        </div>

        <div className="space-y-1.5">
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
            placeholder="Название материала *"
            className={`w-full h-9 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${error ? "border-red-400" : "border-border"}`}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <div className="grid grid-cols-2 gap-3">
          <input
            value={dur}
            onChange={(e) => setDur(e.target.value)}
            placeholder="Длительность (45 мин)"
            className="h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
          <label className="flex items-center gap-2 h-9 px-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-violet-400 transition-colors">
            <Icon name="Upload" size={13} className="text-muted-foreground flex-shrink-0" />
            <span className="text-xs text-muted-foreground truncate">Файл {ext}</span>
            <input type="file" className="hidden" accept={`.${ext.toLowerCase()}`} />
          </label>
        </div>

        <Button className="w-full gradient-primary text-white rounded-xl gap-1.5" onClick={add}>
          <Icon name="Plus" size={15} />
          Добавить материал
        </Button>
      </div>

      <div className="space-y-3">
        <p className="font-semibold text-sm">
          Материалы курса
          {data.materials.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({data.materials.length})</span>}
        </p>
        {data.materials.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-border rounded-2xl text-center">
            <Icon name="FolderOpen" size={28} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Материалы не добавлены</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {data.materials.map((m, idx) => {
              const info = MAT_MAP[m.type];
              return (
                <div key={m.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                  <span className="text-xs font-mono text-muted-foreground w-5 text-center flex-shrink-0">{idx + 1}</span>
                  <div className={`w-8 h-8 bg-gradient-to-br ${info.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                    <Icon name={info.icon} size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{m.title}</p>
                    <p className="text-xs text-muted-foreground">{info.label} · {m.ext}{m.duration ? ` · ${m.duration}` : ""}</p>
                  </div>
                  <button onClick={() => onChange({ materials: data.materials.filter((x) => x.id !== m.id) })}
                    className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                    <Icon name="Trash2" size={13} />
                  </button>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Шаг 4: НТД ──────────────────────────────────────────────────────────────

function Step4({ data, onChange }: { data: CourseEditorData; onChange: (p: Partial<CourseEditorData>) => void }) {
  const [ext,   setExt]   = useState("PDF");
  const [title, setTitle] = useState("");
  const [error, setError] = useState("");

  function add() {
    if (!title.trim()) { setError("Введите название документа"); return; }
    onChange({ ntdFiles: [...data.ntdFiles, { id: Date.now(), title: title.trim(), ext }] });
    setTitle(""); setError("");
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 max-w-4xl mx-auto">
      <div className="space-y-4">
        <p className="font-semibold text-sm">Добавить документ НТД</p>

        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl p-4 flex items-start gap-3">
          <Icon name="Info" size={15} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <p className="text-xs text-blue-700 dark:text-blue-400">
            Документы НТД доступны слушателю в разделе «Библиотека» курса. Ссылки на НТД автоматически используются в подсказках теста (из колонки «Выдержка из НТД» шаблона).
          </p>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs text-muted-foreground font-medium">Формат файла</label>
          <div className="flex gap-2 flex-wrap">
            {NTD_EXTS.map((e) => (
              <button key={e} onClick={() => setExt(e)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${ext === e ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : "border-border text-muted-foreground hover:border-violet-300"}`}
              >{e}</button>
            ))}
          </div>
        </div>

        <div className="space-y-1.5">
          <input
            value={title}
            onChange={(e) => { setTitle(e.target.value); setError(""); }}
            onKeyDown={(e) => { if (e.key === "Enter") add(); }}
            placeholder="Название документа (ФЗ-116, ГОСТ Р 12.0.001...)"
            className={`w-full h-9 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${error ? "border-red-400" : "border-border"}`}
          />
          {error && <p className="text-xs text-red-500">{error}</p>}
        </div>

        <label className="flex items-center gap-3 px-4 py-4 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-all">
          <Icon name="Upload" size={16} className="text-muted-foreground flex-shrink-0" />
          <div>
            <p className="text-sm font-medium">Загрузить файл</p>
            <p className="text-xs text-muted-foreground">{NTD_EXTS.join(", ")} · до 100 МБ</p>
          </div>
          <input type="file" className="hidden" accept={NTD_EXTS.map((e) => `.${e.toLowerCase()}`).join(",")} />
        </label>

        <Button className="w-full gradient-primary text-white rounded-xl gap-1.5" onClick={add}>
          <Icon name="Plus" size={15} />
          Добавить документ
        </Button>
      </div>

      <div className="space-y-3">
        <p className="font-semibold text-sm">
          Библиотека НТД
          {data.ntdFiles.length > 0 && <span className="ml-2 text-xs font-normal text-muted-foreground">({data.ntdFiles.length})</span>}
        </p>
        {data.ntdFiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-14 border-2 border-dashed border-border rounded-2xl text-center">
            <Icon name="FileCheck" size={28} className="text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground">Документы не добавлены</p>
          </div>
        ) : (
          <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1">
            {data.ntdFiles.map((f, idx) => (
              <div key={f.id} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border">
                <span className="text-xs font-mono text-muted-foreground w-5 text-center flex-shrink-0">{idx + 1}</span>
                <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                  <Icon name="FileText" size={14} className="text-white" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium truncate">{f.title}</p>
                  <p className="text-xs text-muted-foreground font-mono">{f.ext}</p>
                </div>
                <button onClick={() => onChange({ ntdFiles: data.ntdFiles.filter((x) => x.id !== f.id) })}
                  className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
                  <Icon name="Trash2" size={13} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

interface CourseEditorProps {
  onClose: () => void;
  onSave: (data: CourseEditorData) => void;
  initialData?: Partial<CourseEditorData>;
}

export default function CourseEditor({ onClose, onSave, initialData }: CourseEditorProps) {
  const [step,      setStep]      = useState(1);
  const [stepError, setStepError] = useState("");

  const [data, setData] = useState<CourseEditorData>({
    title:              initialData?.title              ?? "",
    code:               initialData?.code               ?? "",
    hours:              initialData?.hours              ?? "",
    description:        initialData?.description        ?? "",
    dpoAvailable:       initialData?.dpoAvailable       ?? false,
    testModes:          initialData?.testModes          ?? ["adaptive", "final"],
    finalTestQuestions: initialData?.finalTestQuestions ?? "20",
    finalTestPassScore: initialData?.finalTestPassScore ?? "70",
    finalTestTime:      initialData?.finalTestTime      ?? "60",
    materials:          initialData?.materials          ?? [],
    ntdFiles:           initialData?.ntdFiles           ?? [],
  });

  function patch(p: Partial<CourseEditorData>) { setData((prev) => ({ ...prev, ...p })); }

  function goNext() {
    if (step === 1) {
      if (!data.title.trim()) { setStepError("Введите название курса"); return; }
      if (!data.hours || Number(data.hours) < 1) { setStepError("Укажите количество часов"); return; }
    }
    setStepError("");
    setStep((s) => Math.min(s + 1, 4));
  }

  function goBack() { setStepError(""); setStep((s) => Math.max(s - 1, 1)); }

  function handleSave() { onSave(data); onClose(); }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">

      {/* Шапка */}
      <div className="flex items-center gap-4 px-5 py-3.5 border-b border-border bg-card flex-shrink-0">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0">
          <Icon name="X" size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base truncate">{data.title || "Новый курс"}</p>
          <p className="text-xs text-muted-foreground">Конструктор курса</p>
        </div>

        {/* Прогресс шагов */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {STEPS.map((s, i) => {
            const done   = step > s.n;
            const active = step === s.n;
            return (
              <div key={s.n} className="flex items-center gap-1">
                <button
                  onClick={() => { if (done) setStep(s.n); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    active ? "bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30" :
                    done   ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/50" :
                             "bg-muted text-muted-foreground"
                  }`}
                >
                  {done
                    ? <Icon name="CheckCircle" size={12} />
                    : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">{s.n}</span>
                  }
                  <span className="hidden md:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <Icon name="ChevronRight" size={13} className="text-muted-foreground" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {step === 1 && <Step1 data={data} onChange={patch} />}
          {step === 2 && <Step2 data={data} onChange={patch} />}
          {step === 3 && <Step3 data={data} onChange={patch} />}
          {step === 4 && <Step4 data={data} onChange={patch} />}
        </div>
      </div>

      {/* Подвал */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card flex-shrink-0">
        <div>
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
          {step < 4 ? (
            <Button className="gradient-primary text-white rounded-xl gap-1.5" onClick={goNext}>
              Далее
              <Icon name="ChevronRight" size={15} />
            </Button>
          ) : (
            <Button className="gradient-primary text-white rounded-xl gap-1.5 px-5" onClick={handleSave}>
              <Icon name="Send" size={15} />
              Отправить на проверку
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
