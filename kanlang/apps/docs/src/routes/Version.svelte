<script>
	import pkg from '../../../../package.json';
</script>

<div class="version">{pkg.version}</div>

<style lang="postcss">
	.version {
		@apply border-2 inline-block px-2 rounded-lg font-thin text-xs border-slate-200;
	}
</style>
