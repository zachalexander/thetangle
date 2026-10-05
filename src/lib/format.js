/** '2026-09-01' → 'September 2026' (parsed as UTC so it never shifts a month). */
export function formatMonth(isoDate) {
	if (!isoDate) return '';
	const d = new Date(`${isoDate}T00:00:00Z`);
	if (Number.isNaN(d.getTime())) return isoDate;
	return d.toLocaleDateString('en-US', { month: 'long', year: 'numeric', timeZone: 'UTC' });
}
