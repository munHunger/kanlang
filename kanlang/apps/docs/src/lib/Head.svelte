<script>
	const tagLine =
		'a programming language built to explore transformation oriented programming. Meaning that it is an attempt at a paradigm shift from object orientation to something else.';
	const image = 'https://kanlang.wunderdev.com/favicon.png';
</script>

<svelte:head>
	<title>Kanlang</title>
	<meta name="description" content={tagLine} />

	<!-- Twitter card -->
	<meta name="twitter:card" content="summary" />
	<meta name="twitter:title" content="" />
	<meta name="twitter:description" content={tagLine} />
	<meta name="twitter:image" content={image} />

	<!-- Facebook OpenGraph -->
	<meta property="og:title" content="" />
	<meta property="og:description" content={tagLine} />
	<meta property="og:image" content={image} />
	<meta property="og:type" content="website" />
	<meta property="og:locale" content="en_US" />
</svelte:head>
