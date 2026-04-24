import { useState } from "react";
import Icon from "@/components/ui/icon";
import { Button } from "@/components/ui/button";
import type { Question } from "@/data/questionsBank";
import { checkCorrect } from "./CoursePageTypes";
import { AnswerOptions, AnswerResult } from "./CoursePageShared";

function FavoritesQuiz({
  questions,
  favoriteIds,
  onUnfavorite,
  onBack,
}: {
  questions: Question[];
  favoriteIds: Set<number>;
  onUnfavorite: (id: number) => void;
  onBack: () => void;
}) {
  const favQuestions = questions.filter((q) => favoriteIds.has(q.id));

  const [idx,      setIdx]      = useState(0);
  const [selected, setSelected] = useState<number[]>([]);
  const [answered, setAnswered] = useState(false);
  const [results,  setResults]  = useState<boolean[]>([]);
  const [finished, setFinished] = useState(false);

  if (favQuestions.length === 0) {
    return (
      <div className="bg-card border border-border rounded-2xl p-10 flex flex-col items-center gap-4 text-center">
        <div className="w-16 h-16 bg-pink-100 dark:bg-pink-900/30 rounded-2xl flex items-center justify-center">
          <Icon name="Star" size={28} className="text-pink-400" />
        </div>
        <div>
          <p className="font-semibold text-base mb-1">Нет избранных вопросов</p>
          <p className="text-sm text-muted-foreground max-w-xs">
            Нажмите звёздочку на любом вопросе в адаптивном тренинге — и он появится здесь
          </p>
        </div>
        <Button variant="outline" className="gap-2 mt-1" onClick={onBack}>
          <Icon name="ArrowLeft" size={14} />
          Назад
        </Button>
      </div>
    );
  }

  const q = favQuestions[idx];

  function handleToggle(i: number) {
    if (answered) return;
    setSelected((prev) => prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i]);
  }

  function handleSubmit() {
    if (selected.length === 0) return;
    setAnswered(true);
    setResults((prev) => [...prev, checkCorrect(q, selected)]);
  }

  function handleNext() {
    if (idx + 1 >= favQuestions.length) {
      setFinished(true);
    } else {
      setIdx((p) => p + 1);
      setSelected([]);
      setAnswered(false);
    }
  }

  function handleRestart() {
    setIdx(0);
    setSelected([]);
    setAnswered(false);
    setResults([]);
    setFinished(false);
  }

  const correct = results.filter(Boolean).length;
  const score   = results.length > 0 ? Math.round((correct / results.length) * 100) : 0;
  const passed  = score >= 70;

  if (finished) {
    return (
      <div className="bg-card border border-border rounded-2xl p-8 flex flex-col items-center gap-5 text-center">
        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center ${passed ? "bg-emerald-100 dark:bg-emerald-900/30" : "bg-red-100 dark:bg-red-900/30"}`}>
          <Icon name={passed ? "Trophy" : "RefreshCw"} size={36} className={passed ? "text-emerald-600" : "text-red-500"} />
        </div>
        <div>
          <p className="text-2xl font-bold mb-1">{score}%</p>
          <p className="text-muted-foreground text-sm">{correct} из {results.length} верных ответов</p>
        </div>
        <div className={`w-full rounded-xl px-4 py-3 text-sm font-medium ${passed ? "bg-emerald-50 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300" : "bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-300"}`}>
          {passed ? "Отлично! Вы хорошо знаете свои сложные вопросы." : "Продолжайте тренироваться — результат станет лучше."}
        </div>
        <div className="flex gap-3 w-full">
          <Button variant="outline" className="flex-1 gap-2" onClick={handleRestart}>
            <Icon name="RefreshCw" size={14} />
            Ещё раз
          </Button>
          <Button className="flex-1 gradient-primary text-white gap-2" onClick={onBack}>
            <Icon name="ArrowLeft" size={14} />
            Назад
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Шапка */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <button
          onClick={onBack}
          className="flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground transition-colors"
        >
          <Icon name="ArrowLeft" size={15} />
          Назад
        </button>
        <span className="text-xs text-muted-foreground">
          Вопрос {idx + 1} / {favQuestions.length}
        </span>
      </div>

      {/* Прогресс */}
      <div className="w-full bg-muted rounded-full h-1.5">
        <div
          className="bg-gradient-to-r from-pink-500 to-rose-600 h-1.5 rounded-full transition-all duration-500"
          style={{ width: `${(idx / favQuestions.length) * 100}%` }}
        />
      </div>

      {/* Вопрос */}
      <div className="bg-card rounded-2xl border border-border p-6">
        <div className="flex items-start justify-between gap-3 mb-5">
          <p className="font-semibold text-base leading-relaxed flex-1">{q.text}</p>
          <button
            onClick={() => onUnfavorite(q.id)}
            title="Убрать из избранного"
            className="flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg text-pink-500 hover:bg-pink-50 dark:hover:bg-pink-900/20 transition-colors"
          >
            <Icon name="Star" size={18} />
          </button>
        </div>
        <AnswerOptions question={q} selected={selected} answered={answered} onToggle={handleToggle} />
      </div>

      {!answered ? (
        <Button
          className="w-full gradient-primary text-white rounded-xl gap-2"
          disabled={selected.length === 0}
          onClick={handleSubmit}
        >
          Ответить
          <Icon name="CheckCircle" size={15} />
        </Button>
      ) : (
        <AnswerResult
          question={q}
          isCorrect={checkCorrect(q, selected)}
          onNext={handleNext}
          nextLabel={idx + 1 >= favQuestions.length ? "Завершить" : "Следующий вопрос"}
        />
      )}
    </div>
  );
}

export function FavoritesMode({
  questions,
  favoriteIds,
  onUnfavorite,
  onBack,
}: {
  questions: Question[];
  favoriteIds: Set<number>;
  onUnfavorite: (id: number) => void;
  onBack: () => void;
}) {
  const count = questions.filter((q) => favoriteIds.has(q.id)).length;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 bg-gradient-to-br from-pink-500 to-rose-600 rounded-lg flex items-center justify-center">
          <Icon name="Star" size={13} className="text-white" />
        </div>
        <p className="font-semibold text-sm">Избранные вопросы</p>
        {count > 0 && (
          <span className="ml-1 text-xs bg-pink-100 dark:bg-pink-900/30 text-pink-600 dark:text-pink-400 px-2 py-0.5 rounded-full font-medium">
            {count}
          </span>
        )}
      </div>
      <FavoritesQuiz
        questions={questions}
        favoriteIds={favoriteIds}
        onUnfavorite={onUnfavorite}
        onBack={onBack}
      />
    </div>
  );
}
