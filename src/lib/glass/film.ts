import { film } from '#lib/content.ts';

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
					maxBufferLength: 12,
					capLevelToPlayerSize: false,
					startPosition: film.startAt
				});
				hls.on(Hls.Events.MANIFEST_PARSED, () => {
					const needed = neededWidth(video);
					const index = hls.levels.findIndex((level) => level.width >= needed);
					hls.autoLevelCapping = index === -1 ? hls.levels.length - 1 : index;
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

function neededWidth(video: HTMLVideoElement) {
	const scale = Math.max(video.clientWidth / film.width, video.clientHeight / film.height);
	return film.width * scale * Math.min(devicePixelRatio || 1, 2) * 0.85;
}
