export async function load({ fetch }) {
	// TODO: fetch from S3 once the data pipeline is built
	// Pipeline: PRISM temps + USA-NPN foliage dates → cold-nights regression model → county predictions
	// Data will live at s3://thetangle-data/foliage-2026/predictions.json

	return {
		year: 2026,
		predictions: [], // county-level peak date predictions (empty until pipeline built)
		regions: [
			{ id: 'northern-maine', name: 'Northern Maine', peakStart: 'Sep 20', peakEnd: 'Sep 27' },
			{ id: 'white-mountains', name: 'White Mountains', peakStart: 'Sep 27', peakEnd: 'Oct 4' },
			{ id: 'vermont', name: 'Vermont', peakStart: 'Sep 27', peakEnd: 'Oct 4' },
			{ id: 'adirondacks', name: 'Adirondacks', peakStart: 'Oct 4', peakEnd: 'Oct 11' },
			{ id: 'berkshires', name: 'Berkshires', peakStart: 'Oct 11', peakEnd: 'Oct 18' },
			{ id: 'catskills', name: 'Catskills', peakStart: 'Oct 11', peakEnd: 'Oct 18' },
			{ id: 'hudson-valley', name: 'Hudson Valley', peakStart: 'Oct 18', peakEnd: 'Oct 25' },
			{ id: 'southern-ne', name: 'Southern New England', peakStart: 'Oct 18', peakEnd: 'Nov 1' }
		]
	};
}
