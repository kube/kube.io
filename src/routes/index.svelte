<script lang="ts">
	import Intro from './intro.svx';
	import Social from '../lib/Social.svelte';
	import { fly, fade } from 'svelte/transition';

	const TITLE = 'Hello';
</script>

<svelte:head>
	<title>KUBE - {TITLE}</title>
</svelte:head>

<main in:fade={{ duration: 320 }} out:fade={{ duration: 160 }}>
	<h1 in:fly={{ y: 100, duration: 290 }}>{TITLE}.</h1>
	<h2>I'm a Software Developer.</h2>

	<Intro />

	<Social />
</main>
