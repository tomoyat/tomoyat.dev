import adapter from '@sveltejs/adapter-cloudflare';
import preprocess from 'svelte-preprocess';
import {mdsvex} from 'mdsvex';

/** @type {import('@sveltejs/kit').Config} */
const config = {

    extensions: ['.svelte', '.md', '.svx'],
    // Consult https://github.com/sveltejs/svelte-preprocess
    // for more information about preprocessors
    preprocess: [
        preprocess({postcss: true,}),
        mdsvex({
            extensions: ['.md', '.svx']
        })
    ],

	kit: {
		adapter: adapter({
			// See below for an explanation of these options
			routes: {
				include: ['/*'],
				exclude: ['<all>']
			},
			platformProxy: {
				persist: './cloudflare-build'
			}
		})
	}
};

export default config;
