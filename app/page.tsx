"use client";

import { useState } from "react";
import { DefinitionDialog } from "@/components/quiz/DefinitionDialog";
import { QuizScreen } from "@/components/quiz/QuizScreen";
import { ResultsScreen } from "@/components/quiz/ResultsScreen";
import { WelcomeScreen } from "@/components/quiz/WelcomeScreen";
import { QUIZ_CONFIG } from "@/lib/config";
import { getQuestions, getTactic, pickRound } from "@/lib/content";
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
  /* The bank stands in until a round is drawn. Rounds are sampled randomly, so
     they can only be drawn from an event handler — sampling here would have the
     server and the client pick different questions. The welcome screen shows no
     question, so nothing is waiting on it. */
  const [state, setState] = useState(() => initialState(getQuestions()));

  // Modal state is presentation, not quiz progress, so it stays out of the
  // machine — closing a definition must not be a state transition.
  const [definitionId, setDefinitionId] = useState<TacticId | null>(null);

  const restart = () =>
    setState((prev) =>
      /* A fresh draw by default: with five questions coming out of forty,
         "Start again" returning the same five would waste the bank. Setting
         the flag false replays the round just finished instead, for anyone
         who wants another go at the ones they missed. */
      startQuiz(prev, QUIZ_CONFIG.shuffleOnRestart ? pickRound() : prev.questions),
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
        <WelcomeScreen onStart={() => setState((prev) => startQuiz(prev, pickRound()))} />
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
