<script lang="ts">
  import { setContext } from 'svelte';
  import { DEBUG_CONTEXT_KEY } from './DebugContext';
  import type { DebugContext } from './DebugContext';

  import CommandPalette from '../CommandPalette/CommandPalette.svelte';
  import { onMount } from 'svelte';

  let isPaletteOpen = false;

  function recordKeyStrokes(event: KeyboardEvent) {
    if (event.ctrlKey && event.shiftKey && event.code === 'Backslash') {
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
      // console.log(`Registering Command ${command.group}: ${command.label}`);
      commands = [...commands, command];
      return () => {
        // console.log(`Unregistering ${command.label}`);
        commands = commands.filter(item => item !== command);
      };
    }
  });
</script>

{#if isPaletteOpen}
  <CommandPalette close={() => (isPaletteOpen = false)} {commands} />
{/if}

<slot />
