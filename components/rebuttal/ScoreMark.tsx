import { POINTS_PER_REBUTTAL } from "@/lib/scoring";

/**
 * One rebuttal's mark. The figure is the reading; the pips beside it are a
 * glanceable second encoding of the same number, never a substitute for it.
 */
export function ScoreMark({ score }: { score: number }) {
  return (
    <span className="flex items-center gap-3">
      <span className="score-mark">
        {score}
        <span className="text-[13px] font-normal opacity-60"> / {POINTS_PER_REBUTTAL}</span>
      </span>

      <span className="score-pips" aria-hidden="true">
        {Array.from({ length: POINTS_PER_REBUTTAL }, (_, i) => (
          <span key={i} className={i < score ? "pip pip-filled" : "pip"} />
        ))}
      </span>
    </span>
  );
}
