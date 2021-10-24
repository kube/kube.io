import { onMount } from 'svelte';
import { useDebugContext } from './DebugContext';
import type { Command } from './DebugContext';

export function useRegisterCommand(command: Command) {
  const { registerCommand } = useDebugContext();
  return onMount(() => registerCommand(command));
}
