# UBT Gateway Counter: automatic-entry prototype (UNPUBLISHED)

This draft uses the existing homepage artwork, warp renderer, brass number reels,
privacy boundary, and SQLite aggregate schema. It introduces an automatic gateway
entry for each fresh visible homepage document, using volatile page state only.
Reloading counts again; switching tabs, restoring a cached document, manually
replaying the logo, or skipping the intro does not create another event. No
unique people or browser sessions are claimed. Reduced-motion visitors see a
short static title instead of a warp. The automatic cinematic uses 2.8 seconds
of warp, 1.8 seconds of title and the existing return fade; the manual Easter
egg retains its original durations. The orbs assemble after return.

The proposed homepage enables the auto-entry feature in this branch, but
**does not enable live counting**. Its CSP remains same-origin. The existing
counter activation flag is absent. An automatic entry is emitted in memory
once; an enabled client can make one POST to /api/visits. If its response fails,
the client may read via GET but never repeats the increment. The number display
waits for the intro overlay to close. No browser storage, unique IDs, embedded
tokens or third-party analytics were introduced. The schema/response contract
stays homepage-openings-v1 because the prior staged backend never went live.
The UI labels the refined definition Gateway entries.

## Portable implementation

The loopback server in portable/server.py is written from scratch using Python's
standard library and the existing SQL migration. It stores only the row
homepage:value. It needs Python 3.10+ with SQLite 3.35+ and a database outside
the public repository. Run from the repository root:

    python infra/ubt-counter/portable/server.py --db /absolute/private/path/ubt-visits.sqlite3 --port 8787

Local-only example (a deliberate test increment):

    curl -X POST -H "Origin: http://127.0.0.1:8787" http://127.0.0.1:8787/api/visits
    curl http://127.0.0.1:8787/api/visits

Do not put the database in the GitHub repository. The server binds to
127.0.0.1 only, has no application request logs, and never exposes a reset
endpoint. It is a local prototype, not a hardened public server. It may later
sit behind an already-approved TLS reverse proxy preserving the expected Host
header, exact path, origin and privacy controls. A separate HTTPS origin would
require a separately reviewed CORS/CSP/client configuration. The existing
Worker/D1 adapter is retained as an alternative rather than duplicated.

## Release gates

GitHub Pages is static: GitHub stores and tests the code but has no anonymous
shared write endpoint. GitHub Actions must not be invoked with an embedded
credential. A locally running service cannot be reached by unrelated visitors
through their own loopback interface. No existing public always-on host has been
verified; GitHub alone cannot activate the number. A public endpoint must be
explicitly approved and secured before adding the activation flag. No DNS,
billing, proxy, external services, or public site changes are authorized by
this draft. Do not expose the private PulseGarden environment.

Test: existing gateway and privacy tests, new automatic-entry cases, portable
HTTP integration tests including simultaneous writes, restart persistence,
minimal schema and rejection of invalid requests. Existing Worker tests remain.
Local Chromium integration is recorded in PR #58 (November 24) and the
[November 25 lifecycle verification](../../docs/gateway-counter-lifecycle-qa-2026-11-25.md).
The latter closes the initially hidden-document check and verifies a pending
number reveal after an actual cached return. Physical iPhone playback, hosted
endpoint uptime, TLS, proxy retention, cost, bot abuse controls and production
integration remain separate acceptance checks. The aggregate is not a verified
human count.

Rollback: leave the draft unmerged; if later approved for release, remove the
auto-entry flag to recover manual-only behavior and remove the counter
activation flag to pause counting without restoring the old external service.
