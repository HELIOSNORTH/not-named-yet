# Site.svelte — CVF (2026-10-13)

- One passive scroll listener, coalesced to one `requestAnimationFrame`, writes three values:
  - `--cover` (0→1): how far the sheet covers the hero. Hero scales, rounds and dims from it; at ≈1 the hero video pauses.
  - `--read` (0→1): progress through the pinned statement; each word's opacity is derived in CSS from it.
  - `tone`: `paper` once the sheet top passes under the header, so the glass controls stay legible.
- CSS custom properties keep per-frame work to style recalculation, with no per-word JS.
- Not CSS scroll-driven animations (`animation-timeline`): support is still uneven across Safari and Firefox, and this
  needs no fallback path.
