import type { Framing } from './glass.ts';

export function frameFilm(
	viewWidth: number,
	viewHeight: number,
	film: { width: number; height: number; horizonY: number },
	targetY: number
) {
	const scale = Math.max(viewWidth / film.width, viewHeight / film.height);
	const shownWidth = film.width * scale;
	const shownHeight = film.height * scale;
	const slackX = shownWidth - viewWidth;
	const slackY = shownHeight - viewHeight;
	const positionY =
		slackY > 0.5
			? Math.min(1, Math.max(0, (film.horizonY * shownHeight - targetY * viewHeight) / slackY))
			: 0.5;
	const offsetX = slackX * 0.5;
	const offsetY = slackY * positionY;
	const framing: Framing = {
		scaleX: viewWidth / shownWidth,
		scaleY: viewHeight / shownHeight,
		offsetX: offsetX / shownWidth,
		offsetY: offsetY / shownHeight
	};
	return {
		framing,
		positionY,
		horizon: (film.horizonY * shownHeight - offsetY) / viewHeight
	};
}
