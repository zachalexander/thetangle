# Story: Northeast Foliage Forecast 2026

**Status**: Planning
**Target publish**: September 2026 (before peak season)

---

## Concept

A scrollytelling piece predicting when fall foliage will peak across the Northeast in 2026,
driven by historical climate data and the known science of leaf color change.
Centerpiece is an animated choropleth map showing the predicted "wave" of color
sweeping south and down from elevation as the season progresses.

---

## Narrative Arc (draft)

1. **Hook** — A map of the Northeast, fully green. "Every year, sometime in September, it starts."
2. **The science** — Why leaves change: day length triggers the process, temperature determines the pace. Short explainer before the data hits.
3. **Historical patterns** — Choropleth showing average peak date by county over the last N years. The wave is visible — Maine goes first, Connecticut last.
4. **This year's forecast** — 2026 prediction layer. Summer temperature anomalies, drought index, how this year compares to the historical average.
5. **Calendar view** — "When should I go?" Strip calendar showing predicted peak windows by region (Northern Maine, White Mountains, Catskills, Berkshires, etc.)
6. **Caveats** — What could shift the forecast (warm October, early frost, drought stress).

---

## Visualizations

- **Choropleth map** — county-level, Northeast US
  - Layer 1: historical average peak date (animated by week)
  - Layer 2: 2026 forecast peak date
  - Layer 3: diff map (earlier/later than average)
- **Calendar strip** — horizontal timeline Sep–Nov, colored bands per region showing predicted peak window
- **Sparklines or small multiples** — temperature anomaly by month for select weather stations

---

## Data Sources (to research)

| Data | Source | Notes |
|---|---|---|
| Historical foliage timing | USFS, state foliage trackers (VT, NH, ME, NY) | May need scraping |
| Temperature / climate | NOAA GHCND, PRISM Climate Group | County/gridded historical temps |
| 2026 summer temp anomalies | NOAA Climate Data Online | Compare to 30-yr normal |
| Drought index | US Drought Monitor (drought.gov) | Weekly shapefiles available |
| County GeoJSON | US Census TIGER/Line | Standard, well-maintained |
| Elevation | USGS 3DEP or NED | Affects timing within counties |
| Citizen science foliage reports | iNaturalist, Foliage Network | Potential validation layer |

---

## Key Science Notes

- **Primary trigger**: photoperiod (day length) — same every year by latitude, not weather-dependent
- **Pace/intensity driver**: temperature — cold nights below ~50°F accelerate anthocyanin production
- **Drought effect**: moderate stress can intensify color; severe stress causes early leaf drop (bad)
- **Peak definition**: typically when 50–70% of leaves have changed; varies by species
- **Species variation**: maples peak earlier and brighter; oaks later and more muted
- **Elevation gradient**: ~1 week earlier per 1,000ft of elevation gain

---

## Geographic Scope

Northeast US: ME, NH, VT, MA, RI, CT, NY, NJ, PA
Possibly extend to: MD, WV (Appalachians)

County-level granularity target — ~500 counties in scope.

---

## Named Regions for Calendar View (draft)

- Northern Maine / Aroostook
- White Mountains (NH)
- Vermont / Green Mountains
- Adirondacks (NY)
- Berkshires (MA/CT)
- Catskills (NY)
- Hudson Valley
- Pocono / Endless Mountains (PA)
- Southern New England (RI, CT, coastal MA)

---

## Prediction Approach: Data-Driven

### The Model (simple regression)
- **Target variable**: observed peak foliage date (day of year) by location
- **Predictor**: cumulative cold nights below 50°F in Aug–Sep at that location
- Science supports this directly — cold nights drive anthocyanin production
- Secondary predictors to test: drought index, summer high temp anomaly

### Pipeline
```
Historical foliage dates (by location, by year)
  +
Historical daily temps (NOAA GHCND or PRISM gridded)
  → compute cold nights Aug–Sep per location per year
  → fit regression: cold nights → peak date
  → apply to 2026 Aug–Sep temps (actuals + NOAA outlook for remaining days)
  → output: predicted peak date per county
  → diff against historical average → "earlier/later than usual" layer
```

### Data Acquisition (priority order)

1. **Historical foliage peak dates**
   - USA National Phenology Network (usa-np.org) — best scientific source, tracks fall coloration
   - State foliage trackers: VT, NH, ME, NY all run public weekly reports (need scraping)
   - Foliage Network (foliagenetwork.com) — crowdsourced, goes back ~20 years
   - USFS Autumn Colors program

2. **Historical temperature data**
   - PRISM Climate Group (prism.oregonstate.edu) — 4km gridded daily, clean, well-documented
   - NOAA GHCND — station-level, needs interpolation to county
   - Daymet — another gridded option, 1km resolution

3. **2026 temperature data**
   - NOAA Climate Data Online — actuals through today
   - NOAA CPC seasonal outlook — probabilistic forecast for remaining weeks

4. **County GeoJSON**
   - US Census TIGER/Line shapefiles — standard

### Key Questions to Resolve Before Build
- [ ] Can USA-NPN export peak date observations by county/year? (check their data portal)
- [ ] PRISM or GHCND for temp data? (PRISM easier to work with at county level)
- [ ] How many years of foliage data are realistically available? (target: 10–20 years)
- [ ] Animate the map wave or use a scrubber/slider?
