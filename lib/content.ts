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
