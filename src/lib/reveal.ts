export function reveal(element: HTMLElement) {
	const observer = new IntersectionObserver(
		([entry]) => {
			if (!entry.isIntersecting) return;
			element.dataset.revealed = 'true';
			observer.disconnect();
		},
		{ rootMargin: '0px 0px -10% 0px' }
	);
	observer.observe(element);
	return () => observer.disconnect();
}
