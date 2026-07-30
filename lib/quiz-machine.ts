import { shuffle } from "@/lib/content";
import type { Question, QuizState, TacticId } from "@/lib/types";

/**
 * Quiz state transitions, as pure functions. No React, no DOM — every one of
 * these can be exercised without rendering anything.
 *
 * Each returns a new state; none mutates its input. Illegal transitions (a
 * second pick, advancing before revealing) return the state unchanged rather
 * than throwing, so a double-click can't corrupt a round.
 */

export function startRound(questions: Question[]): QuizState {
  return {
    questions,
    index: 0,
    pickedId: null,
    answers: [],
    phase: questions.length === 0 ? "complete" : "answering",
  };
}

export function currentQuestion(state: QuizState): Question | null {
  return state.questions[state.index] ?? null;
}

/** Commit an answer and reveal the teaching panel. */
export function pick(state: QuizState, pickedId: TacticId): QuizState {
  if (state.phase !== "answering") return state;

  const question = currentQuestion(state);
  if (!question) return state;
  // Guard against a pick for an option this question doesn't offer.
  if (!question.optionIds.includes(pickedId)) return state;

  return {
    ...state,
    pickedId,
    phase: "revealed",
    answers: [
      ...state.answers,
      {
        questionId: question.id,
        pickedId,
        correct: pickedId === question.answerId,
      },
    ],
  };
}

/** Move past the reveal to the next question, or to the summary. */
export function advance(state: QuizState): QuizState {
  if (state.phase !== "revealed") return state;

  const nextIndex = state.index + 1;
  const done = nextIndex >= state.questions.length;

  return {
    ...state,
    index: done ? state.index : nextIndex,
    pickedId: null,
    phase: done ? "complete" : "answering",
  };
}

/**
 * Option display order. Seeded off the question id so a given question always
 * presents its options the same way — the correct answer can't be inferred
 * from position, and server and client agree at hydration.
 */
export function optionOrder(question: Question): TacticId[] {
  return shuffle(question.optionIds, hashString(question.id));
}

/** Progress as a 0-1 fraction, for the rule under the header. */
export function progress(state: QuizState): number {
  if (state.questions.length === 0) return 1;
  const done = state.phase === "complete" ? state.questions.length : state.answers.length;
  return done / state.questions.length;
}

/** FNV-1a. Any stable string-to-int would do; this one is short and spreads well. */
function hashString(value: string): number {
  let hash = 0x811c9dc5;
  for (let i = 0; i < value.length; i++) {
    hash ^= value.charCodeAt(i);
    hash = Math.imul(hash, 0x01000193);
  }
  return hash >>> 0;
}
