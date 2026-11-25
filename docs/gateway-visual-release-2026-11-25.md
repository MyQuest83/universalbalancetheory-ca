# UBT gateway and brass counter: November 25 visual release

## Scope and preservation

The user selected the presentation review and requested completion. This release
finishes that review in the existing PR #58 and retains the website's current
GitHub Pages hosting. It does not activate live counting or change DNS, billing,
provider access, or the private PulseGarden environment.

Pre-release main: `23ae6693530319c95332c6a9120a498be05ba8d0`.
The same commit is preserved in `backup/pre-gateway-release-2026-11-25`.
This is the privacy-preserving rollback point; the older pre-privacy backup
would restore an external counter and is not the ordinary visual rollback.

## Completed presentation

- Automatic, skippable introduction for each fresh visible homepage document.
- Cryptographically randomized foreground orb trajectories with perspective
  scale, depth shading and a temporary gravity-well effect. This is decorative
  choreography, not a scientific simulation of gravitation.
- Exact logo capture: blue at the top, green at the right, red at the left.
  Ring markers begin moving before the orbs ease into their normal orbits in
  blue, green, red order. A completed intro starts the new arrival only after
  the homepage returns.
- Manual title hold shortened from 6.2 seconds to 2.8 seconds. Its seven-second
  warp remains. The automatic title hold remains 1.8 seconds.
- Cancelling a manual replay before the warp conceals the orbs preserves the
  visible dock, then resumes orbital motion without a hide/reset flash or a
  second randomized arrival.
- Visitor Counter stays centered below the hero buttons, in normal page flow,
  and appears only on the homepage. The brass artwork remains local CSS.
- Counter heading is 14 px at default text size; status is 13 px; disclosure
  text is 16 px; the privacy link has a 44 px minimum target height. Digits have
  larger 40 px phone rows and 42 px desktop rows. The instrument shrinks to its
  available width instead of becoming a floating overlay.
- Public disconnected state says **Counting paused** with dashes. The connected
  presentation says **Homepage visits** and explains that openings, including
  reloads, are counted rather than unique people.

## Verification of this finishing pass

The focused automated checks passed: 15 gateway lifecycle tests and 11
privacy/client tests. The earlier Worker and portable-storage checks are
unchanged; repository CI remains the publication gate for the full suite.
The stale cache-version assertion was updated to the new release asset key.

Actual managed Chromium inspected the page in 320 px and 390 px frame layouts
and a 1100 px desktop frame. At the narrow layout the content viewport and page
width were both 303 px, the counter was 275 px wide and its center was 151.5 px.
At desktop the content viewport and page width were both 1083 px, the counter
was 296 px wide and its center was 541.5 px. These observations confirm no
horizontal overflow and centered placement in those tested layouts.

The preview used an isolated local SQLite total and test-only origin/activation
adaptations, never a production visit total. Its DOM evidence recorded one
automatic entry, a single reel-winding interval after the overlay returned,
and hidden → capturing → locked → releasing → orbiting. An actual early manual
cancel retained arrival 1, kept all three orbs visible, resumed orbiting, and
left the isolated total at 4. No first-party error or unhandled-rejection events
were recorded in that inspected document.

Physical iPhone/Safari and a public shared counter endpoint were not tested in
this pass. The temporary responsive frame and diagnostic scripts are excluded
from the release. CI, merge and deployment outcomes are tracked on PR #58 and
in the final release receipt; source review alone is not deployment proof.

## Remaining counter activation

The live page contains no `data-first-party-counter="enabled"` attribute.
The default client therefore sends no counter requests and claims no total.
The backend source and tests remain in `infra/ubt-counter/`. An approved public
runtime with durable storage is still needed. No historic Abacus number is
guessed or added to this new series.

Publication record: https://github.com/MyQuest83/universalbalancetheory-ca/pull/58
