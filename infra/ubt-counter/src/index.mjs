/* UBT.ca private-operated aggregate homepage counter.
 * Cloudflare Worker + D1 adapter. Source owner controls code and database;
 * Cloudflare still handles ordinary transport/IP data and platform logging.
 * Intentionally no client IDs, IP storage, cookies, fingerprinting or analytics.
 * Do not deploy or route until operator approves hosting, DNS, privacy policy.
 */
const SERIES = 'homepage-openings-v1';
const PUBLIC_HOSTS = new Set(['universalbalancetheory.ca','www.universalbalancetheory.ca']);
const BASE_HEADERS = Object.freeze({
  'Content-Type':'application/json; charset=utf-8',
  'Cache-Control':'no-store, max-age=0',
  'Referrer-Policy':'no-referrer',
  'Cross-Origin-Resource-Policy':'same-origin',
  'X-Content-Type-Options':'nosniff',
  'Content-Security-Policy':"default-src 'none'; frame-ancestors 'none'"
});

function response(status, payload, extra = {}) {
  return new Response(JSON.stringify(payload), {
    status, headers: { ...BASE_HEADERS, ...extra }
  });
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    const isPublic = PUBLIC_HOSTS.has(url.hostname) && url.protocol === 'https:';
    const dev = env?.DEV === 'true' &&
      (url.hostname === 'localhost' || url.hostname === '127.0.0.1');
    if (!isPublic && !dev) return response(404, {error:'Not found'});
    if (url.pathname !== '/api/visits') return response(404, {error:'Not found'});
    if (url.search || url.hash) return response(400, {error:'Unexpected query'});
    if (request.method !== 'GET' && request.method !== 'POST') {
      return response(405, {error:'Method not allowed'}, {'Allow':'GET, POST'});
    }

    if (request.method === 'POST') {
      // Browser navigations/form submits from other sites are not accepted.
      // This discourages casual cross-site increments, but cannot verify
      // a human or defeat a server client that forges request headers.
      const origin = request.headers.get('Origin');
      const fetchSite = request.headers.get('Sec-Fetch-Site');
      if (origin !== url.origin || (fetchSite && fetchSite !== 'same-origin')) {
        return response(403, {error:'Same-origin request required'});
      }
      const len = request.headers.get('Content-Length');
      if (len && (!/^\d+$/.test(len) || Number(len) > 0)) {
        return response(400, {error:'No request body expected'});
      }
    }

    if (!env?.DB || typeof env.DB.prepare !== 'function') {
      return response(503, {error:'Counter unavailable'});
    }

    try {
      const sql = request.method === 'POST' ?
        "UPDATE visits SET value = value + 1 WHERE name = 'homepage' RETURNING value" :
        "SELECT value FROM visits WHERE name = 'homepage'";
      // D1 UPDATE...RETURNING is one atomic database operation, not a
      // read/modify/write race. The migration inserts the initial zero row.
      const row = await env.DB.prepare(sql).first();
      if (!row || !Number.isSafeInteger(row.value) || row.value < 0) {
        return response(503, {error:'Counter unavailable'});
      }
      return response(200, {series:SERIES, value:row.value});
    } catch (_) {
      // Never log request, IP, headers, request body, or database exceptions.
      return response(503, {error:'Counter unavailable'});
    }
  }
};
