<script lang="ts">
  import { loadProjects } from '../../data/projects';
  import { fly, fade } from 'svelte/transition';

  const TITLE = 'Projects';
  const projects = loadProjects();
</script>

<svelte:head>
  <title>KUBE - {TITLE}</title>
</svelte:head>

<main in:fade={{ duration: 400 }} out:fade={{ duration: 90 }}>
  <h1 in:fly={{ y: 90, duration: 290 }}>{TITLE}.</h1>
  <h2>Some Code Stuff.</h2>

  <div class="info-box">
    <p>
      <b
        ><span class="icon">ⓘ</span> This page needs to be curated and updated.</b
      >
    </p>
    <p>List is not up-to-date, and projects are not relevant anymore.</p>
  </div>

  <ul>
    {#each projects as project}
      <a href={`/projects/${project.metadata.id}`}>
        <li>
          <h3>{project.metadata.title}</h3>
          {#if project.metadata.description}
            <span>{project.metadata.description}</span>
          {/if}
        </li>
      </a>
    {/each}
  </ul>
</main>

<style lang="scss">
  main {
    position: absolute;
    left: 0;
    right: 0;
    padding-bottom: 7rem;
  }

  .info-box {
    border: 1px solid;
    border-color: var(--palette-text-color);
    padding: 0 1rem;
    margin: 1rem 0;
    border-radius: 0.5rem;
    font-size: 1.1rem;
    line-height: 1.2rem;
    opacity: 0.6;
    .icon {
      font-size: 1.4rem;
      margin-right: 0.4rem;
    }
  }

  ul {
    margin: 0;
    padding: 0;

    a {
      display: block;
      opacity: 0.81;

      &:hover {
        opacity: 1;
      }
    }

    li {
      list-style: none;
      text-align: justify;
      break-inside: avoid;
      margin: 1.8rem 0;

      h3 {
        font-family: var(--palette-fonts-caps);
        font-weight: 500;
        text-align: left;
        font-size: 1.5rem;
        line-height: 1.6rem;
        width: 54%;
        text-transform: uppercase;
        margin: 0.3rem 0;
        padding: 0;
      }

      span {
        font-family: var(--palette-fonts-text);
        font-weight: 400;
        text-align: left;
        font-size: 1rem;
        line-height: 1.2rem;
        margin: 1rem 0;
        padding: 0;
        color: var(--palette-text-color);
      }
    }
  }
</style>
