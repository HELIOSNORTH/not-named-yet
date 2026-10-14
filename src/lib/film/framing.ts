export function frameFilm(
	viewWidth: number,
	viewHeight: number,
	film: { width: number; height: number; horizonY: number },
	targetY: number
) {
	const scale = Math.max(viewWidth / film.width, viewHeight / film.height);
	const shownHeight = film.height * scale;
	const slackY = shownHeight - viewHeight;
	const positionY =
		slackY > 0.5
			? Math.min(1, Math.max(0, (film.horizonY * shownHeight - targetY * viewHeight) / slackY))
			: 0.5;
	return {
		positionY,
		horizon: (film.horizonY * shownHeight - slackY * positionY) / viewHeight
	};
}
