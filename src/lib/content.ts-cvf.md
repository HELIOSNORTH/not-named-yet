# content.ts — CVF (2026-10-13)

- Single source for every visible string. The English copy is the owner's exact text; do not "improve" it.
- `registration` keeps the literal `© 2026` from the supplied text. Change it deliberately; it is not computed.
- Danish copy is our translation (needs owner review). `­` soft hyphens in long Danish compounds let the hero's
  one-word-per-line stack break cleanly on phones without shrinking the type for every screen.
- `headline` is `[sentence][word]`: Hero renders one word per line, Sheet flows words and lights them per index.
  Sentence 2 is styled secondary in the hero; keep two sentences.
- `localeFromPath` is shared by `hooks.server.ts` (sets `<html lang>` at prerender) and the layout (client nav).
