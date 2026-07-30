# claude-impact-26

Base template for an agentic web app. Next.js + TypeScript + Tailwind, one repo,
one language.

The streaming pipeline is already built and working — browser → API route →
agent → incremental render. **The agent itself is a placeholder.** There's one
function to implement and everything else keeps working around it.

## Setup

```bash
git clone https://github.com/Tazzy1907/claude-impact-26.git
cd claude-impact-26
npm install
cp .env.example .env.local   # then add your Anthropic API key
npm run dev
```

Open <http://localhost:3000>. Send a message — you'll get a placeholder response
that streams in word by word. That confirms the whole pipeline works.

You don't need an API key until you start on the agent; the placeholder doesn't
call anything.

## Where the agent goes

**`lib/agent.ts` → `runAgent()`.** That's it. The contract:

```ts
async function* runAgent(
  messages: Message[],      // full conversation, oldest first
  signal?: AbortSignal,     // aborts on Stop / tab close
): AsyncGenerator<string>   // yield text chunks as they arrive
```

Replace the placeholder block with real Claude calls. **Nothing else needs to
change** — the route handler, streaming, message state, Stop button, and error
handling all already work against this signature.

`lib/agent.ts` has a commented-out reference implementation to start from, plus
notes on the API details that are easy to get wrong (correct model ID, why
`temperature` will 400 you, how `max_tokens` interacts with extended thinking).
Read those before writing the call — they'll save you a debugging session.

## Layout

| Path | What it's for |
| --- | --- |
| `lib/agent.ts` | **The agent. This is the file you edit.** |
| `lib/types.ts` | `Message` type + request validation, shared by client and server |
| `app/api/chat/route.ts` | HTTP layer: validates the body, streams the generator out |
| `app/page.tsx` | Chat UI — message list, streaming render, Stop, error display |
| `app/layout.tsx` | Root layout, fonts, metadata |
| `app/globals.css` | Tailwind entry point and theme variables |
| `.env.example` | Template for `.env.local` |

## Stack

- **Next.js 16** (App Router) + **React 19**
- **TypeScript**
- **Tailwind CSS v4**
- **`@anthropic-ai/sdk`** — installed and ready, not yet called

Default model is `claude-opus-5`. The API key is read server-side only and is
never sent to the browser.

> Next.js 16 changed a fair amount from older versions. The docs ship with the
> install — see `node_modules/next/dist/docs/`, and `AGENTS.md` if you're using
> an AI assistant on this repo.

## Scripts

| Command | Does |
| --- | --- |
| `npm run dev` | Dev server with hot reload |
| `npm run build` | Production build (also type-checks) |
| `npm start` | Serve the production build |
| `npm run lint` | ESLint |

## Conventions

- Anything touching the API key or the agent stays server-side — inside
  `app/api/` or `lib/`. Never import `lib/agent.ts` into a `"use client"` file.
- `lib/types.ts` is the single source of truth for the message shape. Change it
  there and both sides follow.
- Yield small chunks from `runAgent`. Each one flushes to the browser
  immediately; returning one big string kills the streaming effect.
