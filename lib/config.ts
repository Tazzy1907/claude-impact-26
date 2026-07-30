/**
 * The design file exposes three switches as Claude Design editor props. They
 * are behaviour, not content, so they land here as configuration rather than
 * as component props nobody passes. Defaults match the design's own.
 */
export interface QuizConfig {
  /** Show the "What does this mean?" button beside each fallacy option. */
  showLearnCta: boolean;
  /**
   * `detailed` — one card per question, with statement and explanation.
   * `summary`  — a row of compact pass/fail chips.
   */
  reviewDetail: "detailed" | "summary";
  /** Re-order the bank when starting again. Off by default. */
  shuffleOnRestart: boolean;
}

export const QUIZ_CONFIG: QuizConfig = {
  showLearnCta: true,
  reviewDetail: "detailed",
  shuffleOnRestart: false,
};

/**
 * Which grader the free-text flow runs on. See `lib/grader.ts`.
 *
 * `offline` is the default for the same reason Phase 1 ships static content: a
 * demo shouldn't fall over because a key is missing or the network is slow.
 * Set `claude` — with `ANTHROPIC_API_KEY` in `.env.local` — for real grading.
 */
export interface GraderConfig {
  mode: "offline" | "claude";
}

export const GRADER_CONFIG: GraderConfig = {
  mode: "offline",
};
