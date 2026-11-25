# UBT Visitor Counter: automatic entry and staged storage

## November 25 visual release

The user requested a final presentation review followed by completion. The
automatic intro, orb recovery and readable brass counter are being released
through PR #58. Live counting remains disabled because no public shared write
endpoint has been deployed. The portable and Worker adapters below are staged
source, not active services. See [the visual release record](../../docs/gateway-visual-release-2026-11-25.md)
for the exact scope and rollback baseline.

This draft uses the existing homepage artwork, warp renderer, brass number reels,
privacy boundary, and SQLite aggregate schema. It introduces an automatic gateway
entry for each fresh visible homepage document, using volatile page state only.
Reloading counts again; switching tabs, restoring a cached document, manually
replaying the logo, or skipping the intro does not create another event. No
unique people or browser sessions are claimed. Reduced-motion visitors see a
short static title instead of a warp. The automatic cinematic uses 2.8 seconds
of warp, 1.8 seconds of title and the existing return fade; the manual Easter
egg retains its seven-second warp with a shorter 2.8-second title hold. The
orbs assemble after return. Cancelling a manual replay before it conceals the
orbs preserves their visible dock and gently resumes their orbits.

The homepage enables the auto-entry feature, but
**does not enable live counting**. Its CSP remains same-origin. The existing
counter activation flag is absent. An automatic entry is emitted in memory
once; an enabled client can make one POST to /api/visits. If its response fails,
the client may read via GET but never repeats the increment. The number display
waits for the intro overlay to close. No browser storage, unique IDs, embedded
tokens or third-party analytics were introduced. The schema/response contract
stays homepage-openings-v1 because the prior staged backend never went live.
The instrument is labelled Visitor Counter; its connected status is Homepage
visits. Its disclosure explains that this measures openings, not unique people.
Until a real endpoint is connected, it shows dashes and Counting paused.

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

## Backend activation requirements

GitHub Pages is static: GitHub stores and tests the code but has no anonymous
shared write endpoint. GitHub Actions must not be invoked with an embedded
credential. A locally running service cannot be reached by unrelated visitors
through their own loopback interface. No existing public always-on host has been
verified; GitHub alone cannot activate the number. A public endpoint must be
explicitly approved and secured before adding the activation flag. The visual
release does not provision or authorize a new DNS route, billing arrangement,
proxy or external service. Do not expose the private PulseGarden environment.

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

Rollback: restore the saved pre-release main snapshot
23ae6693530319c95332c6a9120a498be05ba8d0, preserved in
backup/pre-gateway-release-2026-11-25, through a normal reviewed revert. Removing
the auto-entry flag alone recovers manual-only behavior. Keep the counter
activation flag absent to pause counting without restoring the old external
service.
