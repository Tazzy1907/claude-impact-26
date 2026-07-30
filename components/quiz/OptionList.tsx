"use client";

import { Check, Info, X } from "lucide-react";
import { useState } from "react";
import { getTactic } from "@/lib/content";
import { optionOrder } from "@/lib/quiz-machine";
import type { Question, QuizPhase, TacticId } from "@/lib/types";

interface OptionListProps {
  question: Question;
  phase: QuizPhase;
  pickedId: TacticId | null;
  onPick: (id: TacticId) => void;
}

/**
 * The four candidate tactics.
 *
 * Most people won't know all four terms, so a definition has to be readable
 * *before* committing. Three routes reach it, per the interaction rules:
 * hover, keyboard focus, and an explicit tap target that pins it open. The
 * text itself lands in a reserved rail below the list rather than a floating
 * popover, so nothing reflows as the pointer travels down the options.
 *
 * Screen readers don't depend on any of that — every option carries its own
 * definition through `aria-describedby`.
 *
 * Reset on question change is the caller's job, via `key`.
 */
export function OptionList({ question, phase, pickedId, onPick }: OptionListProps) {
  const [hovered, setHovered] = useState<TacticId | null>(null);
  const [pinned, setPinned] = useState<TacticId | null>(null);

  const revealed = phase === "revealed";
  // Hover wins while it lasts, then the pinned one comes back.
  const active = hovered ?? pinned;
  const activeTactic = active ? getTactic(active) : null;

  return (
    <div
      className="flex flex-col gap-4"
      onKeyDown={(e) => {
        if (e.key === "Escape" && pinned) {
          setPinned(null);
          e.stopPropagation();
        }
      }}
    >
      <ul className="flex list-none flex-col gap-2 p-0">
        {optionOrder(question).map((id) => {
          const tactic = getTactic(id);
          const isAnswer = id === question.answerId;
          const isPick = id === pickedId;
          const descriptionId = `def-${question.id}-${id}`;

          return (
            <li key={id} className="flex items-stretch gap-2">
              <button
                type="button"
                className={[
                  "option",
                  revealed && isAnswer ? "option-answer" : "",
                  revealed && isPick && !isAnswer ? "option-missed" : "",
                  revealed && !isAnswer && !isPick ? "option-dimmed" : "",
                ]
                  .filter(Boolean)
                  .join(" ")}
                disabled={revealed}
                aria-describedby={descriptionId}
                onClick={() => onPick(id)}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(id)}
                onBlur={() => setHovered(null)}
              >
                {revealed && isAnswer && (
                  <Check className="option-mark" size={18} aria-hidden="true" />
                )}
                {revealed && isPick && !isAnswer && (
                  <X
                    className="option-mark"
                    size={18}
                    aria-hidden="true"
                    style={{ color: "inherit" }}
                  />
                )}

                <span>{tactic.name}</span>

                {/* Correctness in words as well as icon and stroke, so it
                    survives colour blindness and a monochrome screen. */}
                {revealed && isAnswer && <span className="option-label">The tactic</span>}
                {revealed && isPick && !isAnswer && (
                  <span className="option-label">Your pick</span>
                )}

                <span id={descriptionId} className="sr-only">
                  {tactic.name}. {tactic.shortDef}
                </span>
              </button>

              <button
                type="button"
                className="btn btn-secondary btn-icon"
                aria-label={`What does ${tactic.name} mean?`}
                aria-expanded={pinned === id}
                onClick={() => setPinned((prev) => (prev === id ? null : id))}
                onMouseEnter={() => setHovered(id)}
                onMouseLeave={() => setHovered(null)}
                onFocus={() => setHovered(id)}
                onBlur={() => setHovered(null)}
              >
                <Info size={16} aria-hidden="true" />
              </button>
            </li>
          );
        })}
      </ul>

      {/* aria-live is off deliberately: the same text is already on each
          option via aria-describedby, and announcing it twice is noise. */}
      <div className="def-rail">
        {activeTactic ? (
          <p className="m-0">
            <span className="font-heading font-semibold">{activeTactic.name}</span>
            <span className="text-muted"> — {activeTactic.shortDef}</span>
          </p>
        ) : (
          <p className="text-muted m-0">
            Not sure what one of these means? Hover, focus or tap the information
            button beside it.
          </p>
        )}
      </div>
    </div>
  );
}
