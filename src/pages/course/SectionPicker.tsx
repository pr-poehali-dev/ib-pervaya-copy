import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { Question } from "@/data/questionsBank";
import type { LearningMode, AdaptiveRecord } from "./CoursePageTypes";

export interface CourseSection {
  name: string;
  questions: Question[];
}

/** Собирает уникальные разделы из массива вопросов */
export function buildSections(questions: Question[]): CourseSection[] {
  const map = new Map<string, Question[]>();
  for (const q of questions) {
    const sec = q.section ?? "Общий раздел";
    if (!map.has(sec)) map.set(sec, []);
    map.get(sec)!.push(q);
  }
  return Array.from(map.entries()).map(([name, qs]) => ({ name, questions: qs }));
}

interface SectionPickerProps {
  sections: CourseSection[];
  mode: LearningMode;
  adaptiveRecords?: Record<number, AdaptiveRecord>;
  onSelect: (section: CourseSection) => void;
  onBack: () => void;
}

const MODE_META: Record<string, { title: string; icon: string; color: string }> = {
  adaptive:     { title: "Адаптивный тренинг",  icon: "Zap",         color: "from-violet-500 to-purple-700" },
  section_test: { title: "Тест по разделу",      icon: "ClipboardList", color: "from-cyan-500 to-blue-600" },
  ntd_test:     { title: "Тесты по НТД",         icon: "BookMarked",  color: "from-indigo-500 to-blue-700" },
};

export function SectionPicker({ sections, mode, adaptiveRecords = {}, onSelect, onBack }: SectionPickerProps) {
  const meta = MODE_META[mode] ?? { title: "Выбор раздела", icon: "Layers", color: "from-violet-500 to-purple-700" };

  return (
    <div className="space-y-5">
      {/* Хлебные крошки */}
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <button onClick={onBack} className="hover:text-foreground transition-colors flex items-center gap-1.5">
          <Icon name="ArrowLeft" size={15} />
          Назад
        </button>
        <Icon name="ChevronRight" size={14} />
        <span className="text-foreground font-medium">{meta.title}</span>
      </div>

      {/* Заголовок */}
      <div className="flex items-center gap-3">
        <div className={`w-9 h-9 bg-gradient-to-br ${meta.color} rounded-xl flex items-center justify-center`}>
          <Icon name={meta.icon} size={17} className="text-white" />
        </div>
        <div>
          <p className="font-bold text-base">{meta.title}</p>
          <p className="text-xs text-muted-foreground">Выберите раздел для начала</p>
        </div>
      </div>

      {/* Карточки разделов */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {sections.map((sec, i) => {
          const total   = sec.questions.length;
          const studied = sec.questions.filter((q) => {
            const rec = adaptiveRecords[q.id];
            return rec && rec.history.length > 0;
          }).length;

          return (
            <div
              key={sec.name}
              className="bg-card border border-border rounded-2xl p-4 sm:p-5 flex flex-col gap-3 hover:border-violet-400 hover:shadow-lg hover:shadow-violet-100 dark:hover:shadow-violet-900/20 transition-all duration-200 cursor-pointer group"
              onClick={() => onSelect(sec)}
            >
              <div className="flex items-start justify-between">
                <div className="text-xs text-muted-foreground">Раздел</div>
                <Icon name="ChevronRight" size={15} className="text-muted-foreground group-hover:text-violet-500 transition-colors" />
              </div>
              <p className="font-bold text-sm sm:text-base leading-snug">{sec.name}</p>
              <div className="space-y-1 text-sm text-muted-foreground">
                <div className="flex items-center gap-1.5">
                  <Icon name="BookOpen" size={13} />
                  <span>Изучено вопросов: <span className="text-foreground font-medium">{studied} из {total}</span></span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Icon name="Clock" size={13} />
                  <span>Время попытки: {studied === 0 ? "—" : "в процессе"}</span>
                </div>
              </div>

              {/* Прогресс-бар */}
              <div className="w-full bg-muted rounded-full h-1.5">
                <div
                  className="bg-gradient-to-r from-violet-500 to-purple-700 h-1.5 rounded-full transition-all duration-500"
                  style={{ width: `${total > 0 ? Math.round((studied / total) * 100) : 0}%` }}
                />
              </div>

              <Button
                size="sm"
                className={`w-full gradient-primary text-white rounded-xl gap-2 mt-1`}
                onClick={(e) => { e.stopPropagation(); onSelect(sec); }}
              >
                <Icon name={studied > 0 ? "Play" : "PlayCircle"} size={14} />
                {studied > 0 ? "Продолжить" : "Начать"}
              </Button>
            </div>
          );
        })}
      </div>
    </div>
  );
}