import { Check, RotateCcw, X } from "lucide-react";
import type { QuizConfig } from "@/lib/config";
import { reviewRows, scoreMessage, scoreRound, type ReviewRow } from "@/lib/scoring";
import type { QuizState } from "@/lib/types";

/**
 * The closing screen: the figure, a sentence about it, and the review — either
 * a card per question or a row of chips, per `reviewDetail`.
 */

interface ResultsScreenProps {
  state: QuizState;
  reviewDetail: QuizConfig["reviewDetail"];
  onRestart: () => void;
}

export function ResultsScreen({ state, reviewDetail, onRestart }: ResultsScreenProps) {
  const score = scoreRound(state);
  const rows = reviewRows(state);

  return (
    <main className="flex flex-1 justify-center px-4 py-8">
      <div className="w-full max-w-[640px]">
        <div className="card-kicker">Quiz complete</div>
        <h2 className="mt-2">Your results</h2>

        <div className="mt-3 mb-1 flex items-baseline gap-[10px]">
          <span className="score-figure">{score.correct}</span>
          <span className="text-[20px] opacity-60">/ {score.total}</span>
        </div>
        <p>{scoreMessage(score)}</p>

        <div className="hr" />

        {reviewDetail === "summary" ? (
          <div className="mb-6 flex flex-wrap gap-2">
            {rows.map((row) => (
              <div
                key={row.questionId}
                className={`summary-chip ${
                  row.isCorrect ? "summary-chip-correct" : "summary-chip-wrong"
                }`}
              >
                <span>{row.qLabel}</span>
                <Outcome isCorrect={row.isCorrect} size={12} />
              </div>
            ))}
          </div>
        ) : (
          <div className="mb-6 flex flex-col gap-3">
            {rows.map((row) => (
              <ReviewCard key={row.questionId} row={row} />
            ))}
          </div>
        )}

        <button type="button" className="btn btn-primary btn-block" onClick={onRestart}>
          Start again
          <RotateCcw size={14} aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}

function ReviewCard({ row }: { row: ReviewRow }) {
  return (
    <div className="card">
      <div className="card-kicker">{row.qLabel}</div>
      <p className="mt-0 mb-2 text-justify text-[14px] opacity-85">{row.statement}</p>

      <div className="flex items-center gap-[6px] text-[13px]">
        <Outcome isCorrect={row.isCorrect} size={13} />
        <span>
          Your answer: <strong>{row.yourAnswerLabel}</strong>
        </span>
      </div>

      {row.showCorrect && (
        <div className="mt-[4px] text-[13px]">
          Correct answer: <strong>{row.correctAnswerLabel}</strong>
        </div>
      )}

      <p className="text-muted mt-2 mb-0 text-justify text-[13px]">{row.explanation}</p>
    </div>
  );
}

/**
 * The tick or cross. Carries a text equivalent alongside it — the icon alone
 * would leave the outcome unavailable to a screen reader.
 */
function Outcome({ isCorrect, size }: { isCorrect: boolean; size: number }) {
  const Icon = isCorrect ? Check : X;
  return (
    <>
      <Icon size={size} aria-hidden="true" className="flex-none" />
      <span className="sr-only">{isCorrect ? "Correct." : "Incorrect."}</span>
    </>
  );
}
