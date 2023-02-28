<script lang="ts">
  import CV from '../../lib/CV/CV.svelte';
  import { fly, fade } from 'svelte/transition';

  let title = 'CV';

  function printPDF() {
    window.print();
  }
</script>

<svelte:head>
  <title>KUBE - {title}</title>
</svelte:head>

<main in:fade={{ duration: 400 }} out:fade={{ duration: 90 }}>
  <h1 in:fly={{ y: 90, duration: 290 }}>
    Curiculum Vitae.
    <button class="print-pdf-button" on:click={printPDF}>Print PDF</button>
  </h1>

  <CV />
</main>

<style lang="scss">
  main {
    position: absolute;
    @media screen {
      padding-bottom: 9rem;
    }

    .print-pdf-button {
    }
  }
</style>
