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

**Phase 1 (current — POC).** **Mindshield**, a single-player MCQ quiz. Three screens — welcome, question, results. Each question shows one argument and four candidate answers; the user selects, submits, reads why, and moves on. Any fallacy's definition can be opened in a dialog before committing. Static content, no accounts, no LLM calls.

> **`Mindshield.dc.html` in the Claude Design project is the specification for
> what Phase 1 ships** — its screens, copy, question bank, answer keys and
> interaction order are all authoritative. Where this file and that one
> disagree about the shipped surface, the design wins; treat the rest of this
> document as product intent and backlog. Re-read the design before changing
> the UI. See [DESIGN.md](DESIGN.md) for how it reaches the browser.
>
> **The mode picker and the free-text round are not in that file yet.** They
> were built from the Classical primitives directly, and the design file needs
> the new branch adding before it is the specification again. Until then it is
> authoritative for the welcome screen and the MCQ round only.

**Phase 2 (current).** A second way to answer the same five questions: instead
of picking from four options, the learner writes what's going on in their own
words and a grader marks it out of five, for a round total of twenty-five. The
welcome screen is shared; a mode picker sits between it and the round.

The grader is a seam with two implementations behind it, chosen by
`GRADER_CONFIG.mode` in `lib/config.ts`:

- `offline` (default) — `lib/mock-grader.ts`, a keyword grader scoring the same
  three-part rubric. No key, no network, so the demo can't fail on either. It
  understates by a mark rather than overstating; its limits are documented in
  the module.
- `claude` — `lib/evaluator.ts`, the real thing. Needs `ANTHROPIC_API_KEY`.

Both are reached only through `lib/grader.ts` and only from `app/api/grade/`,
so nothing about the key ever crosses the client boundary.

**Phase 3 and beyond.** Not committed. Likely directions: user-pasted
real-world content, progression and spaced repetition. **Do not build for these
now** — but keep the seams clean (see [Architectural seams](#architectural-seams)).

## Relationship to the scaffold

This repo started as a streaming **chat** template: `app/page.tsx` is a chat UI, `app/api/chat/route.ts` streams text out, and `lib/agent.ts` holds a placeholder `runAgent()` where Claude calls go.

Phase 1 is a quiz, not a chat, so:

- **`app/page.tsx` gets replaced** by the quiz UI.
- **Leave `lib/agent.ts` and `app/api/chat/` in place.** Phase 1 never calls them, and deleting them costs you the exact seam Phase 2 needs — LLM-graded rebuttals plug straight into `runAgent()`'s existing generator contract, streaming and abort handling included.

Nothing on a default run calls the Claude API. Quiz content is static and the
grader defaults to `offline`, so a live demo never depends on a network round
trip or an API key. Keep it that way: if you add a Claude call, put it behind a
switch that is off by default and a stand-in that works without it.

## Stack & layout

- **Next.js 16 (App Router) + React 19 + TypeScript (strict) + Tailwind CSS v4**
- **No `src/` directory** — `app/` and `lib/` sit at the repo root. `@/*` maps to `./*`, so import as `@/lib/types`.
- No database, no auth, no server state. Session progress lives in React state; anything that must survive a refresh goes in `localStorage`.

```
DESIGN.md               # how the Classical design system reaches the browser
app/
  page.tsx              # the route: welcome → mode picker → one of two rounds
  layout.tsx            # root layout — Cormorant/Lora fonts, flex-column shell
  globals.css           # Tailwind entry, Classical tokens, component layer
  api/chat/route.ts     # streaming HTTP layer — unused, kept for later
  api/grade/route.ts    # POST a rebuttal, get an Evaluation back
components/
  quiz/                 # WelcomeScreen, ModeSelectScreen, QuizScreen,
                        #   ResultsScreen, DefinitionDialog, ClassicFlow
  rebuttal/             # RebuttalFlow, RebuttalScreen,
                        #   RebuttalResultsScreen, ScoreMark
content/
  tactics.ts            # the answer keys — names and definitions
  questions.ts          # the question bank
  modes.ts              # copy for the mode picker and the free-text prompt
  grading-cues.ts       # the offline grader's vocabulary — never rendered
lib/
  types.ts              # shared types; chat Message types live here too
  content.ts            # the only door onto content/ — see Architectural seams
  config.ts             # the design's editor props, plus the grader switch
  agent.ts              # Claude calls — placeholder, still untouched
  grader.ts             # the only door onto grading; picks offline or claude
  evaluator.ts          # the Claude grader — prompt, rubric, structured output
  mock-grader.ts        # the offline grader — keyword scoring, no network
  quiz-machine.ts       # pure state transitions, MCQ round
  rebuttal-machine.ts   # pure state transitions, free-text round
  scoring.ts            # pure scoring for both rounds
```

Each round owns its own machine and its own flow component, and `app/page.tsx`
owns only the route between them. Neither round knows the other exists — which
is what keeps the MCQ path exactly as Phase 1 left it.

There is no `components/ui/` yet. Classical's primitives arrive as global CSS
classes (`.btn`, `.card`, `.tag`, `.input`) rather than React wrappers, so one
is only worth adding when a primitive needs real behaviour.

`app/layout.tsx` sets `<html class="h-full">` and `<body class="min-h-full flex flex-col">`, so the page is a flex column filling the viewport. Top-level page content needs `flex-1` to claim the space — the scaffold's `<main>` shows the pattern.

## Styling & theming

**Tailwind v4 is configured in CSS, not JavaScript.** There is no `tailwind.config.*` and adding one is the wrong move. Design tokens live in the `@theme inline` block in `app/globals.css`; extend the palette there and the utility classes follow.

**The look comes from Classical**, a design system authored in Claude Design and ported into `app/globals.css`. **`DESIGN.md` is the authoritative guide** — read it before touching styling. The short version: raw values live in `:root` as `--ds-*`, `@theme inline` republishes them under Tailwind's namespaces, and you take every colour, font, space, radius and shadow from a token.

**Dark mode is automatic**, driven by `prefers-color-scheme` in `app/globals.css`. Every quiz surface must be legible in both schemes — a card that only works on white is a broken card. Verify both before calling a component done. You should not need `dark:` variants: the tonal ramps are semantic and reverse in dark mode, so `--color-accent-100` is always the faintest tint on the current ground. Reach for ramp steps by role and both schemes follow.

**Fonts are wired to Classical's pairing** — Cormorant Garamond headings over Lora body, loaded via `next/font/google` in `app/layout.tsx` and exposed as `--font-heading` / `--font-body`, so `font-heading` and `font-body` just work. Geist is gone. Don't import another font, and don't swap in a sans-serif for emphasis — weight and italics do that job.

`--color-bg` / `--color-text` are the semantic base colours, with `--color-surface` one step off the ground and `--color-divider` for hairlines. Prefer these and the tonal ramps over hardcoded greys or ad-hoc `color-mix()`, so light and dark stay in step.

**Content lives in `content/` and nowhere else.** No question text, quote, or tactic definition inline in a component — ever. This is the seam that lets Phase 2 swap a static bank for a generated one without touching the UI.

> Next.js 16 diverges from older versions in ways that will bite you if you work from memory. `AGENTS.md` (imported above) and `node_modules/next/dist/docs/` are authoritative. Likewise, the Claude API notes in `lib/agent.ts` — correct model ID, why `temperature` returns a 400, how `max_tokens` interacts with extended thinking — are worth reading before any Phase 2 work.

## Domain model

Quiz types go in `lib/types.ts`, alongside the existing chat `Message` types. Keep the two groups visually separated; they serve different phases.

```ts
// The answer keys the design offers, as kebab-case slugs. `content/tactics.ts`
// is typed `Record<TacticId, Tactic>`, so the build fails if an id has no
// definition behind it and a question can't reference a key that doesn't exist.
type TacticId =
  | 'straw-man' | 'false-dilemma' | 'slippery-slope'
  | 'ad-hominem' | 'appeal-to-authority'
  | 'valid';               // not a fallacy — the reasoning actually holds

interface Tactic {
  id: TacticId;            // stable slug; never reuse or repurpose
  name: string;            // display name, e.g. "Straw Man"
  def: string;             // shown in the "What does this mean?" dialog
}

interface Question {
  id: string;
  statement: string;       // the argument under examination
  optionIds: [TacticId, TacticId, TacticId, TacticId];  // fixed order — the design doesn't shuffle
  answerId: TacticId;      // must be one of optionIds
  explanation: string;     // why the answer is right, grounded in the statement's wording
}

// Three screens, and within the quiz screen a select-then-submit cycle.
type Screen = 'welcome' | 'quiz' | 'results';
```

`valid` is load-bearing, not a filler option. Without it the quiz teaches that
every confident-sounding argument must be a trick, which is the opposite of the
product's job — and "this one is actually fine" is a genuinely hard call to
make. It appears as an option on every question in the bank.

## The tactic taxonomy

**What Phase 1 actually ships is the design's six answer keys** — Straw Man,
False Dilemma, Slippery Slope, Ad Hominem, Appeal to Authority, and `valid` —
across five questions. That is the whole live taxonomy.

The tables below are the **backlog**, not the current content. Prefer deepening
what ships over adding from them; a user who reliably spots six is better served
than one who half-recognises forty. Anything added here has to arrive in the
design file first — see the note under [Development phases](#development-phases).

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

**Definitions on demand.** Users must be able to read what each fallacy means *before* committing to an answer — most will not know all four terms. The design's mechanic is a "What does this mean?" button on every option, opening a dialog. It works by pointer, touch and keyboard alike, which is the requirement; hover-only would not be. `Valid argument` is the one option without a button, because there is no trick to look up.

**The reveal is the product.** Getting it wrong should feel like the most useful moment in the app, not a punishment. The answer key and the chosen option are both marked in place, and the feedback card says why. No harsh red, no penalty sounds, no streak-breaking drama.

**Accessibility is not a phase-3 concern.** Full keyboard operation, visible focus rings, correctness never signalled by colour alone (pair with icon and text), and respect `prefers-reduced-motion`.

Two things in the scaffold not to copy, since the quiz is far more keyboard- and motion-sensitive than a chat box:

- It animates (`animate-pulse` caret, `scrollIntoView({ behavior: "smooth" })`) with no `prefers-reduced-motion` guard, and `app/globals.css` has no reduced-motion block. Add one there rather than repeating the omission per component.
- Its textarea uses `outline-none` and signals focus with a border-colour shift only. Options in this app are chosen by keyboard, so focus must be unmistakable — keep the ring, or replace it with something at least as visible.

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

Add it to `Mindshield.dc.html` in the Claude Design project as well, or the two
will drift and the design stops being the specification.

1. Write the statement first, on its own. Does it sound like something a person would actually say?
2. Identify the answer. If you hesitate between two, the statement is ambiguous — fix the statement, not the answer key.
3. Choose three distractors a reasonable person might pick. `valid` belongs among the options on every question — it is what stops the quiz teaching that everything is a trick.
4. Write the `explanation`, quoting the actual words that do the work.
5. Check the bank's overall balance: political lean, correct-answer position, and coverage of the answer keys. **The current five questions never make `appeal-to-authority` the answer** — it appears only as a distractor, so nobody is ever tested on it. Worth fixing next time the bank grows.
