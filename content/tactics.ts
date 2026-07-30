import type { Tactic, TacticFamily, TacticId } from "@/lib/types";

/**
 * The taxonomy. Typed as a total record so the compiler refuses a build in
 * which a `TacticId` exists without a definition behind it.
 *
 * Prefer deepening these over adding more — someone who reliably spots
 * twenty tactics is better served than someone who half-recognises forty.
 */
export const TACTICS: Record<TacticId, Tactic> = {
  /* ── Logical fallacies — the argument's structure is broken ─────────── */

  "ad-hominem": {
    id: "ad-hominem",
    name: "Ad Hominem",
    family: "logical-fallacy",
    shortDef: "Attacks the person instead of their argument.",
    longDef:
      "The claim is left untouched while the speaker goes after whoever made it — their job, their past, their motives, their competence. It works because discrediting a source feels like discrediting a point. It isn't: a claim made by someone unpleasant can still be true.",
    example: "You'd expect that view from someone who's never run a business.",
    counterMove:
      "Even if that were true about me, it doesn't tell us whether the point is right. Can you address the point?",
  },

  "straw-man": {
    id: "straw-man",
    name: "Straw Man",
    family: "logical-fallacy",
    shortDef: "Rebuts a distorted, weaker version of what was said.",
    longDef:
      "Your actual position gets swapped for a cruder one that's easier to knock down, and then the crude one gets demolished. The tell is a restatement you don't recognise, often opening with \"so you're saying\" or \"what you really want is\".",
    example:
      "So you're saying we should just let anyone walk in and take whatever they want.",
    counterMove: "That isn't what I said. What I said was — and I'll say it again plainly.",
  },

  "false-dilemma": {
    id: "false-dilemma",
    name: "False Dilemma",
    family: "logical-fallacy",
    shortDef: "Presents two options when more exist.",
    longDef:
      "The choice is framed as exhaustive when it isn't, so that rejecting one option looks like endorsing the other. Compromises, third paths and 'not yet' all quietly disappear from the menu.",
    example: "Either we cancel the whole programme or we accept it as it is.",
    counterMove: "Those aren't the only two options. What about the middle ground?",
  },

  "slippery-slope": {
    id: "slippery-slope",
    name: "Slippery Slope",
    family: "logical-fallacy",
    shortDef: "Claims one step inevitably leads to an extreme outcome.",
    longDef:
      "A modest proposal is treated as the first domino in a chain ending somewhere alarming, with no argument for why any link in the chain must hold. The extreme endpoint does the persuading; the causal steps are never defended.",
    example: "Let them work from home one day and soon nobody comes in at all.",
    counterMove: "What makes the step from the first thing to the last one inevitable?",
  },

  "hasty-generalisation": {
    id: "hasty-generalisation",
    name: "Hasty Generalisation",
    family: "logical-fallacy",
    shortDef: "Draws a sweeping rule from too few cases.",
    longDef:
      "One or two vivid instances become a general law about a group, a place or a policy. Anecdotes are memorable and samples of one are always available, which is exactly why the leap feels reasonable when it isn't.",
    example: "I met two of them and both were rude. That whole town is unfriendly.",
    counterMove: "That's a couple of cases. Is there anything showing it holds generally?",
  },

  "false-cause": {
    id: "false-cause",
    name: "False Cause",
    family: "logical-fallacy",
    shortDef: "Treats sequence or correlation as proof of causation.",
    longDef:
      "Two things move together, or one follows the other, and that alone is offered as proof that the first caused the second. Coincidence, reverse causation and a shared third cause are all left unconsidered.",
    example: "Crime fell the year after the new signs went up. The signs worked.",
    counterMove: "It happened after, but what rules out the other things that changed?",
  },

  "circular-reasoning": {
    id: "circular-reasoning",
    name: "Circular Reasoning",
    family: "logical-fallacy",
    shortDef: "Uses the conclusion as its own evidence.",
    longDef:
      "The reason offered for a claim turns out to be a restatement of the claim. Nothing external is ever brought in, so the argument can never fail — and an argument that can't fail can't inform you either.",
    example: "It's the best option because nothing else comes close to being as good.",
    counterMove: "That's restating the claim. What's the evidence for it, separately?",
  },

  whataboutism: {
    id: "whataboutism",
    name: "Whataboutism",
    family: "logical-fallacy",
    shortDef: "Deflects criticism by pointing at someone else's fault.",
    longDef:
      "Instead of answering the criticism, the speaker raises a different wrongdoing by someone else. Even when the other wrongdoing is real, it doesn't address the original point — it just changes the subject while looking like a reply.",
    example: "You're worried about our record? Look at what the other lot did.",
    counterMove: "That may also be worth discussing. It doesn't answer what I asked about.",
  },

  "appeal-to-authority": {
    id: "appeal-to-authority",
    name: "Appeal to Authority",
    family: "logical-fallacy",
    shortDef: "Cites status rather than relevant expertise or evidence.",
    longDef:
      "A position is backed by who holds it rather than by what supports it — often someone eminent in an unrelated field, or an unnamed body of 'experts'. Genuine expert consensus is evidence; borrowed prestige is not.",
    example: "A Nobel winner said it, so I'll take that over your reading of the data.",
    counterMove: "What's their basis for saying it? Expertise in what, exactly?",
  },

  "no-true-scotsman": {
    id: "no-true-scotsman",
    name: "No True Scotsman",
    family: "logical-fallacy",
    shortDef: "Redefines a group to exclude inconvenient counter-examples.",
    longDef:
      "A general claim about a group meets a counter-example, and the group's definition quietly narrows to push that example out. The claim survives by becoming unfalsifiable rather than by being defended.",
    example: "Then they were never really one of us to begin with.",
    counterMove: "You've changed the definition to fit. By the original one, the example counts.",
  },

  /* ── Emotional manipulation — the target is your feelings ───────────── */

  "appeal-to-fear": {
    id: "appeal-to-fear",
    name: "Appeal to Fear",
    family: "emotional-manipulation",
    shortDef: "Substitutes a frightening image for an argument.",
    longDef:
      "A vivid threat is put in place of a reason. The danger may be real or invented; either way it's doing the work an argument should do, because frightened people stop asking how likely the danger actually is.",
    example: "Vote this through, and think about who's outside your door tonight.",
    counterMove: "How likely is that, actually? And would this proposal even prevent it?",
  },

  "appeal-to-outrage": {
    id: "appeal-to-outrage",
    name: "Appeal to Outrage",
    family: "emotional-manipulation",
    shortDef: "Provokes anger so the claim isn't examined.",
    longDef:
      "The point is wrapped in something infuriating so that reacting replaces thinking. Anger is engaging and it crowds out scrutiny, which is precisely why the most shareable version of a claim is often the least examined one.",
    example: "They're laughing at you while they do it. Absolutely disgraceful.",
    counterMove: "I can see why that's framed to make me angry. Is the underlying claim true?",
  },

  "guilt-tripping": {
    id: "guilt-tripping",
    name: "Guilt-Tripping",
    family: "emotional-manipulation",
    shortDef: "Makes disagreement feel like a moral failing.",
    longDef:
      "Saying no is recast as a defect in you — ungrateful, selfish, disloyal. The merits of the request never get discussed, because the conversation has been moved to whether you're a good person.",
    example: "After everything I've done for you, I'd have thought you'd say yes.",
    counterMove: "I do value what you've done. It's separate from whether I can do this.",
  },

  gaslighting: {
    id: "gaslighting",
    name: "Gaslighting",
    family: "emotional-manipulation",
    shortDef: "Denies your account of events to make you doubt your judgement.",
    longDef:
      "Something that happened is flatly denied, or your memory and perception are called unreliable, until you start trusting your own account less than theirs. It targets your confidence in yourself rather than any particular claim.",
    example: "That never happened. You've been imagining things a lot lately.",
    counterMove: "I know what I saw. Let's check what was actually said rather than debate my memory.",
  },

  darvo: {
    id: "darvo",
    name: "DARVO",
    family: "emotional-manipulation",
    shortDef: "Deny, Attack, and Reverse Victim and Offender.",
    longDef:
      "Three moves in one: deny the thing, attack the person raising it, and then claim to be the injured party. By the end the person who brought the complaint is the one apologising.",
    example:
      "I never did that, and frankly it's cruel of you to accuse me. Do you know how this makes me feel?",
    counterMove: "We can talk about how this conversation feels. First, did the thing happen?",
  },

  /* ── Rhetorical tricks — the framing does the work ──────────────────── */

  "loaded-question": {
    id: "loaded-question",
    name: "Loaded Question",
    family: "rhetorical-trick",
    shortDef: "Smuggles an unproven assumption into the question.",
    longDef:
      "The question is built so that any direct answer concedes something never established. Answering at all ratifies the premise, which is why the honest move is to refuse the frame before responding.",
    example: "So when did you decide the team's concerns weren't worth your time?",
    counterMove: "That question assumes something I don't accept. Let's establish that first.",
  },

  "loaded-language": {
    id: "loaded-language",
    name: "Loaded Language",
    family: "rhetorical-trick",
    shortDef: "Uses charged wording to pre-judge the issue.",
    longDef:
      "Word choice does the arguing. The same policy is a 'reform' or a 'raid', the same person a 'whistleblower' or a 'leaker'. The judgement arrives pre-installed in the vocabulary, before any case has been made.",
    example: "It isn't a fee, it's a shakedown — call it what it is.",
    counterMove: "Strip out the adjectives and describe what's actually being proposed.",
  },

  bandwagon: {
    id: "bandwagon",
    name: "Bandwagon",
    family: "rhetorical-trick",
    shortDef: "Treats popularity as evidence of truth.",
    longDef:
      "How many people believe something is offered as a reason to believe it. Consensus can be a signal when the crowd has independent access to the facts, but 'everyone thinks so' is not itself a reason, and popular beliefs have been wrong at scale before.",
    example: "Everyone's moved over to it already. You're the last one holding out.",
    counterMove: "Plenty of people believing it isn't the same as it being right. What's the case?",
  },

  "motte-and-bailey": {
    id: "motte-and-bailey",
    name: "Motte and Bailey",
    family: "rhetorical-trick",
    shortDef: "Retreats to a modest claim when the bold one is challenged.",
    longDef:
      "A strong, contestable claim (the bailey) is advanced; when challenged, the speaker falls back to a mild, obviously true version (the motte) and acts as though that's what they meant all along. Once the challenge passes, the strong claim returns.",
    example: "I only said we should care about it. Why are you against caring about it?",
    counterMove: "Nobody disputes the mild version. You were arguing the stronger one — let's stay there.",
  },

  "cherry-picking": {
    id: "cherry-picking",
    name: "Cherry-Picking",
    family: "rhetorical-trick",
    shortDef: "Selects only the evidence that fits.",
    longDef:
      "Every fact cited is true, and the set of them is chosen to point one way. Nothing has to be fabricated for the picture to be wrong — the distortion is in what was left out.",
    example: "Three quarters we've grown. I don't see the problem.",
    counterMove: "Those are real numbers. What does the full series look like?",
  },

  "gish-gallop": {
    id: "gish-gallop",
    name: "Gish Gallop",
    family: "rhetorical-trick",
    shortDef: "Buries a rebuttal under a flood of weak claims.",
    longDef:
      "Points are fired faster than any of them can be checked. Each one might take minutes to unpick and seconds to assert, so the sheer volume reads as an overwhelming case — and leaving any single point unanswered gets treated as conceding it.",
    example:
      "There's the funding, the timeline, the second report, the staffing, the precedent, the polling — shall I go on?",
    counterMove: "That's a lot at once. Pick the strongest one and let's do it properly.",
  },

  sealioning: {
    id: "sealioning",
    name: "Sealioning",
    family: "rhetorical-trick",
    shortDef: "Feigns polite curiosity to exhaust the other person.",
    longDef:
      "An endless series of civil requests for evidence, each reasonable-looking on its own. The courtesy is the cover: the goal is not to learn anything but to make continuing so tiring that you stop, at which point your silence is read as defeat.",
    example: "Genuine question though — source for that? Not trying to argue, just curious.",
    counterMove: "I've answered this a few times now. I'm going to leave it there.",
  },
};

/** Stable display order for anywhere the whole taxonomy is listed. */
export const FAMILY_LABELS: Record<TacticFamily, string> = {
  "logical-fallacy": "Logical fallacy",
  "emotional-manipulation": "Emotional manipulation",
  "rhetorical-trick": "Rhetorical trick",
};
