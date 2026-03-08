import { useState } from "react";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { COURSE_DIRECTIONS, ALL_COURSES } from "@/data/mockData";

type CourseTab = "catalog" | "directions";

interface PlatformCourse {
  id: number;
  title: string;
  category: string;
  emoji: string;
  lessons: number;
  duration: string;
  published: boolean;
  tenantsCount: number;
}

const MOCK_PLATFORM_COURSES: PlatformCourse[] = ALL_COURSES.map((c, i) => ({
  ...c,
  published: i !== 3,
  tenantsCount: [5, 3, 4, 0, 2, 4][i] ?? 0,
}));

export default function PlatformCoursesPanel() {
  const [tab, setTab] = useState<CourseTab>("catalog");
  const [search, setSearch] = useState("");
  const [courses] = useState<PlatformCourse[]>(MOCK_PLATFORM_COURSES);

  const filteredCourses = courses.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
          {([["catalog", "BookOpen", "Каталог курсов"], ["directions", "Layers", "Направления"]] as const).map(([key, icon, label]) => (
            <button
              key={key}
              onClick={() => setTab(key)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === key ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon name={icon} size={15} />
              {label}
            </button>
          ))}
        </div>
        <div className="flex-1" />
        <Button className="gradient-primary text-white rounded-xl gap-2 h-9">
          <Icon name="Plus" size={15} />
          Добавить курс
        </Button>
      </div>

      {tab === "catalog" && (
        <div className="space-y-4">
          <div className="relative">
            <Icon name="Search" size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Поиск курса..."
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Курс</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Категория</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Уроков</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Длительность</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground whitespace-nowrap">Использует тенантов</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действия</th>
                </tr>
              </thead>
              <tbody>
                {filteredCourses.map((c) => (
                  <tr key={c.id} className="border-b border-border last:border-0 hover:bg-muted/20 transition-colors">
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2.5">
                        <span className="text-xl">{c.emoji}</span>
                        <span className="font-medium">{c.title}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <Badge variant="secondary" className="text-xs">{c.category}</Badge>
                    </td>
                    <td className="px-4 py-3 text-muted-foreground">{c.lessons}</td>
                    <td className="px-4 py-3 text-muted-foreground">{c.duration}</td>
                    <td className="px-4 py-3 text-center">
                      <span className="font-medium">{c.tenantsCount}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${c.published ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                        {c.published ? "Опубликован" : "Черновик"}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1">
                        <Tip text="Редактировать">
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                            <Icon name="Pencil" size={15} />
                          </button>
                        </Tip>
                        <Tip text={c.published ? "Снять с публикации" : "Опубликовать"}>
                          <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-600">
                            <Icon name={c.published ? "EyeOff" : "Eye"} size={15} />
                          </button>
                        </Tip>
                        <Tip text="Удалить">
                          <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-muted-foreground hover:text-red-500">
                            <Icon name="Trash2" size={15} />
                          </button>
                        </Tip>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "directions" && (
        <div className="space-y-3">
          {COURSE_DIRECTIONS.map((dir) => (
            <div key={dir.id} className="bg-card rounded-2xl border border-border overflow-hidden">
              <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-muted/20">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-purple-700 rounded-lg flex items-center justify-center">
                    <Icon name="Layers" size={14} className="text-white" />
                  </div>
                  <p className="font-semibold">{dir.title}</p>
                  <Badge variant="secondary" className="text-xs">{dir.courses.length} курсов</Badge>
                </div>
                <div className="flex items-center gap-1">
                  <Tip text="Редактировать направление">
                    <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                      <Icon name="Pencil" size={14} />
                    </button>
                  </Tip>
                  <Tip text="Добавить курс в направление">
                    <button className="p-1.5 rounded-lg hover:bg-violet-100 dark:hover:bg-violet-900/30 transition-colors text-violet-600">
                      <Icon name="Plus" size={14} />
                    </button>
                  </Tip>
                </div>
              </div>
              <div className="divide-y divide-border">
                {dir.courses.map((c) => (
                  <div key={c.id} className="flex items-center justify-between px-5 py-2.5 hover:bg-muted/20 transition-colors">
                    <div className="flex items-center gap-2.5">
                      <span className="text-xs font-mono text-muted-foreground w-14">{c.code}</span>
                      <span className="text-sm">{c.title}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <Tip text="Редактировать курс">
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Icon name="Pencil" size={13} />
                        </button>
                      </Tip>
                      <Tip text="Удалить из направления">
                        <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-muted-foreground hover:text-red-500">
                          <Icon name="Trash2" size={13} />
                        </button>
                      </Tip>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
