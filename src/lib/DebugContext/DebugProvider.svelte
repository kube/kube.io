<script lang="ts">
  import { setContext } from 'svelte';
  import { DEBUG_CONTEXT_KEY } from './DebugContext';
  import type { DebugContext } from './DebugContext';

  import CommandPalette from '../CommandPalette/CommandPalette.svelte';
  import { onMount } from 'svelte';

  let isPaletteOpen = false;

  function isMacintosh() {
    return navigator.platform.indexOf('Mac') > -1;
  }

  function recordKeyStrokes(event: KeyboardEvent) {
    const isControlKeyPressed = isMacintosh() ? event.metaKey : event.ctrlKey;
    if (isControlKeyPressed && event.shiftKey && event.code === 'KeyP') {
      event.preventDefault();
      isPaletteOpen = !isPaletteOpen;
    }
  }

  onMount(() => {
    window.addEventListener('keydown', recordKeyStrokes);
    return () => window.removeEventListener('keydown', recordKeyStrokes);
  });

  let commands = [];

  setContext<DebugContext>(DEBUG_CONTEXT_KEY, {
    registerCommand: command => {
      commands = [...commands, command];
      return () => {
        commands = commands.filter(item => item !== command);
      };
    }
  });
</script>

{#if isPaletteOpen}
  <CommandPalette close={() => (isPaletteOpen = false)} {commands} />
{/if}

<slot />
