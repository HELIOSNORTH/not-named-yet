<script lang="ts">
	import { brand, film, type Copy, type Locale } from '#lib/content.ts';
	import { attachFilm } from '#lib/film/film.ts';
	import { frameFilm } from '#lib/film/framing.ts';

	let { copy, locale }: { copy: Copy; locale: Locale } = $props();

	type Lines = Copy['wide'];
	type Geometry = { top: number; bottom: number; line: number; height: number; horizon: number };

	let section = $state<HTMLElement>();
	let stage = $state<HTMLElement>();
	let band = $state<HTMLElement>();
	let video = $state<HTMLVideoElement>();
	let spill = $state<HTMLCanvasElement>();

	let blocked = $state(false);
	let positionY = $state(0.82);
	let geometry = $state<Geometry>();
	let story = $state({ expand: 0, titleIn: 0, titleOut: 0, dawn: 0, push: 0 });

	const split = (lines: Lines, at: number) => ({
		inside: lines.slice(0, at),
		outside: lines.slice(at)
	});
	const wide = $derived(split(copy.wide, copy.secondSentenceLine.wide));
	const narrow = $derived(split(copy.narrow, copy.secondSentenceLine.narrow));

	const wordIndex = (lines: Lines, line: number, word: number) =>
		lines.slice(0, line).reduce((sum, l) => sum + l.length, 0) + word;

	const clamp = (value: number) => Math.min(1, Math.max(0, value));
	const segment = (p: number, from: number, to: number) => clamp((p - from) / (to - from));
	const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

	$effect(() => {
		if (!section || !stage || !band || !video || !spill) return;
		const sectionEl = section;
		const stageEl = stage;
		const bandEl = band;
		const videoEl = video;
		const spillEl = spill;
		const spillContext = spillEl.getContext('2d');
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;

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

		let frameY = 0.82;
		let shape: Geometry = { top: 0, bottom: 0, line: 0, height: 1, horizon: 0 };
		let opened = 0;

		const layout = () => {
			const height = stageEl.clientHeight;
			const stageTop = stageEl.getBoundingClientRect().top;
			const rect = bandEl.getBoundingClientRect();
			const top = rect.top - stageTop;
			const bottom = height - (rect.bottom - stageTop);
			const frame = frameFilm(
				stageEl.clientWidth,
				height,
				film,
				(top + rect.height * 0.6) / height
			);
			frameY = frame.positionY;
			shape = { top, bottom, line: top + rect.height / 2, height, horizon: frame.horizon * height };
			positionY = frameY;
			geometry = shape;
		};

		const measure = () => {
			const rect = sectionEl.getBoundingClientRect();
			const travel = Math.max(1, rect.height - innerHeight);
			const p = clamp(-rect.top / travel);
			opened = ease(segment(p, 0, 0.26));
			story = {
				expand: opened,
				titleIn: ease(segment(p, 0.2, 0.42)),
				titleOut: ease(segment(p, 0.6, 0.74)),
				dawn: segment(p, 0.7, 1),
				push: ease(segment(p, 0, 0.9))
			};
		};

		const paintSpill = () => {
			const width = videoEl.videoWidth;
			const height = videoEl.videoHeight;
			if (!spillContext || !width || videoEl.readyState < 2) return;
			const viewWidth = stageEl.clientWidth;
			const viewHeight = shape.height;
			const scale = Math.max(viewWidth / width, viewHeight / height);
			const offsetX = (width * scale - viewWidth) / 2;
			const offsetY = (height * scale - viewHeight) * frameY;
			const top = shape.top * (1 - opened);
			const bottom = viewHeight - shape.bottom * (1 - opened);
			try {
				spillContext.drawImage(
					videoEl,
					offsetX / scale,
					(top + offsetY) / scale,
					viewWidth / scale,
					Math.max(1, bottom - top) / scale,
					0,
					0,
					spillEl.width,
					spillEl.height
				);
			} catch {
				return;
			}
		};

		let rate = 1;
		let drive = 1;
		let lastScrollY = scrollY;
		let lastScrollAt = performance.now();
		let lastPaint = 0;
		let loop = 0;
		let visible = true;

		const tick = (now: number) => {
			drive += (1 - drive) * 0.035;
			rate += (drive - rate) * 0.08;
			if (!videoEl.paused && Math.abs(videoEl.playbackRate - rate) > 0.04)
				videoEl.playbackRate = rate;
			if (now - lastPaint > 66) {
				paintSpill();
				lastPaint = now;
			}
			loop = requestAnimationFrame(tick);
		};

		const syncLoop = () => {
			cancelAnimationFrame(loop);
			if (visible) loop = requestAnimationFrame(tick);
		};

		layout();
		measure();
		document.fonts.ready.then(layout);

		let frame = 0;
		const onScroll = () => {
			const now = performance.now();
			const speed = Math.abs(scrollY - lastScrollY) / Math.max(8, now - lastScrollAt);
			lastScrollY = scrollY;
			lastScrollAt = now;
			if (!still) drive = Math.max(drive, 1 + Math.min(1.6, speed * 0.9));
			frame ||= requestAnimationFrame(() => {
				frame = 0;
				measure();
			});
		};
		const resizeObserver = new ResizeObserver(() => {
			layout();
			measure();
		});
		resizeObserver.observe(stageEl);

		const visibility = new IntersectionObserver(([entry]) => {
			visible = entry.isIntersecting;
			if (visible) play();
			else videoEl.pause();
			syncLoop();
		});
		visibility.observe(sectionEl);

		addEventListener('scroll', onScroll, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			cancelAnimationFrame(loop);
			removeEventListener('scroll', onScroll);
			resizeObserver.disconnect();
			visibility.disconnect();
			detachFilm();
		};
	});
</script>

{#snippet title(lines: Lines, offset: number)}
	{#each lines as line, l (l)}
		<span class="line">
			{#each line as word, i (i)}
				<span class="mask" class:italic={word.italic}
					><span class="word" style:--i={offset + wordIndex(lines, l, i)}>{word.text}</span></span
				>
			{/each}
		</span>
	{/each}
{/snippet}

<section bind:this={section} class="hero" id="top" aria-labelledby="hero-title">
	<h1 id="hero-title" class="sr-only">{copy.headline}</h1>
	<div
		bind:this={stage}
		class="stage"
		style:--band-top={geometry && `${geometry.top}px`}
		style:--band-bottom={geometry && `${geometry.bottom}px`}
		style:--line={geometry && `${geometry.line}px`}
		style:--line-bottom={geometry && `${geometry.height - geometry.line}px`}
		style:--horizon={geometry && `${geometry.horizon}px`}
		style:--expand={story.expand}
		style:--title-in={story.titleIn}
		style:--title-out={story.titleOut}
		style:--dawn={story.dawn}
		style:--push={story.push}
	>
		<div class="spill" aria-hidden="true">
			<canvas bind:this={spill} width="48" height="16"></canvas>
		</div>

		<div class="film" style:background-position="50% {positionY * 100}%">
			<video
				bind:this={video}
				poster={film.poster}
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
			<div class="grade" aria-hidden="true"></div>
		</div>
		<span class="hairline" aria-hidden="true"></span>

		<div class="frame">
			{#key locale}
				<div class="inside">
					<div class="title" aria-hidden="true">
						<span class="wide">{@render title(wide.inside, 0)}</span>
						<span class="narrow">{@render title(narrow.inside, 0)}</span>
					</div>
					<span class="scroll-line" aria-hidden="true"></span>
				</div>
			{/key}

			<div bind:this={band} class="band"></div>

			<div class="outside">
				<p class="lockup label">
					<b>{brand}</b>
					<span>{copy.discipline}</span>
				</p>
				{#key locale}
					<div class="title" aria-hidden="true">
						<span class="wide">{@render title(wide.outside, wide.inside.flat().length)}</span>
						<span class="narrow">{@render title(narrow.outside, narrow.inside.flat().length)}</span>
					</div>
				{/key}
			</div>
		</div>

		<div class="card" aria-hidden="true">
			<span class="card-brand">{brand}</span>
			<span class="card-discipline label">{copy.discipline}</span>
		</div>

		<div class="flood" aria-hidden="true"></div>
		<div class="dawn" aria-hidden="true"></div>

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
		height: 300lvh;
	}

	.sr-only {
		position: absolute;
		width: 1px;
		height: 1px;
		overflow: hidden;
		clip-path: inset(50%);
		white-space: nowrap;
	}

	.stage {
		--band-top: 30svh;
		--band-bottom: 26svh;
		--line: 52svh;
		--line-bottom: 48svh;
		--horizon: 56svh;
		--title-size: min(5.4vw, 7.2svh, 104px);
		--clip-top: calc(
			(var(--line) - (var(--line) - var(--band-top)) * var(--open)) * (1 - var(--expand))
		);
		--clip-bottom: calc(
			(var(--line-bottom) - (var(--line-bottom) - var(--band-bottom)) * var(--open)) *
				(1 - var(--expand))
		);
		position: sticky;
		top: 0;
		height: 100lvh;
		overflow: hidden;
		background:
			radial-gradient(130% 70% at 50% var(--line), rgb(255 255 255 / 0.32), transparent 72%),
			linear-gradient(#e7e4de, var(--paper) 30%, var(--paper) 70%, #e9e5df);
		transition: --open 1.8s var(--ease-out) 0.75s;
	}

	:global(html[data-hartmann-entrance='ready']) .stage {
		--open: 1;
	}

	.spill {
		position: absolute;
		top: calc(var(--clip-top) - 22svh);
		bottom: calc(var(--clip-bottom) - 22svh);
		left: -8%;
		width: 116%;
		filter: blur(56px) saturate(1.6);
		mix-blend-mode: color;
		opacity: calc(var(--open) * 0.34);
		pointer-events: none;
	}

	.spill canvas {
		display: block;
		width: 100%;
		height: 100%;
	}

	.film {
		position: absolute;
		inset: 0;
		background: var(--night) url('/media/images/helios-north-hero-poster.jpg') 50% 82% / cover
			no-repeat;
		clip-path: inset(var(--clip-top) 0 var(--clip-bottom) 0);
	}

	video,
	.grade {
		position: absolute;
		inset: 0;
		width: 100%;
		height: 100%;
	}

	video {
		object-fit: cover;
		transform: scale(1.12);
		transform-origin: 50% var(--horizon);
		scale: calc(1 + var(--push) * 0.07);
		filter: blur(14px);
		transition:
			transform 3.4s var(--ease-out) 0.75s,
			filter 2.6s var(--ease-out) 0.9s;
	}

	:global(html[data-hartmann-entrance='ready']) video {
		transform: none;
		filter: none;
	}

	.grade {
		--title: calc(var(--title-in) * (1 - var(--title-out)));
		background:
			radial-gradient(70% 60% at 50% 50%, rgb(7 14 21 / calc(var(--title) * 0.4)), transparent),
			linear-gradient(rgb(7 14 21 / 0.24), rgb(7 14 21 / 0.04) 48%, rgb(7 14 21 / 0.2));
		pointer-events: none;
	}

	.hairline {
		position: absolute;
		top: var(--line);
		left: 0;
		right: 0;
		height: 1px;
		background: var(--ink);
		opacity: 0;
		transform: scaleX(0);
		transform-origin: 0 50%;
	}

	:global(html[data-hartmann-entrance='ready']) .hairline {
		animation: hairline 2.6s var(--ease-in-out) both;
	}

	@keyframes hairline {
		0% {
			opacity: 0.4;
			transform: scaleX(0);
		}
		34% {
			opacity: 0.4;
			transform: scaleX(1);
		}
		58% {
			opacity: 0.3;
			transform: scaleX(1);
		}
		100% {
			opacity: 0;
			transform: scaleX(1);
		}
	}

	.frame {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-rows: auto 1fr auto;
		row-gap: clamp(18px, 3.4svh, 40px);
		padding: calc(var(--header-pad) * 2 + 38px + 1.5svh) var(--gutter) clamp(20px, 3vw, 38px);
		pointer-events: none;
	}

	.title {
		font: 400 var(--title-size) / 1.02 var(--serif);
		letter-spacing: -0.014em;
	}

	.inside,
	.outside {
		display: grid;
		align-items: end;
		column-gap: 24px;
		opacity: calc(1 - var(--expand) * 2.4);
	}

	.inside {
		grid-template-columns: 1fr auto;
		translate: 0 calc(var(--band-top) * var(--expand) * -1);
	}

	.outside {
		grid-template-columns: auto 1fr;
		translate: 0 calc(var(--band-bottom) * var(--expand));
	}

	.outside .title {
		display: grid;
		justify-items: end;
		text-align: right;
	}

	.wide,
	.narrow {
		display: block;
	}

	.outside .wide,
	.outside .narrow {
		display: grid;
		justify-items: end;
	}

	.narrow,
	.outside .narrow {
		display: none;
	}

	.line {
		display: flex;
		gap: 0.25em;
		width: max-content;
		white-space: nowrap;
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
		transition: transform 1.5s var(--ease-out) calc(var(--i) * 70ms + 1.15s);
	}

	.lockup,
	.scroll-line {
		opacity: 0;
		transition: opacity 1.6s var(--ease-out) 2s;
	}

	:global(html[data-hartmann-entrance='ready']) .lockup,
	:global(html[data-hartmann-entrance='ready']) .scroll-line {
		opacity: 1;
	}

	.lockup b {
		display: block;
		margin-bottom: 0.5em;
		font: 400 clamp(22px, 1.85vw, 28px) / 1 var(--serif);
		letter-spacing: -0.005em;
		text-transform: none;
	}

	.lockup span {
		opacity: 0.6;
	}

	.scroll-line {
		position: relative;
		justify-self: end;
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

	.card {
		--title: calc(var(--title-in) * (1 - var(--title-out)));
		position: absolute;
		inset: 0;
		display: grid;
		place-content: center;
		justify-items: center;
		color: var(--frost);
		text-shadow: 0 0 60px rgb(7 14 21 / 0.35);
		opacity: var(--title);
		pointer-events: none;
	}

	.card-brand {
		font: 400 clamp(84px, 17vw, 280px) / 0.9 var(--serif);
		letter-spacing: -0.02em;
		translate: 0 calc((1 - var(--title-in)) * 4svh - var(--title-out) * 3svh);
		filter: blur(calc((1 - var(--title-in)) * 14px + var(--title-out) * 10px));
	}

	.card-discipline {
		--tracking: calc(0.28em + (1 - var(--title-in)) * var(--tracking-extra, 0.9em));
		margin-top: clamp(14px, 2.4svh, 28px);
		padding-left: var(--tracking);
		letter-spacing: var(--tracking);
		white-space: nowrap;
		opacity: calc(0.85 * var(--title-in));
	}

	.flood,
	.dawn {
		position: absolute;
		inset: 0;
		pointer-events: none;
	}

	.flood {
		background: radial-gradient(120% 100% at 84% 6%, #fff4e4, #f6e2c6 40%, #e2cdb2);
		mix-blend-mode: screen;
		opacity: min(0.92, calc(var(--dawn) * 2.2));
	}

	.dawn {
		background:
			radial-gradient(70% 60% at 86% 0%, rgb(250 242 228 / 0.85), transparent 70%),
			var(--paper-shade);
		opacity: calc(var(--dawn) * var(--dawn) * var(--dawn));
	}

	.play {
		position: absolute;
		right: var(--gutter);
		bottom: calc(var(--band-bottom) + 18px);
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
		.stage {
			--title-size: clamp(34px, 10.2vw, 56px);
		}

		.card-discipline {
			--tracking-extra: 0.3em;
		}

		.wide,
		.outside .wide {
			display: none;
		}

		.narrow {
			display: block;
		}

		.outside .narrow {
			display: grid;
		}

		.outside {
			grid-template-columns: 1fr;
			row-gap: 18px;
		}

		.outside .title {
			grid-row: 1;
		}

		.lockup {
			grid-row: 2;
		}

		.scroll-line {
			display: none;
		}
	}

	@media (prefers-reduced-motion: reduce) {
		.word {
			transform: none;
		}

		.lockup,
		.scroll-line {
			opacity: 1;
		}

		video {
			transform: none;
			filter: none;
		}
	}
</style>
