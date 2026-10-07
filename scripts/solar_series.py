#!/usr/bin/env python3
"""
solar_series.py — compute sun position at bedtime for each day of a year.

Uses astral (Python) for accurate solar math. Never hand-rolls DST — uses
zoneinfo with IANA timezone strings throughout.

Usage:
  python scripts/solar_series.py [options]

Options:
  --lat      Latitude in decimal degrees   (default: 40.71)
  --lon      Longitude in decimal degrees  (default: -74.01)
  --tz       IANA timezone string          (default: America/New_York)
  --year     Year to compute               (default: 2026)
  --bedtime  Minutes past midnight, local  (default: 1170 = 19:30)
  --slug     Output filename slug          (default: nyc)

Output:
  data/out/solar_<slug>_<year>.csv

  Columns:
    date                     ISO 8601 date
    sunset_local             HH:MM local time (blank if sun never sets)
    civil_dusk_local         HH:MM local time (blank if undefined)
    sun_altitude_at_bedtime  Degrees above horizon (negative = below)
    sun_azimuth_at_bedtime   Degrees clockwise from north
    twilight_minutes         Minutes between sunset and civil dusk
    is_lit                   True if sun altitude at bedtime > 0

  Stdout summary:
    Lit evenings, crossing date, return date

Acceptance tests (NYC / 2026 / 19:30):
  Jun 21 sunset 20:30, alt +9.4°
  Aug 31 sunset 19:29, alt -0.5°  ← crossing
  Lit evenings: 143
"""

import argparse
import csv
import sys
from datetime import date, datetime, timedelta
from pathlib import Path
from zoneinfo import ZoneInfo

from astral import Observer
from astral.sun import azimuth, dusk, elevation, sunset

# ── Verification table (NYC / 2026 / 19:30) ──────────────────────────────────
VERIFY = [
    (date(2026, 6, 21), "20:30", +9.4),
    (date(2026, 7, 15), "20:25", +8.9),
    (date(2026, 8, 15), "19:53", +3.7),
    (date(2026, 8, 31), "19:29", -0.5),
    (date(2026, 9, 20), "18:56", -7.1),
    (date(2026, 10, 15), "18:15", -14.8),
    (date(2026, 10, 24), "18:02", -17.2),
    (date(2026, 11, 15), "16:37", -32.6),
]


def parse_args():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--lat",     type=float, default=40.71)
    p.add_argument("--lon",     type=float, default=-74.01)
    p.add_argument("--tz",      default="America/New_York")
    p.add_argument("--year",    type=int,   default=2026)
    p.add_argument("--bedtime", type=int,   default=1170,
                   help="Minutes past midnight in local time (e.g. 1170 = 19:30)")
    p.add_argument("--slug",    default="nyc")
    p.add_argument("--verify",  action="store_true",
                   help="Print verification table and exit (NYC/2026/19:30 only)")
    return p.parse_args()


def fmt_time(dt):
    """HH:MM string from a datetime."""
    return dt.strftime("%H:%M")


def compute_day(obs, d, tz, bedtime_h, bedtime_m):
    """Return a dict of solar values for one day."""
    # Sunset
    try:
        ss = sunset(obs, date=d, tzinfo=tz)
        sunset_str = fmt_time(ss)
    except ValueError:
        ss = None
        sunset_str = ""

    # Civil dusk
    try:
        dk = dusk(obs, date=d, tzinfo=tz)
        dusk_str = fmt_time(dk)
    except ValueError:
        dk = None
        dusk_str = ""

    # Twilight duration
    if ss and dk:
        twilight_mins = round((dk - ss).total_seconds() / 60, 1)
    else:
        twilight_mins = ""

    # Sun position at bedtime
    bedtime_dt = datetime(d.year, d.month, d.day, bedtime_h, bedtime_m, tzinfo=tz)
    alt = elevation(obs, dateandtime=bedtime_dt)
    az  = azimuth(obs, dateandtime=bedtime_dt)

    return {
        "date":                     d.isoformat(),
        "sunset_local":             sunset_str,
        "civil_dusk_local":         dusk_str,
        "sun_altitude_at_bedtime":  round(alt, 2),
        "sun_azimuth_at_bedtime":   round(az, 2),
        "twilight_minutes":         twilight_mins,
        "is_lit":                   alt > 0,
    }


def run_verify(obs, tz):
    """Print acceptance-test table and return True if all pass."""
    print("Verification (NYC / 2026 / 19:30):")
    print(f"  {'Date':<10}  {'Sunset':>6}  {'Exp':>6}  {'Alt':>7}  {'Exp':>7}  {'OK'}")
    print(f"  {'-'*10}  {'-'*6}  {'-'*6}  {'-'*7}  {'-'*7}  {'-'*3}")
    bedtime_h, bedtime_m = 19, 30
    all_ok = True
    for d, exp_ss, exp_alt in VERIFY:
        row = compute_day(obs, d, tz, bedtime_h, bedtime_m)
        got_ss  = row["sunset_local"]
        got_alt = row["sun_altitude_at_bedtime"]
        alt_ok  = abs(got_alt - exp_alt) < 0.2
        ss_ok   = got_ss == exp_ss
        ok      = "✓" if (alt_ok and ss_ok) else "✗"
        if not (alt_ok and ss_ok):
            all_ok = False
        print(f"  {d.isoformat():<10}  {got_ss:>6}  {exp_ss:>6}  "
              f"{got_alt:>+7.1f}°  {exp_alt:>+7.1f}°  {ok}")
    print()
    return all_ok


def main():
    args = parse_args()

    tz  = ZoneInfo(args.tz)
    obs = Observer(latitude=args.lat, longitude=args.lon)

    if args.verify:
        ok = run_verify(obs, tz)
        sys.exit(0 if ok else 1)

    bedtime_h = args.bedtime // 60
    bedtime_m = args.bedtime % 60

    # Build day list for the full year
    start = date(args.year, 1, 1)
    end   = date(args.year + 1, 1, 1)
    rows  = []

    d = start
    while d < end:
        rows.append(compute_day(obs, d, tz, bedtime_h, bedtime_m))
        d += timedelta(days=1)

    # ── Summary stats ─────────────────────────────────────────────────────────
    lit_count     = sum(1 for r in rows if r["is_lit"])
    crossing_date = None   # first dark evening in autumn
    return_date   = None   # first lit evening in spring
    prev_lit      = None

    for r in rows:
        is_lit = r["is_lit"]
        d_obj  = date.fromisoformat(r["date"])

        if prev_lit is True and not is_lit and d_obj.month >= 6 and crossing_date is None:
            crossing_date = r["date"]

        if prev_lit is False and is_lit and d_obj.month <= 6 and return_date is None:
            return_date = r["date"]

        prev_lit = is_lit

    # ── Azimuth range ─────────────────────────────────────────────────────────
    # Report at solstice and Nov 1 as the spec describes
    solstice_row = next((r for r in rows if r["date"] == f"{args.year}-06-21"), None)
    nov1_row     = next((r for r in rows if r["date"] == f"{args.year}-11-01"), None)

    # ── DST cliff ─────────────────────────────────────────────────────────────
    oct31_row = next((r for r in rows if r["date"] == f"{args.year}-10-31"), None)
    nov1_row2 = next((r for r in rows if r["date"] == f"{args.year}-11-01"), None)

    # ── Print summary ─────────────────────────────────────────────────────────
    bedtime_str = f"{bedtime_h}:{bedtime_m:02d}"
    print(f"Location:       lat={args.lat}, lon={args.lon}, tz={args.tz}")
    print(f"Year:           {args.year}")
    print(f"Bedtime:        {bedtime_str} local ({args.bedtime} min past midnight)")
    print()
    print(f"Lit evenings:   {lit_count}")
    print(f"Crossing date:  {crossing_date}  (first dark evening in autumn)")
    print(f"Return date:    {return_date}  (first lit evening in spring)")
    print()

    if solstice_row and nov1_row:
        print(f"Azimuth at bedtime:  {solstice_row['sun_azimuth_at_bedtime']}° (Jun 21)"
              f"  →  {nov1_row['sun_azimuth_at_bedtime']}° (Nov 1)")
        print(f"  (spec: 293° Jun → 269° Nov)")

    if oct31_row and nov1_row2:
        print(f"DST cliff:  Oct 31 sunset {oct31_row['sunset_local']}"
              f"  →  Nov 1 sunset {nov1_row2['sunset_local']}")
        print(f"  (spec: Oct 31 17:53 → Nov 1 16:51)")

    print()

    # ── Write CSV ─────────────────────────────────────────────────────────────
    out_dir  = Path("data/out")
    out_dir.mkdir(parents=True, exist_ok=True)
    out_path = out_dir / f"solar_{args.slug}_{args.year}.csv"

    with open(out_path, "w", newline="") as f:
        writer = csv.DictWriter(f, fieldnames=list(rows[0].keys()))
        writer.writeheader()
        writer.writerows(rows)

    print(f"Written: {out_path}  ({len(rows)} rows)")


if __name__ == "__main__":
    main()
