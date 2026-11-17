# UBT.ca Privacy-first Visitor Counter | 17 November 2026

## Current public state: privacy pause
The earlier Abacus external counter is disabled. The brass counter is preserved on the homepage, displaying dashes and "Privacy mode" until a first-party backend has been independently deployed and verified. **No live total is claimed during the pause.**

The new `visitor-counter.js` uses no cookies, sessionStorage, localStorage, tracking IDs, fingerprinting, or third-party counter network requests. It does not call any endpoint until the homepage script element has `data-first-party-counter="enabled"`, which is deliberately **absent** in the published code. Other pages do not load the counter script. The saved colour-preference code was also removed from `site.js`.

The main website is presently a static GitHub Pages site. Its ordinary host receives network connection information. External links can navigate to other providers that have their own policies. The source-based "zero counter requests" guarantee is distinct from a claim of "zero network data anywhere".

## The later first-party counter contract
After a verified same-origin backend exists, the counter will send one `POST /api/visits` per homepage opening (including reloads), and `GET /api/visits` for read-only fallback if a POST's response is lost. No ambiguous POST is retried. The response must be `{"series":"homepage-openings-v1","value":<nonnegative safe integer>}`. This measures **homepage openings, not unique people** and does not track visitors between pages. The frontend is deliberately fail-closed until activation.

A separate first-party backend implementation and tests are staged in `infra/ubt-counter/`. It needs an authorized hosting account, database and compatible DNS route before activation. **GitHub Pages cannot run this dynamic endpoint by itself.** No new DNS, services, billing, or third-party counter integration is activated by these source changes.

## Historical counting provenance
- Nov 10-16: Abacus page views used `universalbalancetheory.ca/visits`.
- Nov 16-17: Abacus approximate tab visits used `universalbalancetheory.ca/site-visits-v2`.
- The old data lives outside our code with Abacus. The old counters were not reset or erased. No verified numerical snapshots were obtainable in this runtime; therefore no historical totals are guessed or added to the new series.
- Code before mitigation is preserved in `backup/pre-privacy-first-counter-2026-11-17`. Rolling it back would **re-enable Abacus**, so it is for forensic comparison unless privacy policy is explicitly changed.

## Source audit and operating limits
The reviewed site-owned HTML/CSS/JS had only one automatic cross-origin counter request, to Abacus. Trigon's `trigon/trigon-page.js` fetches its own public `trigon/manifest.json`. Other visible outbound research, music and social links are navigational. The accent script's localStorage calls and the counter's sessionStorage calls were removed.

The first-party application will store an aggregate total only. Any hosting/CDN platform still processes visitors' IP addresses at the network layer; its log retention and request analytics must be reviewed and controlled separately. Public counters cannot cryptographically distinguish actual humans from scripted clients without additional identification or abuse controls. Do not claim unique users.

References: https://github.com/MyQuest83/universalbalancetheory-ca and https://github.com/JasonLovesDoggo/abacus
