<script lang="ts">
  import DebugProvider from '$lib/DebugContext/DebugProvider.svelte';
  import '../app.scss';
  import Logo from '../lib/Logo/Logo.svelte';
  import Navbar from '../lib/Navbar.svelte';
</script>

<DebugProvider>
  <div class="website-wrapper">
    <header>
      <Logo />
      <Navbar />
    </header>

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
  }

  header {
    margin-bottom: 31px;
  }

  @media print {
    header {
      display: none;
    }
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
