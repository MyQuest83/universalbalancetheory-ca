/* UBT.ca operator-controlled aggregate counter.
 * Optional isolated workers.dev transport. No application-side visitor records,
 * cookies, identifiers, fingerprinting or request logging. Provider network
 * metadata and security processing remain outside this application's control.
 * Provision and activate only after operator approval.
 */
const SERIES = 'homepage-openings-v1';
const PUBLIC_ORIGINS = new Set(['https://universalbalancetheory.ca','https://www.universalbalancetheory.ca']);
const ISOLATED_ORIGIN = /^https:\/\/ubt-first-party-counter\.[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.workers\.dev$/;
const BASE_HEADERS = Object.freeze({
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store, max-age=0',
  'Referrer-Policy':'no-referrer',
  'Cross-Origin-Resource-Policy':'same-origin',
  'X-Content-Type-Options':'nosniff',
  'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"
});

function response(status, payload, extra = {}) {
  return new Response(status === 204 ? null : JSON.stringify(payload), {
    status, headers: { ...BASE_HEADERS, ...extra }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const configured = env?.COUNTER_ORIGIN;
    const isolatedMode = configured !== undefined;
    const isolated = isolatedMode && typeof configured === 'string' &&
      ISOLATED_ORIGIN.test(configured) && url.origin === configured;
    const isPublic = !isolatedMode && PUBLIC_ORIGINS.has(url.origin);
    const dev = !isolatedMode && env?.DEV === 'true' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
    if (!isPublic && !dev && !isolated) return response(404, {error:'Not found'});
    if (url.pathname !== '/api/visits') return response(404, {error:'Not found'});
    const origin = request.headers.get('Origin');
    const allowedOrigin = isolated && PUBLIC_ORIGINS.has(origin);
    const cors = isolated ? {
      'Vary':'Origin',
      ...(allowedOrigin ? {'Access-Control-Allow-Origin':origin} : {})
    } : {};
    const reply = (status, payload, extra = {}) =>
      response(status, payload, {...cors,...extra});
    if (url.search || url.hash) return reply(400, {error:'Unexpected query'});
    if (isolated && origin !== null && !allowedOrigin)
      return reply(403, {error:'Origin not allowed'});

    if (isolated && request.method === 'OPTIONS') {
      // Require a non-identifying constant header for writes. Browser form
      // submissions cannot supply it; ordinary preflights never write.
      const method = request.headers.get('Access-Control-Request-Method');
      const names = (request.headers.get('Access-Control-Request-Headers') || '')
        .split(',').map(s=>s.trim().toLowerCase()).filter(Boolean);
      if (!allowedOrigin || method !== 'POST' ||
          names.length !== 1 || names[0] !== 'x-ubt-gateway')
        return reply(403, {error:'Preflight denied'});
      return reply(204, null, {
        'Access-Control-Allow-Methods':'POST',
        'Access-Control-Allow-Headers':'X-UBT-Gateway',
        'Access-Control-Max-Age':'600',
        'Vary':'Origin, Access-Control-Request-Method, Access-Control-Request-Headers'
      });
    }

    if (request.method !== 'GET' && request.method !== 'POST')
      return reply(405, {error:'Method not allowed'}, {'Allow':isolated?'GET, POST, OPTIONS':'GET, POST'});

    if (request.method === 'POST') {
      const fetchSite = request.headers.get('Sec-Fetch-Site');
      // Origin/fetch metadata are browser-side guards, not proof of humanity.
      // A non-browser client can forge them. Do not claim bot-proof counting.
      const valid = isolated ?
        allowedOrigin && (!fetchSite || fetchSite === 'cross-site') &&
          request.headers.get('X-UBT-Gateway') === '1' :
        origin === url.origin && (!fetchSite || fetchSite === 'same-origin');
      if (!valid) return reply(403, {error:'Approved gateway request required'});
      const len = request.headers.get('Content-Length');
      if ((len && (!/^\d+$/.test(len) || Number(len) > 0)) ||
          request.headers.has('Transfer-Encoding') ||
          (request.body !== null && len !== '0'))
        return reply(400, {error:'No request body expected'});
    }

    if (!env?.DB || typeof env.DB.prepare !== 'function')
      return reply(503, {error:'Counter unavailable'});
    try {
      const sql = request.method === 'POST' ?
        "UPDATE visits SET value = value + 1 WHERE name = 'homepage' AND typeof(value) = 'integer' AND value >= 0 AND value < 9007199254740991 RETURNING value" :
        "SELECT value FROM visits WHERE name = 'homepage'";
      const row = await env.DB.prepare(sql).first();
      if (!row || !Number.isSafeInteger(row.value) || row.value < 0)
        return reply(503, {error:'Counter unavailable'});
      return reply(200, {series:SERIES, value:row.value});
    } catch (_) {
      return reply(503, {error:'Counter unavailable'});
    }
  }
};
