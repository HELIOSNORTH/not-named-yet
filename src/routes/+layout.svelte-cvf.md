# +layout.svelte — CVF (2026-10-13)

- `Site` is mounted in the layout, and `+page.svelte` files are empty on purpose. Switching EN ⇄ DA is a client-side
  route change; keeping the component in the layout means the hero video keeps playing and only the copy swaps.
  Moving `Site` into pages would remount it and restart the video and intro.
- Prerendered static HTML, not runtime SSR and not an SPA shell: a public marketing page needs real HTML for search,
  link previews and first paint. There is no server at runtime.
- Locale routing uses two plain routes (`/`, `/da/`) instead of an optional `[[lang]]` param: SvelteKit 3 changed param
  matchers (`defineParams`), and two routes are simpler. `trailingSlash = 'always'` emits `da/index.html` so any static
  host serves it without rewrites.
