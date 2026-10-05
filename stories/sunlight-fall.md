# CLAUDE.md

## Project

**The Last Lit Evening** — a hand-drawn data animation about the end of summer, published as an interactive web piece.

**Thesis:** At 40.7°N, a child with a 7:30pm bedtime gets 143 lit evenings a year, and the last one falls on August 31.

This repo holds the **data pipeline** and the **web frontend**. The animation itself is drawn in Procreate and assembled in Procreate Dreams — those assets arrive as exported video and PNG sequences, not as code.

---

## Stack

- **Python 3.11+** for the data pipeline. `astral`, `pandas`, `pillow`, `requests`.
- **Vanilla JS** for the frontend. No framework. `SunCalc` for solar math in the browser.
- No build step unless one becomes necessary. Plain HTML/CSS/JS served statically.

---

## Repo layout

```
/data
  raw/              downloaded PhenoCam CSVs and images (gitignored)
  out/              generated CSVs, palettes, reference strips
/scripts
  solar_series.py
  sky_palette.py
  phenocam_palette.py
  reference_strip.py
/web
  index.html
  calculator.js
  cities.json
  styles.css
/assets
  video/            exports from Dreams (gitignored, large)
  frames/           PNG sequence for scrollytelling
```

---

## Data sources

### Solar — computed, never downloaded
Use `astral`. Never hand-roll DST; use `zoneinfo` in Python and `Intl.DateTimeFormat` with IANA timezone strings in JS.

Note on the astral API: `astral.sun.sun()` raises at high latitudes when a phase doesn't occur. Use the individual functions (`sunset`, `elevation`, `azimuth`) and handle the exception — Anchorage and Reykjavik will hit this.

### PhenoCam — foliage color
- Dataset: PhenoCam v3.0, 738 sites, 4,805 site-years, 2000–2023
- Host: ORNL DAAC, doi `10.3334/ONRLDAAC/2389` (verify exact DOI before citing)
- Primary site: `harvard` (Harvard Forest, MA), deciduous broadleaf ROI
- Need the 3-day summary CSV plus gallery images

Indices in the CSV:
```
GCC = G / (R + G + B)
RCC = R / (R + G + B)
```
**Use RCC.** It identifies peak autumn color timing; GCC only tracks green-up and fade.

**Known issue:** cameras run automatic white balance, so sampled colors drift with illumination independently of the leaves. Sample only from midday images, or normalize against a fixed in-frame reference.

---

## Scripts to build

### `solar_series.py`
```
Input:  lat, lon, tz (IANA), year, bedtime_minutes (int, minutes past midnight)
Output: data/out/solar_<slug>_<year>.csv
```
One row per day:
```
date, sunset_local, civil_dusk_local, sun_altitude_at_bedtime,
sun_azimuth_at_bedtime, twilight_minutes, is_lit
```
Also print to stdout: crossing date (autumn `is_lit` → false), return date (spring → true), total lit evenings.

### `sky_palette.py`
```
Input:  solar CSV from above
Output: data/out/sky.swatches (Procreate format), data/out/sky_strip.png
```
Map altitude to sky color. Bands to calibrate against:

| Altitude | Phase |
|---|---|
| above +5° | daylight |
| +5° to 0° | golden |
| 0° to −6° | civil twilight |
| −6° to −12° | nautical |
| below −12° | night |

Procreate `.swatches` files are JSON in a zip container. Verify the format against a file exported from the app rather than guessing.

### `phenocam_palette.py`
```
Input:  site id, roi id, year
Output: data/out/canopy.swatches, data/out/rcc_<site>_<year>.csv
```
Fetch the site CSV, find the annual RCC maximum (that date is beat 5), pull gallery images at roughly weekly intervals, extract dominant canopy colors. Cache downloads in `data/raw/` — do not refetch on every run.

### `reference_strip.py`
```
Input:  solar CSV, canvas width (default 1920)
Output: data/out/reference_strip.png
```
One column per day from Jun 21 to Dec 1 (163 columns). Each column shows the true sky color, a tick at the sun's correct pixel height, and a marker at the crossing date. This gets imported into Procreate as a locked layer for eyedropping, so column boundaries must be crisp — no interpolation, no antialiasing.

---

## Verified values — use as acceptance tests

New York, 40.71°N, −74.01°W, `America/New_York`, 2026, bedtime 19:30.

Sun altitude at 19:30 local:

| Date | Sunset | Altitude |
|---|---|---|
| Jun 21 | 20:30 | +9.4° |
| Jul 15 | 20:25 | +8.9° |
| Aug 15 | 19:53 | +3.7° |
| **Aug 31** | **19:29** | **−0.5°** |
| Sep 20 | 18:56 | −7.1° |
| Oct 15 | 18:15 | −14.8° |
| Oct 24 | 18:02 | −17.2° |
| Nov 15 | 16:37 | −32.6° |

Other expected outputs:
- Lit evenings in 2026: **143**
- Crossing date: **Aug 31**
- Azimuth drifts 293° (Jun) → 269° (Nov)
- Twilight duration: 34 min at solstice, 28 min near equinox, 31 min by Dec 1
- DST cliff: Oct 31 sunset 17:53 → Nov 1 sunset 16:51

Cross-city crossings at 19:30 bedtime, 2026:

| City | Goes dark | Lit evenings |
|---|---|---|
| Phoenix | Jul 30 | 63 |
| Los Angeles | Aug 23 | 122 |
| Chicago | Aug 29 | 137 |
| New York | Aug 31 | 143 |
| Denver | Sep 2 | 148 |
| London | Sep 9 | 163 |
| Seattle | Sep 11 | 169 |
| Miami | Sep 11 | 178 |
| Minneapolis | Sep 12 | 172 |
| Houston | Sep 13 | 181 |
| Detroit | Sep 22 | 198 |
| Atlanta | Sep 25 | 201 |
| Anchorage | Oct 1 | 207 |

If a script disagrees with these, the script is wrong.

---

## Web frontend

### Calculator (`calculator.js`)
User picks a city and a bedtime; gets their own dates.

- SunCalc for sunset from lat/lon
- `Intl.DateTimeFormat` with IANA timezone for local clock time and DST
- **No geocoding API.** Bundle cities in `cities.json` as `[name, lat, lon, tz]`
- Outputs: lit evenings per year, date it goes dark, date it returns
- Handle the edge cases: some city/bedtime combinations yield zero lit evenings (Phoenix at 20:00) or all 365 (tropical cities at early bedtimes). Both need their own copy, not a broken date.
- Shareable URL state: `?city=chicago&bedtime=1170`

### Scrollytelling
Scroll position drives frame index. IntersectionObserver plus a canvas drawing from a preloaded image sequence. Scrollama is acceptable.

Fall back to a plain `<video>` with a scrub bar on mobile.

### Performance budget
- Animation under **5MB total**
- Preload first ~20 frames, stream the rest
- Lazy-load the calculator
- Test throttled to 3G before shipping

### Accessibility — not optional
- Honor `prefers-reduced-motion`: serve the static compression image instead
- Real `<select>` and `<input type="range">`, not custom divs
- Alt text describes the arc, not "an animation of a tree"
- Meaning must not rest on color alone — the sun's position and the clock carry it independently

---

## Conventions

- Scripts take CLI args, not hardcoded constants. Default to NYC/2026/19:30.
- All generated output goes to `data/out/`. Never write into `data/raw/`.
- Cache every network fetch. PhenoCam is a public research resource — do not hammer it.
- Times are local to the city being computed. Store IANA timezone strings, never UTC offsets.
- Dates in output CSVs are ISO 8601.

---

## Out of scope

Do not add, even if it seems relevant:

- Daylight saving policy, the Sunshine Protection Act, legislative context
- Melatonin, children's sleep health, circadian disruption
- Anything requiring an API key
- A framework, a bundler, or a state management library

The piece is warm and short. All of the above are real and well-evidenced, and all of them would turn it into an argument.

---

## Credits to render on the page

```
Sunset times computed from standard solar equations.
Foliage color sampled from the PhenoCam Network,
Harvard Forest site, ORNL DAAC.
```

Check PhenoCam's license terms before publishing.