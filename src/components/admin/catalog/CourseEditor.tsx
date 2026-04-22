import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import {
  STEPS,
  type CourseEditorData,
  type EditorDirection,
} from "./CourseEditorTypes";
import { Step1 } from "./CourseEditorStep1";
import { Step2, Step3, Step4 } from "./CourseEditorSteps234";

export type {
  MaterialType,
  CourseMaterialFile,
  NtdFile,
  TestMode,
  CourseEditorData,
  EditorDirection,
} from "./CourseEditorTypes";

// ─── Главный компонент ────────────────────────────────────────────────────────

interface CourseEditorProps {
  onClose: () => void;
  onSave: (data: CourseEditorData) => void;
  initialData?: Partial<CourseEditorData>;
  directions?: EditorDirection[];
  saveLabel?: string;
  onAddDirection?: (title: string) => void;
}

export default function CourseEditor({ onClose, onSave, initialData, directions, saveLabel, onAddDirection }: CourseEditorProps) {
  const [step,      setStep]      = useState(1);
  const [stepError, setStepError] = useState("");

  const [data, setData] = useState<CourseEditorData>({
    title:              initialData?.title              ?? "",
    code:               initialData?.code               ?? "",
    hours:              initialData?.hours              ?? "",
    description:        initialData?.description        ?? "",
    dpoAvailable:       initialData?.dpoAvailable       ?? false,
    testModes:          initialData?.testModes          ?? ["adaptive", "final"],
    finalTestQuestions: initialData?.finalTestQuestions ?? "20",
    finalTestPassScore: initialData?.finalTestPassScore ?? "70",
    finalTestTime:      initialData?.finalTestTime      ?? "60",
    materials:          initialData?.materials          ?? [],
    ntdFiles:           initialData?.ntdFiles           ?? [],
    directionId:        initialData?.directionId        ?? directions?.[0]?.id,
  });

  function patch(p: Partial<CourseEditorData>) { setData((prev) => ({ ...prev, ...p })); }

  function goNext() {
    if (step === 1) {
      if (directions && directions.length > 0 && !data.directionId) { setStepError("Выберите направление курса"); return; }
      if (!data.title.trim()) { setStepError("Введите название курса"); return; }
      if (!data.hours || Number(data.hours) < 1) { setStepError("Укажите количество часов"); return; }
    }
    setStepError("");
    setStep((s) => Math.min(s + 1, 4));
  }

  function goBack() { setStepError(""); setStep((s) => Math.max(s - 1, 1)); }

  function handleSave() { onSave(data); onClose(); }

  return (
    <div className="fixed inset-0 z-50 flex flex-col bg-background">

      {/* Шапка */}
      <div className="flex items-center gap-4 px-5 py-3.5 border-b border-border bg-card flex-shrink-0">
        <button onClick={onClose} className="p-2 rounded-xl hover:bg-muted transition-colors text-muted-foreground hover:text-foreground flex-shrink-0">
          <Icon name="X" size={18} />
        </button>
        <div className="flex-1 min-w-0">
          <p className="font-bold text-base truncate">{data.title || "Новый курс"}</p>
          <p className="text-xs text-muted-foreground">Конструктор курса</p>
        </div>

        {/* Прогресс шагов */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {STEPS.map((s, i) => {
            const done   = step > s.n;
            const active = step === s.n;
            return (
              <div key={s.n} className="flex items-center gap-1">
                <button
                  onClick={() => { if (done) setStep(s.n); }}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                    active ? "bg-violet-600 text-white shadow-md shadow-violet-200 dark:shadow-violet-900/30" :
                    done   ? "bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 cursor-pointer hover:bg-emerald-200 dark:hover:bg-emerald-900/50" :
                             "bg-muted text-muted-foreground"
                  }`}
                >
                  {done
                    ? <Icon name="CheckCircle" size={12} />
                    : <span className="w-4 h-4 rounded-full border-2 border-current flex items-center justify-center text-[10px] font-bold">{s.n}</span>
                  }
                  <span className="hidden md:inline">{s.label}</span>
                </button>
                {i < STEPS.length - 1 && <Icon name="ChevronRight" size={13} className="text-muted-foreground" />}
              </div>
            );
          })}
        </div>
      </div>

      {/* Контент */}
      <div className="flex-1 overflow-y-auto">
        <div className="px-6 py-6">
          {step === 1 && <Step1 data={data} onChange={patch} directions={directions} onAddDirection={onAddDirection} />}
          {step === 2 && <Step2 data={data} onChange={patch} />}
          {step === 3 && <Step3 data={data} onChange={patch} />}
          {step === 4 && <Step4 data={data} onChange={patch} />}
        </div>
      </div>

      {/* Подвал */}
      <div className="flex items-center justify-between px-6 py-4 border-t border-border bg-card flex-shrink-0">
        <div>
          {stepError && (
            <div className="flex items-center gap-1.5 text-sm text-red-500">
              <Icon name="AlertCircle" size={14} />
              {stepError}
            </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {step > 1 && (
            <Button variant="outline" className="rounded-xl gap-1.5" onClick={goBack}>
              <Icon name="ChevronLeft" size={15} />
              Назад
            </Button>
          )}
          {step < 4 ? (
            <Button className="gradient-primary text-white rounded-xl gap-1.5" onClick={goNext}>
              Далее
              <Icon name="ChevronRight" size={15} />
            </Button>
          ) : (
            <Button className="gradient-primary text-white rounded-xl gap-1.5 px-5" onClick={handleSave}>
              <Icon name="Send" size={15} />
              {saveLabel ?? "Отправить на проверку"}
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}
