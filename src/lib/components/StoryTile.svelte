<!--
  StoryTile.svelte — one coloured tile in the Gallery Index grid.
  Uses the story's own `color` / `ink` so each piece keeps its colour world.
-->
<script>
	import { formatMonth } from '$lib/format.js';

	let { story, large = false } = $props();

	const bg = $derived(story.color ?? 'var(--surface)');
	const ink = $derived(story.ink ?? 'var(--text)');
	const inProgress = $derived(story.status && story.status !== 'published');
</script>

<a href="/work/{story.slug}" class="tile" class:large style:--tile-bg={bg} style:--tile-ink={ink}>
	<div class="tile-top">
		{#if story.tags?.length}
			<span class="eyebrow">{story.tags[0]}</span>
		{/if}
		{#if inProgress}
			<span class="badge">In progress</span>
		{/if}
	</div>

	<div class="tile-body">
		<h2 class="tile-title">{story.title}</h2>
		{#if large && story.description}
			<p class="tile-description">{story.description}</p>
		{/if}
		<time class="tile-date" datetime={story.date}>{formatMonth(story.date)}</time>
	</div>
</a>

<style>
	.tile {
		position: relative;
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 32px;
		min-height: 360px;
		padding: 28px;
		border-radius: var(--radius-tile);
		background: var(--tile-bg);
		color: var(--tile-ink);
		overflow: hidden;
		transition: transform 0.2s ease;
	}

	.tile:hover {
		transform: translateY(-4px);
	}

	.tile.large {
		min-height: 480px;
		padding: clamp(28px, 4vw, 40px);
	}

	.tile-top {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		align-items: center;
		gap: 8px;
	}

	.badge {
		font-size: 0.8125rem;
		font-weight: 700;
		padding: 4px 12px;
		border: 2px solid currentColor;
		border-radius: var(--radius-pill);
	}

	.tile-body {
		display: flex;
		flex-direction: column;
		gap: 12px;
	}

	.tile-title {
		font-size: 2.125rem;
		line-height: 1;
	}

	.large .tile-title {
		font-size: clamp(2.25rem, 4.5vw, 3.75rem);
		line-height: 0.98;
		max-width: 16ch;
	}

	.tile-description {
		font-size: 1.125rem;
		line-height: 1.45;
		max-width: 46ch;
	}

	.tile-date {
		font-size: 0.9375rem;
		font-weight: 500;
	}
</style>
