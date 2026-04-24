import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { Question } from "@/data/questionsBank";
import { checkCorrect } from "./CoursePageTypes";
import { AnswerOptions, AnswerResult } from "./CoursePageShared";

export function AdaptiveQuestion({
  question,
  onToggle,
  onNext,
  onSubmit,
  answered,
  selected,
  isFavorite,
  onToggleFavorite,
}: {
  question: Question;
  onToggle: (idx: number) => void;
  onNext: () => void;
  onSubmit: () => void;
  answered: boolean;
  selected: number[];
  isFavorite?: boolean;
  onToggleFavorite?: (id: number) => void;
}) {
  const isCorrect = checkCorrect(question, selected);

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <p className="font-semibold text-base leading-relaxed flex-1">{question.text}</p>
          {onToggleFavorite && (
            <button
              onClick={() => onToggleFavorite(question.id)}
              title={isFavorite ? "Убрать из избранного" : "Добавить в избранное"}
              className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg transition-colors ${
                isFavorite
                  ? "text-pink-500 bg-pink-50 dark:bg-pink-900/20"
                  : "text-muted-foreground hover:text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20"
              }`}
            >
              <Icon name="Star" size={17} />
            </button>
          )}
        </div>
        <AnswerOptions question={question} selected={selected} answered={answered} onToggle={onToggle} />
      </div>

      {!answered ? (
        <Button
          className="w-full gradient-primary text-white rounded-xl gap-2"
          disabled={selected.length === 0}
          onClick={onSubmit}
        >
          Ответить
          <Icon name="CheckCircle" size={15} />
        </Button>
      ) : (
        <AnswerResult question={question} isCorrect={isCorrect} onNext={onNext} nextLabel="Следующий вопрос" />
      )}
    </div>
  );
}