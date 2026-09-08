import { defineConfig, fontProviders } from 'astro/config';

// The custom domain is not registered yet, so the fallback is the workers.dev
// URL the site is actually reachable on — a canonical tag pointing at a host
// that does not exist is worse than a temporary one. Set SITE_URL (build
// variable, or a local .env) once the real domain is live. Canonical, Open
// Graph, sitemap and JSON-LD URLs all derive from this one value.
const site = process.env.SITE_URL ?? 'https://sacerdotiza-tarot.dtales15.workers.dev';

export default defineConfig({
  site,
  trailingSlash: 'never',

  // Explicit, though it is the default. Cloudflare's "import a repository" flow
  // fits an SSR adapter to an Astro project, and a server-rendered build defers
  // every image to the /_image endpoint instead of optimising it at build time —
  // which is exactly how the images broke. Stated here, the pages prerender and
  // the images come out as files whatever the build container decides to add.
  output: 'static',

  fonts: [
    {
      provider: fontProviders.google(),
      name: 'DM Serif Display',
      cssVariable: '--font-serif',
      // No italic anywhere in the design, and every character on the page
      // falls inside the 'latin' subset — so this is two files, not six.
      weights: [400],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['Georgia', 'serif'],
    },
    {
      provider: fontProviders.google(),
      name: 'Nunito',
      cssVariable: '--font-sans',
      weights: [300, 400, 600, 700],
      styles: ['normal'],
      subsets: ['latin'],
      fallbacks: ['system-ui', 'sans-serif'],
    },
  ],

  vite: {
    build: {
      // Without explicit targets the CSS minifier emits media-query range
      // syntax only — (width<=759px) — which iOS Safari below 16.4 ignores,
      // dropping phones onto the desktop layout.
      cssTarget: ['chrome100', 'safari15.4', 'firefox100', 'edge100'],
    },
  },
});
