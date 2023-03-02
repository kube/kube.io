<script lang="ts">
  import NavbarLink from './NavbarLink.svelte';
</script>

<nav>
  <ul>
    <li><NavbarLink path="/">Hello</NavbarLink></li>
    <!-- <li><NavbarLink path="/blog">Blog</NavbarLink></li> -->
    <li><NavbarLink path="/projects">Projects</NavbarLink></li>
    <li><NavbarLink path="/cv">CV</NavbarLink></li>
  </ul>
</nav>

<style lang="scss">
  nav {
    @media print {
      display: none;
    }

    display: inline-block;
    padding-left: 9px;
    line-height: 46px;
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
