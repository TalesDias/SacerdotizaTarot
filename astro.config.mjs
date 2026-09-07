import { defineConfig, fontProviders } from 'astro/config';

// The custom domain is not registered yet. Cloudflare Pages serves every project
// on a working *.pages.dev URL, so that is the fallback; set SITE_URL in the
// Pages build settings (or a local .env) once the real domain is live. Canonical,
// Open Graph, sitemap and JSON-LD URLs all derive from this one value.
const site = process.env.SITE_URL ?? 'https://sacerdotiza-tarot.pages.dev';

export default defineConfig({
  site,
  trailingSlash: 'never',

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
