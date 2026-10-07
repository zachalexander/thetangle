# Story: Tracking Theo

**Status**: active data collection (start logging now)
**Target publish**: when enough data exists to tell a complete arc — 6 to 12 months minimum
**Emotional register**: intimate, attentive, about love expressed through observation
**Format**: potentially a series — installments published as data accumulates

---

## The Concept

Most parents try to hold onto their child's early years through memory.
Memory fails. The details blur into a warm haze — you remember the feeling
but not the specifics. How many times did he say "dada" before it became ordinary?
When exactly did he stop needing you to sit with him to fall asleep?

This is the story of trying to count what most people only try to remember.
Not because the numbers are the point — but because paying close enough attention
to count is itself an act of love.

---

## One-sentence pitch

I decided to measure my son's childhood. Here's what the data showed —
and what it couldn't.

---

## What Makes This Irreplaceable

Nobody else has this dataset. It cannot be scraped, downloaded, or replicated.
The personal logger you're building (log.thewildplot.io) is the data pipeline
for this story. The dada counter is the first chapter.

This is thewildplot's "Dear Data" — personal longitudinal observation turned
into something universal. Giorgia Lupi tracked her life in hand-drawn postcards.
This is the same impulse, different tools.

---

## The Pudding Test

Every parent in their 30s is grieving the early years as they're living them —
trying to hold onto something that's moving too fast. This piece names that feeling
and gives it form. People will share it because it mirrors their own silent keeping-track,
the mental tallies they run but never write down.

---

## What to Track (Logger Trackers to Create Now)

Start these immediately — the earlier the data collection starts, the richer the story.

| Tracker | Type | What it captures |
|---|---|---|
| `theo-dada` | counter | Times Theo says "dada" per day — the seed tracker |
| `theo-words` | text | New words as they appear — first log becomes the record |
| `theo-laugh` | counter | Times he laughs per observation session |
| `theo-questions` | counter | Questions asked per day (tracks curiosity development) |
| `theo-sleep-wake` | text/note | What he said or did first thing in the morning |
| `theo-hug` | counter | Unprompted physical affection — will change over time |
| `theo-milestone` | text | Open-ended milestone log — first sentences, first joke, first lie |
| `theo-mood-parent` | rating (1-5) | Your own energy/presence level — the parent data layer |

The parent data layer (`theo-mood-parent`) is important — it contextualizes
everything else. On the days you were depleted, what did you notice less?

---

## Narrative Arc (Series Format)

### Installment 1 — "The Dada Count" (publish after 4–6 weeks of data)
The origin story. Why you started counting. The first 30 days of the dada counter.
The number is surprisingly high. Or surprisingly low. Whatever it is, it's real in
a way memory isn't. Short piece, mostly personal essay with a single chart.

### Installment 2 — "The Vocabulary Ledger" (publish after 3–4 months)
The word list is now long enough to be interesting. When did "dada" become ordinary
enough that he stopped saying it so often? What words came next? The rate of language
acquisition visualized — a cascade of new words arriving faster and faster.
Cross-reference with language acquisition research: what's typical? Where does Theo land?

### Installment 3 — "What I Noticed" (publish after 6 months)
The full picture so far — all trackers together. The days he laughed the most.
The mornings his first words were questions. What your own energy level correlated with
in his behavior. The parent data layer gets its moment here.

### Installment 4 — "The Last First" (publish at a natural milestone — first birthday, first day of school)
Timed to a milestone. What has already changed. The trackers that have
peaked and are declining — "dada" said less often now because it's no longer
novel. What's being lost as he grows. What's arriving to replace it.

### Long-form finale — "Tracking Theo: Year One" (or Year Two)
The full longitudinal story. A complete arc. The piece that lives as the
definitive thewildplot personal story. All data, all observations, the honest
accounting of one child's early years and one father's attempt to pay attention.

---

## Visual Approach

This piece should look different from the data-heavy thewildplot stories.
The subject demands warmth, not clinical precision.

**Design principles:**
- Warm color palette — not the story's own palette, but something intimate.
  Cream paper tones, ink-like marks, handwritten-feeling annotations.
- Small multiples over large complex charts — many small observations
  rather than one overwhelming visualization
- Generous white space — the silence between data points matters
- Annotations in first person — not "peak value observed on Oct 3" but
  "this was the day he figured out how to open the back door"
- No gridlines. No axes unless necessary.

**Specific viz ideas:**
- **The word cloud that grows** — each new word appears as it was first logged.
  Animated over time. "Dada" is large (said most). Words fade slightly as they
  become routine. A living vocabulary.
- **The laugh calendar** — a GitHub contribution-graph style calendar heatmap
  of laugh counts per day. The days that glow.
- **The question graph** — questions asked per day over time. The moment the
  "why?" phase starts will be visible as a vertical spike.
- **The morning log** — a horizontal scroll of first things said each morning.
  Typography-forward. No chart.

---

## The Honest Part

This piece has to reckon with what counting can't capture.

The dada counter tells you how many times he said it. It doesn't tell you
the look on his face. It doesn't tell you the specific afternoon light, or
that you were tired, or that you almost didn't notice.

The most important moment in the piece is when the data runs out —
when the number stops and the feeling begins. The visualization ends
and the prose holds what the logger couldn't.

This is the thing that makes it literature and not a dashboard.

---

## Data Pipeline

```
log.thewildplot.io (PWA)
  → POST /log → Lambda → DynamoDB
  → nightly export Lambda
  → s3://thewildplot-data/personal/theo-*/data.json
  → thewildplot story fetches at build time
```

Each tracker exports independently. The story page loads all Theo trackers
and assembles the combined picture.

---

## Publishing Considerations

- **Privacy**: Theo is a child. Think carefully about what data to publish.
  Aggregate patterns (laugh counts, word counts) vs. verbatim morning quotes —
  the latter deserves more consideration. His story, told by his parent.
- **Longevity**: this will live on the internet forever. Write it as something
  you'd want him to read at 25.
- **The parent's presence**: don't disappear from your own story. The data
  is interesting; your relationship to collecting it is the real subject.

---

## Open Questions

- [ ] Series vs. single long piece — series builds audience over time;
      single piece is a more complete artifact. Probably series → finale.
- [ ] How much raw data to publish vs. curated highlights?
- [ ] Does the parent mood layer feel too exposed? Or is that the most
      honest part?
- [ ] Share link for partner — use the collaborative logger feature so
      both parents contribute to the same dataset
- [ ] Start date: the earlier the better. Begin logging this week.
