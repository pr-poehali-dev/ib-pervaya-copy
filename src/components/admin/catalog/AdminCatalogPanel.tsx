import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";
import { COURSE_DIRECTIONS, TENANT_COURSES, TENANTS } from "@/data/mockData";
import type { TenantCourse, TenantCourseStatus } from "@/components/admin/types";
import CourseEditor, { CourseEditorData } from "@/components/admin/catalog/CourseEditor";

type CatalogTab = "platform" | "own";

// ─── Бейдж статуса своего курса ───────────────────────────────────────────────

function StatusBadge({ status }: { status: TenantCourseStatus }) {
  const map: Record<TenantCourseStatus, { label: string; cls: string; icon: string }> = {
    draft:            { label: "Черновик",    cls: "bg-muted text-muted-foreground",                                                   icon: "FileText" },
    pending_approval: { label: "На проверке", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",             icon: "Clock" },
    approved:         { label: "Одобрен",     cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300",     icon: "CheckCircle" },
    rejected:         { label: "Отклонён",    cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",                    icon: "XCircle" },
  };
  const { label, cls, icon } = map[status];
  return <Badge className={`text-xs gap-1 ${cls}`}><Icon name={icon} size={11} />{label}</Badge>;
}

// ─── Строка своего курса с раскрытием материалов ─────────────────────────────

type OwnCourse = TenantCourse & { editorData?: CourseEditorData };

function CourseRow({ course }: { course: OwnCourse }) {
  const [open, setOpen] = useState(false);
  const mats = course.editorData?.materials ?? [];
  const ntds = course.editorData?.ntdFiles ?? [];
  const hasMeta = mats.length > 0 || ntds.length > 0;

  return (
    <>
      <tr
        className="border-b border-border hover:bg-muted/20 transition-colors cursor-pointer"
        onClick={() => hasMeta && setOpen((v) => !v)}
      >
        <td className="px-4 py-3">
          <div className="flex items-center gap-2">
            {hasMeta && <Icon name={open ? "ChevronDown" : "ChevronRight"} size={14} className="text-muted-foreground flex-shrink-0" />}
            <div className="min-w-0 overflow-hidden">
              <p className="font-medium text-sm truncate" title={course.title}>{course.title}</p>
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
            {hasMeta && (
              <span className="text-xs text-muted-foreground">
                {mats.length > 0 && `${mats.length} файл${mats.length > 1 ? "а" : ""}`}
                {ntds.length > 0 && ` · ${ntds.length} НТД`}
              </span>
            )}
          </div>
        </td>
        <td className="px-4 py-3 text-xs text-muted-foreground">{course.createdAt}</td>
      </tr>
      {open && hasMeta && (
        <tr className="border-b border-border bg-muted/10">
          <td colSpan={7} className="px-8 py-3 space-y-3">
            {mats.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Материалы</p>
                <div className="flex flex-wrap gap-2">
                  {mats.map((m) => (
                    <span key={m.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border rounded-lg text-xs">
                      <Icon name="FileText" size={12} className="text-muted-foreground" />
                      {m.title} · <span className="font-mono text-muted-foreground">{m.ext}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
            {ntds.length > 0 && (
              <div className="space-y-1.5">
                <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">НТД</p>
                <div className="flex flex-wrap gap-2">
                  {ntds.map((f) => (
                    <span key={f.id} className="flex items-center gap-1.5 px-2.5 py-1 bg-background border border-border rounded-lg text-xs">
                      <Icon name="FileCheck" size={12} className="text-muted-foreground" />
                      {f.title} · <span className="font-mono text-muted-foreground">{f.ext}</span>
                    </span>
                  ))}
                </div>
              </div>
            )}
          </td>
        </tr>
      )}
    </>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function AdminCatalogPanel() {
  const { tenantType } = useRole();

  const [tab,        setTab]        = useState<CatalogTab>("platform");
  const [search,     setSearch]     = useState("");
  const [openDirs,   setOpenDirs]   = useState<number[]>([1]);
  const [showEditor, setShowEditor] = useState(false);
  const [ownCourses, setOwnCourses] = useState<OwnCourse[]>(
    TENANT_COURSES.map((c) => ({ ...c }))
  );

  function toggleDir(id: number) {
    setOpenDirs((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  }

  function handleSaveCourse(data: CourseEditorData) {
    const newCourse: OwnCourse = {
      id:           Math.max(...ownCourses.map((c) => c.id), 1000) + 1,
      tenantId:     1,
      title:        data.title,
      code:         data.code || undefined,
      hours:        Number(data.hours) || 8,
      hasTest:      data.testModes.includes("final"),
      dpoAvailable: data.dpoAvailable,
      status:       "pending_approval",
      createdAt:    new Date().toLocaleDateString("ru-RU"),
      editorData:   data,
    };
    setOwnCourses((prev) => [newCourse, ...prev]);
  }

  const currentTenant = TENANTS[0];

  const baseDirs = COURSE_DIRECTIONS.filter(
    (d) => currentTenant.allowedDirections.includes(d.id) && d.id !== 6
  );
  const [extraDirs, setExtraDirs] = useState<{ id: number; title: string }[]>([]);
  const allowedDirs = [...baseDirs, ...extraDirs];

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

  const editorDirs = allowedDirs.map((d) => ({ id: d.id, title: d.title }));

  function handleAddDirection(title: string) {
    const newId = Date.now();
    setExtraDirs((prev) => [...prev, { id: newId, title }]);
  }

  if (showEditor) {
    return (
      <CourseEditor
        onClose={() => setShowEditor(false)}
        onSave={handleSaveCourse}
        directions={editorDirs}
        onAddDirection={handleAddDirection}
      />
    );
  }

  return (
    <div className="space-y-4">
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
          <Button className="gradient-primary text-white rounded-xl gap-2 h-9 flex-shrink-0" onClick={() => setShowEditor(true)}>
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
                    <table className="w-full text-sm table-fixed">
                      <thead>
                        <tr className="bg-muted/30">
                          <th className="px-5 py-2.5 text-left text-xs font-medium text-muted-foreground w-24">Код</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground">Название курса</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-16">Часов</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-12">Тест</th>
                          <th className="px-4 py-2.5 text-left text-xs font-medium text-muted-foreground w-12">ДПО</th>
                        </tr>
                      </thead>
                      <tbody>
                        {dir.courses.map((course, idx) => (
                          <tr key={course.id} className={`border-t border-border hover:bg-muted/20 transition-colors ${idx % 2 !== 0 ? "bg-muted/5" : ""}`}>
                            <td className="px-5 py-3 font-mono text-xs text-muted-foreground whitespace-nowrap">{course.code}</td>
                            <td className="px-4 py-3 font-medium min-w-0"><span className="block truncate" title={course.title}>{course.title}</span></td>
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
              Курс с тестами, материалами и НТД проходит проверку суперадминистратора как единый пакет. После одобрения доступен для назначения слушателям вашего тенанта.
            </p>
          </div>

          {filteredOwn.length === 0 ? (
            <div className="bg-card rounded-2xl border border-border p-10 text-center">
              <div className="w-14 h-14 bg-muted/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
                <Icon name="FolderPlus" size={24} className="text-muted-foreground" />
              </div>
              <p className="font-semibold">Свои курсы не добавлены</p>
              <p className="text-sm text-muted-foreground mt-1">Нажмите «Добавить курс» чтобы открыть конструктор</p>
              <Button className="gradient-primary text-white rounded-xl gap-2 mt-4" onClick={() => setShowEditor(true)}>
                <Icon name="Plus" size={15} />
                Добавить курс
              </Button>
            </div>
          ) : (
            <div className="bg-card rounded-2xl border border-border overflow-hidden">
              <table className="w-full text-sm table-fixed">
                <thead>
                  <tr className="border-b border-border bg-muted/40">
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground">Курс</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-20">Код</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-16">Часов</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">Тест</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-12">ДПО</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-28">Статус</th>
                    <th className="px-4 py-3 text-left font-medium text-muted-foreground w-24">Добавлен</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredOwn.map((c) => <CourseRow key={c.id} course={c} />)}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}