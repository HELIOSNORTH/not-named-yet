<script lang="ts">
	import { content, type Locale } from '#lib/content.ts';
	import Correspondence from './Correspondence.svelte';
	import Header from './Header.svelte';
	import Hero from './Hero.svelte';

	let { locale }: { locale: Locale } = $props();

	const copy = $derived(content[locale]);
</script>

<div class="grain" aria-hidden="true"></div>
<Header {copy} {locale} />
<main>
	<Hero {copy} {locale} />
	<Correspondence {copy} />
</main>

<style>
	.grain {
		position: fixed;
		inset: 0;
		z-index: 90;
		opacity: 0.06;
		pointer-events: none;
		background: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.8' numOctaves='3' stitchTiles='stitch'/%3E%3CfeColorMatrix type='saturate' values='0'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}
</style>
