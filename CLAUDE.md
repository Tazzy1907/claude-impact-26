@AGENTS.md

# CLAUDE.md

Guidance for Claude Code when working in this repository. Read alongside `README.md`, which documents the scaffold; this file documents the *product*.

## What this project is

A web app that trains people to **recognise and name manipulation tactics and logical fallacies** in everyday persuasive speech.

The premise: the attention economy rewards outrage, and the people best at exploiting it are confident, fluent, and charismatic. On the receiving end that feels overwhelming — you sense something is wrong but can't articulate what. Naming the tactic is what converts that vague discomfort into a specific, answerable claim.

**The product's job is to make the user feel equipped, not clever.** Every design decision serves that. A user who finishes a round should be able to (a) name the tactic, (b) say why it's invalid, and (c) have a sentence ready to say back.

### Non-goals

- Not a political fact-checker. We teach argument *form*, never who is right about a topic.
- Not a gotcha quiz. Difficulty comes from realistic, subtle examples — never from trick questions or ambiguous answer keys.
- Not a debate-winning toolkit. The framing is self-defence and clarity, not owning people.

## Development phases

**Phase 1 (current — POC).** A single-player MCQ quiz. Each question shows a quote and four candidate tactics. The user picks one, sees whether they were right, and reads why. Users can inspect any option's definition before answering. Static content, no accounts, no LLM calls.

**Phase 2 and beyond.** Not committed. Likely directions: free-text rebuttal practice graded by Claude, user-pasted real-world content, progression and spaced repetition. **Do not build for these now** — but keep the seams clean (see [Architectural seams](#architectural-seams)).

## Relationship to the scaffold

This repo started as a streaming **chat** template: `app/page.tsx` is a chat UI, `app/api/chat/route.ts` streams text out, and `lib/agent.ts` holds a placeholder `runAgent()` where Claude calls go.

Phase 1 is a quiz, not a chat, so:

- **`app/page.tsx` gets replaced** by the quiz UI.
- **Leave `lib/agent.ts` and `app/api/chat/` in place.** Phase 1 never calls them, and deleting them costs you the exact seam Phase 2 needs — LLM-graded rebuttals plug straight into `runAgent()`'s existing generator contract, streaming and abort handling included.

Do not add Claude API calls in Phase 1. The content is static; a live demo shouldn't depend on a network round-trip or an API key.

## Stack & layout

- **Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS v4**
- **No `src/` directory** — `app/` and `lib/` sit at the repo root. Imports use the `@/` alias, e.g. `@/lib/types`.
- No database, no auth, no server state. Session progress lives in React state; anything that must survive a refresh goes in `localStorage`.

```
app/
  page.tsx              # Phase 1: the quiz (currently the scaffold's chat UI)
  api/chat/route.ts     # streaming HTTP layer — unused in Phase 1, kept for Phase 2
components/
  quiz/                 # QuestionCard, OptionButton, AnswerReveal, ProgressBar
  ui/                   # generic primitives (Button, Popover, Card)
content/
  tactics.ts            # the taxonomy — definitions, examples
  questions.ts          # the question bank
lib/
  types.ts              # shared types; chat Message types already live here
  agent.ts              # Claude calls — placeholder, untouched in Phase 1
  quiz-machine.ts       # pure state transitions
  scoring.ts            # pure scoring
```

**Content lives in `content/` and nowhere else.** No question text, quote, or tactic definition inline in a component — ever. This is the seam that lets Phase 2 swap a static bank for a generated one without touching the UI.

> Next.js 16 diverges from older versions in ways that will bite you if you work from memory. `AGENTS.md` (imported above) and `node_modules/next/dist/docs/` are authoritative. Likewise, the Claude API notes in `lib/agent.ts` — correct model ID, why `temperature` returns a 400, how `max_tokens` interacts with extended thinking — are worth reading before any Phase 2 work.

## Domain model

Quiz types go in `lib/types.ts`, alongside the existing chat `Message` types. Keep the two groups visually separated; they serve different phases.

```ts
type TacticId = string; // kebab-case slug, e.g. 'straw-man'; narrow to a union once tactics.ts exists

type TacticFamily = 'logical-fallacy' | 'emotional-manipulation' | 'rhetorical-trick';

interface Tactic {
  id: TacticId;          // stable slug; never reuse or repurpose
  name: string;          // display name, e.g. "Straw Man"
  family: TacticFamily;
  shortDef: string;      // <= 15 words, shown in the hover/tap definition
  longDef: string;       // 2-3 sentences, shown after answering
  example: string;       // one canonical line, distinct from any quote in the bank
  counterMove: string;   // what you can actually say when it's used on you
}

interface Question {
  id: string;
  quote: string;                 // the thing a person says
  context: string;               // e.g. "Reply under a news post" — sets the scene, never names a real person
  optionIds: [TacticId, TacticId, TacticId, TacticId];  // display order is shuffled at runtime
  answerId: TacticId;            // must be one of optionIds
  explanation: string;           // why the answer is right, grounded in the quote's wording
  distractorNotes: Partial<Record<TacticId, string>>;  // why each wrong option is wrong here
  rebuttal: string;              // one sentence the user could say back
  difficulty: 1 | 2 | 3;
}
```

`distractorNotes` and `rebuttal` are not optional extras — they are where the actual learning happens. A question without them is incomplete.

## The tactic taxonomy

Phase 1 ships a focused set. Prefer deepening these over adding more; a user who reliably spots twelve tactics is better served than one who half-recognises forty.

### Logical fallacies — the argument's structure is broken

| Tactic | In one line |
|---|---|
| Ad hominem | Attacks the person instead of their argument. |
| Straw man | Rebuts a distorted, weaker version of what was said. |
| False dilemma | Presents two options when more exist. |
| Slippery slope | Claims one step inevitably leads to an extreme outcome. |
| Hasty generalisation | Draws a sweeping rule from too few cases. |
| False cause | Treats sequence or correlation as proof of causation. |
| Circular reasoning | Uses the conclusion as its own evidence. |
| Whataboutism | Deflects criticism by pointing at someone else's fault. |
| Appeal to authority | Cites status rather than relevant expertise or evidence. |
| No true Scotsman | Redefines a group to exclude inconvenient counter-examples. |

### Emotional manipulation — the target is your feelings, not your reasoning

| Tactic | In one line |
|---|---|
| Appeal to fear | Substitutes a frightening image for an argument. |
| Appeal to outrage | Provokes anger so the claim isn't examined. |
| Guilt-tripping | Makes disagreement feel like a moral failing. |
| Gaslighting | Denies your account of events to make you doubt your judgement. |
| DARVO | Deny, Attack, and Reverse Victim and Offender. |

### Rhetorical tricks — the framing does the work

| Tactic | In one line |
|---|---|
| Loaded question | Smuggles an unproven assumption into the question. |
| Loaded language | Uses charged wording to pre-judge the issue. |
| Bandwagon | Treats popularity as evidence of truth. |
| Motte and bailey | Retreats to a modest claim when the bold one is challenged. |
| Cherry-picking | Selects only the evidence that fits. |
| Gish gallop | Buries a rebuttal under a flood of weak claims. |
| Sealioning | Feigns polite curiosity to exhaust the other person. |

## Content authoring rules

These are the project's quality bar. Hold them.

**Quotes**

- Write how people actually talk — including online: fragments, sarcasm, all-caps, "Genuine question though".
- Vary the setting: social replies, workplace meetings, adverts, family arguments, news panels, group chats.
- **Never attribute to a real person, party, company, or ongoing news event.** Use unnamed speakers and generic framing. This keeps the tool politically neutral and avoids defaming anyone.
- Balance targets. If several quotes lean one political direction, the app reads as partisan and loses the audience it most needs to reach.
- Keep them short — roughly 15 to 45 words. Long enough to contain the tactic, short enough to scan.

**Answers**

- **Exactly one option must be defensible.** If a thoughtful person could argue for a second option, rewrite the quote until they can't. This is the single most important rule in the file.
- Distractors must be genuinely plausible — usually from the same family as the answer. Four options where three are obviously silly teach nothing.
- No length tell: the correct option must not be systematically the longest or most specific.
- Distribute the correct answer evenly across positions and across the taxonomy.

**Explanations**

- Quote the actual words that constitute the tactic. "Notice 'so you're saying we should just do nothing' — that isn't what was claimed."
- The `rebuttal` must be something a real person could say out loud without sounding like a textbook. Calm and specific beats witty.
- Never moralise about the speaker. The tactic is the problem, not their character — the app would be self-undermining otherwise.

## Interaction requirements

**Definitions on demand.** Users must be able to read what each tactic means *before* committing to an answer — most will not know all four terms. The mechanic is hover **plus** click/tap **plus** keyboard focus. Hover-only is inaccessible on touch and to keyboard users, and this is a learning tool, so an unreachable definition is a broken feature.

**The reveal is the product.** Getting it wrong should feel like the most useful moment in the app, not a punishment. Show what the tactic was, why it applies here, why the option they picked doesn't, and what they could say back. No harsh red, no penalty sounds, no streak-breaking drama.

**Accessibility is not a phase-3 concern.** Full keyboard operation, visible focus rings, correctness never signalled by colour alone (pair with icon and text), and respect `prefers-reduced-motion`.

## Architectural seams

Keep these boundaries clean so later phases don't require a rewrite:

1. **Content access goes through one module.** Components ask for questions via a single function; they never import `content/questions.ts` directly. Swapping in generated or remote content becomes a one-file change.
2. **Quiz state transitions are pure functions** in `lib/quiz-machine.ts`, testable without rendering anything.
3. **Nothing about the UI assumes a fixed question count** — a round is however many questions the content module hands over.
4. **The agent boundary stays as the scaffold left it.** Phase 2 implements `runAgent()`; nothing else should need to change.

## Conventions

- TypeScript strict. No `any`. Domain types live in `lib/types.ts` and are imported, not re-declared.
- Functional components with hooks; no class components.
- Tailwind utilities in markup. Reach for `@apply` only when a pattern genuinely repeats.
- Named exports throughout, except Next.js pages and layouts, which must be default.
- Anything touching the API key or the agent stays server-side — inside `app/api/` or `lib/`. Never import `lib/agent.ts` into a `"use client"` file.
- Comments explain *why*. Do not narrate what the code plainly does.
- `TacticId` values are permanent identifiers. Renaming a display name is fine; changing an id silently invalidates every question referencing it.

## Commands

```bash
npm run dev     # dev server with hot reload
npm run build   # production build — also type-checks; must pass before any PR
npm start       # serve the production build
npm run lint    # ESLint
```

No test runner is configured. `lib/quiz-machine.ts` and `lib/scoring.ts` are written as pure functions so one can be added later without restructuring; if you add it, Vitest fits this stack with the least config.

## When adding a question

1. Write the quote first, on its own. Does it sound like something a person would actually say?
2. Identify the tactic. If you hesitate between two, the quote is ambiguous — fix the quote, not the answer key.
3. Choose three distractors that a reasonable person might pick, and write `distractorNotes` explaining why each misses.
4. Write the `rebuttal`. If you can't produce a natural one, the question probably isn't teaching anything actionable.
5. Check the bank's overall balance: political lean, correct-answer position, tactic coverage, difficulty spread.
