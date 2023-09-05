<script>
	// @ts-nocheck
	import '../../app.css';

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
}
(): SysCode {
msg := "hello" as LogMsg; *LogResult;
return true as SysCode;
}`;
	let error = '';
	let output = '';
	let tokenizer = new kanlang.Tokenizer();
	$: tokens = ((code) => {
		return tokenizer.tokenize(code);
	})(code);
	$: out = ((code) => {
		try {
			error = '';
			const compiled = kanlang.compile(code);

			output = '';
			console.oldLog = console.log;
			console.log = function (value) {
				console.oldLog(value);
				output += value;
				return value;
			};
			try {
				eval(compiled.out);
			} catch (e) {
				console.log(e);
			} finally {
				console.log = console.oldLog;
			}
			return compiled;
		} catch (e) {
			error = e;
		}
	})(code);
</script>

<h1>Kanlang web editor</h1>
<div class="wrapper">
	<div class="code">
		<div class="editor">
			<textarea
				bind:value={code}
				class="language-kanlang"
				on:keydown={(e) => {
					if (e.key == 'Tab') {
						e.preventDefault();
						var start = this.selectionStart;
						var end = this.selectionEnd;

						// set textarea value to: text before caret + tab + text after caret
						code = code.substring(0, start) + '  ' + code.substring(end);
						console.log(code);
						// put caret at right position again
						this.selectionStart = this.selectionEnd = start + 1;
					}
				}}
			/>
			<div class="language-kanlang">
				<pre>{#if tokens}{#each tokens as token}<span class="token {token.type}">{token.value}</span
							>{/each}{/if}</pre>
			</div>
		</div>
	</div>
	<div class="output">
		{#if out}
			<pre class="language-kanlang"><code class="language-kanlang"
					>{out?.out}
		</code></pre>

			<pre class="language-kanlang"><code class="language-kanlang"
					>{output}
		</code></pre>
		{/if}

		{#if error}
			<h2>Compile Errors</h2>
			<div class="error">
				{error}
			</div>
		{/if}
	</div>
</div>

<style lang="postcss">
	.language-kanlang {
		overflow: auto;
		font-family: 'Fira Code', Consolas, Monaco, 'Andale Mono', 'Ubuntu Mono', monospace;
	}
	textarea,
	.editor > div {
		@apply absolute top-0 left-0 m-0 p-5 border-0;
		width: calc(100%);
		height: calc(100%);
	}
	.editor > div {
		background: #2e3440;
		@apply text-white;
	}
	textarea {
		@apply z-10 bg-transparent text-transparent caret-neutral-50;
	}
	.code {
		@apply z-0 relative bg-red-500;
	}
	.wrapper {
		@apply flex gap-2 items-stretch absolute h-full w-full;
	}
	.code,
	.output {
		@apply flex-1 self-stretch;
	}
	pre {
		@apply flex-1;
	}
	.error {
		background: #2e3440;
		color: #bf616a;
		@apply mt-12 text-lg p-8 rounded-sm;
	}
</style>
