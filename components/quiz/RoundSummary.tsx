import { RotateCcw } from "lucide-react";
import { FAMILY_LABELS } from "@/content/tactics";
import { getTactic } from "@/lib/content";
import { verdict, type RoundScore } from "@/lib/scoring";

interface RoundSummaryProps {
  score: RoundScore;
  onRestart: () => void;
}

/**
 * The end of a round. The fraction is deliberately quiet and the tactics to
 * revisit carry the page — someone should leave with something to practise,
 * not a grade.
 */
export function RoundSummary({ score, onRestart }: RoundSummaryProps) {
  const revisit = [...new Set(score.missedTactics)].map(getTactic);

  return (
    <section className="flex flex-col gap-6" aria-labelledby="summary-heading">
      <header>
        <p className="card-kicker">Round complete</p>
        <h2 id="summary-heading" className="m-0">
          <span className="tnum">{score.correct}</span> of{" "}
          <span className="tnum">{score.total}</span> named correctly
        </h2>
        <p className="text-muted m-0 mt-2 text-[14px]">{verdict(score)}</p>
      </header>

      {score.byFamily.length > 0 && (
        <table className="table">
          <caption className="sr-only">Your score by tactic family</caption>
          <thead>
            <tr>
              <th scope="col">Family</th>
              <th scope="col" className="text-right">
                Correct
              </th>
            </tr>
          </thead>
          <tbody>
            {score.byFamily.map((row) => (
              <tr key={row.family}>
                <th scope="row" className="p-2 text-left font-normal">
                  {FAMILY_LABELS[row.family]}
                </th>
                <td className="tnum text-right">
                  {row.correct} / {row.total}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {revisit.length > 0 && (
        <div className="flex flex-col gap-3">
          <h3 className="m-0 text-[20px]">Worth a second look</h3>
          {revisit.map((tactic) => (
            <article key={tactic.id} className="card">
              <p className="card-kicker m-0">{FAMILY_LABELS[tactic.family]}</p>
              <h4 className="card-title m-0">{tactic.name}</h4>
              <p className="card-body">{tactic.longDef}</p>
              <p className="m-0 text-[13px]">
                <span className="text-muted">If it&rsquo;s used on you: </span>
                {tactic.counterMove}
              </p>
            </article>
          ))}
        </div>
      )}

      <div>
        <button type="button" className="btn btn-primary" onClick={onRestart}>
          <RotateCcw size={16} aria-hidden="true" />
          Start a new round
        </button>
      </div>
    </section>
  );
}
