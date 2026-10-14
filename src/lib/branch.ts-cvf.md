# branch.ts — CVF (2026-10-14)

- Replaces a 54 s CSS rotate loop that the owner found robotic. Owner wants clearly visible motion: a first, too-calm
  tuning (about 20 px) was rejected. Current tip travel is about 100 px, comparable to the old loop but organic.
- Model: one bend angle follows a damped spring (0.46 Hz, ζ 0.17) toward a wind target. The wind is a small lean plus
  two value-noise layers plus squared-noise gusts, so the motion never repeats.
- Bending, not rotating: the stem is resampled (28 points) and each segment is rotated by `bend × s²`, so the base is
  stiff and the tip bends most, like real wood. Each leaf hinges at its nearest stem sample, so the whole
  offset rotates around the stem rather than the leaf spinning on its centre. Its angle is its own spring, driven by
  noise flutter (stronger in gusts) and by trailing the branch velocity. `scale(1, flip)` narrows the leaf as it turns.
- Runs only while the SVG is on screen; static under reduced motion. The ellipses carry their rest pose in `data-*`.
