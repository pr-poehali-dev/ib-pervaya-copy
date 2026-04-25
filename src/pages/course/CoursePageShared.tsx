import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { Question } from "@/data/questionsBank";
import {
  correctArr,
  isMulti,
  checkCorrect,
  getAdaptiveStatus,
  ADAPTIVE_STATUS_CLS,
  SECTION_STATUS_CLS,
  type AdaptiveRecord,
  type SectionStatus,
} from "./CoursePageTypes";

// ─── Навигация по вопросам ────────────────────────────────────────────────────

export function QuestionNav({
  questions,
  currentIdx,
  onJump,
  mode,
  adaptiveRecords,
  sectionStatuses,
  finishButton,
  answeredCls,
}: {
  questions: Question[];
  currentIdx: number;
  onJump: (idx: number) => void;
  mode: "adaptive" | "section";
  adaptiveRecords?: Record<number, AdaptiveRecord>;
  sectionStatuses?: Record<number, SectionStatus>;
  finishButton?: React.ReactNode;
  answeredCls?: string;
}) {
  const [visible, setVisible] = useState(typeof window !== "undefined" ? window.innerWidth >= 1024 : true);

  const legend = mode === "adaptive" ? [
    { cls: "bg-emerald-500",                   label: "Изучен (3 верных подряд)" },
    { cls: "bg-orange-300 dark:bg-orange-700", label: "Почти (2 из 3 верных)" },
    { cls: "bg-blue-200 dark:bg-blue-900/50",  label: "Отвечали хотя бы раз" },
    { cls: "bg-muted",                         label: "Ещё не отвечали" },
    { cls: "bg-red-500",                       label: "Часто неверно (3 подряд)" },
  ] : finishButton ? [
    { cls: "bg-blue-500", label: "Ответ дан" },
    { cls: "bg-muted",    label: "Не отвечен" },
  ] : [
    { cls: "bg-emerald-500", label: "Правильный ответ" },
    { cls: "bg-red-500",     label: "Неправильный ответ" },
    { cls: "bg-muted",       label: "Ещё не отвечали" },
  ];

  if (!visible) {
    return (
      <div className="flex-shrink-0">
        <button
          onClick={() => setVisible(true)}
          className="flex flex-col items-center gap-1.5 px-2 py-3 rounded-2xl border border-border bg-card hover:bg-muted/40 transition-colors text-muted-foreground hover:text-foreground"
          title="Показать навигацию по вопросам"
        >
          <Icon name="LayoutGrid" size={16} />
          <span className="text-[10px] font-medium [writing-mode:vertical-lr] rotate-180">Вопросы</span>
        </button>
      </div>
    );
  }

  return (
    <div className="flex-shrink-0 w-full lg:w-52">
      <div className="flex items-center justify-between mb-2">
        <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
          Вопросы
        </span>
        <button
          onClick={() => setVisible(false)}
          className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 transition-colors"
        >
          <Icon name="PanelRightClose" size={13} />
          Скрыть
        </button>
      </div>

      <div className="bg-card border border-border rounded-2xl p-3 space-y-3">
        <div className="grid grid-cols-6 sm:grid-cols-8 lg:grid-cols-5 gap-1.5">
          {questions.map((q, idx) => {
            const isCurrent = idx === currentIdx;
            let cls = "";
            if (mode === "adaptive") {
              const status = getAdaptiveStatus(adaptiveRecords?.[q.id]);
              cls = ADAPTIVE_STATUS_CLS[status];
            } else {
              const status = sectionStatuses?.[q.id] ?? "untouched";
              const base = SECTION_STATUS_CLS[status];
              cls = (answeredCls && status === "correct") ? answeredCls : base;
            }
            return (
              <button
                key={q.id}
                onClick={() => onJump(idx)}
                className={`w-9 h-9 rounded-lg text-xs font-bold transition-all flex items-center justify-center ${cls} ${
                  isCurrent ? "ring-2 ring-violet-500 ring-offset-1 scale-110" : "hover:scale-105"
                }`}
                title={`Вопрос ${idx + 1}`}
              >
                {idx + 1}
              </button>
            );
          })}
        </div>

        <div className="space-y-1.5 pt-1 border-t border-border">
          {legend.map((l) => (
            <div key={l.label} className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-sm flex-shrink-0 ${l.cls}`} />
              <span className="text-[10px] text-muted-foreground leading-tight">{l.label}</span>
            </div>
          ))}
        </div>
        {finishButton && (
          <div className="pt-1 border-t border-border">{finishButton}</div>
        )}
      </div>
    </div>
  );
}

// ─── Варианты ответа ──────────────────────────────────────────────────────────

export function AnswerOptions({
  question,
  selected,
  answered,
  onToggle,
}: {
  question: Question;
  selected: number[];
  answered: boolean;
  onToggle: (idx: number) => void;
}) {
  const correct = correctArr(question);
  const multiAnswer = isMulti(question);

  return (
    <div className="space-y-2.5">
      {multiAnswer && !answered && (
        <p className="text-xs text-muted-foreground px-1">Выберите все верные варианты</p>
      )}
      {question.options.map((opt, idx) => {
        const isSelected = selected.includes(idx);
        const isCorrectOpt = correct.includes(idx);

        let cls = "border-border bg-background hover:border-violet-400 hover:bg-violet-50 dark:hover:bg-violet-900/10 cursor-pointer";
        if (!answered && isSelected) {
          cls = "border-violet-500 bg-violet-50 dark:bg-violet-900/20";
        } else if (answered) {
          if (isCorrectOpt) cls = "border-emerald-500 bg-emerald-50 dark:bg-emerald-900/20";
          else if (isSelected && !isCorrectOpt) cls = "border-red-400 bg-red-50 dark:bg-red-900/20";
          else cls = "border-border bg-muted/40 opacity-60";
        }

        return (
          <button
            key={idx}
            disabled={answered}
            onClick={() => onToggle(idx)}
            className={`w-full text-left px-3 sm:px-4 py-2.5 sm:py-3 rounded-xl border-2 transition-all flex items-center gap-2 sm:gap-3 ${cls}`}
          >
            <span className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 border-2 transition-all ${
              answered && isCorrectOpt ? "bg-emerald-500 border-emerald-500" :
              answered && isSelected && !isCorrectOpt ? "bg-red-400 border-red-400" :
              !answered && isSelected ? "bg-violet-600 border-violet-600" :
              "border-muted-foreground/40 bg-background"
            }`}>
              {((!answered && isSelected) || (answered && (isCorrectOpt || (isSelected && !isCorrectOpt)))) && (
                <Icon name="Check" size={13} className="text-white" />
              )}
            </span>
            <span className="text-sm flex-1">{opt}</span>
            {answered && isCorrectOpt && (
              <Icon name="CheckCircle" size={16} className="text-emerald-500 ml-auto flex-shrink-0" />
            )}
            {answered && isSelected && !isCorrectOpt && (
              <Icon name="XCircle" size={16} className="text-red-400 ml-auto flex-shrink-0" />
            )}
          </button>
        );
      })}
    </div>
  );
}

// ─── Блок результата ответа и ссылка на НТД ──────────────────────────────────

export function AnswerResult({
  question,
  isCorrect,
  onNext,
  nextLabel,
}: {
  question: Question;
  isCorrect: boolean;
  onNext: () => void;
  nextLabel: string;
}) {
  const correctText = correctArr(question).map((i) => question.options[i]).join("; ");
  return (
    <div className={`rounded-2xl border p-4 sm:p-5 space-y-3 ${isCorrect ? "bg-emerald-50 dark:bg-emerald-900/10 border-emerald-200 dark:border-emerald-800" : "bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800"}`}>
      <div className="flex items-center gap-2">
        <Icon name={isCorrect ? "CheckCircle" : "XCircle"} size={18} className={isCorrect ? "text-emerald-600 dark:text-emerald-400" : "text-red-600 dark:text-red-400"} />
        <p className={`font-semibold ${isCorrect ? "text-emerald-800 dark:text-emerald-300" : "text-red-800 dark:text-red-300"}`}>
          {isCorrect ? "Верно!" : `Неверно. Правильный ответ: ${correctText}`}
        </p>
      </div>
      <div className="flex items-start gap-2">
        <Icon name="BookOpen" size={15} className="text-muted-foreground flex-shrink-0 mt-0.5" />
        <div>
          <p className="text-xs text-muted-foreground font-medium mb-0.5">{question.ntdRef}</p>
          <p className="text-sm text-muted-foreground">{question.ntd}</p>
        </div>
      </div>
      <Button className="gradient-primary text-white rounded-xl w-full gap-2" onClick={onNext}>
        {nextLabel}
        <Icon name="ChevronRight" size={15} />
      </Button>
    </div>
  );
}