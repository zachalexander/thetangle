# Story: 18 Summers

**Status**: research
**Target publish**: late spring / early summer — when the feeling is most acute
**Emotional register**: bittersweet, urgent, about paying attention before it's too late

---

## The Concept

If your child is born when you're 30, you have 18 summers before they leave for college.
But that number is a lie — a comfortable one.

Each summer, a little more gets carved away. By independence, by friends, by camps, by
the slow gravitational pull of their own life forming. The summers don't disappear all
at once. They narrow, quietly, one activity and one door-closing at a time.

The real number of fully present, uncontested summers you have with your child is closer
to 6 or 8. And some of those have already passed.

---

## One-sentence pitch

You think you have 18 summers — here's what you actually have.

---

## The Pudding test

Every parent in their 30s feels this but hasn't seen it quantified. The piece
doesn't teach them something new — it makes undeniable something they already
sense but push away. That's why it will spread: it will make people put down their
phones and go outside with their kid. People will tag their partners. It will hurt
in the right way.

---

## Narrative Arc

**1. The comfortable lie**
A grid of 18 summer blocks. Warm, golden. "You have 18 summers."
The number feels like plenty.

**2. The first subtraction — they won't remember**
Research: autobiographical memory doesn't solidify until age 3–4.
Summers 1–3 are for you, not for them. They won't carry these.
Cross off summers 1–3. Now you have 15.

**3. The independence curve begins**
Ages 4–6: full presence. They want you there for everything.
Ages 7–10: friends start competing. Camps appear. They begin choosing
their world over yours. Research: BLS Time Use Survey shows parent-child
shared leisure time drops sharply after age 6.
Shade summers 7–10 — not gone, but partial.

**4. The teenage withdrawal**
Ages 11–14: preteen pulls away. Sports, screens, social life.
You're still there but you're background now.
Ages 15–18: jobs, driving, girlfriends, boyfriends, the rehearsal for leaving.
You get weekends. You get dinner if you're lucky.
Shade these darker. Nearly gone.

**5. The real number**
What remains: summers 4–6, maybe 7.
Three to four fully present summers. Some already behind you.
The grid, now mostly shaded, shows the truth.

**6. The turn — this isn't a eulogy**
The piece doesn't end in despair. It ends in instruction.
The data tells you where to put your attention. The unshaded blocks are still
yours. The question is what you do with them.

Final frame: the grid again, the remaining blocks glowing.
"These are still yours."

---

## The Visualization

**Core viz: the summer grid**
- 18 blocks arranged in a grid, each representing one summer
- Warm color palette — sun yellows, golden oranges
- Each block fills in as the narrative progresses:
  - Summers 1-3: faded/translucent ("they won't remember")
  - Summers 7-10: partially shaded ("shared, contested")
  - Summers 11-18: darkened ("yours to visit, not to keep")
  - Summers 4-6 (or wherever the user's child is): glowing, bright

**Personalization element**
Ask the reader: "How old is your child?"
The grid recalculates — showing which summers are already past, which
are now, which are coming. Makes the piece viscerally personal.
(Simple JS, no backend needed — runs in the browser.)

**Secondary viz: the time use curve**
BLS American Time Use Survey data showing parent-child shared leisure time
by child's age. The sharp drop after age 6 is the data backbone of the piece.
Line chart, annotated with the narrative milestones.

---

## Data Sources

| Data | Source | Notes |
|---|---|---|
| Parent-child shared time by age | BLS American Time Use Survey (ATUS) | Annual, free, excellent methodology |
| Memory consolidation / childhood amnesia | Developmental psychology literature | ~age 3-4 for autobiographical memory |
| Child independence milestones | AAP developmental guidelines | Age-appropriate independence research |
| Teen time allocation | Pew Research Center teen surveys | Screen time, social time, family time |
| Summer activity data | Census / ATUS | Camp, structured activities by age |

---

## Tone Notes

- This is not a productivity piece. It is not "10 tips to maximize your summers."
- No solutions. No optimization. Just honest accounting.
- The data is the evidence. The feeling is the point.
- Write it like a letter, not an article. First person where appropriate.
- The visualization should feel warm, not clinical — golden light, not spreadsheet blue.

---

## Personalization Architecture

Simple browser-side interaction — no backend:

```js
// User inputs child's age
// Script calculates:
const childAge = getUserInput();
const summersGone = Math.max(0, childAge - 1);      // already passed
const summersNow = childAge;                          // current summer
const summersLeft = 18 - childAge;                   // remaining
const presentSummers = calcPresentSummers(childAge); // based on independence curve

// Grid rerenders with correct shading per the narrative model
```

The independence curve is the key model — a simple lookup table derived
from the BLS ATUS data on parent-child shared leisure time by age.

---

## Story Aging

This piece is evergreen but benefits from a personal framing anchored in time.
Option: write it as "Summer 2026" with a note that the underlying data is timeless.
Update the personal framing each year if desired.

---

## Open Questions

- [ ] First person (your story) or second person (the reader's)? Second person is more
      universal; first person with Theo makes it more honest and more moving. Consider hybrid.
- [ ] Does the personalization element (enter your child's age) make it too interactive /
      pull focus from the narrative? Or is it the thing that makes people share it?
- [ ] Companion /writing post: the methodology and the research behind the independence curve
- [ ] Visual warmth — how do you make a D3 chart feel like a memory?
