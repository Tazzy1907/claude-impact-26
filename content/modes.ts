import { ROUND_SIZE } from "@/lib/content";
import { POINTS_PER_REBUTTAL } from "@/lib/scoring";
import type { QuizMode } from "@/lib/types";

/**
 * Copy for the mode picker. Here rather than in the component for the same
 * reason the questions are: nothing user-facing is written inline.
 *
 * The two figures are derived rather than written down. A round is whatever
 * `pickRound` hands over, and the free-text total follows from that — nothing
 * here should have to be remembered if either number moves.
 */
export const MODE_SCREEN = {
  kicker: "Two ways to practise",
  title: "How do you want to answer?",
  // Phrased so the derived figure never opens the sentence, which would set it
  // as a numeral where the prose wants a word.
  intro: `A round is ${ROUND_SIZE} arguments either way, drawn fresh from the bank. The difference is whether you name the tactic from a list, or say in your own words what's going on.`,
};

export interface ModeOption {
  id: QuizMode;
  kicker: string;
  title: string;
  detail: string;
  /** How the round is marked, stated up front so neither card is a surprise. */
  scoring: string;
}

export const MODES: ModeOption[] = [
  {
    id: "classic",
    kicker: "Recognise",
    title: "Name the tactic",
    detail:
      "Four options a question. Pick the fallacy at play — or say the reasoning holds up — and read why.",
    scoring: `Scored out of ${ROUND_SIZE}`,
  },
  {
    id: "rebuttal",
    kicker: "Explain",
    title: "Write the rebuttal",
    detail:
      "No options. Say in your own words what's going on and why it doesn't hold, and a grader marks the reasoning.",
    scoring: `Scored out of ${ROUND_SIZE * POINTS_PER_REBUTTAL} — ${POINTS_PER_REBUTTAL} a question`,
  },
];

/**
 * The standing prompt above the free-text box. Worded so it fits the questions
 * whose reasoning actually holds as well as the ones that don't — "say why
 * it fails" would quietly tell the learner that every statement is a trick.
 */
export const REBUTTAL_PROMPT = {
  label: "What's going on in this argument?",
  hint: "Name what's happening, say why the reasoning does or doesn't hold, and point at the words that give it away.",
  placeholder: "In your own words…",
};
