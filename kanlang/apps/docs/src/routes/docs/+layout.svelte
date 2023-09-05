<script>
	import '../../app.css';
</script>

<div class="wrapper">
	<div class="content">
		<slot />
	</div>
</div>

<style lang="postcss">
	:global(h1) {
		@apply text-gray-500 text-4xl font-thin font-roboto mb-10;
	}
	:global(h2) {
		@apply text-slate-700 text-2xl font-semibold font-roboto border-b-2 mt-12 mb-6;
	}
	:global(p) {
		@apply my-4;
	}
	:global(a) {
		@apply underline underline-offset-4 text-gray-500;
	}
	:global(code) {
		@apply text-gray-700 bg-gray-100 px-1 -mx-1;
	}
	.content {
		@apply p-8 text-gray-600 max-w-5xl my-32 flex-1;
	}
	.wrapper {
		@apply flex flex-col items-center;
	}
</style>
