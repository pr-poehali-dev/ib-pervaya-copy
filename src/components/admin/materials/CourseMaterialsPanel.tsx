import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COURSE_DIRECTIONS, TENANT_COURSES, TENANTS } from "@/data/mockData";
import type { CourseMaterial, MaterialStatus, MaterialType } from "@/components/admin/types";

// ─── Моковые материалы тенанта ────────────────────────────────────────────────

export const MOCK_MATERIALS: CourseMaterial[] = [
  {
    id: 1, tenantId: 1, courseId: 101,
    courseTitle: "Основы промышленной безопасности",
    title: "Лекция 1. Основные понятия и определения",
    type: "lecture", ext: "PDF",
    url: "https://www.w3.org/WAI/WCAG21/Techniques/pdf/pdf-techniques.pdf",
    size: "1.2 МБ", status: "approved", uploadedAt: "10.03.2026", approvedAt: "11.03.2026",
  },
  {
    id: 2, tenantId: 1, courseId: 101,
    courseTitle: "Основы промышленной безопасности",
    title: "Презентация. Требования ФЗ-116",
    type: "presentation", ext: "PPTX",
    url: "https://docs.google.com/presentation/d/1BxiMVs0XRA5nFMdKvBdBZjgmUUqptlbs74OgVE2upms/edit",
    size: "3.8 МБ", status: "pending_approval", uploadedAt: "15.03.2026",
  },
  {
    id: 3, tenantId: 1, courseId: 101,
    courseTitle: "Основы промышленной безопасности",
    title: "Видеолекция. Введение в курс",
    type: "video", ext: "MP4",
    url: "https://www.w3schools.com/html/mov_bbb.mp4",
    size: "48 МБ", status: "approved", uploadedAt: "12.03.2026", approvedAt: "13.03.2026",
  },
  {
    id: 4, tenantId: 1, courseId: 201,
    courseTitle: "Группа Б1. Энергетические установки",
    title: "Аудиолекция. Ключевые нормы и требования",
    type: "audio", ext: "MP3",
    url: "https://www.soundhelix.com/examples/mp3/SoundHelix-Song-1.mp3",
    size: "8.5 МБ", status: "rejected", uploadedAt: "08.03.2026",
    rejectionReason: "Низкое качество записи, необходима перезапись.",
  },
];

const MATERIAL_TYPE_MAP: Record<MaterialType, { icon: string; label: string; color: string }> = {
  lecture:      { icon: "FileText",     label: "Лекция",       color: "from-violet-500 to-purple-600" },
  presentation: { icon: "Presentation", label: "Презентация",  color: "from-blue-500 to-indigo-600" },
  video:        { icon: "Video",        label: "Видео",        color: "from-rose-500 to-pink-600" },
  audio:        { icon: "Mic",          label: "Аудио",        color: "from-amber-500 to-orange-600" },
  other:        { icon: "Paperclip",    label: "Другое",       color: "from-slate-500 to-gray-600" },
};

const STATUS_MAP: Record<MaterialStatus, { label: string; cls: string; icon: string }> = {
  pending_approval: { label: "На проверке", cls: "bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300",     icon: "Clock" },
  approved:         { label: "Одобрен",     cls: "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300", icon: "CheckCircle" },
  rejected:         { label: "Отклонён",    cls: "bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300",               icon: "XCircle" },
};

// ─── Модал загрузки материала ─────────────────────────────────────────────────

function UploadModal({ onClose, onSave }: { onClose: () => void; onSave: (m: Omit<CourseMaterial, "id" | "uploadedAt" | "status">) => void }) {
  const [title,     setTitle]     = useState("");
  const [type,      setType]      = useState<MaterialType>("lecture");
  const [ext,       setExt]       = useState("PDF");
  const [courseId,  setCourseId]  = useState<number | "own">(COURSE_DIRECTIONS[0].courses[0].id);
  const [error,     setError]     = useState("");

  const tenant = TENANTS[0];
  const allPlatformCourses = COURSE_DIRECTIONS
    .filter((d) => tenant.allowedDirections.includes(d.id))
    .flatMap((d) => d.courses.map((c) => ({ id: c.id, title: c.title, dirTitle: d.title })));
  const ownCourses = TENANT_COURSES.filter((c) => c.status === "approved");

  const EXT_BY_TYPE: Record<MaterialType, string[]> = {
    lecture:      ["PDF", "DOCX"],
    presentation: ["PPTX", "PDF"],
    video:        ["MP4", "MOV", "AVI"],
    audio:        ["MP3", "WAV", "M4A"],
    other:        ["PDF", "ZIP", "DOCX"],
  };

  function handleSave() {
    if (!title.trim()) { setError("Введите название материала"); return; }
    const cId = courseId === "own" ? undefined : Number(courseId);
    const ownId = courseId === "own" ? ownCourses[0]?.id : undefined;
    const courseTitle = cId
      ? allPlatformCourses.find((c) => c.id === cId)?.title ?? "Курс"
      : ownCourses.find((c) => c.id === ownId)?.title ?? "Свой курс";
    onSave({ tenantId: 1, courseId: cId, tenantCourseId: ownId, courseTitle, title: title.trim(), type, ext, url: "" });
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-lg shadow-2xl">
        <div className="flex items-center justify-between p-5 border-b border-border">
          <h2 className="font-bold text-base">Загрузить материал</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="p-5 space-y-4">
          {/* Курс */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Курс *</label>
            <select
              value={String(courseId)}
              onChange={(e) => setCourseId(e.target.value === "own" ? "own" : Number(e.target.value))}
              className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            >
              <optgroup label="Курсы платформы">
                {allPlatformCourses.map((c) => (
                  <option key={c.id} value={c.id}>{c.title}</option>
                ))}
              </optgroup>
              {ownCourses.length > 0 && (
                <optgroup label="Свои курсы">
                  {ownCourses.map((c) => (
                    <option key={`own-${c.id}`} value={c.id}>{c.title}</option>
                  ))}
                </optgroup>
              )}
            </select>
          </div>

          {/* Тип */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Тип материала *</label>
            <div className="grid grid-cols-5 gap-1.5">
              {(Object.entries(MATERIAL_TYPE_MAP) as [MaterialType, typeof MATERIAL_TYPE_MAP[MaterialType]][]).map(([key, val]) => (
                <button
                  key={key}
                  onClick={() => { setType(key); setExt(EXT_BY_TYPE[key][0]); }}
                  className={`flex flex-col items-center gap-1 py-2.5 rounded-xl border-2 transition-all text-xs font-medium ${
                    type === key ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : "border-border text-muted-foreground hover:border-violet-300"
                  }`}
                >
                  <Icon name={val.icon} size={16} />
                  {val.label}
                </button>
              ))}
            </div>
          </div>

          {/* Формат */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Формат файла</label>
            <div className="flex gap-2">
              {EXT_BY_TYPE[type].map((e) => (
                <button
                  key={e}
                  onClick={() => setExt(e)}
                  className={`px-3 py-1.5 rounded-lg border text-xs font-mono font-medium transition-all ${
                    ext === e ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : "border-border text-muted-foreground hover:border-violet-300"
                  }`}
                >
                  {e}
                </button>
              ))}
            </div>
          </div>

          {/* Название */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Название материала *</label>
            <input
              value={title}
              onChange={(e) => { setTitle(e.target.value); setError(""); }}
              placeholder="Например: Лекция 1. Основные понятия"
              className={`w-full h-9 px-3 rounded-xl border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 ${error ? "border-red-400" : "border-border"}`}
            />
            {error && <p className="text-xs text-red-500">{error}</p>}
          </div>

          {/* Файл */}
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Файл</label>
            <label className="flex items-center gap-3 px-4 py-3 border-2 border-dashed border-border rounded-xl cursor-pointer hover:border-violet-400 hover:bg-violet-50/50 dark:hover:bg-violet-900/10 transition-colors">
              <Icon name="Upload" size={18} className="text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Нажмите для выбора файла</p>
                <p className="text-xs text-muted-foreground">{EXT_BY_TYPE[type].join(", ")} · до 500 МБ</p>
              </div>
              <input type="file" className="hidden" accept={EXT_BY_TYPE[type].map((e) => `.${e.toLowerCase()}`).join(",")} />
            </label>
          </div>

          <div className="bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-xl px-4 py-3 flex items-start gap-2">
            <Icon name="Info" size={14} className="text-amber-500 flex-shrink-0 mt-0.5" />
            <p className="text-xs text-amber-700 dark:text-amber-400">
              После загрузки материал будет отправлен суперадминистратору на проверку. Слушателям он станет доступен после одобрения.
            </p>
          </div>
        </div>

        <div className="flex gap-2 p-5 border-t border-border">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 gradient-primary text-white rounded-xl" onClick={handleSave}>
            Отправить на проверку
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Модал просмотра материала ────────────────────────────────────────────────

function ViewerModal({ material, onClose }: { material: CourseMaterial; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">
      <div className="flex items-center gap-3 px-5 py-3 border-b border-border bg-card flex-shrink-0">
        <div className={`w-8 h-8 bg-gradient-to-br ${MATERIAL_TYPE_MAP[material.type].color} rounded-lg flex items-center justify-center`}>
          <Icon name={MATERIAL_TYPE_MAP[material.type].icon} size={15} className="text-white" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="font-semibold text-sm truncate">{material.title}</p>
          <p className="text-xs text-muted-foreground">{material.courseTitle} · {material.ext}</p>
        </div>
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
          <Icon name="X" size={18} />
        </button>
      </div>
      <div className="flex-1 overflow-hidden">
        {material.ext === "MP4" && (
          <div className="w-full h-full flex items-center justify-center bg-black p-4">
            <video src={material.url} controls autoPlay className="max-w-full max-h-full rounded-xl" />
          </div>
        )}
        {material.ext === "MP3" && (
          <div className="w-full h-full flex items-center justify-center p-6">
            <div className="w-full max-w-lg space-y-6 text-center">
              <div className="w-28 h-28 bg-gradient-to-br from-amber-500 to-orange-600 rounded-full flex items-center justify-center mx-auto shadow-2xl">
                <Icon name="Mic" size={44} className="text-white" />
              </div>
              <p className="font-bold text-xl">{material.title}</p>
              <div className="bg-card rounded-2xl border border-border p-5">
                <audio src={material.url} controls autoPlay className="w-full" />
              </div>
            </div>
          </div>
        )}
        {material.ext === "PDF" && (
          <iframe src={material.url} className="w-full h-full border-0" title={material.title} />
        )}
        {material.ext === "PPTX" && (
          <iframe src={material.url.replace("/edit", "/embed")} className="w-full h-full border-0" title={material.title} allowFullScreen />
        )}
        {!["MP4","MP3","PDF","PPTX"].includes(material.ext) && (
          <div className="w-full h-full flex items-center justify-center flex-col gap-4">
            <Icon name="FileText" size={48} className="text-muted-foreground" />
            <p className="text-muted-foreground">Просмотр недоступен</p>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Главный компонент ────────────────────────────────────────────────────────

export default function CourseMaterialsPanel() {
  const [materials,     setMaterials]     = useState<CourseMaterial[]>(MOCK_MATERIALS);
  const [showUpload,    setShowUpload]    = useState(false);
  const [viewMaterial,  setViewMaterial]  = useState<CourseMaterial | null>(null);
  const [filterStatus,  setFilterStatus]  = useState<MaterialStatus | "all">("all");
  const [filterType,    setFilterType]    = useState<MaterialType | "all">("all");
  const [search,        setSearch]        = useState("");

  function handleSave(data: Omit<CourseMaterial, "id" | "uploadedAt" | "status">) {
    const newMat: CourseMaterial = {
      ...data,
      id:         Math.max(...materials.map((m) => m.id), 0) + 1,
      uploadedAt: new Date().toLocaleDateString("ru-RU"),
      status:     "pending_approval",
    };
    setMaterials((prev) => [newMat, ...prev]);
  }

  function handleDelete(id: number) {
    setMaterials((prev) => prev.filter((m) => m.id !== id));
  }

  const filtered = materials.filter((m) => {
    if (filterStatus !== "all" && m.status !== filterStatus) return false;
    if (filterType   !== "all" && m.type   !== filterType)   return false;
    if (search && !m.title.toLowerCase().includes(search.toLowerCase()) &&
        !m.courseTitle.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const counts = {
    all:              materials.length,
    pending_approval: materials.filter((m) => m.status === "pending_approval").length,
    approved:         materials.filter((m) => m.status === "approved").length,
    rejected:         materials.filter((m) => m.status === "rejected").length,
  };

  return (
    <>
      {showUpload    && <UploadModal onClose={() => setShowUpload(false)} onSave={handleSave} />}
      {viewMaterial  && <ViewerModal material={viewMaterial} onClose={() => setViewMaterial(null)} />}

      <div className="space-y-5">
        {/* Шапка */}
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div>
            <h2 className="font-bold text-lg">Материалы курсов</h2>
            <p className="text-sm text-muted-foreground">Лекции, видео, презентации и аудио для слушателей вашего тенанта</p>
          </div>
          <Button className="gradient-primary text-white rounded-xl gap-2" onClick={() => setShowUpload(true)}>
            <Icon name="Upload" size={15} />
            Загрузить материал
          </Button>
        </div>

        {/* Статус-фильтры */}
        <div className="flex flex-wrap gap-2">
          {([
            { key: "all",              label: `Все (${counts.all})` },
            { key: "approved",         label: `Одобрены (${counts.approved})` },
            { key: "pending_approval", label: `На проверке (${counts.pending_approval})` },
            { key: "rejected",         label: `Отклонены (${counts.rejected})` },
          ] as { key: MaterialStatus | "all"; label: string }[]).map((f) => (
            <button
              key={f.key}
              onClick={() => setFilterStatus(f.key)}
              className={`px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                filterStatus === f.key
                  ? "gradient-primary text-white border-transparent"
                  : "border-border text-muted-foreground hover:border-violet-300 hover:text-foreground bg-background"
              }`}
            >
              {f.label}
            </button>
          ))}

          <div className="relative ml-auto">
            <Icon name="Search" size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск..."
              className="h-8 pl-8 pr-3 rounded-xl border border-border bg-background text-xs focus:outline-none focus:ring-2 focus:ring-violet-500/30 w-48"
            />
          </div>
        </div>

        {/* Тип-фильтры */}
        <div className="flex gap-2">
          {([["all","Все типы","LayoutGrid"], ...Object.entries(MATERIAL_TYPE_MAP).map(([k,v]) => [k, v.label, v.icon])] as [MaterialType | "all", string, string][]).map(([key, label, icon]) => (
            <button
              key={key}
              onClick={() => setFilterType(key)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                filterType === key
                  ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300"
                  : "border-border text-muted-foreground hover:border-violet-300 bg-background"
              }`}
            >
              <Icon name={icon} size={13} />
              {label}
            </button>
          ))}
        </div>

        {/* Список материалов */}
        {filtered.length === 0 ? (
          <div className="bg-card rounded-2xl border border-border p-12 text-center">
            <div className="w-14 h-14 bg-muted/40 rounded-2xl flex items-center justify-center mx-auto mb-3">
              <Icon name="FolderOpen" size={24} className="text-muted-foreground" />
            </div>
            <p className="font-semibold">Материалы не найдены</p>
            <p className="text-sm text-muted-foreground mt-1">
              {materials.length === 0
                ? "Загрузите первый материал для слушателей"
                : "Попробуйте изменить фильтры"}
            </p>
            {materials.length === 0 && (
              <Button className="gradient-primary text-white rounded-xl gap-2 mt-4" onClick={() => setShowUpload(true)}>
                <Icon name="Upload" size={15} />
                Загрузить материал
              </Button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/30">
                  <th className="px-5 py-3 text-left text-xs font-medium text-muted-foreground">Материал</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Курс</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Тип</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Статус</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground">Загружен</th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-muted-foreground"></th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const typeInfo   = MATERIAL_TYPE_MAP[m.type];
                  const statusInfo = STATUS_MAP[m.status];
                  return (
                    <tr key={m.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 bg-gradient-to-br ${typeInfo.color} rounded-lg flex items-center justify-center flex-shrink-0`}>
                            <Icon name={typeInfo.icon} size={14} className="text-white" />
                          </div>
                          <div className="min-w-0">
                            <p className="font-medium truncate max-w-[200px]">{m.title}</p>
                            {m.size && <p className="text-xs text-muted-foreground font-mono">{m.ext} · {m.size}</p>}
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground max-w-[160px]">
                        <p className="truncate">{m.courseTitle}</p>
                      </td>
                      <td className="px-4 py-3">
                        <Badge variant="secondary" className="text-xs">{typeInfo.label}</Badge>
                      </td>
                      <td className="px-4 py-3">
                        <div>
                          <Badge className={`text-xs ${statusInfo.cls} gap-1`}>
                            <Icon name={statusInfo.icon} size={11} />
                            {statusInfo.label}
                          </Badge>
                          {m.status === "rejected" && m.rejectionReason && (
                            <p className="text-xs text-red-500 mt-0.5 max-w-[160px] truncate" title={m.rejectionReason}>
                              {m.rejectionReason}
                            </p>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs text-muted-foreground">{m.uploadedAt}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-1">
                          {m.status === "approved" && m.url && (
                            <button
                              onClick={() => setViewMaterial(m)}
                              className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 text-violet-600 transition-colors"
                              title="Просмотреть"
                            >
                              <Icon name="Eye" size={15} />
                            </button>
                          )}
                          {m.status !== "approved" && (
                            <button
                              onClick={() => handleDelete(m.id)}
                              className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                              title="Удалить"
                            >
                              <Icon name="Trash2" size={15} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        {/* Инфо-блок о правилах */}
        <div className="bg-blue-50 dark:bg-blue-900/10 border border-blue-200 dark:border-blue-800 rounded-2xl p-5 flex items-start gap-4">
          <Icon name="Info" size={18} className="text-blue-500 flex-shrink-0 mt-0.5" />
          <div className="space-y-1">
            <p className="font-semibold text-sm text-blue-800 dark:text-blue-300">Как работают материалы курсов</p>
            <ul className="text-xs text-blue-700 dark:text-blue-400 space-y-0.5 list-disc list-inside">
              <li>Загруженные материалы видны только слушателям вашего тенанта</li>
              <li>Каждый файл проходит проверку суперадминистратором перед публикацией</li>
              <li>После одобрения материал появится на странице курса для слушателей</li>
              <li>Отклонённые материалы можно исправить и загрузить повторно</li>
            </ul>
          </div>
        </div>
      </div>
    </>
  );
}