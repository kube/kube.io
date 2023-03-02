<script lang="ts">
  import { fly, fade } from 'svelte/transition';

  let title = 'Blog';

  function printPDF() {
    window.print();
  }
</script>

<svelte:head>
  <title>KUBE - {title}</title>
</svelte:head>

<main in:fade={{ duration: 400 }} out:fade={{ duration: 90 }}>
  <h1 in:fly={{ y: 90, duration: 290 }}>Blog.</h1>
</main>

<style lang="scss">
  main {
    position: absolute;
  }
</style>
