# Early Pay Terms — review 3 handoff

Work order: `early-pay-terms-review-3`

Reviewed: 29 August 2026 UTC

Base commit: `fbc7e0363e5bc5dfa7b5997c6dafb72ee5ecda27`

## Done

- Completed a cold 390×844 and 1440×900 review of the live product.
- Audited the demo, same-partition storage isolation, Reset demo, Start for real, offline reload, and live request log.
- Ran all 17 `.factory/claims.json` commands separately from a fresh clone.
- Ran the full clean-clone quality gate, route/link/metadata crawl, history/focus checks, and axe scans.
- Rechecked every finding from reviews 1 and 2 against live behavior, source, and tests.
- Recorded the FAIL verdict, 12 findings, complete sentence counts, claim results, and earlier-finding matrix in `.factory/review-3.md`.
- No product code was modified.

## Verification

- Fresh clone: `/tmp/ept-review3-NxMEON/clone`
- Every registered claim command: 17/17 exited 0.
- `CI=1 npm test`: 7/7 Vitest and 42/42 Playwright tests passed.
- Build: `dist/index.html` produced; main JavaScript was 8.26 KB gzip.
- Live focused claims: demo isolation, browser privacy, and offline reload passed in desktop and mobile, 6/6.
- Live reset: one repository-test run raced on its already-matching URL; six repeated test runs and ten manual mobile runs restored `HARBOR-1042`.
- Live routes: `/`, `/demo`, `/privacy/`, and `/terms/` returned 200; an unknown route returned the designed 404.
- Live requests during the audited flows were same-origin.

## Known gaps

Verdict is **FAIL**. Blocking items are low-contrast first-screen facts, incomplete claim tests for demo isolation/location independence/receipt validation/currencies, regressed saved-version terminology, and the incomplete 404 footer. Other findings cover two unlisted claims, the reset-test race, a mislabeled skip link, and an unavailable Plus tier without an exact price.

See `.factory/review-3.md` for exact quotes, evidence, and fixes.
