<script lang="ts">
  import { cv } from './cv';
  import Timeline from './Timeline.svelte';
</script>

<section>
  <div class="IntroStyle">
    <h2>
      {cv.firstName}
      {cv.lastName}
    </h2>
    <div class="job">{cv.job}</div>

    <div class="address">
      <span class="city">{cv.address.city}</span>
      <span class="country">{cv.address.country}</span>
    </div>

    <div class="email">
      <span class="user">{cv.mail.user}</span><span class="domain"
        >{cv.mail.domain}</span
      >
    </div>

    <div class="phone">
      {cv.phone.replace(/[0-9][0-9]/g, _ => _ + ' ')}
    </div>
  </div>

  <div class="InfoColumnsStyle">
    <div class="column">
      <a href="#code">
        <h3 id="code">Code</h3>
      </a>
      <ul>
        {#each cv.languages as language}
          <li>{language}</li>
        {/each}
      </ul>
    </div>

    <div class="column">
      <a href="#stack">
        <h3 id="stack">Stack</h3>
      </a>
      <ul>
        {#each cv.frameworks as framework}
          <li>{framework}</li>
        {/each}
      </ul>
    </div>

    <div class="column">
      <a href="#tools">
        <h3 id="tools">Tools</h3>
      </a>
      <ul>
        {#each cv.tools as tool}
          <li>{tool}</li>
        {/each}
      </ul>
    </div>
  </div>

  <div class="PrincipalColumnStyle">
    <a href="#cursus">
      <h3 id="cursus">Cursus</h3>
    </a>
    <Timeline timeline={cv.cursus} />

    <a href="#experience">
      <h3 id="experience">Work Experience</h3>
    </a>
    <Timeline timeline={cv.work} />
  </div>
</section>

<style lang="scss">
  section {
    margin: 0 auto;
    margin-bottom: 130px;

    h3 {
      font-size: 1.9rem;
      font-weight: 300;
      font-family: var(--palette-fonts-sans);
      text-transform: uppercase;
      padding-top: 54px;
      margin-bottom: 13px;
    }

    .IntroStyle {
      margin-top: 36px;
      h2 {
        font-family: var(--palette-fonts-sans);
        font-size: 2.6rem;
        margin: 0;
        padding: 0;
      }
      .job {
        font-family: var(--palette-fonts-sans);
        font-size: 1.85rem;
        margin: 0;
        padding: 0;
      }
      .address {
        margin: 9px 0;
        .city {
          font-size: 1.4rem;
          font-weight: 500;
        }
        .country {
          &::before {
            content: quote(', ');
          }
        }
      }
      .email {
        font-size: 1.3rem;
        .domain::before {
          content: quote('@');
        }
      }
    }

    .InfoColumnsStyle {
      .column {
        float: left;
        width: 33%;
        ul {
          margin: 0;
          padding: 0;
          li {
            padding: 0;
            margin: 3px 0;
            list-style: none;
            font-size: 1.4rem;
          }
        }
      }
    }

    .PrincipalColumnStyle {
      clear: both;
      padding-top: 1px;
    }
  }
</style>
