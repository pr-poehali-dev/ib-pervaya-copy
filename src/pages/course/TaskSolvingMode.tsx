import { useState } from "react";
import Icon from "@/components/ui/icon";

interface Task {
  id: number;
  title: string;
  description: string;
  conditionUrl: string | null;
  solutionUrl: string | null;
}

const TASKS: Task[] = [
  { id: 1,  title: "Задача 1",  description: "Оценка технического состояния грузоподъёмного крана на опасном производственном объекте", conditionUrl: "#", solutionUrl: "#" },
  { id: 2,  title: "Задача 2",  description: "Экспертиза промышленной безопасности здания компрессорной станции", conditionUrl: "#", solutionUrl: "#" },
  { id: 3,  title: "Задача 3",  description: "Анализ соответствия проектной документации нормативным требованиям ПБ", conditionUrl: "#", solutionUrl: null },
  { id: 4,  title: "Задача 4",  description: "Расчёт остаточного ресурса сосуда, работающего под давлением", conditionUrl: "#", solutionUrl: "#" },
  { id: 5,  title: "Задача 5",  description: "Экспертиза декларации промышленной безопасности нефтехимического предприятия", conditionUrl: "#", solutionUrl: "#" },
  { id: 6,  title: "Задача 6",  description: "Оценка технического состояния трубопровода пара и горячей воды", conditionUrl: "#", solutionUrl: "#" },
  { id: 7,  title: "Задача 7",  description: "Анализ причин аварии на объекте горнодобывающей промышленности", conditionUrl: "#", solutionUrl: null },
  { id: 8,  title: "Задача 8",  description: "Экспертиза технических устройств для нефтяной и газовой промышленности", conditionUrl: "#", solutionUrl: "#" },
  { id: 9,  title: "Задача 9",  description: "Оценка соответствия системы управления промышленной безопасностью требованиям законодательства", conditionUrl: "#", solutionUrl: "#" },
  { id: 10, title: "Задача 10", description: "Комплексная экспертиза технического перевооружения опасного производственного объекта", conditionUrl: "#", solutionUrl: "#" },
];

interface Props {
  onBack: () => void;
}

type PdfType = "condition" | "solution";

export default function TaskSolvingMode({ onBack }: Props) {
  const [search, setSearch] = useState("");
  const [openTask, setOpenTask] = useState<Task | null>(null);
  const [pdfType, setPdfType] = useState<PdfType>("condition");
  const [viewerOpen, setViewerOpen] = useState(false);

  const filtered = TASKS.filter((t) =>
    t.title.toLowerCase().includes(search.toLowerCase()) ||
    t.description.toLowerCase().includes(search.toLowerCase())
  );

  function openViewer(task: Task, type: PdfType) {
    setOpenTask(task);
    setPdfType(type);
    setViewerOpen(true);
  }

  function closeViewer() {
    setViewerOpen(false);
    setOpenTask(null);
  }

  const currentUrl = openTask
    ? pdfType === "condition"
      ? openTask.conditionUrl
      : openTask.solutionUrl
    : null;

  return (
    <div className="space-y-4">
      {/* Заголовок */}
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gradient-to-br from-teal-500 to-cyan-700 rounded-lg flex items-center justify-center flex-shrink-0">
          <Icon name="PenLine" size={13} className="text-white" />
        </div>
        <p className="font-semibold text-sm">Решение задач</p>
        <span className="ml-auto text-xs text-muted-foreground">{TASKS.length} задач</span>
      </div>

      {/* Поиск */}
      <div className="relative">
        <Icon name="Search" size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Поиск по задачам..."
          className="w-full pl-9 pr-4 py-2.5 text-sm rounded-xl border border-border bg-card outline-none focus:border-teal-400 focus:ring-2 focus:ring-teal-100 dark:focus:ring-teal-900/30 transition-all placeholder:text-muted-foreground"
        />
      </div>

      {/* Список задач */}
      {filtered.length === 0 ? (
        <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-3 text-center">
          <Icon name="SearchX" size={32} className="text-muted-foreground/40" />
          <p className="text-sm text-muted-foreground">Задачи не найдены</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map((task) => (
            <div
              key={task.id}
              className="bg-card border border-border rounded-2xl p-4 hover:border-teal-300 dark:hover:border-teal-700 transition-all group"
            >
              <div className="flex items-start gap-3">
                <div className="w-8 h-8 bg-teal-100 dark:bg-teal-900/30 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span className="text-xs font-bold text-teal-700 dark:text-teal-300">{task.id}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium mb-1">{task.title}</p>
                  <p className="text-xs text-muted-foreground leading-relaxed">{task.description}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <button
                      onClick={() => openViewer(task, "condition")}
                      disabled={!task.conditionUrl}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-teal-50 dark:bg-teal-900/20 text-teal-700 dark:text-teal-300 text-xs font-medium hover:bg-teal-100 dark:hover:bg-teal-900/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Icon name="FileText" size={13} />
                      Условие
                    </button>
                    <button
                      onClick={() => openViewer(task, "solution")}
                      disabled={!task.solutionUrl}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-cyan-50 dark:bg-cyan-900/20 text-cyan-700 dark:text-cyan-300 text-xs font-medium hover:bg-cyan-100 dark:hover:bg-cyan-900/40 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
                    >
                      <Icon name="Lightbulb" size={13} />
                      Решение
                    </button>
                    {!task.solutionUrl && (
                      <span className="text-[10px] text-muted-foreground/60 ml-1">Решение готовится</span>
                    )}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Назад */}
      <button
        onClick={onBack}
        className="text-sm text-muted-foreground hover:text-foreground transition-colors flex items-center gap-1.5 pt-2"
      >
        <Icon name="ArrowLeft" size={14} />
        Назад к курсу
      </button>

      {/* Модалка просмотра PDF */}
      {viewerOpen && openTask && (
        <div className="fixed inset-0 z-50 flex flex-col bg-background">
          {/* Шапка */}
          <div className="flex items-center gap-3 px-4 py-3 border-b border-border bg-card flex-shrink-0">
            <button
              onClick={closeViewer}
              className="w-8 h-8 rounded-lg hover:bg-accent flex items-center justify-center transition-colors"
            >
              <Icon name="X" size={16} />
            </button>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-semibold truncate">{openTask.title}</p>
              <p className="text-xs text-muted-foreground truncate">{openTask.description}</p>
            </div>
            {/* Переключатель условие/решение */}
            <div className="flex items-center gap-1 bg-muted rounded-lg p-1">
              <button
                onClick={() => setPdfType("condition")}
                disabled={!openTask.conditionUrl}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  pdfType === "condition"
                    ? "bg-white dark:bg-zinc-800 shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Icon name="FileText" size={12} />
                  Условие
                </span>
              </button>
              <button
                onClick={() => setPdfType("solution")}
                disabled={!openTask.solutionUrl}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all disabled:opacity-40 disabled:cursor-not-allowed ${
                  pdfType === "solution"
                    ? "bg-white dark:bg-zinc-800 shadow text-foreground"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                <span className="flex items-center gap-1.5">
                  <Icon name="Lightbulb" size={12} />
                  Решение
                </span>
              </button>
            </div>
          </div>

          {/* PDF viewer */}
          <div className="flex-1 overflow-hidden">
            {currentUrl && currentUrl !== "#" ? (
              <iframe
                src={currentUrl}
                className="w-full h-full border-0"
                title={`${openTask.title} — ${pdfType === "condition" ? "Условие" : "Решение"}`}
              />
            ) : (
              <div className="flex flex-col items-center justify-center h-full gap-4 text-center p-8">
                <div className="w-16 h-16 bg-teal-100 dark:bg-teal-900/30 rounded-2xl flex items-center justify-center">
                  <Icon name="FileText" size={28} className="text-teal-500" />
                </div>
                <div>
                  <p className="font-semibold mb-1">Файл будет добавлен позже</p>
                  <p className="text-sm text-muted-foreground max-w-xs">PDF-документ ещё не загружен. Как только файл появится — он откроется здесь автоматически.</p>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
