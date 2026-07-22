# Story: The Half-Your-Life Moment

**Status**: research
**Target publish**: evergreen — but the personal framing anchors it to a specific year
**Emotional register**: disorienting, then clarifying — the piece that reorients you in time
**Audience**: adults 28–45, particularly those at major life inflection points

---

## The Concept

There is a specific moment — a date you can calculate — when you have now lived
as many days *after* something as *before* it.

Half your life ago, you were in high school. Half your life ago, your parents
were the age you are now. Half your life ago was before the internet, before
your career, before your children, before the person you're with.

The Half-Your-Life Moment is when the past becomes equal in length to the present.
And it keeps happening — for every significant thing, every place, every person.

This is the piece that calculates where you actually are.

---

## One-sentence pitch

There's a specific date when half your life has happened before something
and half after. Here's where you are.

---

## Why This Is Differentiated

FlowingData has done mortality probability pieces (how likely are you to live to X?).
The SSA has a longevity visualizer. But neither frames time this way — not as
*before/after* a lived event, not as a mirror that shows you how far you've come
and what the same length of time looks like ahead.

This isn't about death. It's about symmetry. The frame is entirely different.
No existing data journalism piece uses this structure.

---

## The Pudding Test

Every person who reads this will immediately do the math in their head for
something personal. "Wait — half my life ago I was…" That instinct IS the piece.
It names a feeling that doesn't have a name yet. People will share it because
it recalibrates something they didn't know needed recalibrating.

---

## The Core Insight

Most people feel vaguely unmoored about where they are in time.
"Where did the 30s go?" "How is my kid already 5?"

The Half-Your-Life Moment gives you a frame: you are exactly twice as far from
something as you are from being born. That's a precise, calculable location in time —
and it's profoundly disorienting when you see it laid out.

For a 34-year-old:
- Half your life ago: you were 17
- Half your life ago was 2009
- Everything in your adult life — college, career, relationships, children — happened
  in the same span of time as ages 17–34. Which felt like forever. And also like nothing.

---

## The Chain of Half-Moments

The piece isn't just one calculation. It's a chain:

**Half your life ago from birth:** The midpoint of your whole life so far.
At 34: age 17.

**The childhood midpoint:** When did you stop being fully a child?
For most people, around 12–14. Half of *that* window has been gone for a long time.

**Half the time since you left home:**
If you left at 18 and you're 36, the midpoint was at age 27.
You've been gone as long as you lived there.

**Half the time since you met your partner:**
If you met at 26 and you're 36, half of your relationship happened in the first 5 years.

**Half the time since your child was born:**
If Theo was born in 2024 and you're reading this in 2027,
half of his life so far was before he could walk.

**Half the time until your child leaves:**
If you have 18 years and they're 5, you're already past the quarter mark.
You're in the first half. But not for long.

---

## Narrative Arc

**Opening:** A simple question. "Half your life ago, what were you doing?"
Most people can answer this immediately. The piece asks you to sit with it.

**Chapter 1 — The personal midpoint**
Your birthdate → today → the midpoint.
Everything you think of as "your adult life" happened in the second half.
Visualization: a simple timeline. You are here. The mirror is there.

**Chapter 2 — The chain of half-moments**
Interactive: the piece calculates several Half-Your-Life Moments for your life.
Each one is a small shock.
- Half your life has been after high school
- Half the time since you left home
- If you have a partner: half the time since you met them
- If you have children: half of your child's life so far (they're young; half is tiny)

**Chapter 3 — The forward look**
The same math, forward. If you live to the actuarial average for your age and health,
how much of your total life is behind you? What is the second half of your life?

This is where the piece gets quietly serious without being morbid.
The SSA actuarial tables give you a probability-weighted life expectancy.
Not a death sentence — a coordinate. You are here.

**Chapter 4 — The compression problem**
Research on time perception: subjective time speeds up as you age.
Each year feels shorter because it's a smaller fraction of total lived experience.
At 5, one year is 20% of your life. At 34, one year is 3%.
This is why the 30s disappear — not because less is happening, but because
the denominator is getting larger.

The piece names this. It's not a bug in how you're living. It's physics.

**Ending — Reorientation, not despair**
The point of the piece is not "you're running out of time." It's:
you now know where you are. Most people live without this coordinate.
You have it now. What you do with it is yours.

---

## The Visualization

**Core viz: The personal timeline**
A horizontal line from birth to statistical life expectancy.
The midpoint is marked. Today is marked.
You can see at a glance whether you're in the first or second half of your
statistically probable life.

Color zones:
- Past: solid color (your story)
- Present marker: bright mark (you are here)
- Probable remaining: lighter (actuarial — not certainty, but real probability)
- The midpoint: a vertical line bisecting the whole

**The chain of half-moments (small multiples)**
A series of smaller timelines, each showing one milestone:
- Left home
- Met partner (optional)
- First child born (optional)
- Started current career
Each timeline shows when the half-point was or will be.
Simple, quiet, devastating.

**The compression viz**
A bar chart or spiral showing years by felt length — each year as a percentage
of total lived experience at that age. At 5, each year is enormous. At 50, tiny.
The visual makes the physics of time perception concrete.

**Personalization inputs (browser-side, no backend)**
```js
const birthYear = getUserInput();       // required
const partnerMetYear = getUserInput();  // optional
const childBornYear = getUserInput();   // optional (repeatable)
const leftHomeYear = getUserInput();    // optional

// Outputs all Half-Your-Life Moments
// Pulls SSA actuarial tables for life expectancy at user's current age
// Everything calculated client-side
```

---

## Data Sources

| Data | Source |
|---|---|
| Life expectancy by current age | SSA Period Life Tables 2023 |
| Subjective time compression by age | Wittmann & Lehnhoff (2005), Friedman & Janssen (2010), psychophysics literature |
| Age and time perception | Multiple studies in Frontiers in Psychology, Psychological Science |
| Childhood memory formation | Developmental psychology (childhood amnesia research) |

---

## The Time Compression Chapter — Research Notes

The psychological research on time perception as you age is robust:
- **Janet's hypothesis (1877)**: each year feels proportionally shorter because it's
  a smaller fraction of total lived experience. At 10, one year = 10% of life.
  At 50, one year = 2%. The math explains the feeling.
- **Vierordt's Law**: the subjective duration of a filled period feels shorter
  in retrospect than an empty one — a busy life compresses in memory.
- **The reminiscence bump**: you remember ages 15–25 more vividly and richly
  than other periods — which makes earlier time feel longer in retrospect.
- **Novelty and time**: new experiences feel longer; routine compresses.
  The 30s disappear partly because they're less novel than the 20s.

This isn't an aside. It's the mechanism that makes the Half-Your-Life Moment
feel so disorienting — you're not wrong that the years feel short. They are.

---

## Personal Framing

You're 34. (Or whatever age you are when you write this.)
Half your life ago you were 17. A junior in high school.
Everything you think of as your life — college, New York, your career, your marriage,
Theo — happened in the same span of time that felt like it lasted forever at the time.

The Half-Your-Life Moment isn't a warning. It's a coordinate.
You've been living without knowing where you are.
Now you do.

---

## Tone Notes

- Not a mortality piece. Not an anxiety piece.
- The tone is more like a navigator handing you a chart:
  "You are here. That's all this is."
- Allow the math to do the emotional work. Don't editorialize.
- The compression chapter can have a little dark humor — the physics of it
  is almost absurd once you understand it.
- Ends in agency and clarity, not dread.

---

## Companion Pieces

- **The Reminiscence Bump** is a natural companion — explains *why* you remember
  ages 15–25 so vividly, which connects directly to the Half-Your-Life midpoint math.
  Publish together or in sequence.
- **18 Summers** and **How Many Times Will You See Your Parents?** form a loose
  trilogy with this piece — all about accounting for time honestly.

---

## Distribution Fit

- **r/philosophy**, **r/psychology** — the time perception angle
- **r/AskReddit** style sharing: "I just calculated my Half-Your-Life Moment and I need to lie down"
- **r/dataisbeautiful** — the timeline visualization
- **Twitter/X**: the time compression chart will circulate independently
- The personal framing (35-year-old father, Theo's first years) will resonate
  strongly in parenting communities alongside 18 Summers

---

## Open Questions

- [ ] How many personal inputs to ask for? More inputs = more personal but higher friction.
      Start with just birthdate and one optional (child's birth year) for maximum accessibility.
- [ ] Does the mortality framing (SSA tables) belong in this piece, or does it shift the register
      too dark? Option: show it as "probable remaining" without foregrounding the death angle.
- [ ] The time compression section is dense — is it a full chapter or a sidebar annotation?
- [ ] Publish as standalone or explicitly as part of a time trilogy with 18 Summers and
      How Many Times?
- [ ] Does the personalization make it feel like a calculator (seeyourfolks risk) or
      does the narrative framing keep it literary?
