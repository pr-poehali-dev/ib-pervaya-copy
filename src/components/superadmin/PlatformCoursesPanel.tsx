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

// ─── Карта иконок и цветов материалов ────────────────────────────────────────

const MAT_META: Record<string, { icon: string; color: string }> = {
  video:        { icon: "Video",        color: "from-rose-500 to-pink-600"     },
  lecture:      { icon: "FileText",     color: "from-violet-500 to-purple-600" },
  presentation: { icon: "Presentation", color: "from-blue-500 to-indigo-600"   },
  audio:        { icon: "Mic",          color: "from-amber-500 to-orange-600"  },
};

const TEST_MODE_LABELS: Record<string, string> = {
  adaptive: "Адаптивный тренинг",
  section:  "Тест по разделу",
  final:    "Итоговый тест",
};

// ─── Список курсов тенантов на утверждение ────────────────────────────────────

type ExpandTab = "materials" | "ntd" | "test";

function CourseCard({
  course,
  onApprove,
  onReject,
}: {
  course: TenantCourse;
  onApprove: () => void;
  onReject: () => void;
}) {
  const [open,       setOpen]       = useState(false);
  const [expandTab,  setExpandTab]  = useState<ExpandTab>("materials");

  const mats = course.materials ?? [];
  const ntds = course.ntdFiles  ?? [];
  const hasMeta = mats.length > 0 || ntds.length > 0 || (course.testModes && course.testModes.length > 0);

  const statusIconColor =
    course.status === "pending_approval" ? "bg-amber-100 dark:bg-amber-900/30"   :
    course.status === "approved"         ? "bg-emerald-100 dark:bg-emerald-900/30" :
                                           "bg-red-100 dark:bg-red-900/30";
  const statusTextColor =
    course.status === "pending_approval" ? "text-amber-600"  :
    course.status === "approved"         ? "text-emerald-600" :
                                           "text-red-500";

  return (
    <div className={`bg-card rounded-2xl border overflow-hidden transition-all ${course.status === "pending_approval" ? "border-amber-200 dark:border-amber-800" : "border-border"}`}>
      <div className="p-5">
        <div className="flex items-start justify-between gap-3">
          {/* Иконка + мета */}
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${statusIconColor}`}>
              <Icon name="BookOpen" size={18} className={statusTextColor} />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <p className="font-semibold text-sm">{course.title}</p>
                {course.code && <span className="text-xs font-mono text-muted-foreground">{course.code}</span>}
                <ApprovalBadge status={course.status} />
                {course.dpoAvailable && (
                  <span className="flex items-center gap-1 text-xs bg-violet-100 dark:bg-violet-900/30 text-violet-700 dark:text-violet-300 px-2 py-0.5 rounded-full">
                    <Icon name="Award" size={11} />ДПО
                  </span>
                )}
              </div>
              <p className="text-xs text-muted-foreground mt-1">
                {TENANTS.find((t) => t.id === course.tenantId)?.name ?? `Тенант #${course.tenantId}`}
                {" · "}{course.hours ? `${course.hours} ч` : "—"}
                {" · "}Создан {course.createdAt}
              </p>
              {course.description && (
                <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{course.description}</p>
              )}
              {course.status === "rejected" && course.rejectionReason && (
                <div className="mt-2 px-3 py-2 bg-red-50 dark:bg-red-900/10 border border-red-200 dark:border-red-800 rounded-lg">
                  <p className="text-xs text-red-600 dark:text-red-400">
                    <span className="font-semibold">Замечания: </span>{course.rejectionReason}
                  </p>
                </div>
              )}
              {course.status === "approved" && course.approvedAt && (
                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1">Одобрен {course.approvedAt}</p>
              )}
            </div>
          </div>

          {/* Кнопки действий */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {course.status === "pending_approval" && (
              <>
                <button
                  onClick={onApprove}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors"
                >
                  <Icon name="CheckCircle" size={13} />
                  Одобрить
                </button>
                <button
                  onClick={onReject}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors"
                >
                  <Icon name="XCircle" size={13} />
                  Отклонить
                </button>
              </>
            )}
          </div>
        </div>

        {/* Счётчики и кнопка раскрытия */}
        <div className="flex items-center gap-3 mt-3">
          {mats.length > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="FolderOpen" size={12} />{mats.length} матер.
            </span>
          )}
          {ntds.length > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="FileCheck" size={12} />{ntds.length} НТД
            </span>
          )}
          {course.testModes && course.testModes.length > 0 && (
            <span className="text-xs text-muted-foreground flex items-center gap-1">
              <Icon name="ClipboardList" size={12} />{course.testModes.length} режима теста
            </span>
          )}
          {hasMeta && (
            <button
              onClick={() => setOpen((v) => !v)}
              className="ml-auto flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Icon name={open ? "ChevronUp" : "ChevronDown"} size={13} />
              {open ? "Свернуть" : "Просмотреть"}
            </button>
          )}
          {!hasMeta && (
            <span className="text-xs text-muted-foreground">Материалы не прикреплены</span>
          )}
        </div>
      </div>

      {/* Раскрытый блок с вкладками */}
      {open && hasMeta && (
        <div className="border-t border-border bg-muted/10">
          {/* Вкладки */}
          <div className="flex gap-0 border-b border-border px-5">
            {([
              { key: "materials" as ExpandTab, label: `Материалы (${mats.length})`,     icon: "FolderOpen",    show: mats.length > 0 },
              { key: "ntd"       as ExpandTab, label: `НТД (${ntds.length})`,            icon: "FileCheck",     show: ntds.length > 0 },
              { key: "test"      as ExpandTab, label: "Тест",                            icon: "ClipboardList", show: !!(course.testModes && course.testModes.length > 0) },
            ] as { key: ExpandTab; label: string; icon: string; show: boolean }[])
              .filter((t) => t.show)
              .map((t) => (
                <button
                  key={t.key}
                  onClick={() => setExpandTab(t.key)}
                  className={`flex items-center gap-1.5 px-4 py-2.5 text-xs font-medium border-b-2 transition-all -mb-px ${expandTab === t.key ? "border-violet-500 text-violet-600 dark:text-violet-400" : "border-transparent text-muted-foreground hover:text-foreground"}`}
                >
                  <Icon name={t.icon} size={13} />
                  {t.label}
                </button>
              ))
            }
          </div>

          {/* Содержимое вкладки Материалы */}
          {expandTab === "materials" && mats.length > 0 && (
            <div className="px-5 py-4 space-y-2">
              {mats.map((m) => {
                const meta = MAT_META[m.type] ?? { icon: "FileText", color: "from-slate-500 to-gray-600" };
                return (
                  <div key={m.id} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                    <div className={`w-8 h-8 bg-gradient-to-br ${meta.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                      <Icon name={meta.icon} size={14} className="text-white" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium truncate">{m.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">{m.ext}{m.duration ? ` · ${m.duration}` : ""}</p>
                    </div>
                    <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors flex-shrink-0" title="Скачать">
                      <Icon name="Download" size={13} />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* Содержимое вкладки НТД */}
          {expandTab === "ntd" && ntds.length > 0 && (
            <div className="px-5 py-4 space-y-2">
              {ntds.map((f) => (
                <div key={f.id} className="flex items-center gap-3 p-3 bg-background rounded-xl border border-border">
                  <div className="w-8 h-8 bg-gradient-to-br from-slate-500 to-gray-700 rounded-lg flex items-center justify-center flex-shrink-0">
                    <Icon name="FileText" size={14} className="text-white" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{f.title}</p>
                    <p className="text-xs text-muted-foreground font-mono">{f.ext}</p>
                  </div>
                  <button className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground transition-colors flex-shrink-0" title="Скачать">
                    <Icon name="Download" size={13} />
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Содержимое вкладки Тест */}
          {expandTab === "test" && course.testModes && course.testModes.length > 0 && (
            <div className="px-5 py-4 space-y-3">
              <div className="flex flex-wrap gap-2">
                {course.testModes.map((m) => (
                  <span key={m} className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-violet-100 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300 text-xs font-medium">
                    <Icon name="CheckCircle" size={12} />
                    {TEST_MODE_LABELS[m] ?? m}
                  </span>
                ))}
              </div>
              {course.testModes.includes("final") && (
                <div className="grid grid-cols-3 gap-3">
                  {[
                    { label: "Вопросов",      val: course.finalTestQuestions ? `${course.finalTestQuestions} шт.` : "—" },
                    { label: "Проходной балл", val: course.finalTestPassScore  ? `${course.finalTestPassScore}%`    : "—" },
                    { label: "Время",          val: course.finalTestTime       ? course.finalTestTime === 0 ? "Без ограничений" : `${course.finalTestTime} мин` : "—" },
                  ].map((s) => (
                    <div key={s.label} className="bg-background border border-border rounded-xl px-3 py-2.5 text-center">
                      <p className="text-xs text-muted-foreground">{s.label}</p>
                      <p className="font-semibold text-sm mt-0.5">{s.val}</p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

function TenantApprovalPanel() {
  const [courses,      setCourses]     = useState<TenantCourse[]>(TENANT_COURSES);
  const [rejectTarget, setRejectTarget] = useState<TenantCourse | null>(null);
  const [filter,       setFilter]       = useState<TenantCourseStatus | "all">("pending_approval");

  function approve(id: number) {
    setCourses((prev) => prev.map((c) =>
      c.id === id ? { ...c, status: "approved", approvedAt: new Date().toLocaleDateString("ru-RU") } : c
    ));
  }

  function reject(id: number, reason: string) {
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, status: "rejected", rejectionReason: reason } : c));
    setRejectTarget(null);
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

      {/* Карточки */}
      {visible.length === 0 ? (
        <div className="bg-card rounded-2xl border border-border p-10 text-center">
          <Icon name="FolderOpen" size={32} className="text-muted-foreground mx-auto mb-2" />
          <p className="text-muted-foreground text-sm">Нет курсов</p>
        </div>
      ) : (
        <div className="space-y-3">
          {visible.map((course) => (
            <CourseCard
              key={course.id}
              course={course}
              onApprove={() => approve(course.id)}
              onReject={() => setRejectTarget(course)}
            />
          ))}
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