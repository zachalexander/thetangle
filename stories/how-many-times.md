# Story: How Many Times Will You See Your Parents?

**Status**: research
**Target publish**: fall or holiday season — when the feeling is most acute
**Emotional register**: quiet urgency, not grief — the piece that makes you call them this weekend
**Audience**: adults in their 30s with living parents, especially those with their own children now

---

## The Concept

seeyourfolks.com launched in 2013 with a simple calculator: enter your parents' ages,
how often you see them, and it tells you roughly how many visits you have left.
It went viral. Fast Company, Slate, HuffPost all covered it. And then it sat there,
a blunt number with no context, no warmth, no data behind it — just a cold output.

The calculator is the seed of an idea. This piece is the story.

Not just a number — a reckoning. Using real data on visit frequency by life stage,
longevity tables, and the way the texture of time with aging parents changes,
not just the quantity. The last time felt like a normal visit. You didn't know
it would be the last one where they were fully themselves.

---

## One-sentence pitch

seeyourfolks.com gave you a number. Here's what's actually behind it.

---

## Why This Is Differentiated

seeyourfolks.com is a cold calculator from 2013 with no methodology, no data sourcing,
and no emotional depth. It produces a number and stops. There is no narrative piece
that sits behind this concept — no scrollytelling story, no BLS data, no longevity
analysis, no writing about what the visits actually look like as they change.

This is the piece that lives behind the calculator. It uses real data. It tells
you not just how many times but what those times will look like — and how they've
already changed, quietly, without you noticing.

---

## The Pudding Test

Every adult with living parents in their 30s or 40s feels this but has never
seen it quantified with honesty and care. It will make people call their parents
the day they read it. They will text it to their siblings with no words.
It's the kind of piece that gets shared every November and December.

---

## The Honest Truths (backed by data)

### 1. The Visit Frequency Collapse
**What most people believe:** "We see them a few times a year."
**What the data shows:**
- In your 20s, living near parents: ~2–4 visits/month (BLS ATUS proximity data)
- After moving away (median distance US adults live from parents: ~18 miles, but ~25%
  live 100+ miles away): 4–8 visits/year
- After you have children: visits actually increase briefly (grandchildren effect),
  then taper as your schedule fills and they begin traveling less
- The average American adult in their 30s–40s with parents alive sees them
  approximately 5–10 times per year when not living locally

*Source: BLS American Time Use Survey, Pew Research kinship distance studies,
Journal of Marriage and Family proximity research*

### 2. The Longevity Reality
**What most people believe:** "They're healthy, we have time."
**What the data shows:**
- US life expectancy at 65: ~17 more years for men, ~20 for women (SSA actuarial tables)
- But "healthy years" is shorter: disability-adjusted life expectancy at 65 is ~10–14 years
- The window when your parent is mobile, sharp, and able to travel narrows faster than the
  total lifespan
- If your parent is 70 today, you likely have 8–12 years of visits where they're
  substantially the person you know — not the total years remaining

*Source: SSA Period Life Tables 2023, CDC Healthy Life Expectancy data,
NCHS National Health Interview Survey*

### 3. The Quality Gradient
**The part the calculator misses entirely:**
- Not all remaining visits are equal
- The visit at 72 is different from the visit at 82
- Cognitive decline affects ~10% of people 65–74, rising to 22% at 75–84 and 33% at 85+
- The window of "fully themselves" — sharp, present, the parent you know —
  is substantially shorter than the window of "still alive"

*Source: Alzheimer's Association 2024 Facts and Figures,
CDC BRFSS cognitive decline surveillance*

### 4. The Geography Tax
- Adults who live 500+ miles from parents average 2–4 visits per year (vs. 20–30 for
  locals)
- Each move you make — career, relationship, life — compounds the gap
- Remote work initially closed this gap (2020–2022) but most adults have since returned
  to fixed locations

*Source: BLS ATUS, American Community Survey commuting and migration data*

---

## Narrative Arc

**Opening:** The seeyourfolks.com moment. The calculator exists. You've probably
seen it, felt the number land in your stomach, and closed the tab.
That number was real. But it was also incomplete.

**Chapter 1 — The visit math**
What your actual visit frequency looks like across life stages. Not the idealized
version — the real one. Most people in their 30s see their parents 5–10 times a year.
That number was once much higher. It will get lower.

**Chapter 2 — The longevity table**
SSA actuarial data on remaining years by current age. Not to be morbid —
to be honest. If your parent is 68, you have a different math than if they're 78.

**Chapter 3 — The quality window**
The part nobody talks about. The years remaining ≠ the years of them being fully
themselves. Cognitive decline data. The window is shorter than the lifespan.
This is the hardest chapter.

**Chapter 4 — The personalization**
Enter your parent's age. Enter how often you see them. Enter where you live relative
to them. The piece recalculates — shows you not just a number but a shape:
how many more visits at full presence, how many in the transition years, the total arc.

**Ending — Not a eulogy**
The piece doesn't end in grief. It ends in the only instruction that matters:
the window is real, and it's still open. The piece makes you call them.
Not because you're afraid — because you can.

---

## The Visualization

**Core viz: The visit timeline**
A horizontal timeline from today to statistical end of life for each parent.
Color-coded zones:
- **Green**: full presence window (estimated by health data)
- **Yellow**: transition years (reduced mobility, some cognitive change)
- **Gray**: remaining years beyond full-presence window

Each visit is a small mark on the timeline. You can see how many fall in each zone.

**Personalization layer**
Simple browser-side inputs:
```js
const parentAge = getUserInput();           // 65-90
const visitsPerYear = getUserInput();       // 1-52
const distanceMiles = getUserInput();       // 0-3000
const yourAge = getUserInput();            // 25-65

// Outputs:
// - remaining visits (all)
// - remaining visits in full-presence window
// - remaining visits in transition window
// - total visits since you left home (backward look)
```

**The backward look** (unique, not in the calculator)
How many visits have you already had since you left home? Seeing the number you've
already lived — not just the number remaining — reframes the whole piece.
You've had 180 visits since college. You may have 80 left. You're more than halfway.

**Secondary viz: The presence quality curve**
A simple line chart showing probability of full cognitive/physical presence by age,
drawn from CDC and Alzheimer's Association data. Annotated by decade:
"At 70, 90% of people are fully themselves. At 80, 67%."
The curve is the weight of the piece.

---

## Data Sources

| Data | Source |
|---|---|
| Life expectancy by current age | SSA Period Life Tables 2023 |
| Healthy life expectancy | CDC NCHS, Global Burden of Disease |
| Cognitive decline prevalence by age | Alzheimer's Association Facts & Figures 2024 |
| Visit frequency by distance/life stage | BLS American Time Use Survey (ATUS) |
| Geographic distance from parents | Pew Research, ACS migration data |
| Parent-child contact frequency | General Social Survey, ATUS |

---

## Personal Framing

You now have a child. Your parents now have a grandchild.
That changed the visit math — briefly, in one direction.
But you're also aware, for the first time, of what your parents felt watching you
become your own person. You can feel the symmetry.

The most honest line in this piece might be:
*The last time felt like a normal visit. You didn't know it would be the last one
where they were fully themselves.*

Open with the seeyourfolks.com tab. The number. Closing it.
Then spend the rest of the piece filling in everything the calculator left out.

---

## Tone Notes

- Not grief. Not a sob piece. Not "call your parents before it's too late."
- Honest, warm, a little urgent in the way that good data journalism is urgent.
- The data earns the emotion — it doesn't manufacture it.
- Ends with agency, not despair.
- Short chapters. The scroll cards don't overstay.

---

## Distribution Fit

- **r/personalfinance** (the longevity + retirement angle)
- **r/relationship_advice**, **r/family**
- **r/Parenting** — the grandparents angle
- Every family group chat every November
- LinkedIn: working adults with aging parents is a large professional demographic
- Twitter/X: the cognitive decline chart will circulate independently

---

## Open Questions

- [ ] How granular should the personalization be? (2 inputs vs. 5)
- [ ] Do you include the backward look (visits already had)? It's powerful but heavy.
- [ ] Sibling dimension: do you share visits? Or does each child get their own math?
- [ ] Is the cognitive decline section too clinical? Or is that the most important truth?
- [ ] Timing: holiday season for maximum resonance, or does that feel like emotional manipulation?
- [ ] Companion piece: a shorter note specifically for parents watching their adult children leave — the same math from the other side
