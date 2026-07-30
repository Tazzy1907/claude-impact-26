"use client";

import { useState } from "react";
import { ClassicFlow } from "@/components/quiz/ClassicFlow";
import { DefinitionDialog } from "@/components/quiz/DefinitionDialog";
import { ModeSelectScreen } from "@/components/quiz/ModeSelectScreen";
import { WelcomeScreen } from "@/components/quiz/WelcomeScreen";
import { RebuttalFlow } from "@/components/rebuttal/RebuttalFlow";
import { getTactic } from "@/lib/content";
import type { QuizMode, Route, TacticId } from "@/lib/types";

/**
 * Mindshield. The welcome screen and the mode picker are shared; past them the
 * app forks into one of two rounds over the same question bank — the Phase 1
 * multiple-choice flow, or the Phase 2 free-text one graded out of five.
 *
 * This component owns only the route and the definition dialog. Each round
 * keeps its own state machine inside its own flow component, so neither has to
 * account for the other's shape.
 */

const NAV_LABEL: Record<QuizMode, string> = {
  classic: "Name the tactic",
  rebuttal: "Write the rebuttal",
};

export default function Home() {
  const [route, setRoute] = useState<Route>({ name: "welcome" });

  // Modal state is presentation, not progress, so it stays out of both
  // machines — closing a definition must not be a state transition.
  const [definitionId, setDefinitionId] = useState<TacticId | null>(null);

  const toModePicker = () => setRoute({ name: "mode" });

  return (
    <>
      <nav className="nav justify-between">
        <span className="nav-brand">Mindshield</span>
        <span className="text-muted text-[11px] tracking-[.08em] uppercase">
          {route.name === "round" ? NAV_LABEL[route.mode] : "Fallacy Quiz"}
        </span>
      </nav>

      {route.name === "welcome" && <WelcomeScreen onStart={toModePicker} />}

      {route.name === "mode" && (
        <ModeSelectScreen onStart={(mode) => setRoute({ name: "round", mode })} />
      )}

      {route.name === "round" &&
        (route.mode === "classic" ? (
          // Keyed by mode so switching rounds mounts a fresh machine rather
          // than reusing the last one's progress.
          <ClassicFlow
            key="classic"
            onOpenDefinition={setDefinitionId}
            onChangeMode={toModePicker}
          />
        ) : (
          <RebuttalFlow
            key="rebuttal"
            onOpenDefinition={setDefinitionId}
            onChangeMode={toModePicker}
          />
        ))}

      {definitionId && (
        <DefinitionDialog
          tactic={getTactic(definitionId)}
          onClose={() => setDefinitionId(null)}
        />
      )}
    </>
  );
}
