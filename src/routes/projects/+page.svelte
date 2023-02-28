<script lang="ts">
  import PROJECTS from '../../data/projects';
  import Project from '../../lib/Project.svelte';
  import { fly, fade } from 'svelte/transition';

  const TITLE = 'Projects';
</script>

<svelte:head>
  <title>KUBE - {TITLE}</title>
</svelte:head>

<main in:fade={{ duration: 400 }} out:fade={{ duration: 90 }}>
  <h1 in:fly={{ y: 90, duration: 290 }}>{TITLE}.</h1>
  <h2>Some Code Stuff.</h2>
  {#each PROJECTS as project}
    <Project {project} />
  {/each}
</main>

<style lang="scss">
  main {
    position: absolute;
    left: 0;
    right: 0;
  }
</style>
