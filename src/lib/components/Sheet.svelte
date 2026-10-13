<script lang="ts">
	import { brand, contact, heroVideoUrl, type Copy } from '#lib/content.ts';
	import { fitWidth } from '#lib/fit-width.ts';

	let {
		copy,
		sheet = $bindable(),
		reading = $bindable()
	}: { copy: Copy; sheet?: HTMLElement; reading?: HTMLElement } = $props();

	let wordmark = $state<HTMLElement>();
	let wordmarkVideo = $state<HTMLVideoElement>();

	const wordCount = $derived(copy.headline.flat().length);

	const mailto = $derived(
		`mailto:${contact.email}?subject=${encodeURIComponent(copy.mailSubject)}`
	);

	$effect(() => {
		if (!wordmark || !wordmarkVideo) return;
		const videoEl = wordmarkVideo;
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const observer = new IntersectionObserver(
			([entry]) => {
				if (!entry.isIntersecting) return videoEl.pause();
				videoEl.preload = 'auto';
				if (!still) videoEl.play().catch(() => {});
			},
			{ rootMargin: '25% 0px' }
		);
		observer.observe(wordmark);
		return () => observer.disconnect();
	});
</script>

<section bind:this={sheet} class="sheet" aria-label={contact.company}>
	<div class="grabber" aria-hidden="true"></div>

	<div bind:this={reading} class="reading">
		<div class="pin">
			<p class="statement" style:--n={wordCount}>
				{#each copy.headline as sentence, s (s)}
					<span class="sentence">
						{#each sentence as word, w (w)}
							<span class="word" style:--i={s * copy.headline[0].length + w}>{word}</span>{' '}
						{/each}
					</span>
				{/each}
			</p>
		</div>
	</div>

	<div class="signature">
		<div bind:this={wordmark} class="wordmark" role="img" aria-label={brand}>
			<video
				bind:this={wordmarkVideo}
				src={heroVideoUrl}
				muted
				loop
				playsinline
				preload="none"
				disablepictureinpicture
				disableremoteplayback
				aria-hidden="true"
				tabindex="-1"
			></video>
			<span class="knockout" aria-hidden="true" {@attach fitWidth}><span>{brand}</span></span>
		</div>
		<p class="caps discipline">{copy.discipline}</p>
	</div>

	<div id="contact" class="contact">
		<a class="consult caps" href={mailto}>
			<span>{copy.consult}</span>
			<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
				<path d="M4.5 11.5l7-7M5.5 4.5h6v6" />
			</svg>
		</a>
		<div class="channels">
			<a href={mailto}>{contact.email}</a>
			<a href={contact.phoneHref}>{contact.phone}</a>
		</div>
	</div>

	<footer class="caps legal">
		<span>{contact.company}</span>
		<span>{copy.address}</span>
		<span>{contact.registration}</span>
	</footer>
</section>

<style>
	.sheet {
		position: relative;
		z-index: 1;
		background: var(--paper);
		color: var(--ink);
		border-radius: clamp(1.75rem, 3vw, 2.75rem) clamp(1.75rem, 3vw, 2.75rem) 0 0;
		box-shadow: 0 -2rem 6rem rgb(0 0 0 / 0.45);
		padding-bottom: max(env(safe-area-inset-bottom), 1.5rem);
	}

	.grabber {
		position: absolute;
		top: 0.625rem;
		left: 50%;
		width: 2.25rem;
		height: 0.3125rem;
		border-radius: 999px;
		background: var(--hairline);
		translate: -50% 0;
	}

	.reading {
		height: 230svh;
	}

	.pin {
		position: sticky;
		top: 0;
		display: grid;
		align-items: center;
		height: 100svh;
		padding-inline: var(--gutter);
	}

	.statement {
		max-width: 12.5em;
		font-size: clamp(2.5rem, 7.2vw, 7.25rem);
		font-weight: 600;
		line-height: 1;
		letter-spacing: -0.045em;
		hyphens: manual;
		text-wrap: balance;
	}

	.word {
		opacity: clamp(0.13, calc(var(--read, 1) * (var(--n) + 2) - var(--i)), 1);
		transition: opacity 0.25s linear;
	}

	.sentence {
		display: block;
	}

	.sentence + .sentence {
		margin-top: 0.18em;
	}

	.signature {
		padding: clamp(4rem, 14svh, 9rem) var(--gutter) 0;
	}

	.wordmark {
		position: relative;
		isolation: isolate;
		overflow: hidden;
	}

	.wordmark video {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
		object-fit: cover;
		transform: scale(1.15);
		background:
			radial-gradient(60% 90% at 70% 30%, #4a74a8, transparent 70%),
			radial-gradient(50% 80% at 20% 80%, #c48e5c, transparent 70%), #0b1220;
	}

	.knockout {
		position: relative;
		display: block;
		font-size: 21vw;
		font-weight: 700;
		line-height: 0.8;
		letter-spacing: -0.055em;
		white-space: nowrap;
		padding: 0.02em 0 0.04em;
		background: #fff;
		color: #000;
		mix-blend-mode: screen;
	}

	.knockout > span {
		padding-right: 0.055em;
	}

	.wordmark::after {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--paper);
		mix-blend-mode: multiply;
		pointer-events: none;
	}

	.discipline {
		margin-top: clamp(1rem, 2.5vw, 1.75rem);
		color: var(--ink-soft);
		letter-spacing: 0.32em;
	}

	.contact {
		display: flex;
		flex-wrap: wrap;
		align-items: flex-end;
		justify-content: space-between;
		gap: 2.5rem 2rem;
		margin: clamp(4rem, 12svh, 8rem) var(--gutter) 0;
		padding-top: clamp(2rem, 5svh, 3rem);
		border-top: 0.5px solid var(--hairline);
		scroll-margin-top: 30svh;
	}

	.consult {
		display: inline-flex;
		align-items: center;
		gap: 0.875rem;
		height: 3.75rem;
		padding-inline: 2rem 1.75rem;
		border-radius: 999px;
		background: var(--ink);
		color: var(--paper);
		font-size: 0.8125rem;
		letter-spacing: 0.22em;
		box-shadow: 0 12px 32px -14px rgb(0 0 0 / 0.55);
		transition:
			transform 0.6s var(--spring),
			box-shadow 0.4s var(--ease-out);
	}

	.consult svg {
		fill: none;
		stroke: currentColor;
		stroke-width: 1.6;
		stroke-linecap: round;
		stroke-linejoin: round;
		transition: transform 0.5s var(--spring);
	}

	.consult:hover {
		transform: translateY(-2px);
		box-shadow: 0 18px 40px -14px rgb(0 0 0 / 0.6);
	}

	.consult:hover svg {
		transform: translate(2px, -2px);
	}

	.consult:active {
		transform: scale(0.96);
		transition-duration: 0.18s;
	}

	.channels {
		display: flex;
		flex-direction: column;
		align-items: flex-start;
		gap: 0.25rem;
		font-size: clamp(1.5rem, 3.4vw, 2.75rem);
		font-weight: 500;
		letter-spacing: -0.03em;
		line-height: 1.15;
	}

	.channels a {
		background: linear-gradient(currentColor, currentColor) 0 100% / 0 1px no-repeat;
		transition: background-size 0.6s var(--ease-out);
	}

	.channels a:hover {
		background-size: 100% 1px;
	}

	.legal {
		display: flex;
		flex-wrap: wrap;
		justify-content: space-between;
		gap: 0.5rem 2rem;
		margin: clamp(4rem, 12svh, 7rem) var(--gutter) 0;
		padding-block: 1.5rem 0.5rem;
		border-top: 0.5px solid var(--hairline);
		color: var(--ink-soft);
		font-size: 0.625rem;
		letter-spacing: 0.18em;
	}

	@media (min-width: 48rem) {
		.channels {
			align-items: flex-end;
		}
	}

	@media (prefers-color-scheme: dark) {
		.sheet {
			box-shadow:
				inset 0 0.5px 0 rgb(255 255 255 / 0.16),
				0 -2rem 6rem rgb(0 0 0 / 0.6);
		}

		.knockout {
			background: #000;
			color: #fff;
			mix-blend-mode: multiply;
		}

		.wordmark::after {
			mix-blend-mode: lighten;
		}

		.wordmark video {
			filter: brightness(1.35) saturate(1.15);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.reading {
			height: auto;
		}

		.pin {
			position: static;
			height: auto;
			padding-block: 8rem 2rem;
		}

		.word {
			opacity: 1;
		}
	}
</style>
