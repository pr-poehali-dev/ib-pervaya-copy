import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";
import { COURSE_DIRECTIONS, TENANT_COURSES, TENANTS } from "@/data/mockData";
import type { TenantCourse, TenantCourseStatus } from "@/components/admin/types";

type CatalogTab = "platform" | "own";

// ─── Бейдж статуса своего курса ───────────────────────────────────────────────

function StatusBadge({ status }: { status: TenantCourseStatus }) {
  const map: Record<TenantCourseStatus, { label: string; cls: string }> = {
    draft:            { label: "Черновик",    cls: "bg-muted text-muted-foreground" },
    pending_approval: { label: "На проверке", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300" },
    approved:         { label: "Одобрен",     cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" },
    rejected:         { label: "Отклонён",    cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300" },
  };
  const { label, cls } = map[status];
  return <Badge className={`text-xs ${cls}`}>{label}</Badge>;
}

// ─── Модал добавления своего курса ────────────────────────────────────────────

function AddCourseModal({ onClose, onAdd }: { onClose: () => void; onAdd: (course: Omit<TenantCourse, "id" | "createdAt">) => void }) {
  const [title,   setTitle]   = useState("");
  const [code,    setCode]    = useState("");
  const [hours,   setHours]   = useState("8");
  const [hasTest, setHasTest] = useState(false);
  const [dpo,     setDpo]     = useState(false);
  const [error,   setError]   = useState("");

  function handleAdd() {
    if (!title.trim()) { setError("Введите название курса"); return; }
    onAdd({ tenantId: 1, title: title.trim(), code: code.trim() || undefined, hours: Number(hours) || 8, hasTest, dpoAvailable: dpo, status: "pending_approval" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-md shadow-2xl">
        <div className="flex items-center justify-between p-6 border-b border-border">
          <h2 className="font-bold text-base">Добавить свой курс</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="p-6 space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Название курса *</label>
            <input value={title} onChange={(e) => { setTitle(e.target.value); setError(""); }} className={`w-full h-9 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${error ? "border-red-400" : "border-border"}`} placeholder="Введите название курса" />
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
          <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-xl px-4 py-3 flex items-start gap-2">
            <Icon name="Info" size={14} className="text-blue-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-blue-700 dark:text-blue-400">
              Курс будет отправлен суперадминистратору на проверку. После одобрения он станет доступен для назначения слушателям.
            </p>
          </div>
        </div>
        <div className="flex gap-2 p-6 border-t border-border">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={handleAdd}>Отправить на проверку</Button>
        </div>
      </div>
    </div>
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
  const [ownCourses,   setOwnCourses]   = useState<TenantCourse[]>(TENANT_COURSES);

  function toggleDir(id: number) {
    setOpenDirs((prev) => prev.includes(id) ? prev.filter((d) => d !== id) : [...prev, id]);
  }

  function handleAddCourse(data: Omit<TenantCourse, "id" | "createdAt">) {
    const newCourse: TenantCourse = {
      ...data,
      id: Math.max(...ownCourses.map((c) => c.id), 1000) + 1,
      createdAt: new Date().toLocaleDateString("ru-RU"),
    };
    setOwnCourses((prev) => [...prev, newCourse]);
  }

  const currentTenant = TENANTS[0];

  // Направления, доступные тенанту
  const allowedDirs = COURSE_DIRECTIONS.filter(
    (d) => currentTenant.allowedDirections.includes(d.id) && d.id !== 6
  );

  // Поиск по платформенным курсам
  const filteredDirs = allowedDirs.map((d) => ({
    ...d,
    courses: search
      ? d.courses.filter((c) =>
          c.title.toLowerCase().includes(search.toLowerCase()) ||
          c.code.toLowerCase().includes(search.toLowerCase())
        )
      : d.courses,
  })).filter((d) => !search || d.courses.length > 0);

  // Поиск по своим курсам
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

      {/* Курсы платформы — сгруппированы по направлениям */}
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
                              {course.hasTest
                                ? <Icon name="CheckCircle" size={15} className="text-emerald-500" />
                                : <Icon name="Minus" size={15} className="text-muted-foreground" />}
                            </td>
                            <td className="px-4 py-3">
                              {course.dpoAvailable
                                ? <Icon name="Award" size={15} className="text-violet-500" />
                                : <Icon name="Minus" size={15} className="text-muted-foreground" />}
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
              Добавленные курсы проходят проверку суперадминистратора. Одобренные курсы можно назначать слушателям — подписки при этом не списываются.
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
                  {filteredOwn.map((c, idx) => (
                    <tr key={c.id} className={`border-b border-border last:border-0 hover:bg-muted/20 transition-colors ${idx % 2 !== 0 ? "bg-muted/5" : ""}`}>
                      <td className="px-4 py-3 font-medium max-w-[220px]">
                        <p className="truncate">{c.title}</p>
                        {c.status === "rejected" && c.rejectionReason && (
                          <p className="text-xs text-red-500 mt-0.5 truncate" title={c.rejectionReason}>
                            Причина: {c.rejectionReason}
                          </p>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono text-xs text-muted-foreground">{c.code ?? "—"}</td>
                      <td className="px-4 py-3 text-muted-foreground">{c.hours ? `${c.hours} ч` : "—"}</td>
                      <td className="px-4 py-3">
                        {c.hasTest
                          ? <Icon name="CheckCircle" size={15} className="text-emerald-500" />
                          : <Icon name="Minus" size={15} className="text-muted-foreground" />}
                      </td>
                      <td className="px-4 py-3">
                        {c.dpoAvailable
                          ? <Icon name="Award" size={15} className="text-violet-500" />
                          : <Icon name="Minus" size={15} className="text-muted-foreground" />}
                      </td>
                      <td className="px-4 py-3"><StatusBadge status={c.status} /></td>
                      <td className="px-4 py-3 text-muted-foreground text-xs">{c.createdAt}</td>
                    </tr>
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
