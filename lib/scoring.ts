import { getTactic } from "@/lib/content";
import type { AnswerRecord, QuizState, TacticFamily, TacticId } from "@/lib/types";

/**
 * Scoring, as pure functions.
 *
 * The summary exists to tell someone what to practise next, not to rank them.
 * That's why `missedTactics` is the part that matters and the headline
 * fraction is deliberately undramatic.
 *
 * `RoundScore` rather than `Score` deliberately: `Score` in `lib/types.ts` is
 * the 0-5 rubric grade for a single rebuttal, which is a different thing.
 */

export interface FamilyBreakdown {
  family: TacticFamily;
  correct: number;
  total: number;
}

export interface RoundScore {
  correct: number;
  total: number;
  /** 0-100, rounded. `0` for an empty round rather than NaN. */
  percentage: number;
  byFamily: FamilyBreakdown[];
  /** The answers that were missed, by the tactic that was actually at work. */
  missedTactics: TacticId[];
}

const FAMILY_ORDER: TacticFamily[] = [
  "logical-fallacy",
  "emotional-manipulation",
  "rhetorical-trick",
];

export function scoreRound(state: QuizState): RoundScore {
  const { answers } = state;
  const correct = answers.filter((a) => a.correct).length;
  const total = answers.length;

  return {
    correct,
    total,
    percentage: total === 0 ? 0 : Math.round((correct / total) * 100),
    byFamily: FAMILY_ORDER.map((family) => {
      const inFamily = answers.filter((a) => familyOf(state, a) === family);
      return {
        family,
        correct: inFamily.filter((a) => a.correct).length,
        total: inFamily.length,
      };
    }).filter((row) => row.total > 0),
    missedTactics: answers
      .filter((a) => !a.correct)
      .map((a) => answerIdFor(state, a))
      .filter((id): id is TacticId => id !== null),
  };
}

/**
 * A closing line. Phrased around what to do next rather than how well they
 * did — the product's job is to leave someone equipped, not graded.
 */
export function verdict(score: RoundScore): string {
  if (score.total === 0) return "Nothing answered yet.";
  if (score.correct === score.total) {
    return "Every one named correctly. Try a fresh round — the harder questions turn up in a different order.";
  }
  if (score.percentage >= 60) {
    return "A solid round. The ones below are worth a second look before you move on.";
  }
  return "Plenty to work with here. Re-read the two or three below and the next round will feel different.";
}

function answerIdFor(state: QuizState, answer: AnswerRecord): TacticId | null {
  return state.questions.find((q) => q.id === answer.questionId)?.answerId ?? null;
}

function familyOf(state: QuizState, answer: AnswerRecord): TacticFamily | null {
  const id = answerIdFor(state, answer);
  return id === null ? null : getTactic(id).family;
}
