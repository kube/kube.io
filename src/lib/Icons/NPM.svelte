<script lang="ts">
  let className: string | undefined;
  export { className as class };
  export let style: string | undefined;
</script>

<svg width="18" height="7" class={className} {style}>
  <path
    d="M0 0h18v6H9v1H5V6H0V0zm1 5h2V2h1v3h1V1H1v4zm5-4v5h2V5h2V1H6zm2 1h1v2H8V2zm3-1v4h2V2h1v3h1V2h1v3h1V1h-6z"
  />
</svg>
