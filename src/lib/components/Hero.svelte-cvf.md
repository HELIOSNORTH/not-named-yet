# Hero.svelte — CVF (2026-10-13)

- The hero is `position: sticky` so the sheet slides over it. The stage is scaled from the top edge, which makes it read
  as the iOS card-behind-sheet effect.
- `autoplay muted playsinline` must stay as HTML attributes (prerendered) or iOS will not autoplay. Effects then pause the
  video when the user pauses, when the sheet fully covers the hero, or when reduced motion is on.
- The pause button is required, not decoration: WCAG 2.2.2 requires a pause control for auto-playing motion longer than 5 s.
- `.scrim` gradients are tuned blind (real footage was unreachable during the build). They guarantee contrast for
  white type at the bottom-left; soften them once seen on the real video.
- The intro waits ≈0.55 s for the video fade before the words rise. `introDone` flips after the intro has finished,
  so a language switch replays the reveal without the delay. Flipping it earlier would change `animation-delay`
  mid-animation and make the text jump.
