import type { Question } from "@/lib/types";

/**
 * The question bank, transcribed from the `QUESTIONS` array in the Mindshield
 * design file. Statements, option order, answer keys and explanations are all
 * verbatim: the design is the specification, and option order in particular is
 * data rather than presentation, so nothing shuffles it at runtime.
 */
export const QUESTIONS: Question[] = [
  {
    id: "q1-remote-work",
    statement:
      "My colleague suggested we let employees work from home two days a week. She must think no one should ever set foot in the office again — which would destroy everything about how our team works together.",
    optionIds: ["false-dilemma", "straw-man", "valid", "appeal-to-authority"],
    answerId: "straw-man",
    explanation:
      'The reply exaggerates a modest two-day proposal into "no one should ever come in," then attacks that invented extreme instead of the actual suggestion — the definition of a straw man.',
  },

  {
    id: "q2-bridge-inspection",
    statement:
      "The bridge inspection found corrosion in three support beams. Structural engineers agree that corrosion of this kind reduces load capacity. Given that, the bridge should stay closed until repairs are finished.",
    optionIds: ["valid", "ad-hominem", "slippery-slope", "straw-man"],
    answerId: "valid",
    explanation:
      "Each step follows from evidence: a documented finding, an established engineering fact, and a conclusion that only combines them. No misdirection here — the reasoning holds.",
  },

  {
    id: "q3-arts-budget",
    statement:
      "Either we cut the school's arts program completely, or the entire budget collapses next year — there's no other option on the table.",
    optionIds: ["appeal-to-authority", "valid", "false-dilemma", "slippery-slope"],
    answerId: "false-dilemma",
    explanation:
      'It skips every option between "cut everything" and "collapse" — trimming other line items, phasing cuts, raising funds — and presents only the two extremes as if they were the whole picture.',
  },

  {
    id: "q4-exam-retakes",
    statement:
      "If we let students retake one exam, soon they'll expect to retake every exam, and eventually grades won't mean anything at all.",
    optionIds: ["straw-man", "slippery-slope", "valid", "ad-hominem"],
    answerId: "slippery-slope",
    explanation:
      "It predicts a runaway chain of consequences from one narrow policy change, without showing why retaking one exam must lead to retaking all of them.",
  },

  {
    id: "q5-traffic-safety",
    statement:
      "Don't listen to her proposal on traffic safety — she got a speeding ticket last year, so nothing she says about road rules can be trusted.",
    optionIds: ["false-dilemma", "appeal-to-authority", "valid", "ad-hominem"],
    answerId: "ad-hominem",
    explanation:
      "It dismisses the proposal by attacking her driving record instead of examining whether the proposal itself would make roads safer.",
  },
];
