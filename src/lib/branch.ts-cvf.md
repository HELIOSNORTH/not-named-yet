# branch.ts — CVF (2026-10-14)

- Replaces a 54 s CSS rotate loop that the owner found too large and robotic. A rigid rotation about the top-right pivot
  swung the tip about 130 px.
- Model: one bend angle `bend` follows a damped spring (0.42 Hz, ζ 0.22) toward a wind target. The wind is a
  small lean plus two value-noise layers plus rare cubed-noise gusts, so the motion never repeats. Typical tip travel
  is 10–30 px.
- Bending, not rotating: the stem is resampled (28 points) and each segment is rotated by `bend × s²`, so the base is
  stiff and the tip bends most, like real wood. Leaves ride their nearest stem sample, rotate with it, and add their
  own noise flutter plus a slight `scale(x)` turn whose strength rises with wind.
- Runs only while the SVG is on screen; static under reduced motion. The ellipses carry their rest pose in `data-*`.
