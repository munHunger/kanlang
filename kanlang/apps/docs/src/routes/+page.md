# Kanlang

markdown

_bold_

mdsvex
mdsvex is a markdown preprocessor for components. Basically for Svelte.

This preprocessor allows you to use Svelte components in your markdown, or markdown in your Svelte components.

mdsvex supports all Svelte syntax and almost all markdown syntax. See for more information.

You can do this:

```html
<script>
	import { Chart } from '../components/Chart.svelte';
</script>

# Here’s a chart The chart is rendered inside our MDsveX document.

<Chart />
```

It uses , and and you can use any or to enhance your experience.

## Here comes a long paragraph

There are two named exports from `mdsvex` that can be used to transform mdsvex documents, mdsvex and compile. mdsvex is a Svelte preprocessor and is the preferred way to use this library. The compile function is useful when you wish to compile mdsvex documents to Svelte components directly, without hooking into the Svelte compiler.
