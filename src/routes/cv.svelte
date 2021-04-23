<script lang="ts">
  import CV from '../lib/CV/CV.svelte';
  import { fly, fade } from 'svelte/transition';

  let title = 'CV';
</script>

<svelte:head>
  <title>KUBE - {title}</title>
</svelte:head>

<main in:fade={{ duration: 320 }} out:fade={{ duration: 160 }}>
  <h1 in:fly={{ y: 100, duration: 290 }}>Curiculum Vitae.</h1>

  <CV />
</main>

<style>
  main {
    position: absolute;
  }
</style>
