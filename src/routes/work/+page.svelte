<script>
	import OgMeta from '$lib/components/OgMeta.svelte';
	import { stories } from '$lib/stories/index.js';
</script>

<OgMeta
	title="Work"
	description="Data stories and visualizations by Zach Alexander."
/>

<main class="work-index">
	<div class="container">
		<header class="page-header">
			<h1>Work</h1>
			<p>{stories.length} {stories.length === 1 ? 'story' : 'stories'}</p>
		</header>

		<section class="story-grid" aria-label="All stories">
			{#each stories as story}
				<a href="/work/{story.slug}" class="story-card">
					<div class="card-meta">
						<div class="card-tags">
							{#each story.tags as tag}
								<span class="tag">{tag}</span>
							{/each}
						</div>
						<time class="card-date">{story.date}</time>
					</div>
					<h2 class="card-title">{story.title}</h2>
					<p class="card-description">{story.description}</p>
					<span class="card-cta">Read →</span>
				</a>
			{/each}
		</section>
	</div>
</main>

<style>
	.work-index {
		padding: 64px 24px 0;
	}

	.container {
		max-width: var(--max-width);
		margin: 0 auto;
	}

	.page-header {
		display: flex;
		align-items: baseline;
		gap: 16px;
		margin-bottom: 48px;
	}

	.page-header h1 {
		font-size: 2rem;
		letter-spacing: -0.03em;
	}

	.page-header p {
		font-size: 0.875rem;
		color: var(--text-muted);
	}

	.story-grid {
		display: grid;
		grid-template-columns: repeat(2, 1fr);
		gap: 1px;
		background: var(--border);
		border: 1px solid var(--border);
	}

	.story-card {
		display: flex;
		flex-direction: column;
		gap: 12px;
		padding: 36px;
		background: var(--bg);
		transition: background 0.15s ease;
	}

	.story-card:hover {
		background: var(--bg-nav);
	}

	.card-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.card-tags {
		display: flex;
		gap: 6px;
	}

	.tag {
		font-size: 0.6875rem;
		font-weight: 600;
		letter-spacing: 0.08em;
		text-transform: uppercase;
		color: var(--text-muted);
	}

	.card-date {
		font-size: 0.75rem;
		color: var(--text-light);
	}

	.card-title {
		font-size: 1.625rem;
		font-weight: 700;
		line-height: 1.15;
		letter-spacing: -0.02em;
	}

	.card-description {
		font-size: 0.9375rem;
		line-height: 1.55;
		color: var(--text-muted);
		flex: 1;
	}

	.card-cta {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-muted);
		margin-top: 8px;
	}

	@media (max-width: 720px) {
		.work-index {
			padding: 40px 16px 0;
		}

		.story-grid {
			grid-template-columns: 1fr;
		}

		.story-card {
			padding: 28px 20px;
		}

		.card-title {
			font-size: 1.375rem;
		}
	}
</style>
