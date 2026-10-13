<script lang="ts">
	import { localePaths, type Copy, type Locale } from '#lib/content.ts';

	let { copy, locale }: { copy: Copy; locale: Locale } = $props();

	const languages: { code: Locale; label: string }[] = [
		{ code: 'en', label: 'EN' },
		{ code: 'da', label: 'DA' }
	];
</script>

<header class="header">
	<a class="monogram" href="#top" aria-label={copy.homeLabel}>H</a>
	<nav class="nav" aria-label="Primary">
		<div class="languages" role="group" aria-label={copy.languageLabel}>
			{#each languages as language, index (language.code)}
				{#if index > 0}<i aria-hidden="true">·</i>{/if}
				<a
					href={localePaths[language.code]}
					hreflang={language.code}
					aria-current={language.code === locale ? 'true' : undefined}
					data-sveltekit-noscroll
					data-sveltekit-replacestate>{language.label}</a
				>
			{/each}
		</div>
		<a class="consult" href="#correspondence"><span>{copy.consult}</span></a>
	</nav>
</header>

<style>
	.header {
		position: fixed;
		top: 0;
		left: 0;
		right: 0;
		z-index: 60;
		display: flex;
		align-items: center;
		justify-content: space-between;
		padding: var(--header-pad) var(--gutter);
		color: #fff;
		mix-blend-mode: difference;
		pointer-events: none;
	}

	.header a {
		pointer-events: auto;
	}

	:global(html[data-hartmann-entrance='waiting']) .header {
		opacity: 0;
	}

	:global(html[data-hartmann-entrance='ready']) .header {
		animation: header-in 1.6s var(--ease-out) both;
	}

	@keyframes header-in {
		from {
			opacity: 0;
		}
	}

	.monogram {
		display: flex;
		align-items: center;
		justify-content: center;
		width: 36px;
		height: 38px;
		font: 400 32px/1 var(--serif);
	}

	.nav {
		display: flex;
		align-items: center;
		gap: clamp(18px, 2.8vw, 42px);
		font-size: 11px;
		font-weight: 500;
		letter-spacing: 0.2em;
		text-transform: uppercase;
	}

	.languages {
		display: flex;
		align-items: center;
		gap: 0.75em;
	}

	.languages a {
		padding: 6px 0;
		opacity: 0.45;
		transition: opacity 0.4s;
	}

	.languages a:hover,
	.languages a[aria-current] {
		opacity: 1;
	}

	.languages i {
		font-style: normal;
		opacity: 0.45;
	}

	.consult {
		position: relative;
		isolation: isolate;
		display: inline-flex;
		align-items: center;
		height: 38px;
		padding: 0 19px 0 calc(0.2em + 19px);
		overflow: hidden;
		border: 1px solid;
		border-radius: 99px;
		transition: color 0.6s var(--ease-out);
	}

	.consult::before {
		content: '';
		position: absolute;
		inset: -1px;
		z-index: -1;
		background: #fff;
		transform: translateY(102%);
		transition: transform 0.7s var(--ease-out);
	}

	.consult:hover {
		color: #000;
	}

	.consult:hover::before {
		transform: none;
	}
</style>
