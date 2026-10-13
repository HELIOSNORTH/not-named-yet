<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import Site from '#lib/components/Site.svelte';
	import { content, localeFromPath, localePaths, siteUrl } from '#lib/content.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const locale = $derived(localeFromPath(page.url.pathname));
	const copy = $derived(content[locale]);

	$effect(() => {
		document.documentElement.lang = locale;
	});
</script>

<svelte:head>
	<title>{copy.title}</title>
	<meta name="description" content={copy.description} />
	<link rel="canonical" href={siteUrl + localePaths[locale]} />
	<link rel="alternate" hreflang="en" href={siteUrl + localePaths.en} />
	<link rel="alternate" hreflang="da" href={siteUrl + localePaths.da} />
	<link rel="alternate" hreflang="x-default" href={siteUrl + localePaths.en} />
	<meta property="og:type" content="website" />
	<meta property="og:site_name" content="Hartmann Software" />
	<meta property="og:title" content={copy.title} />
	<meta property="og:description" content={copy.description} />
	<meta property="og:url" content={siteUrl + localePaths[locale]} />
	<meta property="og:locale" content={copy.ogLocale} />
	<meta property="og:image" content={siteUrl + '/og.jpg'} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="630" />
	<meta name="twitter:card" content="summary_large_image" />
</svelte:head>

<Site {locale} />
{@render children()}
