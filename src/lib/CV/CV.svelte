<script lang="ts">
  import { cv } from './cv';
  import Timeline from './Timeline.svelte';
</script>

<section class="IntroStyle">
  <h2>
    {cv.firstName}
    {cv.lastName}
  </h2>
  <div class="job">{cv.job}</div>

  <div class="address">
    <span class="city">{cv.address.city}</span><span class="country"
      >{cv.address.country}</span
    >
  </div>

  <div class="website">
    {cv.website}
  </div>

  <div class="email">
    <span class="user">{cv.mail.user}</span><span class="domain"
      >{cv.mail.domain}</span
    >
  </div>

  <div class="phone">
    {cv.phone.replace(/[0-9][0-9]/g, _ => _ + ' ')}
  </div>
</section>

<section class="InfoColumnsStyle">
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
</section>

<section class="PrincipalColumnStyle">
  <a href="#cursus">
    <h3 id="cursus">Cursus</h3>
  </a>
  <Timeline timeline={cv.cursus} />
</section>

<section class="PrincipalColumnStyle">
  <a href="#experience">
    <h3 id="experience">Work Experience</h3>
  </a>
  <Timeline timeline={cv.work} />
</section>

<style lang="scss">
  h3 {
    font-size: 1.9rem;
    font-weight: 300;
    font-family: var(--palette-fonts-sans);
    text-transform: uppercase;
    padding-top: 4.15rem;

    @media print {
      font-size: 1.7rem;
      padding-top: 1.5rem;
      margin: 0;
    }
  }

  .IntroStyle {
    margin-top: 2.8rem;
    @media print {
      margin-top: 0;
      margin-bottom: 1.2rem;
    }

    h2 {
      margin: 0;
      font-family: var(--palette-fonts-sans);
      font-size: 2.4rem;
      font-weight: 500;
      @media print {
        font-size: 2.1rem;
      }
    }
    .job {
      margin: 0;
      padding: 0;
      font-family: var(--palette-fonts-sans);
      font-size: 1.6rem;
    }
    .address {
      margin: 9px 0;
      .city {
        font-size: 1.4rem;
        font-weight: 500;
      }
      .country {
        font-size: 1.2rem;
        &::before {
          content: quote(', ');
        }
      }
    }
    .website {
      font-size: 1.3rem;
      @media screen {
        display: none;
      }
      @media print {
        display: inline-block;
      }
    }
    .email {
      font-size: 1.3rem;
      .domain::before {
        content: quote('@');
      }
      @media print {
        display: inline-block;
        &::before {
          content: quote(' - ');
        }
      }
    }
    .phone {
      font-size: 1.3rem;
      @media print {
        display: inline-block;
        &::before {
          content: quote(' - ');
        }
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
    @media print {
      display: none;
    }
  }

  .PrincipalColumnStyle {
    clear: both;
    padding-top: 1px;
    @media print {
      padding-top: 0;
    }
  }
</style>
