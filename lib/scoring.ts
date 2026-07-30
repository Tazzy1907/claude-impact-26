import { getTactic } from "@/lib/content";
import type { Evaluation, RebuttalState, QuizState } from "@/lib/types";

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

/* ── The free-text round ──────────────────────────────────────────────── */

/**
 * Every rebuttal is marked out of five, so five questions make twenty-five.
 * The ceiling is derived rather than written down anywhere, so a longer or
 * shorter bank still totals correctly.
 */
export const POINTS_PER_REBUTTAL = 5;

export interface RebuttalRoundScore {
  points: number;
  max: number;
}

export function scoreRebuttalRound(state: RebuttalState): RebuttalRoundScore {
  return {
    points: pointsSoFar(state),
    max: state.questions.length * POINTS_PER_REBUTTAL,
  };
}

/** Points banked so far, for the running total beside the progress bar. */
export function pointsSoFar(state: RebuttalState): number {
  return state.records.reduce((sum, record) => sum + record.evaluation.score, 0);
}

/**
 * The closing line. Keyed off the proportion earned rather than an absolute,
 * for the same reason the ceiling is derived — and pitched at the reasoning,
 * since that is what this round actually measured.
 */
export function rebuttalScoreMessage({ points, max }: RebuttalRoundScore): string {
  if (max === 0) return "";

  const share = points / max;
  if (share === 1) return "Full marks — named, explained, and tied to the words each time.";
  if (share >= 0.8) return "Strong round — you're articulating these, not just sensing them.";
  if (share >= 0.6) return "Solid — you're spotting them. Tightening the why is what's left.";
  if (share >= 0.4) return "Getting there — you saw something in most of these. Now name it.";
  if (share > 0) return "Early days, and that's fine — the vocabulary is the part that comes with practice.";
  return "Everyone starts somewhere — worth another pass with the definitions open.";
}

/**
 * Below a 3 the grader names the tactic and its mechanism outright, which
 * means quoting the answer key verbatim — so printing the explanation
 * underneath the feedback would say the same thing twice. Checked rather than
 * keyed off the score, because the Claude grader paraphrases and the offline
 * one doesn't.
 */
export function explanationAddsAnything(feedback: string, explanation: string): boolean {
  return !feedback.includes(explanation);
}

export interface RebuttalReviewRow {
  questionId: string;
  qLabel: string;
  statement: string;
  /** What the learner wrote, verbatim. */
  response: string;
  evaluation: Evaluation;
  /** The answer key's name, so they can see what it was called. */
  tacticLabel: string;
  /** Why the answer is what it is — the same text the MCQ flow shows. */
  explanation: string;
  /** False when the feedback already said it. */
  showExplanation: boolean;
}

export function rebuttalReviewRows(state: RebuttalState): RebuttalReviewRow[] {
  return state.records.flatMap((record, i) => {
    const question = state.questions.find((q) => q.id === record.questionId);
    if (!question) return [];

    return [
      {
        questionId: question.id,
        qLabel: `Question ${i + 1}`,
        statement: question.statement,
        response: record.response,
        evaluation: record.evaluation,
        tacticLabel: getTactic(question.answerId).name,
        explanation: question.explanation,
        showExplanation: explanationAddsAnything(
          record.evaluation.feedback,
          question.explanation,
        ),
      },
    ];
  });
}
