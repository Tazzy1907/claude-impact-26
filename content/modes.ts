import type { QuizMode } from "@/lib/types";

/**
 * Copy for the two cards on the mode picker. Here rather than in the component
 * for the same reason the questions are: nothing user-facing is written inline.
 */
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
    scoring: "Scored out of 5",
  },
  {
    id: "rebuttal",
    kicker: "Explain",
    title: "Write the rebuttal",
    detail:
      "No options. Say in your own words what's going on and why it doesn't hold, and a grader marks the reasoning.",
    scoring: "Scored out of 25 — 5 a question",
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
