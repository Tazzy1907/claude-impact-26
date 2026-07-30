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
