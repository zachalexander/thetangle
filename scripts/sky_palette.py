#!/usr/bin/env python3
"""
sky_palette.py — map sun altitude at bedtime to sky colors.

Reads:  data/out/solar_<slug>_<year>.csv  (from solar_series.py)
Writes:
  data/out/sky_<slug>_<year>.swatches  — Procreate palette (zip + JSON)
  data/out/sky_strip_<slug>_<year>.png — reference strip, 1 column per day

Sky phases by altitude at bedtime:
  above +5°   daylight   (warm blue sky, golden horizon)
  +5° to  0°  golden     (deepening blue, orange horizon)
   0° to −6°  civil      (indigo→mauve above, orange→pink→mauve horizon)
  −6° to −12° nautical   (dark blue)
  below −12°  night      (near-black)

Swatches palette (60 swatches = 2 rows of 30):
  Row 1: zenith  (top-of-sky) color, one per ~5.4 days Jun 21 → Dec 1
  Row 2: horizon color at the same 30 dates

IMPORTANT: Procreate .swatches format is a zip containing Swatches.json.
  If the palette fails to import, inspect the JSON with --dump-swatches
  and compare against a palette exported from the app.

Usage:
  python scripts/sky_palette.py [--slug nyc] [--year 2026] [--dump-swatches]
"""

import argparse
import colorsys
import csv
import io
import json
import zipfile
from datetime import date
from pathlib import Path

from PIL import Image, ImageDraw, ImageFont

# ── Color ramp ────────────────────────────────────────────────────────────────
# Each entry: (altitude_degrees, zenith_hex, horizon_hex)
# Zenith  = what you see looking straight up at bedtime
# Horizon = the glow/color at the horizon at bedtime
#
# These are calibrated against the spec's 5 altitude bands:
#   >+5° daylight / +5° to 0° golden / 0° to -6° civil / -6° to -12° nautical / <-12° night
#
# NOTE: These are intentionally warm approximations for Procreate reference.
# Calibrate against real sky photos or PhenoCam imagery before finalizing.

COLOR_RAMP = [
    (+18, "#8DC8EC", "#FFF0C8"),  # mid-afternoon: light sky blue, pale warm haze
    (+12, "#72B8E8", "#FFD890"),  # afternoon: medium blue, warm cream-gold
    ( +8, "#5AA0D8", "#FFBE60"),  # late afternoon: deeper blue, golden horizon
    ( +5, "#4888C0", "#FFA040"),  # ── golden hour threshold ──
    ( +3, "#3A70A8", "#F07830"),  # golden hour: warm blue zenith, orange horizon
    ( +1, "#305888", "#E85C20"),  # sun just above horizon: indigo, deep orange
    (  0, "#2C4878", "#E04818"),  # ── CROSSING ── sunset red-orange glow
    ( -1, "#263870", "#C83A40"),  # just set — orange-red fading to pink
    ( -2, "#203068", "#A42E60"),  # pink fade deepening
    ( -3, "#1A2860", "#823078"),  # mauve rising
    ( -4, "#152050", "#602070"),  # late civil twilight, deep indigo
    ( -5, "#111840", "#481868"),  # last blue light fading
    ( -6, "#0D1430", "#301050"),  # ── nautical begins — very dark ──
    ( -9, "#090C22", "#1A0C38"),
    (-12, "#060818", "#100A24"),  # ── astronomical ──
    (-20, "#040510", "#090718"),
    (-35, "#020308", "#050408"),  # night
]

# Date range for the animation (Jun 21 → Dec 1)
ANIM_START = date(2026, 6, 21)
ANIM_END   = date(2026, 12, 1)   # exclusive


# ── Helpers ───────────────────────────────────────────────────────────────────

def parse_hex(h):
    h = h.lstrip("#")
    return tuple(int(h[i:i+2], 16) for i in (0, 2, 4))


def lerp_color(c1_hex, c2_hex, t):
    """Linearly interpolate between two hex colors. t=0 → c1, t=1 → c2."""
    r1, g1, b1 = parse_hex(c1_hex)
    r2, g2, b2 = parse_hex(c2_hex)
    r = int(r1 + (r2 - r1) * t)
    g = int(g1 + (g2 - g1) * t)
    b = int(b1 + (b2 - b1) * t)
    return (max(0, min(255, r)), max(0, min(255, g)), max(0, min(255, b)))


def altitude_to_colors(alt):
    """Return (zenith_rgb, horizon_rgb) for a given sun altitude in degrees."""
    clamped = max(COLOR_RAMP[-1][0], min(COLOR_RAMP[0][0], alt))

    for i in range(len(COLOR_RAMP) - 1):
        hi_alt, hi_z, hi_h = COLOR_RAMP[i]
        lo_alt, lo_z, lo_h = COLOR_RAMP[i + 1]
        if clamped <= hi_alt and clamped >= lo_alt:
            t = (clamped - lo_alt) / (hi_alt - lo_alt) if hi_alt != lo_alt else 0
            return lerp_color(lo_z, hi_z, t), lerp_color(lo_h, hi_h, t)

    last = COLOR_RAMP[-1]
    return parse_hex(last[1]), parse_hex(last[2])


def rgb_to_hsb(rgb):
    """Convert (r, g, b) 0-255 integers to Procreate HSB floats 0-1."""
    r, g, b = [v / 255 for v in rgb]
    h, s, v = colorsys.rgb_to_hsv(r, g, b)
    return h, s, v


def make_swatch(rgb):
    h, s, b = rgb_to_hsb(rgb)
    return {"hue": h, "saturation": s, "brightness": b, "alpha": 1.0, "colorSpace": 0}


def load_csv(slug, year):
    path = Path(f"data/out/solar_{slug}_{year}.csv")
    if not path.exists():
        raise FileNotFoundError(
            f"{path} not found — run solar_series.py first:\n"
            f"  python scripts/solar_series.py --slug {slug} --year {year}"
        )
    rows = []
    with open(path) as f:
        for row in csv.DictReader(f):
            rows.append({
                "date": date.fromisoformat(row["date"]),
                "alt":  float(row["sun_altitude_at_bedtime"]),
                "sunset": row["sunset_local"],
                "is_lit": row["is_lit"] == "True",
            })
    return rows


def anim_rows(rows):
    """Filter to the animation date range Jun 21 – Nov 30."""
    return [r for r in rows if ANIM_START <= r["date"] < ANIM_END]


# ── Swatches ──────────────────────────────────────────────────────────────────

def build_swatches(anim, slug, year):
    """
    Build 60 swatches: 30 zenith + 30 horizon, sampled evenly across the range.
    Procreate palette: 6 cols × 5 rows per page = 30 swatches per page.
    """
    n = len(anim)
    indices = [round(i * (n - 1) / 29) for i in range(30)]  # 30 evenly-spaced

    zenith_swatches  = []
    horizon_swatches = []

    for i in indices:
        row = anim[i]
        z_rgb, h_rgb = altitude_to_colors(row["alt"])
        zenith_swatches.append(make_swatch(z_rgb))
        horizon_swatches.append(make_swatch(h_rgb))

    # Pad to 30 with nulls if needed (shouldn't be necessary)
    while len(zenith_swatches) < 30:
        zenith_swatches.append(None)
    while len(horizon_swatches) < 30:
        horizon_swatches.append(None)

    payload = {
        "name": f"Sky at bedtime · {slug.upper()} {year}",
        "swatches": zenith_swatches + horizon_swatches,
    }

    out_path = Path(f"data/out/sky_{slug}_{year}.swatches")
    buf = io.BytesIO()
    with zipfile.ZipFile(buf, "w", zipfile.ZIP_DEFLATED) as zf:
        zf.writestr("Swatches.json", json.dumps(payload, indent=2))
    out_path.write_bytes(buf.getvalue())
    return out_path, payload


# ── Strip PNG ─────────────────────────────────────────────────────────────────

KEY_DATES = {
    date(2026, 6, 21): "Jun 21",
    date(2026, 8, 1):  "Aug 1",
    date(2026, 8, 31): "Aug 31 ←",  # crossing
    date(2026, 10, 1): "Oct 1",
    date(2026, 11, 1): "Nov 1",
    date(2026, 12, 1): "Dec 1",
}

STRIP_W = 1920
STRIP_H = 200
LABEL_H = 28   # pixels reserved for date labels at bottom


def build_strip(anim, slug, year):
    n   = len(anim)
    img = Image.new("RGB", (STRIP_W, STRIP_H), (0, 0, 0))
    col_w = STRIP_W / n

    # Draw sky gradient columns
    for i, row in enumerate(anim):
        x0 = int(i * col_w)
        x1 = int((i + 1) * col_w) + 1
        z_rgb, h_rgb = altitude_to_colors(row["alt"])

        # Vertical gradient: zenith at top, horizon at bottom
        sky_h = STRIP_H - LABEL_H
        for y in range(sky_h):
            t = y / (sky_h - 1)
            px = lerp_color(
                "#%02x%02x%02x" % z_rgb,
                "#%02x%02x%02x" % h_rgb,
                t,
            )
            img.paste(Image.new("RGB", (x1 - x0, 1), px), (x0, y))

        # White tick at crossing (Aug 31)
        if row["date"] == date(2026, 8, 31):
            img.paste(Image.new("RGB", (max(1, x1 - x0), sky_h), (255, 255, 255, 128)),
                      (x0, 0))

        # Thin grey tick at DST end (Nov 1)
        if row["date"] == date(2026, 11, 1):
            img.paste(Image.new("RGB", (1, sky_h), (180, 180, 180)), (x0, 0))

    # Label area background
    draw = ImageDraw.Draw(img)
    draw.rectangle([(0, STRIP_H - LABEL_H), (STRIP_W, STRIP_H)], fill=(18, 18, 18))

    # Date labels
    try:
        font = ImageFont.truetype("/System/Library/Fonts/Helvetica.ttc", 11)
    except Exception:
        font = ImageFont.load_default()

    for row in anim:
        if row["date"] in KEY_DATES:
            i = anim.index(row)
            x = int(i * col_w)
            label = KEY_DATES[row["date"]]
            draw.text((x + 3, STRIP_H - LABEL_H + 8), label, fill=(160, 160, 160), font=font)

    out_path = Path(f"data/out/sky_strip_{slug}_{year}.png")
    img.save(out_path, "PNG")
    return out_path


# ── Main ──────────────────────────────────────────────────────────────────────

def parse_args():
    p = argparse.ArgumentParser(description=__doc__,
                                formatter_class=argparse.RawDescriptionHelpFormatter)
    p.add_argument("--slug",          default="nyc")
    p.add_argument("--year",          type=int, default=2026)
    p.add_argument("--dump-swatches", action="store_true",
                   help="Print Swatches.json to stdout instead of writing the file")
    return p.parse_args()


def main():
    args = parse_args()

    rows = load_csv(args.slug, args.year)
    anim = anim_rows(rows)

    print(f"Loaded {len(rows)} days from solar CSV, {len(anim)} in animation range "
          f"({ANIM_START} → {ANIM_END})")

    # Swatches
    sw_path, payload = build_swatches(anim, args.slug, args.year)

    if args.dump_swatches:
        print(json.dumps(payload, indent=2))
        return

    print(f"Written: {sw_path}  ({len([s for s in payload['swatches'] if s])} swatches)")

    # Spot-check: print the crossing-date swatch
    crossing_idx = next((i for i, r in enumerate(anim) if r["date"] == date(2026, 8, 31)), None)
    if crossing_idx is not None:
        z, h = altitude_to_colors(anim[crossing_idx]["alt"])
        print(f"\nCrossing date (Aug 31) colors:")
        print(f"  Zenith:  rgb{z}  alt={anim[crossing_idx]['alt']:+.1f}°")
        print(f"  Horizon: rgb{h}")

    # Strip PNG
    strip_path = build_strip(anim, args.slug, args.year)
    print(f"Written: {strip_path}  ({STRIP_W}×{STRIP_H}px)")

    print(f"\nProcreate import:")
    print(f"  Palettes → import → {sw_path}")
    print(f"  Row 1 = zenith colors (Jun 21 → Dec 1)")
    print(f"  Row 2 = horizon colors at the same dates")
    print(f"\n  If the palette fails to import, run --dump-swatches and")
    print(f"  compare the JSON against a file exported from Procreate.")


if __name__ == "__main__":
    main()
