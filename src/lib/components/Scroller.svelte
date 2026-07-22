<!--
  Scroller.svelte — sticky scrollytelling component

  Usage:
    <Scroller bind:index bind:progress>
      {#snippet background()}...sticky viz...{/snippet}
      {#snippet foreground()}...scroll steps...{/snippet}
    </Scroller>

  Each direct child of the foreground slot with class="step" is observed.
  `index` updates to the index of the currently visible step.
  `progress` is 0–1 scroll progress through the whole scroller section.
-->
<script>
	import { onMount } from 'svelte';

	let {
		index = $bindable(0),
		progress = $bindable(0),
		background,
		foreground
	} = $props();

	let containerEl;
	let foregroundEl;

	onMount(() => {
		// Track step visibility with IntersectionObserver
		const steps = foregroundEl?.querySelectorAll('.step') ?? [];

		const stepObserver = new IntersectionObserver(
			(entries) => {
				entries.forEach((entry) => {
					if (entry.isIntersecting) {
						const i = [...steps].indexOf(entry.target);
						if (i !== -1) index = i;
					}
				});
			},
			{ threshold: 0.5, rootMargin: '-10% 0px -10% 0px' }
		);

		steps.forEach((el) => stepObserver.observe(el));

		// Track overall scroll progress through the scroller section
		const handleScroll = () => {
			if (!containerEl) return;
			const { top, height } = containerEl.getBoundingClientRect();
			const vh = window.innerHeight;
			progress = Math.max(0, Math.min(1, (vh - top) / (height + vh)));
		};

		window.addEventListener('scroll', handleScroll, { passive: true });
		handleScroll();

		return () => {
			stepObserver.disconnect();
			window.removeEventListener('scroll', handleScroll);
		};
	});
</script>

<div class="scroller" bind:this={containerEl}>
	<div class="scroller-background">
		{@render background?.()}
	</div>

	<div class="scroller-foreground" bind:this={foregroundEl}>
		{@render foreground?.()}
	</div>
</div>

<style>
	.scroller {
		position: relative;
	}

	.scroller-background {
		position: sticky;
		top: var(--nav-height);
		height: calc(100vh - var(--nav-height));
		width: 100%;
		overflow: hidden;
		z-index: 0;
	}

	.scroller-foreground {
		position: relative;
		z-index: 1;
		pointer-events: none;
		/* Pull foreground up so first card overlaps the sticky background */
		margin-top: calc(-1 * (100vh - var(--nav-height)));
	}
</style>
