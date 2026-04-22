import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { CourseEditorData, EditorDirection } from "./CourseEditorTypes";

// ─── Модал добавления направления ────────────────────────────────────────────

function AddDirectionModal({
  onClose,
  onAdd,
}: {
  onClose: () => void;
  onAdd: (title: string) => void;
}) {
  const [value, setValue] = useState("");
  const valid = value.trim().length > 0;

  function handleAdd() {
    if (!valid) return;
    onAdd(value.trim());
    onClose();
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4">
      <div className="bg-background rounded-2xl border border-border w-full max-w-sm shadow-2xl">
        <div className="flex items-center justify-between px-5 pt-5 pb-4 border-b border-border">
          <h3 className="font-semibold text-base">Новое направление</h3>
          <button onClick={onClose} className="p-1.5 rounded-lg hover:bg-muted text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={16} />
          </button>
        </div>
        <div className="p-5 space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs text-muted-foreground">Название направления</label>
            <input
              autoFocus
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleAdd()}
              placeholder="Например: Пожарная безопасность"
              className="w-full h-9 px-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
            />
          </div>
        </div>
        <div className="flex gap-2 px-5 pb-5">
          <Button variant="outline" className="flex-1 rounded-xl" onClick={onClose}>Отмена</Button>
          <Button
            className="flex-1 rounded-xl gradient-primary text-white"
            disabled={!valid}
            onClick={handleAdd}
          >
            Добавить
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Шаг 1: Описание курса ────────────────────────────────────────────────────

export function Step1({ data, onChange, directions, onAddDirection }: {
  data: CourseEditorData;
  onChange: (p: Partial<CourseEditorData>) => void;
  directions?: EditorDirection[];
  onAddDirection?: (title: string) => void;
}) {
  const [showAddDir, setShowAddDir] = useState(false);

  return (
    <div className="space-y-5 max-w-2xl mx-auto">
      {showAddDir && (
        <AddDirectionModal
          onClose={() => setShowAddDir(false)}
          onAdd={(title) => onAddDirection?.(title)}
        />
      )}
      {directions && directions.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center justify-between">
            <label className="text-sm font-medium">Направление *</label>
            <button
              type="button"
              className="flex items-center gap-1.5 text-xs text-violet-600 dark:text-violet-400 hover:underline"
              onClick={() => setShowAddDir(true)}
            >
              <Icon name="Plus" size={12} />
              Добавить направление
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {directions.map((d) => {
              const active = data.directionId === d.id;
              return (
                <button
                  key={d.id}
                  onClick={() => onChange({ directionId: d.id })}
                  className={`flex items-center gap-2 px-3 py-2 rounded-xl border-2 text-sm font-medium transition-all ${active ? "border-violet-500 bg-violet-50 dark:bg-violet-900/20 text-violet-700 dark:text-violet-300" : "border-border text-muted-foreground hover:border-violet-300"}`}
                >
                  {active && <Icon name="CheckCircle" size={14} />}
                  {d.title}
                </button>
              );
            })}
          </div>
        </div>
      )}
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Название курса *</label>
        <input
          value={data.title}
          onChange={(e) => onChange({ title: e.target.value })}
          placeholder="Например: Вводный инструктаж для новых сотрудников"
          className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Код курса</label>
          <input
            value={data.code}
            onChange={(e) => onChange({ code: e.target.value })}
            placeholder="ВИ-01"
            className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm font-mono focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
        <div className="space-y-1.5">
          <label className="text-sm font-medium">Количество часов *</label>
          <input
            type="number" min="1"
            value={data.hours}
            onChange={(e) => onChange({ hours: e.target.value })}
            placeholder="8"
            className="w-full h-10 px-4 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30"
          />
        </div>
      </div>
      <div className="space-y-1.5">
        <label className="text-sm font-medium">Описание курса</label>
        <textarea
          value={data.description}
          onChange={(e) => onChange({ description: e.target.value })}
          rows={4}
          placeholder="Цели курса, целевая аудитория, ключевые темы..."
          className="w-full px-4 py-3 rounded-xl border border-border bg-background text-sm focus:outline-none focus:ring-2 focus:ring-violet-500/30 resize-none"
        />
      </div>
      <label className="flex items-start gap-3 cursor-pointer p-4 rounded-xl border border-border hover:bg-muted/40 transition-colors">
        <input
          type="checkbox"
          checked={data.dpoAvailable}
          onChange={(e) => onChange({ dpoAvailable: e.target.checked })}
          className="rounded accent-violet-600 w-4 h-4 mt-0.5 flex-shrink-0"
        />
        <div>
          <p className="text-sm font-medium">Удостоверение ДПО</p>
          <p className="text-xs text-muted-foreground">При успешной сдаче итогового теста выдаётся удостоверение о повышении квалификации</p>
        </div>
      </label>
    </div>
  );
}
