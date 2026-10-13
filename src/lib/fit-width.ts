export function fitWidth(box: HTMLElement) {
	const text = box.firstElementChild as HTMLElement;
	let lastWidth = 0;

	const fit = (force = false) => {
		const width = box.clientWidth;
		if (!force && width === lastWidth) return;
		lastWidth = width;
		box.style.fontSize = '100px';
		const ratio = text.getBoundingClientRect().width / 100;
		box.style.fontSize = `${width / ratio}px`;
	};

	fit(true);
	document.fonts.ready.then(() => fit(true));
	const observer = new ResizeObserver(() => fit());
	observer.observe(box);
	return () => observer.disconnect();
}
