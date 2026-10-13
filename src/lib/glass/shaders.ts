export const vertexShader = `#version 300 es
out vec2 vUv;
void main() {
	vec2 position = vec2(float((gl_VertexID & 1) << 2) - 1.0, float((gl_VertexID & 2) << 1) - 1.0);
	vUv = vec2((position.x + 1.0) * 0.5, 1.0 - (position.y + 1.0) * 0.5);
	gl_Position = vec4(position, 0.0, 1.0);
}`;

export const fragmentShader = `#version 300 es
precision highp float;

in vec2 vUv;
out vec4 outColor;

uniform sampler2D uFrame;
uniform sampler2D uMask;
uniform vec2 uCss;
uniform vec4 uMap;
uniform float uLod;
uniform float uTime;
uniform float uEdge;
uniform float uIntro;
uniform vec3 uPaper;
uniform vec3 uGlint;

float hash21(vec2 p) {
	p = fract(p * vec2(234.34, 435.345));
	p += dot(p, p + 34.23);
	return fract(p.x * p.y);
}

vec2 hash22(vec2 p) {
	float n = hash21(p);
	return vec2(n, hash21(p + n));
}

float noise(vec2 p) {
	vec2 i = floor(p);
	vec2 f = fract(p);
	vec2 u = f * f * (3.0 - 2.0 * f);
	return mix(mix(hash21(i), hash21(i + vec2(1, 0)), u.x), mix(hash21(i + vec2(0, 1)), hash21(i + vec2(1, 1)), u.x), u.y);
}

float fbm(vec2 p) {
	float value = 0.0;
	float amplitude = 0.5;
	for (int i = 0; i < 4; i++) {
		value += amplitude * noise(p);
		p = p * 2.03 + 17.1;
		amplitude *= 0.5;
	}
	return value;
}

vec3 frame(vec2 uv, float lod) {
	return textureLod(uFrame, clamp(uv, vec2(0.001), vec2(0.999)), lod).rgb;
}

vec3 blurred(vec2 uv, float lod) {
	vec2 spread = uMap.xy / uCss * 34.0;
	vec3 sum = frame(uv, lod) * 0.2;
	const float golden = 2.39996;
	for (int i = 0; i < 8; i++) {
		float a = float(i) * golden;
		float r = sqrt((float(i) + 0.5) / 8.0);
		sum += frame(uv + vec2(cos(a), sin(a)) * r * spread, lod) * 0.1;
	}
	return sum;
}

vec4 droplet(vec2 p, float presence, float rMin, float rMax) {
	vec2 cell = floor(p);
	vec2 f = fract(p);
	vec4 best = vec4(0.0);
	for (int j = -1; j <= 1; j++) {
		for (int i = -1; i <= 1; i++) {
			vec2 g = vec2(float(i), float(j));
			vec2 id = cell + g;
			if (hash21(id + 7.13) > presence) continue;
			float r = mix(rMin, rMax, pow(hash21(id + 3.71), 2.2));
			vec2 d = f - (g + 0.25 + 0.5 * hash22(id));
			float inside = smoothstep(r, r * 0.78, length(d * vec2(1.0, 1.08)));
			if (inside > best.w) best = vec4(d / r, r, inside);
		}
	}
	return best;
}

vec3 shadeDrop(vec4 drop, vec2 vuv, float cellCss, vec3 base) {
	vec2 q = drop.xy;
	float radiusCss = drop.z * cellCss;
	vec2 refract = -q * radiusCss * 3.0 / uCss * uMap.xy;
	vec3 lens = mix(blurred(vuv + refract, max(uLod - 2.2, 0.0)), base, 0.5) * vec3(0.97, 0.99, 1.04);
	float rim = smoothstep(0.62, 1.0, length(q));
	float highlight = smoothstep(0.3, 0.0, length(q - vec2(-0.3, -0.36)));
	float caustic = smoothstep(0.5, 0.95, dot(q, vec2(0.38, 0.58))) * (1.0 - rim);
	vec3 color = mix(lens, base * 0.86, rim * 0.5);
	return color + highlight * 0.5 + caustic * 0.1;
}

void main() {
	vec2 suv = vUv;
	vec2 px = suv * uCss;
	float below = (suv.y - uEdge) * uCss.y;
	float hasEdge = step(0.0005, uEdge);

	if (below < 0.0) {
		float halo = exp(below / 10.0) * 0.16 * hasEdge;
		outColor = vec4(uGlint * halo, halo);
		return;
	}

	vec2 vuv = suv * uMap.xy + uMap.zw;
	float t = uTime;
	vec2 guv = vec2(suv.x, suv.y - uEdge);
	vec2 gpx = guv * uCss;

	float body = fbm(gpx / 520.0 + vec2(t * 0.005, -t * 0.003));
	float lower = smoothstep(0.45, 1.0, guv.y);
	float sides = smoothstep(0.25, 0.0, min(guv.x, 1.0 - guv.x));
	float density = clamp(0.55 + (body - 0.5) * 0.5 + lower * 0.22 + sides * 0.08, 0.0, 1.0);

	float mask = texture(uMask, guv).r * 1.6;
	float ragged = fbm(gpx / 34.0) - 0.5;
	float clearAmount = smoothstep(0.3, 0.82, mask + ragged * 0.34);
	float fogAmount = 1.0 - clearAmount;

	vec3 scene = blurred(vuv, uLod + 0.8);
	float frost = noise(gpx / 1.8) * 0.4 + noise(gpx / 5.0) * 0.35 + noise(gpx / 14.0) * 0.25;
	vec3 milk = mix(uPaper, vec3(0.93, 0.945, 0.96), 0.35);
	vec3 fog = mix(scene * 1.03 + 0.06, milk, 0.5 + density * 0.3);
	fog += (frost - 0.5) * 0.028;

	float bead = 30.0;
	vec4 drop = droplet(gpx / bead + 31.7, 0.012 + lower * lower * 0.14, 0.16, 0.34);
	float speck = 11.0;
	vec4 fine = droplet(gpx / speck + 7.3, 0.1 + lower * 0.2, 0.12, 0.28);

	vec3 color = fog;
	if (fine.w > 0.001) color = mix(color, shadeDrop(fine, vuv, speck, fog), fine.w * 0.14);
	vec3 dropColor = drop.w > 0.001 ? shadeDrop(drop, vuv, bead, fog) : fog;
	color = mix(color, dropColor, drop.w * 0.75);

	float ridge = clearAmount * fogAmount * 4.0;
	color = mix(color, color * 0.97 + 0.03, ridge);

	float leftover = drop.w * clearAmount * 0.5;

	vec3 clearTint = vec3(0.86, 0.9, 0.95);
	vec3 clearLayer = leftover > 0.001 ? mix(clearTint, shadeDrop(drop, vuv, bead, clearTint * 0.6), leftover) : clearTint;
	float alpha = fogAmount + clearAmount * 0.035;
	color = mix(clearLayer, color, fogAmount);
	alpha = max(alpha, leftover);

	float sheen = smoothstep(0.2, 1.0, sin((guv.x * 0.8 - guv.y * 0.55) * 3.0 + 0.4)) * 0.03;
	color += sheen;

	color = mix(color, uPaper, 1.0 - uIntro);
	alpha = mix(alpha, 1.0, 1.0 - uIntro);

	float lip = exp(-below / 1.6) * hasEdge;
	float bevel = smoothstep(0.0, 3.0, below) * (1.0 - smoothstep(3.0, 9.0, below)) * hasEdge;
	float shadow = exp(-max(below - 6.0, 0.0) / 14.0) * hasEdge * 0.16;
	color = mix(color, color * 0.8, shadow);
	color = mix(color, color * 0.9 + vec3(0.06, 0.07, 0.08), bevel * 0.6);
	alpha = max(alpha, max(bevel * 0.55, shadow));
	color = mix(color, uGlint * 1.05, lip * 0.95);
	alpha = max(alpha, lip);

	color += (hash21(px + t) - 0.5) * 0.01;
	outColor = vec4(color * alpha, alpha);
}`;
