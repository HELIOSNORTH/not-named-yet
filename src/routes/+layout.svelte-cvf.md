# +layout.svelte — CVF (2026-10-13)

- `Site` is mounted in the layout, and the `+page.svelte` files are empty on purpose. EN ⇄ DA is then a client-side
  route change that keeps the film, the WebGL context and the scroll position. Mounting `Site` in pages would remount
  everything.
- Prerendered static HTML, with no runtime server: a public page needs real HTML for search and link previews.
- `trailingSlash = 'always'` emits `da/index.html`, so any static host serves it without rewrites.
- `app.html` holds the loading veil and the 1.5 s entrance timer. They must work before JS hydrates, which is why
  they are inline and not in a component.
