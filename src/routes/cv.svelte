<script lang="ts">
  import CV from '../lib/CV/CV.svelte';
  import { fly, fade } from 'svelte/transition';

  let title = 'CV';
</script>

<svelte:head>
  <title>KUBE - {title}</title>
</svelte:head>

<main in:fade={{ duration: 400 }} out:fade={{ duration: 90 }}>
  <h1 in:fly={{ y: 90, duration: 290 }}>Curiculum Vitae.</h1>

  <CV />
</main>

<style lang="scss">
  main {
    position: absolute;
    @media screen {
      padding-bottom: 9rem;
    }
  }
</style>
