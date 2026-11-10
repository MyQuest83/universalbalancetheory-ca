# Orb choreography and visitor counter

Release prepared November 10, 2026 for UniversalBalanceTheory.ca.

## What changed

The gateway now owns orb positions through one animation clock. Orbs smoothly
dock from their current position before the Easter egg starts. After the
seven-second warp and title reveal, blue, green and red descend from above,
settle on their original lanes, then accelerate into orbit one at a time.
The original three lane-speed ratios and decorative warp renderer are retained.

The home return uses 1.45-second descents, separated by 280 milliseconds.
Orbit launches begin after docking, separated by 420 milliseconds, with a
2.2-second acceleration. Escape and early replay restore focus and recover
without teleporting the visible orbs. Reduced motion uses a stationary mark.

The Visitor Counter is a brass instrument with rolling number drums, a small
status lamp and an expandable explanation. It shares one count across nine
normal public pages. Each new page load contributes at most one request;
animation replays and tab expansion do not. Previews only read the counter.
See [visitor-counter.md](visitor-counter.md) for exact counting semantics.

## Verification

- Existing repository checks: JSON, JavaScript syntax, Trigon release gate,
  static links/fragments, public-data boundary and secret patterns passed.
- Numerical orb checks: exact docking, matching start position and velocity,
  zero-speed arrival, sequential launches, original orbit rates, interrupted
  arrivals and pause/resume passed.
- Counter runtime checks: 29 passed with mocked network responses, including
  exact zero and multi-digit totals, malformed data, network failure,
  single registration, read-only previews and reduced motion.
- Desktop and phone-width browser previews: full gateway cycle, Escape,
  restored focus, rolling digits, disclosure panel, viewport fit and one
  count request after replay were checked.
- Counter-provider requests were tested using a separate disposable counter.
  Production visits are counted only after deployment.

The phone-width preview verifies responsive layout in Chromium. It is not a
test on a physical iPhone or its Safari engine.

## Rollback

The original source is preserved at commit
`4725eab5563323a3e6931bf84b65c51dc36782e8`, also referenced by branch
`backup/pre-orbit-counter-2026-11-10`.

To undo this release, revert its merge through a new pull request and let the
normal Pages deployment run. Do not force-push main. A visual rollback does
not delete the independent aggregate counter. Reinstalling the client with
the same key can resume that total while the provider retains it.

Source snapshots and a separate release receipt are supplied with this update.
