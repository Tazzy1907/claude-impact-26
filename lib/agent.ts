import type { Message } from "./types";

/**
 * ============================================================================
 *                         THIS IS WHERE THE AGENT GOES
 * ============================================================================
 *
 * `runAgent` is the ONLY function you need to implement. Everything around it
 * already works: the API route wraps this generator in an HTTP stream, and the
 * UI renders each chunk as it arrives.
 *
 * The contract:
 *   - in:  the full conversation so far, oldest first
 *   - out: text chunks, yielded as they become available
 *
 * Yield small pieces rather than one big string — each yield is flushed to the
 * browser immediately, which is what makes the response appear incrementally.
 *
 * Honour `signal`: it aborts when the user hits Stop or closes the tab. Pass it
 * to any network call you make so you stop paying for work nobody will read.
 *
 * Throwing is fine. The route catches it, logs it server-side, and shows the
 * user an error instead of leaving the request hanging.
 */
export async function* runAgent(
  messages: Message[],
  signal?: AbortSignal,
): AsyncGenerator<string> {
  // ---------------------------------------------------------------- REPLACE ME
  // Placeholder so the app runs end to end before the agent exists.
  // Delete this whole block and uncomment the reference implementation below.
  const latest = messages.at(-1)?.content ?? "";
  const reply =
    `This is a placeholder response — there's no agent wired up yet. ` +
    `You said: "${latest}". ` +
    `Implement \`runAgent\` in \`lib/agent.ts\` and this text goes away.`;

  for (const word of reply.split(" ")) {
    if (signal?.aborted) return;
    await new Promise((resolve) => setTimeout(resolve, 40));
    yield word + " ";
  }
  // -------------------------------------------------------------- END REPLACE

  /*
   * REFERENCE IMPLEMENTATION — streaming chat against the Claude API.
   * `@anthropic-ai/sdk` is already a dependency. Add your key to `.env.local`,
   * then swap this in for the block above.
   *
   *   import Anthropic from "@anthropic-ai/sdk";
   *
   *   const client = new Anthropic(); // reads ANTHROPIC_API_KEY from the env
   *
   *   const stream = client.messages.stream(
   *     {
   *       model: "claude-opus-5",
   *       max_tokens: 64000,
   *       system: "You are a helpful assistant.",
   *       messages,
   *     },
   *     { signal },
   *   );
   *
   *   for await (const event of stream) {
   *     if (
   *       event.type === "content_block_delta" &&
   *       event.delta.type === "text_delta"
   *     ) {
   *       yield event.delta.text;
   *     }
   *   }
   *
   *   const final = await stream.finalMessage();
   *   if (final.stop_reason === "refusal") {
   *     yield "\n\n[The model declined to answer this request.]";
   *   }
   *
   * Things that will bite you if you go from memory instead of the docs:
   *
   *   - The model ID is exactly `claude-opus-5`. Do not append a date suffix.
   *   - Extended thinking is ON by default, and `max_tokens` caps thinking AND
   *     visible text together. Size it generously or answers truncate midway.
   *   - `temperature`, `top_p`, and `top_k` are REJECTED with a 400. Steer
   *     behaviour with the system prompt instead.
   *   - Prefilling the assistant turn is also a 400. For structured output use
   *     `output_config.format` instead.
   *   - Check `stop_reason === "refusal"` before trusting the content.
   *
   * For tool use, wrap the above in a loop: when the model emits `tool_use`
   * blocks, run the tools, append the results as a `user` turn, and call again.
   * The SDK's `client.beta.messages.toolRunner()` does this loop for you.
   */
}
