<script lang="ts">
  import LinkedInIcon from './Icons/LinkedIn.svelte';
  import StackOverflowIcon from './Icons/StackOverflow.svelte';
  import TwitterIcon from './Icons/Twitter.svelte';
  import ObservableIcon from './Icons/Observable.svelte';
  import GithubIcon from './Icons/Github.svelte';
</script>

<footer>
  <a href="https://github.com/kube" target="__blank">
    <GithubIcon class="icon" style="fill:#6e5494" />
  </a>
  <a href="https://linkedin.com/in/cfeijoo" target="__blank">
    <LinkedInIcon class="icon" style="fill:#0077b5" />
  </a>
  <a
    href="https://stackoverflow.com/users/1914206/kube?tab=profile"
    target="__blank"
  >
    <StackOverflowIcon class="icon" style="fill:#ff9900" />
  </a>
  <a href="https://twitter.com/KubeKhrm" target="__blank">
    <TwitterIcon class="icon" style="fill:#00aced" />
  </a>
</footer>

<style lang="scss">
  * :global(.icon) {
    margin: 7px;
    max-width: 31px;
    max-height: 31px;
    fill: var(--palette-dark-grey);
    transition: transform 0.3s;

    &:hover {
      transform: scale(1.15);
    }
    &:active {
      transform: scale(0.94);
      fill: var(--palette-purple);
    }
  }
</style>
