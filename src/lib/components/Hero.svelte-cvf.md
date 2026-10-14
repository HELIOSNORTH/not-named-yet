# Hero.svelte — CVF (2026-10-14)

- The video is never clipped or re-rendered by scroll. Two paper `.sheet`s cover it and move only by `transform`, so
  scrolling is compositor work. M4 used a per-frame `clip-path` on the video plus `playbackRate` changes and canvas
  frame grabs; that caused stutter, buffer stalls and stopped playback in real browsers.
- `.band` is the `1fr` grid row between the credits. JS measures it into `--band-top/--band-bottom/--line/--horizon`
  (px, set directly on the stage, no Svelte state per frame), and `frameFilm` shifts the crop so the skyline sits just
  below the band centre.
- Intro is CSS-only: `--open` (a registered `@property`) transitions when the veil script sets
  `html[data-hartmann-entrance='ready']`. Sheets start meeting at `--line` and part to the band edges.
- Scroll: the first 90 % of a viewport of scroll is `--expand` (sheets and text leave). The next 100 % is `--cover`:
  the contact section, pulled up by `margin-top: -100lvh` in Correspondence, slides over the still-sticky stage while
  the film drifts up 28lvh and dims. The film pauses once fully covered (with hysteresis) and resumes when uncovered.
- Watchdog (1.5 s): if the film should play but is paused (power saving, stall recovery), call `play()` again. A
  `NotAllowedError` means autoplay is truly blocked → show "Play film".
- The cool tint around the band is static CSS (radial gradients on the sheets), not sampled from the video.
- The headline is a visually hidden `<h1>`; the visible credit lines are `aria-hidden`.
