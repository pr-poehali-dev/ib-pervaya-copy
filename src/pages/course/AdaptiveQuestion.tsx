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
}: {
  question: Question;
  onToggle: (idx: number) => void;
  onNext: () => void;
  onSubmit: () => void;
  answered: boolean;
  selected: number[];
}) {
  const isCorrect = checkCorrect(question, selected);

  return (
    <div className="space-y-5">
      <div className="bg-card rounded-2xl border border-border p-6">
        <p className="font-semibold text-base leading-relaxed mb-5">{question.text}</p>
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
