<script lang="ts">
	import { brand, film, type Copy, type Locale } from '#lib/content.ts';
	import { createGlass, type Glass } from '#lib/glass/glass.ts';
	import { frameFilm } from '#lib/glass/framing.ts';
	import { attachFilm } from '#lib/glass/film.ts';

	let { copy, locale }: { copy: Copy; locale: Locale } = $props();

	let section = $state<HTMLElement>();
	let stage = $state<HTMLElement>();
	let video = $state<HTMLVideoElement>();
	let canvas = $state<HTMLCanvasElement>();

	let glassReady = $state(false);
	let blocked = $state(false);
	let positionY = $state(0.9);
	let horizon = $state(0.33);
	let progress = $state(0);

	const layout = $derived(horizon > 0.55 ? 'above' : 'below');
	const textOut = $derived(Math.min(1, progress / 0.2));

	const wordIndex = (lines: Copy['wide'], line: number, word: number) =>
		lines.slice(0, line).reduce((sum, l) => sum + l.length, 0) + word;

	$effect(() => {
		if (!section || !stage || !video || !canvas) return;
		const sectionEl = section;
		const stageEl = stage;
		const videoEl = video;
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		const poster = new Image();
		poster.crossOrigin = 'anonymous';
		poster.src = film.poster;

		const glass: Glass | null = createGlass(canvas, { video: videoEl, poster });
		glassReady = !!glass;

		const play = () => {
			if (still) return;
			videoEl.play().then(
				() => (blocked = false),
				(error: DOMException) => {
					if (error.name === 'NotAllowedError') blocked = true;
				}
			);
		};
		const detachFilm = attachFilm(videoEl, play);
		if (still) blocked = true;

		let visible = true;
		let edge = 0;
		let horizonY = 0.33;

		const layoutFilm = () => {
			const width = stageEl.clientWidth;
			const height = stageEl.clientHeight;
			const target = width / height > 1 ? 0.31 : 0.4;
			const frame = frameFilm(width, height, film, target);
			positionY = frame.positionY;
			horizon = horizonY = frame.horizon;
			glass?.resize(width, height, frame.framing);
		};

		const syncLoop = () => {
			if (!glass) return;
			if (visible && edge < 1.02) glass.start();
			else glass.stop();
		};

		const measure = () => {
			const rect = sectionEl.getBoundingClientRect();
			const travel = Math.max(1, rect.height - innerHeight);
			const scrolled = Math.min(1, Math.max(0, -rect.top / travel));
			progress = scrolled;
			const roll = Math.min(1, Math.max(0, (scrolled - 0.04) / 0.58));
			edge = (roll < 0.5 ? 2 * roll * roll : 1 - Math.pow(-2 * roll + 2, 2) / 2) * 1.08;
			glass?.setEdge(edge);
			syncLoop();
		};

		const entrance = () => {
			if (!glass) return;
			glass.beginIntro(still);
			if (still) glass.clearBand(horizonY);
			else setTimeout(() => glass.autoWipe(horizonY, 1700), 700);
		};

		layoutFilm();
		measure();
		if (document.documentElement.dataset.hartmannEntrance === 'ready') entrance();
		else addEventListener('hartmann:entrance', entrance, { once: true });

		let frame = 0;
		const onScroll = () => {
			frame ||= requestAnimationFrame(() => {
				frame = 0;
				measure();
			});
		};
		const onResize = () => {
			layoutFilm();
			measure();
		};
		const wipeAt = (x: number, y: number) => {
			if (!glass || edge >= 1.02) return;
			glass.wipe(x, y - stageEl.getBoundingClientRect().top);
		};
		const onPointer = (event: PointerEvent) => {
			if (event.pointerType !== 'touch') wipeAt(event.clientX, event.clientY);
		};
		const onTouch = (event: TouchEvent) => {
			for (const touch of event.touches) wipeAt(touch.clientX, touch.clientY);
		};

		const observer = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (visible) play();
			else videoEl.pause();
			syncLoop();
		});
		observer.observe(sectionEl);

		addEventListener('scroll', onScroll, { passive: true });
		addEventListener('resize', onResize, { passive: true });
		stageEl.addEventListener('pointermove', onPointer, { passive: true });
		stageEl.addEventListener('touchmove', onTouch, { passive: true });
		stageEl.addEventListener('touchstart', onTouch, { passive: true });

		return () => {
			cancelAnimationFrame(frame);
			observer.disconnect();
			removeEventListener('scroll', onScroll);
			removeEventListener('resize', onResize);
			removeEventListener('hartmann:entrance', entrance);
			stageEl.removeEventListener('pointermove', onPointer);
			stageEl.removeEventListener('touchmove', onTouch);
			stageEl.removeEventListener('touchstart', onTouch);
			detachFilm();
			glass?.destroy();
		};
	});
</script>

<section bind:this={section} class="hero" id="top" aria-label="Hartmann Software">
	<div bind:this={stage} class="stage" data-layout={layout} style:--horizon={horizon}>
		<video
			bind:this={video}
			class="film"
			poster={film.poster}
			crossorigin="anonymous"
			muted
			loop
			playsinline
			preload="auto"
			disablepictureinpicture
			disableremoteplayback
			aria-hidden="true"
			tabindex="-1"
			style:object-position="50% {positionY * 100}%"
		></video>
		<div class="frost" class:hidden={glassReady} aria-hidden="true"></div>
		<canvas bind:this={canvas} class="glass" aria-hidden="true"></canvas>

		<div class="frame" style:opacity={1 - textOut} style:translate="0 {textOut * -36}px">
			{#key locale}
				<h1 class="headline" aria-label={copy.headline}>
					{#each [{ lines: copy.wide, variant: 'wide' as const }, { lines: copy.narrow, variant: 'narrow' as const }] as { lines, variant } (variant)}
						<span class="variant {variant}" aria-hidden="true">
							{#each lines as line, l (l)}
								<span class="line" class:second={l === copy.secondSentenceLine[variant]}>
									{#each line as word, i (i)}
										<span class="mask" class:italic={word.italic}
											><span class="word" style:--i={wordIndex(lines, l, i)}>{word.text}</span
											></span
										>
									{/each}
								</span>
							{/each}
						</span>
					{/each}
				</h1>
			{/key}

			<div class="lockup label">
				<div class="name">
					<b>{brand}</b>
					<span>{copy.discipline}</span>
				</div>
				<span class="scroll-line" aria-hidden="true"></span>
			</div>
		</div>

		{#if blocked}
			<button class="play" type="button" onclick={() => video?.play().then(() => (blocked = false))}
				>{copy.playFilm}</button
			>
		{/if}
	</div>
</section>

<style>
	.hero {
		position: relative;
		height: 260lvh;
	}

	.stage {
		position: sticky;
		top: 0;
		height: 100lvh;
		overflow: hidden;
		background: var(--paper);
		touch-action: pan-y;
	}

	.film,
	.frost,
	.glass {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	.film {
		object-fit: cover;
		background: var(--paper);
	}

	.frost {
		--band: calc(var(--horizon) * 100%);
		background: rgb(239 235 228 / 0.55);
		-webkit-backdrop-filter: blur(18px) saturate(0.9);
		backdrop-filter: blur(18px) saturate(0.9);
		mask-image: linear-gradient(
			#000 calc(var(--band) - 16%),
			transparent calc(var(--band) - 7%),
			transparent calc(var(--band) + 7%),
			#000 calc(var(--band) + 16%)
		);
	}

	.frost.hidden {
		display: none;
	}

	.frame {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-rows: 1fr auto auto;
		padding: 0 var(--gutter) clamp(20px, 3vw, 38px);
		pointer-events: none;
	}

	[data-layout='above'] .frame {
		grid-template-rows: auto 1fr auto;
		padding-top: calc(var(--header-pad) * 2 + 38px + 3vh);
	}

	.headline {
		grid-row: 2;
		margin-bottom: clamp(34px, 8.5vh, 110px);
		font: 400 clamp(40px, 6.6vw, 118px) / 1.02 var(--serif);
		letter-spacing: -0.014em;
	}

	[data-layout='above'] .headline {
		grid-row: 1;
		margin-bottom: 0;
	}

	.variant {
		display: block;
	}

	.narrow {
		display: none;
	}

	.line {
		display: flex;
		gap: 0.25em;
		width: max-content;
		white-space: nowrap;
	}

	.line.second {
		margin-top: 0.14em;
	}

	.mask {
		display: inline-block;
		margin: -0.14em -0.1em -0.2em;
		padding: 0.14em 0.1em 0.2em;
		overflow: hidden;
		vertical-align: top;
	}

	.mask.italic {
		font-style: italic;
	}

	.word {
		display: inline-block;
		transform: translateY(135%);
	}

	:global(html[data-hartmann-entrance='ready']) .word {
		transform: none;
		transition: transform 1.5s var(--ease-out) calc(var(--i) * 60ms + 0.1s);
	}

	.lockup {
		grid-row: 3;
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		align-items: end;
		opacity: 0;
		transition: opacity 1.4s var(--ease-out) 0.5s;
	}

	:global(html[data-hartmann-entrance='ready']) .lockup {
		opacity: 1;
	}

	.name b {
		display: block;
		margin-bottom: 0.5em;
		font: 400 clamp(22px, 1.85vw, 28px) / 1 var(--serif);
		letter-spacing: -0.005em;
		text-transform: none;
	}

	.name span {
		opacity: 0.6;
	}

	.scroll-line {
		position: relative;
		justify-self: center;
		width: 1px;
		height: 48px;
		overflow: hidden;
	}

	.scroll-line::before,
	.scroll-line::after {
		content: '';
		position: absolute;
		left: 0;
		width: 1px;
		background: currentColor;
	}

	.scroll-line::before {
		top: 0;
		height: 100%;
		opacity: 0.18;
	}

	.scroll-line::after {
		top: -40%;
		height: 40%;
		animation: scroll-cue 2.6s var(--ease-in-out) infinite;
	}

	@keyframes scroll-cue {
		to {
			transform: translateY(350%);
		}
	}

	.play {
		position: absolute;
		right: var(--gutter);
		bottom: 90px;
		z-index: 8;
		padding: 10px 16px;
		border: 1px solid;
		border-radius: 99px;
		background: var(--paper);
		color: var(--ink);
		font-size: 11px;
		letter-spacing: 0.12em;
		text-transform: uppercase;
		cursor: pointer;
	}

	@media (width <= 759px) {
		.wide {
			display: none;
		}

		.narrow {
			display: block;
		}

		.headline {
			font-size: clamp(40px, 11.2vw, 64px);
		}

		.lockup {
			grid-template-columns: 1fr auto;
		}

		.scroll-line {
			justify-self: end;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.word {
			transform: none;
		}

		.lockup {
			opacity: 1;
		}
	}
</style>
