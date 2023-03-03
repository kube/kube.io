<script lang="ts">
  import DebugProvider from '$lib/DebugContext/DebugProvider.svelte';
  import '../app.scss';
  import Header from '../lib/Header.svelte';
</script>

<DebugProvider>
  <div class="website-wrapper">
    <Header />
    <slot />
  </div>
</DebugProvider>

<style>
  .website-wrapper {
    position: relative;
    max-width: 490px;
    min-height: 600px;
    margin: 0 auto;
    margin-bottom: 90px;
    padding-top: 158px;
  }

  @media print {
    .website-wrapper {
      width: auto;
      margin-top: 1rem;
      margin-left: 8rem;
      margin-right: 8rem;
      margin-bottom: 0;
      max-width: none;
    }
  }
</style>
