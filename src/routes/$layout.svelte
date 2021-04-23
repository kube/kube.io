<script>
  import '../app.scss';
  import Logo from '../lib/Logo/Logo.svelte';
  import Navbar from '../lib/Navbar.svelte';
</script>

<main>
  <Navbar />
  <Logo />

  <slot />
</main>

<style>
  main {
    position: relative;
    max-width: 490px;
    min-height: 600px;
    margin: 0 auto;
    margin-bottom: 90px;
  }

  @media print {
    main {
      width: auto;
      margin-bottom: 0;
      max-width: none;
    }
  }
</style>
