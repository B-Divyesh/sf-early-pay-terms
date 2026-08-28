# Early Pay Terms — adversarial review 1 handoff

Work order: `early-pay-terms-review-1`

Completed: 28 August 2026 UTC

Reviewed base: `12a57713fce6e60120e075123f7ed16b39df7640`

## Result

**FAIL.** The complete report is in `.factory/review-1.md`. No product code was modified.

Blocking results:

- The first screen does not name the intended small B2B supplier.
- There is no one-click sample demo, banner, reset, or start-real action.
- `/demo` and `?demo=1` use the real `early-pay-terms` IndexedDB; a demo-entered value reappeared at `/`.
- `.factory/claims.json` and all `@claim:<id>` tests are missing.
- “Buy Plus — $19 once” returns HTTP 404.
- Unknown paths return the root page with HTTP 200; there is no designed 404.

The review also records every unlisted claim, the complete landing/README word-count audit, copy rewrites, metadata/routing/skeleton findings, one moderate live axe landmark issue, and the three still-open deployment observations from the prior verification.

## Verification performed

- Fresh Chromium contexts at 390×844 and 1440×900 against the live URL.
- Playwright request, console, storage-isolation, route-focus, back-navigation, and live axe probes.
- Link crawl and response checks for root, legal pages, checkout, unknown route, manifest, sitemap, and robots.
- Clean detached clone at the reviewed base:

```sh
npm ci --include=dev
npm test
```

Result: 7/7 unit tests passed, production build produced `dist/`, and 16/16 Playwright cases passed. This is not claim-contract evidence because no claims registry or tags exist.

## Files changed

- `.factory/review-1.md` — full adversarial review and FAIL verdict.
- `.factory/handoff.md` — this review handoff.

## Known gaps / next step

All open work is enumerated as F-1-1 through F-1-80 in the review. The next worker should fix every finding, add the demo and claim contract first, then request a full from-scratch review. A passing general test suite alone is insufficient.
