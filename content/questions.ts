import dataset from "@/razor_quiz_dataset.json";
import type { Question, TacticId } from "@/lib/types";

/**
 * The question bank, derived from `razor_quiz_dataset.json`.
 *
 * That file is the source of truth and is not edited here — this module only
 * maps its shape onto `Question`. Nothing imports it directly; go through
 * `lib/content.ts`.
 *
 * The bank is balanced by construction: ten items each of three fallacies and
 * ten whose reasoning actually holds. That last quarter is the point. Its
 * items are written to *look* like one of the three, so the quiz cannot be
 * passed by assuming something must be wrong.
 */

/**
 * The options every question offers, in the order they are shown.
 *
 * Exactly the categories the dataset uses. `slippery-slope` and
 * `appeal-to-authority` exist in `TacticId` but are deliberately not offered:
 * no item is ever keyed to them, so picking one could never be right and
 * nothing in the bank explains why it was wrong.
 *
 * The order is fixed rather than varied per question, which is what keeps the
 * answer key evenly spread. The dataset holds exactly ten items of each
 * category, so a constant order puts the correct answer in each of the four
 * slots exactly ten times — guessing a favourite position earns 25%, the same
 * as guessing at random. Deriving a per-question order from a hash was tried
 * and measured first: it skewed to 15/10/6/9, handing 37.5% to anyone who
 * always picked the first option. A constant order also suits a drill set,
 * where the options should be read once and the argument every time.
 */
const OPTION_IDS: [TacticId, TacticId, TacticId, TacticId] = [
  "ad-hominem",
  "straw-man",
  "false-dilemma",
  "valid",
];

/**
 * Dataset categories are snake_case and its own; `TacticId`s are kebab-case and
 * ours. Keeping the vocabularies apart means a rename on either side stays a
 * one-line change here rather than a hunt through the bank.
 */
const CATEGORY_TO_TACTIC: Record<string, TacticId> = {
  ad_hominem: "ad-hominem",
  strawman: "straw-man",
  false_dilemma: "false-dilemma",
  valid: "valid",
};

interface RawItem {
  id: string;
  category: string;
  format: string;
  prompt: string;
  explanation: string;
}

function toQuestion(item: RawItem): Question {
  const answerId = CATEGORY_TO_TACTIC[item.category];
  // Fail at import rather than render a question with no right answer. A
  // silently dropped item would leave a short round and no clue why.
  if (!answerId) {
    throw new Error(
      `razor_quiz_dataset.json: item "${item.id}" has unknown category ` +
        `"${item.category}". Add it to CATEGORY_TO_TACTIC in content/questions.ts.`,
    );
  }

  return {
    id: item.id,
    // Dialogue items carry a speaker turn per line. `QuizScreen` preserves the
    // breaks; collapsing them would lose track of who is answering whom, which
    // is exactly what the reader has to follow.
    statement: item.prompt,
    optionIds: OPTION_IDS,
    answerId,
    explanation: item.explanation,
  };
}

export const QUESTIONS: Question[] = (dataset.items as RawItem[]).map(toQuestion);
