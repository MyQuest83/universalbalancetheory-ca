# Security Policy

## Public website scope

This repository publishes the static public website at `https://universalbalancetheory.ca/`. It must contain only material intentionally approved for public release.

Do not commit passwords, personal access tokens, API keys, OAuth credentials, refresh tokens, private keys, recovery codes, private Drive links, private chat exports, medical or financial records, or unpublished research material.

## Reporting a vulnerability

Please report suspected vulnerabilities privately by email to `mrmikewest83@gmail.com` with the subject `UBT Security Report`.

Include:

- the affected URL or repository path
- clear reproduction steps
- the expected and observed result
- screenshots or a minimal proof of concept when useful
- whether any private data may have been exposed

Please avoid destructive testing, denial-of-service activity, social engineering, credential attacks, or accessing data beyond what is needed to demonstrate the issue.

## Response priorities

1. Contain active exposure or credential leakage.
2. Revoke and rotate affected credentials.
3. Preserve evidence and timestamps.
4. Patch the root cause through a reviewed change.
5. Verify deployment and document the outcome.

## Repository hygiene

- Store runtime secrets only in the platform's encrypted secret store.
- Prefer fine-grained, expiring access tokens with the minimum required permissions.
- Review dependencies and security alerts regularly.
- Keep private research and personal continuity data outside this public repository.
- Treat any accidentally committed credential as compromised, even after deletion from the latest file version.
- Keep backups outside the public repository; a public backup branch is still public.
- Deleting a file or adding `noindex` does not remove earlier commits, public branches, cached copies, or existing downloads.
- The QC workflow checks common secret formats, executable links, and private references in public pages, auxiliary source indexes, and shared metadata. It is not a complete privacy or security audit of repository history or retained pages.
