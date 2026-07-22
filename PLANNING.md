# thetangle.io — Planning Hub

Domain: `thetangle.io` (registered via Route 53)

---

## Vision

A data visualization portfolio and storytelling site — independent from zach-alexander.com.
Think Pudding-style scrollytelling pieces, original D3 stories, and a writing section.
Will cross-link with Birdland Metrics.

---

## Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | SvelteKit | Best D3 integration, SSG, scrollytelling ecosystem |
| Rendering | SSG (`adapter-static`) | SEO + social sharing, zero server cost |
| Markdown | mdsvex | Svelte components inside markdown, powers the blog |
| Visualizations | D3.js + Layer Cake | D3 for custom viz, Layer Cake for responsive charts |
| Scrollytelling | svelte-scroller | Official Svelte scrollytelling library |
| Hosting | AWS Amplify | Auto-deploy from GitHub, free tier, fits existing AWS setup |
| Backend data | AWS Lambda + S3 | Shared/extended from Birdland Metrics pipelines |

---

## Site Structure

```
/                        Home — hero, featured work, brief intro
/work                    All visualizations index
/work/[slug]             Individual viz/story page
/writing                 All blog posts index
/writing/[slug]          Individual article (rendered from markdown)
/about                   About + resume
```

---

## Repo Structure

```
src/
  lib/
    components/
      Nav.svelte
      Footer.svelte
      Scroller.svelte         # reusable scrollytelling wrapper
      OgMeta.svelte           # reusable SEO/OG head block
    utils/
      formatters.js           # d3 number/date formatters
  routes/
    +layout.svelte
    +page.svelte              # home
    work/
      +page.svelte
      [slug]/
        +page.svelte
    writing/
      +page.svelte
      [slug]/
        +page.svelte
    about/
      +page.svelte
  content/
    work/                     # one .md or .json per project
    writing/                  # blog post markdown files (mdsvex)
static/
  og/                         # OG images (1200x630 PNGs)
  fonts/
```

---

## Key Libraries

```json
{
  "@sveltejs/adapter-static": "SSG output",
  "@sveltejs/kit": "framework",
  "svelte": "^5.x",
  "mdsvex": "markdown + Svelte in same files",
  "svelte-scroller": "scrollytelling",
  "d3": "data visualization",
  "layercake": "responsive chart components",
  "@sveltejs/enhanced-img": "image optimization"
}
```

---

## SEO

Every page gets an `OgMeta.svelte` component:
```svelte
<svelte:head>
  <title>{title} | The Tangle</title>
  <meta name="description" content={description} />
  <meta property="og:title" content={title} />
  <meta property="og:description" content={description} />
  <meta property="og:image" content={ogImage} />
  <meta property="og:url" content={canonicalUrl} />
  <meta name="twitter:card" content="summary_large_image" />
</svelte:head>
```

- `sitemap.xml` generated at build time via SvelteKit endpoint
- JSON-LD structured data on article pages
- Semantic HTML (`<article>`, `<h1>`, etc.)

---

## AWS Amplify Deploy

1. Create GitHub repo `thetangle`
2. Connect to AWS Amplify console
3. Build command: `npm run build`, output dir: `build/`
4. Configure `thetangle.io` custom domain → auto SSL via ACM
5. Branch strategy: `main` → production, `dev` → preview URL

---

## Scrollytelling Pattern

```
+page.svelte
  ├── <Scroller>
  │     ├── <figure>    # D3 viz (sticky)
  │     └── <article>   # narrative steps (scrolls)
  └── prose sections above/below
```

Step index from scroller drives D3 transitions.

---

## Phase 1 Build Order

- [ ] Scaffold — `npx sv create thetangle`, install deps, configure adapter-static + mdsvex
- [ ] Global layout + Nav + Footer
- [ ] Home page — hero, featured work cards
- [ ] Work index + first viz — `/work` grid, one full scrollytelling piece end-to-end
- [ ] Writing section — blog index + markdown post rendering
- [ ] About page
- [ ] SEO pass — OgMeta everywhere, sitemap, JSON-LD
- [ ] Amplify deploy — connect repo, configure domain, verify build

---

## Ideas & Inspiration

See IDEAS.md for story/viz concepts.

---

## Open Questions

- [ ] Which AWS Lambda data endpoints should thetangle.io consume vs. build new?
- [ ] Brand/design direction — dark theme? color palette?
- [ ] First story/viz piece — what topic?
