# Milestones

## M1 — First single-page version (2026-10-13) ✅ superseded

Sans-serif Liquid Glass design. Replaced by M2 after owner feedback: keep the previous site's identity and rethink only
the first section.

## M2 — "The Window" hero on the original identity (2026-10-13) ✅ superseded

- Header, loading veil, grain, fonts, palette and the sunlight contact section ported 1:1 from the live site.
- New hero: WebGL2 fogged-glass over the Vejle film, auto-wipe intro, pointer/touch wiping, scroll-driven window
  roll-down with a glint edge. Falls back to CSS frost without WebGL2, and to a static view with reduced motion.
- HLS with resolution capped to what the screen needs; MP4 fallback.

Owner judged the fogged-glass look risky. Ten alternative concepts were proposed; the owner chose "Title Sequence".

## M3 — "Title Sequence" hero (2026-10-14) ✅

- WebGL glass removed. Hero is a `<video>` clipped to a cinematic band between the two sentences; a hairline draws
  and opens into the band after the veil; scrolling retracts the paper bars to full-screen film.
- Header, veil, fonts, palette and the sunlight section unchanged from M2.
- Verified in headless Chromium at 1440×900, 1280×720 and 390×844 (EN and DA), with a VP9 transcode of the real film.

## Next (only when needed)

- Check on real devices (iPhone Safari, Android Chrome, macOS Safari) and tune band proportions and intro timing.
