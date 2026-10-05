export async function load() {
	// Solar data computed from astral pipeline (solar_series.py)
	// TODO: fetch from S3 once the data pipeline is built
	// Data will live at s3://thetangle-data/sunlight-fall/solar-nyc-2026.json

	return {
		// Verified values from sunlight-fall.md — use as acceptance tests
		defaultCity: {
			name: 'New York',
			lat: 40.71,
			lon: -74.01,
			tz: 'America/New_York'
		},
		defaultBedtime: 1170, // 19:30 in minutes past midnight
		// NYC/2026/19:30 expected outputs
		litEvenings: 143,
		crossingDate: 'August 31',
		returnDate: null // TODO: compute spring return date
	};
}
