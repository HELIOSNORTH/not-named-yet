type Point = { x: number; y: number };

const samples = 28;

function hash(n: number) {
	const s = Math.sin(n * 127.1) * 43758.5453;
	return s - Math.floor(s);
}

function noise(t: number) {
	const i = Math.floor(t);
	const f = t - i;
	const u = (1 - Math.cos(f * Math.PI)) / 2;
	return (hash(i) * (1 - u) + hash(i + 1) * u) * 2 - 1;
}

function cubic(p0: Point, p1: Point, p2: Point, p3: Point, t: number): Point {
	const m = 1 - t;
	const a = m * m * m;
	const b = 3 * m * m * t;
	const c = 3 * m * t * t;
	const d = t * t * t;
	return {
		x: a * p0.x + b * p1.x + c * p2.x + d * p3.x,
		y: a * p0.y + b * p1.y + c * p2.y + d * p3.y
	};
}

function rotate(v: Point, angle: number): Point {
	const cos = Math.cos(angle);
	const sin = Math.sin(angle);
	return { x: v.x * cos - v.y * sin, y: v.x * sin + v.y * cos };
}

function smoothPath(points: Point[]) {
	let d = `M${points[0].x.toFixed(1)} ${points[0].y.toFixed(1)}`;
	for (let i = 0; i < points.length - 1; i++) {
		const p0 = points[Math.max(0, i - 1)];
		const p1 = points[i];
		const p2 = points[i + 1];
		const p3 = points[Math.min(points.length - 1, i + 2)];
		const c1 = { x: p1.x + (p2.x - p0.x) / 6, y: p1.y + (p2.y - p0.y) / 6 };
		const c2 = { x: p2.x - (p3.x - p1.x) / 6, y: p2.y - (p3.y - p1.y) / 6 };
		d += `C${c1.x.toFixed(1)} ${c1.y.toFixed(1)} ${c2.x.toFixed(1)} ${c2.y.toFixed(1)} ${p2.x.toFixed(1)} ${p2.y.toFixed(1)}`;
	}
	return d;
}

export function sway(stem: [Point, Point, Point, Point]) {
	return (svg: SVGSVGElement) => {
		const path = svg.querySelector('path')!;
		const leaves = [...svg.querySelectorAll('ellipse')].map((leaf, index) => {
			const x = Number(leaf.dataset.x);
			const y = Number(leaf.dataset.y);
			return { leaf, x, y, angle: Number(leaf.dataset.angle), seed: index * 7.31 + 3.1 };
		});

		const rest = Array.from({ length: samples + 1 }, (_, i) => cubic(...stem, i / samples));
		const anchors = leaves.map((leaf) => {
			let best = 0;
			let bestDistance = Infinity;
			rest.forEach((p, i) => {
				const distance = Math.hypot(p.x - leaf.x, p.y - leaf.y);
				if (distance < bestDistance) {
					bestDistance = distance;
					best = i;
				}
			});
			return { index: best, offset: { x: leaf.x - rest[best].x, y: leaf.y - rest[best].y } };
		});

		const omega = 2 * Math.PI * 0.42;
		const damping = 0.22;
		let bend = 0;
		let velocity = 0;
		let time = Math.random() * 1000;
		let last = 0;
		let frame = 0;

		const wind = (t: number) => {
			const breeze = noise(t * 0.16) * 0.022 + noise(t * 0.53 + 40) * 0.01;
			const gust = Math.pow(Math.max(0, noise(t * 0.07 + 90)), 3) * 0.05;
			return 0.012 + breeze + gust;
		};

		const draw = () => {
			const shape: Point[] = [rest[0]];
			const angles = [0];
			for (let i = 1; i < rest.length; i++) {
				const s = i / samples;
				const angle = bend * s * s;
				const segment = rotate(
					{ x: rest[i].x - rest[i - 1].x, y: rest[i].y - rest[i - 1].y },
					angle
				);
				shape.push({ x: shape[i - 1].x + segment.x, y: shape[i - 1].y + segment.y });
				angles.push(angle);
			}
			path.setAttribute('d', smoothPath(shape));

			const strength = Math.min(1, Math.abs(velocity) * 6 + Math.abs(bend) * 8);
			leaves.forEach((leaf, i) => {
				const { index, offset } = anchors[i];
				const angle = angles[index];
				const position = rotate(offset, angle);
				const flutter = noise(time * (0.7 + (i % 3) * 0.18) + leaf.seed) * (2 + strength * 4);
				const turn = 1 - Math.abs(noise(time * 0.45 + leaf.seed * 2)) * (0.05 + strength * 0.1);
				const x = shape[index].x + position.x;
				const y = shape[index].y + position.y;
				const degrees = leaf.angle + (angle * 180) / Math.PI + flutter;
				leaf.leaf.setAttribute(
					'transform',
					`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${degrees.toFixed(2)}) scale(${turn.toFixed(3)} 1)`
				);
			});
		};

		const step = (dt: number) => {
			const target = wind(time);
			const acceleration = -omega * omega * (bend - target) - 2 * damping * omega * velocity;
			velocity += acceleration * dt;
			bend += velocity * dt;
			time += dt;
		};

		const tick = (now: number) => {
			const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
			last = now;
			for (let remaining = dt; remaining > 0; remaining -= 0.01) step(Math.min(0.01, remaining));
			draw();
			frame = requestAnimationFrame(tick);
		};

		draw();
		if (matchMedia('(prefers-reduced-motion: reduce)').matches) return;

		const observer = new IntersectionObserver(([entry]) => {
			cancelAnimationFrame(frame);
			last = 0;
			if (entry.isIntersecting) frame = requestAnimationFrame(tick);
		});
		observer.observe(svg);
		return () => {
			observer.disconnect();
			cancelAnimationFrame(frame);
		};
	};
}
