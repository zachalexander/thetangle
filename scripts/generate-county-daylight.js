/**
 * Generate county-level daylight data for the US choropleth map.
 *
 * Fetches Census county centroids, assigns IANA timezones via geo-tz,
 * runs SunCalc for every day of 2026, and writes county-daylight.json.
 *
 * Usage: node scripts/generate-county-daylight.js
 */

import { writeFileSync, readFileSync, existsSync, mkdirSync } from 'fs';
import { find as findTimezone } from 'geo-tz';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const SunCalc = require('suncalc');

const YEAR = 2026;
const CENSUS_URL =
	'https://www2.census.gov/geo/docs/reference/cenpop2020/county/CenPop2020_Mean_CO.txt';
const RAW_DIR = 'data/raw';
const CACHE_PATH = `${RAW_DIR}/CenPop2020_Mean_CO.txt`;
const OUTPUT_PATH = 'static/data/county-daylight.json';

// ── Fetch & cache Census centroids ──────────────────────────────────────────

async function fetchCentroids() {
	if (existsSync(CACHE_PATH)) {
		console.log('Using cached Census centroid file.');
		return readFileSync(CACHE_PATH, 'utf-8');
	}
	console.log('Downloading Census county centroids…');
	mkdirSync(RAW_DIR, { recursive: true });
	const res = await fetch(CENSUS_URL);
	if (!res.ok) throw new Error(`Census download failed: ${res.status}`);
	const text = await res.text();
	writeFileSync(CACHE_PATH, text);
	return text;
}

function parseCentroids(csv) {
	const lines = csv.trim().split('\n');
	// Header: STATEFP,COUNTYFP,COUNAME,STNAME,POPULATION,LATITUDE,LONGITUDE
	const counties = [];
	for (let i = 1; i < lines.length; i++) {
		const cols = lines[i].split(',');
		if (cols.length < 7) continue;
		const statefp = cols[0].trim();
		const countyfp = cols[1].trim();
		const fips = statefp + countyfp;
		const name = cols[2].trim();
		const state = cols[3].trim();
		const lat = parseFloat(cols[5]);
		const lng = parseFloat(cols[6]);
		if (isNaN(lat) || isNaN(lng)) continue;
		counties.push({ fips, name, state, lat, lng });
	}
	return counties;
}

// ── Timezone helpers ────────────────────────────────────────────────────────

// Cache Intl.DateTimeFormat instances per timezone for fast local-time conversion
const formatterCache = new Map();

function getFormatter(tz) {
	if (!formatterCache.has(tz)) {
		formatterCache.set(
			tz,
			new Intl.DateTimeFormat('en-US', {
				timeZone: tz,
				hour: 'numeric',
				minute: 'numeric',
				hour12: false
			})
		);
	}
	return formatterCache.get(tz);
}

/** Convert a UTC Date to fractional local hours using Intl formatter. */
function toLocalHours(date, formatter) {
	const parts = formatter.formatToParts(date);
	let h = 0,
		m = 0;
	for (const p of parts) {
		if (p.type === 'hour') h = parseInt(p.value, 10);
		if (p.type === 'minute') m = parseInt(p.value, 10);
	}
	// Intl hour12:false gives 0–23 for hour, but midnight can be "24" in some locales
	if (h === 24) h = 0;
	return h + m / 60;
}

/** Format fractional hours as "H:MM am/pm" */
function formatTime(fractionalHours) {
	const totalMin = Math.round(fractionalHours * 60);
	let h = Math.floor(totalMin / 60);
	const m = totalMin % 60;
	const ampm = h >= 12 ? 'pm' : 'am';
	if (h === 0) h = 12;
	else if (h > 12) h -= 12;
	return `${h}:${String(m).padStart(2, '0')} ${ampm}`;
}

// ── Timezone zone labels ─────────────────────────────────────────────────────

/** Map IANA timezone to simplified US zone label */
function zoneLabel(iana) {
	if (iana.startsWith('Pacific/')) return 'Hawaii';
	if (iana.includes('Anchorage') || iana.includes('Juneau') || iana.includes('Sitka') || iana.includes('Yakutat') || iana.includes('Nome') || iana.includes('Metlakatla') || iana.includes('Adak')) return 'Alaska';
	if (iana.includes('Phoenix')) return 'Arizona';
	if (iana.includes('Los_Angeles')) return 'Pacific';
	if (iana.includes('Denver') || iana.includes('Boise')) return 'Mountain';
	if (iana.includes('Chicago') || iana.includes('Menominee') || iana.includes('Indiana/Knox') || iana.includes('Indiana/Tell_City') || iana.includes('North_Dakota')) return 'Central';
	if (iana.includes('New_York') || iana.includes('Detroit') || iana.includes('Indiana') || iana.includes('Kentucky') || iana.includes('Louisville')) return 'Eastern';
	// Fallback: guess from common patterns
	if (iana.includes('America/')) {
		// Catch remaining America/ zones
		return 'Other';
	}
	return 'Other';
}

// ── Main calculation ────────────────────────────────────────────────────────

function computeCountyDaylight(counties) {
	const results = [];
	const total = counties.length;
	const startTime = Date.now();

	// Build array of dates for the year
	const dates = [];
	const start = new Date(YEAR, 0, 1);
	const end = new Date(YEAR + 1, 0, 1);
	for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
		dates.push(new Date(d));
	}

	for (let i = 0; i < total; i++) {
		const { fips, name, state, lat, lng } = counties[i];

		// Assign timezone
		const tzResults = findTimezone(lat, lng);
		const tz = tzResults[0];
		if (!tz) {
			console.warn(`No timezone for FIPS ${fips} (${lat}, ${lng}), skipping.`);
			continue;
		}

		const formatter = getFormatter(tz);

		let totalMinutes = 0;
		let eveningMinutes = 0;
		let morningMinutes = 0;
		let earliestSunsetHour = 24;
		let earliestSunsetDate = null;

		for (const date of dates) {
			const times = SunCalc.getTimes(date, lat, lng);

			// Handle polar edge cases
			if (!times.sunrise || !times.sunset) continue;
			const srTime = times.sunrise.getTime();
			const ssTime = times.sunset.getTime();
			if (isNaN(srTime) || isNaN(ssTime)) continue;

			// Check for alwaysUp/alwaysDown via solar noon altitude
			// SunCalc returns NaN or same time for polar cases
			if (srTime === ssTime) continue;

			const daylightMin = (ssTime - srTime) / 60000;
			if (daylightMin <= 0 || daylightMin > 1440) continue;

			totalMinutes += daylightMin;

			// Convert to local time
			const sunriseLocal = toLocalHours(times.sunrise, formatter);
			let sunsetLocal = toLocalHours(times.sunset, formatter);

			// If sunset crosses midnight (far-north summer), adjust to 24+ hours
			if (sunsetLocal < sunriseLocal) {
				sunsetLocal += 24;
			}

			// Evening: daylight after 17:00 local
			if (sunsetLocal > 17) {
				const eveningStart = Math.max(sunriseLocal, 17);
				eveningMinutes += (sunsetLocal - eveningStart) * 60;
			}

			// Morning: daylight before 9:00 local
			if (sunriseLocal < 9) {
				const morningEnd = Math.min(sunsetLocal, 9);
				morningMinutes += (morningEnd - sunriseLocal) * 60;
			}

			// Track earliest sunset (skip midnight-crossing days — those are very late sunsets)
			if (sunsetLocal < 24 && sunsetLocal < earliestSunsetHour) {
				earliestSunsetHour = sunsetLocal;
				earliestSunsetDate = date;
			}
		}

		const totalHours = Math.round(totalMinutes / 60);
		const eveningHours = Math.round(eveningMinutes / 60);
		const morningHours = Math.round(morningMinutes / 60);
		const usableHours = eveningHours + morningHours;
		const eveningShare = usableHours > 0 ? Math.round((eveningHours / usableHours) * 100) / 100 : 0;

		results.push({
			fips,
			name,
			state,
			zone: zoneLabel(tz),
			totalHours,
			eveningHours,
			morningHours,
			eveningShare,
			earliestSunset: earliestSunsetHour < 24 ? formatTime(earliestSunsetHour) : null
		});

		if ((i + 1) % 500 === 0 || i + 1 === total) {
			const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
			console.log(`  ${i + 1}/${total} counties (${elapsed}s)`);
		}
	}

	return results;
}

// ── Run ─────────────────────────────────────────────────────────────────────

async function main() {
	console.log(`Generating county daylight data for ${YEAR}…\n`);

	const csv = await fetchCentroids();
	const counties = parseCentroids(csv);
	console.log(`Parsed ${counties.length} counties.\n`);

	const results = computeCountyDaylight(counties);
	console.log(`\nComputed ${results.length} counties.`);

	// Sort by FIPS for deterministic output
	results.sort((a, b) => a.fips.localeCompare(b.fips));

	mkdirSync('static/data', { recursive: true });
	writeFileSync(OUTPUT_PATH, JSON.stringify(results));
	const sizeKB = (readFileSync(OUTPUT_PATH).length / 1024).toFixed(0);
	console.log(`Wrote ${OUTPUT_PATH} (${sizeKB} KB)`);

	// Spot checks
	console.log('\n── Spot checks ──');
	const indy = results.find((r) => r.fips === '18097');
	if (indy) console.log(`Indianapolis (18097): evening=${indy.eveningHours}h, share=${indy.eveningShare}`);
	const bangor = results.find((r) => r.fips === '23019');
	if (bangor) console.log(`Penobscot/Bangor (23019): evening=${bangor.eveningHours}h, share=${bangor.eveningShare}`);
	const apache = results.find((r) => r.fips === '04001');
	if (apache) console.log(`Apache County AZ (04001): evening=${apache.eveningHours}h, share=${apache.eveningShare}`);
	const maricopa = results.find((r) => r.fips === '04013');
	if (maricopa) console.log(`Maricopa County AZ (04013): evening=${maricopa.eveningHours}h, share=${maricopa.eveningShare}`);
	const yukon = results.find((r) => r.fips === '02290');
	if (yukon) console.log(`Yukon-Koyukuk AK (02290): evening=${yukon.eveningHours}h, total=${yukon.totalHours}h`);
}

main().catch((err) => {
	console.error(err);
	process.exit(1);
});
