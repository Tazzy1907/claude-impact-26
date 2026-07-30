import Anthropic from "@anthropic-ai/sdk";
import type { Message } from "./types";

/**
 * Server-side Claude access. Never import this into a `"use client"` file —
 * it reads the API key.
 *
 * `runAgent` keeps the generator contract the scaffold established, so the
 * route handler, streaming, and abort handling work unchanged.
 */

/**
 * Exact model ID — no date suffix. Opus 5 has extended thinking ON by default.
 */
const MODEL = "claude-opus-5";

/**
 * `max_tokens` caps thinking AND visible text together, so a tight value
 * truncates answers mid-sentence. It's a ceiling, not a reservation — you're
 * billed for what's actually produced, so keeping it generous is free.
 */
const MAX_TOKENS = 32_000;

const SYSTEM_PROMPT = `You are the reasoning engine for a tool that teaches people to recognise \
manipulation tactics and logical fallacies in persuasive speech.

Analyse the form of an argument, never who is right about the underlying topic. \
Stay politically neutral. Critique the tactic, not the character of the speaker.

Be concrete: quote the specific words that constitute a tactic rather than \
describing it abstractly. Prefer plain language a person could say out loud over \
textbook phrasing. Be concise — this is a learning aid, not an essay.`;

/**
 * Built lazily so that importing this module (during `next build`, or from a
 * route that never calls it) doesn't require a key to be present.
 */
let client: Anthropic | undefined;

function getClient(): Anthropic {
  if (!process.env.ANTHROPIC_API_KEY) {
    throw new Error(
      "ANTHROPIC_API_KEY is not set. Copy .env.example to .env.local, add a key " +
        "from https://console.anthropic.com/settings/keys, then restart the dev server.",
    );
  }
  // The SDK reads ANTHROPIC_API_KEY from the environment itself.
  client ??= new Anthropic();
  return client;
}

/**
 * Streams a Claude response for the given conversation.
 *
 * @param messages Full conversation, oldest first.
 * @param signal   Aborts on client disconnect; forwarded so we stop paying for
 *                 tokens nobody will read.
 * @returns        Text chunks, yielded as they arrive.
 */
export async function* runAgent(
  messages: Message[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const stream = getClient().messages.stream(
    {
      model: MODEL,
      max_tokens: MAX_TOKENS,
      system: SYSTEM_PROMPT,
      messages,
    },
    { signal },
  );

  for await (const event of stream) {
    if (
      event.type === "content_block_delta" &&
      event.delta.type === "text_delta"
    ) {
      yield event.delta.text;
    }
  }

  // Safety classifiers can decline a request: that arrives as a normal HTTP 200
  // with stop_reason "refusal" and little or no content, NOT as a thrown error.
  // Without this check a refusal looks like an empty successful response.
  const final = await stream.finalMessage();
  if (final.stop_reason === "refusal") {
    yield "\n\n[This request was declined by the model's safety system. Try rephrasing.]";
  }
}

/**
 * One-shot, non-streaming variant. Use when you want the whole answer before
 * doing anything with it — grading a rebuttal, classifying a quote — and
 * streaming would only complicate the caller.
 */
export async function promptAgent(
  prompt: string,
  signal?: AbortSignal,
): Promise<string> {
  let out = "";
  for await (const chunk of runAgent([{ role: "user", content: prompt }], signal)) {
    out += chunk;
  }
  return out;
}

/*
 * Tuning knobs, when you need them:
 *
 *   output_config: { effort: "low" | "medium" | "high" | "xhigh" | "max" }
 *     Trades depth against latency and cost. Defaults to "high". For short
 *     classification or grading calls, "low" or "medium" is usually plenty and
 *     noticeably faster.
 *
 *   output_config: { format: { type: "json_schema", schema: … } }
 *     Structured output. Use this instead of prefilling the assistant turn,
 *     which returns a 400 on this model.
 *
 * Do NOT add `temperature`, `top_p`, or `top_k` — all three are rejected with a
 * 400 on Opus 5. Steer behaviour through SYSTEM_PROMPT instead.
 *
 * For tool use, loop: when the response contains `tool_use` blocks, execute
 * them, append the results as a `user` turn, and call again. The SDK's
 * `client.beta.messages.toolRunner()` does that loop for you.
 */
