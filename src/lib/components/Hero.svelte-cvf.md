# Hero.svelte — CVF (2026-10-13)

- The film is portrait 9:16 (2160×3840). `frameFilm` covers the viewport and, on landscape screens, shifts the crop so
  the horizon (`film.horizonY` ≈ 0.715 of frame height: fjord, skyline, Bølgen) lands near 31 % from the top. Phones
  show the full frame (no vertical slack), so the horizon sits low; then `data-layout="above"` moves the headline up
  over the foggy sky.
- The auto-wipe stripe follows the computed horizon, so the first clear view is always Bølgen.
- Scroll: section is 260lvh with a sticky stage. 4–62 % of travel rolls the glass edge from top to past the bottom;
  the headline fades during the first 20 %. The glass loop stops once the edge has passed (`edge ≥ 1.02`) and while the
  section is off-screen.
- The effect must not read `$state` synchronously (it would re-run, destroy the WebGL context and fail on the lost
  context). Keep internal values in local variables and only write state.
- `.frost` is the pre-hydration and no-WebGL2 fallback (CSS backdrop blur with a clear band). It hides once the glass
  is running.
- Touch uses `touchmove`, not pointer events. With `touch-action: pan-y` the browser cancels pointer events as soon as
  scrolling starts, so pointer events would stop wiping mid-swipe.
