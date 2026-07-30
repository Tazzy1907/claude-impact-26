import { getTactic } from "@/lib/content";
import type { QuizState } from "@/lib/types";

/**
 * Scoring, as pure functions.
 *
 * `RoundScore` rather than `Score` deliberately: `Score` in `lib/types.ts` is
 * the 0-5 rubric grade for a single rebuttal, which is a different thing.
 */

export interface RoundScore {
  correct: number;
  total: number;
}

export function scoreRound(state: QuizState): RoundScore {
  return {
    correct: state.answers.filter((a) => a.isCorrect).length,
    total: state.questions.length,
  };
}

/** Correct answers so far, for the running count beside the progress bar. */
export function scoreSoFar(state: QuizState): number {
  return state.answers.filter((a) => a.isCorrect).length;
}

/**
 * The closing line. The design keys these off an absolute count out of five;
 * this reproduces every one of those strings exactly while deriving from the
 * number missed, so a longer or shorter bank still gets a sensible sentence.
 */
export function scoreMessage({ correct, total }: RoundScore): string {
  if (total === 0) return "";

  const missed = total - correct;
  if (missed === 0) return "Excellent — you caught every one.";
  if (correct === 0) return "Everyone starts somewhere — worth another pass.";
  if (missed === 1) return "Great work — only one slipped through.";
  if (missed === 2) return "Good progress — a couple worth a second look.";
  return "Getting there — a few patterns to review.";
}

export interface ReviewRow {
  questionId: string;
  qLabel: string;
  statement: string;
  yourAnswerLabel: string;
  correctAnswerLabel: string;
  isCorrect: boolean;
  /** Only worth printing the answer key when they didn't land on it. */
  showCorrect: boolean;
  explanation: string;
}

export function reviewRows(state: QuizState): ReviewRow[] {
  return state.answers.flatMap((answer, i) => {
    const question = state.questions.find((q) => q.id === answer.questionId);
    if (!question) return [];

    return [
      {
        questionId: question.id,
        qLabel: `Question ${i + 1}`,
        statement: question.statement,
        yourAnswerLabel: getTactic(answer.pickedId).name,
        correctAnswerLabel: getTactic(question.answerId).name,
        isCorrect: answer.isCorrect,
        showCorrect: !answer.isCorrect,
        explanation: question.explanation,
      },
    ];
  });
}
