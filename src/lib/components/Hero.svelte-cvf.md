# Hero.svelte — CVF (2026-10-14)

- One `<video>` covers the whole stage. Only `clip-path: inset()` changes, so the horizon never moves while the band
  opens or expands; it reads like a camera iris, not a resizing box (the old "growing square" was the complaint).
- The band's position comes from the layout itself: `.band` is the `1fr` grid row between the two sentences. JS
  measures it and writes `--band-top`, `--band-bottom`, `--line` (centre) and `--horizon` in px, and `frameFilm`
  shifts the crop so the fjord/skyline sits just below the band centre. Change the text size and the band follows.
- Intro is CSS-only: `--open` is a registered `@property` number, transitioned when the veil script sets
  `html[data-hartmann-entrance='ready']`. JS only writes `--expand` from scroll.
- The text blocks translate by exactly the band inset × `--expand`, so they leave with the paper edges, and fade fast
  (`× 2.4`) so they never collide with the fixed header.
- The poster is also the `.film` background, at the same position as the video crop. The band therefore opens onto
  the image even before the first video frame decodes.
- The headline is a visually hidden `<h1>`; the visible lines are `aria-hidden` because they are split across two grid
  rows and two breakpoint variants.
- Phones show the full portrait frame (no vertical slack), so the horizon sits low in the band with a lot of sky.
  This is intended: a classic low-horizon composition.
