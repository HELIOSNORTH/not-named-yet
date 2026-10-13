<script lang="ts">
	import { localePaths, type Copy, type Locale } from '#lib/content.ts';

	let { copy, locale, tone }: { copy: Copy; locale: Locale; tone: 'night' | 'paper' } = $props();

	const languages: { code: Locale; label: string }[] = [
		{ code: 'en', label: 'EN' },
		{ code: 'da', label: 'DA' }
	];
</script>

<header class="header">
	<a class="glass monogram" data-tone={tone} href="#top" aria-label={copy.homeLabel}>H</a>

	<div class="actions">
		<nav class="glass languages" data-tone={tone} aria-label={copy.languageLabel}>
			{#each languages as language, index (language.code)}
				{#if index > 0}<span class="separator" aria-hidden="true">·</span>{/if}
				<a
					href={localePaths[language.code]}
					hreflang={language.code}
					lang={language.code}
					aria-current={language.code === locale ? 'true' : undefined}
					data-sveltekit-noscroll
					data-sveltekit-replacestate>{language.label}</a
				>
			{/each}
		</nav>
		<a class="glass consult caps" data-tone={tone} href="#contact">{copy.consult}</a>
	</div>
</header>

<style>
	.header {
		position: fixed;
		inset-inline: 0;
		top: 0;
		z-index: 50;
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 0.75rem;
		padding: var(--header-top) var(--gutter) 0;
		pointer-events: none;
		animation: header-in 1.4s var(--ease-out) 1.1s both;
	}

	.header > :global(*) {
		pointer-events: auto;
	}

	.monogram {
		width: 2.75rem;
		height: 2.75rem;
		border-radius: 0.95rem;
		font-size: 1.1875rem;
		font-weight: 700;
		letter-spacing: -0.02em;
	}

	.actions {
		display: flex;
		align-items: center;
		gap: 0.5rem;
	}

	.languages {
		gap: 0.125rem;
		padding-inline: 0.375rem;
		font-size: 0.75rem;
		font-weight: 600;
		letter-spacing: 0.14em;
	}

	.languages a {
		display: grid;
		place-items: center;
		min-width: 2.25rem;
		min-height: 2.75rem;
		padding-left: 0.14em;
		opacity: 0.5;
		transition: opacity 0.4s var(--ease-out);
	}

	.languages a:hover,
	.languages a[aria-current] {
		opacity: 1;
	}

	.separator {
		opacity: 0.45;
	}

	.consult {
		padding-inline: 1.25rem 1.1rem;
		letter-spacing: 0.2em;
	}

	@keyframes header-in {
		from {
			opacity: 0;
			transform: translateY(-0.75rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.header {
			animation: none;
		}
	}
</style>
