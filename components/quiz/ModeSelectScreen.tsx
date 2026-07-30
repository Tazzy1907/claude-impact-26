"use client";

import { ArrowRight, ListChecks, PenLine } from "lucide-react";
import { useState } from "react";
import { MODE_SCREEN, MODES } from "@/content/modes";
import type { QuizMode } from "@/lib/types";

/**
 * The fork between the two ways of answering, reached from the welcome screen.
 *
 * Pick, then start — deliberately two steps rather than one. Making each card a
 * button that starts a round immediately would mean committing to a mode
 * before reading the second card, and the free-text round asks noticeably more
 * of the learner than the multiple-choice one.
 */

const ICONS: Record<QuizMode, typeof ListChecks> = {
  classic: ListChecks,
  rebuttal: PenLine,
};

interface ModeSelectScreenProps {
  onStart: (mode: QuizMode) => void;
}

export function ModeSelectScreen({ onStart }: ModeSelectScreenProps) {
  const [mode, setMode] = useState<QuizMode>("classic");

  return (
    <main className="flex flex-1 items-center justify-center px-4 py-8">
      <div className="w-full max-w-[640px]">
        <div className="card-kicker">{MODE_SCREEN.kicker}</div>
        <h2 className="mt-2">{MODE_SCREEN.title}</h2>
        <p>{MODE_SCREEN.intro}</p>

        <div className="hr" />

        <div
          role="radiogroup"
          aria-label="Choose how to answer"
          className="mb-4 grid gap-3 sm:grid-cols-2"
        >
          {MODES.map((option) => {
            const Icon = ICONS[option.id];

            return (
              <label key={option.id} className="mode-card relative">
                <input
                  type="radio"
                  name="quiz-mode"
                  value={option.id}
                  checked={mode === option.id}
                  onChange={() => setMode(option.id)}
                />

                <span className="text-accent flex items-center gap-2">
                  <Icon size={16} aria-hidden="true" />
                  <span className="card-kicker m-0">{option.kicker}</span>
                </span>

                <span className="card-title m-0">{option.title}</span>
                <span className="text-[13px] opacity-80">{option.detail}</span>
                <span className="text-muted mt-1 text-[12px]">{option.scoring}</span>
              </label>
            );
          })}
        </div>

        <button
          type="button"
          className="btn btn-primary btn-block"
          onClick={() => onStart(mode)}
        >
          Start
          <ArrowRight size={14} aria-hidden="true" />
        </button>
      </div>
    </main>
  );
}
