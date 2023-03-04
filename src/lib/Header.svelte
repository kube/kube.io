<script lang="ts">
  import { spring } from 'svelte/motion';

  import Logo from '../lib/Logo/Logo.svelte';
  import Navbar from '../lib/Navbar.svelte';

  const WIDTH = spring(58, { stiffness: 0.0061, damping: 0.1 });
</script>

<header>
  <span>
    <Logo WIDTH={$WIDTH} />
    <Navbar />
  </span>
</header>

<style>
  header {
    position: absolute;
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    justify-content: center;
    z-index: 2;
    top: 0;
    left: 0;
    right: 0;
    width: 100%;
    padding-top: 63px;
    padding-bottom: 31px;
  }

  header > span {
    width: 490px;
  }

  @media print {
    header {
      display: none;
    }
  }
</style>
