/**
 * Shared types used by both the browser and the server.
 *
 * Two groups live here and they serve different phases. Chat types belong to
 * the streaming agent seam (Phase 2); quiz types are Phase 1's domain model.
 * Keep them separated.
 */

/* ── Chat (Phase 2 seam — unused by the quiz) ─────────────────────────── */

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

/* ── Rebuttal evaluation — free-text practice, graded by Claude ───────── */

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

/* ── Quiz (Phase 1) ───────────────────────────────────────────────────── */

/**
 * The answer keys the quiz offers. These mirror the `FALLACIES` map in the
 * `Mindshield.dc.html` design exactly — the design is the specification for
 * what ships, so the set is deliberately small. Ids are kebab-case per this
 * repo's convention; they are internal and never rendered.
 *
 * `valid` is not a fallacy. It is the option for an argument whose reasoning
 * actually holds, and it is what stops the quiz from teaching people that
 * every confident-sounding claim must be a trick.
 */
export type TacticId =
  | "straw-man"
  | "false-dilemma"
  | "slippery-slope"
  | "ad-hominem"
  | "appeal-to-authority"
  | "valid";

export interface Tactic {
  id: TacticId;
  /** Display name, e.g. "Straw Man". */
  name: string;
  /** Shown in the definition dialog behind "What does this mean?". */
  def: string;
}

export interface Question {
  id: string;
  /** The argument under examination. Rendered verbatim. */
  statement: string;
  /** Display order is fixed — the design does not shuffle options. */
  optionIds: [TacticId, TacticId, TacticId, TacticId];
  /** Must be one of `optionIds`. */
  answerId: TacticId;
  /** Why the answer is right, grounded in the statement's wording. */
  explanation: string;
}

/* ── Quiz state (see lib/quiz-machine.ts) ─────────────────────────────── */

/** The three screens of the design, in the order they are reached. */
export type Screen = "welcome" | "quiz" | "results";

export interface AnswerRecord {
  questionId: string;
  pickedId: TacticId;
  isCorrect: boolean;
}

export interface QuizState {
  screen: Screen;
  /** The round. However many questions the content module handed over. */
  questions: Question[];
  index: number;
  /** The current selection, before it is committed. */
  selected: TacticId | null;
  /** Whether the current question's answer is locked in and feedback showing. */
  submitted: boolean;
  answers: AnswerRecord[];
}
