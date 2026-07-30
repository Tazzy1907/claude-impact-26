import { COMMON_WORDS, MECHANISM_CUES, TACTIC_CUES } from "@/content/grading-cues";
import type { Evaluation, RebuttalSubmission, Score, TacticId } from "./types";

/**
 * An offline stand-in for the Claude grader in `lib/evaluator.ts`.
 *
 * It exists so the free-text flow is demonstrable with no API key and no
 * network — the same reason Phase 1 ships static content. `lib/grader.ts`
 * chooses between the two, so swapping this out is a one-line config change.
 *
 * It scores the same three-part rubric the real prompt does, by keyword rather
 * than by reading:
 *
 *   IDENTIFY   — named the move, in technical terms or plain ones.
 *   MECHANISM  — said why that makes the argument fail.
 *   GROUNDED   — tied it to this statement rather than to fallacies in general.
 *
 * Where the two graders differ: the real one weighs a REDIRECT (returning to
 * the real question) as its third mark, judges meaning rather than vocabulary,
 * and can credit a defensible reading nobody anticipated. This one cannot do
 * any of that. It cannot read negation either — "this is *not* a straw man"
 * matches the straw-man cues.
 *
 * Its known bias is to understate by a mark, never to overstate: where naming
 * the tactic and explaining it are the same sentence — "her ticket has nothing
 * to do with whether the proposal is any good" — only the naming is paid, and
 * a complete answer lands on 4. That is the safe direction to be wrong in, and
 * the feedback at that band is written not to accuse the learner of an
 * omission the grader may simply have failed to see.
 */

/**
 * Stands in for the model round trip. Without it the "Grading your answer…"
 * state would flash by too fast to read, and the flow would feel different
 * from how it will feel once the real grader is wired in.
 */
const SIMULATED_LATENCY_MS = 750;

/**
 * Under this, a response that shows no recognition at all is treated as no
 * attempt. It has to be paired with the signal check rather than applied on
 * its own — "False dilemma" is two words and a correct answer.
 */
const MIN_WORDS = 3;

/** Statement words this long, and not commonplace, count as distinctive. */
const DISTINCTIVE_LENGTH = 6;

/** Distinctive words shared with the statement needed to count as grounded. */
const GROUNDING_THRESHOLD = 1;

interface Signals {
  identified: boolean;
  /** Named a real tactic, but not the one this statement uses. */
  misidentified: boolean;
  mechanism: boolean;
  grounded: boolean;
}

export async function mockGradeRebuttal(
  submission: RebuttalSubmission,
  signal?: AbortSignal,
): Promise<Evaluation> {
  await delay(SIMULATED_LATENCY_MS, signal);

  const response = submission.response.trim();
  const signals = readSignals(response, submission);

  if (isNoAttempt(response, signals)) {
    return {
      score: 0,
      feedback:
        "There's nothing here to grade yet. Have a go even if it's rough — a sentence in your own words is worth more than a perfect one you never wrote.",
      identifiedCorrectly: false,
    };
  }

  const score = bandFor(signals);

  return {
    score,
    feedback: feedbackFor(score, signals, submission),
    identifiedCorrectly: signals.identified,
  };
}

/* ── Signal detection ─────────────────────────────────────────────────── */

function readSignals(response: string, submission: RebuttalSubmission): Signals {
  const text = normalise(response);
  const cues = TACTIC_CUES[submission.tacticId];

  const identified = matchesAny(text, cues.strong) || matchesAny(text, cues.loose);

  return {
    identified,
    misidentified: !identified && namesAnotherTactic(text, submission.tacticId),
    mechanism: matchesAny(text, mechanismCuesFor(submission.tacticId)),
    grounded: groundingOverlap(text, submission.quote) >= GROUNDING_THRESHOLD,
  };
}

/**
 * No mark is paid twice. A phrase that identifies *this* tactic can't also
 * count as explaining it: "nothing to do with the argument" names an ad
 * hominem, so on an ad hominem question it earns the identification mark and
 * nothing more — while on a slippery-slope question it is genuinely a reason,
 * and still counts.
 */
function mechanismCuesFor(tacticId: TacticId): string[] {
  const own = new Set([...TACTIC_CUES[tacticId].strong, ...TACTIC_CUES[tacticId].loose]);
  return MECHANISM_CUES.filter((cue) => !own.has(cue));
}

/**
 * A blank box, or a couple of words that recognise nothing. The word count
 * alone would fail a bare "False dilemma", which is a real answer worth a 3.
 */
function isNoAttempt(response: string, signals: Signals): boolean {
  if (response.length === 0) return true;
  if (signals.identified || signals.misidentified) return false;
  return wordCount(response) < MIN_WORDS;
}

/**
 * Only the strong cues vote here. A learner writing a sound straw-man answer
 * will very often use the word "attack", and convicting them of ad hominem for
 * it would be the single most annoying way this grader could be wrong.
 */
function namesAnotherTactic(text: string, answer: TacticId): boolean {
  return Object.entries(TACTIC_CUES).some(
    ([id, cues]) => id !== answer && matchesAny(text, cues.strong),
  );
}

/** How many distinctive words from the statement the learner reached for. */
function groundingOverlap(text: string, quote: string): number {
  const used = new Set(text.split(" ").filter(Boolean));
  const distinctive = new Set(
    normalise(quote)
      .split(" ")
      .filter(
        (word) => word.length >= DISTINCTIVE_LENGTH && !COMMON_WORDS.includes(word),
      ),
  );

  let hits = 0;
  for (const word of distinctive) {
    // Suffix-tolerant, so "employees" in the statement counts for "employee".
    if (used.has(word) || text.includes(` ${word.slice(0, -1)}`)) hits++;
  }
  return hits;
}

/* ── Banding ──────────────────────────────────────────────────────────── */

/**
 * The bands mirror `EVALUATOR_SYSTEM_PROMPT` so that turning the real grader on
 * doesn't move the scores much. Count the parts, read the band off — never
 * adjust for how good an answer felt.
 */
function bandFor({ identified, misidentified, mechanism, grounded }: Signals): Score {
  if (misidentified) return 2;
  if (!identified) return 1;

  const supporting = Number(mechanism) + Number(grounded);
  if (supporting === 2) return 5;
  if (supporting === 1) return 4;
  return 3;
}

/* ── Feedback ─────────────────────────────────────────────────────────── */

/**
 * Two or three sentences, addressed to the learner, saying what landed and the
 * one thing that would have improved it. Below a 3 it names the tactic
 * outright: that moment is the most useful one in the exercise, and withholding
 * it to preserve the challenge would be the wrong trade.
 */
function feedbackFor(
  score: Score,
  { mechanism, grounded }: Signals,
  { tacticName, tacticExplanation }: RebuttalSubmission,
): string {
  switch (score) {
    case 5:
      return `That's the whole move. You named what's happening, said why it doesn't hold, and stayed anchored to what this argument actually says — which is what stops a rebuttal sounding like a textbook. Nothing to add.`;

    case 4:
      // Grounding is measured by word overlap and can be asserted. Whether the
      // reasoning is present is inferred from cues and can be missed, so this
      // branch offers the advice without claiming they left it out.
      return mechanism
        ? `You named it and said why it fails, which is the hard part. The one thing that would sharpen it: point at the specific words in the statement doing the work, so it lands as a reply to this argument rather than to the category.`
        : `You named it, and you stayed anchored to what this argument actually says. What makes a rebuttal land is having the why right out in the open — say plainly what the move does to the reasoning, and the other person has something they have to answer.`;

    case 3:
      return `You've named it, and naming it is the hard part — the answer is ${tacticName}. Now go one step further and say why that makes the argument fail${grounded ? "" : ", quoting the words that do it"}. A label on its own is easy to shrug off; a reason isn't.`;

    case 2:
      return `You're reading it closely and you're right that something is off, but that's not quite the move here — this one is ${tacticName}. ${tacticExplanation} Getting the near-misses is normal; they're usually from the same family.`;

    default:
      return `You can tell something isn't right, and that instinct is the thing worth trusting. What's happening is ${tacticName}. ${tacticExplanation} Try putting that in your own words — it's the naming that turns the feeling into something you can say back.`;
  }
}

/* ── Text helpers ─────────────────────────────────────────────────────── */

/**
 * Lower-cased, punctuation flattened to spaces, and padded with a leading and
 * trailing space so a cue can be matched at a word boundary with `includes`.
 */
function normalise(text: string): string {
  return ` ${text.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim()} `;
}

/** Cues match at the start of a word, so "attack" catches "attacking". */
function matchesAny(normalisedText: string, cues: string[]): boolean {
  return cues.some((cue) => normalisedText.includes(` ${cue}`));
}

function wordCount(text: string): number {
  return text.split(/\s+/).filter(Boolean).length;
}

function delay(ms: number, signal?: AbortSignal): Promise<void> {
  return new Promise((resolve, reject) => {
    if (signal?.aborted) {
      reject(signal.reason);
      return;
    }
    const timer = setTimeout(resolve, ms);
    signal?.addEventListener(
      "abort",
      () => {
        clearTimeout(timer);
        reject(signal.reason);
      },
      { once: true },
    );
  });
}
