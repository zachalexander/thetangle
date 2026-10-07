<script>
	import { onMount } from 'svelte';
	import * as d3 from 'd3';
	import * as topojson from 'topojson-client';

	let { step = 0, index = 0, progress = 0 } = $props();

	let wrapper;
	let svgEl;
	let loading = $state(true);
	let error = $state(null);

	// Continuous 0–1 blend progress across all steps
	const TOTAL_STEPS = 6;
	$effect(() => {
		if (animateBlend) animateBlend((index + progress) / TOTAL_STEPS);
	});

	// East Coast + Appalachian South: OH, KY, TN, AL, MS + all East Coast + SE states
	const NE_FIPS = new Set([1, 9, 10, 12, 13, 21, 23, 24, 25, 28, 33, 34, 36, 37, 39, 42, 44, 45, 47, 50, 51, 54]);
	const RASTER_BOUNDS = { west: -98.0, east: -65.5, north: 50.0, south: 24.5 };

	// Geographic focus per scroll step — [west, south, east, north]
	const STEP_VIEWS = [
		// 0 hook:       Full extent — establishing shot
		{ west: -91, south: 24.5, east: -65.5, north: 50 },
		// 1 science:    Northern Maine — where the color change starts first
		{ west: -71.5, south: 44, east: -66.5, north: 48 },
		// 2 pace:       Appalachian spine — mountains accelerate color
		{ west: -84, south: 34, east: -74, north: 46.5 },
		// 3 historical: Full extent — the wave moving south
		{ west: -91, south: 24.5, east: -65.5, north: 50 },
		// 4 forecast:   Mid-Atlantic — VA, MD, PA, NJ detail
		{ west: -80, south: 36.5, east: -73, north: 42 },
		// 5 calendar:   Southeast — Carolinas, GA, FL (last to peak)
		{ west: -84, south: 24.5, east: -75, north: 36 }
	];

	async function fileExists(url) {
		try {
			const r = await fetch(url, { method: 'HEAD' });
			return r.ok;
		} catch {
			return false;
		}
	}

	function rasterRect(projection) {
		const [x1, y1] = projection([RASTER_BOUNDS.west, RASTER_BOUNDS.north]);
		const [x2, y2] = projection([RASTER_BOUNDS.east, RASTER_BOUNDS.south]);
		return { x: x1, y: y1, w: x2 - x1, h: y2 - y1 };
	}

	// Set by onMount — called by $effect when step changes
	let animateToStep = $state(null);
	let animateBlend = $state(null);

	$effect(() => {
		if (animateToStep) animateToStep(step);
	});

	onMount(async () => {
		try {
			const { width, height } = wrapper.getBoundingClientRect();
			const W = Math.round(width) || 800;
			const H = Math.round(height) || 600;

			const [us, hasRelief, hasSpecies, hasHillshade, hasSummer, hasBare, hasEarly] = await Promise.all([
				d3.json('https://cdn.jsdelivr.net/npm/us-atlas@3/counties-10m.json'),
				fileExists('/maps/ne-relief.png'),
				fileExists('/maps/ne-foliage-species.png'),
				fileExists('/maps/ne-hillshade.png'),
				fileExists('/maps/ne-foliage-summer.png'),
				fileExists('/maps/ne-foliage-bare.png'),
				fileExists('/maps/ne-foliage-early.png'),
			]);

			const allCounties = topojson.feature(us, us.objects.counties);
			const neCounties = {
				type: 'FeatureCollection',
				features: allCounties.features.filter((f) =>
					NE_FIPS.has(Math.floor(parseInt(f.id) / 1000))
				)
			};

			const neStatesGeom = us.objects.states.geometries.filter((g) =>
				NE_FIPS.has(parseInt(g.id))
			);
			const neOutline = topojson.merge(us, neStatesGeom);

			// Base projection fitted to full NE — all STEP_VIEWS use these pixel coords
			const projection = d3
				.geoMercator()
				.fitExtent([[32, 32], [W - 32, H - 32]], neCounties);
			const path = d3.geoPath(projection);
			const rect = rasterRect(projection);

			// Convert geographic bounds → SVG viewBox [x, y, w, h]
			const PAD = 24;
			function viewForBounds(view) {
				const [px0, py0] = projection([view.west, view.north]);
				const [px1, py1] = projection([view.east, view.south]);
				return [px0 - PAD, py0 - PAD, px1 - px0 + 2 * PAD, py1 - py0 + 2 * PAD];
			}

			// Animate SVG viewBox between step regions
			function animateViewBox(targetView, duration = 850) {
				const target = viewForBounds(targetView);
				const currentVB = svgEl.getAttribute('viewBox');
				const current = currentVB ? currentVB.split(' ').map(Number) : target;
				const interp = d3.interpolateArray(current, target);

				d3.select(svgEl)
					.transition()
					.duration(duration)
					.ease(d3.easeCubicInOut)
					.attrTween('viewBox', () => (t) => interp(t).join(' '));
			}

			// ── Draw the map ───────────────────────────────────────
			const svg = d3
				.select(svgEl)
				.attr('viewBox', viewForBounds(STEP_VIEWS[0]).join(' '))
				.attr('preserveAspectRatio', 'xMidYMid meet');

			const defs = svg.append('defs');

			defs.append('clipPath')
				.attr('id', 'ne-outline-clip')
				.append('path')
				.attr('d', path(neOutline));

			// ── Phase 1: Early fall wave — yellows & amber golds ───────────────────────
			// Sweeps first (no lag). Science: carotenoids unmasked within 1-2 weeks of
			// photoperiod trigger; birch/aspen/maple show yellow-gold before peak red.
			// (Archetti et al. 2013; USFS Science of Fall Colors)
			const earlyFilter = defs.append('filter')
				.attr('id', 'wave-early-filter')
				.attr('filterUnits', 'userSpaceOnUse')
				.attr('primitiveUnits', 'userSpaceOnUse')
				.attr('x', rect.x).attr('y', rect.y)
				.attr('width', rect.w).attr('height', rect.h)
				.attr('color-interpolation-filters', 'sRGB');

			earlyFilter.append('feImage')
				.attr('result', 'timing')
				.attr('href', '/maps/ne-foliage-timing.png')
				.attr('x', rect.x).attr('y', rect.y)
				.attr('width', rect.w).attr('height', rect.h)
				.attr('preserveAspectRatio', 'none');

			earlyFilter.append('feGaussianBlur')
				.attr('in', 'timing')
				.attr('stdDeviation', 5)
				.attr('result', 'timing-blurred');

			const earlyMatrix = earlyFilter.append('feColorMatrix')
				.attr('in', 'timing-blurred')
				.attr('type', 'matrix')
				.attr('result', 'mask');

			earlyFilter.append('feColorMatrix')
				.attr('in', 'mask')
				.attr('type', 'matrix')
				.attr('values', '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  200 0 0 0 0')
				.attr('result', 'mask-alpha');

			earlyFilter.append('feComposite')
				.attr('in', 'SourceGraphic')
				.attr('in2', 'mask-alpha')
				.attr('operator', 'in');

			// ── Phase 2: Peak fall wave — full reds, oranges, saturated golds ─────────
			// Lags early wave by 0.15 (≈2 weeks in a 13-week Sep–Nov season).
			// Anthocyanin synthesis requires several cool nights below ~50°F after
			// chlorophyll breakdown begins. (Yuan et al. 2025; Harvard Forest data)
			const waveFilter = defs.append('filter')
				.attr('id', 'wave-filter')
				.attr('filterUnits', 'userSpaceOnUse')
				.attr('primitiveUnits', 'userSpaceOnUse')
				.attr('x', rect.x).attr('y', rect.y)
				.attr('width', rect.w).attr('height', rect.h)
				.attr('color-interpolation-filters', 'sRGB');

			// Load timing raster (grayscale 0=north+high, 1=south+coastal)
			waveFilter.append('feImage')
				.attr('result', 'timing')
				.attr('href', '/maps/ne-foliage-timing.png')
				.attr('x', rect.x).attr('y', rect.y)
				.attr('width', rect.w).attr('height', rect.h)
				.attr('preserveAspectRatio', 'none');

			// Slight blur softens the wavefront edge
			waveFilter.append('feGaussianBlur')
				.attr('in', 'timing')
				.attr('stdDeviation', 4)
				.attr('result', 'timing-blurred');

			// Threshold: R' = large * (t - timing) → positive where timing < t
			// Updated every scroll tick by animateBlend
			const waveMatrix = waveFilter.append('feColorMatrix')
				.attr('in', 'timing-blurred')
				.attr('type', 'matrix')
				.attr('result', 'mask');

			// Move mask brightness into alpha channel for feComposite
			waveFilter.append('feColorMatrix')
				.attr('in', 'mask')
				.attr('type', 'matrix')
				.attr('values', '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  200 0 0 0 0')
				.attr('result', 'mask-alpha');

			// Apply: show fall layer only where mask alpha > 0
			waveFilter.append('feComposite')
				.attr('in', 'SourceGraphic')
				.attr('in2', 'mask-alpha')
				.attr('operator', 'in');

			// ── Phase 3: Bare wave — muted browns as leaves fall ────────────────────────
			// Lags early wave by 0.40 (≈5-6 weeks). Science: peak to 50% leaf fall is
			// 3-4 weeks (Mariën et al. 2019); red maple drops 23 days before red oak
			// (Archetti et al. 2013). Soft threshold (wide blur) mimics staggered species
			// drop times — no hard wave, just a gradual bare-ing from north to south.
			const bareFilter = defs.append('filter')
				.attr('id', 'wave-bare-filter')
				.attr('filterUnits', 'userSpaceOnUse')
				.attr('primitiveUnits', 'userSpaceOnUse')
				.attr('x', rect.x).attr('y', rect.y)
				.attr('width', rect.w).attr('height', rect.h)
				.attr('color-interpolation-filters', 'sRGB');

			bareFilter.append('feImage')
				.attr('result', 'timing')
				.attr('href', '/maps/ne-foliage-timing.png')
				.attr('x', rect.x).attr('y', rect.y)
				.attr('width', rect.w).attr('height', rect.h)
				.attr('preserveAspectRatio', 'none');

			bareFilter.append('feGaussianBlur')
				.attr('in', 'timing')
				.attr('stdDeviation', 14)
				.attr('result', 'timing-blurred');

			const bareMatrix = bareFilter.append('feColorMatrix')
				.attr('in', 'timing-blurred')
				.attr('type', 'matrix')
				.attr('result', 'mask');

			bareFilter.append('feColorMatrix')
				.attr('in', 'mask')
				.attr('type', 'matrix')
				.attr('values', '0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  200 0 0 0 0')
				.attr('result', 'mask-alpha');

			bareFilter.append('feComposite')
				.attr('in', 'SourceGraphic')
				.attr('in2', 'mask-alpha')
				.attr('operator', 'in');

			// Drop shadow filter for the NE outline
			const shadowFilter = defs.append('filter')
				.attr('id', 'ne-shadow')
				.attr('x', '-20%').attr('y', '-20%')
				.attr('width', '140%').attr('height', '140%');
			shadowFilter.append('feDropShadow')
				.attr('dx', 0).attr('dy', 4)
				.attr('stdDeviation', 12)
				.attr('flood-color', 'rgba(0,0,0,0.35)');

			// Background
			svg.append('rect').attr('width', W).attr('height', H).attr('fill', '#F2F0EC');

			// Shadow shape — filled with bg color so feDropShadow has pixels to cast from.
			// Drawn before map layers so the shadow appears outside the outline, map paints over the fill.
			svg.append('path')
				.datum(neOutline)
				.attr('d', path)
				.attr('fill', '#F2F0EC')
				.attr('filter', 'url(#ne-shadow)');

			// Warm land fill — covers non-forested areas (coast, marshes, farmland) so they
			// read as subtle warm land rather than blank cream matching the ocean background
			svg.append('path')
				.datum(neOutline)
				.attr('d', path)
				.attr('fill', '#E2DDD3')
				.attr('stroke', 'none');

			// Summer colors — base layer, always full opacity
			if (hasSummer) {
				svg
					.append('image')
					.attr('href', '/maps/ne-foliage-summer.png')
					.attr('x', rect.x)
					.attr('y', rect.y)
					.attr('width', rect.w)
					.attr('height', rect.h)
					.attr('preserveAspectRatio', 'none')
					.attr('clip-path', 'url(#ne-outline-clip)')
					.style('filter', 'saturate(2.4)');
			}

			// Early fall — yellows/golds, sweeps first. Sits above summer, below peak.
			if (hasEarly) {
				svg
					.append('image')
					.attr('href', '/maps/ne-foliage-early.png')
					.attr('x', rect.x)
					.attr('y', rect.y)
					.attr('width', rect.w)
					.attr('height', rect.h)
					.attr('preserveAspectRatio', 'none')
					.attr('clip-path', 'url(#ne-outline-clip)')
					.attr('filter', 'url(#wave-early-filter)');
			}

			// Peak fall colors — revealed progressively by wave filter (lags early by 0.15)
			let fallLayer = null;
			if (hasSpecies) {
				fallLayer = svg
					.append('image')
					.attr('href', '/maps/ne-foliage-species.png')
					.attr('x', rect.x)
					.attr('y', rect.y)
					.attr('width', rect.w)
					.attr('height', rect.h)
					.attr('preserveAspectRatio', 'none')
					.attr('clip-path', 'url(#ne-outline-clip)')
					.attr('filter', 'url(#wave-filter)');
			}

			// Bare/brown layer — revealed after fall wave by bare wave filter (delayed by 0.4 in t-space)
			let bareLayer = null;
			if (hasBare) {
				bareLayer = svg
					.append('image')
					.attr('href', '/maps/ne-foliage-bare.png')
					.attr('x', rect.x)
					.attr('y', rect.y)
					.attr('width', rect.w)
					.attr('height', rect.h)
					.attr('preserveAspectRatio', 'none')
					.attr('clip-path', 'url(#ne-outline-clip)')
					.attr('filter', 'url(#wave-bare-filter)');
			}

			// Hillshade — RGBA white ridge highlights, elevation-gated
			if (hasHillshade) {
				svg
					.append('image')
					.attr('href', '/maps/ne-hillshade.png')
					.attr('x', rect.x)
					.attr('y', rect.y)
					.attr('width', rect.w)
					.attr('height', rect.h)
					.attr('preserveAspectRatio', 'none')
					.attr('clip-path', 'url(#ne-outline-clip)')
					.style('opacity', 0.9);
			}

			// Cream elevation overlay — very subtle, just takes the edge off flat areas
			if (hasRelief) {
				svg
					.append('image')
					.attr('href', '/maps/ne-relief.png')
					.attr('x', rect.x)
					.attr('y', rect.y)
					.attr('width', rect.w)
					.attr('height', rect.h)
					.attr('preserveAspectRatio', 'none')
					.attr('clip-path', 'url(#ne-outline-clip)')
					.style('opacity', 0.3);
			}

			// State borders
			const stateMesh = topojson.mesh(
				us,
				us.objects.states,
				(a, b) => NE_FIPS.has(parseInt(a.id)) || NE_FIPS.has(parseInt(b.id))
			);
			svg
				.append('path')
				.datum(stateMesh)
				.attr('d', path)
				.attr('fill', 'none')
				.attr('stroke', 'rgba(0,0,0,0.5)')
				.attr('stroke-width', 1)
				.attr('vector-effect', 'non-scaling-stroke');

			// Western fade — gradual cream overlay anchored in SVG user-space
			// Starts at western map edge (~-92°W), fully transparent by ~-76°W
			const [fadeX1] = projection([-91, 38]);
			const [fadeX2] = projection([-86, 38]);
			const fadeGrad = defs.append('linearGradient')
				.attr('id', 'west-fade')
				.attr('gradientUnits', 'userSpaceOnUse')
				.attr('x1', fadeX1).attr('y1', 0)
				.attr('x2', fadeX2).attr('y2', 0);
			fadeGrad.append('stop').attr('offset', '0%').attr('stop-color', '#F2F0EC').attr('stop-opacity', 0.5);
			fadeGrad.append('stop').attr('offset', '50%').attr('stop-color', '#F2F0EC').attr('stop-opacity', 0.2);
			fadeGrad.append('stop').attr('offset', '100%').attr('stop-color', '#F2F0EC').attr('stop-opacity', 0);

			svg.append('rect')
				.attr('x', fadeX1 - 50).attr('y', -500)
				.attr('width', fadeX2 - fadeX1 + 50).attr('height', H + 1000)
				.attr('fill', 'url(#west-fade)')
				.attr('pointer-events', 'none');

			// Outer outline — drawn on top of all layers
			svg.append('path')
				.datum(neOutline)
				.attr('d', path)
				.attr('fill', 'none')
				.attr('stroke', 'rgba(0,0,0,0.75)')
				.attr('stroke-width', 0.5)
				.attr('vector-effect', 'non-scaling-stroke');

			// Legend — forest type colors
			addLegend(svg, W, H);

			// Zoom disabled — map stays at full extent
			animateToStep = (_stepIdx) => {};

			// Three-phase wave animation — Sep 1 → Nov 30 mapped across scroll
			// Timing raster: 0 = north + high elevation (changes first), 1 = south + coastal
			//
			// Phase offsets from science:
			//   Early → Peak:  0.15 lag  ≈ 2 weeks  (carotenoid unmask → anthocyanin peak)
			//   Early → Bare:  0.40 lag  ≈ 5-6 wks  (Mariën 2019: peak→50% drop = 3-4 wks)
			//                                         (red maple drops 23 days before red oak)
			animateBlend = (t) => {
				// Phase 1: Early yellows/golds — sweeps first (no lag)
				const earlyScale = 80;
				const earlyOffset = earlyScale * Math.min(1, Math.max(0, t));
				const earlyRow = `-${earlyScale} 0 0 0 ${earlyOffset}`;
				earlyMatrix.attr('values', `${earlyRow}  ${earlyRow}  ${earlyRow}  ${earlyRow}`);

				// Phase 2: Peak reds/oranges — lags early by 0.15 (≈2 weeks)
				const peakScale = 100;
				const peakOffset = peakScale * Math.min(1, Math.max(0, t - 0.15));
				const peakRow = `-${peakScale} 0 0 0 ${peakOffset}`;
				waveMatrix.attr('values', `${peakRow}  ${peakRow}  ${peakRow}  ${peakRow}`);

				// Phase 3: Bare/brown — lags early by 0.40 (≈5-6 weeks), soft threshold
				// scale=15 creates wide gradient band reflecting staggered species leaf-drop
				const bareScale = 15;
				const bareOffset = bareScale * Math.min(1, Math.max(0, t - 0.40));
				const bareRow = `-${bareScale} 0 0 0 ${bareOffset}`;
				bareMatrix.attr('values', `${bareRow}  ${bareRow}  ${bareRow}  ${bareRow}`);
			};
			// Initialize to t=0 (all hidden)
			animateBlend(0);

			loading = false;
		} catch (e) {
			console.error('FoliageMap:', e);
			error = 'Map failed to load.';
			loading = false;
		}
	});

	function addLegend(svg, W, H) {
		const items = [
			{ color: '#C0161E', label: 'Maple · Beech · Birch' },
			{ color: '#C47620', label: 'Oak · Hickory' },
			{ color: '#D4A814', label: 'Elm · Ash · Aspen' },
			{ color: '#4C6638', label: 'Spruce · Fir · Pine' }
		];

		const SZ = 10;
		const gap = 20;
		const LX = W - 190;
		const LY = H - items.length * gap - 16;

		items.forEach(({ color, label }, i) => {
			const y = LY + i * gap;
			svg
				.append('rect')
				.attr('x', LX)
				.attr('y', y)
				.attr('width', SZ)
				.attr('height', SZ)
				.attr('rx', 2)
				.attr('fill', color);
			svg
				.append('text')
				.attr('x', LX + SZ + 8)
				.attr('y', y + SZ - 1)
				.style('font-size', '11px')
				.style('font-weight', '500')
				.style('font-family', 'system-ui, sans-serif')
				.style('fill', 'rgba(0,0,0,0.75)')
				.style('letter-spacing', '0.02em')
				.text(label);
		});
	}
</script>

<div class="map-wrapper" bind:this={wrapper}>
	{#if error}
		<div class="map-error">{error}</div>
	{:else if loading}
		<div class="map-loading"></div>
	{/if}
	<svg
		bind:this={svgEl}
		class="foliage-map"
		role="img"
		aria-label="Northeast fall foliage species map"
	></svg>
</div>

<style>
	.map-wrapper {
		width: 100%;
		height: 100%;
		background: #f2f0ec;
		position: relative;
		box-shadow: none;
	}

	.foliage-map {
		display: block;
		width: 100%;
		height: 100%;
	}

	.map-loading {
		position: absolute;
		inset: 0;
		background: #f2f0ec;
	}

	.map-error {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 0.875rem;
		color: rgba(255, 255, 255, 0.6);
		font-family: system-ui, sans-serif;
	}
</style>
