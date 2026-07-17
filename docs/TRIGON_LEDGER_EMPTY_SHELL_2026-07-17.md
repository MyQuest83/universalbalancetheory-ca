# Trigon Ledger Empty Shell

Date: 2026-07-17
Status: Draft for review
Branch: `agent/trigon-ledger-empty-shell`

## Purpose

Create the public-facing shell for the Trigon Ledger without publishing sample records, private material, or unreviewed research.

The page is designed to remain simple on first view while allowing every major section to expand for readers who want deeper detail.

## Decisions carried into the draft

- The Ledger is the public record surface of the Trigon testing path and Record-P.
- The existing Trigon Challenge remains the participant-led test doorway.
- AI may scan, organize, and flag relationships, but it does not judge the evidence.
- Failure, null, ambiguity, exploratory status, blocked work, and superseded versions remain visible.
- The public archive uses an explicit release allowlist.
- Private Drive links, personal information, restricted files, and unreleased research remain outside the public manifest.
- Test depth is separated into Light, Medium, and Heavy.
- Test depth describes how far the run goes. It does not rank the idea or guarantee the result.
- Released records may provide CSV, JSON, a complete record package, and SHA-256 checksums when those files exist and are cleared for reuse.
- The interface includes sorting by status, domain, depth, update date, and title.
- The page is data-driven. It reads `trigon/manifest.json` and displays a truthful empty state while the records array is empty.

## Public page sections

1. Ledger introduction and release boundary
2. Expandable Light, Medium, and Heavy test depth cards
3. Search and sorting controls
4. Public records area driven by the manifest
5. Archive scan flow
6. Download and independent verification explanation
7. Curiosity layer for deeper evidence
8. Public release gate
9. Expandable record anatomy
10. Claim-discipline reminder

## Initial machine-readable files

- `trigon/manifest.json`
- `trigon/ai-index.json`
- `trigon/status-definitions.json`
- `trigon/testing-levels.json`
- `trigon/sources/source-registry.json`

All lists are intentionally empty until public release review is complete.

## Record rendering contract

The current JavaScript renderer expects released records in `manifest.json` to use fields such as:

- `record_id`
- `title`
- `question`
- `summary`
- `status`
- `test_depth`
- `domain`
- `tags`
- `source_ids`
- `method_summary`
- `evidence_summary`
- `ambiguities`
- `failures`
- `downloads`
- `updated_at`
- `public_release`

A record is rendered only when `public_release` is exactly `true`.

## Next gates before adding records

1. Lock the record schema.
2. Inventory Drive and GitHub candidates.
3. Classify each item as public, private, review-needed, superseded, or incomplete.
4. Verify source permissions, provenance, calculations, and claim ceilings.
5. Select the first records only after review.
6. Run an archive-reuse test with a fresh AI before relying on the Ledger to gate new testing.

## Review questions

- Are the Light, Medium, and Heavy minimums correctly separated?
- Should the public page call the archive `Trigon Ledger`, `Trigon Public Records`, or both?
- Which download package should become the default: JSON, CSV, or a ZIP record package?
- Should readers be able to report errors by email, GitHub issue, or a future submission form?
- Should the archive search include unreleased metadata stubs, or only fully released records?

## Current boundary

This draft introduces structure only. It contains no sample records, no invented counts, and no public claims about unfinished tests.
