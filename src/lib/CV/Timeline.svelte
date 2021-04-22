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
			margin-top: 13px;
			margin-bottom: 31px;
			break-inside: avoid;

			.date {
				float: left;
				text-align: right;
				padding-top: 6px;
				margin-right: 11px;
				width: 79px;
				font-size: 16px;
				font-weight: 400;
				font-family: var(--palette-fonts-text);
				opacity: 0.7;
			}
			.content {
				width: auto;
				overflow: hidden;

				.title {
					font-size: 21px;
					font-weight: 700;
					font-family: var(--palette-fonts-sans);
				}
				.place {
					font-size: 18px;
					font-family: var(--palette-fonts-text);

					&::before {
						content: quote(' ');
					}
				}
				.subtitle {
					display: block;
					margin-top: 2px;
					font-family: var(--palette-fonts-text);
					font-size: 18px;
				}
				.description {
					font-size: 14px;

					:global(p) {
						margin: 7px 0;
					}
				}
				.stack-list {
					padding: 0;
					margin: 0;

					li {
						border: 1px solid #cccccc;
						border-radius: 3px;
						font-size: 9px;
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
