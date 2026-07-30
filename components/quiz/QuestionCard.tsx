import type { Question } from "@/lib/types";

const DIFFICULTY_LABELS: Record<Question["difficulty"], string> = {
  1: "Straightforward",
  2: "Subtle",
  3: "Hard",
};

interface QuestionCardProps {
  question: Question;
}

/**
 * The quote under examination. Set large in the heading face at its normal
 * cut, against an accent hairline — the page's one piece of display type.
 */
export function QuestionCard({ question }: QuestionCardProps) {
  return (
    <figure className="flex flex-col gap-4">
      <figcaption className="flex flex-wrap items-center gap-3">
        <span className="card-kicker">{question.context}</span>
        <span className="tag tag-neutral">{DIFFICULTY_LABELS[question.difficulty]}</span>
      </figcaption>

      <blockquote className="quote">{question.quote}</blockquote>
    </figure>
  );
}
