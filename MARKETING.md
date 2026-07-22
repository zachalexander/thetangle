# thetangle.io — Marketing & Distribution

---

## The Pudding Playbook

The Pudding (pudding.cool) is the closest model for what thetangle.io is building.
Founded 2017 by Matt Daniels. ~500k monthly visitors, Peabody Award in their first year.
Here's how they actually grew — and how it maps to thetangle.

| Pudding lesson | thetangle application |
|---|---|
| Pick topics people already argue about | Foliage timing is something New Englanders are deeply passionate about — they already have opinions |
| Data channels existing passion into something arguable | "Your county peaks later than you think" is a debate starter, not a lecture |
| "Spoonful of sugar" — fun surface, serious depth | Casual readers share because it's cool; serious readers share because it matters |
| Time releases to cultural moments | Publish foliage story when the first cold weekend hits and everyone's already talking |
| Engage community publicly when they push back | If Reddit debates your model, engage and update it — those people become advocates |
| Quality over frequency (enabled by a sustainable model) | One great story every 6–8 weeks. thetangle is a passion project — no pressure to publish constantly |
| The B2B studio funded their editorial work | No equivalent needed here — but protecting time for thetangle is the same discipline |

**Origin story worth knowing:** Daniels' 2014 rapper vocabulary piece went viral on Reddit
because hip-hop fans immediately demanded "where's Aesop Rock?" — he added him, Aesop
came in first, and the community became invested. The debate *was* the distribution.
Design stories so the data is arguable, not just informative.

---

## Core Principles (Lessons from Birdland)

These principles apply to every story, every platform.

**1. Post the viz, not the link**
Image posts get 5–10x more engagement than link posts on Reddit and social.
Always lead with a screenshot of the key visual. Put the URL in the first comment or
caption — never in the post title on Reddit.

**2. Participate before you promote**
Spend time in a community before dropping your work in it. When you post as a known
member, engagement follows. When you post as a stranger, it reads as spam.
For each story, identify the 2–3 subreddits you'll target and start engaging there
a week or two before you plan to post.

**3. Time posts to peak relevance**
Post when the audience is already fired up about the topic. For foliage: post on the
first cold weekend of September when everyone's talking about leaf peeping. For any
story, ask: when will people be actively searching for or discussing this? Post then,
not at an arbitrary time.

**4. Engage, don't broadcast**
Replying to comments, answering questions, and engaging with other accounts drives
more reach than just posting and leaving. Stay active on the thread for at least
a few hours after posting.

**5. Make the work citable**
Other writers, journalists, and accounts spread your work when it's easy to reference.
Every viz page should have:
- A clean, permanent, shareable URL
- A "copy link" or share button
- A methodology note (even one sentence) so people know what they're citing
- A companion /writing post for stories with complex models (good for HN + SEO)

**6. Capture visitors early**
Returning traffic is loyal but doesn't grow on its own. Convert first-time visitors
into email subscribers from day one — even 50 engaged subscribers compounds over time.
Don't wait until you have "enough" traffic to add a newsletter signup.

---

## SEO

### Already Planned
- OgMeta component on every page (title, description, og:image, og:url, twitter:card)
- sitemap.xml generated at build time
- Semantic HTML (article, h1, proper heading hierarchy)
- JSON-LD structured data on writing/article pages

### To Add

**Core Web Vitals**
- Tree-shake D3 — import only what each story needs (`import { scaleLinear } from 'd3-scale'`, not `import * as d3 from 'd3'`)
- Lazy-load viz components below the fold
- Route-based code splitting is automatic in SvelteKit — each story's JS only loads on that route

**robots.txt**
```
User-agent: *
Disallow: /work/*/share/
```
Share routes are tooling, not content — keep them out of search indexes.

**Dataset structured data**
Add `schema.org/Dataset` JSON-LD to data story pages alongside standard `Article` schema.
Google is beginning to surface dataset-driven content in search results.

**RSS feed**
- Add `/feed.xml` SvelteKit endpoint (~20 lines)
- Covers RSS readers, feed aggregators, and the data journalism community
- Auto-notifies subscribers of new stories without social algorithms

**Canonical URLs**
- Add `<link rel="canonical">` on all `/share/*` routes pointing back to the main story URL

**Cross-linking**
- Bidirectional links between thetangle.io and birdland-metrics.com builds domain authority for both

**Seasonal timing**
- Publish data-driven seasonal stories ahead of the search spike
- Foliage story: target late August — queries like "peak foliage Vermont 2026" and
  "when do leaves change New Hampshire" spike every September
- A data-driven forecast with an interactive map will rank and attract backlinks

---

## Distribution Channels

### Tier 1 — Highest ROI

| Channel | How to use it |
|---|---|
| **r/dataisbeautiful** | 21M members. Post screenshot as image, URL in comments. Participate in the sub first. |
| **r/MapPorn** | Maps get massive engagement. Perfect for any geo viz. Same image-first approach. |
| **Topic subreddits** | Match each story to 1–2 niche subs (e.g. r/newengland for foliage). These convert better than large subs — smaller, more passionate audience. |
| **Hacker News** | "Show HN" posts for stories with interesting methodology. Include a one-paragraph explanation of the model in the post. |
| **Twitter/X** | Use #dataviz and #ddj. Post the viz image, not just a link. Engage with replies for at least a few hours. |

### Tier 2 — Medium ROI

| Channel | How to use it |
|---|---|
| **Bluesky** | Data science / journalism community is active here. Early mover advantage. Already have AT Protocol experience from Birdland — extend it. |
| **LinkedIn** | Data stories get strong professional engagement. Good for career visibility alongside the portfolio angle. |
| **Instagram** | Square and portrait formats already planned in the screenshot pipeline. Consistent posting builds a following over time. |
| **Observable** | Publish a companion methodology notebook for technically interesting stories. Drives traffic back and builds credibility. |

### Tier 3 — Longer Term

| Channel | How to use it |
|---|---|
| **Information is Beautiful Awards** | Annual. Submit polished finished work. |
| **Flowing Data** (Nathan Yau) | Regularly features community work. Email with a screenshot when something is polished. |
| **The Pudding** | Same idea — reach out directly with finished pieces. |
| **Alberto Cairo newsletter** | Data viz educator with large audience. Worth a cold email for strong work. |
| **Niche press** | Seasonal/local stories get picked up by regional outlets. One link from a New England news site drives significant referral traffic. |
| **TikTok** | Vertical format planned. "Did you know" style data content performs well. |

---

## Email Newsletter

Start this on day one, not when traffic is "big enough."

- Simple "new story" notification email
- 50 engaged subscribers who share > 2,000 passive social followers
- Options: **Buttondown** ($0 under 100 subscribers, clean and simple), Substack (built-in discovery), ConvertKit
- Add signup to site footer and about page — no pop-ups
- No publishing schedule commitment — send when there's something worth sending

---

## Per-Story Launch Checklist

**Before publishing:**
- [ ] Identify 2–3 subreddits to target — start engaging there now
- [ ] Write the companion /writing methodology post (if story warrants it)
- [ ] Confirm seasonal timing — is this the right week to publish?

**On publish:**
- [ ] Screenshot pipeline triggered, all formats verified in S3
- [ ] Post to r/dataisbeautiful — image post, URL in first comment
- [ ] Post to r/MapPorn (if geo viz)
- [ ] Post to topic-specific subreddit(s)
- [ ] Tweet with landscape screenshot (#dataviz #ddj) — engage with replies
- [ ] Post to Bluesky
- [ ] Post to LinkedIn
- [ ] Post to Instagram (square + portrait)
- [ ] "Show HN" post if methodology is interesting
- [ ] Email newsletter to subscribers
- [ ] Reach out to 1–2 relevant press contacts / newsletters if story is strong enough

---

## Story-Specific Notes

### Foliage Forecast 2026
- **Publish**: late August 2026 (before search spike, before first cold weekend)
- **Pre-launch**: start engaging in r/newengland, r/vermont 2 weeks before
- **Target subreddits**: r/dataisbeautiful, r/MapPorn, r/newengland, r/vermont, r/hiking, r/weather
- **Press targets**: New England local TV/news, travel/outdoors publications, weather blogs
- **SEO targets**: "peak foliage [state] 2026", "when do leaves change [location]", "fall foliage forecast northeast"
- **Companion post**: publish /writing piece on the model methodology — good for HN and long-tail SEO
- **Timing hook**: post on the first cold weekend of September when everyone's already talking about it
