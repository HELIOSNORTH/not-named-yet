import { fragmentShader, vertexShader } from './shaders.ts';

export type Framing = { scaleX: number; scaleY: number; offsetX: number; offsetY: number };

type Source = HTMLVideoElement | HTMLImageElement;

const maskDivisor = 6;
const maskPeak = 1.6;
const clearHoldSeconds = 9;
const frameWidth = 256;
const paper = [239 / 255, 235 / 255, 228 / 255];
const glint = [1, 0.9, 0.76];

function compile(gl: WebGL2RenderingContext, type: number, source: string) {
	const shader = gl.createShader(type)!;
	gl.shaderSource(shader, source);
	gl.compileShader(shader);
	if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS))
		throw new Error(gl.getShaderInfoLog(shader) ?? 'shader');
	return shader;
}

function texture(gl: WebGL2RenderingContext, mipmaps: boolean) {
	const handle = gl.createTexture()!;
	gl.bindTexture(gl.TEXTURE_2D, handle);
	gl.texParameteri(
		gl.TEXTURE_2D,
		gl.TEXTURE_MIN_FILTER,
		mipmaps ? gl.LINEAR_MIPMAP_LINEAR : gl.LINEAR
	);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
	gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
	return handle;
}

export function createGlass(
	canvas: HTMLCanvasElement,
	sources: { video: HTMLVideoElement; poster: HTMLImageElement }
) {
	const gl = canvas.getContext('webgl2', {
		premultipliedAlpha: true,
		antialias: false,
		alpha: true
	});
	if (!gl) return null;

	let program: WebGLProgram;
	try {
		program = gl.createProgram()!;
		gl.attachShader(program, compile(gl, gl.VERTEX_SHADER, vertexShader));
		gl.attachShader(program, compile(gl, gl.FRAGMENT_SHADER, fragmentShader));
		gl.linkProgram(program);
		if (!gl.getProgramParameter(program, gl.LINK_STATUS))
			throw new Error(gl.getProgramInfoLog(program) ?? 'link');
	} catch (error) {
		console.warn('glass disabled', error);
		return null;
	}
	gl.useProgram(program);
	gl.bindVertexArray(gl.createVertexArray());

	const uniform = (name: string) => gl.getUniformLocation(program, name);
	const u = {
		frame: uniform('uFrame'),
		mask: uniform('uMask'),
		css: uniform('uCss'),
		map: uniform('uMap'),
		lod: uniform('uLod'),
		time: uniform('uTime'),
		edge: uniform('uEdge'),
		intro: uniform('uIntro'),
		paper: uniform('uPaper'),
		glint: uniform('uGlint')
	};
	gl.uniform1i(u.frame, 0);
	gl.uniform1i(u.mask, 1);
	gl.uniform3fv(u.paper, paper);
	gl.uniform3fv(u.glint, glint);

	const frameTexture = texture(gl, true);
	const maskTexture = texture(gl, false);
	gl.pixelStorei(gl.UNPACK_ALIGNMENT, 1);

	const frameCanvas = document.createElement('canvas');
	const frameContext = frameCanvas.getContext('2d', { willReadFrequently: false })!;
	let videoReadable = true;
	let lastFrameTime = -1;
	let hasFrame = false;

	let cssWidth = 1;
	let cssHeight = 1;
	let resolution = Math.min(devicePixelRatio || 1, 1.5);
	let maskWidth = 1;
	let maskHeight = 1;
	let mask = new Float32Array(1);
	let maskBytes = new Uint8Array(1);
	let framing: Framing = { scaleX: 1, scaleY: 1, offsetX: 0, offsetY: 0 };

	let edge = 0;
	let intro = 0;
	let introStart = -1;
	let running = false;
	let raf = 0;
	let last = performance.now();
	let elapsed = 0;
	let slowFrames = 0;
	let lastPoint: { x: number; y: number; at: number } | null = null;
	let autoStroke: {
		from: number;
		duration: number;
		y: number;
		radius: number;
		drawnTo: number;
	} | null = null;

	function brushRadius() {
		return Math.min(170, Math.max(64, Math.min(cssWidth, cssHeight) * 0.12 + 30));
	}

	function stamp(x: number, y: number, radius: number, strength = 1) {
		const cx = x / maskDivisor;
		const cy = y / maskDivisor;
		const r = radius / maskDivisor;
		const x0 = Math.max(0, Math.floor(cx - r));
		const x1 = Math.min(maskWidth - 1, Math.ceil(cx + r));
		const y0 = Math.max(0, Math.floor(cy - r));
		const y1 = Math.min(maskHeight - 1, Math.ceil(cy + r));
		for (let j = y0; j <= y1; j++) {
			for (let i = x0; i <= x1; i++) {
				const d = Math.hypot(i - cx, (j - cy) * 1.15) / r;
				if (d >= 1) continue;
				const falloff = 1 - d * d * (3 - 2 * d);
				const index = j * maskWidth + i;
				mask[index] = Math.max(mask[index], falloff * maskPeak * strength);
			}
		}
	}

	function stroke(x0: number, y0: number, x1: number, y1: number, radius: number) {
		const distance = Math.hypot(x1 - x0, y1 - y0);
		const steps = Math.max(1, Math.ceil(distance / (radius * 0.22)));
		for (let s = 1; s <= steps; s++)
			stamp(x0 + ((x1 - x0) * s) / steps, y0 + ((y1 - y0) * s) / steps, radius);
	}

	function wipe(x: number, screenY: number) {
		const now = performance.now();
		const y = screenY - edge * cssHeight;
		const radius = brushRadius();
		if (lastPoint && now - lastPoint.at < 140) stroke(lastPoint.x, lastPoint.y, x, y, radius);
		else stamp(x, y, radius);
		lastPoint = { x, y, at: now };
	}

	function autoWipe(yFraction: number, duration = 1700) {
		autoStroke = {
			from: performance.now(),
			duration,
			y: yFraction * cssHeight,
			radius: brushRadius() * 1.12,
			drawnTo: cssWidth + brushRadius() * 1.5
		};
	}

	function advanceAutoStroke(now: number) {
		if (!autoStroke) return;
		const { from, duration, y, radius } = autoStroke;
		const t = Math.min(1, (now - from) / duration);
		const eased = t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
		const start = cssWidth + radius * 1.5;
		const x = start - eased * (cssWidth + radius * 3);
		const wobble = (p: number) => y + Math.sin((p / cssWidth) * Math.PI * 2.2) * radius * 0.28;
		stroke(autoStroke.drawnTo, wobble(autoStroke.drawnTo), x, wobble(x), radius);
		autoStroke.drawnTo = x;
		if (t >= 1) autoStroke = null;
	}

	function decay(dt: number) {
		const rate = maskPeak / (clearHoldSeconds + 4);
		const amount = rate * dt;
		for (let i = 0; i < mask.length; i++) {
			const value = mask[i];
			if (value > 0) mask[i] = value > amount ? value - amount : 0;
			maskBytes[i] = Math.min(255, (mask[i] / maskPeak) * 255);
		}
	}

	function resize(width: number, height: number, nextFraming: Framing) {
		cssWidth = Math.max(1, width);
		cssHeight = Math.max(1, height);
		framing = nextFraming;
		canvas.width = Math.round(cssWidth * resolution);
		canvas.height = Math.round(cssHeight * resolution);
		const nextWidth = Math.ceil(cssWidth / maskDivisor);
		const nextHeight = Math.ceil(cssHeight / maskDivisor);
		if (nextWidth !== maskWidth || nextHeight !== maskHeight) {
			const previous = mask;
			const previousWidth = maskWidth;
			const previousHeight = maskHeight;
			mask = new Float32Array(nextWidth * nextHeight);
			for (let j = 0; j < Math.min(previousHeight, nextHeight); j++)
				for (let i = 0; i < Math.min(previousWidth, nextWidth); i++)
					mask[j * nextWidth + i] = previous[j * previousWidth + i] ?? 0;
			maskBytes = new Uint8Array(nextWidth * nextHeight);
			maskWidth = nextWidth;
			maskHeight = nextHeight;
		}
		render(performance.now(), 0);
	}

	function uploadFrame() {
		const { video, poster } = sources;
		let source: Source | null = null;
		if (videoReadable && video.readyState >= 2) {
			if (video.currentTime === lastFrameTime && hasFrame) return;
			source = video;
		} else if (!hasFrame && poster.complete && poster.naturalWidth) source = poster;
		if (!source) return;
		const ratio =
			(source instanceof HTMLVideoElement
				? source.videoHeight / source.videoWidth
				: source.naturalHeight / source.naturalWidth) || 16 / 9;
		const height = Math.round(frameWidth * ratio);
		if (frameCanvas.width !== frameWidth || frameCanvas.height !== height) {
			frameCanvas.width = frameWidth;
			frameCanvas.height = height;
		}
		try {
			frameContext.drawImage(source, 0, 0, frameWidth, height);
			gl!.activeTexture(gl!.TEXTURE0);
			gl!.bindTexture(gl!.TEXTURE_2D, frameTexture);
			gl!.texImage2D(gl!.TEXTURE_2D, 0, gl!.RGBA, gl!.RGBA, gl!.UNSIGNED_BYTE, frameCanvas);
			gl!.generateMipmap(gl!.TEXTURE_2D);
			hasFrame = true;
			if (source === video) lastFrameTime = video.currentTime;
		} catch {
			if (source === video) videoReadable = false;
		}
	}

	function render(now: number, dt: number) {
		advanceAutoStroke(now);
		decay(dt);
		uploadFrame();

		if (introStart >= 0) intro = Math.min(1, (now - introStart) / 2400);
		const easedIntro = 1 - Math.pow(1 - intro, 3);

		gl!.viewport(0, 0, canvas.width, canvas.height);
		gl!.activeTexture(gl!.TEXTURE1);
		gl!.bindTexture(gl!.TEXTURE_2D, maskTexture);
		gl!.texImage2D(
			gl!.TEXTURE_2D,
			0,
			gl!.R8,
			maskWidth,
			maskHeight,
			0,
			gl!.RED,
			gl!.UNSIGNED_BYTE,
			maskBytes
		);

		const texelsPerCss = (frameWidth * framing.scaleX) / cssWidth;
		gl!.uniform2f(u.css, cssWidth, cssHeight);
		gl!.uniform4f(u.map, framing.scaleX, framing.scaleY, framing.offsetX, framing.offsetY);
		gl!.uniform1f(u.lod, Math.max(0, Math.log2(Math.max(1, 18 * texelsPerCss))));
		gl!.uniform1f(u.time, elapsed);
		gl!.uniform1f(u.edge, edge);
		gl!.uniform1f(u.intro, hasFrame ? easedIntro : 0);
		gl!.drawArrays(gl!.TRIANGLES, 0, 3);
	}

	function loop(now: number) {
		const dt = Math.min(0.1, (now - last) / 1000);
		last = now;
		elapsed += dt;
		if (dt > 0.026) slowFrames++;
		else slowFrames = Math.max(0, slowFrames - 1);
		if (slowFrames > 45 && resolution > 0.6) {
			resolution = Math.max(0.6, resolution * 0.75);
			slowFrames = 0;
			resize(cssWidth, cssHeight, framing);
		}
		render(now, dt);
		if (running) raf = requestAnimationFrame(loop);
	}

	return {
		resize,
		wipe,
		autoWipe,
		clearBand(yFraction: number) {
			const radius = brushRadius() * 1.12;
			stroke(-radius, yFraction * cssHeight, cssWidth + radius, yFraction * cssHeight, radius);
		},
		beginIntro(immediate = false) {
			introStart = immediate ? performance.now() - 10_000 : performance.now();
		},
		setEdge(value: number) {
			edge = value;
			if (!running) render(performance.now(), 0);
		},
		start() {
			if (running) return;
			running = true;
			last = performance.now();
			raf = requestAnimationFrame(loop);
		},
		stop() {
			running = false;
			cancelAnimationFrame(raf);
		},
		renderOnce() {
			render(performance.now(), 0);
		},
		destroy() {
			running = false;
			cancelAnimationFrame(raf);
			gl.getExtension('WEBGL_lose_context')?.loseContext();
		}
	};
}

export type Glass = NonNullable<ReturnType<typeof createGlass>>;
