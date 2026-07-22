<script>
	import OgMeta from '$lib/components/OgMeta.svelte';
</script>

<OgMeta title="Writing" description="Notes and methodology from the work." />

<main class="writing-index">
	<div class="container">
		<header class="page-header">
			<h1>Writing</h1>
		</header>
		<p class="coming-soon">Coming soon.</p>
	</div>
</main>

<style>
	.writing-index {
		padding: 64px 24px 0;
	}

	.container {
		max-width: var(--max-width);
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 48px;
	}

	.page-header h1 {
		font-size: 2rem;
		letter-spacing: -0.03em;
	}

	.coming-soon {
		color: var(--text-muted);
		font-size: 0.9375rem;
	}
</style>
