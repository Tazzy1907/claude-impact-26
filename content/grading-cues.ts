import type { TacticId } from "@/lib/types";

/**
 * The vocabulary the offline grader in `lib/mock-grader.ts` matches against.
 *
 * It lives in `content/` because it is answer-key material — the words that
 * count as recognising a tactic — and because tuning the grader should mean
 * editing a word list, not editing logic. None of it is ever rendered.
 *
 * Matching is case-insensitive and anchored at the start of a word, so a cue
 * of `attack` catches "attacks" and "attacking" but not "counterattack".
 */

export interface TacticCues {
  /**
   * Unmistakable names for this tactic. Only these can convict a learner of
   * naming the *wrong* tactic — the loose cues below are far too broad for
   * that, since "attack" turns up in a perfectly good straw-man answer.
   */
  strong: string[];
  /**
   * Plain-language descriptions of the same move. A learner who writes "she's
   * going after the person, not the point" has demonstrated the skill exactly
   * as well as one who writes "ad hominem", and scores the same.
   */
  loose: string[];
}

export const TACTIC_CUES: Record<TacticId, TacticCues> = {
  "straw-man": {
    strong: ["straw man", "strawman", "straw-man"],
    loose: [
      "never said",
      "didn't say",
      "did not say",
      "not what she said",
      "not what he said",
      "not what they said",
      "not what was said",
      "misrepresent",
      "distort",
      "exaggerat",
      "twist",
      "blew it out of proportion",
      "put words in",
      "different version",
      "weaker version",
      "extreme version",
      "invented",
      "made up",
      "nobody made",
      "nobody said",
      "no one said",
      "that's not the proposal",
      "not the actual",
    ],
  },

  "false-dilemma": {
    strong: [
      "false dilemma",
      "false dichotomy",
      "false choice",
      "either or",
      "either-or",
      "black and white",
      "black or white",
    ],
    loose: [
      "only two",
      "just two",
      "two options",
      "more than two",
      "other options",
      "third option",
      "middle ground",
      "in between",
      "in-between",
      "not the only",
      "there are other",
      "other possibilities",
      "other choices",
      "spectrum",
    ],
  },

  "slippery-slope": {
    strong: ["slippery slope", "slippery-slope", "domino effect", "thin end of the wedge"],
    loose: [
      "chain of",
      "one thing leads",
      "lead to",
      "leads to",
      "escalat",
      "snowball",
      "eventually",
      "inevitab",
      "spiral",
      "no reason it would go that far",
      "jump from",
      "jumps from",
      "worst case",
      "doesn't have to lead",
    ],
  },

  "ad-hominem": {
    strong: ["ad hominem", "ad-hominem", "personal attack", "attacking the person"],
    loose: [
      "attack",
      "about the person",
      "at the person",
      "the person not",
      "going after",
      "the messenger",
      "the speaker",
      "who said it",
      "who they are",
      "character",
      "credibility",
      "hypocri",
      "discredit",
      "smear",
      "their record",
      // For this tactic the plain-language identification *is* a statement of
      // irrelevance, so these have to appear here even though they also read
      // as mechanism language. `readSignals` stops them being paid twice.
      "irrelevant",
      "nothing to do with",
      "doesn't matter",
      "does not matter",
      "no bearing",
    ],
  },

  "appeal-to-authority": {
    strong: [
      "appeal to authority",
      "appeal-to-authority",
      "argument from authority",
      "false authority",
    ],
    loose: [
      "because an expert",
      "just because someone",
      "status",
      "credentials",
      "qualification",
      "title",
      "famous",
      "position of authority",
      "no evidence just",
      "not their field",
      "outside their expertise",
    ],
  },

  /**
   * The one where the learner is meant to say nothing is wrong. Without it the
   * flow would only ever reward suspicion, which is the failure mode the whole
   * product exists to avoid.
   */
  valid: {
    strong: [
      "valid",
      "not a fallacy",
      "no fallacy",
      "nothing wrong",
      "nothing is wrong",
      "no trick",
      "isn't a fallacy",
      "is not a fallacy",
    ],
    loose: [
      "holds up",
      "holds together",
      "sound",
      "reasonable",
      "well reasoned",
      "well-reasoned",
      "follows from",
      "follows logically",
      "each step",
      "makes sense",
      "justified",
      "legitimate",
      "fair conclusion",
      "supported by",
      "evidence supports",
      "conclusion follows",
      "fine",
    ],
  },
};

/**
 * Relational markers — the words people reach for when saying *why* a move
 * makes an argument fail, as opposed to merely naming the move.
 *
 * Mostly disjoint from the cue lists above, because if "exaggerates" counted
 * as both naming the tactic and explaining it, "it exaggerates" alone would
 * score a 4 — and the point of the middle mark is that explaining is a
 * separate act from spotting. Where the two genuinely coincide, as with ad
 * hominem and irrelevance, the phrase is listed in both and `readSignals`
 * discounts it for that tactic only.
 */
export const MECHANISM_CUES: string[] = [
  "because",
  "since",
  "so the",
  "which means",
  "doesn't follow",
  "does not follow",
  "doesn't actually",
  "instead of",
  "rather than",
  "no evidence",
  "without evidence",
  "no proof",
  "doesn't prove",
  "does not prove",
  "proves nothing",
  "prove nothing",
  "proving nothing",
  "says nothing about",
  "doesn't tell",
  "doesn't show",
  "doesn't mean",
  "does not mean",
  "assum",
  "ignore",
  "skips",
  "leaves out",
  "irrelevant",
  "unrelated",
  "beside the point",
  "nothing to do with",
  "doesn't address",
  "does not address",
  "changes the subject",
  "dodges",
  "deflect",
  "avoids the",
  "no link",
  "no connection",
  "even if",
  "whether or not",
  "regardless of",
  "why would",
  "there's no reason",
  "no reason to think",
  "without showing",
  "isn't supported",
  "unsupported",
  "invalid",
  "fails",
  "falls apart",
  "conflate",
  "the real question",
  "the actual question",
  "what matters is",
];

/**
 * Words too common to count as evidence that a learner engaged with the
 * specific statement in front of them. Everything else in a statement that is
 * five characters or longer is treated as distinctive enough to look for.
 */
export const COMMON_WORDS: string[] = [
  "about",
  "after",
  "again",
  "against",
  "along",
  "already",
  "also",
  "although",
  "always",
  "another",
  "anything",
  "around",
  "because",
  "become",
  "been",
  "before",
  "being",
  "below",
  "between",
  "both",
  "cannot",
  "could",
  "doesn",
  "doing",
  "during",
  "each",
  "either",
  "enough",
  "even",
  "ever",
  "every",
  "everything",
  "from",
  "given",
  "going",
  "have",
  "having",
  "here",
  "however",
  "into",
  "itself",
  "just",
  "know",
  "like",
  "make",
  "makes",
  "many",
  "might",
  "more",
  "most",
  "much",
  "must",
  "never",
  "nothing",
  "only",
  "other",
  "over",
  "own",
  "really",
  "right",
  "said",
  "same",
  "says",
  "should",
  "since",
  "some",
  "someone",
  "something",
  "still",
  "such",
  "than",
  "that",
  "their",
  "them",
  "then",
  "there",
  "these",
  "they",
  "thing",
  "things",
  "think",
  "this",
  "those",
  "though",
  "through",
  "very",
  "want",
  "well",
  "were",
  "what",
  "when",
  "where",
  "which",
  "while",
  "will",
  "with",
  "without",
  "would",
  "your",
];
