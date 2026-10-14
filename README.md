# Hartmann Software — website

Marketing site for Hartmann Software (enterprise software architecture, Vejle, Denmark).
English at `/`, Danish at `/da/`. Prerendered static files. Last reviewed 2026-10-13.

## Concept: "Title Sequence" (chosen 2026-10-14)

The hero film is Vejle Fjord at blue hour in winter, with Bølgen ("The Wave"), filmed from a moving car. The page
opens like the title sequence of a Nordic film:

1. **Loading veil** (unchanged from the previous site): paper screen, letter-spaced `HARTMANN`.
2. **Opening**: on a softly lit paper wall, an ink hairline draws at the horizon and opens like an iris into a
   panoramic band of the film, which racks from soft to sharp focus. A faint film-matched cool tint sits on the paper
   around the band.
3. **Credits**: "World-class software architecture _inside._" top-left, "Scandinavian design _outside._" bottom-right,
   the Hartmann lockup bottom-left.
4. **Scroll**: the two paper sheets slide away with their text, and the film fills the screen. The contact section then
   rises over the film like a sheet of paper; the film drifts up more slowly (parallax) and dims under the sheet's
   shadow. There is no idle stretch and no title card (owner: "stay tasteful").
5. **Sunlight room** (from the previous site): its window light blooms in as it arrives, and the branch shadow
   sways in physically simulated wind.

Earlier concepts (Liquid Glass page, fogged-glass "The Window", title card + dawn dissolve) were dropped after owner
review; see `docs/milestones.md`.

## Stack

SvelteKit 3 (Svelte 5), `adapter-static`, Tailwind CSS 4, TypeScript, Prettier, hls.js (light build, loaded only where
native HLS is missing). No WebGL: the hero is a `<video>` plus CSS `clip-path` driven by two variables. Fonts: Instrument Serif + Inter Variable, self-hosted. Node 24 LTS via `flake.nix`.

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

Upload `build/` to any static host (intended: `hartmannsoft.com`). The video host's CORS allows
`https://hartmannsoft.com`, which hls.js needs to fetch the stream. On other origins Safari still plays native HLS,
and other browsers fall back to the MP4.

## Docs

- `docs/milestones.md`
