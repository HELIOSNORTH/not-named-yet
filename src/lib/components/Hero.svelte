<script lang="ts">
	import { brand, film, type Copy, type Locale } from '#lib/content.ts';
	import { attachFilm } from '#lib/film/film.ts';
	import { frameFilm } from '#lib/film/framing.ts';

	let { copy, locale }: { copy: Copy; locale: Locale } = $props();

	type Lines = Copy['wide'];

	let section = $state<HTMLElement>();
	let stage = $state<HTMLElement>();
	let band = $state<HTMLElement>();
	let video = $state<HTMLVideoElement>();

	let blocked = $state(false);
	let positionY = $state(0.82);

	const split = (lines: Lines, at: number) => ({
		inside: lines.slice(0, at),
		outside: lines.slice(at)
	});
	const wide = $derived(split(copy.wide, copy.secondSentenceLine.wide));
	const narrow = $derived(split(copy.narrow, copy.secondSentenceLine.narrow));

	const wordIndex = (lines: Lines, line: number, word: number) =>
		lines.slice(0, line).reduce((sum, l) => sum + l.length, 0) + word;

	const clamp = (value: number) => Math.min(1, Math.max(0, value));
	const ease = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

	$effect(() => {
		if (!section || !stage || !band || !video) return;
		const sectionEl = section;
		const stageEl = stage;
		const bandEl = band;
		const videoEl = video;
		const still = matchMedia('(prefers-reduced-motion: reduce)').matches;
		let visible = true;
		let covered = false;

		const play = () => {
			if (still || !visible || covered) return;
			videoEl.play().then(
				() => (blocked = false),
				(error: DOMException) => {
					if (error.name === 'NotAllowedError') blocked = true;
				}
			);
		};
		const detachFilm = attachFilm(videoEl, play);
		if (still) blocked = true;

		const layout = () => {
			const height = stageEl.clientHeight;
			const stageTop = stageEl.getBoundingClientRect().top;
			const rect = bandEl.getBoundingClientRect();
			const top = rect.top - stageTop;
			const bottom = height - (rect.bottom - stageTop);
			const line = top + rect.height / 2;
			const frame = frameFilm(
				stageEl.clientWidth,
				height,
				film,
				(top + rect.height * 0.6) / height
			);
			positionY = frame.positionY;
			stageEl.style.setProperty('--band-top', `${top}px`);
			stageEl.style.setProperty('--band-bottom', `${bottom}px`);
			stageEl.style.setProperty('--line', `${line}px`);
			stageEl.style.setProperty('--line-bottom', `${height - line}px`);
			stageEl.style.setProperty('--horizon', `${frame.horizon * height}px`);
		};

		const measure = () => {
			const viewport = stageEl.clientHeight;
			const scrolled = -sectionEl.getBoundingClientRect().top;
			const reveal = viewport * 0.9;
			const expand = ease(clamp(scrolled / reveal));
			const cover = clamp((scrolled - reveal) / viewport);
			stageEl.style.setProperty('--expand', expand.toFixed(4));
			stageEl.style.setProperty('--cover', cover.toFixed(4));
			if (cover > 0.995 && !covered) {
				covered = true;
				videoEl.pause();
			} else if (cover < 0.98 && covered) {
				covered = false;
				play();
			}
		};

		layout();
		measure();
		document.fonts.ready.then(layout);

		let frame = 0;
		const onScroll = () => {
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
		});
		visibility.observe(sectionEl);

		const watchdog = setInterval(() => {
			if (videoEl.paused && !blocked && videoEl.readyState >= 2) play();
		}, 1500);

		addEventListener('scroll', onScroll, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			clearInterval(watchdog);
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
	<div bind:this={stage} class="stage">
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

		<div class="sheet top" aria-hidden="true"></div>
		<div class="sheet bottom" aria-hidden="true"></div>
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

		<div class="dim" aria-hidden="true"></div>

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
		height: 290lvh;
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
		--expand: 0;
		--cover: 0;
		--title-size: min(5.4vw, 7.2svh, 104px);
		position: sticky;
		top: 0;
		height: 100lvh;
		overflow: hidden;
		background: var(--paper);
		transition: --open 1.8s var(--ease-out) 0.75s;
	}

	:global(html[data-hartmann-entrance='ready']) .stage {
		--open: 1;
	}

	.film {
		position: absolute;
		inset: 0;
		background: var(--night) url('/media/images/helios-north-hero-poster.jpg') 50% 82% / cover
			no-repeat;
		transform: translateY(calc(var(--cover) * -28lvh));
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
		background: linear-gradient(rgb(7 14 21 / 0.24), rgb(7 14 21 / 0.04) 48%, rgb(7 14 21 / 0.2));
		pointer-events: none;
	}

	.sheet {
		position: absolute;
		left: 0;
		right: 0;
		will-change: transform;
	}

	.sheet.top {
		top: -2px;
		height: calc(var(--line) + 3px);
		background:
			radial-gradient(90% 46% at 50% 100%, rgb(122 150 196 / 0.16), transparent 70%),
			radial-gradient(120% 70% at 50% 100%, rgb(255 255 255 / 0.32), transparent 72%),
			linear-gradient(#e7e4de, var(--paper) 55%);
		transform: translateY(
			calc(
				(var(--line) - var(--band-top)) * var(--open) * -1 - var(--band-top) * var(--expand) - 4px *
					var(--expand)
			)
		);
	}

	.sheet.bottom {
		top: calc(var(--line) - 1px);
		bottom: -2px;
		background:
			radial-gradient(90% 46% at 50% 0%, rgb(122 150 196 / 0.16), transparent 70%),
			radial-gradient(120% 70% at 50% 0%, rgb(255 255 255 / 0.32), transparent 72%),
			linear-gradient(var(--paper) 45%, #e9e5df);
		transform: translateY(
			calc(
				(var(--line-bottom) - var(--band-bottom)) * var(--open) + var(--band-bottom) *
					var(--expand) + 4px * var(--expand)
			)
		);
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
		transform: translateY(calc(var(--band-top) * var(--expand) * -1));
	}

	.outside {
		grid-template-columns: auto 1fr;
		transform: translateY(calc(var(--band-bottom) * var(--expand)));
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

	.dim {
		position: absolute;
		inset: 0;
		background: var(--night);
		opacity: calc(var(--cover) * 0.55);
		pointer-events: none;
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
