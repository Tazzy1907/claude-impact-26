"use client";

import { useState } from "react";
import { DefinitionDialog } from "@/components/quiz/DefinitionDialog";
import { QuizScreen } from "@/components/quiz/QuizScreen";
import { ResultsScreen } from "@/components/quiz/ResultsScreen";
import { WelcomeScreen } from "@/components/quiz/WelcomeScreen";
import { QUIZ_CONFIG } from "@/lib/config";
import { getQuestions, getTactic, shuffleQuestions } from "@/lib/content";
import {
  initialState,
  primaryAction,
  selectOption,
  startQuiz,
} from "@/lib/quiz-machine";
import type { TacticId } from "@/lib/types";

/**
 * Mindshield. The three screens and the definition modal of
 * `Mindshield.dc.html`, with that file's state machine living in
 * `lib/quiz-machine.ts` and its content in `content/`.
 */
export default function Home() {
  const [state, setState] = useState(() => initialState(getQuestions()));

  // Modal state is presentation, not quiz progress, so it stays out of the
  // machine — closing a definition must not be a state transition.
  const [definitionId, setDefinitionId] = useState<TacticId | null>(null);

  const restart = () =>
    setState((prev) =>
      startQuiz(
        prev,
        QUIZ_CONFIG.shuffleOnRestart ? shuffleQuestions(prev.questions) : getQuestions(),
      ),
    );

  return (
    <>
      <nav className="nav justify-between">
        <span className="nav-brand">Mindshield</span>
        <span className="text-muted text-[11px] tracking-[.08em] uppercase">
          Fallacy Quiz
        </span>
      </nav>

      {state.screen === "welcome" && (
        <WelcomeScreen onStart={() => setState((prev) => startQuiz(prev))} />
      )}

      {state.screen === "quiz" && (
        <QuizScreen
          state={state}
          showLearnCta={QUIZ_CONFIG.showLearnCta}
          onSelect={(id) => setState((prev) => selectOption(prev, id))}
          onPrimary={() => setState((prev) => primaryAction(prev))}
          onOpenDefinition={setDefinitionId}
        />
      )}

      {state.screen === "results" && (
        <ResultsScreen
          state={state}
          reviewDetail={QUIZ_CONFIG.reviewDetail}
          onRestart={restart}
        />
      )}

      {definitionId && (
        <DefinitionDialog
          tactic={getTactic(definitionId)}
          onClose={() => setDefinitionId(null)}
        />
      )}
    </>
  );
}
