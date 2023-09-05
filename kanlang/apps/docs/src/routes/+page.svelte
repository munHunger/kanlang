<script>
	import '../app.css';
	import Version from './Version.svelte';
</script>

<div class="container">
	<div class="hero">
		<img src="favicon.png" alt="hero icon" />
	</div>
	<div class="title">
		<h1>Kanlang</h1>
	</div>
	<div class="subtitle">
		<Version />
	</div>
	<div class="navigation">
		<a href="/docs">Documentation</a>
		<a href="/web">Web Editor</a>
	</div>
	<div class="body">
		<p>
			Kanlang is a new programming language that aims to answer the question, "Are function names
			just bloat?"
		</p>
		<p>
			It does this by completely removing function names and direct function calls. Instead they are
			replaced with a type request, that can be seen as an inline Dependency Injection.
		</p>
		<p>
			By doing these things Kanlang is to my knowledge the first programming language that embraces
			Transformation Oriented Development, and in doing so is introducing a new paradigm.
		</p>
		<p>Read more about it in the Documentation page, or try it out in the web editor.</p>
	</div>
</div>

<style lang="postcss">
	h1 {
		@apply text-gray-500 text-4xl font-thin font-roboto mb-10;
	}
	p {
		@apply my-4 mx-16 max-w-xl text-gray-600;
	}
	a {
		@apply inline-block mx-4 underline underline-offset-4 text-gray-500;
	}
	.hero {
		@apply mt-16;
	}
	.title {
		@apply mt-24;
	}
	.navigation {
		@apply mt-4;
	}
	.container {
		@apply flex flex-col items-center;
	}
</style>
