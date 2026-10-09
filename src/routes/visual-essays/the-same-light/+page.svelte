<script>
	import OgMeta from '$lib/components/OgMeta.svelte';
	import Scroller from '$lib/components/Scroller.svelte';
	import CountyMap from '$lib/components/CountyMap.svelte';

	let { data } = $props();

	let index = $state(0);
	let progress = $state(0);

	const stepIds = [
		'cold-open', 'hook', 'guess', 'band-one', 'band-two', 'evening',
		'why-timezone', 'why-latitude', 'the-stack', 'clock-rules', 'map-overview', 'map-explore', 'close'
	];

	const cardText = $derived([
		'', // cold-open — no text
		`Bangor, Maine and Indianapolis are both on Eastern time. They spring forward and fall back on the same day. But Indianapolis gets ${data.comparison.eveningPctMore}% more sunlight after 5\u00a0pm — about 340 extra hours a\u00a0year.`,
		'Daylight saving gives everyone an extra hour of evening light in summer. But it can\u2019t fix where you sit inside your time zone. Boston or Detroit — who gets more sun after work?',
		'This is one city\u2019s year of daylight — every day from January to December, sunrise to sunset. Notice the jump in March and November when the clocks change.',
		'Now a second city. The band shifts to a different place on the clock. Daylight saving moves both bands the same way — but it can\u2019t close the gap between them.',
		'Shade everything after 5\u00a0pm. That\u2019s your evening sunlight — hours you could actually spend outside after work. Indianapolis: 910 hours. Bangor: 572. More evening light means more time to exercise, decompress, see people. Less of it is linked to worse sleep and higher rates of seasonal depression.',
		'Indianapolis sits at the western edge of Eastern time. The sun runs behind the clock there — later sunrises, later sunsets. Daylight saving helps, but geography is doing most of the heavy lifting.',
		'Bangor is five degrees further north, which makes the seasonal swing wider — longer summers, shorter winters. In December, both forces stack against it. No clock rule can undo that.',
		'December 9. Bangor: sunset at 3:53\u00a0pm. Indianapolis: 5:19\u00a0pm. An hour and a half apart. Same time zone, same clock change, same rules — different geography.',
		'Every year, people argue about making daylight saving permanent. Sleep researchers say no — morning light sets your circadian clock, and late sunrises cause real harm. But the debate assumes the effect is the same everywhere. It isn\u2019t. Indianapolis already has late sunrises. Permanent DST would push its December sunrise past 9\u00a0am. Bangor\u2019s problem is the opposite — it\u2019s dark by 4\u00a0pm no matter what.',
		'Here\u2019s the whole country. Evening sunlight by county — you can see the time-zone lines cut right through it. The pattern has nothing to do with the clock. Arizona, as always, opts out entirely.',
		'', // map-explore — no card, interactive
		'None of this changes from year to year. The tilt is the same. The orbit is the same. Daylight saving shifts the clock, but it can\u2019t move the sun. The right answer to the clock debate depends on where you are — and that\u2019s the part no one talks about.'
	]);
</script>

<OgMeta
	title="The Same Light"
	description="Every spring we change the clocks to save daylight. But how much evening sun you actually get depends far more on where you live than what the clock says."
	url="https://thewildplot.com/visual-essays/the-same-light"
/>

<main class="story" style="--story-color: #23304a; --story-ink: #f6f0e2; --story-ochre: #d9a441;">
	<!-- Header -->
	<header class="story-header">
		<div class="header-inner">
			<p class="eyebrow">Daylight &middot; Time Zones</p>
			<h1>The Same Light</h1>
			<p class="dek">
				Every spring we change the clocks to save daylight.
				But how much evening sun you actually get depends far more on where you live than what the clock says.
			</p>
			<p class="byline">By Zach Alexander</p>
		</div>
	</header>

	<!-- Cold open -->
	<section class="cold-open">
		<div class="speech-bubble">
			{#each ['Hey', 'Juno,', 'where', 'are', 'you', 'right', 'now?'] as word, i}
				<span class="speech-word" style="animation-delay: {0.3 + i * 0.15}s">{word}</span>{' '}
			{/each}
			<svg class="speech-tail" width="24" height="18" viewBox="0 -2 24 20" fill="none" overflow="hidden">
				<path d="M0 -2 L0 0 C16 8, 14 14, 10 18 C16 12, 20 6, 24 0 L24 -2 Z" fill="var(--bg, #fffdf8)" stroke="none"/>
				<path d="M0 0 C16 8, 14 14, 10 18 C16 12, 20 6, 24 0" fill="none" stroke="var(--ink)" stroke-width="2" stroke-linecap="butt"/>
			</svg>
		</div>
		<!-- svelte-ignore a11y_media_has_caption -->
		<video
			class="cold-open-video"
			src="/video/cold-open.mp4"
			autoplay
			loop
			muted
			playsinline
		></video>
	</section>

	<!-- Scrollytelling -->
	<Scroller bind:index bind:progress>
		{#snippet background()}
			<div class="viz-container">
				<!-- 1: hook — two big numbers -->
				<div class="viz-panel" class:active={index === 1}>
					<div class="big-numbers">
						<div class="big-number-card">
							<span class="big-number-label">Bangor, ME</span>
							<span class="big-number">4,453</span>
							<span class="big-number-unit">hours/year</span>
						</div>
						<div class="big-number-divider">=</div>
						<div class="big-number-card">
							<span class="big-number-label">Indianapolis, IN</span>
							<span class="big-number">4,466</span>
							<span class="big-number-unit">hours/year</span>
						</div>
					</div>
					<p class="viz-stat">But Indianapolis gets <strong>59% more</strong> sunlight after 5&nbsp;pm</p>
				</div>

				<!-- 2: guess — two buttons -->
				<div class="viz-panel" class:active={index === 2}>
					<div class="guess-prompt">
						<p class="viz-caption">Who gets more sunlight after 5&nbsp;pm?</p>
						<div class="guess-buttons">
							<div class="guess-btn">Boston</div>
							<div class="guess-btn">Detroit</div>
						</div>
					</div>
				</div>

				<!-- 3: band-one — single daylight band -->
				<div class="viz-panel" class:active={index === 3}>
					<svg viewBox="0 0 480 320" class="viz-svg">
						<text x="240" y="24" text-anchor="middle" class="viz-title">Indianapolis</text>
						<!-- Y axis: clock hours -->
						<text x="28" y="68" text-anchor="end" class="viz-tick">6 am</text>
						<text x="28" y="128" text-anchor="end" class="viz-tick">9 am</text>
						<text x="28" y="188" text-anchor="end" class="viz-tick">5 pm</text>
						<text x="28" y="248" text-anchor="end" class="viz-tick">8 pm</text>
						<!-- X axis: months -->
						<text x="55" y="280" text-anchor="middle" class="viz-tick">Jan</text>
						<text x="165" y="280" text-anchor="middle" class="viz-tick">Apr</text>
						<text x="270" y="280" text-anchor="middle" class="viz-tick">Jul</text>
						<text x="380" y="280" text-anchor="middle" class="viz-tick">Oct</text>
						<text x="455" y="280" text-anchor="middle" class="viz-tick">Dec</text>
						<!-- Grid -->
						<line x1="36" y1="60" x2="464" y2="60" stroke="var(--border-soft)" stroke-width="1"/>
						<line x1="36" y1="120" x2="464" y2="120" stroke="var(--border-soft)" stroke-width="1"/>
						<line x1="36" y1="180" x2="464" y2="180" stroke="var(--border-soft)" stroke-width="1"/>
						<line x1="36" y1="240" x2="464" y2="240" stroke="var(--border-soft)" stroke-width="1"/>
						<!-- Daylight band (stylized sunrise-sunset shape) -->
						<path
							d="M55,145 C110,155 140,160 165,158 C210,150 250,130 270,115 C310,95 340,90 380,95 C410,105 440,130 455,145
							   L455,200
							   C440,220 410,235 380,240 C340,245 310,240 270,230 C250,225 210,210 165,205 C140,200 110,195 55,200 Z"
							fill="var(--ochre)" opacity="0.3" stroke="var(--ink)" stroke-width="2"
						/>
						<!-- Sunrise curve (top of band) -->
						<path
							d="M55,145 C110,155 140,160 165,158 C210,150 250,130 270,115 C310,95 340,90 380,95 C410,105 440,130 455,145"
							fill="none" stroke="var(--ink)" stroke-width="2"
						/>
						<!-- Sunset curve (bottom of band) -->
						<path
							d="M55,200 C110,195 140,200 165,205 C210,210 250,225 270,230 C310,240 340,245 380,240 C410,235 440,220 455,200"
							fill="none" stroke="var(--ink)" stroke-width="2"
						/>
					</svg>
				</div>

				<!-- 4: band-two — two daylight bands -->
				<div class="viz-panel" class:active={index === 4}>
					<svg viewBox="0 0 480 320" class="viz-svg">
						<!-- Axis labels -->
						<text x="28" y="68" text-anchor="end" class="viz-tick">6 am</text>
						<text x="28" y="188" text-anchor="end" class="viz-tick">5 pm</text>
						<text x="28" y="248" text-anchor="end" class="viz-tick">8 pm</text>
						<text x="55" y="280" text-anchor="middle" class="viz-tick">Jan</text>
						<text x="270" y="280" text-anchor="middle" class="viz-tick">Jul</text>
						<text x="455" y="280" text-anchor="middle" class="viz-tick">Dec</text>
						<line x1="36" y1="60" x2="464" y2="60" stroke="var(--border-soft)" stroke-width="1"/>
						<line x1="36" y1="180" x2="464" y2="180" stroke="var(--border-soft)" stroke-width="1"/>
						<line x1="36" y1="240" x2="464" y2="240" stroke="var(--border-soft)" stroke-width="1"/>
						<!-- Indianapolis band (wider, shifted later) -->
						<path
							d="M55,145 C165,158 270,115 380,95 C440,105 455,145 455,145
							   L455,200 C440,220 380,240 270,230 C165,205 55,200 55,200 Z"
							fill="var(--ochre)" opacity="0.2" stroke="var(--ochre)" stroke-width="2"
						/>
						<!-- Bangor band (narrower winter, wider summer swing, shifted earlier) -->
						<path
							d="M55,130 C165,148 270,80 380,70 C440,90 455,130 455,130
							   L455,185 C440,210 380,250 270,240 C165,215 55,195 55,195 Z"
							fill="var(--night)" opacity="0.15" stroke="var(--night)" stroke-width="2"
						/>
						<!-- Labels -->
						<text x="400" y="112" class="viz-band-label" fill="var(--ochre)">Indianapolis</text>
						<text x="400" y="82" class="viz-band-label" fill="var(--night)">Bangor</text>
					</svg>
				</div>

				<!-- 5: evening — shading after 5pm + counters -->
				<div class="viz-panel" class:active={index === 5}>
					<svg viewBox="0 0 480 320" class="viz-svg">
						<text x="28" y="188" text-anchor="end" class="viz-tick">5 pm</text>
						<line x1="36" y1="180" x2="464" y2="180" stroke="var(--ink)" stroke-width="1" stroke-dasharray="4,4"/>
						<!-- Indianapolis band -->
						<path
							d="M55,145 C165,158 270,115 380,95 C440,105 455,145 455,145
							   L455,200 C440,220 380,240 270,230 C165,205 55,200 55,200 Z"
							fill="var(--ochre)" opacity="0.15" stroke="var(--ochre)" stroke-width="2"
						/>
						<!-- Indianapolis evening fill (below 5pm line) -->
						<path
							d="M55,200 C165,205 270,230 380,240 C440,220 455,200 455,200
							   L455,180 L55,180 Z"
							fill="var(--ochre)" opacity="0.5"
						/>
						<!-- Bangor band -->
						<path
							d="M55,130 C165,148 270,80 380,70 C440,90 455,130 455,130
							   L455,185 C440,210 380,250 270,240 C165,215 55,195 55,195 Z"
							fill="var(--night)" opacity="0.1" stroke="var(--night)" stroke-width="2"
						/>
						<!-- Bangor evening fill (below 5pm, smaller) -->
						<path
							d="M130,195 C200,205 270,230 380,245 C420,220 440,200 455,185
							   L455,180 L130,180 Z"
							fill="var(--night)" opacity="0.4"
						/>
						<!-- Counters -->
						<text x="140" y="40" text-anchor="middle" class="viz-counter" fill="var(--night)">572 hrs</text>
						<text x="140" y="56" text-anchor="middle" class="viz-counter-label">Bangor evening</text>
						<text x="360" y="40" text-anchor="middle" class="viz-counter" fill="var(--ochre)">910 hrs</text>
						<text x="360" y="56" text-anchor="middle" class="viz-counter-label">Indianapolis evening</text>
					</svg>
				</div>

				<!-- 6: why-timezone — US map with timezone lines -->
				<div class="viz-panel" class:active={index === 6}>
					<svg viewBox="0 0 480 320" class="viz-svg">
						<text x="240" y="24" text-anchor="middle" class="viz-title">Time Zone Boundaries</text>
						<!-- Simplified US outline -->
						<path
							d="M40,100 L100,80 L180,85 L240,70 L300,75 L360,90 L420,85 L450,100
							   L455,140 L440,180 L420,200 L380,220 L340,230 L300,225 L260,235
							   L220,240 L180,235 L140,230 L100,220 L60,200 L45,160 Z"
							fill="var(--surface)" stroke="var(--ink)" stroke-width="2"
						/>
						<!-- Timezone lines -->
						<line x1="350" y1="70" x2="360" y2="240" stroke="var(--ink)" stroke-width="2" stroke-dasharray="6,4"/>
						<line x1="260" y1="65" x2="250" y2="240" stroke="var(--ink)" stroke-width="2" stroke-dasharray="6,4"/>
						<line x1="160" y1="80" x2="150" y2="240" stroke="var(--ink)" stroke-width="2" stroke-dasharray="6,4"/>
						<!-- Zone labels -->
						<text x="100" y="270" text-anchor="middle" class="viz-tick">Pacific</text>
						<text x="205" y="270" text-anchor="middle" class="viz-tick">Mountain</text>
						<text x="310" y="270" text-anchor="middle" class="viz-tick">Central</text>
						<text x="410" y="270" text-anchor="middle" class="viz-tick">Eastern</text>
						<!-- City dots -->
						<circle cx="430" cy="130" r="5" fill="var(--night)"/>
						<text x="430" y="120" text-anchor="middle" class="viz-dot-label">Bangor</text>
						<circle cx="370" cy="170" r="5" fill="var(--ochre)"/>
						<text x="370" y="160" text-anchor="middle" class="viz-dot-label">Indy</text>
					</svg>
				</div>

				<!-- 7: why-latitude — two arcs -->
				<div class="viz-panel" class:active={index === 7}>
					<svg viewBox="0 0 480 320" class="viz-svg">
						<text x="240" y="24" text-anchor="middle" class="viz-title">Latitude &amp; Daylight Swing</text>
						<!-- Axes -->
						<line x1="50" y1="260" x2="450" y2="260" stroke="var(--ink)" stroke-width="2"/>
						<line x1="50" y1="60" x2="50" y2="260" stroke="var(--ink)" stroke-width="2"/>
						<text x="50" y="280" text-anchor="middle" class="viz-tick">Jan</text>
						<text x="250" y="280" text-anchor="middle" class="viz-tick">Jul</text>
						<text x="450" y="280" text-anchor="middle" class="viz-tick">Dec</text>
						<text x="20" y="70" text-anchor="middle" class="viz-tick">16h</text>
						<text x="20" y="160" text-anchor="middle" class="viz-tick">12h</text>
						<text x="20" y="250" text-anchor="middle" class="viz-tick">8h</text>
						<!-- 12h baseline -->
						<line x1="50" y1="160" x2="450" y2="160" stroke="var(--border-soft)" stroke-width="1" stroke-dasharray="4,4"/>
						<!-- Bangor arc (bigger swing — 44.8°N) -->
						<path
							d="M50,220 C130,240 200,100 250,75 C300,100 370,240 450,220"
							fill="none" stroke="var(--night)" stroke-width="3"
						/>
						<!-- Indianapolis arc (smaller swing — 39.8°N) -->
						<path
							d="M50,200 C130,215 200,115 250,100 C300,115 370,215 450,200"
							fill="none" stroke="var(--ochre)" stroke-width="3"
						/>
						<text x="290" y="80" class="viz-band-label" fill="var(--night)">Bangor 44.8°N</text>
						<text x="290" y="105" class="viz-band-label" fill="var(--ochre)">Indianapolis 39.8°N</text>
					</svg>
				</div>

				<!-- 8: the-stack — December zoom -->
				<div class="viz-panel" class:active={index === 8}>
					<svg viewBox="0 0 480 320" class="viz-svg">
						<text x="240" y="24" text-anchor="middle" class="viz-title">December 9</text>
						<!-- Two vertical day bars -->
						<!-- Bangor -->
						<rect x="100" y="70" width="80" height="140" rx="4" fill="var(--night)" opacity="0.2" stroke="var(--night)" stroke-width="2"/>
						<text x="140" y="55" text-anchor="middle" class="viz-band-label" fill="var(--night)">Bangor</text>
						<text x="140" y="230" text-anchor="middle" class="viz-tick">Sunset</text>
						<text x="140" y="248" text-anchor="middle" class="viz-counter" fill="var(--night)">3:53 pm</text>
						<!-- Indianapolis -->
						<rect x="300" y="90" width="80" height="150" rx="4" fill="var(--ochre)" opacity="0.2" stroke="var(--ochre)" stroke-width="2"/>
						<text x="340" y="75" text-anchor="middle" class="viz-band-label" fill="var(--ochre)">Indianapolis</text>
						<text x="340" y="260" text-anchor="middle" class="viz-tick">Sunset</text>
						<text x="340" y="278" text-anchor="middle" class="viz-counter" fill="var(--ochre)">5:19 pm</text>
						<!-- Gap annotation -->
						<line x1="180" y1="210" x2="300" y2="240" stroke="var(--ink)" stroke-width="1" stroke-dasharray="4,3"/>
						<text x="240" y="298" text-anchor="middle" class="viz-stat-label">1h 26m apart — same time zone</text>
					</svg>
				</div>

				<!-- 9: clock-rules — three band positions -->
				<div class="viz-panel" class:active={index === 9}>
					<svg viewBox="0 0 480 340" class="viz-svg">
						<text x="240" y="24" text-anchor="middle" class="viz-title">Indianapolis — Three Clock Rules</text>
						<!-- Standard -->
						<text x="50" y="75" class="viz-tick" text-anchor="start">Standard</text>
						<rect x="140" y="60" width="280" height="30" rx="4" fill="var(--ochre)" opacity="0.25" stroke="var(--ink)" stroke-width="1.5"/>
						<text x="435" y="80" class="viz-tick" text-anchor="start">49%</text>
						<!-- Current -->
						<text x="50" y="145" class="viz-tick" text-anchor="start">Current</text>
						<rect x="170" y="130" width="280" height="30" rx="4" fill="var(--ochre)" opacity="0.4" stroke="var(--ink)" stroke-width="2"/>
						<text x="435" y="150" class="viz-tick" font-weight="700" text-anchor="start">59%</text>
						<!-- Permanent DST -->
						<text x="50" y="215" class="viz-tick" text-anchor="start">Perm. DST</text>
						<rect x="200" y="200" width="280" height="30" rx="4" fill="var(--ochre)" opacity="0.25" stroke="var(--ink)" stroke-width="1.5"/>
						<text x="435" y="220" class="viz-tick" text-anchor="start">68%</text>
						<!-- Clock axis -->
						<line x1="140" y1="250" x2="450" y2="250" stroke="var(--ink)" stroke-width="1"/>
						<text x="140" y="270" text-anchor="middle" class="viz-tick">6 am</text>
						<text x="295" y="270" text-anchor="middle" class="viz-tick">noon</text>
						<text x="450" y="270" text-anchor="middle" class="viz-tick">8 pm</text>
						<!-- 5pm line -->
						<line x1="400" y1="50" x2="400" y2="250" stroke="var(--ink)" stroke-width="1" stroke-dasharray="4,4"/>
						<text x="400" y="290" text-anchor="middle" class="viz-tick">5 pm</text>
						<text x="240" y="325" text-anchor="middle" class="viz-caption">% = evening share of total daylight</text>
					</svg>
				</div>

				<!-- 10: map overview — full US choropleth -->
				<div class="viz-panel" class:active={index === 10}>
					<CountyMap
						countyDaylight={data.countyDaylight}
						countyGeo={data.countyGeo}
						cities={data.cities}
						active={index === 10}
						mode="overview"
					/>
				</div>

				<!-- 11: map explore — interactive timezone filter -->
				<div class="viz-panel" class:active={index === 11}>
					<CountyMap
						countyDaylight={data.countyDaylight}
						countyGeo={data.countyGeo}
						cities={data.cities}
						active={index === 11}
						mode="explore"
					/>
				</div>

				<!-- 12: close — two windows revisited, both lit -->
				<div class="viz-panel" class:active={index === 12}>
					<svg viewBox="0 0 480 320" class="viz-svg">
						<!-- Left window (lit warmly) -->
						<rect x="60" y="60" width="140" height="180" rx="4" fill="none" stroke="var(--ink)" stroke-width="2"/>
						<line x1="130" y1="60" x2="130" y2="240" stroke="var(--ink)" stroke-width="2"/>
						<line x1="60" y1="150" x2="200" y2="150" stroke="var(--ink)" stroke-width="2"/>
						<rect x="62" y="62" width="136" height="176" rx="2" fill="var(--ochre)" opacity="0.25"/>
						<!-- Right window (lit warmly) -->
						<rect x="280" y="60" width="140" height="180" rx="4" fill="none" stroke="var(--ink)" stroke-width="2"/>
						<line x1="350" y1="60" x2="350" y2="240" stroke="var(--ink)" stroke-width="2"/>
						<line x1="280" y1="150" x2="420" y2="150" stroke="var(--ink)" stroke-width="2"/>
						<rect x="282" y="62" width="136" height="176" rx="2" fill="var(--ochre)" opacity="0.25"/>
						<text x="240" y="290" text-anchor="middle" class="viz-caption">The same light.</text>
					</svg>
				</div>
			</div>
		{/snippet}

		{#snippet foreground()}
			<div class="cards-spacer"></div>
			{#each cardText as text, i}
				<div class="step" class:active={index === i} data-step={stepIds[i]}>
					{#if text}
						<div class="scroll-card">
							<p>{text}</p>
						</div>
					{/if}
				</div>
			{/each}
			<div class="cards-spacer"></div>
		{/snippet}
	</Scroller>

	<!-- Calculator placeholder -->
	<section class="calculator-section">
		<div class="section-inner">
			<h2>Find Your Evening Sunlight</h2>
			<p class="section-dek">Pick a city and an evening threshold to see how your daylight splits.</p>
			<div class="calculator-placeholder">
				<span class="viz-label">Interactive calculator: city selector + evening threshold slider</span>
			</div>
		</div>
	</section>

	<!-- Sources -->
	<section class="sources-section">
		<div class="section-inner">
			<h2>Sources &amp; Notes</h2>
			<ul>
				<li>
					Sunrise/sunset data calculated with
					<a href="https://github.com/mourner/suncalc" target="_blank" rel="noopener">SunCalc</a>,
					verified against the
					<a href="https://aa.usno.navy.mil/data/RS_OneYear" target="_blank" rel="noopener">U.S. Naval Observatory</a>
					tables (within 1 minute).
				</li>
				<li>
					"Evening hours" = hours of sunlight (sunrise to sunset) after 5:00 pm local clock time.
					"Morning hours" = daylight hours before 9:00 am.
				</li>
				<li>
					Total daylight varies slightly by latitude due to atmospheric refraction.
					The difference between Miami and Anchorage is about 90 hours/year (~2%).
				</li>
				<li>
					Clock-rule scenarios use the city's current longitude and latitude with
					standard time year-round, current DST rules (spring-forward Mar, fall-back Nov),
					and permanent daylight time.
				</li>
			</ul>
		</div>
	</section>
</main>

<style>
	/* Story-level tokens */
	.story {
		--night: #23304a;
		--ochre: #d9a441;
		--paper: #f6f0e2;
		--ink: #22211f;
	}

	/* Header */
	.story-header {
		padding: 80px var(--gutter, 16px) 48px;
		text-align: center;
	}

	.header-inner {
		max-width: 680px;
		margin: 0 auto;
	}

	.story-header .eyebrow {
		color: var(--text-muted);
		margin-bottom: 16px;
	}

	.story-header h1 {
		font-size: clamp(2.5rem, 6vw, 4rem);
		margin-bottom: 20px;
		color: var(--night);
	}

	.dek {
		font-size: 1.25rem;
		line-height: 1.5;
		color: var(--text-muted);
		max-width: 540px;
		margin: 0 auto 16px;
	}

	.byline {
		font-size: 0.875rem;
		color: var(--text-light);
	}

	/* Viz container (sticky background) */
	.viz-container {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		position: relative;
	}

	.viz-panel {
		position: absolute;
		inset: 0;
		display: flex;
		align-items: center;
		justify-content: center;
		flex-direction: column;
		padding: 4px 0;
		opacity: 0;
		pointer-events: none;
		transition: opacity 0.4s ease;
	}

	.viz-panel.active {
		opacity: 1;
		pointer-events: auto;
	}

	.viz-svg {
		width: 100%;
		max-width: 520px;
		height: auto;
	}

	.cold-open {
		display: flex;
		flex-direction: column;
		align-items: center;
		padding: 48px var(--gutter, 16px) 0;
	}

	.cold-open-video {
		width: 100%;
		max-width: 640px;
		height: auto;
		border-radius: var(--radius-tile, 8px);
		background: var(--bg, #fffdf8);
	}

	.speech-bubble {
		position: relative;
		background: var(--bg, #fffdf8);
		border: 2px solid var(--ink);
		border-radius: 12px;
		padding: 6px 12px;
		margin-top: -16px;
		margin-bottom: -16px;
		align-self: flex-start;
		margin-left: 6%;
		z-index: 1;
		font-family: var(--font-body);
		font-size: 0.85rem;
		font-weight: 600;
		color: var(--ink);
		max-width: 140px;
	}

	.speech-tail {
		position: absolute;
		bottom: -16px;
		left: 50%;
		transform: translateX(-50%);
	}

	.speech-word {
		display: inline;
		opacity: 0;
		animation: word-in 0.3s ease forwards;
	}

	@keyframes word-in {
		from {
			opacity: 0;
			transform: translateY(4px);
		}
		to {
			opacity: 1;
			transform: translateY(0);
		}
	}

	/* SVG typography */
	.viz-svg :global(.viz-title) {
		font-family: var(--font-display);
		font-size: 16px;
		font-weight: 700;
		fill: var(--text);
	}

	.viz-svg :global(.viz-tick) {
		font-family: var(--font-body);
		font-size: 10px;
		fill: var(--text-muted);
	}

	.viz-svg :global(.viz-caption) {
		font-family: var(--font-body);
		font-size: 11px;
		fill: var(--text-muted);
	}

	.viz-svg :global(.viz-band-label) {
		font-family: var(--font-body);
		font-size: 11px;
		font-weight: 700;
	}

	.viz-svg :global(.viz-counter) {
		font-family: var(--font-display);
		font-size: 18px;
		font-weight: 800;
	}

	.viz-svg :global(.viz-counter-label) {
		font-family: var(--font-body);
		font-size: 9px;
		fill: var(--text-muted);
	}

	.viz-svg :global(.viz-stat-label) {
		font-family: var(--font-body);
		font-size: 11px;
		fill: var(--text-muted);
	}

	.viz-svg :global(.viz-dot-label) {
		font-family: var(--font-body);
		font-size: 9px;
		font-weight: 700;
		fill: var(--text);
	}

	/* Big numbers panel (step 1) */
	.big-numbers {
		display: flex;
		align-items: center;
		gap: 24px;
	}

	.big-number-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 4px;
	}

	.big-number-label {
		font-family: var(--font-body);
		font-size: 0.875rem;
		font-weight: 700;
		color: var(--text-muted);
	}

	.big-number {
		font-family: var(--font-display);
		font-size: clamp(2.5rem, 8vw, 4.5rem);
		font-weight: 800;
		line-height: 1;
		color: var(--night);
	}

	.big-number-unit {
		font-family: var(--font-body);
		font-size: 0.8125rem;
		color: var(--text-light);
	}

	.big-number-divider {
		font-family: var(--font-display);
		font-size: 2rem;
		font-weight: 800;
		color: var(--text-light);
	}

	.viz-stat {
		margin-top: 24px;
		font-size: 1.0625rem;
		color: var(--text-muted);
		text-align: center;
	}

	.viz-stat strong {
		color: var(--ochre);
		font-weight: 700;
	}

	/* Guess panel (step 2) */
	.guess-prompt {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 24px;
	}

	.guess-buttons {
		display: flex;
		gap: 16px;
	}

	.guess-btn {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 140px;
		height: 60px;
		border: 2px solid var(--border);
		border-radius: var(--radius-tile);
		font-family: var(--font-display);
		font-size: 1.25rem;
		font-weight: 700;
		color: var(--text);
		background: var(--bg);
	}

	.viz-label {
		display: inline-block;
		padding: 24px 32px;
		border: 2px dashed var(--border-soft);
		border-radius: var(--radius-tile);
		color: var(--text-muted);
		font-family: var(--font-body);
		font-size: 0.875rem;
		text-align: center;
		max-width: 480px;
		background: var(--bg);
	}

	/* Scroll cards */
	.cards-spacer {
		height: 70vh;
	}

	.step {
		min-height: 65vh;
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0 var(--gutter, 16px);
		pointer-events: none;
	}

	.scroll-card {
		max-width: 380px;
		padding: 20px 24px;
		background: var(--bg);
		border: 2px solid var(--border);
		border-radius: var(--radius-tile);
		pointer-events: auto;
		opacity: 0.3;
		transition: opacity 0.3s ease;
	}

	.step.active .scroll-card {
		opacity: 1;
	}

	.scroll-card p {
		font-size: 1.0625rem;
		line-height: 1.55;
	}

	/* Calculator section */
	.calculator-section {
		padding: 80px var(--gutter, 16px);
	}

	.section-inner {
		max-width: 680px;
		margin: 0 auto;
	}

	.section-inner h2 {
		font-size: 1.75rem;
		margin-bottom: 12px;
		color: var(--night);
	}

	.section-dek {
		color: var(--text-muted);
		margin-bottom: 32px;
	}

	.calculator-placeholder {
		display: flex;
		align-items: center;
		justify-content: center;
		min-height: 240px;
		border: 2px dashed var(--border-soft);
		border-radius: var(--radius-tile);
	}

	/* Sources */
	.sources-section {
		padding: 80px var(--gutter, 16px);
		border-top: 1px solid var(--border-soft);
	}

	.sources-section ul {
		list-style: none;
		padding: 0;
	}

	.sources-section li {
		font-size: 0.9375rem;
		line-height: 1.6;
		color: var(--text-muted);
		padding: 8px 0;
		border-bottom: 1px solid var(--border-soft);
	}

	.sources-section li:last-child {
		border-bottom: none;
	}

	.sources-section a {
		text-decoration: underline;
		text-underline-offset: 2px;
	}

	@media (max-width: 767px) {
		.step {
			min-height: 85vh;
		}

		/* Hide scroll card on the explore step so it doesn't block the interactive map */
		.step[data-step="map-explore"] .scroll-card {
			display: none;
		}

		.step[data-step="close"] {
			align-items: flex-start;
			padding-top: 8px;
		}

		.step[data-step="close"] .scroll-card {
			font-size: 0.875rem;
			padding: 12px 16px;
			max-width: 280px;
		}
	}

	/* Desktop: push cards to the left so viz is unobstructed */
	@media (min-width: 768px) {
		.viz-panel {
			padding: 4px 32px;
		}

		.step {
			justify-content: flex-start;
			padding-left: 5vw;
		}

		.scroll-card {
			max-width: 320px;
		}

		.speech-bubble {
			margin-left: 15%;
		}

		.viz-svg {
			max-width: 680px;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.viz-panel,
		.scroll-card {
			transition: none;
		}
		.speech-word {
			animation: none;
			opacity: 1;
		}
	}
</style>
