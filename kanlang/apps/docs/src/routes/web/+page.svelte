<script>
	// @ts-nocheck

	import * as kanlang from '@kanlang/kanlang';
	let code = `type Celsius alias num
type Fahrenheit alias num
type Kelvin alias num

(f: Fahrenheit): Celsius {
  return f - 32 * 5 / 9 as Celsius; 
}
(c: Celsius): Kelvin {
  return c - 273 as Kelvin;
}
(f: Fahrenheit): Kelvin {
  return *Kelvin;
}`;
	let error = '';
	$: out = ((code) => {
		try {
			console.log(kanlang.compile(code));
			return kanlang.compile(code);
		} catch (e) {
			console.log(e);
			error = e;
		}
	})(code);
</script>

<h1>Kanlang web editor</h1>

<pre class="language-kanlang"><code class="language-kanlang" bind:innerText={code} contenteditable
		>{code}</code
	></pre>

{#if out}
	<h2>Compiled JS</h2>
	<pre class="language-kanlang"><code class="language-kanlang"
			>{out?.out}
    </code></pre>
{/if}

{#if error}
	<h2>Compile Errors</h2>
	<div class="error">
		{error}
	</div>
{/if}

<style lang="postcss">
	pre {
		@apply flex-1;
	}
	.error {
		background: #2e3440;
		color: #bf616a;
		@apply mt-12 text-lg p-8 rounded-sm;
	}
</style>
