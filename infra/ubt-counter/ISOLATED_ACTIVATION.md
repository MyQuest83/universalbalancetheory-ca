# Counter-only activation proposal (November 26, 2026)

Status: source proposal only. No provider account, database, DNS change or public activation authorized or performed. Preserve main 062c8373981b42aacf37a1698ab322d9149d04b5 and the completed visual release.

## Selected smallest practical route
Keep Namecheap BasicDNS and GitHub Pages. An isolated Cloudflare Free Worker plus D1 runs our existing counter rather than a third-party analytics script. Use the account's exact workers.dev hostname, not a route on UBT.ca. This is a noncritical hobby endpoint; Cloudflare recommends custom routes for business-critical production services, and workers.dev has provider-side browser-integrity checks. The website must work if the counter fails. No site migration, paid upgrade, or private PC exposure.

## Source contract
An optional exact COUNTER_ORIGIN enables the isolated adapter; absent it, the original same-origin contract remains. Only the exact HTTPS Worker URL and /api/visits are accepted. The public UI activation flag remains absent. To connect later, set the exact data-counter-endpoint URL and activation attribute on the existing counter script, update the script cache key and its version assertion, and add only that exact origin to the homepage connect-src CSP. Update the Links fine print to disclose Cloudflare counter transport. No wildcard CORS/CSP, credentials, redirects, visitor identifiers, cookies, storage or analytics. Constant X-UBT-Gateway header requires a browser preflight, which does not increment or query the database. It does not authenticate humans; scripted requests can forge headers. One POST attempt per automatic entry; failed POST may be followed by one GET, never a retry. Atomic update has a safe-integer ceiling. Keep the brass presentation and animation unchanged.

## Approval and provisioning sequence
1. Obtain explicit approval for Cloudflare Free, one Worker and one D1 database. Verify owner account, Free status, no paid upgrade, configured workers.dev subdomain, and acceptable provider privacy/retention. The provider receives ordinary transport metadata, including IP addresses; disabling optional Workers Logs is not a guarantee of zero platform records. Do not add a domain or use any GitHub credential in browser code.
2. In the approved account create a disposable test D1 and Worker using wrangler.isolated.jsonc.example, exact test binding and origin; disable optional invocation logs, previews and external log exports. No production total yet. Use an approved isolated test fixture/hostname, verify TLS, CORS preflight, POST increments, read-only GET, rejects, zero cookies, no redirects, real browser behavior, no extra writes on skip/replay/cache return, and check provider limits/abuse. Verify on iPhone Safari if possible. Do not silently switch routes when blocked.
3. Once verified, create/bind the empty production aggregate database and initialize the existing migration. Confirm starting zero from the database; do not import Abacus or synthetic test totals. Keep public site disabled until a separate activation release is approved.
4. Review exact Worker host, cost and public fine-print wording, then merge the narrow activation patch. Verify Pages deployment, live counter returns real values and website still works offline from the counter. Preserve read-only backup of aggregate and release SHA. Roll back by removing the activation attribute and external origin from CSP; disable Worker route if needed, retain database, never restore Abacus.

Published Free limits checked Nov 26, 2026: 100,000 Worker requests/day (including preflight), 100,000 D1 rows written/day, 5 million rows read/day, 5 GB total D1 storage. Limits are shared and may change; no account-specific entitlement verified. A two-request uncached entry uses more than one Worker request. Free limit exhaustion can interrupt counting; never enable paid billing without approval.

Sources:
- https://developers.cloudflare.com/workers/configuration/routing/workers-dev/
- https://developers.cloudflare.com/workers/platform/pricing/
- https://developers.cloudflare.com/d1/platform/pricing/
- https://developers.cloudflare.com/workers/observability/logs/workers-logs/

Verification scope: automated source tests in existing CI; actual Workers/D1 runtime, production HTTPS, browser policy behavior, physical phone, quota/abuse and account settings remain NOT RUN until authorized. This proposal is not a live service.
