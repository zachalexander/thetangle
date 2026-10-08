/**
 * Merge county error analysis into county-daylight.json.
 * Adds `errorPct` (maxEveningShareErrorPct, rounded to 1 decimal) to each county.
 * Counties not in the error analysis get errorPct: 0.
 *
 * Usage: node scripts/merge-county-error.js
 */

import { readFileSync, writeFileSync } from 'fs';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const dataDir = join(__dirname, '..', 'static', 'data');

const daylight = JSON.parse(readFileSync(join(dataDir, 'county-daylight.json'), 'utf-8'));
const errors = JSON.parse(readFileSync(join(dataDir, 'county-error-analysis.json'), 'utf-8'));

// Build FIPS → error lookup
const errorByFips = new Map();
for (const e of errors) {
	errorByFips.set(e.fips, Math.round(e.maxEveningShareErrorPct * 10) / 10);
}

// Merge
for (const county of daylight) {
	county.errorPct = errorByFips.get(county.fips) ?? 0;
}

writeFileSync(join(dataDir, 'county-daylight.json'), JSON.stringify(daylight));

const withError = daylight.filter((d) => d.errorPct > 0).length;
const highError = daylight.filter((d) => d.errorPct >= 5).length;
console.log(`Merged error data: ${withError} counties with errorPct > 0, ${highError} with >= 5%`);
