# Visitor counter

The brass rolling-number tab displays one shared **page-visit total** for the
public UBT website. It counts full page loads, including reloads and repeat
visits. It does not identify or count unique people.

## Counting contract

- Every fully loaded public page that includes the counter client contributes
  at most one increment for that document. Internal navigation that loads a
  new document contributes another visit.
- The production hosts are `universalbalancetheory.ca` and
  `www.universalbalancetheory.ca`. Local previews, downloaded copies and test
  environments must not increment the production counter.
- Replaying the Easter egg, opening or closing the counter tab, and replaying
  the number animation do not contribute visits. A page restored from the
  browser's back/forward cache does not create another document load.
- The number animation starts at zero and settles on the validated shared
  total. Reduced-motion preferences suppress the rolling animation.
- Counting begins when this implementation is activated. A read before
  activation returned `404` / `Key not found`; no earlier website traffic is
  reconstructed, estimated or added to the total.
- The displayed total is the number of successfully recorded requests. Script
  blockers, disabled JavaScript and network failures can prevent a count;
  automated clients can contribute counts. This is an informal visit display.

## Provider and endpoints

The first provider is the public, open-source Abacus counter service. The
namespace and key are fixed across the website:

| Purpose | Endpoint |
| --- | --- |
| Increment once and return the resulting total | `https://abacus.jsn.cam/hit/universalbalancetheory.ca/visits` |
| Read the total without incrementing it | `https://abacus.jsn.cam/get/universalbalancetheory.ca/visits` |

Both return JSON in the form `{"value": 123}` when successful. The client must
accept only a nonnegative safe integer. These are public endpoints, not secret
credentials. Do not visit the increment endpoint merely to inspect the total.

Use one in-memory request guard per document so repeated initialization cannot
double-count. Make requests with `credentials: "omit"`,
`referrerPolicy: "no-referrer"` and `cache: "no-store"`, with a bounded timeout.
No third-party JavaScript SDK is required.

If an increment response is lost, the server may already have counted it.
Recover with a read-only `/get` request; **do not retry `/hit`**. If the read
also fails, show an unavailable state instead of inventing a number. Reading
the total does not prove whether that particular failed request was counted.

## Privacy and limits

The counter client uses no cookies, persistent browser storage, visitor IDs or
fingerprinting. It sends only the fixed counter request, not the page path,
query string, referrer, account details or form contents. Ordinary network
information still reaches the service, including the connection IP address
and browser request headers. Abacus has server access logging and an IP-based
rate limiter; this implementation makes no claim that the provider receives
or retains zero transport data.

The provider's current documented rate limit is **30 requests per 10 seconds
per IP address**. Current source sets a **168-day inactivity expiry**, refreshed
by reads and hits. It is a third-party service without a service guarantee
established for this website. Anyone who knows the endpoint can increment the
public total. It is not a verified count of distinct humans or suitable for
billing, scientific measurements or security decisions.

## Verification performed on November 10, 2026

Network checks used the separate disposable namespace
`ubt-counter-qa-20261110.example` and key `isolated`, never production increments.

| Check | Observed result |
| --- | --- |
| First isolated increment | HTTP 200, value `1` |
| Second isolated increment | HTTP 200, value `2` |
| Read-only isolated lookup | HTTP 200, value `2` unchanged |
| Browser cross-origin permission | `Access-Control-Allow-Origin: *` |
| Cookie response header | No `Set-Cookie` on the checked responses |
| Rate-limit response header | `RateLimit-Policy: 30;w=10` |
| Production lookup before activation | HTTP 404, `Key not found` |

Source review confirmed atomic Redis `INCR` for increments, a separate read
handler, and protected administrative reset/set/delete routes. These checks
establish the integration behavior observed on that date, not future uptime.

## Preservation, rollback and a future provider change

The counter's data lives with Abacus, separately from the website's Git
history and source archives. Rolling back the website preserves its former
appearance and stops these counter requests; it does not erase the remote
total. Restoring this release with the same namespace and key resumes that
total while it remains available. A source backup alone is not a counter-data
backup. Record a timestamped read-only total alongside future release backups.

A future move to a site-owned durable endpoint should preserve the same
page-load semantics, atomic increments, separate read access and zero-cookie
client. Capture and verify the old aggregate at the cutover, initialize the new
store with that verified value, and direct clients to one active provider.
Do not run two increment paths or add an assumed historical offset. This is an
optional maintenance path, not a requirement for the current tab to work.

## Primary references

- [Abacus repository and current API host](https://github.com/JasonLovesDoggo/abacus)
- [Endpoint documentation](https://github.com/JasonLovesDoggo/abacus/blob/main/docs/index.html)
- [CORS, routes and logging setup](https://github.com/JasonLovesDoggo/abacus/blob/main/main.go)
- [Atomic increment and read handlers](https://github.com/JasonLovesDoggo/abacus/blob/main/routes.go)
- [Rate-limiting implementation](https://github.com/JasonLovesDoggo/abacus/blob/main/middleware/ratelimiting.go)
- [Counter expiry constant](https://github.com/JasonLovesDoggo/abacus/blob/main/utils/constants.go)
