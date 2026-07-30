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
  /**
   * The answer key as an id. The Claude evaluator reads the name and the
   * explanation instead, but the offline grader needs a stable key to look its
   * cue lists up by — a display name would break the moment one is reworded.
   */
  tacticId: TacticId;
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

/**
 * Narrows an unknown value to an `Evaluation`.
 *
 * Used on both sides: the server checks what the model returned, the browser
 * checks what came back over the wire. It lives here, with no dependencies, so
 * a `"use client"` file can import it without dragging the Anthropic SDK into
 * the bundle along with it.
 */
export function isEvaluation(value: unknown): value is Evaluation {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<Evaluation>;
  return (
    typeof v.score === "number" &&
    Number.isInteger(v.score) &&
    v.score >= 0 &&
    v.score <= 5 &&
    typeof v.feedback === "string" &&
    typeof v.identifiedCorrectly === "boolean"
  );
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

/**
 * The two ways to answer a round. `classic` is the Phase 1 multiple-choice
 * flow, unchanged; `rebuttal` is the Phase 2 free-text flow, graded out of
 * five a question.
 */
export type QuizMode = "classic" | "rebuttal";

/**
 * Where the app is above the level of any single round. Welcome and the mode
 * picker are shared; once a mode is chosen the matching flow takes over and
 * runs on its own machine, so nothing here needs to know how a round works.
 */
export type Route =
  | { name: "welcome" }
  | { name: "mode" }
  | { name: "round"; mode: QuizMode };

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

/* ── Rebuttal state (see lib/rebuttal-machine.ts) ─────────────────────── */

/**
 * Where one question is in the write → grade → read cycle. The MCQ flow marks
 * itself with a single `submitted` boolean because its answer is checked
 * locally and instantly; grading is a round trip, so this flow needs a name
 * for the wait — and for the failure, which a boolean cannot express.
 */
export type RebuttalPhase = "writing" | "grading" | "graded";

export interface RebuttalRecord {
  questionId: string;
  /** Verbatim, so the results screen can show them what they wrote. */
  response: string;
  evaluation: Evaluation;
}

export interface RebuttalState {
  /** Reuses the quiz screens; there is no separate welcome inside a round. */
  screen: Extract<Screen, "quiz" | "results">;
  questions: Question[];
  index: number;
  /** What is in the textarea, before it is sent to be graded. */
  draft: string;
  phase: RebuttalPhase;
  /**
   * Set when grading failed. The draft survives, so retrying costs the learner
   * nothing — a network blip must never eat an answer they just wrote.
   */
  error: string | null;
  records: RebuttalRecord[];
}

/** Body of a `POST /api/grade` request. */
export type GradeRequest = RebuttalSubmission;

/** Narrows an unknown parsed JSON body to a grading request. */
export function isGradeRequest(value: unknown): value is GradeRequest {
  if (typeof value !== "object" || value === null) return false;
  const v = value as Partial<GradeRequest>;
  return (
    typeof v.quote === "string" &&
    typeof v.tacticId === "string" &&
    typeof v.tacticName === "string" &&
    typeof v.tacticExplanation === "string" &&
    typeof v.response === "string"
  );
}
