# Hero.svelte — CVF (2026-10-14)

- One `<video>` covers the stage; only `clip-path: inset()` changes, so the horizon never moves while the band
  opens or expands. It reads like an iris, not a resizing box (the earlier "growing square" was the complaint).
- `.band` is the `1fr` grid row between the credits. JS measures it into `--band-top/--band-bottom/--line/--horizon`
  and `frameFilm` shifts the crop so the skyline sits just below the band centre.
- Two time bases: the intro is CSS-only (`--open`, a registered `@property`, transitions when the veil script sets
  `html[data-hartmann-entrance='ready']`). Scroll writes the `story` values: `--expand` 0–26 %, `--title-in` 20–42 %,
  `--title-out` 60–74 %, `--dawn` 70–100 %, `--push` 0–90 %. The windows overlap on purpose: there must be no scroll
  range where nothing moves (owner called the old idle stretch "an awkward waiting room").
- Colour spill: a 48×16 canvas gets the band's crop of the current frame at about 15 fps, blurred and
  blended with `mix-blend-mode: color`. That blend tints the paper without darkening it; `multiply` made the paper muddy.
  Drawing a cross-origin video taints the canvas, which is fine because we never read pixels back.
- "Drive": scroll speed raises a target playback rate (≤ 2.6×). It eases back to 1× and is written to
  `playbackRate` only when the change is > 0.04, to avoid decoder hiccups.
- Dawn: `.flood` (screen-blended warm light) rises first, then `.dawn` (paper-shade + sun glow, cubic) takes over.
  The stage bottom ends flat `--paper-shade`, matching the top of the contact section, so the seam is invisible.
- The text blocks translate by exactly the band inset × `--expand` and fade at 2.4×, so they leave with the paper
  edges and never collide with the fixed header.
- The headline is a visually hidden `<h1>`; the visible credit lines are `aria-hidden`.
