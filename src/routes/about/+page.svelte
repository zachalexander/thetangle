<script>
	import OgMeta from '$lib/components/OgMeta.svelte';
</script>

<OgMeta title="About" description="Visual essays by Zach Alexander." />

<main class="about">
	<div class="container">
		<header class="page-header">
			<h1>About</h1>
		</header>

		<section class="bio">
			<p>
				The Tangle is a site for visual essays — pieces built around the belief
				that the right number, shown honestly, can change how you see something.
			</p>
			<p>
				Built by Zach Alexander, a data engineer and analyst based in the Northeast. Also the
				person behind <a href="https://birdland-metrics.com" target="_blank" rel="noopener noreferrer"
					>Birdland Metrics</a
				>.
			</p>
		</section>
	</div>
</main>

<style>
	.about {
		padding: 64px 24px 0;
	}

	.container {
		max-width: 680px;
		margin: 0 auto;
	}

	.page-header {
		margin-bottom: 48px;
	}

	.page-header h1 {
		font-size: 2rem;
		letter-spacing: -0.03em;
	}

	.bio p {
		font-size: 1.0625rem;
		line-height: 1.7;
		color: var(--text-muted);
		margin-bottom: 20px;
	}

	.bio a {
		color: var(--text);
		text-decoration: underline;
		text-underline-offset: 3px;
	}
</style>
