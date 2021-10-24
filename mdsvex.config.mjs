import rehypeSlug from 'rehype-slug'
import remarkAbbr from 'remark-abbr';
import remarkGithub from 'remark-github'
import rehypeAutolinkHeadings from 'rehype-autolink-headings'

export default {
	extensions: [".svx", ".md"],
	smartypants: {
		dashes: "oldschool",
	},
	remarkPlugins: [
		[remarkGithub, {
			// Use your own repository
			repository: "https://github.com/svelte-add/mdsvex.git",
		}],
		remarkAbbr,
	],
	rehypePlugins: [
		rehypeSlug,
		[rehypeAutolinkHeadings, {
			behavior: "wrap",
		}],
	],
};
