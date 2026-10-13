# Hartmann Software — website

Marketing site for Hartmann Software (enterprise software architecture, Vejle, Denmark).
English at `/`, Danish at `/da/`. Prerendered static files. Last reviewed 2026-10-13.

## Concept: "The Window"

The hero film is Vejle Fjord at blue hour in winter, with Bølgen ("The Wave"), filmed from inside a car through a
fogged window. The brand line describes that scene literally: _world-class software architecture inside,
Scandinavian design outside._

1. **Loading veil** (unchanged from the previous site): paper screen, letter-spaced `HARTMANN`.
2. **Defrost**: the paper veil dissolves into fogged glass with the film behind it, rendered in WebGL2.
3. **Wipe**: an invisible hand wipes a clear stripe across the glass to reveal Bølgen. Visitors can wipe too (mouse or
   finger). Wiped glass fogs back in from the edges after a few seconds.
4. **Roll down**: scrolling lowers the window. The glass edge, with a warm glint, slides down and leaves the open, sharp view.
5. **Sunlight** (unchanged from the previous site): the contact room with window light and a swaying branch.

The page runs from cold blue dusk outside to warm sunlight inside, with a window at each end.

## Stack

SvelteKit 3 (Svelte 5), `adapter-static`, Tailwind CSS 4, TypeScript, Prettier, hls.js (light build, loaded only where
native HLS is missing). Fonts: Instrument Serif + Inter Variable, self-hosted. Node 24 LTS via `flake.nix`.

## Commands

```sh
pnpm install
pnpm dev | build | preview | check | lint | format
```

## Layout

| Path                                       | What                                                            |
| ------------------------------------------ | --------------------------------------------------------------- |
| `src/app.html`                             | Loading veil + entrance timer (`data-hartmann-entrance`)        |
| `src/lib/content.ts`                       | All copy (EN/DA), film URLs, contact data                       |
| `src/lib/components/Hero.svelte`           | Film, glass canvas, headline, scroll roll-down, wiping          |
| `src/lib/glass/`                           | WebGL2 condensation renderer, shaders, film framing, HLS loader |
| `src/lib/components/Correspondence.svelte` | Sunlight contact room (ported 1:1 from the previous site)       |
| `src/lib/components/Header.svelte`         | H monogram, EN · DA, CONSULT (ported 1:1)                       |

Reasoning that the code cannot show lives in `*-cvf.md` files next to the code. Code has no comments.

## Deploy

Upload `build/` to `hartmannsoft.com`. The video host sends `Access-Control-Allow-Origin: https://hartmannsoft.com`
only, and the glass needs CORS to read video frames. On any other origin the glass falls back to the poster frame
(still fogged and wipeable, but the fog doesn't move with the film).

## Docs

- `docs/milestones.md`
