# Trigon Dataset Candidate Registry

This directory is the public queue for datasets, catalogs, simulation bundles, benchmarks, paper supplements, and substantive analysis bundles that may support future Trigon Challenges.

## Separation of concerns

- `dataset-registry.json` = candidate discovery, preparation, readiness, provenance, access, controls, nulls, and suggested test design.
- `../manifest.json` = released Trigon Ledger records after a test is actually run and clears the public release gate.
- Candidate inclusion does not mean a dataset has passed a Trigon test and does not imply support for UBT.

## Stable IDs

Use `TRIGON-DATA-NNNN` in ascending order. Never recycle an ID. If a later scout finds the same underlying dataset, keep the newer entry only if it adds a materially different version or testable representation. Otherwise mark it `DUPLICATE` and set `duplicate_of`.

## Readiness states

- `READY`: enough public provenance, access/rights information, preprocessing detail, test controls, nulls, metric, and failure criteria exist to begin a reproducible run.
- `NEEDS_PREP`: useful candidate, but one or more preparation items remain.
- `BLOCKED`: access, rights, provenance, privacy, technical, or scientific blocker prevents a valid run.
- `DUPLICATE`: already represented by another stable candidate ID.
- `ARCHIVED`: retained for history but no longer active.

## Daily scout flow

1. Search for genuinely new or materially updated public candidates.
2. Deduplicate by canonical identifier, provider/version, and underlying data content.
3. Record public source provenance and rights status without mirroring files by default.
4. Map useful variables/features and units.
5. Define preprocessing and dimensionless-normalization requirements before testing.
6. Write a bounded Trigon test card with null models, controls, primary metric, claim ceiling, and explicit failure criteria.
7. Promote to `READY` only when the test can be reproduced without hidden assumptions.
8. If selected as the day's favorite, run the strongest bounded test possible and link the resulting released Record-P/Trigon Ledger record only after its release gate passes.

## Public ingestion rule

Prefer `external_source` downloads that keep canonical files at their original public host. Set `mirror_allowed` only when reuse terms clearly permit redistribution. A public landing page is not itself evidence that redistribution is allowed.

## UBT discipline

Dataset preparation must not bake a desired UBT result into preprocessing, target construction, threshold selection, or feature engineering. Where a Super-Pi or Kerr-derived UBT lane is tested, retain the ordinary-pi control under identical preprocessing when applicable.
