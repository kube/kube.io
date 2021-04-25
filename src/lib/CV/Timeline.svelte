<script lang="ts">
  import marked from 'marked';

  type TimelineItem = {
    date: string | number;
    title: string;
    place?: string;
    subtitle: string;
    url?: string;
    description?: string;
    stack?: string[];
  };

  export let timeline: TimelineItem[];
</script>

<ul>
  {#each timeline as line}
    <li>
      <div class="date">{line.date}</div>
      <div class="content">
        <a href={line.url} target="_blank">
          <span class="title">{line.title}</span>
        </a>
        {#if line.place}
          <span class="place">{line.place}</span>
        {/if}
        <span class="subtitle">{line.subtitle}</span>

        {#if line.description}
          <div class="description">
            {@html marked(line.description)}
          </div>
        {/if}

        {#if line.stack}
          <ul class="stack-list">
            {#each line.stack as item}
              <li>{item}</li>
            {/each}
          </ul>
        {/if}
      </div>
    </li>
  {/each}
</ul>

<style lang="scss">
  ul {
    margin: 0;
    padding: 0;

    li {
      clear: both;
      display: block;
      margin: 0;
      padding: 0;
      margin-top: 1rem;
      margin-bottom: 2.4rem;
      @media print {
        margin-top: 0.8rem;
        margin-bottom: 1.8rem;
        break-inside: avoid;
      }

      .date {
        float: left;
        text-align: right;
        padding-top: 0.35rem;
        margin-right: 0.85rem;
        width: 6rem;
        font-size: 1.25rem;
        font-weight: 400;
        font-family: var(--palette-fonts-text);
        opacity: 0.7;
        @media print {
          width: 5.8rem;
          font-size: 1.2rem;
        }
      }

      .content {
        width: auto;
        overflow: hidden;

        .title {
          font-size: 1.6rem;
          font-weight: 700;
          font-family: var(--palette-fonts-sans);
          @media print {
            font-weight: 600;
            font-size: 1.5rem;
          }
        }

        .place {
          font-size: 1.4rem;
          font-family: var(--palette-fonts-text);

          &::before {
            content: quote(' ');
          }
          @media print {
            font-size: 1.3rem;
            &::before {
              content: quote(' – ');
            }
          }
        }

        .subtitle {
          display: block;
          margin-top: 0.15rem;
          font-family: var(--palette-fonts-text);
          font-size: 1.4rem;
          @media print {
            font-size: 1.3rem;
          }
        }
        .description {
          font-size: 1.05rem;

          :global(p) {
            margin: 0.55rem 0;
          }
          @media print {
            font-size: 1rem;
            line-height: 1.1rem;
            :global(p) {
              margin: 0.4rem 0;
            }
          }
        }
        .stack-list {
          padding: 0;
          margin: 0;

          li {
            border: 1px solid #cccccc;
            border-radius: 3px;
            font-size: 0.7rem;
            display: inline-block;
            margin: 2px;
            padding: 2px 3px;
            text-transform: uppercase;
          }
        }
      }
    }
  }
</style>
