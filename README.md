# Hartmann Software — website

Single-page marketing site for Hartmann Software (enterprise software architecture, Vejle, Denmark).
Two prerendered locales: English at `/`, Danish at `/da/`. Last reviewed 2026-10-13.

## Concept

The brand line is the design brief: _world-class software architecture inside, Scandinavian design outside._

1. **Hero (inside).** Full-bleed cinematic video, stacked headline revealed word by word, Liquid Glass controls.
2. **Sheet (outside).** A warm-paper sheet slides over the hero like an iOS sheet; the hero recedes (scale, radius, dim).
   The headline repeats as a pinned statement whose words light up as you scroll.
3. **Signature.** A full-width `Hartmann` wordmark whose letters are windows onto the same video: the architecture
   shows through, the surface stays calm paper.
4. **Contact + legal.** CONSULT (mailto), email, phone, company line.

Light and dark mode follow the OS. `prefers-reduced-motion` removes every animation, the pinned scroll and autoplay.

## Stack

- SvelteKit 3 (Svelte 5 runes), `adapter-static`, Tailwind CSS 4, TypeScript, Prettier.
- Node 24 LTS via `flake.nix` (`nix develop`), pnpm. Node ≥22 also builds it.
- No runtime server: output is plain static files in `build/`.

## Commands

```sh
nix develop          # once per shell
pnpm install
pnpm dev             # local dev server
pnpm build           # static site -> build/
pnpm preview         # serve build/
pnpm check           # svelte-check + types
pnpm lint / format   # prettier
```

## Layout

| Path                               | What                                                                 |
| ---------------------------------- | -------------------------------------------------------------------- |
| `src/lib/content.ts`               | All copy (EN/DA), contact data, video URL, site URL                  |
| `src/routes/+layout.svelte`        | `<head>` metadata, mounts `Site` (see its CVF for why in the layout) |
| `src/routes/layout.css`            | Design tokens, font stack, Liquid Glass recipe                       |
| `src/lib/components/Site.svelte`   | Single scroll loop driving `--cover`, `--read`, header tone          |
| `src/lib/components/Header.svelte` | Monogram, EN · DA switch, CONSULT                                    |
| `src/lib/components/Hero.svelte`   | Video hero, headline reveal, pause control                           |
| `src/lib/components/Sheet.svelte`  | Scroll-read statement, video wordmark, contact, legal                |
| `static/og.jpg`, `static/*icon*`   | Social preview and icons                                             |

Non-obvious reasoning lives next to the code in `*-cvf.md` files (Compressed Value Files). Code has no comments.

## Deploy

Upload `build/` to any static host or CDN. Routes are directories (`/da/index.html`), so no rewrite rules are needed.
Recommended headers: long-cache `/_app/immutable/*`; short-cache HTML.

## Assumptions to confirm (owner)

- Danish copy in `content.ts` is a translation of the supplied English text (CONSULT → `RÅDGIVNING`). Review wording.
- Canonical origin is `https://hartmannsoft.com`.
- The hero video URL could not be fetched from the build sandbox (network policy), so the design was verified with a
  stand-in clip. Scrims are deliberately strong enough to keep white type legible on any footage; re-check on the real
  video and soften `.scrim` in `Hero.svelte` if the footage is already dark.

## Docs

- `docs/milestones.md` — what shipped and what is next.
