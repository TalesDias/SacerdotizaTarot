# A Sacerdotiza Tarot

Single-page site for Yara Faria's tarot and baralho cigano readings, built from the
Claude Design canvas. Static Astro, no client framework, deployed to Cloudflare Pages.

## Running it

```bash
npm install
npm run dev        # http://localhost:4321
npm run build      # → dist/
npm run preview    # serve dist/
npm run check      # TypeScript / Astro diagnostics
```

## Before the first deploy

**Set the real domain.** Everything that needs an absolute URL — the canonical
link, `og:url`, `og:image`, `sitemap.xml`, `robots.txt` and the JSON-LD `@id`s —
derives from one value: `site` in `astro.config.mjs`, which reads `SITE_URL`.

Until the domain is registered it falls back to `https://sacerdotiza-tarot.pages.dev`.
Set it in the Cloudflare Pages project under **Settings → Environment variables**:

```
SITE_URL = https://seudominio.com.br
```

## Cloudflare Pages settings

| | |
|---|---|
| Build command | `npm run build` |
| Output directory | `dist` |
| Node version | 20 or newer |

`public/_headers` ships the cache and security headers; Pages picks it up automatically.

**Analytics:** enable Cloudflare Web Analytics on the Pages project in the dashboard.
It auto-injects the beacon — nothing to add here. It sets no cookies, so no consent
banner is needed.

## Where things live

| Path | What |
|---|---|
| `src/data/content.ts` | Every reading, tier, package and FAQ. **Edit prices here** — the page and the JSON-LD both read from it, so they cannot drift. |
| `src/data/site.ts` | WhatsApp number, Instagram handle, `<title>`, meta description |
| `src/data/schema.ts` | Builds the schema.org graph from the above |
| `src/components/` | One component per section, styles scoped in each file |
| `src/styles/globals.css` | Palette tokens, reset, keyframes |
| `scripts/make-og.mjs` | Regenerates `public/og.png`; not part of the build |

Changing the WhatsApp number is a one-line edit in `src/data/site.ts`; all 18 links
follow.

## Interactivity

The page ships **no JavaScript bundle**. The reading cards expand on hover in pure
CSS, the FAQ is native `<details name="faq">`, and the only script is ~15 inline
lines driving the promo `<dialog>`. Every price, description and FAQ answer is in
the served HTML, so it is all indexable with scripting off.

## Card art

`src/assets/tarot/Major_Arcana_webp/` holds the 22 Rider-Waite-Smith Major Arcana.
One peeks above each reading on hover, assigned in deck order.

Four cards — Hanged Man, Death, Devil, Tower — are excluded at the glob in
`Spreads.astro`, so they are never bundled: that imagery reads as ominous beside a
price and a booking button. That leaves 18 cards for 14 readings, so each reading
gets a distinct one. See `src/assets/tarot/README.md`.

The full deck scan is kept at `reference/Rider-Waite-Smith Tarot Deck small.pdf`.
The source PNGs (42 MB) were converted to webp (1.9 MB) and dropped; the
conversion recipe is in that same README.
