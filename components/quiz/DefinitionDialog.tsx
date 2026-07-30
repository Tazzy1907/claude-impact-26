"use client";

import { useEffect, useRef } from "react";
import type { Tactic } from "@/lib/types";

/**
 * The definition modal behind "What does this mean?". Markup matches the
 * design's dialog branch; the focus handling is added on top of it, since a
 * modal a keyboard user can tab out of is only half a modal.
 */

interface DefinitionDialogProps {
  tactic: Tactic;
  onClose: () => void;
}

export function DefinitionDialog({ tactic, onClose }: DefinitionDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);
  const confirmRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    // Whatever opened the dialog gets focus back when it closes, so the user
    // resumes at the option they were asking about rather than at the top.
    const opener = document.activeElement as HTMLElement | null;
    confirmRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = dialogRef.current?.querySelectorAll<HTMLElement>(
        'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
      );
      if (!focusable || focusable.length === 0) return;

      const first = focusable[0];
      const last = focusable[focusable.length - 1];

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("keydown", onKeyDown);
      opener?.focus();
    };
  }, [onClose]);

  return (
    <div className="dialog-backdrop" onClick={onClose}>
      <div
        ref={dialogRef}
        className="dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="fallacy-def-title"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="dialog-title" id="fallacy-def-title">
          {tactic.name}
        </div>
        <div className="dialog-body">{tactic.def}</div>
        <div className="dialog-actions">
          <button
            ref={confirmRef}
            type="button"
            className="btn btn-primary"
            onClick={onClose}
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
