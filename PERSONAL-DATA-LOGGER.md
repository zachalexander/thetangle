# thetangle.io — Personal Data Logger

A flexible micro-logging system for capturing personal data on the go.
Feeds into thetangle.io stories as original first-party datasets.

---

## Overview

```
PWA / iOS Shortcut
       ↓
  POST /log → API Gateway → Lambda → DynamoDB
                                         ↓
                               export Lambda (scheduled)
                                         ↓
                               S3 JSON per tracker
                                         ↓
                            thetangle.io story (build-time fetch)
```

Hosted at: `log.thetangle.io`
Backend: Lambda + API Gateway + DynamoDB (existing AWS account)

---

## Tracker Types

| Type | Description | Example |
|---|---|---|
| `counter` | Tap to increment. Logs +1 per tap. | Times toddler says "dada" |
| `rating` | Score on a scale (1–5 or 1–10). | Morning mood, energy level |
| `text` | Free-form note with timestamp. | Observations, ideas |
| `binary` | Yes or no, once per day. | Did I exercise? Did I meditate? |
| `duration` | Log a start/stop time. | Time spent on a task |
| `measurement` | Numeric value with unit. | Miles walked, coffees drunk |

---

## DynamoDB Schema

### Single-table design
Table name: `thetangle-personal-data`
Partition key: `PK`, Sort key: `SK`

#### Tracker record
```
PK: TRACKER#{trackerId}
SK: METADATA

{
  "PK": "TRACKER#toddler-dada",
  "SK": "METADATA",
  "trackerId": "toddler-dada",
  "name": "Times toddler says 'dada'",
  "type": "counter",
  "description": "Track how often Theo says dada throughout the day",
  "unit": "times",
  "config": {},
  "active": true,
  "color": "#FF6B35",
  "icon": "👶",
  "createdAt": "2026-07-21T00:00:00Z"
}
```

#### Log entry record
```
PK: TRACKER#{trackerId}
SK: ENTRY#{ISO8601 timestamp}

{
  "PK": "TRACKER#toddler-dada",
  "SK": "ENTRY#2026-07-21T14:32:00Z",
  "entryId": "uuid-v4",
  "trackerId": "toddler-dada",
  "type": "counter",
  "value": 1,
  "note": null,
  "source": "pwa",     // pwa | shortcut | api
  "timestamp": "2026-07-21T14:32:00Z"
}
```

Query all entries for a tracker:
```
PK = "TRACKER#toddler-dada" AND SK begins_with "ENTRY#"
```

Query entries for a tracker within a date range:
```
PK = "TRACKER#toddler-dada"
AND SK BETWEEN "ENTRY#2026-07-01" AND "ENTRY#2026-07-31"
```

---

## API Schema

Base URL: `https://api.thetangle.io/log`
Auth: API key passed as `x-api-key` header (stored in PWA env at build time)

### Endpoints

#### List trackers
```
GET /trackers

Response 200:
[
  {
    "trackerId": "toddler-dada",
    "name": "Times toddler says 'dada'",
    "type": "counter",
    "icon": "👶",
    "color": "#FF6B35",
    "active": true,
    "todayCount": 14,      // entries today
    "lastEntry": "2026-07-21T14:32:00Z"
  },
  ...
]
```

#### Create tracker
```
POST /trackers

Body:
{
  "trackerId": "morning-mood",   // slug, user-defined
  "name": "Morning mood",
  "type": "rating",
  "description": "How I feel when I wake up",
  "unit": null,
  "config": { "scale": 5 },
  "color": "#4A86E8",
  "icon": "☀️"
}

Response 201: { tracker object }
```

#### Log an entry
```
POST /log

Body:
{
  "trackerId": "toddler-dada",
  "value": 1,          // 1 for counter, 1-5 for rating, string for text, true/false for binary
  "note": null,        // optional text note on any entry type
  "timestamp": null    // null = server time, or ISO8601 to backfill
}

Response 201:
{
  "entryId": "abc-123",
  "trackerId": "toddler-dada",
  "timestamp": "2026-07-21T14:32:00Z",
  "value": 1
}
```

#### Get entries for a tracker
```
GET /log/{trackerId}?from=2026-07-01&to=2026-07-31

Response 200:
{
  "trackerId": "toddler-dada",
  "tracker": { ...tracker metadata },
  "entries": [
    { "timestamp": "2026-07-21T14:32:00Z", "value": 1, "note": null },
    ...
  ],
  "summary": {
    "totalEntries": 42,
    "totalValue": 42,
    "firstEntry": "2026-07-01T08:12:00Z",
    "lastEntry": "2026-07-21T14:32:00Z"
  }
}
```

#### Export tracker to S3 (trigger manually or on schedule)
```
POST /export/{trackerId}

Writes to: s3://thetangle-data/personal/{trackerId}/data.json
Response 200: { "s3Key": "personal/toddler-dada/data.json" }
```

---

## PWA Structure

Hosted at `log.thetangle.io`. Built as a simple SvelteKit app.
Add to iPhone home screen → opens fullscreen like a native app.

### Manifest (`static/manifest.json`)
```json
{
  "name": "thetangle log",
  "short_name": "log",
  "start_url": "/",
  "display": "standalone",
  "background_color": "#faf9f7",
  "theme_color": "#faf9f7",
  "icons": [...]
}
```

### Routes
```
/              Home — grid of active tracker cards
/tracker/[id]  History + chart for one tracker
/new           Create a new tracker
/settings      Manage trackers (pause, archive, reorder)
```

### Component Structure
```
src/
  lib/
    api.js                    ← all fetch calls to Lambda API
    components/
      TrackerGrid.svelte       ← home screen grid layout
      CounterCard.svelte       ← big tap-to-increment button
      RatingCard.svelte        ← 1–5 dot selector
      TextCard.svelte          ← text input + submit
      BinaryCard.svelte        ← yes / no toggle
      MeasurementCard.svelte   ← numeric input + unit
      DurationCard.svelte      ← start / stop timer
      TrackerHistory.svelte    ← simple D3 sparkline of entries
      Toast.svelte             ← "Logged! ✓" confirmation flash
  routes/
    +layout.svelte             ← minimal shell, no nav clutter
    +page.svelte               ← tracker grid home
    tracker/[id]/
      +page.svelte             ← history view
    new/
      +page.svelte             ← create tracker form
    settings/
      +page.svelte             ← manage trackers
```

### Home screen (`+page.svelte`)
```
┌─────────────────────────────┐
│ thetangle log          ···  │
├──────────────┬──────────────┤
│      👶      │     ☀️       │
│  dada count  │ morning mood │
│              │              │
│     [ 47 ]   │  ● ● ● ○ ○  │
│    tap +1    │   tap to log │
├──────────────┼──────────────┤
│      ☕      │      📝      │
│   coffees    │ observation  │
│              │              │
│     [ 2 ]    │  [________]  │
│    tap +1    │    submit    │
└──────────────┴──────────────┘
```

### Offline support
Service worker queues POST /log requests when offline.
Syncs automatically when connection returns.
Critical for the counter use case — you're tapping in the moment, not waiting for wifi.

---

## Shareable Links

Enable other people to contribute to the same tracker — collaborative data collection.

### Two modes

**Mode 1 — Collaborative (shared pool)** ← build this first
All participants contribute to the same dataset. Each entry is tagged with a
`participantId` (anonymous UUID stored in localStorage, or a name they enter).
- Use case: you and your partner both tap the dada counter throughout the day
- The export includes total count + per-participant breakdown
- No accounts needed — share token is the only auth

**Mode 2 — Mirrored (each person gets their own copy)**
The share link creates an independent copy of the tracker for each participant.
Data stays separate but can be compared.
- Use case: "track your mood for 30 days, I'll track mine, let's compare"
- Requires user accounts — significantly more infrastructure
- Defer until Mode 1 is working and the use case is proven

---

### Schema changes for Mode 1

**Tracker record additions:**
```json
{
  "shareToken": "a8f3c2d1-...",     // null if not shared, UUID when sharing enabled
  "shareEnabled": true,
  "shareLabel": "Tap every time Theo says 'dada'",  // instructions shown to participants
  "showParticipantCounts": true     // whether participants can see each other's totals
}
```

**Log entry additions:**
```json
{
  "participantId": "p_abc123",      // anonymous UUID stored in participant's localStorage
  "participantName": "Sarah",       // optional, entered on first visit to share link
  "isOwner": false
}
```

---

### New API endpoints

#### Enable sharing on a tracker
```
POST /trackers/{trackerId}/share

Body: {
  "shareLabel": "Tap every time Theo says 'dada'",
  "showParticipantCounts": true
}

Response 200:
{
  "shareToken": "a8f3c2d1-...",
  "shareUrl": "https://log.thetangle.io/share/a8f3c2d1-..."
}
```

#### Revoke sharing
```
DELETE /trackers/{trackerId}/share
Response 200: { "shareEnabled": false }
```

#### Get shared tracker (public — no API key required)
```
GET /share/{shareToken}

Response 200:
{
  "trackerId": "toddler-dada",
  "name": "Times toddler says 'dada'",
  "type": "counter",
  "shareLabel": "Tap every time Theo says 'dada'",
  "icon": "👶",
  "showParticipantCounts": true,
  "todayTotal": 47,
  "participants": [
    { "participantId": "p_abc123", "name": "Sarah", "todayCount": 22 },
    { "participantId": "p_def456", "name": "Zach",  "todayCount": 25 }
  ]
}
```

#### Log an entry via share link (public — no API key required)
```
POST /share/{shareToken}/log

Body: {
  "participantId": "p_abc123",    // from localStorage
  "participantName": "Sarah",
  "value": 1,
  "note": null
}

Response 201: { "entryId": "...", "timestamp": "..." }
```

Rate limiting: 60 requests/minute per IP on public endpoints to prevent spam.

---

### PWA share route

```
/share/[shareToken]    ← public, no auth, minimal UI
```

**First visit flow:**
1. Load `/share/a8f3c2d1-...`
2. Show tracker name + share label
3. Prompt: "What's your name?" → stored in localStorage as `participantName`
4. Generate anonymous `participantId` → stored in localStorage
5. Show tracker card — ready to log

**Return visit flow:**
1. Load `/share/a8f3c2d1-...`
2. participantId + name retrieved from localStorage — straight to tracker card

**Share UI (counter example):**
```
┌─────────────────────────────────┐
│ 👶  Times toddler says 'dada'   │
│ "Tap every time Theo says dada" │
├─────────────────────────────────┤
│                                 │
│          [ TAP + 1 ]            │
│                                 │
│   Today: Sarah 22  ·  Zach 25   │
│           Total: 47             │
│                                 │
└─────────────────────────────────┘
```

Clean, minimal — just the tracker card. No nav, no home screen, no other trackers visible.

---

### Export changes for shared trackers

S3 export includes per-participant breakdown alongside the aggregate:

```json
{
  "tracker": { "trackerId": "toddler-dada", ... },
  "collaborative": true,
  "participants": [
    { "participantId": "p_abc123", "name": "Sarah" },
    { "participantId": "p_def456", "name": "Zach" }
  ],
  "entries": [
    { "timestamp": "...", "value": 1, "participantId": "p_abc123", "participantName": "Sarah" },
    ...
  ],
  "dailySummary": [
    {
      "date": "2026-07-21",
      "total": 47,
      "byParticipant": {
        "p_abc123": 22,
        "p_def456": 25
      }
    }
  ]
}
```

This lets a thetangle story show both the aggregate trend and the per-participant
breakdown — e.g. who caught more "dadas" on which days.

---

## iOS Shortcut (supplement to PWA)

For highest-frequency single trackers (like the dada counter), a lock screen shortcut
is even faster than opening the PWA.

Shortcut flow:
1. Tap shortcut icon on lock screen
2. Shortcut sends `POST /log` with hardcoded `trackerId` and `value: 1`
3. Shows notification: "Logged dada ✓ (48 today)"

No prompts, no UI — pure one-tap logging.

---

## Export to thetangle.io

### Scheduled export
EventBridge rule → export Lambda → writes all active trackers to S3 daily at midnight.

### S3 output format
```
s3://thetangle-data/personal/
  toddler-dada/
    data.json        ← full history, all entries
    summary.json     ← aggregated (daily counts, rolling averages)
  morning-mood/
    data.json
    summary.json
```

`data.json` structure (ready for D3):
```json
{
  "tracker": {
    "trackerId": "toddler-dada",
    "name": "Times toddler says 'dada'",
    "type": "counter",
    "unit": "times"
  },
  "exportedAt": "2026-07-21T00:00:00Z",
  "entries": [
    { "timestamp": "2026-07-21T08:12:00Z", "value": 1 },
    { "timestamp": "2026-07-21T09:47:00Z", "value": 1 },
    ...
  ],
  "dailySummary": [
    { "date": "2026-07-21", "total": 47, "count": 47 },
    { "date": "2026-07-20", "total": 39, "count": 39 },
    ...
  ]
}
```

### Using in a thetangle story
```js
// src/routes/work/toddler-dada/+page.js
export async function load({ fetch }) {
  const data = await fetch(
    'https://thetangle-data.s3.amazonaws.com/personal/toddler-dada/data.json'
  ).then(r => r.json());
  return { data };
}
```

---

## Story Potential

The logger itself generates story material:

- **"47 times a day"** — toddler language acquisition tracked over months, with a D3
  timeline showing when "dada" peaks and valleys
- **"My mood, mapped"** — morning rating correlated against sleep, weather, day of week
- **"The coffee chronicles"** — consumption patterns over a year
- Any personal experiment with enough data becomes a story

The meta-story — "I built a personal logger and here's what I tracked" — is itself
worth publishing as a /writing post when the tool launches.

---

## Open Questions

- [ ] Auth strategy — hardcoded API key in PWA env vars, or something more robust?
- [ ] PWA separate SvelteKit app at `log.thetangle.io`, or a route within thetangle.io?
- [ ] First tracker to build and test with — toddler dada counter is a good candidate
- [ ] Export schedule — daily midnight, or trigger manually per story?
- [ ] Sharing Mode 2 (mirrored/independent copies) — defer until Mode 1 is proven
