import type { Question, QuizState, TacticId } from "@/lib/types";

/**
 * Quiz state transitions, as pure functions. No React, no DOM — every one of
 * these can be exercised without rendering anything.
 *
 * Each returns a new state; none mutates its input. Illegal transitions (a
 * second submit, selecting after the answer is locked) return the state
 * unchanged rather than throwing, so a double-click can't corrupt a round.
 *
 * The shape mirrors the state machine in the Mindshield design file: three
 * screens, and within the quiz screen a two-step select-then-submit cycle.
 */

export function initialState(questions: Question[]): QuizState {
  return {
    screen: "welcome",
    questions,
    index: 0,
    selected: null,
    submitted: false,
    answers: [],
  };
}

/** Welcome → quiz. Also the reset used by "Start again". */
export function startQuiz(state: QuizState, questions = state.questions): QuizState {
  return {
    ...state,
    screen: "quiz",
    questions,
    index: 0,
    selected: null,
    submitted: false,
    answers: [],
  };
}

export function currentQuestion(state: QuizState): Question | null {
  return state.questions[state.index] ?? null;
}

/** Move the selection. Ignored once the answer is locked in. */
export function selectOption(state: QuizState, pickedId: TacticId): QuizState {
  if (state.submitted) return state;

  const question = currentQuestion(state);
  // Guard against a pick for an option this question doesn't offer.
  if (!question || !question.optionIds.includes(pickedId)) return state;

  return { ...state, selected: pickedId };
}

/** Lock the selection in and show the feedback card. */
export function submitAnswer(state: QuizState): QuizState {
  const question = currentQuestion(state);
  if (!state.selected || state.submitted || !question) return state;

  return {
    ...state,
    submitted: true,
    answers: [
      ...state.answers,
      {
        questionId: question.id,
        pickedId: state.selected,
        isCorrect: state.selected === question.answerId,
      },
    ],
  };
}

/** Past the feedback to the next question, or to the results screen. */
export function advance(state: QuizState): QuizState {
  if (!state.submitted) return state;

  if (state.index >= state.questions.length - 1) {
    return { ...state, screen: "results" };
  }

  return { ...state, index: state.index + 1, selected: null, submitted: false };
}

/** What the one primary button does, which depends on where you are. */
export function primaryAction(state: QuizState): QuizState {
  return state.submitted ? advance(state) : submitAnswer(state);
}

export function primaryLabel(state: QuizState): string {
  if (!state.submitted) return "Submit answer";
  return isLastQuestion(state) ? "See results" : "Next question";
}

export function isPrimaryDisabled(state: QuizState): boolean {
  return !state.submitted && !state.selected;
}

export function isLastQuestion(state: QuizState): boolean {
  return state.index >= state.questions.length - 1;
}

/**
 * 0-100 for the bar under the header. The submitted question counts as done,
 * so the bar moves on answering rather than only on advancing.
 */
export function progressPercent(state: QuizState): number {
  const total = state.questions.length;
  if (total === 0) return 100;
  return Math.round(((state.index + (state.submitted ? 1 : 0)) / total) * 100);
}
