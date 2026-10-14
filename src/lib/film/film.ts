import { film } from '#lib/content.ts';

const maxStreamWidth = 1080;

export function attachFilm(video: HTMLVideoElement, play: () => void) {
	let destroyed = false;
	let cleanup = () => {};
	const useMp4 = () => {
		video.src = film.mp4;
		play();
	};
	video.addEventListener('canplay', play, { once: true });
	video.addEventListener(
		'loadedmetadata',
		() => {
			if (video.currentTime < film.startAt) video.currentTime = film.startAt;
		},
		{ once: true }
	);

	if (video.canPlayType('application/vnd.apple.mpegurl')) {
		video.src = film.hls;
	} else {
		import('hls.js/light')
			.then(({ default: Hls }) => {
				if (destroyed) return;
				if (!Hls.isSupported()) return useMp4();
				const hls = new Hls({
					maxBufferLength: 20,
					backBufferLength: 10,
					capLevelToPlayerSize: false,
					startPosition: film.startAt
				});
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					let cap = 0;
					hls.levels.forEach((level, index) => {
						if (level.width <= maxStreamWidth && level.width >= hls.levels[cap].width) cap = index;
					});
					hls.autoLevelCapping = cap;
				});
				hls.on(Hls.Events.ERROR, (_event, data) => {
					if (!data.fatal) return;
					hls.destroy();
					useMp4();
				});
				hls.loadSource(film.hls);
				hls.attachMedia(video);
				cleanup = () => hls.destroy();
			})
			.catch(useMp4);
	}

	return () => {
		destroyed = true;
		video.removeEventListener('canplay', play);
		cleanup();
	};
}
