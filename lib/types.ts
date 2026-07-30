/**
 * Shared types used by both the browser and the server.
 *
 * `Message` is intentionally shaped like Anthropic's `MessageParam` so a
 * conversation can be passed straight to the API without remapping it.
 */

export type Role = "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
}

/** Body of a `POST /api/chat` request. */
export interface ChatRequest {
  messages: Message[];
}

/** Narrows an unknown parsed JSON body to a `ChatRequest`. */
export function isChatRequest(value: unknown): value is ChatRequest {
  if (typeof value !== "object" || value === null) return false;
  const { messages } = value as { messages?: unknown };
  return (
    Array.isArray(messages) &&
    messages.every(
      (m) =>
        typeof m === "object" &&
        m !== null &&
        ((m as Message).role === "user" || (m as Message).role === "assistant") &&
        typeof (m as Message).content === "string",
    )
  );
}

/* -------------------------------------------------------------------------
 * Rebuttal evaluation — free-text practice, graded by Claude.
 * ---------------------------------------------------------------------- */

/** 0–5 inclusive. See the rubric in `lib/evaluator.ts` for what each means. */
export type Score = 0 | 1 | 2 | 3 | 4 | 5;

/** What the evaluator is given: the quote, the answer key, and the attempt. */
export interface RebuttalSubmission {
  /** The manipulative line the learner was shown. */
  quote: string;
  /** Display name of the tactic it uses, e.g. "Ad hominem". */
  tacticName: string;
  /** Why the quote is an instance of that tactic — the answer key. */
  tacticExplanation: string;
  /** What the learner wrote. Untrusted input. */
  response: string;
}

export interface Evaluation {
  score: Score;
  /** Two or three sentences addressed to the learner. */
  feedback: string;
  /**
   * Whether they correctly worked out what was wrong, independent of how well
   * they argued it. Kept separate from `score` so progress tracking can ask
   * "can they spot it yet?" without conflating that with rebuttal quality.
   */
  identifiedCorrectly: boolean;
}
