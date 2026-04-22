import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import { COURSE_DIRECTIONS } from "@/data/mockData";
import CourseEditor, { type CourseEditorData } from "@/components/admin/catalog/CourseEditor";

const PLATFORM_DIRS = COURSE_DIRECTIONS.filter((d) => d.id !== 6).map((d) => ({ id: d.id, title: d.title }));

export function PlatformCatalog() {
  const [openDirs,   setOpenDirs]   = useState<number[]>([1]);
  const [showEditor, setShowEditor] = useState(false);
  const [editorInit, setEditorInit] = useState<Partial<CourseEditorData>>({});
  const [search,     setSearch]     = useState("");

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
              <div
                onClick={() => toggleDir(dir.id)}
                className="w-full flex items-center justify-between px-5 py-4 hover:bg-muted/30 transition-colors cursor-pointer"
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
              </div>

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
