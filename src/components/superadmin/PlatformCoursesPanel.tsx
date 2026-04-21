import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COURSE_DIRECTIONS, TENANT_COURSES, TENANTS } from "@/data/mockData";
import type { TenantCourse, TenantCourseStatus, DirectionCourse } from "@/components/admin/types";

type PanelTab = "platform" | "tenant_approval";

// ─── Бейдж статуса курса тенанта ─────────────────────────────────────────────

function ApprovalBadge({ status }: { status: TenantCourseStatus }) {
  const map: Record<TenantCourseStatus, { label: string; cls: string }> = {
    draft:            { label: "Черновик",        cls: "bg-muted text-muted-foreground" },
    pending_approval: { label: "На проверке",     cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
    approved:         { label: "Одобрен",         cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
    rejected:         { label: "Отклонён",        cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
  };
  const { label, cls } = map[status];
  return <Badge className={`text-xs ${cls}`}>{label}</Badge>;
}

// ─── Модальное окно добавления/редактирования курса платформы ─────────────────

function CourseModal({ course, directionId, onClose }: {
  course: DirectionCourse | null;
  directionId: number;
  onClose: () => void;
}) {
  const direction = COURSE_DIRECTIONS.find((d) => d.id === directionId);
  const [title, setTitle] = useState(course?.title ?? "");
  const [code,  setCode]  = useState(course?.code ?? "");
  const [hours, setHours] = useState(String(course?.hours ?? ""));
  const [hasTest, setHasTest] = useState(course?.hasTest ?? true);
  const [dpo, setDpo] = useState(course?.dpoAvailable ?? false);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <div>
            <h2 className="font-bold text-base">{course ? "Редактировать курс" : "Добавить курс"}</h2>
            <p className="text-xs text-muted-foreground">{direction?.title}</p>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1 col-span-2">
              <label className="text-xs text-muted-foreground">Название курса</label>
              <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="Название курса" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Код курса</label>
              <input value={code} onChange={(e) => setCode(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="А.1." />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Количество часов</label>
              <input type="number" value={hours} onChange={(e) => setHours(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="72" />
            </div>
          </div>
          <div className="flex flex-col gap-2">
            <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
              <input type="checkbox" checked={hasTest} onChange={(e) => setHasTest(e.target.checked)} className="rounded accent-violet-600 w-4 h-4" />
              <div>
                <p className="text-sm font-medium">Итоговый тест</p>
                <p className="text-xs text-muted-foreground">Курс содержит итоговый аттестационный тест</p>
              </div>
            </label>
            <label className="flex items-center gap-2.5 cursor-pointer p-3 rounded-xl border border-border hover:bg-muted/40 transition-colors">
              <input type="checkbox" checked={dpo} onChange={(e) => setDpo(e.target.checked)} className="rounded accent-violet-600 w-4 h-4" />
              <div>
                <p className="text-sm font-medium">Удостоверение ДПО</p>
                <p className="text-xs text-muted-foreground">При успешной сдаче теста выдаётся удостоверение о повышении квалификации</p>
              </div>
            </label>
          </div>
        </div>
        <div className="flex gap-2 p-6 border-t border-border">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={onClose}>Сохранить</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Модальное окно отклонения курса ─────────────────────────────────────────

function RejectModal({ course, onClose, onReject }: {
  course: TenantCourse;
  onClose: () => void;
  onReject: (reason: string) => void;
}) {
  const [reason, setReason] = useState("");
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-bold text-base">Отклонить курс</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <p className="text-sm text-muted-foreground">Курс: <span className="text-foreground font-medium">{course.title}</span></p>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Причина отклонения</label>
            <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full px-3 py-2 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none" placeholder="Укажите причину..." />
          </div>
        </div>
        <div className="flex gap-2 p-6 border-t border-border">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 rounded-xl bg-red-600 hover:bg-red-700 text-white" onClick={() => onReject(reason)}>Отклонить</Button>
        </div>
      </div>
    </div>
  );
}

// ─── Каталог курсов платформы ─────────────────────────────────────────────────

function PlatformCatalog() {
  const [openDirs, setOpenDirs] = useState<number[]>([1]);
  const [editCourse, setEditCourse] = useState<{ course: DirectionCourse | null; dirId: number } | null>(null);
  const [search, setSearch] = useState("");

  function toggleDir(id: number) {
    setOpenDirs((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  }

  const dirs = COURSE_DIRECTIONS.filter((d) => d.id !== 6);
  const filtered = dirs.map((d) => ({
    ...d,
    courses: search
      ? d.courses.filter((c) => c.title.toLowerCase().includes(search.toLowerCase()) || c.code.toLowerCase().includes(search.toLowerCase()))
      : d.courses,
  })).filter((d) => !search || d.courses.length > 0);

  return (
    <div className="space-y-3">
      {editCourse && (
        <CourseModal
          course={editCourse.course}
          directionId={editCourse.dirId}
          onClose={() => setEditCourse(null)}
        />
      )}

      <div className="flex gap-3">
        <div className="relative flex-1">
          <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Поиск по названию или коду курса..." className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
        </div>
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
                    onClick={(e) => { e.stopPropagation(); setEditCourse({ course: null, dirId: dir.id }); }}
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
                            {course.hasTest
                              ? <Icon name="CheckCircle" size={15} className="text-emerald-500" />
                              : <Icon name="Minus" size={15} className="text-muted-foreground" />}
                          </td>
                          <td className="px-4 py-3">
                            {course.dpoAvailable
                              ? <Icon name="Award" size={15} className="text-violet-500" />
                              : <Icon name="Minus" size={15} className="text-muted-foreground" />}
                          </td>
                          <td className="px-4 py-3">
                            <button
                              onClick={() => setEditCourse({ course, dirId: dir.id })}
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

// ─── Список курсов тенантов на утверждение ────────────────────────────────────

function TenantApprovalPanel() {
  const [courses, setCourses] = useState<TenantCourse[]>(TENANT_COURSES);
  const [rejectTarget, setRejectTarget] = useState<TenantCourse | null>(null);

  const pending = courses.filter((c) => c.status === "pending_approval");
  const others  = courses.filter((c) => c.status !== "pending_approval");

  function approve(id: number) {
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, status: "approved", approvedAt: new Date().toLocaleDateString("ru-RU") } : c));
  }

  function reject(id: number, reason: string) {
    setCourses((prev) => prev.map((c) => c.id === id ? { ...c, status: "rejected", rejectionReason: reason } : c));
    setRejectTarget(null);
  }

  function getTenantName(tenantId: number) {
    return TENANTS.find((t) => t.id === tenantId)?.name ?? `Тенант #${tenantId}`;
  }

  const CourseRow = ({ course }: { course: TenantCourse }) => (
    <tr className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
      <td className="px-4 py-3">
        <div>
          <p className="font-medium text-sm">{course.title}</p>
          {course.code && <p className="text-xs text-muted-foreground font-mono">{course.code}</p>}
        </div>
      </td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{getTenantName(course.tenantId)}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{course.hours ? `${course.hours} ч` : "—"}</td>
      <td className="px-4 py-3 text-sm text-muted-foreground">{course.createdAt}</td>
      <td className="px-4 py-3"><ApprovalBadge status={course.status} /></td>
      <td className="px-4 py-3">
        {course.status === "pending_approval" && (
          <div className="flex gap-1">
            <button onClick={() => approve(course.id)} className="px-2.5 py-1 rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 text-xs font-medium hover:bg-emerald-200 dark:hover:bg-emerald-900/50 transition-colors">
              Одобрить
            </button>
            <button onClick={() => setRejectTarget(course)} className="px-2.5 py-1 rounded-lg bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300 text-xs font-medium hover:bg-red-200 dark:hover:bg-red-900/50 transition-colors">
              Отклонить
            </button>
          </div>
        )}
        {course.status === "approved" && (
          <span className="text-xs text-muted-foreground">{course.approvedAt}</span>
        )}
        {course.status === "rejected" && course.rejectionReason && (
          <span className="text-xs text-red-500" title={course.rejectionReason}>
            {course.rejectionReason.slice(0, 30)}{course.rejectionReason.length > 30 ? "…" : ""}
          </span>
        )}
      </td>
    </tr>
  );

  return (
    <div className="space-y-4">
      {rejectTarget && (
        <RejectModal
          course={rejectTarget}
          onClose={() => setRejectTarget(null)}
          onReject={(reason) => reject(rejectTarget.id, reason)}
        />
      )}

      {pending.length > 0 && (
        <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl p-4 flex items-center gap-3">
          <Icon name="Clock" size={18} className="text-amber-600 dark:text-amber-400 flex-shrink-0" />
          <p className="text-sm text-amber-800 dark:text-amber-300">
            <span className="font-semibold">{pending.length} курс{pending.length > 1 ? "а" : ""}</span> ожидают проверки — убедитесь, что они не дублируют курсы платформы.
          </p>
        </div>
      )}

      <div className="bg-card rounded-2xl border border-border overflow-hidden">
        <div className="px-5 py-4 border-b border-border">
          <p className="font-semibold text-sm">Курсы тенантов</p>
          <p className="text-xs text-muted-foreground">Курсы созданные учебными центрами и организациями</p>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Название</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Тенант</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Часов</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Создан</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действие</th>
              </tr>
            </thead>
            <tbody>
              {[...pending, ...others].map((course) => (
                <CourseRow key={course.id} course={course} />
              ))}
              {courses.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-muted-foreground text-sm">
                    Курсов тенантов нет
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Главная панель ───────────────────────────────────────────────────────────

export default function PlatformCoursesPanel() {
  const [tab, setTab] = useState<PanelTab>("platform");

  const pendingCount = TENANT_COURSES.filter((c) => c.status === "pending_approval").length;

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
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

      {tab === "platform"         && <PlatformCatalog />}
      {tab === "tenant_approval"  && <TenantApprovalPanel />}
    </div>
  );
}
