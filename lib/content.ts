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

export function getAllTactics(): Tactic[] {
  return Object.values(TACTICS);
}

export interface RoundOptions {
  /** How many questions to serve. Omit for the whole bank. */
  length?: number;
  /** Deterministic ordering. The same seed always yields the same round. */
  seed?: number;
}

/**
 * A round is however many questions this returns — nothing downstream
 * assumes a fixed count.
 *
 * Ordering is seeded rather than random so the server and client render the
 * same first round and hydration stays quiet. A new seed, generated in an
 * event handler after mount, is what makes a replay different.
 */
export function getRound({ length, seed = 1 }: RoundOptions = {}): Question[] {
  const ordered = shuffle(QUESTIONS, seed);
  return length === undefined ? ordered : ordered.slice(0, length);
}

export function getQuestionCount(): number {
  return QUESTIONS.length;
}

/**
 * Fisher-Yates driven by a mulberry32 PRNG — small, fast and, unlike
 * `Math.random`, reproducible from a seed.
 */
export function shuffle<T>(items: readonly T[], seed: number): T[] {
  const next = mulberry32(seed);
  const out = [...items];
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(next() * (i + 1));
    [out[i], out[j]] = [out[j], out[i]];
  }
  return out;
}

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
