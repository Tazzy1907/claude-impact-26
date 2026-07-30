import type { Tactic, TacticId } from "@/lib/types";

/**
 * The answer keys, transcribed from the `FALLACIES` map in the Mindshield
 * design file. Names and definitions are verbatim — the design is the
 * specification for what the user reads.
 *
 * Typed as a total record so the compiler refuses a build in which a
 * `TacticId` exists without a definition behind it.
 */
export const TACTICS: Record<TacticId, Tactic> = {
  "straw-man": {
    id: "straw-man",
    name: "Straw Man",
    def: "Restates someone's position in a weaker, more extreme form, then attacks that invented version instead of what they actually argued.",
  },

  "false-dilemma": {
    id: "false-dilemma",
    name: "False Dilemma",
    def: "Presents only two options or outcomes when other possibilities exist, forcing a choice between extremes.",
  },

  "slippery-slope": {
    id: "slippery-slope",
    name: "Slippery Slope",
    def: "Argues that one small step will inevitably trigger a chain of increasingly extreme consequences, without showing why each step must follow.",
  },

  "ad-hominem": {
    id: "ad-hominem",
    name: "Ad Hominem",
    def: "Attacks the character, motives, or traits of the person making an argument instead of addressing the argument itself.",
  },

  "appeal-to-authority": {
    id: "appeal-to-authority",
    name: "Appeal to Authority",
    def: "Treats a claim as true mainly because an authority said it, even when their expertise isn't relevant or the evidence is thin.",
  },

  /* Not a fallacy, and deliberately the one key with no "What does this
     mean?" affordance in the option list — there is no trick to look up. */
  valid: {
    id: "valid",
    name: "Valid argument",
    def: "The conclusion follows from believable premises with no misdirection at play.",
  },
};
