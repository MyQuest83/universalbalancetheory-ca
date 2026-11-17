# UBT.ca Visitor Counter v2 · November 16, 2026

## Current public behavior
The brass rolling-number counter displays **approximate UBT.ca browser-tab visits**, not unique people. The instrument appears **only on the homepage** after the main action buttons, in normal scrolling page flow. It never appears in subpage footers.

Each eligible tab registers at most one site visit across the public UBT pages that include `visitor-counter.js`. Browsing Home, Luna, Aria, Shadow, Trigon, Links, Michael or AI Index and refreshing within the same tab normally do not add another. New tabs can contribute new visits. Duplicated tabs and browser-restored sessions may inherit a marker, so some visits are missed. The Easter egg, counter details and number animations do not change a visit total.

This **new count starts on November 16, 2026 using its own namespace**. The former page-view counter introduced November 10, 2026 is preserved separately in read-only mode. These incomparable totals must never be added together or represented as unique humans.

## Session marker and privacy
This counter has **no cookies, account IDs, fingerprinting or persistent visitor IDs**. A single temporary string `1` in `sessionStorage`, keyed as `ubt.ca.site-visit-v2.counted`, suppresses repeated increments within the current tab. The marker is never transmitted. Other website functionality may independently use browser storage for visual preferences; this privacy claim applies specifically to the visitor counter.

The tab marker is set **before** the increment request. After a timeout or ambiguous response, the client may perform a read-only lookup but will never retry the hit. When sessionStorage is disabled, the counter falls back to **counting homepage openings**, including repeat loads, and intentionally does not count direct subpage visits.

Requests use a fixed counter key, `credentials:'omit'`, `referrerPolicy:'no-referrer'`, `cache:'no-store'`, a bounded timeout and validation of a nonnegative safe-integer `{"value":123}` response. No page path, query, referrer or tab marker is transmitted. Abacus still receives ordinary network information, including connection IP and browser request headers. Automation, rate limits, script blockers or network failures can inflate or diminish totals. This counter is informational, not a scientific or billing measure.

## Public Abacus endpoints
| Series | Increment | Read only |
| --- | --- | --- |
| **New UBT site visits** from 2026-11-16 | `https://abacus.jsn.cam/hit/universalbalancetheory.ca/site-visits-v2` | `https://abacus.jsn.cam/get/universalbalancetheory.ca/site-visits-v2` |
| Retired page views from 2026-11-10 to 2026-11-16 | **Do not increment** | `https://abacus.jsn.cam/get/universalbalancetheory.ca/visits` |

The approved production hosts are `universalbalancetheory.ca` and `www.universalbalancetheory.ca` over HTTPS. Downloaded and local/test copies are read-only and cannot increment production. A read failure must show unavailable, never an invented zero.

The November 10 provider tests verified CORS, no Set-Cookie on checked responses, a 30-requests/10-seconds/IP rate-limit header, and a stated 168-day inactivity expiry. The provider's future uptime, privacy terms and retention remain external dependencies.

## Private project overview
A separate self-contained HTML overview is stored in the user's **private Drive and ChatGPT Library**, not committed to public GitHub or published on the website. It fetches only the `/get` read endpoints for current site visits and the preserved historical page views. Independent future projects such as PulseGarden, UBT the Game and Luna Companion are marked **Not configured** until a real public URL and explicit approval exist. Trigon pages on UBT.ca belong to the one main-site count.

The private HTML file is not an authenticated analytics service. Do not publish its project inventory. These aggregate endpoints cannot provide daily time series, per-page paths or unique-human counts.

## Rollback and provenance
- Previous production commit: `2f4c5154c08695573f7b077bc299d2aa1b03a01d`.
- Preserved branch: `backup/pre-site-visits-v2-2026-11-16`.
- Earlier provider verification, source links and full page-view counting specification remain preserved in that commit's `docs/visitor-counter.md` and prior Drive archives.
- The counter data is stored by Abacus separately from Git history. A revert must not increment both namespaces or mislabel old page views as visits.
- Provider source and terms: https://github.com/JasonLovesDoggo/abacus
