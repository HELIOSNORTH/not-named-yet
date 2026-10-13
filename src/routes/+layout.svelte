<script lang="ts">
	import './layout.css';
	import { page } from '$app/state';
	import Site from '#lib/components/Site.svelte';
	import { content, localeFromPath, localePaths, siteUrl, socialImage } from '#lib/content.ts';
	import type { LayoutProps } from './$types';

	let { children }: LayoutProps = $props();

	const locale = $derived(localeFromPath(page.url.pathname));
	const copy = $derived(content[locale]);

	const structuredData = {
		'@context': 'https://schema.org',
		'@type': ['Organization', 'ProfessionalService'],
		name: 'Hartmann Software',
		url: siteUrl + '/',
		email: 'sales@hartmannsoft.com',
		telephone: '+45 60 60 97 46',
		logo: siteUrl + '/favicon.png',
		vatID: 'DK40076409',
		address: {
			'@type': 'PostalAddress',
			streetAddress: 'Roms Hule 5, 2.',
			postalCode: '7100',
			addressLocality: 'Vejle',
			addressCountry: 'DK'
		}
	};

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
	<meta property="og:image" content={socialImage} />
	<meta property="og:image:width" content="1200" />
	<meta property="og:image:height" content="675" />
	<meta name="twitter:card" content="summary_large_image" />
	<meta name="robots" content="index, follow, max-image-preview:large" />
	{@html `<script type="application/ld+json">${JSON.stringify(structuredData)}</script>`}
</svelte:head>

<Site {locale} />
{@render children()}
