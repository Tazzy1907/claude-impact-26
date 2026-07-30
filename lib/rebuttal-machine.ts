import type {
  Evaluation,
  Question,
  RebuttalState,
  RebuttalSubmission,
} from "@/lib/types";

/**
 * State transitions for the free-text round, as pure functions — the same
 * contract `lib/quiz-machine.ts` holds, and testable the same way.
 *
 * The shape differs from the MCQ machine in one respect that matters: grading
 * is asynchronous, so a question passes through `writing → grading → graded`
 * rather than flipping a boolean. The request itself belongs to the component;
 * everything here stays pure, and the result comes back in through
 * `recordEvaluation` or `failGrading`.
 *
 * Illegal transitions return the state unchanged rather than throwing, so a
 * double-submit can't grade the same answer twice or corrupt a round.
 */

export function initialRebuttalState(questions: Question[]): RebuttalState {
  return {
    screen: "quiz",
    questions,
    index: 0,
    draft: "",
    phase: "writing",
    error: null,
    records: [],
  };
}

export function currentQuestion(state: RebuttalState): Question | null {
  return state.questions[state.index] ?? null;
}

/** Typing. Locked once the answer is away, so the graded text can't drift. */
export function setDraft(state: RebuttalState, draft: string): RebuttalState {
  if (state.phase !== "writing") return state;
  return { ...state, draft };
}

/**
 * Hand the answer off for grading. Clears any previous error so a retry
 * doesn't show the last failure underneath the spinner.
 */
export function beginGrading(state: RebuttalState): RebuttalState {
  if (state.phase !== "writing" || !canSubmit(state)) return state;
  return { ...state, phase: "grading", error: null };
}

export function recordEvaluation(
  state: RebuttalState,
  evaluation: Evaluation,
): RebuttalState {
  const question = currentQuestion(state);
  if (state.phase !== "grading" || !question) return state;

  return {
    ...state,
    phase: "graded",
    records: [
      ...state.records,
      { questionId: question.id, response: state.draft.trim(), evaluation },
    ],
  };
}

/**
 * Grading failed. Back to `writing` with the draft intact — the learner keeps
 * what they wrote and the submit button becomes a retry.
 */
export function failGrading(state: RebuttalState, message: string): RebuttalState {
  if (state.phase !== "grading") return state;
  return { ...state, phase: "writing", error: message };
}

/** Past the feedback to the next question, or to the results screen. */
export function advance(state: RebuttalState): RebuttalState {
  if (state.phase !== "graded") return state;

  if (isLastQuestion(state)) {
    return { ...state, screen: "results" };
  }

  return {
    ...state,
    index: state.index + 1,
    draft: "",
    phase: "writing",
    error: null,
  };
}

/** What the one primary button does, which depends on where you are. */
export function primaryAction(state: RebuttalState): RebuttalState {
  return state.phase === "graded" ? advance(state) : beginGrading(state);
}

export function primaryLabel(state: RebuttalState): string {
  switch (state.phase) {
    case "grading":
      return "Grading your answer…";
    case "graded":
      return isLastQuestion(state) ? "See results" : "Next question";
    default:
      return state.error ? "Try again" : "Submit for grading";
  }
}

export function isPrimaryDisabled(state: RebuttalState): boolean {
  if (state.phase === "grading") return true;
  return state.phase === "writing" && !canSubmit(state);
}

/** An empty box is not an answer; everything past that is the grader's call. */
export function canSubmit(state: RebuttalState): boolean {
  return state.draft.trim().length > 0;
}

export function isLastQuestion(state: RebuttalState): boolean {
  return state.index >= state.questions.length - 1;
}

/**
 * 0-100 for the bar under the header. A graded question counts as done, so the
 * bar moves on the grade landing rather than only on advancing.
 */
export function progressPercent(state: RebuttalState): number {
  const total = state.questions.length;
  if (total === 0) return 100;
  return Math.round(((state.index + (state.phase === "graded" ? 1 : 0)) / total) * 100);
}

/**
 * The payload for `POST /api/grade`. Built here rather than in the component so
 * the answer key travels with the submission by construction — the grader can't
 * be asked to mark an answer without being told what the answer was.
 */
export function buildSubmission(
  state: RebuttalState,
  tacticName: string,
): RebuttalSubmission | null {
  const question = currentQuestion(state);
  if (!question) return null;

  return {
    quote: question.statement,
    tacticId: question.answerId,
    tacticName,
    tacticExplanation: question.explanation,
    response: state.draft.trim(),
  };
}
