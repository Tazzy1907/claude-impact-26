# Design

How this app consumes **Classical**, the design system in Claude Design
(project `8d4817b3-4959-470b-932e-fde552527f33`).

Classical is an editorial, book-like system on a soft near-white ground:
Cormorant Garamond headings over Lora body, hairline rules, and colour applied
as **stroke rather than fill**. Surfaces stay quiet — cards are bordered,
buttons are outlined, photographs sit matted like tipped-in plates.

Upstream `styles.css` is the source of truth for the look. This document is
the source of truth for how it reaches the browser.

## The one rule

Take every colour, font, space, radius and shadow from a token. Never
hard-code a hex, a font name, or a pixel value the scale already carries. If
something you need isn't in the tokens, add it to the application layer in
`app/globals.css` and record it here — don't inline it.

## How the tokens get here

There is no live link to Claude Design; the tokens were ported once, by hand,
into `app/globals.css`. That file has four parts, in order:

1. **`:root` raw values** — every token as `--ds-*`. These are the only
   literals in the codebase.
2. **A `prefers-color-scheme: dark` block** — the same `--ds-*` names,
   different values.
3. **`@theme inline`** — republishes each `--ds-*` under Tailwind's own
   namespace.
4. **The component and application layers** — plain CSS classes built from
   the tokens.

Step 3 is the load-bearing one. Because Tailwind v4 is configured in CSS
rather than JavaScript, a single declaration —

```css
@theme inline {
  --color-accent: var(--ds-accent);
}
```

— produces *both* the utility `text-accent` / `border-accent` and the variable
`var(--color-accent)` that Classical's own documentation tells you to use. The
two styling idioms therefore read from one definition, and `--ds-accent`
flipping in dark mode moves both.

> There is no `tailwind.config.*` and adding one is the wrong move.

### Namespace mapping

Classical's token names land almost exactly on Tailwind v4's theme
namespaces, which is why the port is thin:

| Classical | Tailwind namespace | Yields |
|---|---|---|
| `--color-bg`, `--color-surface`, `--color-text`, `--color-accent`, `--color-divider` | `--color-*` | `bg-surface`, `text-accent`, `border-divider` |
| `--color-neutral-100…900`, `--color-accent-100…900`, `--color-accent-2-100…900` | `--color-*` | `bg-accent-100`, `text-accent-800` |
| `--radius-sm/md/lg` (2 / 4 / 7px) | `--radius-*` | `rounded-md` |
| `--shadow-sm/md/lg` | `--shadow-*` | `shadow-md` |
| Cormorant Garamond / Lora | `--font-*` | `font-heading`, `font-body` |
| `--space-1…8` | `--spacing` | see below |

**Density is a single number.** Classical sets density `1.15`, and its
`--space-*` scale is just `4px × 1.15` and its multiples. Tailwind derives
every numeric spacing utility from one `--spacing` multiplier, so:

```css
@theme { --spacing: 0.2875rem; }   /* 0.25rem × 1.15 */
```

reproduces the whole scale exactly — `p-1` = 4.6px, `p-4` = 18.4px,
`gap-6` = 27.6px. Use the utilities; the density comes along for free. The
upstream `--space-1…8` names are also republished for the hand-written CSS in
the component layer.

## What this port changes

Three deliberate departures from upstream. Everything else is class-for-class.

### 1. A dark scheme (upstream has none)

Classical is a light-only system, but this app must be legible in both — so
the dark block is **derived from Classical rather than invented**. The ground
drops to the deep warm near-black the readme reserves for colophon pages, and
the base accent moves one step lighter (`#e1ad66`) so it still clears 3:1.

The important part: **the tonal ramps reverse.** Ramp steps here are
*semantic*, not absolute — `100` is always the faintest tint on the current
ground and `900` the heaviest ink on it. That single decision is why

```css
.tag-accent { background: var(--color-accent-100); color: var(--color-accent-800); }
```

is correct in both schemes with no `dark:` variant anywhere in the markup.
**Follow this when adding components:** reach for ramp steps by their role,
never for a specific colour, and dark mode takes care of itself.

The one value that must *not* follow the reversal is the modal scrim — a
backdrop is dark on any ground — so it is pinned separately as `--ds-scrim`.

### 2. Fonts are self-hosted

Upstream pulls Cormorant Garamond and Lora from a Google Fonts `@import`
inside `styles.css`. Here they load through `next/font/google` in
`app/layout.tsx`, which self-hosts them and supplies a metric-matched
fallback — no render-blocking third-party request, no layout shift. The
`@import` is deliberately absent from `app/globals.css`.

### 3. A reduced-motion block

`app/globals.css` collapses animation, transition and smooth scrolling under
`prefers-reduced-motion: reduce`. This is global on purpose, so no component
has to remember it.

## The layers in `app/globals.css`

**Ported component layer** — class-for-class from Classical, so markup stays
interchangeable with the design system's own pages:

`.hr` · `.btn` (`.btn-primary`, `.btn-secondary`, `.btn-ghost`, `.btn-icon`,
`.btn-block`) · `.field` / `.input` / `.radio` / `.seg` · `.card`
(`.card-kicker`, `.card-title`, `.card-body`, `.card-meta`) · `.elev-sm/md/lg`
· `.tag` (`.tag-accent`, `.tag-accent-2`, `.tag-neutral`, `.tag-outline`) ·
`.nav` · `.dialog` · `.plate` · `.text-muted`

The forms classes are unused in Phase 1 and ported anyway: Phase 2's free-text
rebuttal lands on `textarea.input`, and a partial port is how systems drift.

**Application layer** — patterns this product needs that Classical doesn't
define. Built only from its tokens and obeying its rules, so they sit
alongside the ported layer without arguing with it:

| Class | What it is |
|---|---|
| `.quote` | The quote under examination — display type at the normal cut against an accent hairline |
| `.option`, `.option-answer`, `.option-missed`, `.option-dimmed`, `.option-mark`, `.option-label` | An answer option and its reveal states |
| `.def-rail` | Reserved block holding the definition of whichever option is hovered, focused or pinned |
| `.progress`, `.progress-fill` | Progress as a filling hairline, since the page's structure is rules |
| `.reveal`, `.reveal-heading` | The teaching panel after an answer |
| `.rebuttal` | The sentence you could say back — the payload of the screen |
| `.tnum` | Tabular figures for anything that stands as a figure or a column |

These are the candidates to push back upstream into Classical.

## Rules for new UI

From Classical, and they are not negotiable if the app is to stay coherent:

- **Do** draw with borders, rules and underlines. Let hairlines
  (`var(--color-divider)`) carry the structure.
- **Do** give text room. The spacing scale is airy by design.
- **Don't** fill cards or buttons with solid accent colour. The primary
  button is an accent *outline*.
- **Don't** use heavy drop shadows — elevation here is a whisper.
- **Don't** swap in a sans-serif for emphasis. Weight and italics do that job,
  and semibold (`--font-heading-weight`) is the ceiling for interface
  headings. The bigger the text, the lighter it sets.
- **Don't** use `--color-accent` for paragraph-size text. The accent-to-ground
  pair is tuned to 3:1 — enough for icons, large text and chrome, not for body
  copy. Use `--color-accent-700` instead.
- Icons are [Lucide](https://lucide.dev), via `lucide-react`.

## Accessibility commitments

Not a later phase. Every one of these is load-bearing in a learning tool:

- **Definitions before committing.** Most people won't know all four terms, so
  a definition is reachable three ways — hover, keyboard focus, and a tap
  target that pins it open. Screen readers don't depend on any of that: each
  option carries its own definition via `aria-describedby`.
- **Correctness is never colour alone.** Every reveal state pairs a stroke
  treatment with a Lucide icon *and* a word ("The tactic", "Your pick").
- **No harsh red.** Getting it wrong is the most useful moment in the app, so
  a missed pick gets a dashed hairline and a label, not a penalty colour.
- **Focus is unmistakable.** `:focus-visible` is a 2px accent ring at 2px
  offset, set globally. Never `outline: none` without a replacement at least
  as visible.
- **Focus moves with the user.** Advancing a question sends focus to the top
  of the new one, so a keyboard user doesn't restart from the header.
- Both colour schemes are verified before a component is called done.

## Re-syncing with Claude Design

The sync is one-way and manual. If Classical changes upstream, re-read its
`styles.css`, update the `--ds-*` blocks in `app/globals.css`, and check this
document still describes what the CSS does. If a pattern in the application
layer above proves general, push it up to Classical so the next project
inherits it.

Keep `theme.json`, `styles.css` and the written guidance in step. They drift
quietly, and a token sheet nobody trusts stops being a token sheet.
