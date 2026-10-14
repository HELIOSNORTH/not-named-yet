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

## M4 — Deeper title sequence + natural branch (2026-10-14) ✅

Owner feedback: section 1 lacked wow and had a dead scroll zone; the branch swung too far and looked robotic.

- Section 1: lit "dusk room" paper, live colour spill from the film, focus-pull intro, diagonal credits, scroll story
  (bars retract → "Hartmann" title card → dawn dissolve), scroll-velocity playback ("drive"). Hero 300lvh, no idle
  stretch.
- Section 2: window light blooms in on arrival; branch is a spring-damped bend driven by noise wind with gusts and
  per-leaf flutter (`src/lib/branch.ts`), replacing the 54 s CSS keyframe loop.

## M5 — Smooth, tasteful transition + livelier branch (2026-10-14) ✅

Owner feedback on M4: the "Hartmann" title card and dawn dissolve were not tasteful and didn't make sense; the video
glitched, lagged and stopped while scrolling; the branch barely moved.

- Removed the title card, dawn dissolve, scroll-driven playback rate and live colour-spill canvas.
- Playback: stream capped at 1080p (the 4K level peaked at ~49 Mbit/s), bigger buffer, no rate changes. A watchdog
  restarts the film if the browser pauses it unexpectedly. The band now opens with two paper sheets moved by
  `transform` instead of a per-frame `clip-path` on the video. A headless scroll stress test showed continuous
  playback at 1× with no pauses.
- Transition: the contact section overlaps the hero by 100lvh and slides over the film (parallax + dim).
- Branch: wind and spring retuned (tip travel about 100 px, irregular); leaves hinge at the stem, trail the branch
  with their own springs, and flutter harder in gusts.

## Next (only when needed)

- Check on real devices (iPhone Safari, Android Chrome, macOS Safari) and tune band proportions and intro timing.
