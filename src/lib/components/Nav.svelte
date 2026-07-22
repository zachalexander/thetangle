<script>
	import { page } from '$app/stores';
</script>

<nav class="nav">
	<div class="nav-inner">
		<a href="/" class="wordmark">the tangle</a>
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
		border-bottom: 1px solid var(--border);
		z-index: 100;
	}

	.nav-inner {
		max-width: var(--max-width);
		margin: 0 auto;
		padding: 0 24px;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: space-between;
	}

	.wordmark {
		font-family: var(--font-serif);
		font-size: 1.125rem;
		font-weight: 400;
		letter-spacing: -0.01em;
		color: var(--text);
	}

	.nav-links {
		display: flex;
		gap: 32px;
	}

	.nav-links a {
		font-size: 0.8125rem;
		font-weight: 500;
		color: var(--text-muted);
		letter-spacing: 0.06em;
		text-transform: uppercase;
		transition: color 0.15s ease;
	}

	.nav-links a:hover,
	.nav-links a.active {
		color: var(--text);
	}

	@media (max-width: 600px) {
		.nav-links {
			gap: 20px;
		}

		.nav-links a {
			font-size: 0.75rem;
		}
	}
</style>
