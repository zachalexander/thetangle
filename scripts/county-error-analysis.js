/**
 * Compute per-county percent error in eveningHours / eveningShare
 * caused by using a single centroid vs the county's geographic extent.
 *
 * For each county, extracts the lat/lon bounding box from the TopoJSON
 * geometry, runs the same SunCalc calculation at all four corners, and
 * reports the max percent deviation from the centroid value.
 *
 * Usage: node scripts/county-error-analysis.js
 */

import { readFileSync, writeFileSync, mkdirSync } from 'fs';
import { find as findTimezone } from 'geo-tz';
import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const SunCalc = require('suncalc');
const topojson = require('topojson-client');

const YEAR = 2026;
const CENTROID_PATH = 'data/raw/CenPop2020_Mean_CO.txt';
const TOPO_PATH = 'static/data/counties-10m.json';
const OUTPUT_PATH = 'static/data/county-error-analysis.json';

// ── Reuse helpers from generate-county-daylight.js ─────────────────────────

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

function toLocalHours(date, formatter) {
	const parts = formatter.formatToParts(date);
	let h = 0, m = 0;
	for (const p of parts) {
		if (p.type === 'hour') h = parseInt(p.value, 10);
		if (p.type === 'minute') m = parseInt(p.value, 10);
	}
	if (h === 24) h = 0;
	return h + m / 60;
}

// ── Extract county bounding boxes from TopoJSON ───────────────────────────

function getCountyBounds(topoPath) {
	const topo = JSON.parse(readFileSync(topoPath, 'utf-8'));
	const counties = topojson.feature(topo, topo.objects.counties);
	const boundsMap = new Map();

	for (const feature of counties.features) {
		const fips = String(feature.id).padStart(5, '0');
		let minLat = Infinity, maxLat = -Infinity;
		let minLng = Infinity, maxLng = -Infinity;

		// Walk all coordinate rings (handles Polygon and MultiPolygon)
		const coords = feature.geometry.coordinates;
		const rings = feature.geometry.type === 'MultiPolygon'
			? coords.flat()  // flatten one level: [[ring, ring], [ring]] → [ring, ring, ring]
			: coords;        // already [ring, ring, ...]

		for (const ring of rings) {
			for (const [lng, lat] of ring) {
				if (lat < minLat) minLat = lat;
				if (lat > maxLat) maxLat = lat;
				if (lng < minLng) minLng = lng;
				if (lng > maxLng) maxLng = lng;
			}
		}

		boundsMap.set(fips, { minLat, maxLat, minLng, maxLng });
	}

	return boundsMap;
}

// ── Parse centroids ───────────────────────────────────────────────────────

function parseCentroids(csvPath) {
	const csv = readFileSync(csvPath, 'utf-8');
	const lines = csv.trim().split('\n');
	const counties = [];
	for (let i = 1; i < lines.length; i++) {
		const cols = lines[i].split(',');
		if (cols.length < 7) continue;
		const fips = cols[0].trim() + cols[1].trim();
		const name = cols[2].trim();
		const state = cols[3].trim();
		const lat = parseFloat(cols[5]);
		const lng = parseFloat(cols[6]);
		if (isNaN(lat) || isNaN(lng)) continue;
		counties.push({ fips, name, state, lat, lng });
	}
	return counties;
}

// ── Compute evening hours at a single lat/lng ─────────────────────────────

function computeEveningAtPoint(lat, lng, dates, tz) {
	const formatter = getFormatter(tz);
	let eveningMinutes = 0;
	let morningMinutes = 0;

	for (const date of dates) {
		const times = SunCalc.getTimes(date, lat, lng);
		if (!times.sunrise || !times.sunset) continue;
		const srTime = times.sunrise.getTime();
		const ssTime = times.sunset.getTime();
		if (isNaN(srTime) || isNaN(ssTime) || srTime === ssTime) continue;

		const daylightMin = (ssTime - srTime) / 60000;
		if (daylightMin <= 0 || daylightMin > 1440) continue;

		const sunriseLocal = toLocalHours(times.sunrise, formatter);
		let sunsetLocal = toLocalHours(times.sunset, formatter);
		if (sunsetLocal < sunriseLocal) sunsetLocal += 24;

		if (sunsetLocal > 17) {
			eveningMinutes += (sunsetLocal - Math.max(sunriseLocal, 17)) * 60;
		}
		if (sunriseLocal < 9) {
			morningMinutes += (Math.min(sunsetLocal, 9) - sunriseLocal) * 60;
		}
	}

	const eveningHours = Math.round(eveningMinutes / 60);
	const morningHours = Math.round(morningMinutes / 60);
	const usable = eveningHours + morningHours;
	const eveningShare = usable > 0 ? Math.round((eveningHours / usable) * 100) / 100 : 0;
	return { eveningHours, morningHours, eveningShare };
}

// ── Main ──────────────────────────────────────────────────────────────────

function main() {
	console.log(`County error analysis for ${YEAR}\n`);

	const counties = parseCentroids(CENTROID_PATH);
	console.log(`${counties.length} centroids loaded.`);

	const boundsMap = getCountyBounds(TOPO_PATH);
	console.log(`${boundsMap.size} county geometries loaded.\n`);

	// Build date array
	const dates = [];
	const start = new Date(YEAR, 0, 1);
	const end = new Date(YEAR + 1, 0, 1);
	for (let d = new Date(start); d < end; d.setDate(d.getDate() + 1)) {
		dates.push(new Date(d));
	}

	const results = [];
	const startTime = Date.now();

	for (let i = 0; i < counties.length; i++) {
		const { fips, name, state, lat, lng } = counties[i];
		const bounds = boundsMap.get(fips);
		if (!bounds) continue;

		// Use centroid's timezone for all corner calculations
		// (corners are in the same county, same timezone)
		const tzResults = findTimezone(lat, lng);
		const tz = tzResults[0];
		if (!tz) continue;

		// Centroid result
		const centroid = computeEveningAtPoint(lat, lng, dates, tz);

		// Four corners
		const corners = [
			{ label: 'NE', lat: bounds.maxLat, lng: bounds.maxLng },
			{ label: 'NW', lat: bounds.maxLat, lng: bounds.minLng },
			{ label: 'SE', lat: bounds.minLat, lng: bounds.maxLng },
			{ label: 'SW', lat: bounds.minLat, lng: bounds.minLng }
		];

		let maxEveningHoursError = 0;
		let maxShareError = 0;

		for (const corner of corners) {
			const c = computeEveningAtPoint(corner.lat, corner.lng, dates, tz);

			const hoursErr = centroid.eveningHours > 0
				? Math.abs(c.eveningHours - centroid.eveningHours) / centroid.eveningHours * 100
				: 0;
			const shareErr = centroid.eveningShare > 0
				? Math.abs(c.eveningShare - centroid.eveningShare) / centroid.eveningShare * 100
				: 0;

			if (hoursErr > maxEveningHoursError) maxEveningHoursError = hoursErr;
			if (shareErr > maxShareError) maxShareError = shareErr;
		}

		const latSpan = +(bounds.maxLat - bounds.minLat).toFixed(3);
		const lngSpan = +(bounds.maxLng - bounds.minLng).toFixed(3);

		results.push({
			fips,
			name,
			state,
			latSpan,
			lngSpan,
			centroidEveningHours: centroid.eveningHours,
			centroidEveningShare: centroid.eveningShare,
			maxEveningHoursErrorPct: +maxEveningHoursError.toFixed(2),
			maxEveningShareErrorPct: +maxShareError.toFixed(2)
		});

		if ((i + 1) % 200 === 0 || i + 1 === counties.length) {
			const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
			console.log(`  ${i + 1}/${counties.length} counties (${elapsed}s)`);
		}
	}

	results.sort((a, b) => b.maxEveningShareErrorPct - a.maxEveningShareErrorPct);

	// Write full results
	mkdirSync('static/data', { recursive: true });
	writeFileSync(OUTPUT_PATH, JSON.stringify(results, null, 2));
	console.log(`\nWrote ${OUTPUT_PATH}`);

	// ── Summary stats ─────────────────────────────────────────────────────
	const shareErrors = results.map(r => r.maxEveningShareErrorPct);
	const hoursErrors = results.map(r => r.maxEveningHoursErrorPct);

	const median = (arr) => {
		const s = [...arr].sort((a, b) => a - b);
		const mid = Math.floor(s.length / 2);
		return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2;
	};
	const p95 = (arr) => {
		const s = [...arr].sort((a, b) => a - b);
		return s[Math.floor(s.length * 0.95)];
	};

	console.log('\n── Evening share error ──');
	console.log(`  Median: ${median(shareErrors).toFixed(2)}%`);
	console.log(`  95th percentile: ${p95(shareErrors).toFixed(2)}%`);
	console.log(`  Max: ${Math.max(...shareErrors).toFixed(2)}%`);

	console.log('\n── Evening hours error ──');
	console.log(`  Median: ${median(hoursErrors).toFixed(2)}%`);
	console.log(`  95th percentile: ${p95(hoursErrors).toFixed(2)}%`);
	console.log(`  Max: ${Math.max(...hoursErrors).toFixed(2)}%`);

	console.log('\n── Top 15 highest evening-share error ──');
	for (const r of results.slice(0, 15)) {
		console.log(
			`  ${r.name}, ${r.state} (${r.fips}): ` +
			`share err ${r.maxEveningShareErrorPct}%, ` +
			`hours err ${r.maxEveningHoursErrorPct}%, ` +
			`lat span ${r.latSpan}°, lng span ${r.lngSpan}°`
		);
	}
}

main();
