import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COURSE_DIRECTIONS, TENANT_COURSES, TENANTS } from "@/data/mockData";
import type { TenantCourse, TenantCourseStatus } from "@/components/admin/types";
import CourseEditor, { CourseEditorData } from "@/components/admin/catalog/CourseEditor";

type PanelTab = "platform" | "tenant_approval";

// ─── Бейдж статуса курса тенанта ─────────────────────────────────────────────

function ApprovalBadge({ status }: { status: TenantCourseStatus }) {
  const map: Record<TenantCourseStatus, { label: string; cls: string; icon: string }> = {
    draft:            { label: "Черновик",    cls: "bg-muted text-muted-foreground",                                                       icon: "FileText" },
    pending_approval: { label: "На проверке", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",                 icon: "Clock" },
    approved:         { label: "Одобрен",     cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",         icon: "CheckCircle" },
    rejected:         { label: "Отклонён",    cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",                        icon: "XCircle" },
  };
  const { label, cls, icon } = map[status];
  return <Badge className={`text-xs gap-1 ${cls}`}><Icon name={icon} size={11} />{label}</Badge>;
}

// ─── Модальное окно отклонения курса с материалами ───────────────────────────

function RejectModal({ course, onClose, onReject }: {
  course: TenantCourse;
  onClose: () => void;
  onReject: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <div>
            <h2 className="font-bold text-base">Отклонить курс</h2>
            <p className="text-xs text-muted-foreground mt-0.5">Курс и все его материалы будут отклонены</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-5 space-y-3">
          <div className="bg-muted/30 rounded-xl px-4 py-3 flex items-center gap-2">
            <Icon name="BookOpen" size={15} className="text-muted-foreground flex-shrink-0" />
            <p className="text-sm font-medium">{course.title}</p>
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Замечания для администратора *</label>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              rows={4}
              className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
              placeholder="Опишите что нужно исправить..."
            />
          </div>
        </div>
        <div className="flex gap-2 p-5 border-t border-border">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white" disabled={!reason.trim()} onClick={() => onReject(reason.trim())}>
            Отклонить
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Каталог курсов платформы ─────────────────────────────────────────────────

const PLATFORM_DIRS = COURSE_DIRECTIONS.filter((d) => d.id !== 6).map((d) => ({ id: d.id, title: d.title }));

function PlatformCatalog() {
  const [openDirs,    setOpenDirs]    = useState<number[]>([1]);
  const [showEditor,  setShowEditor]  = useState(false);
  const [editorInit,  setEditorInit]  = useState<Partial<CourseEditorData>>({});
  const [search,      setSearch]      = useState("");

  function toggleDir(id: number) {
    setOpenDirs((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  }

  function openAdd(dirId: number) {
    setEditorInit({ directionId: dirId });
    setShowEditor(true);
  }

  const dirs = COURSE_DIRECTIONS.filter((d) => d.id !== 6);
  const filtered = dirs.map((d) => ({
    ...d,
    courses: search
      ? d.courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
      : d.courses,
  })).filter((d) => !search || d.courses.length > 0);

  if (showEditor) {
    return (
      <CourseEditor
        onClose={() => setShowEditor(false)}
        onSave={() => setShowEditor(false)}
        initialData={editorInit}
        directions={PLATFORM_DIRS}
        saveLabel="Добавить в каталог"
      />
    );
  }

  return (
    <div className="space-y-3">
      <div className="flex gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию или коду курса..." className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
        </div>
        <Button className="gradient-primary text-white rounded-xl gap-2 h-9 flex-shrink-0" onClick={() => openAdd(dirs[0]?.id ?? 1)}>
          <Icon name="Plus" size={15} />
          Добавить курс
        </Button>
      </div>

      <div className="space-y-2">
        {filtered.map((dir) => {
          const isOpen = openDirs.includes(dir.id) || !!search;
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
                <div className="flex items-center gap-2">
                  <button
                    onClick={(e) => { e.stopPropagation(); openAdd(dir.id); }}
                    className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                    title="Добавить курс в направление"
                  >
                    <Icon name="Plus" size={15} />
                  </button>
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
                        <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground"></th>
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
                          <td className="px-4 py-3">
                            <button
                              onClick={() => { setEditorInit({ title: course.title, code: course.code, hours: String(course.hours ?? ""), dpoAvailable: course.dpoAvailable ?? false, directionId: dir.id }); setShowEditor(true); }}
                              className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground"
                            >
                              <Icon name="Pencil" size={14} />
                            </button>
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
      </div>
    </div>
  );
}

// ─── Иконки типов материалов ──────────────────────────────────────────────────

const MAT_ICON: Record<string, string> = {
  lecture: "FileText", presentation: "Presentation", video: "Video", audio: "Mic", other: "Paperclip",
};

// ─── Моковые материалы привязанные к курсам тенантов ────────────────────────

type MockMaterial = { id: number; title: string; type: string; ext: string };

const MOCK_COURSE_MATERIALS: Record<number, MockMaterial[]> = {
  1: [
    { id: 101, title: "Лекция 1. Основные понятия и определения", type: "lecture",      ext: "PDF"  },
    { id: 102, title: "Презентация. Требования ФЗ-116",           type: "presentation", ext: "PPTX" },
    { id: 103, title: "Видеолекция. Введение в курс",             type: "video",        ext: "MP4"  },
  ],
  2: [
    { id: 201, title: "Аудиолекция. Ключевые требования ПБ",      type: "audio",        ext: "MP3"  },
    { id: 202, title: "Презентация. Нормативная база",             type: "presentation", ext: "PPTX" },
  ],
};

// ─── Список курсов тенантов на утверждение ────────────────────────────────────

function TenantApprovalPanel() {
  const [courses,       setCourses]      = useState<TenantCourse[]>(TENANT_COURSES);
  const [rejectTarget,  setRejectTarget] = useState<TenantCourse | null>(null);
  const [expandedId,    setExpandedId]   = useState<number | null>(null);
  const [filter,        setFilter]       = useState<TenantCourseStatus | "all">("pending_approval");

  function approve(id: number) {
    setCourses((prev) => prev.map((c) =>
      c.id === id ? { ...c, status: "approved", approvedAt: new Date().toLocaleDateString("ru-RU") } : c
    ));
  }

  function reject(id: number, reason: string) {
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, status: "rejected", rejectionReason: reason } : c));
    setRejectTarget(null);
  }

  function getTenantName(tenantId: number) {
    return TENANTS.find((t) => t.id === tenantId)?.name ?? `Тенант #${tenantId}`;
  }

  const counts = {
    all:              courses.length,
    pending_approval: courses.filter((c) => c.status === "pending_approval").length,
    approved:         courses.filter((c) => c.status === "approved").length,
    rejected:         courses.filter((c) => c.status === "rejected").length,
  };

  const visible = filter === "all" ? courses : courses.filter((c) => c.status === filter);
  const pendingCount = counts.pending_approval;

  return (
    <div className="space-y-4">
      {rejectTarget && (
        <RejectModal
          course={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onReject={(reason) => reject(rejectTarget.id, reason)}
        />
      )}

      {pendingCount > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3">
          <Icon name="Clock" size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">{pendingCount} курс{pendingCount > 1 ? "а" : ""}</span> с материалами ожидают проверки
          </p>
        </div>
      )}

      {/* Фильтры */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "all",              label: `Все (${counts.all})` },
          { key: "pending_approval", label: `На проверке (${counts.pending_approval})` },
          { key: "approved",         label: `Одобрены (${counts.approved})` },
          { key: "rejected",         label: `Отклонены (${counts.rejected})` },
        ] as { key: TenantCourseStatus | "all"; label: string }[]).map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${filter === f.key ? "gradient-primary text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted/60"}`}
          >
            {f.label}
          </button>
        ))}
      </div>

      {/* Карточки курсов */}
      {visible.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <Icon name="FolderOpen" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Нет курсов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((course) => {
            const mats = MOCK_COURSE_MATERIALS[course.id] ?? [];
            const isExpanded = expandedId === course.id;
            return (
              <div key={course.id} className={`bg-card rounded-2xl border overflow-hidden transition-all ${course.status === "pending_approval" ? "border-amber-200 dark:border-amber-800" : "border-border"}`}>
                {/* Шапка карточки */}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3 flex-1 min-w-0">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${course.status === "pending_approval" ? "bg-amber-100 dark:bg-amber-900/30" : course.status === "approved" ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
                        <Icon name="BookOpen" size={18} className={course.status === "pending_approval" ? "text-amber-600" : course.status === "approved" ? "text-emerald-600" : "text-red-500"} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <p className="font-semibold text-sm">{course.title}</p>
                          {course.code && <span className="text-xs font-mono text-muted-foreground">{course.code}</span>}
                          <ApprovalBadge status={course.status} />
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">{getTenantName(course.tenantId)} · {course.hours ? `${course.hours} ч` : "—"} · Создан {course.createdAt}</p>
                        {course.status === "rejected" && course.rejectionReason && (
                          <div className="mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                            <p className="text-xs text-red-600 dark:text-red-400"><span className="font-semibold">Замечания:</span> {course.rejectionReason}</p>
                          </div>
                        )}
                        {course.status === "approved" && course.approvedAt && (
                          <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Одобрен {course.approvedAt}</p>
                        )}
                      </div>
                    </div>

                    {/* Кнопки */}
                    <div className="flex items-center gap-2 flex-shrink-0">
                      {course.status === "pending_approval" && (
                        <>
                          <button
                            onClick={() => approve(course.id)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                          >
                            <Icon name="CheckCircle" size={13} />
                            Одобрить
                          </button>
                          <button
                            onClick={() => setRejectTarget(course)}
                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                          >
                            <Icon name="XCircle" size={13} />
                            Отклонить
                          </button>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Кнопка раскрытия материалов */}
                  {mats.length > 0 && (
                    <button
                      onClick={() => setExpandedId(isExpanded ? null : course.id)}
                      className="mt-3 flex items-center gap-2 text-xs text-muted-foreground hover:text-foreground transition-colors"
                    >
                      <Icon name={isExpanded ? "ChevronUp" : "ChevronDown"} size={13} />
                      {isExpanded ? "Скрыть" : "Показать"} материалы ({mats.length})
                    </button>
                  )}
                  {mats.length === 0 && (
                    <p className="mt-2 text-xs text-muted-foreground">Материалы не прикреплены</p>
                  )}
                </div>

                {/* Список материалов */}
                {isExpanded && mats.length > 0 && (
                  <div className="border-t border-border bg-muted/10 px-5 py-3 space-y-2">
                    <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-2">Материалы курса</p>
                    {mats.map((m) => (
                      <div key={m.id} className="flex items-center gap-3 p-2.5 bg-background rounded-xl border border-border">
                        <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-600 rounded-lg flex items-center justify-center flex-shrink-0">
                          <Icon name={MAT_ICON[m.type] ?? "FileText"} size={13} className="text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-medium truncate">{m.title}</p>
                          <p className="text-xs text-muted-foreground font-mono">{m.ext}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// ─── Главная панель ───────────────────────────────────────────────────────────

export default function PlatformCoursesPanel() {
  const [tab, setTab] = useState<PanelTab>("platform");

  const pendingCount = TENANT_COURSES.filter((c) => c.status === "pending_approval").length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2 flex-wrap">
        <button
          onClick={() => setTab("platform")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${tab === "platform" ? "gradient-primary text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted/60"}`}
        >
          <Icon name="BookOpen" size={16} />
          Каталог платформы
        </button>
        <button
          onClick={() => setTab("tenant_approval")}
          className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${tab === "tenant_approval" ? "gradient-primary text-white border-transparent" : "border-border text-muted-foreground hover:bg-muted/60"}`}
        >
          <Icon name="ClipboardCheck" size={16} />
          Курсы тенантов
          {pendingCount > 0 && (
            <span className="bg-amber-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
              {pendingCount}
            </span>
          )}
        </button>
      </div>

      {tab === "platform"        && <PlatformCatalog />}
      {tab === "tenant_approval" && <TenantApprovalPanel />}
    </div>
  );
}