/**
 * Smoke-test the Claude connection, independent of Next.js and the UI.
 *
 *   npm run check:agent
 *
 * Confirms four things in order: the key is present, it authenticates, the model
 * responds, and text arrives incrementally rather than in one lump. Run this
 * first whenever the agent misbehaves — it isolates the API from the app.
 */

// Explicit .ts extension: Node's native TypeScript runner does no extension
// resolution. The `@/…` alias is a bundler feature and won't work here either.
import { runAgent } from "../lib/agent.ts";

const PROMPT =
  'Identify the tactic in this line and name it in under 15 words: ' +
  '"So you\'re saying we should just let anyone do whatever they want?"';

if (!process.env.ANTHROPIC_API_KEY) {
  console.error(
    "\n  ANTHROPIC_API_KEY is not set.\n\n" +
      "  1. Get a key:  https://console.anthropic.com/settings/keys\n" +
      "  2. cp .env.example .env.local\n" +
      "  3. Add the key to .env.local\n",
  );
  process.exit(1);
}

console.log(`  model prompt: ${PROMPT}\n`);
process.stdout.write("  response:     ");

const startedAt = Date.now();
let chunks = 0;
let firstChunkAt = 0;
let text = "";

try {
  for await (const chunk of runAgent([{ role: "user", content: PROMPT }])) {
    if (chunks === 0) firstChunkAt = Date.now() - startedAt;
    chunks++;
    text += chunk;
    process.stdout.write(chunk);
  }
} catch (error) {
  const message = error instanceof Error ? error.message : String(error);
  console.error(`\n\n  FAILED: ${message}\n`);
  if (/401|authentication/i.test(message)) {
    console.error("  That looks like a bad or revoked key.\n");
  } else if (/429|rate/i.test(message)) {
    console.error("  Rate limited — wait and retry.\n");
  } else if (/credit|billing/i.test(message)) {
    console.error("  Check the workspace has credit.\n");
  }
  process.exit(1);
}

const totalMs = Date.now() - startedAt;

console.log(`\n\n  chunks:       ${chunks}`);
console.log(`  first chunk:  ${firstChunkAt}ms`);
console.log(`  total:        ${totalMs}ms`);

if (text.trim().length === 0) {
  console.error("\n  FAILED: connected, but the response was empty.\n");
  process.exit(1);
}

// More than one chunk means the generator really is streaming, not buffering.
console.log(
  chunks > 1
    ? "\n  OK — authenticated, model responded, and output streamed.\n"
    : "\n  OK — authenticated and model responded (arrived as a single chunk).\n",
);
