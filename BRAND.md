# thewildplot.io — Brand & Design

## Aesthetic Direction

**"Gallery Index"** (chosen Oct 2026) — bold & expressive, strong typographic hierarchy,
each story/piece has its own color world. The homepage is a grid of colored tiles, one per
story; opening a story feels like stepping into its tile.
Feel: Information is Beautiful, design-forward portfolio.

Tokens live in `src/app.css` (`:root`).

---

## Typography

- **Display / wordmark / headings**: Bricolage Grotesque, weights 600 and 800 (Google Fonts).
  Chosen over Syne, which felt too stretched at heavy weights.
- **Body / UI**: Karla, weights 400 / 500 / 700 (Google Fonts)
- Wordmark is set lowercase: `the wild plot`, tight negative tracking
- Labels ("eyebrows"): Karla 700, uppercase, wide tracking

---

## Color

- **Site chrome**: warm off-white `#FFFDF8`, near-black ink `#16151A`, 2px black rules
- **Story color world**: every story sets `color` (tile background) and `ink` (text on it)
  in its metadata file (`src/lib/stories/*.js`). The same color is used for its homepage
  tile, its story header and the accent on its scroll cards — and ideally its social clips.
- Tile palette to draw from: blue `#3B4FD9`, yellow `#F3C94B`, mint `#9ED3C6`,
  coral `#F2A99A`, rust `#B4461B` (foliage-2026)
- Keep `ink` on `color` at ≥ 4.5:1 contrast (rust + off-white = 5.4:1)

---

## Layout & Grid

### Navigation

- Fixed top bar on the off-white background
- Wordmark left, `Work · Writing · About` right; active link underlined

### Home / Work Index

- Slim wordmark header (big, but short) with a one-line intro, then tiles immediately
- Tile grid (`StoryGrid` + `StoryTile`): auto-fit columns, min 320px, 20px gap, 14px radius
- Newest/featured story is a large double-width tile on the homepage
- Topic filters (pill buttons) generated from story tags; hidden until there are 2+ tags
- Dashed "Coming next" tile closes the homepage grid
- Tiles lift slightly on hover

### Story / Viz Pages (Scrollytelling)

- Header is the story's tile, opened up: full-width colored block with tags, title, dek, byline
- **Full-screen viz** — D3 chart fills the viewport, sticky (`Scroller`)
- **Narrative as floating scroll cards** — off-white cards with a top band in the story color
- Each story page can define its own background color / visual world for the viz

---

## Open Questions

- [ ] Tile imagery — still frames or looping animation inside tiles?
- [ ] Scroll card position — currently right rail on desktop, centered on mobile
- [ ] Self-host fonts instead of Google Fonts?
