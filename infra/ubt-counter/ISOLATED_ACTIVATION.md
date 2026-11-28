# UBT.ca isolated counter release

PR #59 prepares a Cloudflare Workers Free counter while GitHub Pages continues serving the site on Namecheap DNS. Pushing this revision keeps the brass counter paused. The release helper prepares a separate, reviewable homepage activation once the account owner has verified the backend.

| Environment | Worker | D1 database | Browser origin allowed to count |
| --- | --- | --- | --- |
| Staging | `ubt-first-party-counter-staging` | `ubt-homepage-visits-staging` | `http://127.0.0.1:8788` |
| Production | `ubt-first-party-counter` | `ubt-homepage-visits` | `https://universalbalancetheory.ca` and `https://www.universalbalancetheory.ca` |

Each Worker has its own exact HTTPS address on the account's `workers.dev` subdomain. The application stores one `homepage` total. Each fresh visible homepage document attempts one increment, including refreshes. The metric measures openings, and the browser guards do not prove the caller is human.

## Verify the Cloudflare account

Use Node.js 22.12 or newer. Run the commands from the repository root in your own terminal. The following examples use PowerShell.

Sign in to the intended Cloudflare account, confirm its **Workers Free** plan and verify the account selected locally by Wrangler. Use the existing `workers.dev` subdomain. If the account has none, register a free one in Workers & Pages. Enter the account ID and subdomain in your terminal only. The generated Wrangler configs are ignored by Git. If the account offers a paid upgrade, stop there.

```powershell
$env:WRANGLER_SEND_METRICS = "false"
npx wrangler@4.168.0 login
npx wrangler@4.168.0 whoami
$env:CLOUDFLARE_ACCOUNT_ID = "YOUR_VERIFIED_ACCOUNT_ID"
$subdomain = "YOUR_VERIFIED_WORKERS_DEV_SUBDOMAIN"
$stagingOrigin = "https://ubt-first-party-counter-staging.${subdomain}.workers.dev"
$productionOrigin = "https://ubt-first-party-counter.${subdomain}.workers.dev"
$stagingConfig = "infra/ubt-counter/wrangler.staging.jsonc"
$productionConfig = "infra/ubt-counter/wrangler.production.jsonc"
npx wrangler@4.168.0 d1 list
```

Verify the account's available quota. Cloudflare publishes 100,000 Workers requests per day and a Free D1 allowance of 5 million rows read, 100,000 rows written per day, 5 GB total storage and 10 databases. An uncached CORS preflight consumes a Worker request. When an endpoint is unavailable, the homepage remains usable and displays no invented total.

- [Workers pricing](https://developers.cloudflare.com/workers/platform/pricing/)
- [D1 pricing](https://developers.cloudflare.com/d1/platform/pricing/)
- [Workers Logs settings](https://developers.cloudflare.com/workers/observability/logs/workers-logs/)

## Provision and verify staging

Create the staging database if it does not already exist. The config helper selects the exact database name from the account's Wrangler inventory. Review the generated config locally before applying it. If a Worker or database with the target name exists, verify that it belongs to this release before reusing it.

```powershell
npx wrangler@4.168.0 d1 create ubt-homepage-visits-staging --update-config=false
npx wrangler@4.168.0 d1 list --json | node infra/ubt-counter/counter-release.mjs config staging $subdomain
npx wrangler@4.168.0 d1 migrations apply DB --config $stagingConfig --remote
npx wrangler@4.168.0 deploy --config $stagingConfig --dry-run
npx wrangler@4.168.0 deploy --config $stagingConfig
```

Read back the Worker settings before sending test traffic. Confirm the exact `workers.dev` address and D1 binding, and verify that Worker Observability, invocation logs, traces, preview URLs, Logpush and any tail or external exports are off. Check the provider's current processing and retention settings. Cloudflare still handles network metadata, including IP addresses, and may retain platform records.

```powershell
node infra/ubt-counter/counter-release.mjs verify staging $stagingOrigin
npx wrangler@4.168.0 d1 execute DB --config $stagingConfig --remote --command "PRAGMA table_info(visits); SELECT name, value FROM visits;"
node infra/ubt-counter/counter-release.mjs preview staging $stagingOrigin
```

The smoke check sends one synthetic increment to **staging**. Confirm the application table contains one `homepage` row with columns `name` and `value`. Read the total before and after a normal staging redeploy to confirm persistence. The migration seeds a fresh database with zero and preserves an existing aggregate.

Open [the local staging homepage](http://127.0.0.1:8788/) in a fresh browser tab. Check that the actual gateway and brass counter render, and inspect the request and response headers in the browser's Network panel. An opening sends one credential-free POST, with a CORS preflight if needed. Skip the opening intro, replay it, and use Back from Links. A restored cached document should send no new POST. A full reload or uncached return starts a fresh document. Confirm the total changes accordingly and the browser receives no cookie or external counter request beyond the named staging API. For the outage check, block the staging API in the browser before opening a fresh document. The homepage should remain usable and the counter should show “Temporarily unavailable” without an invented number. Stop the local preview when finished. Device checks on a physical iPhone are separate from the loopback preview.

## Prepare production while the homepage stays paused

After staging passes, create the production database if needed. Confirm it has a different UUID from staging and verify that the Worker binds only that database. Apply the migration to the empty production database, then review the deploy. Check the production Worker's settings against the same privacy checklist before the read-only smoke check.

```powershell
npx wrangler@4.168.0 d1 create ubt-homepage-visits --update-config=false
npx wrangler@4.168.0 d1 list --json | node infra/ubt-counter/counter-release.mjs config production $subdomain
npx wrangler@4.168.0 d1 migrations apply DB --config $productionConfig --remote
npx wrangler@4.168.0 deploy --config $productionConfig --dry-run
npx wrangler@4.168.0 deploy --config $productionConfig
npx wrangler@4.168.0 d1 execute DB --config $productionConfig --remote --command "SELECT name, value FROM visits;"
node infra/ubt-counter/counter-release.mjs verify production $productionOrigin
```

Verify one `homepage` row at zero. Production smoke requests use GET and OPTIONS only. Start a fresh series and keep synthetic visits and historic Abacus totals out of production.

## Review public activation and rollback

After backend verification and separate owner approval for public activation, generate the local activation diff. It adds the exact production endpoint and origin to the homepage and updates the Links fine print.

```powershell
node infra/ubt-counter/counter-release.mjs activate production $productionOrigin
git diff --check
git diff -- index.html links.html
node --test tests/gateway-lifecycle.test.cjs tests/privacy-boundary.test.cjs infra/ubt-counter/tests/worker.test.mjs
```

Commit the two changed pages separately, push to the PR and let Public Site QC finish. Review the exact changes before merging. After GitHub Pages deploys, check the homepage, Links fine print, one live increment, a read-only GET, replay, and the physical iPhone layout if available. Record the deployed SHA and activation date. Preserving the earlier visual release, keep a reviewable paused revision and back up the aggregate privately.

If needed, revert the activation commit or restore its two pages from the reviewed paused revision in a new commit. This removes the endpoint, activation flag and CSP origin and restores the paused fine print. If requests must stop before a Pages rollback finishes, disable the Worker's `workers.dev` route. Retain the D1 total. The pre-gateway backup `backup/pre-gateway-release-2026-11-25` is privacy-safe, but reverting only the activation preserves the later visual polish. Keep Abacus retired.
