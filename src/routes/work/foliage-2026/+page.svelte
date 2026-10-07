<script>
	import Scroller from '$lib/components/Scroller.svelte';
	import OgMeta from '$lib/components/OgMeta.svelte';
	import story from '$lib/stories/foliage-2026.js';

	let { data } = $props();

	let index = $state(0);
	let progress = $state(0);

	const steps = [
		{
			id: 'hook',
			text: 'Every year, sometime in September, it starts. A few maples on a hillside in Maine go first. Then it moves — south, down from elevation, county by county — until all of New England is on fire.'
		},
		{
			id: 'science',
			text: "Leaves don't change because of temperature. They change because of light. As days shorten past a threshold, trees begin withdrawing chlorophyll — the green fades, and the reds and yellows that were always there become visible."
		},
		{
			id: 'pace',
			text: 'Temperature determines the pace. Cold nights below 50°F accelerate the process. A September with many cold nights means an early, intense peak. A warm September pushes it late and mutes the color.'
		},
		{
			id: 'historical',
			text: 'The wave is visible in decades of data. Northern Maine peaks in late September. Connecticut peaks in mid-October. The same pattern, year after year — with variation of roughly one to two weeks depending on the season.'
		},
		{
			id: 'forecast',
			text: "This year's forecast is built from that pattern. Summer temperatures, the 2026 drought index, and the historical relationship between cold nights and peak date — combined into a county-level prediction."
		},
		{
			id: 'calendar',
			text: "When should you go? The forecast below shows predicted peak windows by region — from Northern Maine's late-September peak to Southern New England's slower, later turn."
		}
	];
</script>

<OgMeta
	title="When Will the Leaves Turn?"
	description="A data-driven forecast of peak fall foliage across the Northeast — by county, by week."
	ogImage="/og/foliage-2026.png"
	url="https://thewildplot.com/work/foliage-2026"
/>

<article class="story" style:--story-color={story.color} style:--story-ink={story.ink}>
	<!-- Story header: the story's tile, opened up -->
	<header class="story-header">
		<div class="header-inner">
			<div class="story-tags">
				{#each story.tags as tag}
					<span class="tag">{tag}</span>
				{/each}
			</div>
			<h1 class="story-title">When Will the Leaves Turn?</h1>
			<p class="story-dek">
				A data-driven forecast of peak fall foliage across the Northeast, built from historical
				climate data and the known science of why leaves change color.
			</p>
			<div class="story-byline">
				<span>By Zach Alexander</span>
				<span class="separator">·</span>
				<time>September 2026</time>
			</div>
		</div>
	</header>

	<div class="scroller-gap"></div>

	<!-- Scrollytelling section -->
	<Scroller bind:index bind:progress>
		{#snippet background()}
			<div class="map-container">
				<!-- TODO: Replace with D3 choropleth once data pipeline is built -->
				<svg
					class="map-placeholder"
					viewBox="0 0 800 500"
					aria-label="Northeast foliage forecast map — visualization in progress"
				>
					<rect width="800" height="500" fill="#2D3B2A"></rect>
					<text
						x="400"
						y="230"
						text-anchor="middle"
						fill="#8BAA7A"
						font-size="18"
						font-family="Georgia, serif"
					>
						Northeast Foliage Map
					</text>
					<text
						x="400"
						y="260"
						text-anchor="middle"
						fill="#5A7A50"
						font-size="13"
						font-family="system-ui, sans-serif"
					>
						D3 choropleth · data pipeline in progress
					</text>
					<text
						x="400"
						y="300"
						text-anchor="middle"
						fill="#3A5A30"
						font-size="11"
						font-family="monospace"
					>
						step {index + 1} of {steps.length}
					</text>
				</svg>
			</div>
		{/snippet}

		{#snippet foreground()}
			<div class="cards-rail">
				<div class="cards-spacer"></div>

				{#each steps as step, i}
					<div class="step" aria-hidden={i !== index}>
						<div class="scroll-card" class:active={i === index}>
							<p>{step.text}</p>
						</div>
					</div>
				{/each}

				<div class="cards-spacer"></div>
			</div>
		{/snippet}
	</Scroller>

	<!-- Calendar section -->
	<section class="calendar-section">
		<div class="section-inner">
			<h2>When to go — 2026 peak windows by region</h2>
			<p class="section-note">
				Predicted peak foliage dates based on historical patterns and 2026 summer temperature data.
				Peaks typically last 10–14 days at maximum color.
			</p>

			<div class="region-list" role="table" aria-label="Peak foliage dates by region">
				{#each data.regions as region}
					<div class="region-row" role="row">
						<span class="region-name" role="cell">{region.name}</span>
						<span class="region-dates" role="cell">{region.peakStart} – {region.peakEnd}</span>
					</div>
				{/each}
			</div>
		</div>
	</section>

	<!-- Methodology -->
	<section class="methodology">
		<div class="section-inner">
			<h3>How this forecast was built</h3>
			<p>
				Peak foliage dates are driven primarily by cumulative cold nights (below 50°F) during August
				and September. This model fits a regression between historical cold night counts and
				observed peak dates from the USA National Phenology Network and state foliage trackers (VT,
				NH, ME, NY), then applies it to 2026 temperature data from NOAA.
			</p>
			<p>
				County-level temperature data from the <a
					href="https://prism.oregonstate.edu"
					target="_blank"
					rel="noopener noreferrer">PRISM Climate Group</a
				> (4km gridded daily temperatures). Elevation gradient: approximately one week earlier per 1,000
				feet of elevation gain.
			</p>
		</div>
	</section>
</article>

<style>
	/* ── Story header ─────────────────────────────────── */
	.story-header {
		max-width: var(--max-width);
		margin: 24px auto 0;
		padding: 0 var(--gutter);
	}

	.header-inner {
		min-height: 480px;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: clamp(28px, 5vw, 56px);
		border-radius: var(--radius-tile);
		background: var(--story-color);
		color: var(--story-ink);
	}

	.story-tags {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: auto;
		padding-bottom: 40px;
	}

	.tag {
		font-size: 0.8125rem;
		font-weight: 700;
		letter-spacing: 0.1em;
		text-transform: uppercase;
		padding: 5px 14px;
		border: 2px solid currentColor;
		border-radius: var(--radius-pill);
	}

	.story-title {
		font-size: clamp(2.75rem, 7vw, 6rem);
		line-height: 0.95;
		letter-spacing: -0.035em;
		max-width: 14ch;
		margin-bottom: 20px;
	}

	.story-dek {
		font-size: 1.25rem;
		line-height: 1.45;
		max-width: 36em;
		margin-bottom: 20px;
	}

	.story-byline {
		font-size: 0.9375rem;
		font-weight: 500;
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
	}

	.separator {
		opacity: 0.7;
	}

	.scroller-gap {
		height: 48px;
	}

	/* ── Map background ───────────────────────────────── */
	.map-container {
		width: 100%;
		height: 100%;
		background: #1e2b1c;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 24px;
	}

	.map-placeholder {
		width: 100%;
		max-width: 860px;
		height: auto;
	}

	/* ── Scroll cards ─────────────────────────────────── */
	.cards-rail {
		display: flex;
		flex-direction: column;
		align-items: flex-end;
		padding: 0 48px 0 0;
		pointer-events: none;
	}

	.cards-spacer {
		height: 50vh;
	}

	.step {
		pointer-events: all;
		width: min(380px, 90vw);
		margin-bottom: 60vh;
	}

	.scroll-card {
		background: var(--bg);
		border-radius: var(--radius-tile);
		border-top: 8px solid var(--story-color);
		padding: 28px 32px;
		box-shadow: 0 12px 32px rgba(22, 21, 26, 0.18);
		opacity: 0.35;
		transform: translateY(6px);
		transition:
			opacity 0.35s ease,
			transform 0.35s ease;
	}

	.scroll-card.active {
		opacity: 1;
		transform: translateY(0);
	}

	.scroll-card p {
		font-size: 1.125rem;
		line-height: 1.7;
		color: var(--text);
	}

	/* ── Calendar section ─────────────────────────────── */
	.calendar-section,
	.methodology {
		padding: 80px 24px 0;
	}

	.section-inner {
		max-width: 680px;
		margin: 0 auto;
	}

	.calendar-section h2 {
		font-size: clamp(1.75rem, 4vw, 2.5rem);
		margin-bottom: 12px;
	}

	.section-note {
		font-size: 0.9375rem;
		color: var(--text-muted);
		line-height: 1.6;
		margin-bottom: 36px;
	}

	.region-list {
		border-top: var(--rule);
	}

	.region-row {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 16px 0;
		border-bottom: 1px solid var(--border-soft);
	}

	.region-name {
		font-size: 0.9375rem;
		font-weight: 500;
	}

	.region-dates {
		font-size: 0.875rem;
		color: var(--text-muted);
		font-variant-numeric: tabular-nums;
	}

	/* ── Methodology ──────────────────────────────────── */
	.methodology h3 {
		font-family: var(--font-body);
		font-size: 0.8125rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		margin-bottom: 16px;
	}

	.methodology p {
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--text-muted);
		margin-bottom: 12px;
	}

	.methodology a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* ── Responsive ───────────────────────────────────── */
	@media (max-width: 720px) {
		.header-inner {
			min-height: 400px;
		}

		.cards-rail {
			align-items: center;
			padding: 0 16px;
		}

		.step {
			width: 100%;
			margin-bottom: 40vh;
		}

		.calendar-section,
		.methodology {
			padding: 56px 16px 0;
		}
	}
</style>
