import { useState } from "react";
import Icon from "@/components/ui/icon";
import Tip from "@/components/ui/tip";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useRole } from "@/contexts/RoleContext";
import { ALL_COURSES, COURSE_DIRECTIONS } from "@/data/mockData";

type CatalogTab = "platform" | "own";

interface OwnCourse {
  id: number;
  title: string;
  category: string;
  emoji: string;
  lessons: number;
  duration: string;
  published: boolean;
  createdAt: string;
}

const MOCK_OWN_COURSES: OwnCourse[] = [
  { id: 1001, title: "Внутренний инструктаж по охране труда", category: "ОТ", emoji: "🦺", lessons: 5,  duration: "4 ч",  published: true,  createdAt: "10.01.2025" },
  { id: 1002, title: "Пожарная безопасность объекта",         category: "ПБ", emoji: "🔥", lessons: 8,  duration: "6 ч",  published: false, createdAt: "22.02.2025" },
];

function AddCourseModal({ onClose }: { onClose: () => void }) {
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState("");
  const [lessons, setLessons] = useState("5");
  const [duration, setDuration] = useState("4 ч");

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40">
      <div className="bg-background rounded-2xl border border-border w-full max-w-md p-6 shadow-2xl space-y-5">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-lg">Добавить курс</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted">
            <Icon name="X" size={18} />
          </button>
        </div>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Название курса</label>
            <input value={title} onChange={(e) => setTitle(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="Введите название" />
          </div>
          <div className="space-y-1">
            <label className="text-xs text-muted-foreground">Категория</label>
            <input value={category} onChange={(e) => setCategory(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="Например: ОТ, ПБ, ИБ" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Уроков</label>
              <input type="number" value={lessons} onChange={(e) => setLessons(e.target.value)} min="1" className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" />
            </div>
            <div className="space-y-1">
              <label className="text-xs text-muted-foreground">Длительность</label>
              <input value={duration} onChange={(e) => setDuration(e.target.value)} className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30" placeholder="8 ч" />
            </div>
          </div>
          <div className="p-3 bg-muted/40 rounded-xl text-xs text-muted-foreground">
            Курс будет доступен только внутри вашего тенанта. Подписки при активации не списываются.
          </div>
        </div>
        <div className="flex gap-2 pt-1">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button className="flex-1 rounded-xl gradient-primary text-white" onClick={onClose}>Добавить</Button>
        </div>
      </div>
    </div>
  );
}

export default function AdminCatalogPanel() {
  const { canOwnCourses } = useRole();
  const [tab, setTab] = useState<CatalogTab>("platform");
  const [search, setSearch] = useState("");
  const [showAddModal, setShowAddModal] = useState(false);

  const filteredPlatform = ALL_COURSES.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  const filteredOwn = MOCK_OWN_COURSES.filter((c) =>
    c.title.toLowerCase().includes(search.toLowerCase()) ||
    c.category.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div className="space-y-4">
      {showAddModal && <AddCourseModal onClose={() => setShowAddModal(false)} />}

      {/* Шапка */}
      <div className="flex items-center gap-3">
        <div className="flex gap-1 bg-muted/40 rounded-xl p-1">
          <button
            onClick={() => setTab("platform")}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "platform" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
          >
            <Icon name="Globe" size={15} />
            Курсы платформы
          </button>
          {canOwnCourses && (
            <button
              onClick={() => setTab("own")}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${tab === "own" ? "bg-background shadow text-foreground" : "text-muted-foreground hover:text-foreground"}`}
            >
              <Icon name="FolderOpen" size={15} />
              Свои курсы
              <span className="bg-violet-600 text-white text-[10px] rounded-full px-1.5 py-0.5 leading-none">{MOCK_OWN_COURSES.length}</span>
            </button>
          )}
        </div>
        <div className="relative flex-1">
          <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Поиск курса..."
            className="w-full h-9 pl-9 pr-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        {canOwnCourses && tab === "own" && (
          <Button className="gradient-primary text-white rounded-xl gap-2 h-9 flex-shrink-0" onClick={() => setShowAddModal(true)}>
            <Icon name="Plus" size={15} />
            Добавить курс
          </Button>
        )}
      </div>

      {/* Баннер если нет своих курсов */}
      {!canOwnCourses && (
        <div className="flex items-start gap-3 px-4 py-3 bg-amber-50 dark:bg-amber-900/10 border border-amber-200 dark:border-amber-800 rounded-2xl">
          <Icon name="Info" size={16} className="text-amber-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-amber-700 dark:text-amber-400">
            Добавление собственных курсов недоступно. Обратитесь к суперадминистратору для включения этой функции.
          </p>
        </div>
      )}

      {/* Курсы платформы */}
      {tab === "platform" && (
        <div className="space-y-3">
          <p className="text-xs text-muted-foreground">Курсы платформы доступны для назначения слушателям. Редактирование и удаление недоступны.</p>
          <div className="bg-card rounded-2xl border border-border overflow-hidden">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Курс</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Категория</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Уроков</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Длительность</th>
                  <th className="px-4 py-3 text-left font-medium text-muted-foreground">Источник</th>
                </tr>
              </thead>
              <tbody>
                {filteredPlatform.map((c) => (
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
                    <td className="px-4 py-3">
                      <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        <Icon name="Globe" size={13} />
                        Платформа
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredPlatform.length === 0 && (
              <div className="p-10 text-center">
                <Icon name="SearchX" size={32} className="text-muted-foreground mx-auto mb-3" />
                <p className="font-medium">Курсы не найдены</p>
              </div>
            )}
          </div>

          {/* Направления */}
          <div className="mt-2">
            <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Направления подготовки</p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {COURSE_DIRECTIONS.map((dir) => (
                <div key={dir.id} className="bg-card rounded-2xl border border-border p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 bg-gradient-to-br from-violet-500 to-purple-700 rounded-lg flex items-center justify-center">
                      <Icon name="Layers" size={13} className="text-white" />
                    </div>
                    <p className="font-semibold text-sm">{dir.title}</p>
                    <Badge variant="secondary" className="text-xs ml-auto">{dir.courses.length} курсов</Badge>
                  </div>
                  <div className="space-y-1">
                    {dir.courses.slice(0, 3).map((c) => (
                      <div key={c.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span className="font-mono w-12 flex-shrink-0">{c.code}</span>
                        <span className="truncate">{c.title}</span>
                      </div>
                    ))}
                    {dir.courses.length > 3 && (
                      <p className="text-xs text-violet-500 font-medium">+{dir.courses.length - 3} ещё</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Свои курсы */}
      {tab === "own" && canOwnCourses && (
        <div className="bg-card rounded-2xl border border-border overflow-hidden">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-muted/40">
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Курс</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Категория</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Уроков</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Длительность</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Добавлен</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Статус</th>
                <th className="px-4 py-3 text-left font-medium text-muted-foreground">Действия</th>
              </tr>
            </thead>
            <tbody>
              {filteredOwn.map((c) => (
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
                  <td className="px-4 py-3 text-muted-foreground text-xs">{c.createdAt}</td>
                  <td className="px-4 py-3">
                    <span className={`px-2.5 py-1 rounded-lg text-xs font-medium ${c.published ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300" : "bg-muted text-muted-foreground"}`}>
                      {c.published ? "Опубликован" : "Черновик"}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="flex items-center gap-1">
                      <Tip text="Редактировать">
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-foreground">
                          <Icon name="Pencil" size={14} />
                        </button>
                      </Tip>
                      <Tip text={c.published ? "Снять с публикации" : "Опубликовать"}>
                        <button className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground hover:text-emerald-600">
                          <Icon name={c.published ? "EyeOff" : "Eye"} size={14} />
                        </button>
                      </Tip>
                      <Tip text="Удалить">
                        <button className="p-1.5 rounded-lg hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors text-muted-foreground hover:text-red-500">
                          <Icon name="Trash2" size={14} />
                        </button>
                      </Tip>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredOwn.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-muted-foreground">
                    <Icon name="BookPlus" size={32} className="mx-auto mb-3" />
                    <p className="font-medium">Свои курсы не добавлены</p>
                    <p className="text-sm mt-1">Нажмите «Добавить курс», чтобы создать первый</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
