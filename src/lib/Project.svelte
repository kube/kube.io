<script lang="ts">
  import './Project.scss';
  import type { Project } from '../data/projects';
  import GithubIcon from './Icons/Github.svelte';

  export let project: Project;

  const { metadata } = project;
  const sectionId = metadata.title.toLowerCase().replace(/\s+/g, '-');
</script>

<div class="project">
  <a href={`#${sectionId}`}>
    <h3 id={sectionId}>{metadata.title}</h3>
  </a>
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
</div>

<style lang="scss">
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
    font-size: 16px;
    line-height: 21px;
    break-inside: avoid;

    h3 {
      font-family: var(--palette-fonts-sans);
      font-weight: 700;
      font-size: 27px;
      text-align: left;
      line-height: 1.1;
      width: 54%;
      text-transform: uppercase;
      margin: 0;
      padding: 0;
      padding-top: 58px;
      padding-bottom: 24px;
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
