/** Business identity, contact details and SEO strings. */

export const SITE_NAME = 'A Sacerdotiza Tarot';
export const TAROLOGA = 'Yara Faria';
export const TAGLINE = 'Tarot e Baralho Cigano Online';

/** Country code + area code + number, digits only. Change here and every CTA follows. */
export const WHATSAPP_NUMBER = '5535984356580';

export const INSTAGRAM_HANDLE = 'a_sacerdotiza';
export const INSTAGRAM_URL = `https://instagram.com/${INSTAGRAM_HANDLE}`;

export const SEO_TITLE = 'A Sacerdotiza Tarot | Tarot e Baralho Cigano Online';
export const SEO_DESCRIPTION =
  'Tiragens de tarot e baralho cigano com Yara Faria: amor, autoconhecimento, ' +
  'carreira e perguntas avulsas a partir de R$ 10. Atendimento online pelo WhatsApp.';

/** A WhatsApp deep link, optionally with a pre-filled message. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${WHATSAPP_NUMBER}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}

/** The per-reading booking link, reproducing the message the design specifies. */
export function bookingLink(readingTitle: string): string {
  return waLink(`Olá, vi no site o jogo ${readingTitle} e gostaria de agendar uma consulta`);
}
