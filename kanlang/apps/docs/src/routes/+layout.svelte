<script>
	import '../app.css';
</script>

<div class="content">
	<slot />
</div>

<style lang="postcss">
	:global(h1) {
		@apply text-gray-500 text-3xl font-thin font-roboto;
	}
	:global(h2) {
		@apply text-slate-700 text-2xl font-semibold font-roboto border-b-2 mt-12 mb-6;
	}
	:global(p) {
		@apply my-4;
	}
	.content {
		@apply p-8 text-gray-600;
	}
</style>
