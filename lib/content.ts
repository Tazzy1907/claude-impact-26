import { QUESTIONS } from "@/content/questions";
import { TACTICS } from "@/content/tactics";
import type { Question, Tactic, TacticId } from "@/lib/types";


/**
 * The single door onto content. Components ask for questions here and never
 * import `content/` directly, so swapping the static bank for a generated or
 * remote one stays a one-file change.
 */

export function getTactic(id: TacticId): Tactic {
  return TACTICS[id];
}

/**
 * The round, in authored order. A round is however many questions this
 * returns — nothing downstream assumes a fixed count.
 *
 * Order is stable rather than random so the server and the client render the
 * same first question and hydration stays quiet. `shuffleQuestions` is the
 * opt-in exception, and only ever runs from an event handler.
 */
export function getQuestions(): Question[] {
  return QUESTIONS;
}

/**
 * Fisher-Yates. Call only from an event handler — using `Math.random` during
 * render would make the server and client disagree.
 */
export function shuffleQuestions(questions: readonly Question[]): Question[] {
  const out = [...questions];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

/** How many questions one round serves, drawn from the full bank. */
export const ROUND_SIZE = 5;

/**
 * Every answer the quiz can ask for, in the order slots are reserved.
 *
 * The three fallacies come first because a round is meant to exercise each of
 * them. `valid` is reserved next rather than left to chance: it is the item
 * that asks "is this even wrong?", and a round drawn without one quietly
 * becomes a round where the answer is always a fallacy.
 */
const GUARANTEED: readonly TacticId[] = [
  "ad-hominem",
  "straw-man",
  "false-dilemma",
  "valid",
];

/**
 * A round: `ROUND_SIZE` questions drawn from the bank, holding one of each
 * fallacy and one sound argument, with any remaining slots filled at random.
 *
 * The result is shuffled before it is returned. Without that the guaranteed
 * picks would appear in the order they were reserved, and question three would
 * always be a false dilemma.
 *
 * Call only from an event handler — see `shuffleQuestions`. The welcome screen
 * exists before any round does, which is what makes that easy to honour.
 */
export function pickRound(): Question[] {
  const remaining = shuffleQuestions(QUESTIONS);
  const picked: Question[] = [];

  for (const tacticId of GUARANTEED) {
    if (picked.length >= ROUND_SIZE) break;
    const index = remaining.findIndex((question) => question.answerId === tacticId);
    // A bank with none of a given answer is not an error — it just cannot
    // reserve a slot for one, and the round fills from what does exist.
    if (index !== -1) picked.push(...remaining.splice(index, 1));
  }

  picked.push(...remaining.slice(0, Math.max(0, ROUND_SIZE - picked.length)));

  return shuffleQuestions(picked);
}
