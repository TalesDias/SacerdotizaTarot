/**
 * Traffic report for asacerdotiza.com.br, straight from Cloudflare's GraphQL API.
 *
 *   node scripts/analytics.mjs              # print the tables
 *   node scripts/analytics.mjs --days 7     # widen the beacon window (default 7)
 *   node scripts/analytics.mjs --html out.html
 *
 * Config lives in .env, which is gitignored — copy .env.example and fill it in.
 * The token needs exactly two permissions:
 *
 *     Account : Account Analytics : Read     (the Web Analytics beacon)
 *     Zone    : Analytics         : Read     (raw User-Agents at the edge)
 *
 * Those two are enough. The status header also tries to read the beacon's own
 * configuration, which needs a wider account permission; when that call fails
 * the header says so and the report runs anyway.
 *
 * The OAuth token `wrangler login` caches will NOT do — its scopes cover
 * Workers deploys, not analytics, so the RUM calls come back 10000.
 *
 * Two datasets, and the difference between them is the whole point:
 *
 *   rumPageloadEventsAdaptiveGroups — the Web Analytics beacon. Only fires when
 *     a real browser executes JavaScript, so it is the closest thing to a count
 *     of people. Bound to the zone, so it sees nothing served from workers.dev.
 *
 *   httpRequestsAdaptiveGroups — every request the edge answered, with the raw
 *     User-Agent. Honest but noisy: one page load pulls ~30 assets, and plenty
 *     of scanners send a browser UA. Capped at a 1-day query window on the
 *     free plan, which is why the UA table only ever covers 24h.
 */
import { existsSync, writeFileSync } from 'node:fs';

// Node's own .env reader — no dotenv dependency. Absent file is fine: the
// values can just as well come from the real environment or from CI.
try {
  process.loadEnvFile('.env');
} catch {}

const API = 'https://api.cloudflare.com/client/v4';

const arg = (name, fallback) => {
  const i = process.argv.indexOf(`--${name}`);
  return i === -1 ? fallback : process.argv[i + 1];
};
const DAYS = Number(arg('days', 7));
const HTML_OUT = arg('html', null);

/*
 * Report every missing name at once. Being told about the token, running off to
 * make one, and only then learning the zone id is missing too is a bad trade
 * for the four lines it costs to check them together.
 */
const REQUIRED = {
  CLOUDFLARE_API_TOKEN: 'API token — see the header comment for its two permissions',
  CLOUDFLARE_ACCOUNT_ID: 'account id — Cloudflare dashboard sidebar, or `wrangler whoami`',
  CLOUDFLARE_ZONE_ID: 'zone id — the zone Overview page for asacerdotiza.com.br',
  CLOUDFLARE_RUM_SITE: 'Web Analytics site tag — the beacon snippet calls it `token`',
};

const missing = Object.keys(REQUIRED).filter((k) => !process.env[k]);
if (missing.length) {
  console.error(`Missing ${missing.length === 1 ? 'one setting' : missing.length + ' settings'}:\n`);
  for (const k of missing) console.error(`  ${k}\n      ${REQUIRED[k]}`);
  console.error(
    existsSync('.env')
      ? `\nSet ${missing.length === 1 ? 'it' : 'them'} in .env — it is gitignored, so nothing lands in git.\n`
      : `\nCopy the template and fill it in — .env is gitignored, so nothing lands in git:\n\n  cp .env.example .env\n`
  );
  process.exit(1);
}

const env = (k) => process.env[k];
const AUTH = { Authorization: `Bearer ${env('CLOUDFLARE_API_TOKEN')}` };

async function rest(path, query = {}) {
  const url = new URL(API + path);
  for (const [k, v] of Object.entries(query)) url.searchParams.set(k, v);
  const r = await fetch(url, { headers: AUTH });
  const j = await r.json();
  if (!j.success) throw new Error(`${path}: ${JSON.stringify(j.errors)}`);
  return j.result;
}

async function gql(query, variables) {
  const r = await fetch(`${API}/graphql`, {
    method: 'POST',
    headers: { ...AUTH, 'content-type': 'application/json' },
    body: JSON.stringify({ query, variables }),
  });
  const j = await r.json();
  if (j.errors?.length) throw new Error(JSON.stringify(j.errors));
  return j.data;
}

/*
 * Buckets for the raw User-Agent table. `APP` catches the in-app webviews that
 * social apps open links in — the single most interesting row here, since the
 * traffic comes from an Instagram bio. `BOT` is deliberately broad: it is
 * better to under-count humans than to report scanners as visitors. It still
 * cannot catch a crawler that lies, which is why the beacon count is the one
 * to quote.
 */
const APP = /Instagram|FBAV|FBAN|FB_IAB|Line\/|WhatsApp|TikTok|Twitter/i;
const BOT =
  /bot\b|bot\/|crawler|crawl|spider|slurp|adwords|adword|facebookexternalhit|axios|curl|wget|python|java\/|go-http|okhttp|checkmark|pandalytics|headless|scanner|zgrab|censys|expanse|semrush|ahrefs|dataprovider|monitor|uptime|probe|inspect|preview|CMS-Checker|WebRender|node-fetch|libwww|Scrapy|masscan|nuclei|^Mozilla\/5\.0$|^$/i;

const RUM_GROUPS = (dims) => `
  query($account: String!, $site: String!, $since: Time!, $until: Time!) {
    viewer { accounts(filter: { accountTag: $account }) {
      rumPageloadEventsAdaptiveGroups(
        filter: { siteTag: $site, datetime_geq: $since, datetime_leq: $until }
        limit: 100, orderBy: [count_DESC]
      ) { count sum { visits } dimensions { ${dims} } }
    } }
  }`;

/* `cols` names what is being counted — these tables mix page views with raw
   requests, and a column headed "views" over a request count is a lie. */
function table(title, rows, keyLabel, cols) {
  const width = Math.max(keyLabel.length, ...rows.map((r) => String(r[0]).length), 1);
  const cell = (v) => String(v ?? '').padStart(7);
  const lines = [`\n${title}`, `${'─'.repeat(width + 2 + cols.length * 9)}`];
  lines.push([keyLabel.padEnd(width), ...cols.map(cell)].join('  '));
  for (const row of rows) {
    lines.push([String(row[0] || '(none)').padEnd(width), ...cols.map((_, i) => cell(row[i + 1]))].join('  '));
  }
  return lines.join('\n');
}

const report = { generated: new Date().toISOString(), sections: [] };
const add = (title, keyLabel, rows, cols = ['views', 'visits']) => {
  report.sections.push({ title, keyLabel, cols, rows });
  console.log(table(title, rows, keyLabel, cols));
};

/*
 * Listing accounts and zones to find these would cost a third token permission
 * (Account Settings: Read), so they are supplied instead of discovered.
 */
const IDS = {
  account: env('CLOUDFLARE_ACCOUNT_ID'),
  zone: env('CLOUDFLARE_ZONE_ID'),
  site: env('CLOUDFLARE_RUM_SITE'),
};

/*
 * The header below is decoration — the report itself is the two GraphQL
 * queries further down. Both of these config reads sit behind account
 * permissions an analytics-read token has no reason to carry, so a failure
 * here costs a line of output and nothing else. Blocking on them would fail
 * a token that can answer every question the script is actually asking.
 */
const optional = (path) => rest(path).then((r) => r, () => null);

const [site, zoneMeta] = await Promise.all([
  optional(`/accounts/${IDS.account}/rum/site_info/${IDS.site}`),
  optional(`/zones/${IDS.zone}`),
]);

const account = { id: IDS.account, name: IDS.account.slice(0, 8) + '…' };
const zone = {
  id: IDS.zone,
  name: zoneMeta?.name ?? site?.ruleset?.zone_name ?? '(not readable with this token)',
  status: zoneMeta?.status ?? 'unknown',
  activated_on: zoneMeta?.activated_on ?? site?.created,
};

console.log(`Account   ${account.name}`);
console.log(`Zone      ${zone.name}  (${zone.status}${zone.activated_on ? ', activated ' + zone.activated_on.slice(0, 10) : ''})`);
if (site) {
  console.log(`Beacon    site ${site.site_tag}  auto_install=${site.auto_install}  ruleset=${site.ruleset.enabled ? 'enabled' : 'DISABLED'}`);
} else {
  console.log(`Beacon    config not readable with this token — it needs an account permission`);
  console.log(`          beyond analytics-read. Harmless: the counts below do not use it.`);
}
console.log(`Note      the beacon is bound to the zone — traffic to *.workers.dev is not counted.`);

const now = Date.now();
const iso = (ms) => new Date(ms).toISOString();
const since = iso(now - DAYS * 864e5);
const until = iso(now);

const rum = async (dim) => {
  // IDS.site, not site.site_tag — the queries must not depend on the optional config read.
  const d = await gql(RUM_GROUPS(dim), { account: IDS.account, site: IDS.site, since, until });
  return d.viewer.accounts[0].rumPageloadEventsAdaptiveGroups.map((g) => [
    g.dimensions[dim.split(' ')[0]],
    g.count,
    g.sum.visits,
  ]);
};

const byDay = (await rum('date')).sort((a, b) => String(a[0]).localeCompare(String(b[0])));
const total = byDay.reduce((a, r) => [a[0] + r[1], a[1] + r[2]], [0, 0]);
add(`Beacon — real browsers, last ${DAYS} days`, 'day', [...byDay, ['TOTAL', ...total]]);
add('Beacon — by browser', 'browser', await rum('userAgentBrowser'));
add('Beacon — by device', 'device', await rum('deviceType'));
add('Beacon — by country', 'country', await rum('countryName'));
add('Beacon — by referrer', 'referrer', await rum('refererHost'));

const edge = await gql(
  `query($zone: String!, $since: Time!, $until: Time!) {
    viewer { zones(filter: { zoneTag: $zone }) {
      httpRequestsAdaptiveGroups(
        filter: { datetime_geq: $since, datetime_leq: $until }
        limit: 2000, orderBy: [count_DESC]
      ) { count sum { visits } dimensions { userAgent } }
    } }
  }`,
  { zone: zone.id, since: iso(now - 864e5), until }
);

const rows = edge.viewer.zones[0].httpRequestsAdaptiveGroups;
const buckets = { 'in-app browsers': [0, 0, 0], 'plain browser UAs': [0, 0, 0], 'bots & tools': [0, 0, 0] };
const bots = new Map();
for (const { count, sum, dimensions } of rows) {
  const ua = dimensions.userAgent || '';
  const key = APP.test(ua) ? 'in-app browsers' : BOT.test(ua) ? 'bots & tools' : 'plain browser UAs';
  buckets[key][0] += count;
  buckets[key][1] += sum.visits;
  buckets[key][2] += 1;
  if (key === 'bots & tools') {
    const name = (ua.match(/[A-Za-z][A-Za-z0-9_-]*(?:Bot|bot|Crawler|spider|Adwords|AdWords|externalhit|Checker|Pandalytics|axios|WebRender)/) || [ua.slice(0, 26)])[0];
    bots.set(name, (bots.get(name) || 0) + count);
  }
}

const reqTotal = rows.reduce((a, r) => a + r.count, 0);
console.log(`\nEdge — raw User-Agents, last 24h  (${reqTotal} requests, ${rows.length} distinct UA strings)`);
add('Edge — traffic by kind', 'kind',
  Object.entries(buckets).map(([k, v]) => [`${k} (${v[2]} UAs)`, v[0], v[1]]),
  ['requests', 'visits']);
add('Edge — self-declared bots', 'signature',
  [...bots.entries()].sort((a, b) => b[1] - a[1]).slice(0, 15).map(([k, v]) => [k, v]),
  ['requests']);

console.log(`
One page load pulls ~30 assets, so ${reqTotal} requests is roughly ${Math.round(reqTotal / 30)} page loads,
not ${reqTotal} people. The "plain browser UAs" row is also padded by scanners
wearing browser costumes. Quote the beacon total (${total[0]} views / ${total[1]} visits).`);

if (HTML_OUT) {
  writeFileSync(HTML_OUT, JSON.stringify(report, null, 2));
  console.log(`\nwrote ${HTML_OUT}`);
}
