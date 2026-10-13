# Sheet.svelte — CVF (2026-10-13)

- Statement: `.reading` is 230svh with a sticky 100svh pin, so the text holds still while `--read` lights the words.
  Word opacity is `clamp(.13, read·(n+2) − i, 1)`. The `+2` makes the last word finish before the pin releases.
- Video wordmark (the "inside/outside" idea): letters show the video, the surface stays exact paper colour.
  - Light: knockout layer = white bg + black text in `screen` (white→white, black→video), then a paper `multiply`
    layer on top tints white to paper and warms the video slightly.
  - Dark: black bg + white text in `multiply`, then `lighten` with the dark paper colour.
  - `isolation: isolate` keeps blending inside the wordmark. The gradient behind the video shows in the letters if
    the video fails to load.
  - The second `<video>` is the same URL (browser cache), `preload="none"` until near the viewport, and plays only while
    visible.
- `fitWidth` (`#lib/fit-width.ts`) sizes the wordmark to the container exactly. Font metrics differ between SF and Inter,
  so a fixed `vw` size would either overflow or leave slack. The inner span's `padding-right` equals the negative
  letter-spacing so the last glyph is measured fully and never clipped.
- `#contact` has `scroll-margin-top` so the header CONSULT link lands with the contact block in view.
