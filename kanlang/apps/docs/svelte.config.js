import adapter from '@sveltejs/adapter-static';
import { vitePreprocess } from '@sveltejs/kit/vite';
import { mdsvex } from 'mdsvex';
import * as kanlang from '@kanlang/kanlang';

function highlighter(code, lang) {
	if (lang === 'kanlang') {
		const tokenizer = new kanlang.Tokenizer();
		const tokens = tokenizer.tokenize(code);

		const typeToClass = (type) => {
			switch (type) {
				case 'literal':
					return 'string';
				case 'identifier':
					return 'class-name';
				case 'punct':
					return 'punctuation';
				default:
					return `${type}`;
			}
		};
		const hl = tokens
			.map(
				(token) =>
					`<span class="token ${typeToClass(token.type)}">${token.value
						.replace(/&/g, '&amp;')
						.replace(/</g, '&lt;')
						.replace(/>/g, '&gt;')
						.replace(/"/g, '&quot;')
						.replace(/'/g, '&#039;')
						.replace(/{/g, '&#123;')}</span>`
			)
			.join('');

		code = code
			.replace(/&/g, '&amp;')
			.replace(/</g, '&lt;')
			.replace(/>/g, '&gt;')
			.replace(/"/g, '&quot;')
			.replace(/'/g, '&#039;')
			.replace(/{/g, '&#123;');
		return `<pre class="language-${lang}"><code class="language-${lang}">${hl}</code></pre>`;
	}
	return `<pre class="language-${lang}"><code class="language-${lang}">${code}</code></pre>`;
}

/** @type {import('@sveltejs/kit').Config} */
const config = {
	extensions: ['.svelte', '.md'],
	preprocess: [vitePreprocess(), mdsvex({ extension: 'md', highlight: { highlighter } })],
	kit: {
		// adapter-auto only supports some environments, see https://kit.svelte.dev/docs/adapter-auto for a list.
		// If your environment is not supported or you settled on a specific environment, switch out the adapter.
		// See https://kit.svelte.dev/docs/adapters for more information about adapters.
		adapter: adapter()
	}
};

export default config;
