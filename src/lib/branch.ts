type Point = { x: number; y: number };

const samples = 28;

function hash(n: number) {
	const s = Math.sin(n * 127.1) * 43758.5453;
	return s - Math.floor(s);
}

function noise(t: number) {
	const i = Math.floor(t);
	const f = t - i;
	const u = f * f * (3 - 2 * f);
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

type Spring = { value: number; velocity: number };

function spring(state: Spring, target: number, frequency: number, damping: number, dt: number) {
	const omega = 2 * Math.PI * frequency;
	const acceleration =
		-omega * omega * (state.value - target) - 2 * damping * omega * state.velocity;
	state.velocity += acceleration * dt;
	state.value += state.velocity * dt;
}

export function sway(stem: [Point, Point, Point, Point]) {
	return (svg: SVGSVGElement) => {
		const path = svg.querySelector('path')!;
		const rest = Array.from({ length: samples + 1 }, (_, i) => cubic(...stem, i / samples));

		const leaves = [...svg.querySelectorAll('ellipse')].map((element, index) => {
			const x = Number(element.dataset.x);
			const y = Number(element.dataset.y);
			let anchor = 0;
			let nearest = Infinity;
			rest.forEach((p, i) => {
				const distance = Math.hypot(p.x - x, p.y - y);
				if (distance < nearest) {
					nearest = distance;
					anchor = i;
				}
			});
			return {
				element,
				anchor,
				offset: { x: x - rest[anchor].x, y: y - rest[anchor].y },
				angle: Number(element.dataset.angle),
				seed: index * 7.31 + 3.1,
				pace: 0.75 + hash(index + 11) * 0.6,
				swing: { value: 0, velocity: 0 } as Spring
			};
		});

		const branch: Spring = { value: 0, velocity: 0 };
		let time = hash(Date.now() % 1000) * 500;
		let last = 0;
		let frame = 0;

		const wind = (t: number) => {
			const breeze = noise(t * 0.23) * 0.15 + noise(t * 0.71 + 40) * 0.06;
			const gust = Math.pow(Math.max(0, noise(t * 0.09 + 90)), 2) * 0.26;
			return 0.05 + breeze + gust;
		};

		const step = (dt: number) => {
			const target = wind(time);
			spring(branch, target, 0.46, 0.17, dt);
			const strength = Math.min(1, Math.abs(target) * 2.5 + Math.abs(branch.velocity) * 2);
			for (const leaf of leaves) {
				const flutter =
					(noise(time * leaf.pace + leaf.seed) * 0.6 +
						noise(time * leaf.pace * 2.3 + leaf.seed * 3) * 0.4) *
					(0.1 + strength * 0.24);
				const trail = -branch.velocity * 0.9;
				spring(leaf.swing, flutter + trail, 1.1 + leaf.pace * 0.6, 0.35, dt);
			}
			time += dt;
		};

		const draw = () => {
			const shape: Point[] = [rest[0]];
			const angles = [0];
			for (let i = 1; i < rest.length; i++) {
				const s = i / samples;
				const angle = branch.value * s * s;
				const segment = rotate(
					{ x: rest[i].x - rest[i - 1].x, y: rest[i].y - rest[i - 1].y },
					angle
				);
				shape.push({ x: shape[i - 1].x + segment.x, y: shape[i - 1].y + segment.y });
				angles.push(angle);
			}
			path.setAttribute('d', smoothPath(shape));

			for (const leaf of leaves) {
				const turn = leaf.swing.value;
				const angle = angles[leaf.anchor] + turn;
				const position = rotate(leaf.offset, angle);
				const x = shape[leaf.anchor].x + position.x;
				const y = shape[leaf.anchor].y + position.y;
				const degrees = leaf.angle + (angle * 180) / Math.PI;
				const flip = 1 - Math.min(0.3, Math.abs(turn) * 1.2);
				leaf.element.setAttribute(
					'transform',
					`translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${degrees.toFixed(2)}) scale(1 ${flip.toFixed(3)})`
				);
			}
		};

		const tick = (now: number) => {
			const dt = last ? Math.min(0.05, (now - last) / 1000) : 0.016;
			last = now;
			for (let remaining = dt; remaining > 0; remaining -= 0.008) step(Math.min(0.008, remaining));
			draw();
			frame = requestAnimationFrame(tick);
		};

		for (let i = 0; i < 400; i++) step(0.02);
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
