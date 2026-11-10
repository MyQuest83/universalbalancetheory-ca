# Magnetic orbs and inline visitor counter

Release date: 10 November 2026.

This refines the gateway and counter introduced in the earlier
[orbit-counter release](orbit-counter-release.md).

## Experience

Every new arrival draws fresh values from the browser's cryptographic random
source. The three spheres begin close to the viewer at six to eight times
their usual size, with randomized launch angles, depth, tilt, bank and swirl.
A perspective projection, spherical shading and near/far layering give the
flight depth around a temporary black-hole well.

Magnetic capture ends at the actual SVG triangle vertices: **blue at the top,
green at the lower right, red at the lower left**. The common tip radius is
0.264 of the sigil width, derived from the SVG's 66% size and its 128/320
triangle circumradius. The final logo pose is separate from the three normal
orbit radii.

After a readable stationary hold, illuminated arcs begin turning on the
rings. Blue, green and red then leave their tips in sequence, drift onto
their original rings and gradually accelerate. The original decorative
orbital rate ratios remain unchanged.

| Stage | Homepage arrival | Post-warp title reveal |
| --- | ---: | ---: |
| All three locked to logo tips | 3.80 s | 2.57 s |
| Rings begin rotating | 4.75 s | 3.32 s |
| Blue starts releasing | 5.40 s | 3.77 s |
| Green starts releasing | 5.84 s | 4.07 s |
| Red starts releasing | 6.28 s | 4.37 s |
| All three at normal orbital speed | 8.28 s | 5.82 s |

Pre-warp docking preserves position, velocity, perspective scale and depth
when the visitor interrupts a flight. The decorative warp still lasts seven
seconds. Its title reveal now lasts 6.2 seconds, followed by the homepage's
new randomized arrival. Escape, focus restoration, background inertness,
manual pause, reduced motion and hidden-tab recovery remain supported.

The visual is physically inspired artwork, not a gravitational solver or a
scientific result. `crypto.getRandomValues` supplies cryptographically strong
pseudorandom values; the implementation does not claim a hardware source of
physical true randomness. If that API is unavailable, the initial logo is
shown and its normal orbit begins without a randomized shot.

## Counter and credits

The brass counter is centered beneath the homepage buttons. On other pages
it sits in the footer. It scrolls with the document, and expanded notes push
later content down. The number drums wind once when the counter first comes
into view; the count request and truthful accessible total do not wait for
scrolling.

The existing production counter namespace and total are retained. Page
reloads and additional page visits still count; animation replay, opening
the notes and scrolling do not. No cookies, persistent browser storage or
visitor identifiers were added by the counter. See
[the counting contract](visitor-counter.md) for privacy and provider limits.

The widget links to local Credits & privacy fine print at the bottom of the
Links page. Abacus attribution is the only GitHub link in the rendered HTML
pages. The former website-source card was removed from the Evidence page;
its publication and research-source links remain.

## Verification

- Existing public-site checks passed: JSON, JavaScript syntax, Trigon release
  gate, static links/fragments, public-data boundaries and secret patterns.
- 21 controller and numerical checks passed for exact tip capture, timing,
  fresh random draws, perspective bounds, continuity, normal orbit rates,
  pause/resume, reduced motion, visibility, resize, Escape and full playback.
- 64 additional randomized early interruptions, sampled every 10 ms through
  docking, preserved positive finite sphere sizes and exact final positions.
- 36 counter runtime checks passed, including first-view winding, unchanged
  counting behavior, malformed data, failures, hidden tabs and history return.
- Desktop and phone-width Chromium previews checked the logo lock, seven-second
  journey, title reveal and return, restored focus, centered counter, notes,
  scrolling and bottom-of-Links credit. Mocked counter tests made no production
  increment requests.

The phone-width preview is a responsive Chromium check, not a test on a
physical iPhone or its Safari engine.

## Rollback

The preceding production version is commit
`db7f43f379c9184884d32cf3615d690969777f1f`, preserved at
`backup/pre-magnetic-orbs-2026-11-10`. Its existing source snapshot remains
available. The still-earlier pre-counter snapshot and backup branch are also
retained.

To restore the preceding experience, revert this release through a new pull
request and the normal Pages deployment. Do not force-push main. The shared
page-visit total lives independently of the visual source; retaining its
namespace preserves the total while the provider retains it.
