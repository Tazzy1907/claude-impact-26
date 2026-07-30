import { RotateCcw, Shuffle } from "lucide-react";
import { ScoreMark } from "@/components/rebuttal/ScoreMark";
import {
  rebuttalReviewRows,
  rebuttalScoreMessage,
  scoreRebuttalRound,
  type RebuttalReviewRow,
} from "@/lib/scoring";
import type { RebuttalState } from "@/lib/types";

/**
 * The closing screen for the free-text round: the total out of twenty-five, a
 * sentence about it, and every answer back with its mark and its feedback.
 *
 * Always detailed, with no `reviewDetail` switch. A chip saying "3 / 5" would
 * throw away the feedback, and the feedback is the only reason to have written
 * a paragraph rather than ticked a box.
 */

interface RebuttalResultsScreenProps {
  state: RebuttalState;
  onRestart: () => void;
  onChangeMode: () => void;
}

export function RebuttalResultsScreen({
  state,
  onRestart,
  onChangeMode,
}: RebuttalResultsScreenProps) {
  const score = scoreRebuttalRound(state);
  const rows = rebuttalReviewRows(state);

  return (
    <main className="flex flex-1 justify-center px-4 py-8">
      <div className="w-full max-w-[640px]">
        <div className="card-kicker">Round complete</div>
        <h2 className="mt-2">Your results</h2>

        <div className="mt-3 mb-1 flex items-baseline gap-[10px]">
          <span className="score-figure">{score.points}</span>
          <span className="text-[20px] opacity-60">/ {score.max}</span>
        </div>
        <p>{rebuttalScoreMessage(score)}</p>

        <div className="hr" />

        <div className="mb-6 flex flex-col gap-3">
          {rows.map((row) => (
            <ReviewCard key={row.questionId} row={row} />
          ))}
        </div>

        <button type="button" className="btn btn-primary btn-block" onClick={onRestart}>
          Start again
          <RotateCcw size={14} aria-hidden="true" />
        </button>

        <button type="button" className="btn btn-secondary btn-block" onClick={onChangeMode}>
          Try the other way
          <Shuffle size={14} aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}

function ReviewCard({ row }: { row: RebuttalReviewRow }) {
  return (
    <div className="card">
      <div className="mb-2 flex items-baseline justify-between gap-3">
        <div className="card-kicker m-0">{row.qLabel}</div>
        <ScoreMark score={row.evaluation.score} />
      </div>

      <p className="mt-0 mb-2 text-justify text-[14px] opacity-85">{row.statement}</p>

      <div className="text-[13px]">
        <div className="card-kicker">You wrote</div>
        {/* Their own words, kept verbatim — line breaks and all. */}
        <p className="mt-1 mb-2 whitespace-pre-wrap italic opacity-85">{row.response}</p>
      </div>

      <div className="text-[13px]">
        The answer: <strong>{row.tacticLabel}</strong>
      </div>

      <p className="mt-2 mb-0 text-justify text-[13px]">{row.evaluation.feedback}</p>

      {row.showExplanation && (
        <p className="text-muted mt-2 mb-0 text-justify text-[13px]">{row.explanation}</p>
      )}
    </div>
  );
}
