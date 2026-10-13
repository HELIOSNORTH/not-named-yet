# layout.css — CVF (2026-10-13)

- Font stack puts the Apple system font first (SF Pro on Apple devices, the intended look) with self-hosted Inter
  Variable as the fallback elsewhere. Inter is only downloaded when the system font is missing. Self-hosted rather
  than Google Fonts, because loading Google Fonts from the browser leaks visitor IPs (an EU/GDPR issue for a Danish company).
- `.glass` approximates Liquid Glass in CSS: blur + saturation backdrop, top specular rim, soft radial sheen. Real
  refraction needs SVG displacement filters, which Safari does not support on `backdrop-filter`, so it is left out.
- `data-tone="paper"` switches glass to the light variant when the sheet is under the header. Dark-mode overrides sit
  after the hover rules so they win the cascade.
- `--spring` is a `linear()` spring curve used for press and hover feedback.
- No normalize.css / sanitize.css: Tailwind 4 preflight already covers both.
