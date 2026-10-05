<script>
	import Scroller from '$lib/components/Scroller.svelte';
	import OgMeta from '$lib/components/OgMeta.svelte';
	import SunlightCalculator from './components/SunlightCalculator.svelte';

	let { data } = $props();

	let index = $state(0);
	let progress = $state(0);

	const steps = [
		{
			id: 'hook',
			text: 'Sometime in late August, it happens without announcement. You put your child to bed and the window is dark. Not later — right now. The sun is already gone.'
		},
		{
			id: 'bedtime',
			text: 'A child with a 7:30pm bedtime in New York gets 143 lit evenings a year. That sounds like a lot until you count them.'
		},
		{
			id: 'crossing',
			text: 'The last one falls on August 31. The sun sets at 7:29 — one minute before bedtime. The next evening, it is already dark when the lights go out.'
		},
		{
			id: 'wave',
			text: 'The crossing date moves with latitude. Seattle stays lit nine days longer than New York. Phoenix loses the light five weeks earlier. The same bedtime, different summers.'
		},
		{
			id: 'return',
			text: "It comes back. Around the second week of April, the evenings are lit again. But by then you've forgotten how long they last — and summer is still three months away."
		}
	];
</script>

<OgMeta
	title="The Last Lit Evening"
	description="At 40.7°N, a child with a 7:30pm bedtime gets 143 lit evenings a year. The last one falls on August 31."
	ogImage="/og/sunlight-fall.png"
	url="https://thetangle.io/work/sunlight-fall"
/>

<article class="story">
	<!-- Story header -->
	<header class="story-header">
		<div class="header-inner">
			<div class="story-tags">
				<span class="tag">family</span>
				<span class="tag">seasons</span>
				<span class="tag">light</span>
			</div>
			<h1 class="story-title">The Last Lit Evening</h1>
			<p class="story-dek">
				At 40.7°N, a child with a 7:30pm bedtime gets 143 lit evenings a year. The last one falls
				on August 31.
			</p>
			<div class="story-byline">
				<span>By Zach Alexander</span>
				<span class="separator">·</span>
				<time>September 2026</time>
			</div>
		</div>
	</header>

	<!-- Scrollytelling section -->
	<Scroller bind:index bind:progress>
		{#snippet background()}
			<!-- TODO: animation canvas (image sequence from Procreate Dreams) -->
			<div class="animation-placeholder">
				<div class="sun-pos" style="--progress: {progress}"></div>
			</div>
		{/snippet}

		{#snippet foreground()}
			<div class="cards-rail">
				<div class="cards-spacer"></div>

				{#each steps as s, i}
					<div class="step" aria-hidden={i !== index}>
						<div class="scroll-card" class:active={i === index}>
							<p>{s.text}</p>
						</div>
					</div>
				{/each}

				<div class="cards-spacer"></div>
			</div>
		{/snippet}
	</Scroller>

	<!-- Calculator section -->
	<section class="calculator-section">
		<div class="section-inner">
			<h2>Your last lit evening</h2>
			<p class="section-note">
				Enter your city and your child's bedtime. We'll tell you how many lit evenings you get —
				and the date they end.
			</p>

			<SunlightCalculator />
		</div>
	</section>

	<!-- Credits -->
	<section class="methodology">
		<div class="section-inner">
			<h3>Sources</h3>
			<p>
				Sunset times computed from standard solar equations. Foliage color sampled from the <a
					href="https://phenocam.nau.edu"
					target="_blank"
					rel="noopener noreferrer">PhenoCam Network</a
				>, Harvard Forest site, ORNL DAAC.
			</p>
		</div>
	</section>
</article>

<style>
	/* ── Story header ─────────────────────────────────── */
	.story-header {
		padding: 64px 24px 56px;
		border-bottom: 1px solid var(--border);
	}

	.header-inner {
		max-width: 680px;
		margin: 0 auto;
	}

	.story-tags {
		display: flex;
		gap: 8px;
		margin-bottom: 20px;
	}

	.tag {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.story-title {
		font-size: clamp(2rem, 5vw, 3.25rem);
		font-weight: 800;
		letter-spacing: -0.03em;
		line-height: 1.05;
		margin-bottom: 20px;
	}

	.story-dek {
		font-size: 1.125rem;
		line-height: 1.6;
		color: var(--text-muted);
		margin-bottom: 24px;
	}

	.story-byline {
		font-size: 0.8125rem;
		color: var(--text-light);
		display: flex;
		gap: 8px;
	}

	.separator {
		color: var(--border);
	}

	/* ── Animation background ─────────────────────────── */
	.animation-placeholder {
		width: 100%;
		height: 100%;
		background: linear-gradient(to bottom, #1a1a2e 0%, #e8762b 70%, #f4a261 100%);
		position: relative;
		overflow: hidden;
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
		background: rgba(248, 247, 244, 0.9);
		backdrop-filter: blur(10px);
		-webkit-backdrop-filter: blur(10px);
		border: 1px solid rgba(224, 222, 216, 0.5);
		border-radius: 6px;
		padding: 28px 32px;
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
		font-size: 1rem;
		line-height: 1.7;
		color: var(--text);
	}

	/* ── Calculator section ───────────────────────────── */
	.calculator-section,
	.methodology {
		padding: 80px 24px 0;
	}

	.section-inner {
		max-width: 680px;
		margin: 0 auto;
	}

	.calculator-section h2 {
		font-size: 1.5rem;
		font-weight: 700;
		letter-spacing: -0.02em;
		margin-bottom: 12px;
	}

	.section-note {
		font-size: 0.9375rem;
		color: var(--text-muted);
		line-height: 1.6;
		margin-bottom: 36px;
	}

	/* ── Methodology ──────────────────────────────────── */
	.methodology {
		padding-bottom: 80px;
	}

	.methodology h3 {
		font-size: 0.75rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.06em;
		color: var(--text-muted);
		margin-bottom: 16px;
	}

	.methodology p {
		font-size: 0.9375rem;
		line-height: 1.7;
		color: var(--text-muted);
	}

	.methodology a {
		text-decoration: underline;
		text-underline-offset: 3px;
	}

	/* ── Responsive ───────────────────────────────────── */
	@media (max-width: 720px) {
		.story-header {
			padding: 40px 16px 32px;
		}

		.cards-rail {
			align-items: center;
			padding: 0 16px;
		}

		.step {
			width: 100%;
			margin-bottom: 40vh;
		}

		.calculator-section,
		.methodology {
			padding: 56px 16px 0;
		}

		.methodology {
			padding-bottom: 56px;
		}
	}
</style>
