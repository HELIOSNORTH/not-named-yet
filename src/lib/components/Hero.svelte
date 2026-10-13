<script lang="ts">
	import { brand, heroVideoUrl, type Copy, type Locale } from '#lib/content.ts';

	let { copy, locale, covered }: { copy: Copy; locale: Locale; covered: boolean } = $props();

	let video = $state<HTMLVideoElement>();
	let visible = $state(false);
	let playing = $state(false);
	let userPaused = $state(false);
	let introDone = $state(false);

	const lines = $derived(
		copy.headline.flatMap((sentence, s) => sentence.map((word) => ({ word, s })))
	);

	$effect(() => {
		userPaused = matchMedia('(prefers-reduced-motion: reduce)').matches;
	});

	$effect(() => {
		if (!video) return;
		if (userPaused || covered) video.pause();
		else video.play().catch(() => (playing = false));
	});

	$effect(() => {
		const timer = setTimeout(() => (introDone = true), 2600);
		return () => clearTimeout(timer);
	});
</script>

<section id="top" class="hero" aria-labelledby="hero-title">
	<div class="stage">
		<div class="backdrop" aria-hidden="true"></div>
		<video
			bind:this={video}
			class:visible
			src={heroVideoUrl}
			autoplay
			muted
			loop
			playsinline
			preload="auto"
			disablepictureinpicture
			disableremoteplayback
			aria-hidden="true"
			tabindex="-1"
			onloadeddata={() => (visible = true)}
			onplaying={() => ((visible = true), (playing = true))}
			onpause={() => (playing = false)}
		></video>
		<div class="scrim" aria-hidden="true"></div>
		<div class="grain" aria-hidden="true"></div>
		<div class="dim" aria-hidden="true"></div>

		<div class="content">
			{#key locale}
				<h1 id="hero-title" class="headline" class:replayed={introDone}>
					{#each lines as line, index (index)}
						<span class="mask">
							<span class="line" class:muted={line.s === 1} style:--i={index}>{line.word}</span>
						</span>{' '}
					{/each}
				</h1>
			{/key}

			<div class="footer">
				<p class="lockup">
					<span class="brand">{brand}</span>
					<span class="caps discipline">{copy.discipline}</span>
				</p>
				<button
					type="button"
					class="glass toggle"
					aria-label={playing ? copy.pauseVideo : copy.playVideo}
					onclick={() => (userPaused = playing)}
				>
					<svg viewBox="0 0 16 16" width="14" height="14" aria-hidden="true">
						{#if playing}
							<rect x="3.5" y="2.5" width="3" height="11" rx="1" />
							<rect x="9.5" y="2.5" width="3" height="11" rx="1" />
						{:else}
							<path
								d="M4.5 3.2v9.6a1 1 0 0 0 1.52.85l7.7-4.8a1 1 0 0 0 0-1.7l-7.7-4.8A1 1 0 0 0 4.5 3.2Z"
							/>
						{/if}
					</svg>
				</button>
			</div>
		</div>
	</div>
</section>

<style>
	.hero {
		position: sticky;
		top: 0;
		height: 100svh;
		min-height: 34rem;
		background: #000;
		color: #fff;
	}

	.stage {
		position: absolute;
		inset: 0;
		overflow: hidden;
		transform-origin: 50% 0%;
		transform: scale(calc(1 - var(--cover, 0) * 0.07));
		border-radius: calc(var(--cover, 0) * 2.5rem);
		will-change: transform;
	}

	.backdrop,
	video,
	.scrim,
	.grain,
	.dim {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.backdrop {
		background:
			radial-gradient(70% 55% at 72% 32%, rgb(74 116 168 / 0.5), transparent 70%),
			radial-gradient(55% 45% at 18% 85%, rgb(196 142 92 / 0.22), transparent 70%),
			linear-gradient(180deg, #0b1220 0%, #05070b 100%);
	}

	video {
		object-fit: cover;
		opacity: 0;
		transform: scale(1.08);
		transition:
			opacity 1.8s var(--ease-out),
			transform 3.2s var(--ease-out);
	}

	video.visible {
		opacity: 1;
		transform: scale(1);
	}

	.scrim {
		background:
			linear-gradient(0deg, rgb(0 0 0 / 0.78) 0%, rgb(0 0 0 / 0.32) 34%, rgb(0 0 0 / 0) 62%),
			linear-gradient(90deg, rgb(0 0 0 / 0.42) 0%, rgb(0 0 0 / 0) 58%),
			linear-gradient(180deg, rgb(0 0 0 / 0.42) 0%, rgb(0 0 0 / 0) 20%);
	}

	.grain {
		opacity: 0.09;
		mix-blend-mode: overlay;
		background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='180' height='180'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E");
	}

	.dim {
		background: #000;
		opacity: calc(var(--cover, 0) * 0.55);
		pointer-events: none;
	}

	.content {
		position: absolute;
		inset: 0;
		display: flex;
		flex-direction: column;
		justify-content: flex-end;
		padding: calc(var(--header-top) + 5rem) var(--gutter)
			max(env(safe-area-inset-bottom), clamp(1.25rem, 3.5vw, 2.75rem));
		transform: translateY(calc(var(--cover, 0) * -6svh));
		opacity: calc(1 - var(--cover, 0) * 1.4);
	}

	.headline {
		display: flex;
		flex-direction: column;
		font-size: min(9.6svh, 12.6vw, 8.5rem);
		font-weight: 600;
		line-height: 0.93;
		letter-spacing: -0.045em;
		hyphens: manual;
		overflow-wrap: break-word;
		text-shadow: 0 2px 40px rgb(0 0 0 / 0.25);
	}

	.mask {
		display: block;
		overflow: clip;
		padding: 0.04em 0.06em 0.1em 0;
		margin-bottom: -0.1em;
	}

	.line {
		display: block;
		animation: rise 1.5s var(--ease-out) both;
		animation-delay: calc(0.55s + var(--i) * 85ms);
	}

	.replayed .line {
		animation-delay: calc(var(--i) * 60ms);
	}

	.line.muted {
		color: rgb(255 255 255 / 0.56);
	}

	.footer {
		display: flex;
		align-items: flex-end;
		justify-content: space-between;
		gap: 1.5rem;
		margin-top: clamp(1.75rem, 5svh, 3.5rem);
		padding-top: clamp(1rem, 2.4svh, 1.5rem);
		border-top: 0.5px solid rgb(255 255 255 / 0.22);
		animation: fade-up 1.4s var(--ease-out) 1.35s both;
	}

	.lockup {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
	}

	.brand {
		font-size: clamp(1.375rem, 2.2vw, 1.75rem);
		font-weight: 700;
		letter-spacing: -0.035em;
		line-height: 1;
	}

	.discipline {
		color: rgb(255 255 255 / 0.68);
	}

	@media (max-width: 30rem) {
		.discipline {
			letter-spacing: 0.14em;
		}
	}

	.toggle {
		flex: none;
	}

	.toggle svg {
		fill: currentColor;
	}

	@keyframes rise {
		from {
			transform: translate3d(0, 108%, 0);
			opacity: 0;
			filter: blur(10px);
		}
		60% {
			filter: blur(0);
		}
	}

	@keyframes fade-up {
		from {
			opacity: 0;
			transform: translateY(0.75rem);
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.stage,
		.content {
			transform: none;
		}

		.line,
		.footer {
			animation: none;
		}

		video {
			transform: none;
			transition: opacity 0.6s linear;
		}
	}
</style>
