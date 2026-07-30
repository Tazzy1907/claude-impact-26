"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { RebuttalResultsScreen } from "@/components/rebuttal/RebuttalResultsScreen";
import { RebuttalScreen } from "@/components/rebuttal/RebuttalScreen";
import { QUIZ_CONFIG } from "@/lib/config";
import { getTactic, pickRound } from "@/lib/content";
import {
  advance,
  beginGrading,
  buildSubmission,
  canSubmit,
  currentQuestion,
  failGrading,
  initialRebuttalState,
  recordEvaluation,
  setDraft,
} from "@/lib/rebuttal-machine";
import { isEvaluation, type RebuttalSubmission, type TacticId } from "@/lib/types";

/**
 * The free-text round. Holds the state machine and owns the one impure part of
 * the flow — the call to the grader — so both screens stay presentational.
 *
 * It draws its own round from the bank, the same way the MCQ flow does. Five
 * questions at five marks each is what makes the round total twenty-five, so
 * the sampling in `pickRound` is load-bearing here rather than incidental:
 * handing over the whole forty-question bank would score out of two hundred.
 */

const GENERIC_FAILURE = "Couldn't reach the grader. Your answer is still here — try again.";

interface RebuttalFlowProps {
  onOpenDefinition: (id: TacticId) => void;
  onChangeMode: () => void;
}

export function RebuttalFlow({ onOpenDefinition, onChangeMode }: RebuttalFlowProps) {
  const [state, setState] = useState(() => initialRebuttalState(pickRound()));

  // Grading is the one request in the app that can outlive its screen. Holding
  // the controller lets an unmount — or leaving mid-grade — cancel it rather
  // than resolve into a component that has gone.
  const inFlight = useRef<AbortController | null>(null);
  useEffect(() => () => inFlight.current?.abort(), []);

  const grade = useCallback(async (submission: RebuttalSubmission) => {
    const controller = new AbortController();
    inFlight.current = controller;

    try {
      const response = await fetch("/api/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(submission),
        signal: controller.signal,
      });

      if (!response.ok) throw new Error(`Grader responded ${response.status}`);

      const evaluation: unknown = await response.json();
      if (!isEvaluation(evaluation)) throw new Error("Grader returned an unexpected shape");

      setState((prev) => recordEvaluation(prev, evaluation));
    } catch (error) {
      if (controller.signal.aborted) return;
      console.error("[rebuttal] grading failed:", error);
      setState((prev) => failGrading(prev, GENERIC_FAILURE));
    } finally {
      if (inFlight.current === controller) inFlight.current = null;
    }
  }, []);

  const handlePrimary = () => {
    if (state.phase === "graded") {
      setState(advance);
      return;
    }
    if (state.phase !== "writing" || !canSubmit(state)) return;

    const question = currentQuestion(state);
    if (!question) return;

    const submission = buildSubmission(state, getTactic(question.answerId).name);
    if (!submission) return;

    setState(beginGrading);
    void grade(submission);
  };

  const restart = () => {
    inFlight.current?.abort();
    setState((prev) =>
      // A fresh draw by default, matching the MCQ round. Off replays the same
      // five, which here means another attempt at rebuttals you scored low on.
      initialRebuttalState(QUIZ_CONFIG.shuffleOnRestart ? pickRound() : prev.questions),
    );
  };

  if (state.screen === "results") {
    return (
      <RebuttalResultsScreen
        state={state}
        onRestart={restart}
        onChangeMode={onChangeMode}
      />
    );
  }

  return (
    <RebuttalScreen
      state={state}
      showLearnCta={QUIZ_CONFIG.showLearnCta}
      onDraftChange={(draft) => setState((prev) => setDraft(prev, draft))}
      onPrimary={handlePrimary}
      onOpenDefinition={onOpenDefinition}
    />
  );
}
