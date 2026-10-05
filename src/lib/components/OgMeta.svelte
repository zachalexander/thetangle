<script>
	let {
		title = 'The Tangle',
		description = 'Visual essays.',
		ogImage = '/og/default.png',
		url = 'https://thetangle.io'
	} = $props();

	const fullTitle = $derived(title === 'The Tangle' ? title : `${title} | The Tangle`);
</script>

<svelte:head>
	<title>{fullTitle}</title>
	<meta name="description" content={description} />
	<meta property="og:title" content={fullTitle} />
	<meta property="og:description" content={description} />
	<meta property="og:image" content={ogImage} />
	<meta property="og:url" content={url} />
	<meta property="og:type" content="website" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="twitter:title" content={fullTitle} />
	<meta name="twitter:description" content={description} />
	<meta name="twitter:image" content={ogImage} />
</svelte:head>
