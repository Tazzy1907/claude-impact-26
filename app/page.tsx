"use client";

import { useEffect, useRef, useState } from "react";
import { AnswerReveal } from "@/components/quiz/AnswerReveal";
import { OptionList } from "@/components/quiz/OptionList";
import { ProgressRule } from "@/components/quiz/ProgressRule";
import { QuestionCard } from "@/components/quiz/QuestionCard";
import { RoundSummary } from "@/components/quiz/RoundSummary";
import { getRound } from "@/lib/content";
import { advance, currentQuestion, pick, progress, startRound } from "@/lib/quiz-machine";
import { scoreRound } from "@/lib/scoring";

const ROUND_LENGTH = 8;

export default function Home() {
  /* Seed 1 for the first round so the server and the client build the same
     one and hydration stays quiet. Replays get a fresh seed from inside an
     event handler, which never runs on the server. */
  const [state, setState] = useState(() =>
    startRound(getRound({ length: ROUND_LENGTH, seed: 1 })),
  );

  const question = currentQuestion(state);
  const headingRef = useRef<HTMLDivElement>(null);

  /* Moving to a new question sends focus to the top of it. Without this,
     focus falls back to <body> when the Next button unmounts and a keyboard
     user restarts their tab journey from the header every time. */
  useEffect(() => {
    if (state.phase === "answering" && state.index > 0) {
      headingRef.current?.focus();
    }
  }, [state.index, state.phase]);

  return (
    <>
      <header className="nav">
        <span className="nav-brand">Name the Tactic</span>
        <span className="text-muted hidden text-[13px] sm:inline">
          Recognise the move, and it stops working
        </span>
      </header>

      <main className="mx-auto flex w-full max-w-[46rem] flex-1 flex-col gap-6 p-4 sm:p-8">
        {state.phase === "complete" || !question ? (
          <RoundSummary
            score={scoreRound(state)}
            onRestart={() =>
              setState(
                startRound(
                  getRound({ length: ROUND_LENGTH, seed: Math.floor(Math.random() * 1e9) }),
                ),
              )
            }
          />
        ) : (
          <>
            <ProgressRule
              value={progress(state)}
              current={state.index + 1}
              total={state.questions.length}
            />

            <div ref={headingRef} tabIndex={-1} className="flex flex-col gap-6 outline-none">
              <QuestionCard question={question} />

              <div>
                <h2 className="m-0 mb-3 text-[16px]">
                  Which tactic is doing the work here?
                </h2>

                <OptionList
                  key={question.id}
                  question={question}
                  phase={state.phase}
                  pickedId={state.pickedId}
                  onPick={(id) => setState((prev) => pick(prev, id))}
                />
              </div>
            </div>

            {state.phase === "revealed" && state.pickedId && (
              <AnswerReveal
                question={question}
                pickedId={state.pickedId}
                isLast={state.index + 1 >= state.questions.length}
                onNext={() => setState((prev) => advance(prev))}
              />
            )}
          </>
        )}
      </main>

      <footer className="text-muted px-4 pb-6 text-center text-[12px] sm:px-8">
        Quotes are invented for practice. No real person, organisation or event is
        described.
      </footer>
    </>
  );
}
