<script lang="ts">
	import { PROJECTS } from '../data/projects';
	import Project from '../lib/Project.svelte';
	import { fly, fade } from 'svelte/transition';

	const TITLE = 'Projects';
</script>

<svelte:head>
	<title>KUBE - {TITLE}</title>
</svelte:head>

<main in:fade={{ duration: 320 }} out:fade={{ duration: 160 }}>
	<h1 in:fly={{ y: 100, duration: 290 }}>{TITLE}.</h1>
	<h2>Some Code Stuff.</h2>
	{#each PROJECTS as project}
		<Project {project} />
	{/each}
</main>

<style lang="scss">
	main {
		margin: 0 auto;
	}

	@media (max-width: 400) {
		main {
			h1 {
				font-size: 65px;
			}
			h2 {
				font-size: 38px;
				line-height: 38px;
			}
		}
	}
</style>
