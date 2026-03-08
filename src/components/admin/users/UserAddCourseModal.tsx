import { useState } from "react";
import { Button } from "@/components/ui/button";
import Icon from "@/components/ui/icon";
import { courseDirections } from "@/components/admin/types";

interface UserAddCourseModalProps {
  onClose: () => void;
  onAdd: (courseIds: number[]) => void;
  alreadyAssigned: number[];
}

export default function UserAddCourseModal({ onClose, onAdd, alreadyAssigned }: UserAddCourseModalProps) {
  const [selected, setSelected] = useState<number[]>([]);
  const [openDirs, setOpenDirs] = useState<number[]>([]);

  const toggleDir = (id: number) =>
    setOpenDirs((p) => p.includes(id) ? p.filter((d) => d !== id) : [...p, id]);

  const toggleCourse = (id: number) =>
    setSelected((p) => p.includes(id) ? p.filter((c) => c !== id) : [...p, id]);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div className="relative bg-background rounded-2xl shadow-2xl z-10 w-full max-w-xl mx-4 flex flex-col max-h-[85vh]">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border flex-shrink-0">
          <h2 className="font-semibold text-base">Добавить курс</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground transition-colors">
            <Icon name="X" size={18} />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          {courseDirections.map((dir) => {
            const isOpen = openDirs.includes(dir.id);
            return (
              <div key={dir.id} className="border-b border-border last:border-0">
                <button
                  className={`w-full flex items-center justify-between px-5 py-3.5 text-left transition-colors ${isOpen ? "bg-violet-50 dark:bg-violet-900/20" : "hover:bg-muted/40"}`}
                  onClick={() => toggleDir(dir.id)}
                >
                  <span className={`font-semibold text-sm ${isOpen ? "text-violet-700 dark:text-violet-300" : ""}`}>{dir.title}</span>
                  <Icon name={isOpen ? "ChevronUp" : "ChevronDown"} size={16} className={isOpen ? "text-violet-600" : "text-muted-foreground"} />
                </button>
                {isOpen && dir.courses.map((c) => {
                  const isAssigned = alreadyAssigned.includes(c.id);
                  const isPicked = selected.includes(c.id);
                  return (
                    <div key={c.id} className="flex items-center justify-between px-5 py-3 border-t border-border/60 hover:bg-muted/30 transition-colors">
                      <span className="text-sm text-foreground leading-snug pr-3">
                        <span className="font-medium">{c.code}</span> {c.title}
                      </span>
                      {isAssigned ? (
                        <span className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg bg-muted text-muted-foreground">Уже назначен</span>
                      ) : isPicked ? (
                        <button
                          className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-700 hover:bg-red-100 hover:text-red-600 hover:border-red-300 transition-colors"
                          onClick={() => toggleCourse(c.id)}
                        >Выбрано</button>
                      ) : (
                        <button
                          className="flex-shrink-0 px-3 py-1 text-xs font-medium rounded-lg gradient-primary text-white hover:opacity-90 transition-opacity"
                          onClick={() => toggleCourse(c.id)}
                        >Выбрать</button>
                      )}
                    </div>
                  );
                })}
              </div>
            );
          })}
        </div>

        <div className="p-4 border-t border-border flex gap-3 flex-shrink-0">
          <Button variant="outline" className="rounded-xl flex-1" onClick={onClose}>Отмена</Button>
          <Button
            className="rounded-xl gradient-primary text-white flex-1 gap-2"
            disabled={selected.length === 0}
            onClick={() => { onAdd(selected); onClose(); }}
          >
            <Icon name="Plus" size={15} />
            Добавить ({selected.length})
          </Button>
        </div>
      </div>
    </div>
  );
}
