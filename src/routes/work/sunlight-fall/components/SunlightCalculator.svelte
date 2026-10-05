<script>
	import { onMount } from 'svelte';
	import { cities } from '$lib/data/cities.js';

	// ── State ─────────────────────────────────────────────
	let selectedCityId = $state('new-york');
	let bedtimeMinutes = $state(1170); // 19:30 default
	let results = $state(null);

	let city = $derived(cities.find((c) => c.id === selectedCityId) ?? cities[0]);

	// ── Helpers ───────────────────────────────────────────
	function formatBedtime(minutes) {
		const h = Math.floor(minutes / 60);
		const m = minutes % 60;
		const ampm = h >= 12 ? 'pm' : 'am';
		const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
		return `${h12}:${m.toString().padStart(2, '0')} ${ampm}`;
	}

	function formatDate(date) {
		return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric' });
	}

	// ── Core computation (browser-only) ───────────────────
	let SunCalc = $state(null);

	function getLocalMinutes(date, tz) {
		const parts = new Intl.DateTimeFormat('en-US', {
			timeZone: tz,
			hour: 'numeric',
			minute: 'numeric',
			hour12: false,
			hourCycle: 'h23'
		}).formatToParts(date);
		const hour = parseInt(parts.find((p) => p.type === 'hour').value);
		const minute = parseInt(parts.find((p) => p.type === 'minute').value);
		return hour * 60 + minute;
	}

	function computeResults(lat, lon, tz, bedtime) {
		if (!SunCalc) return null;
		const year = 2026;
		let litCount = 0;
		let crossingDate = null;
		let returnDate = null;
		let prevLit = null;

		for (let doy = 0; doy < 365; doy++) {
			const date = new Date(year, 0, 1 + doy);
			const times = SunCalc.getTimes(date, lat, lon);
			const sunset = times.sunset;

			let isLit = false;
			if (sunset && !isNaN(sunset.getTime())) {
				isLit = getLocalMinutes(sunset, tz) > bedtime;
			} else {
				// No sunset (midnight sun) — check sun altitude at bedtime
				const bedtimeUTC = new Date(Date.UTC(year, date.getMonth(), date.getDate()));
				bedtimeUTC.setUTCHours(Math.floor(bedtime / 60), bedtime % 60);
				isLit = SunCalc.getPosition(bedtimeUTC, lat, lon).altitude > 0;
			}

			if (isLit) litCount++;

			if (prevLit !== null) {
				if (prevLit && !isLit && date.getMonth() >= 5 && crossingDate === null) {
					crossingDate = new Date(year, 0, doy); // previous day = last lit evening
				}
				if (!prevLit && isLit && date.getMonth() < 6 && returnDate === null) {
					returnDate = new Date(date);
				}
			}
			prevLit = isLit;
		}

		return { litCount, crossingDate, returnDate };
	}

	$effect(() => {
		results = computeResults(city.lat, city.lon, city.tz, bedtimeMinutes);
	});

	function updateUrl() {
		const url = new URL(window.location.href);
		url.searchParams.set('city', selectedCityId);
		url.searchParams.set('bedtime', bedtimeMinutes);
		window.history.replaceState({}, '', url.toString());
	}

	function handleCityChange(e) {
		selectedCityId = e.target.value;
		updateUrl();
	}

	function handleBedtimeChange(e) {
		bedtimeMinutes = parseInt(e.target.value);
		updateUrl();
	}

	// ── Mount: load SunCalc, restore URL state, compute ──
	onMount(async () => {
		const params = new URLSearchParams(window.location.search);
		const cityParam = params.get('city');
		const bedtimeParam = params.get('bedtime');
		if (cityParam && cities.find((c) => c.id === cityParam)) selectedCityId = cityParam;
		if (bedtimeParam) {
			const parsed = parseInt(bedtimeParam);
			if (parsed >= 900 && parsed <= 1380) bedtimeMinutes = parsed;
		}

		// Setting $state triggers the $effect to recompute
		const mod = await import('suncalc');
		SunCalc = mod.default ?? mod;
	});
</script>

<div class="calculator">
	<div class="controls">
		<div class="control-group">
			<label for="city-select">City</label>
			<select id="city-select" value={selectedCityId} onchange={handleCityChange}>
				{#each cities as c}
					<option value={c.id}>{c.name}</option>
				{/each}
			</select>
		</div>

		<div class="control-group">
			<label for="bedtime-range">Bedtime</label>
			<div class="range-row">
				<input
					id="bedtime-range"
					type="range"
					min="900"
					max="1380"
					step="15"
					value={bedtimeMinutes}
					onchange={handleBedtimeChange}
					oninput={handleBedtimeChange}
				/>
				<span class="bedtime-display">{formatBedtime(bedtimeMinutes)}</span>
			</div>
		</div>
	</div>

	<div class="output" aria-live="polite">
		{#if !results}
			<p class="output-placeholder">Loading…</p>
		{:else if results.litCount === 0}
			<p class="output-main">
				In <strong>{city.name}</strong>, the evenings are already dark at
				<strong>{formatBedtime(bedtimeMinutes)}</strong> all year.
			</p>
		{:else if results.litCount >= 364}
			<p class="output-main">
				In <strong>{city.name}</strong> at <strong>{formatBedtime(bedtimeMinutes)}</strong>, the
				evenings stay lit all year.
			</p>
		{:else}
			<p class="output-main">
				In <strong>{city.name}</strong> at <strong>{formatBedtime(bedtimeMinutes)}</strong>, you get
				<strong>{results.litCount} lit evenings</strong> a year.
			</p>
			<p class="output-sub">
				{#if results.crossingDate}The last one falls on <strong
						>{formatDate(results.crossingDate)}</strong
					>.{/if}
				{#if results.returnDate}&nbsp;They return on <strong
						>{formatDate(results.returnDate)}</strong
					>.{/if}
			</p>
		{/if}
	</div>
</div>

<style>
	.calculator {
		border: 1px solid var(--border);
		border-radius: 6px;
		padding: 32px;
	}

	.controls {
		display: flex;
		flex-direction: column;
		gap: 24px;
		margin-bottom: 32px;
	}

	.control-group {
		display: flex;
		flex-direction: column;
		gap: 8px;
	}

	label {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
	}

	select {
		font-size: 1rem;
		font-family: inherit;
		color: var(--text);
		background: var(--bg);
		border: 1px solid var(--border);
		border-radius: 4px;
		padding: 10px 12px;
		appearance: none;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='12' height='8' viewBox='0 0 12 8'%3E%3Cpath d='M1 1l5 5 5-5' stroke='%23999' stroke-width='1.5' fill='none' stroke-linecap='round'/%3E%3C/svg%3E");
		background-repeat: no-repeat;
		background-position: right 12px center;
		padding-right: 36px;
		cursor: pointer;
	}

	select:focus {
		outline: 2px solid var(--text);
		outline-offset: 2px;
	}

	.range-row {
		display: flex;
		align-items: center;
		gap: 16px;
	}

	input[type='range'] {
		flex: 1;
		accent-color: var(--text);
		cursor: pointer;
	}

	.bedtime-display {
		font-size: 1rem;
		font-variant-numeric: tabular-nums;
		min-width: 5.5ch;
		color: var(--text);
	}

	.output {
		border-top: 1px solid var(--border);
		padding-top: 28px;
	}

	.output-placeholder {
		font-size: 0.9375rem;
		color: var(--text-muted);
	}

	.output-main {
		font-size: 1.0625rem;
		line-height: 1.6;
		color: var(--text);
		margin-bottom: 8px;
	}

	.output-sub {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--text-muted);
	}

	@media (max-width: 600px) {
		.calculator {
			padding: 24px 20px;
		}
	}
</style>
