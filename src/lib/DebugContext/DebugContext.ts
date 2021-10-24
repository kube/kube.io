import { getContext } from 'svelte';

export type Command = {
  id: string;
  group: string;
  label: string;
  callback: () => void;
};

export type DebugContext = {
  registerCommand: (command: Command) => () => void;
};

export const DEBUG_CONTEXT_KEY = Symbol('DebugContext');

export function useDebugContext(): DebugContext {
  return getContext(DEBUG_CONTEXT_KEY);
}
