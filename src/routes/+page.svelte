<script>
	import OgMeta from '$lib/components/OgMeta.svelte';
	import StoryGrid from '$lib/components/StoryGrid.svelte';
	import { stories } from '$lib/stories/index.js';
</script>

<OgMeta title="The Wild Plot" description="Visual essays by Zach Alexander." />

<main class="home">
	<div class="container">
		<header class="site-intro">
			<h1 class="wordmark">the wild plot</h1>
			<p>
				Visual essays. Each piece is a question worth asking — answered with
				numbers, maps, and honesty.
			</p>
		</header>

		<StoryGrid {stories} featureFirst showUpcoming />
	</div>
</main>

<style>
	.home {
		padding: 24px var(--gutter) 0;
	}

	.container {
		max-width: var(--max-width);
		margin: 0 auto;
	}

	.site-intro {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: flex-end;
		gap: 16px 40px;
		padding-bottom: 28px;
		margin-bottom: 32px;
		border-bottom: var(--rule);
	}

	/* Slimmed-down wordmark: big enough to brand the page, short enough that tiles stay near the top */
	.wordmark {
		font-size: clamp(3.5rem, 11vw, 9.5rem);
		line-height: 0.85;
		letter-spacing: -0.05em;
	}

	.site-intro p {
		max-width: 420px;
		font-size: 1.125rem;
		line-height: 1.5;
	}
</style>
