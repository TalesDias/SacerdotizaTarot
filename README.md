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

## Cloudflare

Deployed as a **Worker serving static assets** (not a Pages project):
`sacerdotiza-tarot.dtales15.workers.dev`. `wrangler.jsonc` declares it — no
`main`, just `assets.directory` pointing at `dist/`, so the deploy uploads the
built files and runs no server code.

| | |
|---|---|
| Build command | `npm run build` |
| Deploy command | `npx wrangler deploy` |
| Output directory | `dist` |
| Node version | pinned to 22.12.0 by `.nvmrc` |

Two settings exist because Cloudflare's "import a repository" flow guesses, and
guessed wrong once already:

- **`.nvmrc`** — Astro 7 needs Node >= 22.12.0; the build image defaults to 18.
- **`output: 'static'`** in `astro.config.mjs` — the import flow fits an SSR
  adapter to Astro projects, and a server-rendered build defers every image to
  the `/_image` endpoint rather than optimising it at build. Deployed as static
  assets, nothing answers `/_image`, so every image 404s while the HTML, CSS and
  fonts look fine. Stating `output` keeps the images as files.

`public/_headers` ships the cache and security headers.

**Before the custom domain:** `site` in `astro.config.mjs` falls back to the
workers.dev URL. Once the domain is live, set a `SITE_URL` build variable (or
change the fallback) — canonical, Open Graph, sitemap and JSON-LD all derive
from it.

**Analytics:** enable Cloudflare Web Analytics on the project in the dashboard.
It auto-injects the beacon — nothing to add here. It sets no cookies, so no
consent banner is needed.

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
CSS, the FAQ is native `<details name="faq">`, and the inline scripts drive the
promo `<dialog>`, the portrait flip and the phone package carousel. Every price,
description and FAQ answer is in the served HTML, so it is all indexable with
scripting off.

## Promo dialogs

Three of them, in `PROMOS` in `src/data/content.ts`, listed highest priority
first. At most one is ever shown — the first whose window is open. Windows are
read off **Brazil's clock** (`America/Sao_Paulo`), since the offers run on São
Paulo time, and live in `PromoDialog.astro`:

| Promo | Window | Priority |
|---|---|---|
| Dia dos Namorados | 6–12 June, the 12th included | highest |
| Caixinha do Tarot | Friday 09:00 → Saturday 09:00, weekly | middle |
| Tiragem de Fim de Ano | 1 December → 31 January | lowest |

Closing one stores its **occasion** (`sac-promo-<id>` in localStorage: a Friday's
date, or a year), so a dismissal silences that Friday or that June, not every one
after. Dismissals are per promo, so closing the year-end one still leaves Friday's
Caixinha free to appear. The dialog is desktop-only — a full-screen interstitial
on mobile is the pattern Google penalises.

### Previewing them

Two query parameters, safe to leave in production since neither shows anything a
visitor could not see by waiting for the date:

```
?promo=namorados          force a dialog open, ignoring date, dismissal and the
?promo=caixinha           desktop-only rule — closing it stores nothing
?promo=ano-novo

?now=2026-06-12T23:59:00-03:00     run the real schedule against a made-up clock
?now=2026-12-04T13:00:00-03:00     (this one lands on a Friday in December, so
                                    Caixinha outranks the year-end promo)
```

`?now=` drives the actual window logic, so it is the one that proves the
schedule. Clear a dismissal with `localStorage.clear()` in the console.

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
