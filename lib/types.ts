/**
 * Shared types used by both the browser and the server.
 *
 * `Message` is intentionally shaped like Anthropic's `MessageParam` so a
 * conversation can be passed straight to the API without remapping it.
 */

export type Role = "user" | "assistant";

export interface Message {
  role: Role;
  content: string;
}

/** Body of a `POST /api/chat` request. */
export interface ChatRequest {
  messages: Message[];
}

/** Narrows an unknown parsed JSON body to a `ChatRequest`. */
export function isChatRequest(value: unknown): value is ChatRequest {
  if (typeof value !== "object" || value === null) return false;
  const { messages } = value as { messages?: unknown };
  return (
    Array.isArray(messages) &&
    messages.every(
      (m) =>
        typeof m === "object" &&
        m !== null &&
        ((m as Message).role === "user" || (m as Message).role === "assistant") &&
        typeof (m as Message).content === "string",
    )
  );
}
