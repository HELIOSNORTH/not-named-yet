# glass.ts — CVF (2026-10-13)

- One full-screen fragment shader draws only the fog. The sharp film underneath is the plain `<video>` element, so
  clear areas cost nothing and keep full HLS resolution.
- Fog needs a blurred copy of the film: each frame the video is drawn into a 256 px-wide 2D canvas, uploaded, and
  mipmapped. Mip LOD + a 9-tap disc gives a cheap, wide blur. Uploading the full 1080p/4K frame would cost far more.
- Wipe mask is a CPU `Float32Array` at 1/6 viewport resolution, not a 2D canvas: 8-bit canvas fading stalls and only
  decays exponentially. Values peak at 1.6 and decay linearly, so a wipe stays clear about 6 s and then fogs back in
  from its soft edges first, as real condensation does.
- `uIntro` 0 renders solid paper (#efebe4), matching the loading veil. The veil therefore fades into paper and the
  paper "defrosts" into fog with no visible seam. Until a frame exists the glass stays paper, so a failed video still
  looks like the old paper page.
- Adaptive resolution: if frames run slow, the canvas resolution drops (to a floor of 0.6×). The fog is soft, so the
  loss is barely visible.
- The video host's CORS allows only `https://hartmannsoft.com`. Elsewhere `drawImage` taints the canvas, `texImage2D`
  throws, and the renderer falls back to the poster image permanently.
