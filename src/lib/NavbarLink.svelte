<script lang="ts">
  import { page } from '$app/stores';
  export let path: string;

  $: active =
    path === '/'
      ? $page.url.pathname === path
      : $page.url.pathname.startsWith(path);
</script>

<a href={path} class:active>
  <slot />
</a>

<style lang="scss">
  a {
    text-decoration: none;
    font-weight: 400;
    opacity: 0.8;
    letter-spacing: 0.4;
    color: var(--palette-medium-grey);
    &.active {
      opacity: 1;
      font-weight: 700;
      color: var(--palette-purple);
    }
    &:hover {
      opacity: 1;
      color: var(--palette-medium-grey);
    }
  }
</style>
