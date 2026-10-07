<script>
	import { page } from '$app/stores';
</script>

<nav class="nav" aria-label="Main">
	<div class="nav-inner">
		<a href="/" class="wordmark">the wild plot</a>
		<div class="nav-links">
			<a href="/work" class:active={$page.url.pathname.startsWith('/work')}>Work</a>
			<a href="/writing" class:active={$page.url.pathname.startsWith('/writing')}>Writing</a>
			<a href="/about" class:active={$page.url.pathname === '/about'}>About</a>
		</div>
	</div>
</nav>

<style>
	.nav {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		height: var(--nav-height);
		background: var(--bg-nav);
		z-index: 100;
	}

	.nav-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 var(--gutter);
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 16px;
	}

	.wordmark {
		font-family: var(--font-display);
		font-size: 1.5rem;
		font-weight: 800;
		letter-spacing: -0.04em;
		color: var(--text);
	}

	.nav-links {
		display: flex;
		gap: 24px;
	}

	.nav-links a {
		font-size: 1rem;
		font-weight: 500;
		color: var(--text);
		padding: 10px 0;
		border-bottom: 2px solid transparent;
		transition: border-color 0.15s ease;
	}

	.nav-links a:hover,
	.nav-links a.active {
		border-bottom-color: var(--text);
	}

	@media (max-width: 480px) {
		.wordmark {
			font-size: 1.25rem;
		}

		.nav-links {
			gap: 16px;
		}

		.nav-links a {
			font-size: 0.9375rem;
		}
	}
</style>
