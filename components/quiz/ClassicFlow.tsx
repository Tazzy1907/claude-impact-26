"use client";

import { useState } from "react";
import { QuizScreen } from "@/components/quiz/QuizScreen";
import { ResultsScreen } from "@/components/quiz/ResultsScreen";
import { QUIZ_CONFIG } from "@/lib/config";
import { pickRound } from "@/lib/content";
import { initialState, primaryAction, selectOption, startQuiz } from "@/lib/quiz-machine";
import type { TacticId } from "@/lib/types";

/**
 * The multiple-choice round — Phase 1's flow, unchanged, lifted out of
 * `app/page.tsx` so the page can own the route between the two modes and
 * neither round has to know the other exists.
 *
 * It starts on the quiz screen rather than the welcome one: by the time this
 * mounts, the learner has already been through welcome and the mode picker.
 * That is also what makes drawing the round in the initialiser safe — `useState`
 * runs it once, on mount, in the browser, in response to the click that chose
 * this mode. Nothing is server-rendered from it.
 */

interface ClassicFlowProps {
  onOpenDefinition: (id: TacticId) => void;
  onChangeMode: () => void;
}

export function ClassicFlow({ onOpenDefinition, onChangeMode }: ClassicFlowProps) {
  const [state, setState] = useState(() => startQuiz(initialState(pickRound())));

  const restart = () =>
    setState((prev) =>
      /* A fresh draw by default: with five questions coming out of forty,
         "Start again" returning the same five would waste the bank. Setting
         the flag false replays the round just finished instead, for anyone
         who wants another go at the ones they missed. */
      startQuiz(prev, QUIZ_CONFIG.shuffleOnRestart ? pickRound() : prev.questions),
    );

  if (state.screen === "results") {
    return (
      <ResultsScreen
        state={state}
        reviewDetail={QUIZ_CONFIG.reviewDetail}
        onRestart={restart}
        onChangeMode={onChangeMode}
      />
    );
  }

  return (
    <QuizScreen
      state={state}
      showLearnCta={QUIZ_CONFIG.showLearnCta}
      onSelect={(id) => setState((prev) => selectOption(prev, id))}
      onPrimary={() => setState((prev) => primaryAction(prev))}
      onOpenDefinition={onOpenDefinition}
    />
  );
}
