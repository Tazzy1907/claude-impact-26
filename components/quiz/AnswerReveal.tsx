import { ArrowRight, Check, Quote } from "lucide-react";
import { getTactic } from "@/lib/content";
import { FAMILY_LABELS } from "@/content/tactics";
import type { Question, TacticId } from "@/lib/types";

interface AnswerRevealProps {
  question: Question;
  pickedId: TacticId;
  isLast: boolean;
  onNext: () => void;
}

/**
 * The teaching panel — the point of the whole app.
 *
 * Getting it wrong should be the most useful moment here, so there is no
 * red, no penalty language and no drama: the header states the outcome
 * plainly and the rest of the panel is the same either way.
 */
export function AnswerReveal({ question, pickedId, isLast, onNext }: AnswerRevealProps) {
  const correct = pickedId === question.answerId;
  const answer = getTactic(question.answerId);
  const picked = getTactic(pickedId);
  const pickedNote = question.distractorNotes[pickedId];

  const otherNotes = question.optionIds
    .filter((id) => id !== question.answerId && id !== pickedId)
    .map((id) => ({ tactic: getTactic(id), note: question.distractorNotes[id] }))
    .filter((entry): entry is { tactic: ReturnType<typeof getTactic>; note: string } =>
      Boolean(entry.note),
    );

  return (
    <section className="reveal" aria-labelledby="reveal-outcome">
      <header className="flex flex-wrap items-center gap-3">
        {/* Icon plus wording plus stroke — correctness never rests on hue. */}
        {correct ? (
          <Check size={20} className="text-accent" aria-hidden="true" />
        ) : (
          <Quote size={20} className="text-muted" aria-hidden="true" />
        )}
        <h2 id="reveal-outcome" className="m-0 text-[20px]">
          {correct ? "Yes — that's the one." : `It was ${answer.name.toLowerCase()}.`}
        </h2>
        <span className="tag tag-outline ml-auto">{FAMILY_LABELS[answer.family]}</span>
      </header>

      <div>
        <p className="reveal-heading">Why</p>
        <p className="m-0 text-[14px] leading-relaxed">{question.explanation}</p>
      </div>

      <div>
        <p className="reveal-heading">{answer.name}</p>
        <p className="m-0 text-[14px] leading-relaxed">{answer.longDef}</p>
      </div>

      {!correct && pickedNote && (
        <div>
          <p className="reveal-heading">Why not {picked.name.toLowerCase()}</p>
          <p className="m-0 text-[14px] leading-relaxed">{pickedNote}</p>
        </div>
      )}

      {otherNotes.length > 0 && (
        <details className="text-[14px]">
          <summary className="cursor-pointer text-accent">
            Why not the others
          </summary>
          <dl className="m-0 mt-3 flex flex-col gap-3">
            {otherNotes.map(({ tactic, note }) => (
              <div key={tactic.id}>
                <dt className="font-heading font-semibold">{tactic.name}</dt>
                <dd className="m-0 leading-relaxed">{note}</dd>
              </div>
            ))}
          </dl>
        </details>
      )}

      <div>
        <p className="reveal-heading">Something you could say back</p>
        <p className="rebuttal m-0">{question.rebuttal}</p>
      </div>

      <div className="flex justify-end">
        <button type="button" className="btn btn-primary" onClick={onNext} autoFocus>
          {isLast ? "See your round" : "Next question"}
          <ArrowRight size={16} aria-hidden="true" />
        </button>
      </div>
    </section>
  );
}
