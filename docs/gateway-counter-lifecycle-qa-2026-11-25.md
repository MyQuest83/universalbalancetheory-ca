# Gateway and counter lifecycle verification, November 25, 2026

Status: verified local draft; public activation remains on hold.

This scoped pass continues draft PR #58 from
`b053640c6d64e87a6a281b1afcc8ff8b47aa027c`. The public `main` baseline is
`23ae6693530319c95332c6a9120a498be05ba8d0`. No merge, deployment, DNS change,
provider signup, public backend, or counter activation was performed.

## Corrections

1. A queued IntersectionObserver callback could operate on its replacement and
   prematurely reveal the digits or throw after the current observer was cleared.
   Callbacks now verify their own observer identity and the pending reveal.
   Lifecycle cleanup clears the old reference; persisted `pageshow` reconnects
   a reveal that has not yet entered the viewport.
2. `pageshow` and `visibilitychange` could both resume the same interrupted
   introduction, displaying fully opaque parked orbs for one frame before the
   incoming flight. Restoration now preserves the double-frame paint gap and
   resumes only parked fields. A later duplicate restoration cannot truncate an
   arrival already underway.
3. Accessible warp text no longer promises seven seconds for the shorter
   automatic sequence. The new wording applies to automatic and manual entry.

The logo coordinates, cryptographic launch randomness, perspective capture,
blue-top/green-right/red-left locking, ring lead, and staggered release are
unchanged. The counter remains centered in normal page flow. Its production
activation attribute is still absent, and its HTTPS/hostname gates are unchanged.
Both changed script cache keys use `20261125-lifecycle`.

## Regression evidence

Four new tests failed against the original source before the fixes:

- Stale observer delivery consumed a pending reveal.
- A persisted page return did not reconnect a pending viewport observation.
- `pageshow` followed by `visibilitychange` exposed an early releasing frame.
- The reverse restoration order produced the same frame discontinuity.

The updated suites also check that late restoration signals preserve an active
capture, the reveal happens once, and restoration does not send another POST.
These deterministic tests complement browser verification; they do not represent
physical-device tests.

## Actual Chromium observations

The managed browser ran the current frontend against the real portable
HTTP/SQLite handler in an isolated loopback preview. A temporary fixture added
DOM-only lifecycle evidence and static-file serving, and adapted the served
client's hostname/protocol gate to the loopback HTTP origin. It injected the
activation attribute only for the enabled test page. The fixture and database
are outside the repository, and none of those test overrides is in public source.
This pass is not evidence of production HTTPS, hosting configuration, or iOS.

| Scenario | Observed result |
| --- | --- |
| Homepage opened with a middle click into a background tab | `DOMContentLoaded` and initial `pageshow` recorded `hidden=true`, no entry marker, hidden orbs, and no displayed total. |
| Background tab selected after about 7.4 seconds | Visibility became true at 7,425 ms; the sole entry signal followed at 7,454 ms. The real test aggregate became 1. |
| Automatic intro completed | Orbs stayed hidden throughout the overlay, then progressed through capture, lock, release and orbit on the restored homepage. |
| Navigate to Links and back before the counter enters view | Actual `pageshow.persisted=true`; the aggregate remained 1. |
| Scroll the restored counter into view | Exactly one winding transition, then settled digits. The counter was centered below the hero actions. |
| Manually replay, navigate away during alignment, then go back | Actual cached return; the recorded paint sequence was hidden, capturing, locked, releasing, orbiting. No extra entry or winding event. |
| Fresh homepage without the activation attribute, then immediate skip | The page returned to usable content; counter stayed in Privacy mode without a numeric total. The SQLite aggregate remained 1. |

The enabled page recorded one automatic entry, one counter winding, and no
first-party error or unhandled-rejection event during these checks. Direct
SQLite inspection confirmed exactly the `homepage:1` aggregate and the two
schema columns `name` and `value`. All numbers here are isolated test data.

## Acceptance boundary and rollback

GitHub source and tests are ready for draft review. Public counting still needs
an approved, reachable HTTPS write endpoint with persistent storage and reviewed
hosting/logging behavior. Current DNS could not be verified in this environment;
failed lookups are not evidence of a live DNS fault. No existing public counter
host was established by this pass.

Physical iPhone playback and public endpoint integration remain untested. Keep
the draft unmerged until the concrete release scope is approved. To recover this
pre-fix draft, use `b053640c6d64e87a6a281b1afcc8ff8b47aa027c`; the public site
remains at the separate unchanged main baseline above. Do not restore retired
third-party counting as an implicit rollback.
