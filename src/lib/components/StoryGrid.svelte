<!--
  StoryGrid.svelte — Gallery Index tile grid with tag filters.

  Props:
    stories      — array of story metadata (src/lib/stories)
    featureFirst — first story renders as a large, double-width tile
    showUpcoming — adds a dashed "more on the way" tile when no filter is active
-->
<script>
	import StoryTile from './StoryTile.svelte';

	let { stories = [], featureFirst = false, showUpcoming = false, label = 'Stories' } = $props();

	let active = $state('all');

	const tags = $derived([...new Set(stories.flatMap((s) => s.tags ?? []))].sort());
	const visible = $derived(
		active === 'all' ? stories : stories.filter((s) => s.tags?.includes(active))
	);
</script>

{#if tags.length > 1}
	<div class="filters" role="group" aria-label="Filter by topic">
		<button
			type="button"
			class="pill"
			aria-pressed={active === 'all'}
			onclick={() => (active = 'all')}>All</button
		>
		{#each tags as tag}
			<button
				type="button"
				class="pill"
				aria-pressed={active === tag}
				onclick={() => (active = tag)}>{tag}</button
			>
		{/each}
	</div>
{/if}

<section class="grid" aria-label={label}>
	{#each visible as story, i (story.slug)}
		<div class="cell" class:wide={featureFirst && i === 0 && active === 'all'}>
			<StoryTile {story} large={featureFirst && i === 0 && active === 'all'} />
		</div>
	{/each}

	{#if showUpcoming && active === 'all'}
		<div class="cell">
			<div class="upcoming">
				<span class="eyebrow">Coming next</span>
				<p class="upcoming-title">More threads are being untangled.</p>
			</div>
		</div>
	{/if}
</section>

<style>
	.filters {
		display: flex;
		flex-wrap: wrap;
		gap: 8px;
		margin-bottom: 24px;
	}

	.filters .pill {
		text-transform: capitalize;
	}

	.grid {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(min(320px, 100%), 1fr));
		gap: 20px;
	}

	.cell {
		display: flex;
		flex-direction: column;
	}

	.cell > :global(*) {
		flex: 1;
	}

	@media (min-width: 720px) {
		.cell.wide {
			grid-column: span 2;
		}
	}

	.upcoming {
		display: flex;
		flex-direction: column;
		justify-content: space-between;
		gap: 32px;
		min-height: 360px;
		padding: 28px;
		border: 2px dashed var(--text-light);
		border-radius: var(--radius-tile);
		background: var(--surface);
		color: var(--text);
	}

	.upcoming-title {
		font-family: var(--font-display);
		font-weight: 800;
		font-size: 2.125rem;
		line-height: 1;
		letter-spacing: -0.02em;
	}
</style>
