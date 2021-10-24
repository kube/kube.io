import { readFileSync } from 'fs';

import { mdsvex } from 'mdsvex';
import mdsvexConfig from './mdsvex.config.mjs';
import sveltePreprocess from 'svelte-preprocess';
import staticAdapter from '@sveltejs/adapter-static';

const pkg = JSON.parse(readFileSync('./package.json'));

/** @type {import('@sveltejs/kit').Config} */
export default {
  extensions: ['.svelte', ...mdsvexConfig.extensions],
  // Consult https://github.com/sveltejs/svelte-preprocess
  // for more information about preprocessors
  preprocess: [mdsvex(mdsvexConfig), sveltePreprocess()],
  kit: {
    // By default, `npm run build` will create a standard Node app.
    // You can create optimized builds for different platforms by
    // specifying a different adapter
    adapter: staticAdapter(),

    appDir: 'dist',

    // hydrate the <div id="svelte"> element in src/app.html
    target: '#svelte',

    vite: {
      ssr: {
        noExternal: Object.keys(pkg.dependencies || {})
      }
    }
  }
};
