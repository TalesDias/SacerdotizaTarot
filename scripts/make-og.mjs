/**
 * Regenerates public/og.png (1200x630), the Open Graph card.
 *
 * Not part of `npm run build` — the output is committed. Re-run it only when the
 * brand or the portrait changes:  node scripts/make-og.mjs
 *
 * Requires DM Serif Display and Nunito to be resolvable by fontconfig. Astro
 * downloads them into dist/_astro/fonts as woff2; convert and install with:
 *   npx wawoff2 ... && cp *.ttf ~/.local/share/fonts/ && fc-cache -f
 */
import sharp from 'sharp';
import { writeFileSync } from 'node:fs';

const W = 1200, H = 630;
const CX = 930, CY = 315, R = 168, RING = 182;

const blob = (x, y, r, fill, o) =>
  `<circle cx="${x}" cy="${y}" r="${r}" fill="${fill}" opacity="${o}" filter="url(#soft)"/>`;

const sparkle = (x, y, s, fill) =>
  `<path transform="translate(${x} ${y}) scale(${s})" fill="${fill}"
     d="M0 -10 L3 -3 10 0 3 3 0 10 -3 3 -10 0 -3 -3 Z"/>`;

const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}">
  <defs>
    <filter id="soft" x="-50%" y="-50%" width="200%" height="200%">
      <feGaussianBlur stdDeviation="55"/>
    </filter>
  </defs>

  <rect width="${W}" height="${H}" fill="#faf6ee"/>

  ${blob(-40, 90, 250, '#f4d3da', 0.85)}
  ${blob(1160, 560, 260, '#cfe9ea', 0.8)}
  ${blob(560, -80, 200, '#e6dcf5', 0.7)}
  ${blob(150, 640, 210, '#efe9cf', 0.8)}

  <text x="88" y="238" font-family="DM Serif Display" font-size="96" fill="#7b6a5e">A Sacerdotiza</text>
  <text x="88" y="338" font-family="DM Serif Display" font-size="96" fill="#4a3f38">Tarot</text>

  <rect x="90" y="386" width="104" height="8" fill="#f4a3b4"/>

  <text x="88" y="452" font-family="Nunito, DejaVu Sans" font-size="27"
        letter-spacing="4.6" fill="#7b6a5e">TAROT E BARALHO CIGANO ONLINE</text>

  <text x="88" y="512" font-family="Nunito, DejaVu Sans" font-size="26" fill="#6c5f56">
    Tiragens, perguntas avulsas e pacotes · a partir de R$ 10
  </text>

  <circle cx="${CX}" cy="${CY}" r="${RING}" fill="#ffffff"/>
  ${sparkle(CX - 195, CY - 150, 2.1, '#f2c94c')}
  ${sparkle(CX + 176, CY - 96, 1.5, '#c79ae8')}
  ${sparkle(CX + 150, CY + 178, 1.8, '#7fc9cd')}
</svg>`;

const bg = await sharp(Buffer.from(svg)).png().toBuffer();

const mask = Buffer.from(
  `<svg xmlns="http://www.w3.org/2000/svg" width="${R * 2}" height="${R * 2}">
     <circle cx="${R}" cy="${R}" r="${R}" fill="#fff"/></svg>`,
);

const face = await sharp('src/assets/yara.webp')
  .resize(R * 2, R * 2, { fit: 'cover' })
  .composite([{ input: mask, blend: 'dest-in' }])
  .png()
  .toBuffer();

const out = await sharp(bg)
  .composite([{ input: face, left: CX - R, top: CY - R }])
  .png({ compressionLevel: 9, palette: true })
  .toBuffer();

writeFileSync('public/og.png', out);
console.log('public/og.png', out.length, 'bytes');
