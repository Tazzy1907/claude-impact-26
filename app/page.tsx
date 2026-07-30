"use client";

import { useEffect, useRef, useState } from "react";
import type { Message } from "@/lib/types";

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isStreaming, setIsStreaming] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  // Keep the newest message in view as text streams in.
  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  async function send() {
    const text = input.trim();
    if (!text || isStreaming) return;

    const history: Message[] = [...messages, { role: "user", content: text }];

    setInput("");
    setError(null);
    setIsStreaming(true);
    // Append the user turn plus an empty assistant turn we stream into.
    setMessages([...history, { role: "assistant", content: "" }]);

    const controller = new AbortController();
    abortRef.current = controller;

    try {
      const response = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: history }),
        signal: controller.signal,
      });

      if (!response.ok) {
        const detail = await response.json().catch(() => null);
        throw new Error(detail?.error ?? `Request failed with ${response.status}`);
      }
      if (!response.body) throw new Error("Response had no body to stream.");

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) => {
          const next = [...prev];
          const last = next[next.length - 1];
          next[next.length - 1] = { ...last, content: last.content + chunk };
          return next;
        });
      }
    } catch (cause) {
      // An abort is the user pressing Stop, not a failure worth reporting.
      if (cause instanceof DOMException && cause.name === "AbortError") return;

      setError(cause instanceof Error ? cause.message : "Something went wrong.");
      // Drop the empty assistant bubble so it isn't left dangling.
      setMessages((prev) =>
        prev.at(-1)?.role === "assistant" && prev.at(-1)?.content === ""
          ? prev.slice(0, -1)
          : prev,
      );
    } finally {
      setIsStreaming(false);
      abortRef.current = null;
    }
  }

  return (
    <main className="mx-auto flex w-full max-w-3xl flex-1 flex-col gap-4 p-4 sm:p-6">
      <header className="border-b border-black/10 pb-4 dark:border-white/15">
        <h1 className="text-lg font-semibold">claude-impact-26</h1>
        <p className="text-sm text-black/60 dark:text-white/60">
          Agent template — implement{" "}
          <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
            runAgent
          </code>{" "}
          in{" "}
          <code className="rounded bg-black/5 px-1 py-0.5 font-mono text-xs dark:bg-white/10">
            lib/agent.ts
          </code>
          .
        </p>
      </header>

      <div className="flex flex-1 flex-col gap-4 overflow-y-auto">
        {messages.length === 0 && (
          <p className="m-auto text-sm text-black/40 dark:text-white/40">
            Send a message to check the pipeline end to end.
          </p>
        )}

        {messages.map((message, i) => (
          <div
            key={i}
            className={
              message.role === "user"
                ? "max-w-[85%] self-end rounded-2xl rounded-br-sm bg-black px-4 py-2 text-white dark:bg-white dark:text-black"
                : "max-w-[85%] self-start rounded-2xl rounded-bl-sm bg-black/5 px-4 py-2 dark:bg-white/10"
            }
          >
            <p className="whitespace-pre-wrap break-words text-sm leading-relaxed">
              {message.content}
              {/* Caret while the last assistant turn is still filling in. */}
              {isStreaming && i === messages.length - 1 && (
                <span className="ml-0.5 inline-block h-4 w-1.5 animate-pulse bg-current align-text-bottom" />
              )}
            </p>
          </div>
        ))}

        <div ref={bottomRef} />
      </div>

      {error && (
        <p
          role="alert"
          className="rounded-lg bg-red-500/10 px-3 py-2 text-sm text-red-700 dark:text-red-400"
        >
          {error}
        </p>
      )}

      <form
        onSubmit={(e) => {
          e.preventDefault();
          void send();
        }}
        className="flex items-end gap-2 border-t border-black/10 pt-4 dark:border-white/15"
      >
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            // Enter sends; Shift+Enter inserts a newline.
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Send a message…"
          rows={1}
          disabled={isStreaming}
          className="max-h-40 flex-1 resize-y rounded-lg border border-black/15 bg-transparent px-3 py-2 text-sm outline-none focus:border-black/40 disabled:opacity-50 dark:border-white/20 dark:focus:border-white/50"
        />

        {isStreaming ? (
          <button
            type="button"
            onClick={() => abortRef.current?.abort()}
            className="rounded-lg border border-black/15 px-4 py-2 text-sm font-medium hover:bg-black/5 dark:border-white/20 dark:hover:bg-white/10"
          >
            Stop
          </button>
        ) : (
          <button
            type="submit"
            disabled={!input.trim()}
            className="rounded-lg bg-black px-4 py-2 text-sm font-medium text-white disabled:opacity-40 dark:bg-white dark:text-black"
          >
            Send
          </button>
        )}
      </form>
    </main>
  );
}
