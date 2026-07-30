interface ProgressRuleProps {
  /** 0-1. */
  value: number;
  current: number;
  total: number;
}

/**
 * Progress as a filling hairline. Classical builds structure out of rules,
 * so the indicator is one rather than a bar sitting on top of the page.
 */
export function ProgressRule({ value, current, total }: ProgressRuleProps) {
  const percent = Math.round(value * 100);

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-baseline justify-between">
        <span className="text-muted tnum text-[11px] uppercase tracking-[0.08em]">
          Question {current} of {total}
        </span>
        <span className="text-muted tnum text-[11px]">{percent}%</span>
      </div>

      <div
        className="progress"
        role="progressbar"
        aria-valuenow={percent}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Round progress"
      >
        <div className="progress-fill" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}
