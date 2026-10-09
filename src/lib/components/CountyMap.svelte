<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as topojson from 'topojson-client';

	let { countyDaylight, countyGeo, active = false } = $props();

	let container = $state();
	let svgEl = $state();
	let tooltip = $state({ visible: false, x: 0, y: 0, county: null });
	let zoomK = $state(1);
	let panX = $state(0);
	let panY = $state(0);
	let isPanning = $state(false);
	let panStart = { x: 0, y: 0, panX: 0, panY: 0 };
	const isZoomed = $derived(zoomK > 1.05);
	let showZoomHint = $state(true);
	let isTouchDevice = $state(false);
	let selectedZone = $state('All');

	// Build FIPS→data lookup + percentile ranks
	const dataByFips = $derived.by(() => {
		const map = new Map();
		const sorted = [...countyDaylight].sort((a, b) => a.eveningShare - b.eveningShare);
		const rankMap = new Map();
		sorted.forEach((d, i) => {
			rankMap.set(d.fips, Math.round((i / (sorted.length - 1)) * 100));
		});
		for (const d of countyDaylight) {
			map.set(d.fips, { ...d, percentile: rankMap.get(d.fips) });
		}
		return map;
	});

	// FIPS → zone lookup (used for filtering + timezone mesh)
	const zoneByFips = $derived.by(() => {
		const map = new Map();
		for (const d of countyDaylight) {
			map.set(d.fips, d.zone);
		}
		return map;
	});

	// Color scale: night → ochre, 6 discrete steps
	const NIGHT = '#23304a';
	const OCHRE = '#d9a441';
	const colorSteps = 6;
	const colorRange = d3.quantize(d3.interpolateRgb(NIGHT, OCHRE), colorSteps);
	const colorScale = d3.scaleQuantize().domain([0.33, 0.65]).range(colorRange);

	// Projection and path — responds to selectedZone for filtering
	const mainZones = ['Eastern', 'Central', 'Mountain', 'Pacific'];
	const mapState = $derived.by(() => {
		if (!countyGeo) return null;

		const showAll = selectedZone === 'All';
		const width = showAll ? 960 : 1200;
		const height = showAll ? 640 : 1400;
		const padding = showAll ? 40 : 16;

		const allCounties = topojson.feature(countyGeo, countyGeo.objects.counties);

		// Filter features when a single zone is selected
		const filteredFeatures = showAll
			? allCounties.features
			: allCounties.features.filter((f) => {
					const fips = String(f.id).padStart(5, '0');
					return zoneByFips.get(fips) === selectedZone;
				});
		const fitCollection = showAll
			? allCounties
			: { type: 'FeatureCollection', features: filteredFeatures };

		// When filtered, find which states contain counties in this zone
		const statesInZone = new Set();
		if (!showAll) {
			for (const f of filteredFeatures) {
				statesInZone.add(String(f.id).padStart(5, '0').slice(0, 2));
			}
		}

		// State mesh: when filtered, only boundaries between states in the zone
		const stateMesh = showAll
			? topojson.mesh(countyGeo, countyGeo.objects.states, (a, b) => a !== b)
			: topojson.mesh(countyGeo, countyGeo.objects.states, (a, b) => {
					const sa = String(a.id).padStart(2, '0');
					const sb = String(b.id).padStart(2, '0');
					return a !== b && statesInZone.has(sa) && statesInZone.has(sb);
				});

		// Nation mesh only used in "All" view
		const nationMesh = showAll
			? topojson.mesh(countyGeo, countyGeo.objects.nation)
			: null;

		const projection = d3.geoAlbersUsa().fitExtent(
			[[padding, padding], [width - padding, height - padding]],
			fitCollection
		);
		const path = d3.geoPath(projection);

		const countyPaths = filteredFeatures.map((f) => {
			const fips = String(f.id).padStart(5, '0');
			const d = dataByFips.get(fips);
			return {
				d: path(f),
				fips,
				fill: d ? colorScale(d.eveningShare) : '#ccc',
				hatched: d && d.errorPct >= 5,
				data: d
			};
		});

		// Timezone boundaries
		// All view: edges between counties in different main timezones
		// Filtered view: merged outline of the entire zone (coastlines + borders + tz edges)
		const tzMesh = showAll
			? topojson.mesh(
				countyGeo,
				countyGeo.objects.counties,
				(a, b) => {
					const za = zoneByFips.get(String(a.id).padStart(5, '0'));
					const zb = zoneByFips.get(String(b.id).padStart(5, '0'));
					return za && zb && za !== zb && mainZones.indexOf(za) !== -1 && mainZones.indexOf(zb) !== -1;
				}
			)
			: null;

		// Merged zone outline for filtered view
		const zoneMerged = showAll
			? null
			: topojson.merge(
				countyGeo,
				countyGeo.objects.counties.geometries.filter((g) => {
					const fips = String(g.id).padStart(5, '0');
					return zoneByFips.get(fips) === selectedZone;
				})
			);

		// Label positions: centered in each zone, snug above northern border, rotated to match border angle
		const tzLabels = [
			{ label: 'Pacific',  x: 210, y: 53,  angle: 12 },
			{ label: 'Mountain', x: 355, y: 75,  angle: 8 },
			{ label: 'Central',  x: 540, y: 95,  angle: 2 },
			{ label: 'Eastern',  x: 762, y: 115, angle: -5 }
		];

		return { counties: allCounties, stateMesh, nationMesh, path, projection, countyPaths, tzMesh, zoneMerged, tzLabels, width, height, showAll };
	});

	let hoveredFips = $state(null);
	let tappedFips = $state(null);
	const activeFips = $derived(isTouchDevice ? tappedFips : hoveredFips);

	function handleCountyEnter(e, countyData) {
		if (isTouchDevice || !countyData?.data) return;
		const rect = container.getBoundingClientRect();
		hoveredFips = countyData.fips;
		tooltip = {
			visible: true,
			x: e.clientX - rect.left,
			y: e.clientY - rect.top,
			county: countyData.data
		};
	}

	function handleCountyMove(e) {
		if (isTouchDevice || !tooltip.visible) return;
		const rect = container.getBoundingClientRect();
		tooltip = {
			...tooltip,
			x: e.clientX - rect.left,
			y: e.clientY - rect.top
		};
	}

	function handleCountyLeave() {
		if (isTouchDevice) return;
		hoveredFips = null;
		tooltip = { ...tooltip, visible: false };
	}

	function handleCountyTouch(e, countyData) {
		if (!countyData?.data) return;
		e.preventDefault();
		// Toggle: tap same county again to dismiss
		if (tappedFips === countyData.fips && tooltip.visible) {
			tappedFips = null;
			tooltip = { ...tooltip, visible: false };
			return;
		}
		tappedFips = countyData.fips;
		tooltip = {
			visible: true,
			x: 0,
			y: 0,
			county: countyData.data
		};
	}

	function handleSvgClick(e) {
		// Dismiss tooltip when tapping SVG background (non-county area) on touch devices
		if (!isTouchDevice) return;
		if (e.target.closest('.counties')) return;
		tappedFips = null;
		tooltip = { ...tooltip, visible: false };
	}

	// Clamp tooltip to container bounds
	const tooltipStyle = $derived.by(() => {
		if (!container) return '';
		const containerRect = container.getBoundingClientRect();
		const cw = containerRect.width;
		const ch = containerRect.height;
		const tipW = 240;
		const tipH = 170;
		let x = tooltip.x + 12;
		let y = tooltip.y - 10;
		if (x + tipW > cw) x = tooltip.x - tipW - 12;
		if (y + tipH > ch) y = ch - tipH;
		if (y < 0) y = 0;
		return `left:${x}px;top:${y}px`;
	});

	// Half-circle gauge data for tooltip
	const gaugeData = $derived.by(() => {
		if (!tooltip.county) return null;
		const cx = 65, cy = 60, r = 42;
		const share = tooltip.county.eveningShare;
		const splitAngle = Math.PI * share;
		const sx = +(cx + r * Math.cos(splitAngle)).toFixed(1);
		const sy = +(cy - r * Math.sin(splitAngle)).toFixed(1);
		const morningArc = `M ${cx - r},${cy} A ${r},${r} 0 0 1 ${sx},${sy}`;
		const eveningArc = `M ${sx},${sy} A ${r},${r} 0 0 1 ${cx + r},${cy}`;
		const pct = Math.round(share * 100);
		return { cx, cy, r, sx, sy, morningArc, eveningArc, pct };
	});

	function handleZoomIn() {
		zoomK = Math.min(8, zoomK * 1.5);
		if (showZoomHint) showZoomHint = false;
	}

	function handleZoomOut() {
		const newK = Math.max(1, zoomK / 1.5);
		zoomK = newK;
		if (newK <= 1.05) { panX = 0; panY = 0; }
		else { clampPan(); }
	}

	function handleReset() {
		zoomK = 1;
		panX = 0;
		panY = 0;
	}

	// Clamp pan so the map doesn't drift off-screen
	function clampPan() {
		if (!mapState) return;
		const maxPan = (zoomK - 1) * Math.max(mapState.width, mapState.height) / 2;
		panX = Math.max(-maxPan, Math.min(maxPan, panX));
		panY = Math.max(-maxPan, Math.min(maxPan, panY));
	}

	// Pan handlers — pointer events work for both mouse and touch
	function handlePanStart(e) {
		if (!isZoomed) return;
		// Only single-finger/left-button drag
		if (e.pointerType === 'touch' && e.isPrimary === false) return;
		isPanning = true;
		panStart = { x: e.clientX, y: e.clientY, panX, panY };
		svgEl?.setPointerCapture(e.pointerId);
		e.preventDefault();
	}

	function handlePanMove(e) {
		if (!isPanning) return;
		if (!svgEl || !mapState) return;
		// Convert pixel delta to SVG units
		const rect = svgEl.getBoundingClientRect();
		const scaleX = mapState.width / rect.width;
		const scaleY = mapState.height / rect.height;
		panX = panStart.panX + (e.clientX - panStart.x) * scaleX / zoomK;
		panY = panStart.panY + (e.clientY - panStart.y) * scaleY / zoomK;
		clampPan();
		e.preventDefault();
	}

	function handlePanEnd(e) {
		if (!isPanning) return;
		isPanning = false;
		svgEl?.releasePointerCapture(e.pointerId);
	}

	// Reset zoom when timezone filter changes
	$effect(() => {
		selectedZone; // track
		zoomK = 1;
		panX = 0;
		panY = 0;
	});

	onMount(() => {
		isTouchDevice = window.matchMedia('(pointer: coarse)').matches;
	});
</script>

<div
	class="county-map"
	bind:this={container}
	role="img"
	aria-label="Choropleth map of the United States showing evening sunlight share by county. Western edges of time zones receive more sunlight after 5 pm."
>
	{#if mapState}
		<!-- Overview toggle -->
		<button
			class="tz-overview-btn"
			class:active={selectedZone === 'All'}
			onclick={() => selectedZone = 'All'}
		>All time zones</button>

		<!-- Narrative prompt -->
		<p class="tz-narrative">Counties on the western edge of each time zone get far more sunlight after 5 pm. Pick a time zone below to explore the data county by county.</p>

		<!-- Timezone filter pills -->
		<div class="tz-filter">
			{#each mainZones as zone}
				<button
					class="tz-filter-btn"
					class:active={selectedZone === zone}
					onclick={() => selectedZone = zone}
				>{zone}</button>
			{/each}
		</div>

		<div class="map-viewport">
			<!-- svelte-ignore a11y_click_events_have_key_events -->
			<svg
				bind:this={svgEl}
				viewBox="0 0 {mapState.width} {mapState.height}"
				class="map-svg"
				class:panning={isPanning}
				class:pannable={isZoomed}
				class:overview={isTouchDevice && mapState.showAll}
				onclick={handleSvgClick}
				onpointerdown={handlePanStart}
				onpointermove={handlePanMove}
				onpointerup={handlePanEnd}
				onpointercancel={handlePanEnd}
			>
				<defs>
					<pattern id="crosshatch" width="6" height="6" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">
						<line x1="0" y1="0" x2="0" y2="6" stroke="var(--paper, #f6f0e2)" stroke-width="1.5" opacity="0.55" />
					</pattern>
				</defs>
				<g class="zoom-group" transform="translate({mapState.width / 2 * (1 - zoomK) + panX * zoomK},{mapState.height / 2 * (1 - zoomK) + panY * zoomK}) scale({zoomK})">
					<g class="counties">
						{#each mapState.countyPaths as cp (cp.fips)}
							<!-- svelte-ignore a11y_no_static_element_interactions -->
							<path
								d={cp.d}
								fill={cp.fill}
								stroke={activeFips === cp.fips ? 'var(--ink)' : 'rgba(34,33,31,0.12)'}
								stroke-width={activeFips === cp.fips ? (mapState.showAll ? 1.5 : 4) : 0.8}
								onmouseenter={(e) => handleCountyEnter(e, cp)}
								onmousemove={handleCountyMove}
								onmouseleave={handleCountyLeave}
								ontouchstart={(e) => { if (!isTouchDevice || !mapState.showAll) handleCountyTouch(e, cp); }}
							/>
							{#if cp.hatched}
								<path
									d={cp.d}
									fill="url(#crosshatch)"
									stroke="none"
									pointer-events="none"
								/>
							{/if}
						{/each}
					</g>

					{#if mapState.showAll}
						<path
							d={mapState.path(mapState.stateMesh)}
							fill="none"
							stroke="var(--ink)"
							stroke-width="0.8"
							stroke-linejoin="round"
						/>

						<path
							d={mapState.path(mapState.nationMesh)}
							fill="none"
							stroke="var(--ink)"
							stroke-width="1.2"
							stroke-linejoin="round"
						/>
					{/if}

					<!-- Timezone boundaries -->
					{#if mapState.tzMesh}
						<path
							d={mapState.path(mapState.tzMesh)}
							fill="none"
							stroke="rgba(246,240,226,0.9)"
							stroke-width="5"
							stroke-linejoin="round"
							stroke-linecap="round"
						/>
						<path
							d={mapState.path(mapState.tzMesh)}
							fill="none"
							stroke="var(--ink)"
							stroke-width="2"
							stroke-linejoin="round"
							stroke-linecap="round"
						/>
					{/if}
					{#if mapState.zoneMerged}
						<path
							d={mapState.path(mapState.zoneMerged)}
							fill="none"
							stroke="var(--ink)"
							stroke-width="3"
							stroke-linejoin="round"
							stroke-linecap="round"
						/>
					{/if}

					</g>

				<!-- Timezone labels — outside zoom group, hidden when filtering to one zone -->
				{#if mapState.showAll}
					<g pointer-events="none">
						{#each mapState.tzLabels as tz}
							<text
								x={tz.x}
								y={tz.y}
								text-anchor="middle"
								transform="rotate({tz.angle},{tz.x},{tz.y})"
								class="tz-label"
							>{tz.label}</text>
						{/each}
					</g>
				{/if}
			</svg>

			<!-- Zoom controls — hidden on mobile overview -->
			{#if !(isTouchDevice && mapState.showAll)}
				<div class="zoom-controls">
					<button class="zoom-btn" onclick={handleZoomIn} aria-label="Zoom in">+</button>
					<button class="zoom-btn" onclick={handleZoomOut} aria-label="Zoom out">&minus;</button>
					{#if isZoomed}
						<button class="zoom-btn reset-btn" onclick={handleReset} aria-label="Reset zoom">Reset</button>
					{/if}
				</div>
			{/if}

			<!-- Zoom hint (desktop only) -->
			{#if showZoomHint && active && !isTouchDevice}
				<div class="zoom-hint">
					<span class="zoom-hint-text">
						Scroll to zoom (Ctrl + wheel) or use +/&minus; buttons
					</span>
				</div>
			{/if}
		</div>

		<!-- Legend -->
		<div class="legend">
			<span class="legend-label">Less evening sunlight</span>
			<div class="legend-bar">
				{#each colorRange as color}
					<div class="legend-swatch" style="background:{color}"></div>
				{/each}
			</div>
			<span class="legend-label">More evening sunlight</span>
		</div>
		<div class="legend-note">Crosshatched counties span a wide area; values may vary across the county.</div>

		<!-- Floating tooltip (desktop only) -->
		{#if !isTouchDevice && tooltip.visible && tooltip.county}
			<div class="tooltip" style={tooltipStyle}>
				<div class="tooltip-header">
					<strong>{tooltip.county.name}, {tooltip.county.state}</strong>
				</div>
				{#if gaugeData}
					<div class="tooltip-gauge-section">
						<span class="tooltip-caption">Sunlight outside work hours</span>
						<svg class="tooltip-gauge" viewBox="0 0 130 74" width="130" height="74" aria-hidden="true">
							<path d={gaugeData.morningArc} fill="none" stroke="#23304a" stroke-width="7" />
							<path d={gaugeData.eveningArc} fill="none" stroke="#d9a441" stroke-width="7" />
							<line x1={gaugeData.cx} y1={gaugeData.cy - gaugeData.r - 5} x2={gaugeData.cx} y2={gaugeData.cy - gaugeData.r + 5} stroke="var(--ink, #22211f)" stroke-width="1" opacity="0.25" />
							<line x1={gaugeData.cx} y1={gaugeData.cy} x2={gaugeData.sx} y2={gaugeData.sy} stroke="var(--ink, #22211f)" stroke-width="1.5" />
							<circle cx={gaugeData.cx} cy={gaugeData.cy} r="2.5" fill="var(--ink, #22211f)" />
							<text x={gaugeData.cx} y="10" text-anchor="middle" class="gauge-pct">{gaugeData.pct}% evening</text>
							<text x="8" y={gaugeData.cy + 12} class="gauge-label">Before 9 am</text>
							<text x="122" y={gaugeData.cy + 12} text-anchor="end" class="gauge-label">After 5 pm</text>
						</svg>
					</div>
				{/if}
				<div class="tooltip-stats">
					<span>{tooltip.county.eveningHours} hrs of sunlight after 5 pm / year</span>
					<span class="tooltip-rank">More evening sun than {tooltip.county.percentile}% of US counties</span>
					{#if tooltip.county.earliestSunset}
						<span class="tooltip-sunset">Earliest sunset: {tooltip.county.earliestSunset}</span>
					{/if}
					{#if tooltip.county.errorPct >= 3}
						<span class="tooltip-sunset">&pm;{tooltip.county.errorPct}% — large county</span>
					{/if}
				</div>
			</div>
		{/if}

		<!-- Bottom info bar (touch devices only) -->
		{#if isTouchDevice && tooltip.visible && tooltip.county}
			<div class="info-bar">
				<div class="info-bar-header">
					<strong>{tooltip.county.name}, {tooltip.county.state}</strong>
				</div>
				{#if gaugeData}
					<div class="info-bar-gauge-row">
						<svg class="info-bar-gauge" viewBox="0 0 130 74" width="100" height="57" aria-hidden="true">
							<path d={gaugeData.morningArc} fill="none" stroke="#23304a" stroke-width="7" />
							<path d={gaugeData.eveningArc} fill="none" stroke="#d9a441" stroke-width="7" />
							<line x1={gaugeData.cx} y1={gaugeData.cy - gaugeData.r - 5} x2={gaugeData.cx} y2={gaugeData.cy - gaugeData.r + 5} stroke="var(--ink, #22211f)" stroke-width="1" opacity="0.25" />
							<line x1={gaugeData.cx} y1={gaugeData.cy} x2={gaugeData.sx} y2={gaugeData.sy} stroke="var(--ink, #22211f)" stroke-width="1.5" />
							<circle cx={gaugeData.cx} cy={gaugeData.cy} r="2.5" fill="var(--ink, #22211f)" />
							<text x={gaugeData.cx} y="10" text-anchor="middle" class="gauge-pct">{gaugeData.pct}% evening</text>
							<text x="8" y={gaugeData.cy + 12} class="gauge-label">Before 9 am</text>
							<text x="122" y={gaugeData.cy + 12} text-anchor="end" class="gauge-label">After 5 pm</text>
						</svg>
						<div class="info-bar-stats">
							<span>{tooltip.county.eveningHours} hrs after 5 pm / year</span>
							<span class="info-bar-muted">More evening sun than {tooltip.county.percentile}% of US counties</span>
							{#if tooltip.county.earliestSunset}
								<span class="info-bar-muted">Earliest sunset: {tooltip.county.earliestSunset}</span>
							{/if}
							{#if tooltip.county.errorPct >= 3}
								<span class="info-bar-muted">&pm;{tooltip.county.errorPct}% — large county</span>
							{/if}
						</div>
					</div>
				{/if}
			</div>
		{/if}
	{/if}
</div>

<style>
	.county-map {
		position: relative;
		width: 100%;
		max-width: 900px;
		touch-action: pan-y;
	}

	.map-viewport {
		position: relative;
	}

	/* Overview button */
	.tz-overview-btn {
		display: block;
		margin: 0 auto 12px;
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		padding: 4px 14px;
		border: 1.5px solid var(--ink, #22211f);
		border-radius: 999px;
		background: transparent;
		color: var(--ink, #22211f);
		cursor: pointer;
		line-height: 1.3;
	}

	.tz-overview-btn:hover {
		background: rgba(34, 33, 31, 0.06);
	}

	.tz-overview-btn.active {
		background: var(--ink, #22211f);
		color: var(--paper, #f6f0e2);
	}

	/* Narrative prompt */
	.tz-narrative {
		text-align: center;
		font-family: var(--font-body);
		font-size: 0.8125rem;
		line-height: 1.5;
		color: var(--text-muted);
		margin: 0 auto 14px;
		max-width: 420px;
	}

	/* Timezone filter pills */
	.tz-filter {
		display: flex;
		flex-wrap: wrap;
		gap: 6px;
		justify-content: center;
		margin-bottom: 14px;
	}

	.tz-filter-btn {
		font-family: var(--font-body);
		font-size: 0.75rem;
		font-weight: 600;
		padding: 4px 12px;
		border: 1.5px solid var(--ink, #22211f);
		border-radius: 999px;
		background: transparent;
		color: var(--ink, #22211f);
		cursor: pointer;
		line-height: 1.3;
	}

	.tz-filter-btn:hover {
		background: rgba(34, 33, 31, 0.06);
	}

	.tz-filter-btn.active {
		background: var(--ink, #22211f);
		color: var(--paper, #f6f0e2);
	}

	.map-svg.overview {
		pointer-events: none;
	}

	.map-svg {
		width: 100%;
		height: auto;
		display: block;
	}

	.map-svg.pannable {
		cursor: grab;
		touch-action: none;
	}

	.map-svg.panning {
		cursor: grabbing;
	}

	.counties path {
		cursor: pointer;
		paint-order: stroke fill;
	}

	.tz-label {
		font-family: var(--font-body);
		font-size: 13px;
		font-weight: 700;
		fill: var(--text-muted, #5f5c55);
		letter-spacing: 0.05em;
		text-transform: uppercase;
	}

	/* Zoom controls — anchored to .map-viewport, not county-map */
	.zoom-controls {
		position: absolute;
		top: 8px;
		right: 8px;
		display: flex;
		flex-direction: column;
		gap: 4px;
		z-index: 5;
	}

	.zoom-btn {
		width: 40px;
		height: 40px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--bg, #fff);
		border: 1.5px solid var(--border, #ddd);
		border-radius: 8px;
		font-family: var(--font-body);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text);
		cursor: pointer;
		pointer-events: auto;
		box-shadow: 0 1px 4px rgba(0,0,0,0.1);
		line-height: 1;
		-webkit-tap-highlight-color: transparent;
	}

	.zoom-btn:hover {
		background: var(--surface, #eee);
	}

	.reset-btn {
		width: auto;
		padding: 0 10px;
		font-size: 0.6875rem;
		font-weight: 600;
	}

	/* Zoom hint */
	.zoom-hint {
		position: absolute;
		bottom: 40px;
		left: 50%;
		transform: translateX(-50%);
		z-index: 5;
		pointer-events: none;
		animation: fadeHint 4s ease forwards;
	}

	.zoom-hint-text {
		display: inline-block;
		background: var(--bg, #fff);
		border: 1px solid var(--border-soft, #ddd);
		border-radius: 999px;
		padding: 6px 14px;
		font-family: var(--font-body);
		font-size: 0.75rem;
		color: var(--text-muted);
		box-shadow: 0 1px 4px rgba(0,0,0,0.08);
		white-space: nowrap;
	}

	.zoom-hint-mobile {
		display: none;
	}

	@media (pointer: coarse) {
		.zoom-hint-desktop {
			display: none;
		}
		.zoom-hint-mobile {
			display: inline;
		}
	}

	@keyframes fadeHint {
		0%, 70% { opacity: 1; }
		100% { opacity: 0; }
	}

	/* Legend */
	.legend {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 8px;
		margin-top: 8px;
	}

	.legend-label {
		font-family: var(--font-body);
		font-size: 0.6875rem;
		color: var(--text-muted);
		white-space: nowrap;
	}

	.legend-bar {
		display: flex;
		gap: 0;
	}

	.legend-swatch {
		width: 24px;
		height: 10px;
	}

	.legend-swatch:first-child {
		border-radius: 2px 0 0 2px;
	}

	.legend-swatch:last-child {
		border-radius: 0 2px 2px 0;
	}

	.legend-note {
		text-align: center;
		font-family: var(--font-body);
		font-size: 0.625rem;
		color: var(--text-muted);
		margin-top: 2px;
	}

	/* Tooltip */
	.tooltip {
		position: absolute;
		pointer-events: none;
		background: var(--bg, #fff);
		border: 1.5px solid var(--border, #ddd);
		border-radius: 8px;
		padding: 0;
		display: flex;
		flex-direction: column;
		font-family: var(--font-body);
		font-size: 0.75rem;
		line-height: 1.4;
		color: var(--text);
		box-shadow: 0 2px 8px rgba(0,0,0,0.12);
		z-index: 10;
		white-space: nowrap;
		overflow: hidden;
	}

	.tooltip-header {
		padding: 8px 12px 6px;
	}

	.tooltip-header strong {
		font-size: 0.8125rem;
	}

	.tooltip-gauge-section {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 2px;
		padding: 4px 12px 6px;
		border-top: 1px solid var(--border-soft, #e8e4da);
		border-bottom: 1px solid var(--border-soft, #e8e4da);
		background: var(--surface-soft, rgba(0,0,0,0.015));
	}

	.tooltip-caption {
		font-size: 0.625rem;
		font-weight: 600;
		letter-spacing: 0.03em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.tooltip-gauge {
		display: block;
	}

	.gauge-label {
		font-family: var(--font-body);
		font-size: 9px;
		fill: var(--text-muted, #5f5c55);
	}

	.gauge-pct {
		font-family: var(--font-body);
		font-size: 11px;
		font-weight: 700;
		fill: var(--ink, #22211f);
	}

	.tooltip-stats {
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding: 6px 12px 8px;
	}

	.tooltip-rank {
		font-style: italic;
		color: var(--text-muted);
	}

	.tooltip-sunset {
		color: var(--text-muted);
	}

	/* Bottom info bar for touch devices */
	.info-bar {
		border-top: 1.5px solid var(--border, #ddd);
		background: var(--bg, #fff);
		font-family: var(--font-body);
		font-size: 0.8125rem;
		line-height: 1.4;
		color: var(--text);
	}

	.info-bar-header {
		padding: 6px 12px 2px;
	}

	.info-bar-header strong {
		font-size: 0.875rem;
	}

	.info-bar-gauge-row {
		display: flex;
		align-items: flex-start;
		gap: 12px;
		padding: 2px 12px 4px;
	}

	.info-bar-gauge {
		flex-shrink: 0;
		display: block;
	}

	.info-bar-stats {
		display: flex;
		flex-direction: column;
		gap: 1px;
		padding-top: 2px;
	}

	.info-bar-muted {
		color: var(--text-muted);
		font-size: 0.75rem;
	}

	@media (max-width: 767px) {
		.county-map {
			max-width: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.county-map :global(*) {
			transition: none !important;
			animation: none !important;
		}
	}
</style>
