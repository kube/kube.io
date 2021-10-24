<script lang="ts">
  import { onMount } from 'svelte';
  import type { Command } from '../DebugContext/DebugContext';

  // Props
  export let close: () => void;
  export let commands: Command[];

  function toSlug(str: string) {
    return str.replace(/\s/g, '').toLowerCase();
  }

  function matchSearch(search: string) {
    const searchSlug = toSlug(search);

    return ({ group, label }: Command) => {
      const commandSlug = toSlug(`${group}${label}`);
      return commandSlug.includes(searchSlug);
    };
  }

  function sortCommands(a: Command, b: Command) {
    // Sort by Category
    if (a.group < b.group) return -1;
    if (a.group > b.group) return 1;
    // Then by Id
    if (a.id < b.id) return -1;
    return 1;
  }

  let inputRef: HTMLInputElement;
  let listRef: HTMLUListElement;

  let search = '';
  let selectedIndex = 0;

  $: filteredCommands = commands.sort(sortCommands).filter(matchSearch(search));

  function callCommand(index: number) {
    filteredCommands[index]?.callback();
    close();
  }

  // Scroll list to view item if not fully visible
  function scrollItemIntoView(index: number) {
    const listElem = listRef;
    const item = listRef.children[index];

    if (!listElem || !(item instanceof HTMLElement)) return;

    const scrollY = listElem.scrollTop;
    const viewHeight = listElem.offsetHeight;
    const itemY = item.offsetTop - listElem.offsetTop;
    const itemHeight = item.clientHeight;

    if (itemY < scrollY) {
      item.scrollIntoView(true); // Item is upper, align at bottom
    } else if (itemY + itemHeight > scrollY + viewHeight) {
      item.scrollIntoView(false); // Item is lower, align at top
    }
  }

  function handleKeyDown({ key }: KeyboardEvent) {
    if (key === 'Escape') {
      close();
    } else if (key === 'ArrowDown') {
      const nextIndex = (selectedIndex + 1) % filteredCommands.length;
      selectedIndex = nextIndex;
      scrollItemIntoView(nextIndex);
    } else if (key === 'ArrowUp') {
      const previousIndex =
        (selectedIndex + filteredCommands.length - 1) % filteredCommands.length;
      selectedIndex = previousIndex;
      scrollItemIntoView(previousIndex);
    } else if (key === 'Enter') {
      callCommand(selectedIndex);
    }
  }

  // Focus input when Command Palette opens
  onMount(() => inputRef.focus());

  // Listen Keyboard for Navigation in Command Palette
  onMount(() => {
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  });
</script>

<div class="commandPaletteWrapper" onClick={close}>
  <div class="commandPalette" onClick={e => e.stopPropagation()}>
    <input
      class="commandPaletteInput"
      bind:this={inputRef}
      bind:value={search}
    />
    <ul bind:this={listRef}>
      {#each filteredCommands as command, index}
        <li
          role="menuitem"
          tabIndex={index}
          class={selectedIndex === index ? 'selected' : undefined}
          on:focus={() => (selectedIndex = index)}
          on:click={() => callCommand(index)}
        >
          <span class="groupName">{command.group}</span>
          {command.label}
        </li>
      {/each}
    </ul>
  </div>
</div>

<style lang="scss">
  .commandPaletteWrapper {
    position: absolute;
    display: block;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    backdrop-filter: blur(4px);
    z-index: 999999999;
    overflow: hidden;

    @media print {
      & {
        display: none;
      }
    }
  }

  .commandPaletteInput {
    background-color: white;
    color: black;
    border: none;
  }

  .commandPalette {
    margin: 22px auto;
    width: 450px;
    background-color: white;
    border-radius: 3px;
    overflow: hidden;
    box-shadow: 1px 5px 16px #00000044;

    input {
      display: block;
      width: 100%;
      height: 42px;
      padding: 9px;
      border-bottom: 1px solid #00000022;
    }

    ul {
      margin: 0;
      padding: 0;
      list-style: none;
      max-height: calc(100vh - 90px);
      overflow-x: hidden;
      overflow-y: auto;
      li {
        color: black;
        display: block;
        padding: 9px;
        border-bottom: 1px solid #00000022;

        &.selected {
          background-color: rgb(13, 81, 228);
          color: white;
        }
        &:hover {
          background-color: #00000013;
        }
        &.selected:hover {
          background-color: rgb(9, 87, 190);
        }
        &:active,
        &.selected:hover:active {
          background-color: rgb(11, 59, 122);
        }

        .groupName {
          font-weight: 300;
          opacity: 0.6;
          margin-right: 6px;
        }
      }
    }
  }
</style>
