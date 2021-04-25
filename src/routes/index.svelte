<script lang="ts">
  import Intro from './intro.md';
  import Social from '../lib/Social.svelte';
  import { fly, fade } from 'svelte/transition';

  const TITLE = 'Hello';
</script>

<svelte:head>
  <title>KUBE - {TITLE}</title>
</svelte:head>

<main in:fade={{ duration: 400 }} out:fade={{ duration: 90 }}>
  <h1 in:fly={{ y: 90, duration: 290 }}>{TITLE}.</h1>
  <h2>I'm a Software Developer.</h2>

  <Intro />

  <Social />
</main>

<style>
  main {
    position: absolute;
  }
</style>
