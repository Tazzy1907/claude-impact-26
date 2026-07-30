import type { Question } from "@/lib/types";

/**
 * The question bank.
 *
 * Every entry obeys the authoring rules in CLAUDE.md: exactly one defensible
 * answer, distractors drawn mostly from the answer's own family, no length
 * tell, no real person or organisation named, and a `rebuttal` a person could
 * plausibly say out loud.
 *
 * Nothing imports this directly — go through `lib/content.ts`.
 */
export const QUESTIONS: Question[] = [
  {
    id: "q-straw-man-approvals",
    quote:
      "Right, so the plan is we stop checking anything and just hope for the best. Bold.",
    context: "In a team meeting, after a colleague proposed removing one approval step",
    optionIds: ["false-dilemma", "straw-man", "ad-hominem", "loaded-language"],
    answerId: "straw-man",
    explanation:
      "One approval step was on the table. \"Stop checking anything\" is a different, far weaker proposal — and it's the one being mocked. The rebuttal never touches what was actually suggested.",
    distractorNotes: {
      "false-dilemma":
        "No choice is offered here. A false dilemma narrows the options to two; this narrows the other person's position to one absurd version of it.",
      "ad-hominem":
        "\"Bold\" is sarcasm aimed at the proposal, not at the colleague's character, motives or competence.",
      "loaded-language":
        "The wording is fairly plain. What does the damage is the substitution of a weaker proposal, not any charged vocabulary.",
    },
    rebuttal:
      "I suggested dropping one step, not all of them. Can you tell me what's wrong with that step specifically?",
    difficulty: 1,
  },

  {
    id: "q-false-cause-bins",
    quote:
      "They put the new bins in at the start of March and the fly-tipping stopped by April. Say what you like about the council, the bins fixed it.",
    context: "A message in a neighbourhood group chat",
    optionIds: ["hasty-generalisation", "cherry-picking", "false-cause", "circular-reasoning"],
    answerId: "false-cause",
    explanation:
      "The only support offered is the order of events: bins in March, fly-tipping gone by April. \"The bins fixed it\" treats that sequence as proof of a cause, with nothing ruling out the weather, enforcement, or whoever was dumping simply moving on.",
    distractorNotes: {
      "hasty-generalisation":
        "No general rule is being drawn from a small sample — this is a claim about one causal link in one street.",
      "cherry-picking":
        "Nothing suggests favourable facts were selected from a larger set. The problem is the inference from the facts given, not the choice of them.",
      "circular-reasoning":
        "A separate fact is offered as evidence — the timing. It's inadequate evidence, but it isn't the conclusion restated.",
    },
    rebuttal:
      "It did happen after the bins went in. What else changed around March that we'd need to rule out?",
    difficulty: 1,
  },

  {
    id: "q-loaded-question-safety",
    quote:
      "Let's start with the obvious one: when did your department decide the safety checks weren't worth doing properly?",
    context: "Opening question to a guest on a news panel",
    optionIds: ["loaded-question", "ad-hominem", "straw-man", "loaded-language"],
    answerId: "loaded-question",
    explanation:
      "\"When did your department decide\" presupposes that it did decide. Any direct answer — a date, a name, even \"we didn't decide that in March\" — accepts a premise that was never established.",
    distractorNotes: {
      "ad-hominem":
        "The department's conduct is the target, not the guest's character or standing. Nothing here says they're unqualified to answer.",
      "straw-man":
        "Nothing the guest said is being restated. The assumption is introduced fresh rather than distorted from a stated position.",
      "loaded-language":
        "\"Worth doing properly\" is mild as charged wording goes. The trap is structural: it's carried by the question's grammar, not its adjectives.",
    },
    rebuttal:
      "I'm not going to answer that as put, because it assumes a decision that didn't happen. Ask me whether it did and I'll tell you.",
    difficulty: 2,
  },

  {
    id: "q-bandwagon-switchers",
    quote:
      "Four hundred thousand people switched to us last year. Four hundred thousand. Isn't it time you found out what they already know?",
    context: "Voiceover in a radio advert",
    optionIds: ["appeal-to-authority", "bandwagon", "appeal-to-fear", "cherry-picking"],
    answerId: "bandwagon",
    explanation:
      "The entire case is a headcount. \"What they already know\" asserts that the crowd's size settles whether the product is any good — no feature, price or comparison is ever mentioned.",
    distractorNotes: {
      "appeal-to-authority":
        "No expert, title or institution is invoked. A large crowd is not an authority, however large.",
      "appeal-to-fear":
        "Nothing frightening is described. The pressure is social — missing out — rather than a threat.",
      "cherry-picking":
        "One figure is quoted, but the fallacy isn't a selective reading of evidence; it's treating adoption numbers as a reason in the first place.",
    },
    rebuttal:
      "Lots of people choosing something doesn't tell me it's better. What's actually different about it?",
    difficulty: 1,
  },

  {
    id: "q-guilt-trip-appointments",
    quote:
      "Fine. Go. I'll sort the hospital appointments on my own, like always. I just thought one of my children might have wanted to be there.",
    context: "Said at the end of a phone call with a parent",
    optionIds: ["darvo", "guilt-tripping", "gaslighting", "appeal-to-outrage"],
    answerId: "guilt-tripping",
    explanation:
      "The request itself is never argued for. \"One of my children might have wanted to be there\" reframes a scheduling conflict as evidence of what kind of child you are, so that declining costs you your standing rather than your afternoon.",
    distractorNotes: {
      darvo: "Nothing is being denied and no accusation is reversed — there's no allegation in play to deny.",
      gaslighting:
        "Your memory and perception aren't challenged. You're not being told the events were different, only that your choice reflects badly on you.",
      "appeal-to-outrage":
        "The feeling being provoked is guilt, not anger, and there's no third party cast as the villain.",
    },
    rebuttal:
      "I do want to be there, and I can't be on that date. Can we look at the other appointments together?",
    difficulty: 1,
  },

  {
    id: "q-motte-bailey-research",
    quote:
      "Steady on — all I said was that we should look at research critically. That's hardly a controversial position.",
    context:
      "Reply in a comment thread, after being challenged on their earlier claim that one study 'proves the whole field is fraudulent'",
    optionIds: ["straw-man", "circular-reasoning", "motte-and-bailey", "no-true-scotsman"],
    answerId: "motte-and-bailey",
    explanation:
      "Two different claims are in play. The one that drew the challenge was that a field is fraudulent; the one now being defended is that research deserves scrutiny. The second is unarguable, which is exactly why the retreat to it works — and why the first never gets defended.",
    distractorNotes: {
      "straw-man":
        "A straw man distorts the *other* person's position. Here the speaker is restating their own, in a much milder form.",
      "circular-reasoning":
        "No conclusion is being used as its own evidence. The move is swapping which conclusion is under discussion.",
      "no-true-scotsman":
        "No group is being redefined to exclude an awkward example; the shift is between two claims, not two definitions of a category.",
    },
    rebuttal:
      "Nobody disagrees with the careful version. You said the field was fraudulent — is that still what you're arguing?",
    difficulty: 3,
  },

  {
    id: "q-whataboutism-deadline",
    quote:
      "Sure, we were two weeks late. Worth remembering the last agency you used went three months over and billed you for it anyway.",
    context: "In a client review meeting, after a missed deadline is raised",
    optionIds: ["ad-hominem", "whataboutism", "cherry-picking", "false-dilemma"],
    answerId: "whataboutism",
    explanation:
      "The delay is conceded and then immediately set beside someone else's worse delay. Whether the previous agency was late has no bearing on this one's two weeks, but raising it changes what the room is discussing.",
    distractorNotes: {
      "ad-hominem":
        "The criticism lands on an absent third party, not on the client raising the issue. Nobody's character is being used to dismiss their point.",
      "cherry-picking":
        "No selective use of evidence — the speaker concedes their own delay rather than picking flattering facts about it.",
      "false-dilemma":
        "No two-way choice is presented. The subject is changed rather than narrowed.",
    },
    rebuttal:
      "That might be true, and it's a separate conversation. What happened with our two weeks?",
    difficulty: 1,
  },

  {
    id: "q-no-true-scotsman-forum",
    quote:
      "He was never a real restorer though. Anyone who'd cut corners like that was only ever in it to flip the thing for a profit.",
    context: "Reply in a hobbyist forum, after someone cites a well-known member's bad workmanship",
    optionIds: ["hasty-generalisation", "ad-hominem", "no-true-scotsman", "straw-man"],
    answerId: "no-true-scotsman",
    explanation:
      "A counter-example turns up and the category quietly narrows to shut it out. \"Never a real restorer\" makes the original claim safe by definition — anyone who disproves it is reclassified rather than accounted for.",
    distractorNotes: {
      "hasty-generalisation":
        "That draws a broad rule from too few cases. This does the reverse: it removes a case so an existing rule survives.",
      "ad-hominem":
        "The absent member's motives are impugned, but no argument of theirs is being sidestepped — they aren't the one making a case.",
      "straw-man":
        "Nobody's position is restated in weakened form. The example is disputed, not the argument around it.",
    },
    rebuttal:
      "You've changed what 'restorer' means so the example doesn't count. By the definition you started with, he does.",
    difficulty: 2,
  },

  {
    id: "q-appeal-to-fear-security",
    quote:
      "It takes eleven seconds to force a door like yours. Picture where your children sleep. Now picture the stairs. We can have an engineer with you tomorrow.",
    context: "Voiceover in a home-security advert",
    optionIds: ["appeal-to-outrage", "appeal-to-fear", "bandwagon", "loaded-language"],
    answerId: "appeal-to-fear",
    explanation:
      "\"Picture where your children sleep\" isn't evidence of anything — it's an image, placed where a reason should be. The eleven seconds is never compared to how often this happens, because the point is to make you feel the risk rather than weigh it.",
    distractorNotes: {
      "appeal-to-outrage":
        "Fear and anger are different levers. Nobody here is presented as having wronged you — there's no target to be furious at.",
      bandwagon:
        "No claim at all about what other people are buying or believing.",
      "loaded-language":
        "The vocabulary is plain and concrete — doors, stairs, seconds. The frightening picture does the work, not charged wording.",
    },
    rebuttal:
      "How often does that actually happen on a street like mine, and how much of it would this prevent?",
    difficulty: 1,
  },

  {
    id: "q-cherry-picking-allhands",
    quote:
      "Since the relaunch: sign-ups up 40%, our app-store rating up half a star, and June was the best week we've ever had.",
    context: "A slide at a company all-hands. Revenue and cancellations are not on it",
    optionIds: ["false-cause", "cherry-picking", "hasty-generalisation", "bandwagon"],
    answerId: "cherry-picking",
    explanation:
      "Every number is presumably true, and they all point one way. The distortion is in what isn't on the slide — revenue and cancellations, the two figures that would tell you whether the picture holds.",
    distractorNotes: {
      "false-cause":
        "That needs a causal claim to misfire on. The slide is careful not to make one; it selects rather than explains.",
      "hasty-generalisation":
        "These aren't a handful of cases generalised into a rule — they're aggregate figures, chosen selectively.",
      bandwagon:
        "Sign-ups appear as a business metric, not as an argument that you should agree because others did.",
    },
    rebuttal:
      "Those all look good. Can we see revenue and cancellations on the same chart before we call it?",
    difficulty: 3,
  },

  {
    id: "q-sealioning-thread",
    quote:
      "Genuine question, not trying to be difficult — do you have a source for that? I'd honestly just like to read it myself. Happy to wait.",
    context: "The fourth such reply from the same account, under a short personal post",
    optionIds: ["gish-gallop", "loaded-question", "sealioning", "appeal-to-authority"],
    answerId: "sealioning",
    explanation:
      "Read once, this is a reasonable request. Read as the fourth in a row it's the tactic: unfailing politeness plus inexhaustible persistence, until continuing costs you more than walking away — and walking away reads as having no answer.",
    distractorNotes: {
      "gish-gallop":
        "The opposite shape. A gallop overwhelms with many claims at once; this is one modest request, repeated past the point of good faith.",
      "loaded-question":
        "The question carries no hidden premise — asking for a source assumes nothing. What makes it a tactic is the repetition, not the content.",
      "appeal-to-authority":
        "Asking for a source is not citing status. If anything it's the opposite move.",
    },
    rebuttal:
      "I've pointed you at this a few times now. I'm going to leave it there — you're welcome to look it up.",
    difficulty: 3,
  },

  {
    id: "q-false-dilemma-parking",
    quote:
      "There are two ways this goes. We back the scheme tonight, or we accept the street stays exactly as it is for another decade.",
    context: "Said at a residents' meeting about a proposed parking change",
    optionIds: ["slippery-slope", "false-dilemma", "appeal-to-fear", "straw-man"],
    answerId: "false-dilemma",
    explanation:
      "\"There are two ways this goes\" is the whole trick. Amending the scheme, deferring it, or trying a smaller version first are all real options, and naming only two makes hesitation look like choosing the bad one.",
    distractorNotes: {
      "slippery-slope":
        "No chain of consequences is claimed. This presents two endpoints, not an inevitable slide from one step to a distant outcome.",
      "appeal-to-fear":
        "Another decade of the status quo is unappealing, but nothing threatening is invoked and no alarming image is offered.",
      "straw-man":
        "Nobody's position is being restated in weakened form — the options are narrowed before anyone has stated one.",
    },
    rebuttal:
      "Those aren't the only two outcomes. What happens if we amend it and vote next month?",
    difficulty: 1,
  },

  {
    id: "q-ad-hominem-rent",
    quote:
      "Easy to say when you've never had to worry about rent in your life. Maybe sit this one out.",
    context: "Reply under a post about housing supply",
    optionIds: ["whataboutism", "guilt-tripping", "ad-hominem", "straw-man"],
    answerId: "ad-hominem",
    explanation:
      "The argument about housing supply is never engaged with. What's offered instead is a claim about the speaker's circumstances, and \"sit this one out\" makes the point explicit: they should be discounted because of who they are.",
    distractorNotes: {
      whataboutism:
        "No counter-accusation about a third party's conduct — the deflection is onto the person in front of them, not away to someone else.",
      "guilt-tripping":
        "Guilt-tripping pushes you into compliance by making refusal a moral failing. This isn't asking for anything; it's dismissing.",
      "straw-man":
        "Their position isn't restated at all, distorted or otherwise. It's simply set aside.",
    },
    rebuttal:
      "You might be right about my situation. It still doesn't tell us whether the argument holds — does it?",
    difficulty: 1,
  },

  {
    id: "q-gaslighting-argument",
    quote:
      "Nobody raised their voice. You were tired, and you've been reading things into everything lately — ask anyone who was there.",
    context: "Said at home, the day after an argument in front of friends",
    optionIds: ["darvo", "gaslighting", "guilt-tripping", "ad-hominem"],
    answerId: "gaslighting",
    explanation:
      "Your account is denied outright and then your capacity to judge is put in question — \"reading things into everything lately\". \"Ask anyone who was there\" borrows a consensus you can't easily check, so the safest-seeming conclusion is that you got it wrong.",
    distractorNotes: {
      darvo:
        "Two of the three moves are here — denial and an attack on your judgement — but the speaker never casts themselves as the injured party. That reversal is what makes it DARVO.",
      "guilt-tripping":
        "No obligation is invoked and nothing is being asked of you. The target is your confidence in your own memory, not your conscience.",
      "ad-hominem":
        "Your reliability is raised to overturn your account of events, not to dodge an argument you'd made. There's no claim of yours going unanswered.",
    },
    rebuttal:
      "I know what I heard. Let's not make this about my memory — let's talk about what was actually said.",
    difficulty: 2,
  },

  {
    id: "q-slippery-slope-tablets",
    quote:
      "If we let them use the tablets for one lesson a week, in three years they won't be able to sit through a book. That's how it starts.",
    context: "A comment from the floor at a school parents' evening",
    optionIds: ["appeal-to-fear", "hasty-generalisation", "slippery-slope", "false-cause"],
    answerId: "slippery-slope",
    explanation:
      "One lesson a week is the proposal; an inability to read a book is the outcome asserted. Nothing in between is defended — \"that's how it starts\" stands in for the argument that any of those steps must follow.",
    distractorNotes: {
      "appeal-to-fear":
        "The outcome is unwelcome rather than frightening, and it's offered as a prediction to be believed rather than an image to be felt.",
      "hasty-generalisation":
        "No cases are cited at all, so there's no small sample being over-extended.",
      "false-cause":
        "That misreads a correlation that has already been observed. This projects a chain forward with no data behind it.",
    },
    rebuttal:
      "What makes the step from one lesson a week to that outcome inevitable? Has it played out that way anywhere?",
    difficulty: 2,
  },

  {
    id: "q-appeal-to-authority-supplement",
    quote:
      "A professor of economics has been recommending it for years. I'll take that over whatever your article says.",
    context: "In a group chat, about a supplement",
    optionIds: ["bandwagon", "cherry-picking", "appeal-to-authority", "ad-hominem"],
    answerId: "appeal-to-authority",
    explanation:
      "The whole weight rests on a title, and the title is in the wrong field — economics tells you nothing about what a supplement does. No study, mechanism or result is offered, only standing.",
    distractorNotes: {
      bandwagon:
        "One person is cited, not a crowd. Nothing here says the supplement is popular or widely adopted.",
      "cherry-picking":
        "No body of evidence is being selectively read — no evidence is presented at all beyond the endorsement.",
      "ad-hominem":
        "\"Whatever your article says\" is dismissive, but the argument's weight is placed on the professor's status rather than on any flaw in the person replying.",
    },
    rebuttal:
      "What's the basis for the recommendation? Economics isn't really the relevant expertise here.",
    difficulty: 2,
  },
];
