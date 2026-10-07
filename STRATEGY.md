# thewildplot.io — Strategy & Success Factors

---

## Analytics

Add on day one — before you have traffic, so you have a baseline to measure against.

### Why not Google Analytics
GA undercounts traffic significantly — and it's worst for thewildplot.io's exact audience:
- **Ad blockers** block GA by default (uBlock Origin, Brave, Firefox ETP). Tech-adjacent
  audiences (data people, developers, Reddit/HN users) have 40–60% ad blocker adoption.
  GA could be missing nearly half of actual visitors.
- **Cookie consent** — GA4 relies on cookies. Users who decline aren't counted at all.
- **Safari ITP** — limits GA's ability to track returning visitors across sessions.

### Recommended: Plausible (~$9/month)
- No cookies → consent banners don't affect counting
- Lightweight script, fewer blockers target it
- Privacy-first, no GDPR headaches
- Shows what matters: traffic source, top pages, referrers — clean and simple

**Use Plausible's proxy mode** — serves the analytics script from your own domain
(e.g. `thewildplot.io/js/script.js` instead of `plausible.io/js/script.js`), defeating
most ad blockers. This is the closest you'll get to accurate counts without a server.
Still expect ~10–20% undercounting vs. ~40–60% with GA.

### Accuracy note
For a portfolio site, perfect accuracy matters less than consistent measurement over time.
Trends are what count, not absolute numbers. Pick one tool and stick with it.

**Key metrics to watch:**
- Traffic source per story (which channel actually drives visits)
- Scroll depth on story pages (are people reading or bouncing?)
- Second-page click-through (are visitors exploring beyond the story they landed on?)
- Newsletter signup conversion rate

Knowing that r/dataisbeautiful drove 800 visits but only 12 clicked to a second story
is actionable. Knowing you had "800 visitors" is not.

---

## Publishing Cadence

**Quality over quantity.** One great story every 6–8 weeks beats four mediocre ones.

The real risk isn't publishing too slowly — it's publishing nothing for 4 months and
losing momentum entirely. Guard against this:

- Keep a pipeline of 3–4 story ideas in various stages at all times (see IDEAS.md)
- Do data research for the next story in parallel with building the current one
- A companion `/writing` methodology post counts as a publish and takes a fraction
  of the time of a full scrollytelling piece
- Set a personal rule: never have zero stories in active development

---

## Story Selection Criteria

Not every interesting dataset makes a good thewildplot story. Before committing, ask:

| Question | Why it matters |
|---|---|
| Is there a narrative arc? | Data needs a beginning, middle, and end — not just charts |
| Is the data publicly available and reproducible? | Builds trust, enables citeability |
| Is there a timely hook or is it evergreen? | Timely drives traffic spikes; evergreen drives long-tail SEO |
| Can it be explained in one sentence? | If you can't pitch it simply, the viz can't either |
| Does it produce a visually distinctive output? | If the screenshot doesn't make someone stop scrolling, it won't spread |

A good thewildplot story answers yes to at least 3 of these.

### The Pudding test (most important filter)
The Pudding's biggest stories — rapper vocabulary, film dialogue gender breakdown — went
viral because people already had strong opinions about those topics. The data didn't
create the interest, it channeled existing passion into something concrete and arguable.

Before committing to a story ask: **do people already care about this and have opinions on it?**
If yes, data gives them ammunition. If no, you're trying to make people care from scratch — much harder.

- Foliage timing: New Englanders are deeply passionate about fall foliage — ✓
- "Spoonful of sugar" test: does it feel fun on the surface but carry real depth underneath?
  The best thewildplot stories should pass this — accessible to casual readers, substantive
  for serious ones. Both groups share for different reasons.

---

## Accessibility

Data viz sites are notorious for failing accessibility. This matters ethically and
practically — accessible sites rank better in search and reach more people.

**Rules for every viz:**
- Add `role="img"` and a descriptive `aria-label` on all SVG elements
- Provide a "View as table" toggle for every chart — screen readers can't read D3
- Never convey information by color alone (affects ~8% of men)
- All interactive elements must be keyboard navigable
- Minimum 4.5:1 contrast ratio for text, 3:1 for UI elements

Accessibility doesn't need to be perfect on day one, but build the habits early.
Retrofitting it later is painful.

---

## Story Aging

Stories go stale. Decide the strategy for each story upfront.

**Option A — Archive clearly**
Add a banner when a story ages out:
> "This forecast was for 2026. See the 2027 edition →"
Keeps old URLs alive (good for SEO) without misleading readers.

**Option B — Update annually**
Re-run the model/data pipeline, redeploy. Best option when the pipeline is automated.
The foliage story is a good candidate — same story structure, new year's data.

**Option C — Evergreen the methodology**
Write the story so the model explanation is timeless; only the numbers need updating.
Good for stories where the "how" is as interesting as the "what."

Stale stories that still rank in search and don't acknowledge their age are a
credibility problem. Pick a strategy before publishing.

---

## Personal Brand Connection

thewildplot.io will grow faster if people know there's a person behind it.

**The about page is not a resume — it's an answer to "why should I trust this?"**

Include:
- Short bio and photo
- Your background in data and analytics (Birdland Metrics, data engineering work)
- What thewildplot is and why you built it
- A subtle "work with me" path if you're open to consulting leads

Journalists and writers want to know who they're crediting. "A data viz by thewildplot.io"
is less citable than "built by [name], who also built the Birdland Metrics ELO model."

---

## Cross-Promotion with Birdland Metrics

You have an existing audience at birdland-metrics.com — seed thewildplot with it from day one.

- Link to thewildplot prominently from Birdland's nav or footer
- Add a "from the person who built Birdland Metrics" line on the thewildplot about page
- Bidirectional links build domain authority for both sites (SEO benefit)
- Birdland readers who care about data and analysis are exactly the thewildplot audience

---

## Monetization

Decide now even if the answer is "none" — it shapes small decisions throughout the build.

| Option | Notes |
|---|---|
| **Nothing** | Totally valid for a passion/portfolio project. Say so on the about page — it builds trust. |
| **Sponsorships** | One relevant sponsor per story (outdoor gear for foliage, etc.). Keep it minimal. |
| **Newsletter paid tier** | Free stories for everyone; paid subscribers get early access or methodology deep-dives. |
| **Consulting leads** | The portfolio attracts data work. A subtle "work with me" path on the about page is enough. |
| **Patreon / Buy Me a Coffee** | Low-friction tip jar. Works if you build a loyal audience first. |

If it's a pure portfolio and passion project, being explicit about that on the about page
actually increases trust — readers know there's no agenda behind the analysis.

---

## Open Questions

- [ ] Analytics tool — Plausible (recommended, use proxy mode)
- [ ] Monetization stance — portfolio only, or open to sponsorships/consulting?
- [ ] Story aging strategy — archive, update annually, or evergreen?
- [ ] About page — how much personal detail? Photo?
