import { evaluateRebuttal } from "./evaluator";
import { mockGradeRebuttal } from "./mock-grader";
import { GRADER_CONFIG } from "./config";
import type { Evaluation, RebuttalSubmission } from "./types";

/**
 * The one door onto grading, matching the pattern `lib/content.ts` sets for
 * content: callers ask here and never reach for an implementation directly.
 *
 * Two exist. `offline` is a keyword grader that needs no key and no network;
 * `claude` is the real thing in `lib/evaluator.ts`. Flip `GRADER_CONFIG.mode`
 * to move between them — nothing else changes, because both satisfy the same
 * signature and return the same `Evaluation`.
 *
 * Server-side only: the `claude` branch reads the API key.
 */
export function gradeRebuttal(
  submission: RebuttalSubmission,
  signal?: AbortSignal,
): Promise<Evaluation> {
  return GRADER_CONFIG.mode === "claude"
    ? evaluateRebuttal(submission, signal)
    : mockGradeRebuttal(submission, signal);
}
