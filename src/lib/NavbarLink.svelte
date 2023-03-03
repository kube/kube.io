<script lang="ts">
  import { page } from '$app/stores';
  export let text: string;
  export let path: string;

  $: active =
    path === '/'
      ? $page.url.pathname === path
      : $page.url.pathname.startsWith(path);
</script>

<a href={path} data-text={text} class:active>
  <span>{text}</span>
</a>

<style lang="scss">
  a {
    text-align: center;
    text-decoration: none;
    font-weight: 400;
    opacity: 0.8;
    letter-spacing: 0.4;
    color: var(--palette-medium-grey);
    transition: font-weight 0.1s ease, letter-spacing 0.1s ease;

    span {
      display: block;
      line-height: 46px;
    }
    &.active {
      opacity: 1;
      font-weight: 700;
      color: var(--palette-purple);
      letter-spacing: -0.05px;
      &:hover {
        color: var(--palette-purple);
      }
    }
    &:hover {
      opacity: 1;
      color: var(--palette-medium-grey);
    }

    // Make sure item is always same width when font-weight changes
    &::after {
      display: block;
      visibility: hidden;
      content: attr(data-text);
      font-weight: 700;
      letter-spacing: 0px;
      height: 0;
      overflow: hidden;
      margin: 0 1px;
    }
  }
</style>
