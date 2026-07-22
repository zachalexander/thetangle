# thetangle.io — Social Screenshot Pipeline

## Overview

Automated screenshot generation for social sharing. Playwright Lambda visits
dedicated `/share/*` routes per story and captures images at platform-specific
dimensions. Stored to S3. Manual posting to platforms.

Extends the same pattern as the Birdland `mlb-og-screenshots` Lambda.

---

## Target Platforms & Formats

| Platform | Format | Dimensions |
|---|---|---|
| Twitter/X + Bluesky | Landscape | 1200×628 |
| Instagram square | Square | 1080×1080 |
| Instagram feed | Portrait | 1080×1350 |
| TikTok + IG Stories | Vertical | 1080×1920 |

---

## Share Routes (per story)

Each story defines its own share routes — intentionally designed frames, not
mechanical crops. The viz is composed specifically for each aspect ratio.

```
/work/foliage-2026/share/landscape   → choropleth at peak, 1200×628
/work/foliage-2026/share/square      → calendar strip detail, 1080×1080
/work/foliage-2026/share/vertical    → map + callout stacked, 1080×1920
```

### Share route conventions
- No nav, no footer — full bleed visual only
- Font smoothing forced on
- Scrollbars suppressed
- Self-contained: no external requests, all assets local

```svelte
<!-- src/routes/work/foliage-2026/share/[format]/+page.svelte -->
<svelte:head>
  <style>
    * { -webkit-font-smoothing: antialiased; -moz-osx-font-smoothing: grayscale; }
    body { overflow: hidden; scrollbar-width: none; margin: 0; }
  </style>
</svelte:head>
```

---

## Font Fidelity (critical)

The biggest source of screenshot breakage is fonts. Three rules:

**1. Self-host all fonts — no CDN**
All font files live in `static/fonts/` and are referenced via `@font-face`.
Commercial Type fonts (Orlando, Styrene) cannot be served from a public CDN
anyway — self-hosting is required by their license. This also means the
Playwright Lambda always finds fonts at a predictable URL on thetangle.io.

```css
@font-face {
  font-family: 'Orlando';
  src: url('/fonts/Orlando-Regular.woff2') format('woff2');
  font-display: block; /* don't flash fallback */
}
```

**2. Wait for fonts before screenshotting**
```js
await page.waitForLoadState('networkidle');
await page.waitForFunction(() => document.fonts.ready);
```

**3. Force antialiasing in share routes via CSS** (see above)

---

## Playwright Lambda

### Browser config
```js
const browser = await chromium.launch({
  args: [
    '--no-sandbox',
    '--disable-setuid-sandbox',
    '--disable-gpu',
    '--disable-dev-shm-usage',
    '--no-zygote',
    '--disable-extensions',
    '--font-render-hinting=none',          // consistent cross-platform rendering
    '--disable-font-subpixel-positioning', // eliminates Linux subpixel differences
  ]
});
```

### Per-format capture
```js
const formats = [
  { name: 'landscape', width: 1200, height: 628 },
  { name: 'square',    width: 1080, height: 1080 },
  { name: 'vertical',  width: 1080, height: 1920 },
];

for (const format of formats) {
  const context = await browser.newContext({
    viewport: { width: format.width, height: format.height },
    deviceScaleFactor: 2, // retina quality output
  });
  const page = await context.newPage();
  await page.goto(`https://thetangle.io/work/${slug}/share/${format.name}`);
  await page.waitForLoadState('networkidle');
  await page.waitForFunction(() => document.fonts.ready);
  const buffer = await page.screenshot({ type: 'png' });
  await s3.putObject({
    Bucket: 'thetangle-assets',
    Key: `social/${slug}/${format.name}.png`,
    Body: buffer,
    ContentType: 'image/png',
  });
  await context.close();
}
```

### S3 output structure
```
s3://thetangle-assets/
  social/
    foliage-2026/
      landscape.png   ← Twitter/X, Bluesky (1200×628 @2x)
      square.png      ← Instagram square (1080×1080 @2x)
      vertical.png    ← TikTok, IG Stories (1080×1920 @2x)
    [next-story]/
      ...
  og/
    foliage-2026.png  ← OG preview image (same as landscape or custom)
```

---

## Trigger

Screenshots Lambda runs after each Amplify deploy:
- Amplify build completes → build webhook → triggers `thetangle-screenshots` Lambda
- Lambda iterates over all stories in the registry and regenerates all formats
- Or: trigger per-story only (pass slug as event payload) for efficiency

---

## Backport to Birdland

The font fidelity fixes should be applied to `mlb-og-screenshots` Lambda:
- [ ] Add `--font-render-hinting=none` and `--disable-font-subpixel-positioning` to Chromium args
- [ ] Add `await page.waitForFunction(() => document.fonts.ready)` before screenshot
- [ ] Set `deviceScaleFactor: 2` in browser context
- [ ] Verify all fonts used on Birdland viz pages are self-hosted (not loaded from CDN)
