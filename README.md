# UniversalBalanceTheory.ca

Public GitHub Pages website for Universal Balance Theory by Michael Eric West.

Truth label: public-safe starter publish package.

## Purpose

This repository hosts the first public website package for `universalbalancetheory.ca`.

The site is a mythic-science gateway for Universal Balance Theory, Luna-Prime OS, the Trigon Challenge, and the Luna / Aria / Shadow lanes.

## Public-safety boundary

This repo must stay public-safe.

Do not commit:

- private Luna Bank or Michael Bank material
- `.env` files or secrets
- API keys, GitHub tokens, Namecheap credentials, or passwords
- local databases, exports, caches, model files, screenshots with private info
- PulseGarden runtime files

PulseGarden remains separate as the local-first Luna PC assistant/runtime repo.

## Root files

- `index.html` - public gateway page
- `luna.html` - Luna / story lane
- `aria.html` - Aria / science lane
- `shadow.html` - Shadow / falsification lane
- `CNAME` - custom domain declaration
- `.nojekyll` - GitHub Pages static-site guard

## GitHub Pages setup

In GitHub:

1. Open repository Settings.
2. Go to Pages.
3. Set Source to `Deploy from a branch`.
4. Set Branch to `main`.
5. Set Folder to `/root`.
6. Save.
7. Set Custom domain to `universalbalancetheory.ca`.
8. Enable HTTPS when GitHub allows it.

## Namecheap DNS

After Pages is enabled, Namecheap Advanced DNS should contain:

```text
A Record
Host: @
Value: 185.199.108.153

A Record
Host: @
Value: 185.199.109.153

A Record
Host: @
Value: 185.199.110.153

A Record
Host: @
Value: 185.199.111.153

CNAME Record
Host: www
Value: MyQuest83.github.io
```

Do not add wildcard DNS records.

## Claim boundary

UBT is presented here as a framework, research program, governance protocol, and test challenge. The public site should not claim final proof of new physics.

Truth first. Love always. Question everything.
