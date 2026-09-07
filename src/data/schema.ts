/**
 * schema.org graph, built from content.ts so prices and answers can never
 * drift between what the page shows and what crawlers read.
 *
 * Modelled as Organization + Service rather than LocalBusiness/ProfessionalService:
 * the business is online-only (WhatsApp), and LocalBusiness without a postal
 * address produces validation warnings.
 */
import {
  READING_GROUPS,
  QUESTION_TIERS,
  TIME_TIERS,
  PACKAGES,
  FAQS,
  BIO,
} from './content';
import {
  SITE_NAME,
  TAROLOGA,
  SEO_DESCRIPTION,
  INSTAGRAM_URL,
  waLink,
  bookingLink,
} from './site';

interface Options {
  siteUrl: string;
  /** Built URL of the portrait, passed in from the page. */
  portraitUrl: string;
}

const brl = (n: number) => n.toFixed(2);

export function buildGraph({ siteUrl, portraitUrl }: Options) {
  const base = siteUrl.replace(/\/$/, '');
  const orgId = `${base}/#business`;
  const personId = `${base}/#yara`;
  const catalogId = `${base}/#catalogo`;
  const serviceId = `${base}/#servico`;

  const offer = (
    name: string,
    price: number,
    description: string,
    category: string,
  ) => ({
    '@type': 'Offer',
    name,
    description,
    category,
    price: brl(price),
    priceCurrency: 'BRL',
    availability: 'https://schema.org/InStock',
    url: bookingLink(name),
    seller: { '@id': orgId },
  });

  const offers = [
    ...READING_GROUPS.flatMap((g) =>
      g.readings.map((r) => offer(r.title, r.price, r.text, g.name)),
    ),
    ...QUESTION_TIERS.map((t) =>
      offer(
        `${t.headline} ${t.unit}`,
        t.price,
        t.text.replace(/<[^>]+>/g, ''),
        'Perguntas avulsas',
      ),
    ),
    ...TIME_TIERS.map((t) =>
      offer(`Consulta de ${t.headline}`, t.price, t.text, 'Consulta por tempo'),
    ),
    ...PACKAGES.map((p) =>
      offer(
        p.name,
        p.price,
        p.description ?? (p.items ?? []).join(', '),
        'Pacotes',
      ),
    ),
  ];

  return {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'WebSite',
        '@id': `${base}/#website`,
        url: `${base}/`,
        name: SITE_NAME,
        description: SEO_DESCRIPTION,
        inLanguage: 'pt-BR',
        publisher: { '@id': orgId },
      },
      {
        '@type': 'Organization',
        '@id': orgId,
        name: SITE_NAME,
        description: SEO_DESCRIPTION,
        url: `${base}/`,
        image: portraitUrl,
        logo: `${base}/og.png`,
        founder: { '@id': personId },
        sameAs: [INSTAGRAM_URL, waLink()],
        areaServed: { '@type': 'Country', name: 'Brasil' },
      },
      {
        '@type': 'Person',
        '@id': personId,
        name: TAROLOGA,
        jobTitle: 'Taróloga',
        description: BIO,
        image: portraitUrl,
        knowsLanguage: 'pt-BR',
        sameAs: [INSTAGRAM_URL],
        worksFor: { '@id': orgId },
      },
      {
        '@type': 'Service',
        '@id': serviceId,
        name: 'Tiragens de tarot e baralho cigano',
        serviceType: 'Consulta de tarot',
        description: SEO_DESCRIPTION,
        provider: { '@id': orgId },
        areaServed: { '@type': 'Country', name: 'Brasil' },
        availableChannel: {
          '@type': 'ServiceChannel',
          serviceUrl: waLink(),
          name: 'WhatsApp',
        },
        hasOfferCatalog: { '@id': catalogId },
      },
      {
        '@type': 'OfferCatalog',
        '@id': catalogId,
        name: 'Tiragens, perguntas avulsas e pacotes',
        inLanguage: 'pt-BR',
        itemListElement: offers,
      },
      {
        '@type': 'FAQPage',
        '@id': `${base}/#faq`,
        inLanguage: 'pt-BR',
        mainEntity: FAQS.map((f) => ({
          '@type': 'Question',
          name: f.q,
          acceptedAnswer: { '@type': 'Answer', text: f.a.replace(/\s*\n+\s*/g, ' ') },
        })),
      },
    ],
  };
}
