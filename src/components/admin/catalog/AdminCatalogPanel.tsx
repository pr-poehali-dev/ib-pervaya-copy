import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";
import { COURSE_DIRECTIONS, TENANT_COURSES, TENANTS } from "@/data/mockData";
import type { TenantCourse, TenantCourseStatus, CourseMaterial, MaterialType } from "@/components/admin/types";

type CatalogTab = "platform" | "own";

// ─── Типы материала ────────────────────────────────────────────────────────────

const MATERIAL_TYPE_MAP: Record<MaterialType, { icon: string; label: string }> = {
  lecture:      { icon: "FileText",     label: "Лекция" },
  presentation: { icon: "Presentation", label: "Презентация" },
  video:        { icon: "Video",        label: "Видео" },
  audio:        { icon: "Mic",          label: "Аудио" },
  other:        { icon: "Paperclip",    label: "Другое" },
};

const EXT_BY_TYPE: Record<MaterialType, string[]> = {
  lecture:      ["PDF", "DOCX"],
  presentation: ["PPTX", "PDF"],
  video:        ["MP4", "MOV"],
  audio:        ["MP3", "WAV"],
  other:        ["PDF", "ZIP", "DOCX"],
};

// ─── Бейдж статуса своего курса ───────────────────────────────────────────────

function StatusBadge({ status }: { status: TenantCourseStatus }) {
  const map: Record<TenantCourseStatus, { label: string; cls: string; icon: string }> = {
    draft:            { label: "Черновик",    cls: "bg-muted text-muted-foreground",                                                     icon: "FileText" },
    pending_approval: { label: "На проверке", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",               icon: "Clock" },
    approved:         { label: "Одобрен",     cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",       icon: "CheckCircle" },
    rejected:         { label: "Отклонён",    cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",                      icon: "XCircle" },
  };
  const { label, cls, icon } = map[status];
  return (
    <Badge className={`text-xs gap-1 ${cls}`}>
      <Icon name={icon} size={11} />
      {label}
    </Badge>
  );
}

// ─── Вспомогательный компонент: строка материала в модале ─────────────────────

type DraftMaterial = { id: number; title: string; type: MaterialType; ext: string };

function MaterialRow({ mat, onRemove }: { mat: DraftMaterial; onRemove: () => void }) {
  const info = MATERIAL_TYPE_MAP[mat.type];
  return (
    <div className="flex items-center gap-3 p-3 bg-muted/30 rounded-xl border border-border">
      <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
        <Icon name={info.icon} size={13} className="text-white" />
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium truncate">{mat.title}</p>
        <p className="text-xs text-muted-foreground font-mono">{mat.ext} · {info.label}</p>
      </div>
      <button onClick={onRemove} className="p-1 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-muted-foreground hover:text-red-500 transition-colors flex-shrink-0">
        <Icon name="X" size={14} />
      </button>
    </div>
  );
}

// ─── Двухшаговый модал создания курса с материалами ───────────────────────────

type CourseWithMaterials = Omit<TenantCourse, "id" | "createdAt"> & { materials: DraftMaterial[] };

function AddCourseModal({ onClose, onAdd }: {
  onClose: () => void;
  onAdd: (data: CourseWithMaterials) => void;
}) {
  const [step,    setStep]    = useState<1 | 2>(1);
  const [title,   setTitle]   = useState("");
  const [code,    setCode]    = useState("");
  const [hours,   setHours]   = useState("8");
  const [hasTest, setHasTest] = useState(false);
  const [dpo,     setDpo]     = useState(false);
  const [error,   setError]   = useState("");

  const [materials,  setMaterials]  = useState<DraftMaterial[]>([]);
  const [matTitle,   setMatTitle]   = useState("");
  const [matType,    setMatType]    = useState<MaterialType>("lecture");
  const [matExt,     setMatExt]     = useState("PDF");
  const [matError,   setMatError]   = useState("");

  function goToStep2() {
    if (!title.trim()) { setError("Введите название курса"); return; }
    setStep(2);
  }

  function addMaterial() {
    if (!matTitle.trim()) { setMatError("Введите название материала"); return; }
    setMaterials((prev) => [...prev, { id: Date.now(), title: matTitle.trim(), type: matType, ext: matExt }]);
    setMatTitle("");
    setMatError("");
  }

  function handleSubmit() {
    onAdd({ tenantId: 1, title: title.trim(), code: code.trim() || undefined, hours: Number(hours) || 8, hasTest, dpoAvailable: dpo, status: "pending_approval", materials });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-2xl flex flex-col max-h-[90vh]">

        {/* Шапка */}
        <div className="flex items-center justify-between p-5 border-b border-border flex-shrink-0">
          <div>
            <h2 className="font-bold text-base">Добавить свой курс</h2>
            <div className="flex items-center gap-2 mt-1">
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 1 ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground"}`}>1</span>
              <span className="text-xs text-muted-foreground">Описание курса</span>
              <Icon name="ChevronRight" size={12} className="text-muted-foreground" />
              <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${step >= 2 ? "bg-violet-600 text-white" : "bg-muted text-muted-foreground"}`}>2</span>
              <span className="text-xs text-muted-foreground">Материалы</span>
            </div>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>

        {/* Шаг 1: описание курса */}
        {step === 1 && (
          <>
            <div className="p-5 space-y-3 overflow-y-auto flex-1">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Название курса *</label>
                <input
                  value={title}
                  onChange={(e) => { setTitle(e.target.value); setError(""); }}
                  className={`w-full h-9 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${error ? "border-red-400" : "border-border"}`}
                  placeholder="Введите название курса"
                />
                {error && <p className="text-xs text-red-500">{error}</p>}
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Код курса</label>
                  <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="ВИ-01" />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Часов</label>
                  <input type="number" min="1" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                  <input type="checkbox" checked={hasTest} onChange={(e) => setHasTest(e.target.checked)} className="rounded accent-violet-600 w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium">Итоговый тест</p>
                    <p className="text-xs text-muted-foreground">Курс содержит тест с проверкой знаний</p>
                  </div>
                </label>
                <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
                  <input type="checkbox" checked={dpo} onChange={(e) => setDpo(e.target.checked)} className="rounded accent-violet-600 w-4 h-4" />
                  <div>
                    <p className="text-sm font-medium">Удостоверение ДПО</p>
                    <p className="text-xs text-muted-foreground">При успешной сдаче теста выдаётся удостоверение</p>
                  </div>
                </label>
              </div>
            </div>
            <div className="flex gap-2 p-5 border-t border-border flex-shrink-0">
              <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
              <Button className="flex-1 rounded-xl gradient-primary text-white gap-1.5" onClick={goToStep2}>
                Далее — Материалы
                <Icon name="ChevronRight" size={15} />
              </Button>
            </div>
          </>
        )}

        {/* Шаг 2: материалы */}
        {step === 2 && (
          <>
            <div className="p-5 space-y-4 overflow-y-auto flex-1">
              <div className="bg-muted/30 rounded-xl p-3 flex items-center gap-2">
                <Icon name="BookOpen" size={15} className="text-violet-600 flex-shrink-0" />
                <p className="text-sm font-medium truncate">{title}</p>
                {code && <span className="text-xs font-mono text-muted-foreground ml-auto flex-shrink-0">{code}</span>}
              </div>

              {/* Форма добавления материала */}
              <div className="space-y-3 bg-card border border-border rounded-xl p-4">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Добавить материал</p>

                {/* Тип */}
                <div className="grid grid-cols-5 gap-1.5">
                  {(Object.entries(MATERIAL_TYPE_MAP) as [MaterialType, { icon: string; label: string }][]).map(([key, val]) => (
                    <button
                      key={key}
                      onClick={() => { setMatType(key); setMatExt(EXT_BY_TYPE[key][0]); }}
                      className={`flex flex-col items-center gap-1 py-2 rounded-xl border-2 text-xs font-medium transition-all ${matType === key ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : "border-border text-muted-foreground hover:border-violet-300"}`}
                    >
                      <Icon name={val.icon} size={15} />
                      {val.label}
                    </button>
                  ))}
                </div>

                {/* Формат */}
                <div className="flex gap-1.5 flex-wrap">
                  {EXT_BY_TYPE[matType].map((e) => (
                    <button
                      key={e}
                      onClick={() => setMatExt(e)}
                      className={`px-2.5 py-1 rounded-lg border text-xs font-mono font-medium transition-all ${matExt === e ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : "border-border text-muted-foreground hover:border-violet-300"}`}
                    >
                      {e}
                    </button>
                  ))}
                </div>

                {/* Название */}
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <input
                      value={matTitle}
                      onChange={(e) => { setMatTitle(e.target.value); setMatError(""); }}
                      placeholder="Название материала..."
                      className={`w-full h-9 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${matError ? "border-red-400" : "border-border"}`}
                      onKeyDown={(e) => { if (e.key === "Enter") addMaterial(); }}
                    />
                    {matError && <p className="text-xs text-red-500">{matError}</p>}
                  </div>
                  <button
                    onClick={addMaterial}
                    className="h-9 px-3 rounded-xl bg-violet-600 hover:bg-violet-700 text-white transition-colors flex items-center gap-1.5 text-sm font-medium flex-shrink-0"
                  >
                    <Icon name="Plus" size={15} />
                    Добавить
                  </button>
                </div>

                <label className="flex items-center gap-2 px-3 py-2.5 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
                  <Icon name="Upload" size={15} className="text-muted-foreground flex-shrink-0" />
                  <span className="text-sm text-muted-foreground">Выбрать файл ({EXT_BY_TYPE[matType].join(", ")})</span>
                  <input type="file" className="hidden" accept={EXT_BY_TYPE[matType].map((e) => `.${e.toLowerCase()}`).join(",")} />
                </label>
              </div>

              {/* Список добавленных */}
              {materials.length > 0 ? (
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">
                    Материалы курса ({materials.length})
                  </p>
                  {materials.map((m) => (
                    <MaterialRow key={m.id} mat={m} onRemove={() => setMaterials((prev) => prev.filter((x) => x.id !== m.id))} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-4 text-sm text-muted-foreground">
                  Материалы не добавлены — курс можно отправить без них
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 flex items-start gap-2">
                <Icon name="Info" size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
                <p className="text-xs text-blue-700 dark:text-blue-400">
                  Курс вместе со всеми материалами отправится суперадминистратору на проверку как единый пакет.
                </p>
              </div>
            </div>

            <div className="flex gap-2 p-5 border-t border-border flex-shrink-0">
              <Button variant="outline" className="rounded-xl gap-1.5" onClick={() => setStep(1)}>
                <Icon name="ChevronLeft" size={15} />
                Назад
              </Button>
              <Button className="flex-1 rounded-xl gradient-primary text-white gap-1.5" onClick={handleSubmit}>
                <Icon name="Send" size={15} />
                Отправить на проверку
              </Button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Раскрывающиеся материалы курса в таблице ────────────────────────────────

function CourseRow({ course, materials }: { course: TenantCourse & { materials?: DraftMaterial[] }; materials: DraftMaterial[] }) {
  const [open, setOpen] = useState(false);
  return (
    <>
      <tr
        className="border-b border-border hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={() => materials.length > 0 && setOpen((v) => !v)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {materials.length > 0 && (
              <Icon name={open ? "ChevronDown" : "ChevronRight"} size={14} className="text-muted-foreground flex-shrink-0" />
            )}
            <div className="min-w-0">
              <p className="font-medium text-sm truncate max-w-[200px]">{course.title}</p>
              {course.status === "rejected" && course.rejectionReason && (
                <p className="text-xs text-red-500 mt-0.5 truncate" title={course.rejectionReason}>
                  {course.rejectionReason}
                </p>
              )}
            </div>
          </div>
        </td>
        <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{course.code ?? "—"}</td>
        <td className="px-4 py-3 text-sm text-muted-foreground">{course.hours ? `${course.hours} ч` : "—"}</td>
        <td className="px-4 py-3">
          {course.hasTest ? <Icon name="CheckCircle" size={15} className="text-emerald-500" /> : <Icon name="Minus" size={15} className="text-muted-foreground" />}
        </td>
        <td className="px-4 py-3">
          {course.dpoAvailable ? <Icon name="Award" size={15} className="text-violet-500" /> : <Icon name="Minus" size={15} className="text-muted-foreground" />}
        </td>
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            <StatusBadge status={course.status} />
            {materials.length > 0 && (
              <span className="text-xs text-muted-foreground">{materials.length} файл{materials.length > 1 ? "а" : ""}</span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">{course.createdAt}</td>
      </tr>
      {open && materials.length > 0 && (
        <tr className="border-b border-border bg-muted/10">
          <td colSpan={7} className="px-8 py-3">
            <div className="space-y-1.5">
              {materials.map((m) => {
                const info = MATERIAL_TYPE_MAP[m.type];
                return (
                  <div key={m.id} className="flex items-center gap-2.5 text-sm">
                    <Icon name={info.icon} size={13} className="text-muted-foreground flex-shrink-0" />
                    <span className="text-sm">{m.title}</span>
                    <span className="text-xs font-mono text-muted-foreground">{m.ext}</span>
                  </div>
                );
              })}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function AdminCatalogPanel() {
  const { tenantType } = useRole();
  const canOwnCourses = true;

  const [tab,          setTab]          = useState<CatalogTab>("platform");
  const [search,       setSearch]       = useState("");
  const [openDirs,     setOpenDirs]     = useState<number[]>([1]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [ownCourses,   setOwnCourses]   = useState<(TenantCourse & { materials: DraftMaterial[] })[]>(
    TENANT_COURSES.map((c) => ({ ...c, materials: [] }))
  );

  function toggleDir(id: number) {
    setOpenDirs((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  }

  function handleAddCourse(data: CourseWithMaterials) {
    const newCourse = {
      ...data,
      id:        Math.max(...ownCourses.map((c) => c.id), 1000) + 1,
      createdAt: new Date().toLocaleDateString("ru-RU"),
    };
    setOwnCourses((prev) => [...prev, newCourse]);
  }

  const currentTenant = TENANTS[0];

  const allowedDirs = COURSE_DIRECTIONS.filter(
    (d) => currentTenant.allowedDirections.includes(d.id) && d.id !== 6
  );

  const filteredDirs = allowedDirs.map((d) => ({
    ...d,
    courses: search
      ? d.courses.filter((c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase())
        )
      : d.courses,
  })).filter((d) => !search || d.courses.length > 0);

  const filteredOwn = ownCourses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    (c.code ?? "").toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {showAddModal && (
        <AddCourseModal onClose={() => setShowAddModal(false)} onAdd={handleAddCourse} />
      )}

      {/* Шапка */}
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
          <button
            onClick={() => { setTab("platform"); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "platform" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon name="Globe" size={15} />
            Курсы платформы
          </button>
          <button
            onClick={() => { setTab("own"); setSearch(""); }}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "own" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon name="FolderOpen" size={15} />
            Свои курсы
            <span className="bg-violet-600 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">{ownCourses.length}</span>
          </button>
        </div>
        <div className="relative flex-1 min-w-[200px]">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder={tab === "platform" ? "Поиск по названию или коду..." : "Поиск курса..."}
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        {tab === "own" && (
          <Button className="gradient-primary text-white rounded-xl gap-2 h-9 flex-shrink-0" onClick={() => setShowAddModal(true)}>
            <Icon name="Plus" size={15} />
            Добавить курс
          </Button>
        )}
      </div>

      {/* Курсы платформы */}
      {tab === "platform" && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground px-1">
            Доступно {allowedDirs.length} направлений · {allowedDirs.reduce((s, d) => s + d.courses.length, 0)} курсов
          </p>

          {filteredDirs.map((dir) => {
            const isOpen = openDirs.includes(dir.id) || !!search;
            const sub = currentTenant.subscriptions.find((s) => {
              const d = COURSE_DIRECTIONS.find((cd) => cd.id === dir.id);
              return d && s.type === d.subscriptionType;
            });
            return (
              <div key={dir.id} className="bg-card rounded-2xl border border-border overflow-hidden">
                <button
                  onClick={() => toggleDir(dir.id)}
                  className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-violet-100 dark:bg-violet-900/30 flex items-center justify-center">
                      <Icon name="BookOpen" size={16} className="text-violet-600 dark:text-violet-400" />
                    </div>
                    <div className="text-left">
                      <p className="font-semibold text-sm">{dir.title}</p>
                      <p className="text-xs text-muted-foreground">{dir.courses.length} курсов</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {sub && (
                      <div className="text-right">
                        <p className="text-xs text-muted-foreground">Подписки: {sub.used}/{sub.total}</p>
                        <div className="w-24 h-1 bg-muted rounded-full overflow-hidden mt-0.5">
                          <div
                            className={`h-full rounded-full ${sub.used / sub.total >= 0.85 ? "bg-red-500" : "bg-violet-500"}`}
                            style={{ width: `${Math.round((sub.used / sub.total) * 100)}%` }}
                          />
                        </div>
                      </div>
                    )}
                    <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className="text-muted-foreground" />
                  </div>
                </button>

                {isOpen && (
                  <div className="border-t border-border">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground">Код</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Название курса</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Часов</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Тест</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">ДПО</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dir.courses.map((course, idx) => (
                          <tr key={course.id} className={`border-t border-border hover:bg-muted/20 transition-colors ${idx % 2 !== 0 ? "bg-muted/5" : ""}`}>
                            <td className="px-5 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{course.code}</td>
                            <td className="px-4 py-3 font-medium">{course.title}</td>
                            <td className="px-4 py-3 text-muted-foreground">{course.hours} ч</td>
                            <td className="px-4 py-3">
                              {course.hasTest ? <Icon name="CheckCircle" size={15} className="text-emerald-500" /> : <Icon name="Minus" size={15} className="text-muted-foreground" />}
                            </td>
                            <td className="px-4 py-3">
                              {course.dpoAvailable ? <Icon name="Award" size={15} className="text-violet-500" /> : <Icon name="Minus" size={15} className="text-muted-foreground" />}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            );
          })}

          {filteredDirs.length === 0 && (
            <div className="bg-card rounded-2xl border border-border p-10 text-center">
              <Icon name="SearchX" size={32} className="text-muted-foreground mx-auto mb-2" />
              <p className="text-muted-foreground text-sm">Курсы не найдены</p>
            </div>
          )}
        </div>
      )}

      {/* Свои курсы */}
      {tab === "own" && (
        <div className="space-y-3">
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 flex items-start gap-2">
            <Icon name="Info" size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Курс с материалами проходит проверку суперадминистратора как единый пакет. После одобрения курс доступен для назначения слушателям вашего тенанта.
            </p>
          </div>

          {filteredOwn.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-10 text-center">
              <div className="w-14 h-14 bg-muted/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="FolderPlus" size={24} className="text-muted-foreground" />
              </div>
              <p className="font-semibold">Свои курсы не добавлены</p>
              <p className="text-sm text-muted-foreground mt-1">Нажмите «Добавить курс» чтобы создать первый</p>
              <Button className="gradient-primary text-white rounded-xl gap-2 mt-4" onClick={() => setShowAddModal(true)}>
                <Icon name="Plus" size={15} />
                Добавить курс
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Курс</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Код</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Часов</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Тест</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">ДПО</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Добавлен</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOwn.map((c) => (
                    <CourseRow key={c.id} course={c} materials={c.materials} />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
