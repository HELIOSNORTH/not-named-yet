<script lang="ts">
	import { contact, type Copy } from '#lib/content.ts';
	import { fitWidth } from '#lib/fit-width.ts';
	import { reveal } from '#lib/reveal.ts';

	let { copy }: { copy: Copy } = $props();

	const leaves = [
		[40, 13, 548, 70, 98],
		[38, 12, 500, 40, -8],
		[42, 13, 470, 126, 104],
		[40, 13, 418, 94, -14],
		[44, 14, 392, 190, 110],
		[42, 13, 342, 160, -20],
		[44, 14, 318, 256, 116],
		[42, 13, 266, 228, -26],
		[42, 13, 248, 326, 120],
		[40, 13, 196, 302, -30],
		[40, 12, 186, 396, 124],
		[38, 12, 138, 374, -34],
		[34, 11, 122, 452, 128]
	];
</script>

<section class="correspondence" id="correspondence" tabindex="-1" aria-label="Contact">
	<div class="room">
		<div class="light" aria-hidden="true">
			<div class="window">
				<div class="panes"><i></i><i></i><i></i><i></i><i></i><i></i></div>
				<svg class="branch" viewBox="0 0 600 520">
					<g>
						{#each leaves as [rx, ry, x, y, angle], index (index)}
							<ellipse {rx} {ry} transform="translate({x} {y}) rotate({angle})" />
						{/each}
					</g>
					<path d="M610 0C480 70 330 190 110 480" />
				</svg>
			</div>
		</div>

		<div class="body">
			<div class="kicker label" data-reveal {@attach reveal}>
				<span><i aria-hidden="true"></i><span>{copy.consult}</span></span>
			</div>
			<a
				class="email"
				href="mailto:{contact.email}"
				data-reveal
				{@attach reveal}
				{@attach fitWidth(150)}><span>{contact.email}</span></a
			>
			<a class="phone" href={contact.phoneHref} data-reveal {@attach reveal}>{contact.phone}</a>
		</div>

		<footer class="footer">
			<div class="legal label">
				<span>{contact.company}</span>
				<span>{copy.address}</span>
				<span>{contact.registration}</span>
			</div>
		</footer>
	</div>
</section>

<style>
	.correspondence {
		position: relative;
		background: var(--night);
	}

	.room {
		position: relative;
		display: flex;
		flex-direction: column;
		height: 100dvh;
		overflow: hidden;
		background: var(--paper-shade);
		color: var(--ink);
	}

	.light {
		position: absolute;
		inset: 0;
		overflow: hidden;
		pointer-events: none;
	}

	.window {
		position: absolute;
		top: -14%;
		right: -10%;
		width: 80%;
		height: 92%;
		animation: drift 36s ease-in-out infinite alternate;
	}

	@keyframes drift {
		from {
			transform: translate(0) skew(-18deg) rotate(-8deg);
		}
		to {
			transform: translate(-5%, 3%) skew(-14deg) rotate(-6.5deg);
		}
	}

	.panes {
		position: absolute;
		inset: 0;
		display: grid;
		grid-template-columns: 1fr 1fr;
		grid-template-rows: repeat(3, 1fr);
		gap: 4.5%;
		padding: 5%;
		filter: blur(24px);
		animation: flicker 23s ease-in-out infinite;
	}

	.panes i {
		background: linear-gradient(165deg, rgb(255 250 240 / 0.96), rgb(255 244 226 / 0.62));
	}

	@keyframes flicker {
		0%,
		100% {
			opacity: 0.95;
		}
		38% {
			opacity: 0.6;
		}
		52% {
			opacity: 0.82;
		}
		68% {
			opacity: 1;
		}
	}

	.branch {
		position: absolute;
		top: -6%;
		right: -4%;
		width: 82.5%;
		filter: blur(6px);
		transform-origin: 92% 4%;
		animation: sway 54.042s ease-in-out infinite;
	}

	.branch g {
		fill: var(--paper-shade);
	}

	.branch path {
		fill: none;
		stroke: var(--paper-shade);
		stroke-width: 5;
	}

	@keyframes sway {
		0%,
		10.5251%,
		21.9755%,
		32.5007%,
		33.0558%,
		43.5809%,
		55.4014%,
		65.9265%,
		66.6667%,
		77.1918%,
		88.8272%,
		99.3524%,
		100% {
			transform: rotate(-2.5deg);
		}
		5.26257%,
		15.7877%,
		16.7129%,
		27.2381%,
		38.3183%,
		48.8435%,
		50.1388%,
		60.6639%,
		71.9292%,
		82.4544%,
		83.5646%,
		94.0898% {
			transform: rotate(3deg);
		}
	}

	.body {
		position: relative;
		flex-shrink: 0;
		padding: max(10vh, calc(2 * var(--header-pad) + 38px)) var(--gutter) 0;
	}

	.kicker {
		display: flex;
		align-items: center;
		justify-content: space-between;
		gap: 20px;
		color: var(--ink-soft);
	}

	.kicker > span {
		display: inline-flex;
		align-items: center;
		gap: 14px;
	}

	.kicker i {
		width: 32px;
		height: 1px;
		background: currentColor;
	}

	.email {
		display: inline-block;
		margin-top: 14vh;
		font: 400 88px/1.05 var(--serif);
		letter-spacing: -0.02em;
		white-space: nowrap;
	}

	.email span {
		background: linear-gradient(currentColor, currentColor) 0 94% / 0 0.02em no-repeat;
		transition: background-size 1.1s var(--ease-out);
	}

	.email:hover span,
	.email:focus-visible span {
		background-size: 100% 0.02em;
	}

	.phone {
		display: block;
		width: max-content;
		margin-top: clamp(16px, 2.5vh, 28px);
		font: 400 clamp(22px, 2.6vw, 40px)/1.2 var(--serif);
		color: var(--ink-soft);
		transition: color 0.5s;
	}

	.phone:hover {
		color: var(--ink);
	}

	.footer {
		position: relative;
		flex-shrink: 0;
		margin-top: auto;
		padding: 3vh var(--gutter) var(--gutter);
	}

	.legal {
		display: grid;
		grid-template-columns: 1fr auto 1fr;
		gap: 20px;
		padding-top: 22px;
		border-top: 1px solid var(--ink-hairline);
		color: var(--ink-soft);
		letter-spacing: 0.2em;
	}

	.legal span:nth-child(2) {
		text-align: center;
	}

	.legal span:nth-child(3) {
		text-align: right;
	}

	@media (width <= 759px) {
		.kicker {
			flex-direction: column;
			align-items: flex-start;
			gap: 14px;
		}

		.legal {
			grid-template-columns: 1fr;
			gap: 10px;
		}

		.legal span:nth-child(n) {
			text-align: left;
		}
	}
</style>
