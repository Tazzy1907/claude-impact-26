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
 * Permanent identifiers. A display name may be reworded freely; changing an
 * id silently invalidates every question that references it.
 */
export type TacticId =
  // Logical fallacies
  | "ad-hominem"
  | "straw-man"
  | "false-dilemma"
  | "slippery-slope"
  | "hasty-generalisation"
  | "false-cause"
  | "circular-reasoning"
  | "whataboutism"
  | "appeal-to-authority"
  | "no-true-scotsman"
  // Emotional manipulation
  | "appeal-to-fear"
  | "appeal-to-outrage"
  | "guilt-tripping"
  | "gaslighting"
  | "darvo"
  // Rhetorical tricks
  | "loaded-question"
  | "loaded-language"
  | "bandwagon"
  | "motte-and-bailey"
  | "cherry-picking"
  | "gish-gallop"
  | "sealioning";

export type TacticFamily =
  | "logical-fallacy"
  | "emotional-manipulation"
  | "rhetorical-trick";

export interface Tactic {
  id: TacticId;
  /** Display name, e.g. "Straw Man". */
  name: string;
  family: TacticFamily;
  /** <= 15 words, shown in the hover/tap definition. */
  shortDef: string;
  /** 2-3 sentences, shown after answering. */
  longDef: string;
  /** One canonical line, distinct from any quote in the bank. */
  example: string;
  /** What you can actually say when it's used on you. */
  counterMove: string;
}

export type Difficulty = 1 | 2 | 3;

export interface Question {
  id: string;
  /** The thing a person says. */
  quote: string;
  /** Sets the scene, e.g. "Reply under a news post". Never names a real person. */
  context: string;
  /** Display order is shuffled at runtime. */
  optionIds: [TacticId, TacticId, TacticId, TacticId];
  /** Must be one of `optionIds`. */
  answerId: TacticId;
  /** Why the answer is right, grounded in the quote's wording. */
  explanation: string;
  /** Why each wrong option is wrong *here*. */
  distractorNotes: Partial<Record<TacticId, string>>;
  /** One sentence the user could say back. */
  rebuttal: string;
  difficulty: Difficulty;
}

/* ── Quiz state (see lib/quiz-machine.ts) ─────────────────────────────── */

/**
 * `answering` — the question is live and nothing is committed.
 * `revealed`  — a pick is locked in and the teaching panel is showing.
 * `complete`  — the round is over and the summary is showing.
 */
export type QuizPhase = "answering" | "revealed" | "complete";

export interface AnswerRecord {
  questionId: string;
  pickedId: TacticId;
  correct: boolean;
}

export interface QuizState {
  /** The round. However many questions the content module handed over. */
  questions: Question[];
  index: number;
  /** The pick for the current question, once made. */
  pickedId: TacticId | null;
  answers: AnswerRecord[];
  phase: QuizPhase;
}
