<script lang="ts">
  import NavbarLink from './NavbarLink.svelte';
</script>

<nav>
  <ul>
    <li><NavbarLink path="/" text="Hello" /></li>
    <!-- <li><NavbarLink path="/blog" text="Blog" /></li> -->
    <li><NavbarLink path="/projects" text="Projects" /></li>
    <li><NavbarLink path="/cv" text="CV" /></li>
  </ul>
</nav>

<style lang="scss">
  nav {
    @media print {
      display: none;
    }

    display: inline-block;
    padding-left: 9px;
    vertical-align: bottom;

    ul {
      list-style: none;
      margin: 0;
      padding: 0;
    }

    li {
      font-size: 1.3rem;
      font-weight: 700;
      font-family: var(--palette-fonts-caps);
      text-transform: uppercase;
      display: inline-block;
      margin: 0;
      padding: 4px 11px;
    }
  }
</style>
