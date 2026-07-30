import { AlertCircle, ArrowRight } from "lucide-react";
import { REBUTTAL_PROMPT } from "@/content/modes";
import { ScoreMark } from "@/components/rebuttal/ScoreMark";
import { getTactic } from "@/lib/content";
import {
  currentQuestion,
  isPrimaryDisabled,
  primaryLabel,
  progressPercent,
} from "@/lib/rebuttal-machine";
import { explanationAddsAnything, pointsSoFar } from "@/lib/scoring";
import type { RebuttalState, TacticId } from "@/lib/types";

/**
 * The free-text question screen. Same furniture as the MCQ screen — progress,
 * the argument, one primary button — with the options replaced by a box and
 * the instant answer check replaced by a graded reveal.
 */

interface RebuttalScreenProps {
  state: RebuttalState;
  showLearnCta: boolean;
  onDraftChange: (draft: string) => void;
  onPrimary: () => void;
  onOpenDefinition: (id: TacticId) => void;
}

export function RebuttalScreen({
  state,
  showLearnCta,
  onDraftChange,
  onPrimary,
  onOpenDefinition,
}: RebuttalScreenProps) {
  const question = currentQuestion(state);
  if (!question) return null;

  const { phase, error } = state;
  const isGrading = phase === "grading";
  const questionNumber = state.index + 1;
  const total = state.questions.length;
  const record = state.records[state.records.length - 1];
  const answer = getTactic(question.answerId);

  return (
    <main className="flex flex-1 justify-center px-4 py-8">
      <div className="w-full max-w-[640px]">
        <div className="mb-2 flex items-baseline justify-between">
          <span className="font-heading text-accent text-[12px] font-semibold tracking-[.06em] uppercase">
            Question {questionNumber} of {total}
          </span>
          <span className="text-muted text-[12px]">
            Points so far: {pointsSoFar(state)}
          </span>
        </div>

        <div
          role="progressbar"
          aria-label="Round progress"
          aria-valuenow={questionNumber}
          aria-valuemin={1}
          aria-valuemax={total}
          className="progress-track mb-6"
        >
          <div className="progress-bar" style={{ width: `${progressPercent(state)}%` }} />
        </div>

        <div className="card mb-4 p-4">
          <div className="card-kicker">The argument</div>
          {/* Two-speaker items put each turn on its own line and the breaks are
              load-bearing, exactly as on the MCQ screen. Justification goes
              with them — it stretches a short turn across the full column. */}
          <p className="m-0 whitespace-pre-line text-[17px] leading-[1.5]">
            {question.statement}
          </p>
        </div>

        <div className="field mb-4">
          <label htmlFor="rebuttal">{REBUTTAL_PROMPT.label}</label>
          <p className="text-muted mt-0 mb-2 text-[13px]">{REBUTTAL_PROMPT.hint}</p>

          <textarea
            id="rebuttal"
            className="input"
            rows={5}
            value={state.draft}
            placeholder={REBUTTAL_PROMPT.placeholder}
            // Locked from the moment it's sent, so the text that gets graded is
            // the text they're looking at.
            readOnly={phase !== "writing"}
            aria-describedby="rebuttal-status"
            onChange={(event) => onDraftChange(event.target.value)}
          />

          {/* One live region for both the wait and the failure. The wait is
              announced but not drawn: the primary button already says
              "Grading your answer…", and printing it twice reads as a glitch.
              A failure is drawn, because the button only says "Try again". */}
          <div id="rebuttal-status" role="status" aria-live="polite" className="mt-2">
            {isGrading && <span className="sr-only">Grading your answer…</span>}
            {error && (
              <span className="text-accent flex items-center gap-[6px] text-[13px]">
                <AlertCircle size={13} aria-hidden="true" className="flex-none" />
                {error}
              </span>
            )}
          </div>
        </div>

        {phase === "graded" && record && (
          <div className="card fade-in mb-4">
            <div className="mb-2 flex items-baseline justify-between gap-3">
              <div className="card-kicker m-0">Your mark</div>
              <ScoreMark score={record.evaluation.score} />
            </div>

            <p className="card-body text-justify text-[14px] opacity-100">
              {record.evaluation.feedback}
            </p>

            <div className="hr my-3" />

            <div className="flex flex-wrap items-center gap-2 text-[13px]">
              <span>
                The answer: <strong>{answer.name}</strong>
              </span>
              {showLearnCta && question.answerId !== "valid" && (
                <button
                  type="button"
                  className="btn btn-ghost"
                  onClick={() => onOpenDefinition(question.answerId)}
                >
                  What does this mean?
                  <span className="sr-only"> — {answer.name}</span>
                </button>
              )}
            </div>

            {explanationAddsAnything(record.evaluation.feedback, question.explanation) && (
              <p className="text-muted mt-2 mb-0 text-justify text-[13px]">
                {question.explanation}
              </p>
            )}
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
            {!isGrading && <ArrowRight size={14} aria-hidden="true" />}
          </button>
        </div>
      </div>
    </main>
  );
}
