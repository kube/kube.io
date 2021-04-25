<script>
  import '../app.scss';
  import Logo from '../lib/Logo/Logo.svelte';
  import Navbar from '../lib/Navbar.svelte';
</script>

<div class="website-wrapper">
  <header>
    <Logo />
  </header>

  <Navbar />

  <slot />
</div>

<style>
  .website-wrapper {
    position: relative;
    max-width: 490px;
    min-height: 600px;
    margin: 0 auto;
    margin-bottom: 90px;
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
