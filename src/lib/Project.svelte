<script lang="ts">
	import './Project.scss';
	import type { Project } from '../data/projects';
	import GithubIcon from './Icons/Github.svelte';
	import marked from 'marked';
	import prismjs from 'prismjs';
	import 'prismjs/components/prism-jsx';

	export let project: Project;
	const textHtml = marked(project.text, {
		highlight(code, lang) {
			if (lang in prismjs.languages) {
				return prismjs.highlight(code, prismjs.languages[lang], lang);
			} else {
				return code;
			}
		}
	});

	const sectionId = project.title.toLowerCase().replace(/\s+/g, '-');
</script>

<div class="project">
	<a href={`#${sectionId}`}>
		<h3 id={sectionId}>{project.title}</h3>
	</a>
	{#if project.subtitle}
		<blockquote>{project.subtitle}</blockquote>
	{/if}

	{#if project.picture}
		<img alt={`${project.title} picture`} src={project.picture} />
	{/if}

	{#if project.youtube}
		<iframe
			class="youtubeIframe"
			title={`${project.title} YouTube video`}
			src={project.youtube}
			allowFullScreen
		/>
	{/if}

	<div class="marked-description">
		{@html textHtml}
	</div>

	{#if project.github}
		<a href={project.github} target="_blank">
			<GithubIcon class="github-link" />
		</a>
	{/if}
</div>

<style lang="scss">
	* :global(.github-link) {
		width: 42px;
		fill: var(--palette-dark-grey);
		@media (prefers-color-scheme: dark) {
			fill: var(--palette-light-grey);
		}
	}

	.project {
		margin: 0;
		margin-bottom: 65px;
		text-align: 'justify';
		font-weight: 400;
		font-size: 16px;
		line-height: 21px;
		break-inside: avoid;

		h3 {
			font-family: var(--palette-fonts-sans);
			font-weight: 700;
			font-size: 27px;
			text-align: left;
			line-height: 1.1;
			width: 54%;
			text-transform: uppercase;
			margin: 0;
			padding: 0;
			padding-top: 58px;
			padding-bottom: 24px;
			opacity: 0.7;
		}
	}

	.youtubeIframe {
		width: 100%;
		height: 310px;
	}
	img {
		width: 100%;
	}
</style>
