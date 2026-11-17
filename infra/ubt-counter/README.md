# UBT.ca First-party Aggregate Counter (STAGED, NOT DEPLOYED)

## Current operating boundary
This is **source code only**, with **no running backend, no DNS changes, no secrets, no billed service and no activated counter**. The GitHub Pages frontend remains fail-closed in "Privacy mode". An authenticated Cloudflare account/zone/database and explicit approval are required before deployment.

The repository is publicly readable, so no private values, credentials, personal files, project archives, or secrets belong in this folder.

## Why this design
The static website cannot write a durable shared visitor total by itself. This optional implementation uses a Cloudflare Worker bound to a D1 SQLite database, on an exact **same-origin route** `/api/visits` instead of a third-party counting domain. The Worker code and D1 database are controlled by the website operator. The application stores one row `homepage: total` and **never stores IP addresses, user-agent data, identifiers, request paths, emails, cookies or individual event histories**.

**Critical distinction:** Cloudflare would still receive transport data and may have its own network/edge logging. Adding it as a proxy might expose *more* website requests to another infrastructure provider. It only improves privacy if the operator audits its logging, DNS consequences, terms, account controls, and retention. That decision has **not** been made in this chat.

## Endpoints and security
- `GET /api/visits`: read-only JSON `{"series":"homepage-openings-v1","value":N}`.
- `POST /api/visits`: a single atomic increment using D1 `UPDATE visits ... RETURNING value`. No request body.
- Reject any other path/query/host, unsupported HTTP method, cross-site POST Origin and `Sec-Fetch-Site`.
- No cross-origin CORS permission; no cookies; response uses `no-store`, `nosniff`, restrictive CSP, same-origin resource policy.
- No application request logging, client identifiers or analytics SDK.
- POST headers alone cannot prove a human or prevent forged requests. Rate limits at the CDN would need a separate, transparent privacy review. This count is **homepage openings**, including refreshes, and is never asserted to be unique people.
- No public reset, delete or administrator endpoint.

## Migration and test plan (do not execute against production without approval)
1. Verify Cloudflare zone ownership and whether existing `universalbalancetheory.ca` DNS is proxied. **Do not switch nameservers or change GitHub Pages DNS without explicit owner approval, complete DNS backup and cutover validation.**
2. Verify the intended platform's free-tier limits, data location, logging controls and terms; confirm no paid services are authorized by default.
3. Run `node --test infra/ubt-counter/tests/worker.test.mjs` at repo root. Existing CI enforces this.
4. Test the schema in a temporary SQLite database. GitHub CI includes a schema and atomic increment probe.
5. In the approved Cloudflare account, create D1 database `ubt-homepage-visits` with Wrangler; record its real generated UUID **privately**.
6. Copy `wrangler.jsonc.example` to `wrangler.jsonc` *locally*, replace the placeholder UUID and review exact route ownership. Never commit credentials, secrets or exported database.
7. At `infra/ubt-counter`, use `npx wrangler d1 migrations apply DB --local` and `npx wrangler dev --local --var DEV:true` for sandbox testing. Verify no writes to production and no unwanted logs.
8. After explicit infrastructure approval, apply the migration with `npx wrangler d1 migrations apply DB --remote`, verify row `homepage=0`, then `npx wrangler deploy`. Confirm only `/api/*` is intercepted while GitHub Pages remains the site's origin for ordinary pages.
9. Read `GET https://universalbalancetheory.ca/api/visits` and validate JSON. With a controlled **browser same-origin POST**, verify exactly one increment, GET stable, no cookies, no unexpected cross-domain requests and no error-log retention. Test the `www` hostname separately if used.
10. Only **after** all gates pass, update the homepage script element to set `data-first-party-counter="enabled"` in a separate PR. This activates the public counter. The activation date is the new counting epoch.
11. Set a private, controlled backup cadence using `wrangler d1 export` and upload aggregate-only snapshots to private Drive. Do not publish snapshots in the public site repo.

## Database storage and rollback
The database migration `migrations/0001_homepage_visits.sql` seeds zero; there is **no import or offset from the earlier Abacus series** because those were different metrics and no verifiable numeric snapshot was obtained.

In an emergency, remove the activation attribute in a site PR; the first-party counter becomes paused again and the database remains untouched. Never turn Abacus back on as an implicit rollback.

## External references
- Cloudflare Workers routes: https://developers.cloudflare.com/workers/configuration/routing/routes/
- Cloudflare D1 local dev and migrations: https://developers.cloudflare.com/d1/best-practices/local-development/
- Cloudflare Workers pricing: https://developers.cloudflare.com/workers/platform/pricing/
