<script lang="ts">
  import { onMount } from 'svelte';

  import Logo from '../lib/Logo/Logo.svelte';
  import Navbar from '../lib/Navbar.svelte';

  let isScrolled = false;

  onMount(() => {
    function handleDocumentScroll(event: Event) {
      isScrolled = document.body.scrollTop > 0;
    }
    document.addEventListener('scroll', handleDocumentScroll);
    return () => document.removeEventListener('scroll', handleDocumentScroll);
  });
</script>

<header class:scrolled={isScrolled}>
  <span>
    <Logo WIDTH={isScrolled ? 38 : 58} />
    <Navbar />
  </span>
</header>

<style>
  header {
    position: fixed;
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

    transition-property: backdrop-filter -webkit-backdrop-filter background-color
      padding-top padding-bottom;
    transition-duration: 0.4s;
  }

  header > span {
    width: 490px;
  }

  header.scrolled {
    backdrop-filter: blur(18px);
    -webkit-backdrop-filter: blur(31px);

    padding-top: 6px;
    padding-bottom: 6px;
  }

  @media (prefers-color-scheme: dark) {
    header.scrolled {
      background-color: rgba(var(--palette-dark-grey-rgb), 0.85);
    }
  }

  @media (prefers-color-scheme: light) {
    header.scrolled {
      background-color: rgba(var(--palette-light-grey-rgb), 0.85);
    }
  }

  @media print {
    header {
      display: none;
    }
  }
</style>
