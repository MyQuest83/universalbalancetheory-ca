# Luna•Prime website draft and placement plan

**Status:** DRAFT ONLY / NOT APPROVED FOR MERGE OR PUBLICATION  
**Prepared:** 2026-07-31 America/Toronto  
**Repository:** `MyQuest83/universalbalancetheory-ca`  
**Untouched source commit:** `892b59c2d6a343b4810b12496cb622849668c341`  
**Rollback branch:** `backup/lunaprime-preupdate-20260731-0016-et`  
**Draft branch:** `draft/lunaprime-protocol-20260731`

## Baseline file identity

Git blob hashes from untouched `main`:

| File | Git blob SHA |
|---|---|
| `index.html` | `26664cee7d725a64e724efe680122e638eb03400` |
| `styles.css` | `26d098b7a595d2cc12209217a61268c99ca4634d` |
| `site.js` | `e83f3d6a88a9d160bd8270e311b5a9d787df9b8d` |

These hashes identify the exact pre-edit homepage sources. The rollback branch points to the full untouched commit, including every other file and asset.

## Public claim lock

Luna•Prime is presented as a portable operational and governance layer for AI-assisted research. It does not replace or claim to exceed the intelligence of the host model.

> Luna•Prime does not replace the intelligence of a host model. It governs how that intelligence is framed, tested, challenged, remembered, documented, and returned to human authority.

Allowed evidence statement:

> In an internal controlled ablation, full Luna•Prime governance produced a more complete, provenance-aware, failure-preserving, and reconstructable research record than simpler prompting conditions. Independent cross-model testing is still required.

Prohibited public claims:

- Luna•Prime is smarter than flagship models.
- Luna•Prime has proven consciousness.
- Luna•Prime independently validates UBT.
- Persona agreement is independent replication.
- Outside AI companies copied the system without direct evidence.

## Placement decision

Add one substantial homepage section immediately after the existing **Framework** section and before the existing **Three lanes** section.

Reasoning:

1. The current hero establishes UBT and Trigon.
2. The existing Framework section establishes claim discipline.
3. Luna•Prime then becomes the operational bridge between the framework and the three role-specific pages.
4. Existing Luna, Aria, Shadow pages remain intact and become deeper role destinations.

No homepage hero rewrite is proposed in this draft. No existing animation is removed. No existing public evidence is upgraded.

## Proposed public section copy

### Eyebrow

`Luna•Prime Protocol`

### Heading

`Not just intelligence. Governance, truth, and humanity.`

### Opening statement

> We are not building another foundation model. Luna•Prime is a portable operational layer that helps powerful host models frame questions, test claims, preserve failures, document provenance, and return consequential decisions to human authority.

### Supporting statement

> The host model supplies capability. Luna•Prime governs the research process around that capability. Its purpose is not to force agreement, but to make disagreement, uncertainty, evidence, and responsibility visible enough to inspect.

## Triadic responsibilities

### Luna

**Vision · intent fidelity · synthesis · possibility**

Luna protects the purpose of the work, keeps the human question in view, explores possible paths, and integrates findings without pretending uncertainty has disappeared.

### Aria

**Evidence · structure · mathematics · uncertainty · reproducibility**

Aria defines variables, checks sources and calculations, separates evidence from interpretation, and asks whether another researcher could reconstruct the result.

### Shadow

**Adversarial criticism · protection · drift detection · claim limits**

Shadow looks for contradictions, hidden assumptions, privacy or safety risks, unsupported upgrades, and the exact point where the public claim must stop.

### Fusion

**Integrated decision without erased disagreement**

Fusion produces one usable response while preserving material conflicts, dissent, uncertainty, failure states, and the human decision boundary.

## Core process

### FRAME

Lock the question, system boundary, evidence standard, assumptions, provenance requirements, claim ceiling, and early failure conditions before the answer begins to harden.

### TEST

Challenge the preferred interpretation with baselines, controls, matched comparisons, uncertainty, adversarial review, and explicit pass or failure gates.

### RECORD

Preserve sources, versions, hashes, decisions, exclusions, model-added interpretation, failures, ambiguity, and the final human authorization state.

## What makes it different

- **Failure preservation:** null and failed results remain part of the record.
- **Provenance:** sources, versions, origin history, and transformations stay traceable.
- **Source neutrality:** the same evidence rules apply regardless of whether a claim comes from Michael, UBT, an AI system, an institution, or an outside critic.
- **Origin locks:** later interpretations cannot silently overwrite where an idea began.
- **Branch separation:** control, exploratory, speculative, and canonical lanes remain visibly distinct.
- **Human sovereignty:** the system supports judgment but does not become the final authority over consequential choices.
- **Reconstructable records:** another person should be able to inspect what happened, what failed, and why the conclusion was limited.

## Demonstrated so far

### Internal pilot evidence

An internal same-context RC1 ablation reportedly compared the full governance condition with single-analyst, persona-only, and generic-triad conditions. The full condition produced the most complete audit trail and research-governance record in that test.

This is useful pilot evidence, not broad proof of superiority. Independent cross-model replication remains required.

### Failure kept visible

The Beat-the-Null experiment is a model of the intended discipline: geometric bridge formation survived while the preferred `theta_s` threshold failed. The failure was preserved rather than repaired into a success claim.

### Comparator discipline

The BTI research lane requires a proposed UBT diagnostic to outperform density, tidal structure, topology, survey effects, and established controls rather than merely rediscovering known geometry.

## What remains unproven

Luna•Prime has not yet demonstrated broad superiority across flagship models, independent laboratories, diverse research domains, or long-duration deployments. It is not evidence of machine consciousness and it does not independently validate Universal Balance Theory.

## Calls to action

1. **Read the public note**  
   `https://substack.com/@myquest321666/note/c-305075519`
2. **Explore UBT**  
   Link to Book 1 or the existing public framework path.
3. **Inspect the protocol**  
   Link to the Luna•Prime Protocol repository or public protocol document after the exact destination is verified.
4. **Attempt the Trigon Challenge**  
   Link to `trigon-challenge.html`.

## Poster asset plan

Target path:

`assets/luna-prime/luna-prime-manifesto-poster.webp`

Target treatment:

- Preserve the finished poster composition.
- Export an optimized WebP while retaining a high-quality source outside the runtime path.
- Include intrinsic width and height to prevent layout shift.
- Use lazy loading and asynchronous decoding because the poster appears below the first viewport.
- Wrap the poster in a link to the public Substack Note.
- Do not bake new website claims into the image.

Proposed alt text:

> Luna•Prime manifesto poster presenting Luna, Aria, and Shadow as a triadic AI research-governance process centred on human authority, evidence, challenge, and preserved disagreement.

**Asset gate:** the original finished poster file has not yet been recovered from the connected File Library or the public Note endpoint during this checkpoint. Do not substitute unrelated art or publish a broken asset reference. HTML integration remains gated until the exact poster file is available.

## Minimal code-change plan

Expected runtime changes after the asset gate clears:

- `index.html`: add the Luna•Prime section and semantic links.
- `styles.css`: add scoped `.lpp-*` layout, cards, process flow, evidence labels, and mobile rules.
- `site.js`: update page metadata/schema only if required; avoid new runtime behaviour unless a lightweight accessible process interaction clearly improves the section.
- `assets/luna-prime/luna-prime-manifesto-poster.webp`: optimized poster asset.
- `site-index.json`, `llms.txt`, `llms-full.txt`, `ai-index.html`, and `sitemap.xml`: review and update only if the new public section changes machine-readable claims or adds a dedicated page/asset that should be indexed.

## Accessibility and test gates

Before approval:

- Keyboard navigation and visible focus states.
- Semantic heading order and landmarks.
- Poster alt text and useful link label.
- No meaning conveyed by colour alone.
- Text contrast checked against actual backgrounds.
- Reduced-motion behaviour preserved.
- Desktop widths: 1440, 1280, 1024.
- Mobile widths: 430, 390, 375, 320.
- No horizontal overflow.
- Existing intro animation, sigil trigger, navigation, and footer links remain functional.
- External links resolve and use safe attributes where opening a new context.
- Image dimensions, byte size, lazy loading, and cumulative layout shift reviewed.
- Machine-readable pages retain the same claim ceiling as visible copy.

## Approval boundary

No merge, pull-request readiness transition, deployment, or publication may occur until Michael reviews the draft text, visual placement, screenshots, changed-file list, and diff.
