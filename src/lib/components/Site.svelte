<script lang="ts">
	import { content, type Locale } from '#lib/content.ts';
	import Header from './Header.svelte';
	import Hero from './Hero.svelte';
	import Sheet from './Sheet.svelte';

	let { locale }: { locale: Locale } = $props();

	const copy = $derived(content[locale]);

	let sheet = $state<HTMLElement>();
	let reading = $state<HTMLElement>();
	let cover = $state(0);
	let read = $state(0);
	let tone = $state<'night' | 'paper'>('night');

	const clampUnit = (value: number) => Math.min(1, Math.max(0, value));

	$effect(() => {
		if (!sheet || !reading) return;
		const sheetEl = sheet;
		const readingEl = reading;
		let frame = 0;

		const measure = () => {
			frame = 0;
			const viewport = window.innerHeight;
			const sheetTop = sheetEl.getBoundingClientRect().top;
			cover = clampUnit(1 - sheetTop / viewport);
			tone = sheetTop <= 52 ? 'paper' : 'night';
			const { top, height } = readingEl.getBoundingClientRect();
			read = clampUnit((viewport * 0.6 - top) / Math.max(1, height - viewport * 0.4));
		};
		const schedule = () => {
			frame ||= requestAnimationFrame(measure);
		};

		measure();
		addEventListener('scroll', schedule, { passive: true });
		addEventListener('resize', schedule, { passive: true });
		return () => {
			cancelAnimationFrame(frame);
			removeEventListener('scroll', schedule);
			removeEventListener('resize', schedule);
		};
	});
</script>

<div class="site" style:--cover={cover} style:--read={read}>
	<Header {copy} {locale} {tone} />
	<Hero {copy} {locale} covered={cover >= 0.995} />
	<Sheet {copy} bind:sheet bind:reading />
</div>

<style>
	.site {
		position: relative;
		overflow-x: clip;
	}
</style>
