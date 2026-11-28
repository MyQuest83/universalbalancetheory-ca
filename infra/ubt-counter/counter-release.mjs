import { readFileSync, writeFileSync } from 'node:fs';
import { createServer } from 'node:http';
import { extname } from 'node:path';
import { text } from 'node:stream/consumers';

const siteRoot = new URL('../../', import.meta.url);
const profiles = {
  staging: { worker: 'ubt-first-party-counter-staging', database: 'ubt-homepage-visits-staging' },
  production: { worker: 'ubt-first-party-counter', database: 'ubt-homepage-visits' }
};
const stagingSite = 'http://127.0.0.1:8788';
const publicSites = ['https://universalbalancetheory.ca', 'https://www.universalbalancetheory.ca'];
const subdomainPattern = /^[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?$/;
const pausedScript = '<script src="visitor-counter.js?v=20261125-final-polish"></script>';
const pausedDisclosure = '<p>The steampunk visitor counter is currently paused while a first-party replacement is prepared and verified. It sends no counter requests and uses no cookies, browser storage, visitor identifiers or fingerprinting. When activated, it will count homepage openings, including refreshes, rather than unique people.</p>';
const activeDisclosure = '<p>The visitor counter attempts one increment per fresh visible homepage opening, including refreshes. It does not measure unique visitors. The counter uses no cookies, browser storage, visitor identifiers or fingerprinting. Cloudflare hosts the counter API, which stores only the running total. Cloudflare processes ordinary network information, including IP addresses, when the API is contacted. GitHub hosts the website.</p>';

function requireCheck(condition, message) {
  if (!condition) throw new Error(message);
}

function workerOrigin(profile, subdomain) {
  requireCheck(subdomainPattern.test(subdomain ?? ''), 'Enter the verified workers.dev account subdomain.');
  return 'https://' + profile.worker + '.' + subdomain + '.workers.dev';
}

function checkOrigin(profile, input) {
  const url = URL.canParse(input) ? new URL(input) : null;
  const exactOrigin = workerOrigin(profile, url?.hostname.split('.')[1]);
  requireCheck(input === exactOrigin, 'Enter the exact Worker HTTPS origin without a path, port or query.');
  return exactOrigin;
}

function readSite(file) {
  return readFileSync(new URL(file, siteRoot), 'utf8');
}

function replaceOnce(source, before, after, location) {
  requireCheck(source.split(before).length === 2, 'Expected the paused markup in ' + location + '. Review the current source.');
  return source.replace(before, after);
}

function enabledHomepage(origin) {
  const script = '<script src="visitor-counter.js?v=20261126-cloudflare-counter" data-first-party-counter="enabled" data-counter-endpoint="' + origin + '/api/visits"></script>';
  const withScript = replaceOnce(readSite('index.html'), pausedScript, script, 'index.html');
  return replaceOnce(withScript, "connect-src 'self';", "connect-src 'self' " + origin + ";", 'index.html CSP');
}

async function createConfig(environment, subdomain) {
  const profile = profiles[environment];
  const origin = workerOrigin(profile, subdomain);
  const account = process.env.CLOUDFLARE_ACCOUNT_ID;
  requireCheck(/^[0-9a-f]{32}$/i.test(account ?? ''), 'Set CLOUDFLARE_ACCOUNT_ID to the verified account ID for this terminal.');
  requireCheck(!process.stdin.isTTY, 'Pipe the output of wrangler d1 list --json into config.');
  const inventory = JSON.parse(await text(process.stdin));
  requireCheck(Array.isArray(inventory), 'Expected the JSON database list from Wrangler.');
  const candidates = inventory.filter(row => row?.name === profile.database);
  requireCheck(candidates.length === 1, 'Expected exactly one D1 database named ' + profile.database + '.');
  const databaseId = candidates[0].uuid;
  requireCheck(/^[0-9a-f]{8}(?:-[0-9a-f]{4}){3}-[0-9a-f]{12}$/i.test(databaseId ?? ''), 'Wrangler did not return a valid database UUID.');
  requireCheck(inventory.filter(row => typeof row?.uuid === 'string' &&
    row.uuid.toLowerCase() === databaseId.toLowerCase()).length === 1, 'The D1 database UUID is ambiguous.');

  const config = JSON.parse(readFileSync(new URL('./wrangler.isolated.jsonc.example', import.meta.url), 'utf8'));
  config.account_id = account;
  config.name = profile.worker;
  config.vars.COUNTER_ORIGIN = origin;
  config.d1_databases[0].database_name = profile.database;
  config.d1_databases[0].database_id = databaseId;
  const filename = 'wrangler.' + environment + '.jsonc';
  const file = new URL(filename, import.meta.url);
  try {
    writeFileSync(file, JSON.stringify(config, null, 2) + '\n', { flag: 'wx', mode: 0o600 });
  } catch (error) {
    if (error.code === 'EEXIST') throw new Error(filename + ' already exists. Review it before reusing or removing it.');
    throw error;
  }
  console.log('Created local infra/ubt-counter/' + filename + '.');
}

async function verifyWorker(environment, origin) {
  const staging = environment === 'staging';
  async function request(method, headers = {}, path = '/api/visits') {
    const response = await fetch(origin + path, {
      method, headers, credentials: 'omit', redirect: 'error', signal: AbortSignal.timeout(10000)
    });
    requireCheck(!response.headers.has('Set-Cookie'), method + ' response set a cookie.');
    requireCheck(!response.headers.has('Access-Control-Allow-Credentials'), method + ' response allowed credentials.');
    return response;
  }
  async function aggregate(response) {
    requireCheck(response.status === 200, 'Expected an aggregate response, received HTTP ' + response.status + '.');
    requireCheck(/\bno-store\b/i.test(response.headers.get('Cache-Control') ?? ''), 'Aggregate response must be uncached.');
    const payload = await response.json();
    requireCheck(payload && Object.keys(payload).sort().join(',') === 'series,value' &&
      payload.series === 'homepage-openings-v1' && Number.isSafeInteger(payload.value) && payload.value >= 0,
      'Aggregate response did not match the expected series and value.');
    return payload.value;
  }

  const before = await aggregate(await request('GET'));
  if (!staging) requireCheck(before === 0, 'The production aggregate is not zero. Review the database before activation.');
  for (const site of staging ? [stagingSite] : publicSites) {
    const options = await request('OPTIONS', {
      Origin: site,
      'Access-Control-Request-Method': 'POST',
      'Access-Control-Request-Headers': 'X-UBT-Gateway'
    });
    requireCheck(options.status === 204 && (await options.text()) === '' &&
      options.headers.get('Access-Control-Allow-Origin') === site &&
      options.headers.get('Access-Control-Allow-Methods') === 'POST' &&
      options.headers.get('Access-Control-Allow-Headers')?.toLowerCase() === 'x-ubt-gateway',
      'CORS preflight did not match the approved homepage.');
  }
  const rejected = await request('GET', { Origin: staging ? publicSites[0] : stagingSite });
  requireCheck(rejected.status === 403 && !rejected.headers.has('Access-Control-Allow-Origin'),
    'The other environment received CORS access.');
  const wrongPath = await request('GET', {}, '/api/visits/extra');
  requireCheck(wrongPath.status === 404, 'Unexpected path was accepted.');
  requireCheck(await aggregate(await request('GET')) === before, 'GET or preflight changed the aggregate, or the instance is in use.');

  if (staging) {
    const denied = await request('POST', { Origin: stagingSite });
    requireCheck(denied.status === 403, 'POST without the gateway header was accepted.');
    requireCheck(await aggregate(await request('GET')) === before, 'A denied staging POST changed the aggregate.');
    const write = await request('POST', { Origin: stagingSite, 'X-UBT-Gateway': '1' });
    requireCheck(write.headers.get('Access-Control-Allow-Origin') === stagingSite, 'Staging POST did not allow the browser origin.');
    const after = await aggregate(write);
    requireCheck(after === before + 1 && await aggregate(await request('GET')) === after,
      'Expected one staging increment to persist into the next request.');
    console.log('Staging PASS: CORS, rejected requests, no cookies and one persisted increment (' + before + ' to ' + after + ').');
  } else {
    console.log('Production PASS: read-only checks, both site origins, no cookies and zero starting total.');
  }
}

function preview(origin) {
  const homepage = enabledHomepage(origin);
  const types = {
    '.html': 'text/html; charset=utf-8',
    '.css': 'text/css; charset=utf-8',
    '.js': 'text/javascript; charset=utf-8',
    '.svg': 'image/svg+xml'
  };
  const files = new Set([
    'links.html', 'styles.css', 'gateway.css', 'gateway-intro.css', 'visitor-counter.css',
    'links-page.css', 'usability.css', 'site.js', 'gateway-warp-renderer.js', 'gateway-intro.js',
    'visitor-counter.js', 'assets/favicon.svg'
  ]);
  const server = createServer((request, response) => {
    const url = URL.canParse(request.url, stagingSite) ? new URL(request.url, stagingSite) : null;
    if (request.method !== 'GET' || request.headers.host !== '127.0.0.1:8788' || url?.origin !== stagingSite) {
      response.writeHead(404).end();
      return;
    }
    const file = url.pathname === '/' ? 'index.html' : url.pathname.slice(1);
    if (file !== 'index.html' && !files.has(file)) {
      response.writeHead(404).end();
      return;
    }
    const body = file === 'index.html' ? homepage : readSite(file);
    response.writeHead(200, { 'Content-Type': types[extname(file)], 'Cache-Control': 'no-cache' }).end(body);
  });
  server.on('error', error => {
    console.error('Could not start the local preview: ' + error.code);
    process.exitCode = 1;
  });
  server.listen(8788, '127.0.0.1', () => console.log('Staging homepage: ' + stagingSite + '/'));
}

function activate(origin) {
  const homepage = enabledHomepage(origin);
  const links = replaceOnce(readSite('links.html'), pausedDisclosure, activeDisclosure, 'links.html');
  writeFileSync(new URL('index.html', siteRoot), homepage);
  writeFileSync(new URL('links.html', siteRoot), links);
  console.log('Prepared index.html and links.html. Review the diff and run the public site checks before pushing.');
}

try {
  const [command, environment, input, ...extra] = process.argv.slice(2);
  const profile = Object.hasOwn(profiles, environment) ? profiles[environment] : null;
  requireCheck(profile && input && !extra.length,
    'Usage: node infra/ubt-counter/counter-release.mjs <config|verify|preview|activate> <staging|production> <subdomain or exact Worker HTTPS origin>');
  if (command === 'config') await createConfig(environment, input);
  else if (command === 'verify') await verifyWorker(environment, checkOrigin(profile, input));
  else if (command === 'preview' && environment === 'staging') preview(checkOrigin(profile, input));
  else if (command === 'activate' && environment === 'production') activate(checkOrigin(profile, input));
  else throw new Error('Use preview only with staging and activate only with production.');
} catch (error) {
  console.error(error.message);
  process.exitCode = 1;
}
