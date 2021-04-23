<script lang="ts">
  import { page } from '$app/stores';
  export let path: string;
</script>

<a href={path} class:active={$page.path === path}>
  <slot />
</a>

<style lang="scss">
  a {
    text-decoration: none;
    opacity: 0.6;
    color: var(--palette-medium-grey);
    &.active {
      opacity: 1;
      color: var(--palette-purple);
    }
    &:hover {
      opacity: 1;
      color: var(--palette-medium-grey);
    }
  }
</style>
