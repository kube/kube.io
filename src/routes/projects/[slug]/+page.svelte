<script lang="ts">
  import { fly, fade } from 'svelte/transition';
  import type { PageData } from './$types';
  import './Project.scss';
  import GithubIcon from '$lib/Icons/Github.svelte';

  export let data: PageData;

  $: project = data.props.project;
  $: metadata = project.metadata;
</script>

<div in:fly={{ y: -90, duration: 200 }}>
  <a class="backToProjects" href="/projects"
    ><span class="arrow">{'<-'}</span> Projects</a
  >
</div>

<h1 in:fly={{ y: 90, duration: 290 }}>{metadata.title}</h1>

<main in:fade={{ duration: 400 }} out:fade={{ duration: 90 }}>
  <article class="project">
    {#if metadata.subtitle}
      <blockquote>{metadata.subtitle}</blockquote>
    {/if}

    {#if metadata.picture}
      <img alt={`${metadata.title} picture`} src={metadata.picture} />
    {/if}

    {#if metadata.youtube}
      <iframe
        class="youtubeIframe"
        title={`${metadata.title} YouTube video`}
        src={metadata.youtube}
        allowFullScreen
      />
    {/if}

    <div class="marked-description">
      <svelte:component this={project.default} />
    </div>

    {#if metadata.github}
      <a href={metadata.github} target="_blank">
        <GithubIcon class="github-link" />
      </a>
    {/if}
  </article>
</main>

<style lang="scss">
  h1 {
    font-size: 58px;
    line-height: 45px;
    margin-bottom: 22px;

    font-family: var(--palette-fonts-title);
  }

  .backToProjects {
    font-family: var(--palette-fonts-caps);

    text-transform: uppercase;
    font-size: 1.3rem;
    font-weight: 600;
    .arrow {
      font-family: var(--palette-fonts-text);
    }
  }
  main {
    position: absolute;
    left: 0;
    right: 0;
  }

  * :global(.github-link) {
    width: 42px;
    fill: var(--palette-dark-grey);
    @media (prefers-color-scheme: dark) {
      fill: var(--palette-light-grey);
    }
  }

  .project {
    margin: 0;
    margin-bottom: 65px;
    text-align: justify;
    font-weight: 400;
    font-size: 1.2rem;
    line-height: 1.6rem;
    break-inside: avoid;

    h3 {
      font-family: var(--palette-fonts-title);
      font-weight: 700;
      text-align: left;
      font-size: 2.1rem;
      line-height: 2rem;
      width: 54%;
      text-transform: uppercase;
      margin: 0;
      padding: 0;
      padding-top: 4.5rem;
      padding-bottom: 1.85rem;
      opacity: 0.7;
    }
  }

  .youtubeIframe {
    width: 100%;
    height: 310px;
  }
  img {
    width: 100%;
  }
</style>
