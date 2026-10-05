<script>
	import OgMeta from '$lib/components/OgMeta.svelte';
	import StoryGrid from '$lib/components/StoryGrid.svelte';
	import { stories } from '$lib/stories/index.js';
</script>

<OgMeta title="Work" description="Data stories and visualizations by Zach Alexander." />

<main class="work-index">
	<div class="container">
		<header class="page-header">
			<h1>Work</h1>
			<p>{stories.length} {stories.length === 1 ? 'story' : 'stories'}</p>
		</header>

		<StoryGrid {stories} label="All stories" />
	</div>
</main>

<style>
	.work-index {
		padding: 56px var(--gutter) 0;
	}

	.container {
		max-width: var(--max-width);
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: baseline;
		gap: 16px;
		padding-bottom: 24px;
		margin-bottom: 32px;
		border-bottom: var(--rule);
	}

	.page-header h1 {
		font-size: clamp(2.5rem, 6vw, 4rem);
	}

	.page-header p {
		font-size: 1rem;
		color: var(--text-muted);
	}
</style>
