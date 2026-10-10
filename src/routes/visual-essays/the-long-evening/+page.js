/**
 * City daylight data — verified via daylight_split.py, spot-checked against USNO (within 1 min).
 * All hours are annual totals for a typical year.
 */
const cities = [
	// Eastern
	{ city: 'Bangor', state: 'ME', lat: 44.8, lng: -68.8, timezone: 'Eastern', totalHours: 4453, eveningHours: 572, morningHours: 1121, eveningShare: 0.41, earliestSunset: '3:53 pm' },
	{ city: 'Indianapolis', state: 'IN', lat: 39.8, lng: -86.2, timezone: 'Eastern', totalHours: 4466, eveningHours: 910, morningHours: 853, eveningShare: 0.59, earliestSunset: '5:19 pm' },
	{ city: 'Boston', state: 'MA', lat: 42.4, lng: -71.1, timezone: 'Eastern', totalHours: 4459, eveningHours: 618, morningHours: 1073, eveningShare: 0.44, earliestSunset: '4:11 pm' },
	{ city: 'Detroit', state: 'MI', lat: 42.3, lng: -83.0, timezone: 'Eastern', totalHours: 4459, eveningHours: 831, morningHours: 872, eveningShare: 0.54, earliestSunset: '5:00 pm' },
	{ city: 'New York', state: 'NY', lat: 40.7, lng: -74.0, timezone: 'Eastern', totalHours: 4463, eveningHours: 685, morningHours: 1001, eveningShare: 0.47, earliestSunset: '4:28 pm' },
	{ city: 'Miami', state: 'FL', lat: 25.8, lng: -80.2, timezone: 'Eastern', totalHours: 4492, eveningHours: 722, morningHours: 953, eveningShare: 0.49, earliestSunset: '5:28 pm' },
	{ city: 'Atlanta', state: 'GA', lat: 33.7, lng: -84.4, timezone: 'Eastern' },
	{ city: 'Charlotte', state: 'NC', lat: 35.2, lng: -80.8, timezone: 'Eastern' },
	{ city: 'Pittsburgh', state: 'PA', lat: 40.4, lng: -80.0, timezone: 'Eastern' },
	// Central
	{ city: 'Chicago', state: 'IL', lat: 41.9, lng: -87.6, timezone: 'Central', totalHours: 4460, eveningHours: 675, morningHours: 979, eveningShare: 0.47, earliestSunset: '4:20 pm' },
	{ city: 'Dallas', state: 'TX', lat: 32.8, lng: -96.8, timezone: 'Central' },
	{ city: 'Houston', state: 'TX', lat: 29.8, lng: -95.4, timezone: 'Central' },
	{ city: 'Minneapolis', state: 'MN', lat: 44.9, lng: -93.3, timezone: 'Central' },
	{ city: 'Nashville', state: 'TN', lat: 36.2, lng: -86.8, timezone: 'Central' },
	{ city: 'New Orleans', state: 'LA', lat: 30.0, lng: -90.1, timezone: 'Central' },
	{ city: 'St. Louis', state: 'MO', lat: 38.6, lng: -90.2, timezone: 'Central' },
	// Mountain
	{ city: 'Denver', state: 'CO', lat: 39.7, lng: -105.0, timezone: 'Mountain', totalHours: 4466, eveningHours: 762, morningHours: 924, eveningShare: 0.51, earliestSunset: '4:36 pm' },
	{ city: 'Phoenix', state: 'AZ', lat: 33.4, lng: -112.1, timezone: 'Mountain (no DST)', totalHours: 4481, eveningHours: 800, morningHours: 935, eveningShare: 0.51, earliestSunset: '5:20 pm' },
	{ city: 'Salt Lake City', state: 'UT', lat: 40.8, lng: -111.9, timezone: 'Mountain' },
	{ city: 'Albuquerque', state: 'NM', lat: 35.1, lng: -106.6, timezone: 'Mountain' },
	{ city: 'Boise', state: 'ID', lat: 43.6, lng: -116.2, timezone: 'Mountain' },
	{ city: 'Las Vegas', state: 'NV', lat: 36.2, lng: -115.1, timezone: 'Pacific' },
	// Pacific
	{ city: 'Los Angeles', state: 'CA', lat: 34.1, lng: -118.2, timezone: 'Pacific', totalHours: 4479, eveningHours: 752, morningHours: 948, eveningShare: 0.50, earliestSunset: '4:43 pm' },
	{ city: 'Seattle', state: 'WA', lat: 47.6, lng: -122.3, timezone: 'Pacific', totalHours: 4446, eveningHours: 697, morningHours: 941, eveningShare: 0.49, earliestSunset: '4:18 pm' },
	{ city: 'San Francisco', state: 'CA', lat: 37.8, lng: -122.4, timezone: 'Pacific' },
	{ city: 'Portland', state: 'OR', lat: 45.5, lng: -122.7, timezone: 'Pacific' },
	{ city: 'San Diego', state: 'CA', lat: 32.7, lng: -117.2, timezone: 'Pacific' },
	{ city: 'Sacramento', state: 'CA', lat: 38.6, lng: -121.5, timezone: 'Pacific' },
	// Other
	{ city: 'Anchorage', state: 'AK', lat: 61.2, lng: -149.9, timezone: 'Alaska', totalHours: 4406, eveningHours: 627, morningHours: 907, eveningShare: 0.48, earliestSunset: '3:41 pm' },
	{ city: 'Honolulu', state: 'HI', lat: 21.3, lng: -157.8, timezone: 'Hawaii', totalHours: 4496, eveningHours: 634, morningHours: 917, eveningShare: 0.48, earliestSunset: '5:48 pm' }
];

const clockRules = {
	'Indianapolis': [
		{ rule: 'Standard time year-round', eveningHours: 771, morningHours: 992, eveningShare: 0.49 },
		{ rule: 'Current rules (DST Mar–Nov)', eveningHours: 910, morningHours: 853, eveningShare: 0.59 },
		{ rule: 'Daylight time year-round', eveningHours: 1046, morningHours: 717, eveningShare: 0.68 }
	],
	'Bangor': [
		{ rule: 'Standard time year-round', eveningHours: 436, morningHours: 1257, eveningShare: 0.32 },
		{ rule: 'Current rules (DST Mar–Nov)', eveningHours: 572, morningHours: 1121, eveningShare: 0.41 },
		{ rule: 'Daylight time year-round', eveningHours: 710, morningHours: 983, eveningShare: 0.51 }
	],
	'Detroit': [
		{ rule: 'Standard time year-round', eveningHours: 694, morningHours: 1009, eveningShare: 0.46 },
		{ rule: 'Current rules (DST Mar–Nov)', eveningHours: 831, morningHours: 872, eveningShare: 0.54 },
		{ rule: 'Daylight time year-round', eveningHours: 966, morningHours: 737, eveningShare: 0.63 }
	]
};

const comparison = {
	cityA: 'Bangor',
	cityB: 'Indianapolis',
	totalDiff: 13,
	eveningDiff: 338,
	eveningPctMore: 59,
	decemberSunsetGap: '1h 26m'
};

/** @type {import('./$types').PageLoad} */
export async function load({ fetch }) {
	const [countyDaylight, countyGeo] = await Promise.all([
		fetch('/data/county-daylight.json').then((r) => r.json()),
		fetch('/data/counties-10m.json').then((r) => r.json())
	]);
	return { cities, clockRules, comparison, countyDaylight, countyGeo };
}
