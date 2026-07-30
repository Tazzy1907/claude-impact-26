import { ArrowRight, Check, X } from "lucide-react";
import { getTactic } from "@/lib/content";
import {
  currentQuestion,
  isPrimaryDisabled,
  primaryLabel,
  progressPercent,
} from "@/lib/quiz-machine";
import { scoreSoFar } from "@/lib/scoring";
import type { QuizState, TacticId } from "@/lib/types";

/**
 * The question screen: progress, the argument, the options, and — once the
 * answer is locked in — the feedback card. Structure follows the design's
 * `isQuiz` branch element for element.
 */

interface QuizScreenProps {
  state: QuizState;
  showLearnCta: boolean;
  onSelect: (id: TacticId) => void;
  onPrimary: () => void;
  onOpenDefinition: (id: TacticId) => void;
}

export function QuizScreen({
  state,
  showLearnCta,
  onSelect,
  onPrimary,
  onOpenDefinition,
}: QuizScreenProps) {
  const question = currentQuestion(state);
  if (!question) return null;

  const { submitted, selected } = state;
  const questionNumber = state.index + 1;
  const total = state.questions.length;
  const lastAnswer = state.answers[state.answers.length - 1];

  return (
    <main className="flex flex-1 justify-center px-4 py-8">
      <div className="w-full max-w-[640px]">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-heading text-accent text-[12px] font-semibold tracking-[.06em] uppercase">
            Question {questionNumber} of {total}
          </span>
          <span className="text-muted text-[12px]">
            Score so far: {scoreSoFar(state)}
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Quiz progress"
          aria-valuenow={questionNumber}
          aria-valuemin={1}
          aria-valuemax={total}
          className="progress-track mb-6"
        >
          <div className="progress-bar" style={{ width: `${progressPercent(state)}%` }} />
        </div>

        <div className="card mb-4 p-4">
          <div className="card-kicker">The argument</div>
          {/* Two-speaker items put each turn on its own line, so the breaks are
              load-bearing: run them together and you lose track of who is
              answering whom. Justification is dropped with them — it stretches
              a short turn across the full column. Single-statement items are
              unaffected, having no breaks to preserve. */}
          <p className="m-0 whitespace-pre-line text-[17px] leading-[1.5]">
            {question.statement}
          </p>
        </div>

        <div
          role="radiogroup"
          aria-label="Choose what this argument is"
          className="mb-4 flex flex-col gap-2"
        >
          {question.optionIds.map((id) => {
            const tactic = getTactic(id);
            const isSelected = selected === id;
            const isAnswer = id === question.answerId;

            return (
              <div key={id} className={rowClass({ submitted, isSelected, isAnswer })}>
                <label className="radio flex-1">
                  <input
                    type="radio"
                    name="quiz-option"
                    value={id}
                    checked={isSelected}
                    disabled={submitted}
                    onChange={() => onSelect(id)}
                  />
                  <span className="dot" />
                  {tactic.name}
                </label>

                {submitted && isAnswer && (
                  <span className="tag tag-outline inline-flex items-center gap-[5px]">
                    <Check size={12} aria-hidden="true" />
                    Correct answer
                  </span>
                )}

                {submitted && isSelected && !isAnswer && (
                  <span className="tag tag-neutral inline-flex items-center gap-[5px]">
                    <X size={12} aria-hidden="true" />
                    Your answer
                  </span>
                )}

                {showLearnCta && id !== "valid" && (
                  <button
                    type="button"
                    className="btn btn-ghost"
                    onClick={() => onOpenDefinition(id)}
                  >
                    What does this mean?
                    <span className="sr-only"> — {tactic.name}</span>
                  </button>
                )}
              </div>
            );
          })}
        </div>

        {submitted && lastAnswer && (
          <div className="card fade-in mb-4" role="status" aria-live="polite">
            <div className="card-kicker">
              {lastAnswer.isCorrect ? "Correct" : "Not quite"}
            </div>
            <div className="card-title">
              {lastAnswer.isCorrect ? "That's right." : "Not quite — here's why."}
            </div>
            <p className="card-body text-justify text-[14px] opacity-100">
              {question.explanation}
            </p>
          </div>
        )}

        <div className="flex justify-end">
          <button
            type="button"
            className="btn btn-primary"
            disabled={isPrimaryDisabled(state)}
            onClick={onPrimary}
          >
            {primaryLabel(state)}
            <ArrowRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    </main>
  );
}

interface RowStateProps {
  submitted: boolean;
  isSelected: boolean;
  isAnswer: boolean;
}

function rowClass({ submitted, isSelected, isAnswer }: RowStateProps): string {
  if (submitted) {
    if (isAnswer) return "option-row option-row-correct";
    if (isSelected) return "option-row option-row-wrong";
    return "option-row";
  }
  return isSelected ? "option-row option-row-selected" : "option-row";
}
