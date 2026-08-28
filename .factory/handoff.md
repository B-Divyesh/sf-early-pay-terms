# Early Pay Terms — review 2 handoff

Work order: `early-pay-terms-review-2`
Reviewed commit: `786c3c93d01d19f29c9a2a3c9d36ced9c7800783`
Live target: <https://early-pay-terms.sociobot.in>

## Done

- Performed a read-only adversarial review. No product source or deployment files were changed.
- Wrote `.factory/review-2.md` with the full cold-read, copy, demo, claim, sandbox, history, route, accessibility, and link review.
- Replaced this handoff with reviewer evidence and the remaining acceptance gaps.

## Verification performed

From a fresh clone at `/tmp/ept-review-2-GKdY2X`:

```sh
npm ci --include=dev
npm test -- --grep @claim:demo-isolation
npm test -- --grep @claim:payment-card
npm test -- --grep @claim:browser-privacy
npm test -- --grep @claim:exports
npm test -- --grep @claim:offline-reload
npm test -- --grep @claim:currencies
npm test -- --grep @claim:receipt-validation
npm test
```

Each listed claim command passed in desktop and 390px Chromium. The full suite passed: TypeScript, 7 Vitest tests, production build, and 18 Playwright tests.

Fresh live Playwright checks covered `/` and `/demo` at 390×844 and 1440×900, request logging, demo IndexedDB isolation, link/metadata crawl, 404/header checks, and route focus/back. Live axe 4.10.2 found no serious/critical violations, but one moderate `region` violation on the demo banner.

## Known gaps / review result

**FAIL.** See `.factory/review-2.md` for all 18 findings. The release-blocking gaps are:

- `/demo` opens on the hero instead of immediately showing the populated sample calculator/readout; at 390px the form begins 1,492px below the viewport.
- Returning from Privacy to `/#workbench` loses the prior position, focus, and route announcement.
- Legal routes omit `Saved versions` from the landing page’s header navigation.

Additional work is needed to place the demo banner in a landmark, rename `Copy wording`, and either test/register or remove every remaining visitor-facing claim listed in the review.
