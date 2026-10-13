export function fitWidth(maxPx: number) {
	return (box: HTMLElement) => {
		const text = box.firstElementChild as HTMLElement;
		const container = box.parentElement!;
		const fit = () => {
			box.style.fontSize = '100px';
			const ratio = text.getBoundingClientRect().width / 100;
			const available =
				container.clientWidth -
				parseFloat(getComputedStyle(container).paddingLeft) -
				parseFloat(getComputedStyle(container).paddingRight);
			box.style.fontSize = `${Math.min(maxPx, available / ratio)}px`;
		};
		fit();
		document.fonts.ready.then(fit);
		const observer = new ResizeObserver(fit);
		observer.observe(container);
		return () => observer.disconnect();
	};
}
