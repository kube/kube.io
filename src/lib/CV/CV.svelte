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
			<span class="user">{cv.mail.user}</span><span class="domain">{cv.mail.domain}</span>
		</div>

		<div class="phone">
			{cv.phone.replace(/[0-9][0-9]/g, _ => _ + ' ')}
		</div>
	</div>

	<div class="InfoColumnsStyle">
		<div class="column">
			<h3>Code</h3>
			<ul>
				{#each cv.languages as language}
					<li>{language}</li>
				{/each}
			</ul>
		</div>

		<div class="column">
			<h3>Stack</h3>
			<ul>
				{#each cv.frameworks as framework}
					<li>{framework}</li>
				{/each}
			</ul>
		</div>

		<div class="column">
			<h3>Tools</h3>
			<ul>
				{#each cv.tools as tool}
					<li>{tool}</li>
				{/each}
			</ul>
		</div>
	</div>

	<div class="PrincipalColumnStyle">
		<h3>Cursus</h3>
		<Timeline timeline={cv.cursus} />

		<h3>Work Experience</h3>
		<Timeline timeline={cv.work} />
	</div>
</section>

<style lang="scss">
	section {
		margin: 0 auto;
		margin-bottom: 130px;

		h1 {
			font-family: var(--palette-fonts-sans);
			font-weight: 700;
			font-size: 74px;
			margin: 0;
			padding: 0;
			margin-top: 27px;
			line-height: 67px;
		}

		h3 {
			font-size: 25px;
			font-weight: 300;
			font-family: var(--palette-fonts-sans);
			text-transform: uppercase;
			margin-top: 54px;
			margin-bottom: 13px;
		}

		.IntroStyle {
			margin-top: 36px;
			h2 {
				font-family: var(--palette-fonts-sans);
				font-size: 34px;
				margin: 0;
				padding: 0;
			}
			.job {
				font-family: var(--palette-fonts-sans);
				font-size: 24px;
				margin: 0;
				padding: 0;
			}
			.address {
				margin: 9px 0;
				.city {
					font-size: 18px;
					font-weight: 500;
				}
				.country {
					&::before {
						content: quote(', ');
					}
				}
			}
			.email {
				font-size: 17px;
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
						font-size: 18px;
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
