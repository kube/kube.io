<script lang="ts">
	import NavbarLink from './NavbarLink.svelte';
</script>

<nav>
	<ul>
		<li><NavbarLink path="/">Hello</NavbarLink></li>
		<li><NavbarLink path="/projects">Projects</NavbarLink></li>
		<li><NavbarLink path="/cv">CV</NavbarLink></li>
	</ul>
</nav>

<style lang="scss">
	nav {
		position: fixed;
		display: inline-block;
		transform: rotate(90deg);
		transform-origin: 0 51%;
		margin-left: -61px;
		margin-top: 13px;

		ul {
			list-style: none;
			margin: 0;
			padding: 0;
		}

		li {
			font-size: 22px;
			font-weight: 700;
			font-family: var(--palette-fonts-sans);
			text-transform: uppercase;
			display: inline-block;
			margin: 0;
			padding: 4px 11px;
		}
	}
</style>
