# Independent verification 1 — PASS

**Candidate:** `243f5c9909a683c7cea9292c1cb9f346fd0caab9` (`docs: record verification and release handoff`)

**Verified:** 2026-08-28 UTC

**Live URL:** https://early-pay-terms.sociobot.in/

## Result

**PASS.** The candidate meets the researched brief's smallest useful product: it locally calculates explicit early-payment terms with selectable basis/tax treatment, currency precision and rounding; presents an unambiguous payment card; preserves local work; offers the paid-on-time receipt when licensed; and clearly disclaims tax/legal/accounting advice. The live deployment is the exact output of this candidate, not merely similar content.

There are no release-blocking functional, accessibility, privacy, offline, or deployment-identity defects.

## Clean-checkout gates

Validation was run from a separate clean clone at `/tmp/early-pay-terms-qa`, detached at the candidate SHA.

| Check | Evidence | Result |
| --- | --- | --- |
| Install | `npm ci --include=dev`; 61 packages, 0 vulnerabilities | Pass |
| Type check | `tsc --noEmit` through `npm test` | Pass |
| Unit tests | Vitest: 7/7 calculator tests | Pass |
| Exact production build | `npm run build` / build stage in `npm test` | Pass; `dist/` produced |
| Browser integration | Playwright: 16/16 desktop Chromium + 390×844 mobile cases | Pass |
| Lint | No lint script/config is present in the repository | N/A |

The container's global npm config had `dev=false`, so a bare initial `npm ci` intentionally omitted every dev dependency and `npm test` stopped at `tsc: not found`. Re-running the documented install with `--include=dev` made no repository change and all declared gates passed. This is an environment configuration effect, not a candidate dependency-lock failure.

The fresh build emitted 20.82 KB JS (7.39 KB gzip) and 18.78 KB CSS (5.39 KB gzip) before the product's deliberate inlining step. The delivered `index.html` is 55,737 bytes (17,170 bytes gzip); mobile/desktop hero WebP are 18,344/41,928 bytes. These are within the static/PWA JS, CSS, font, and hero budgets.

## Independent functional exercise

All checks below were against the fresh production build in Chromium, in addition to the supplied suite.

| Scenario | Expected / observed result | Result |
| --- | --- | --- |
| EUR gross, net 1,000.00 + tax 190.00, 2% | early amount €1,166.20; discount €23.80; later total €1,190.00 | Pass |
| Net-only / tax fixed | early amount €1,170.00 | Pass |
| BHD three-decimal boundary, 1.001 at 2.5% | early amount BHD 0.976; discount BHD 0.025 | Pass |
| CHF 0.05 cash rounding, 100.00 at 2.03% | early amount CHF 97.95; discount CHF 2.05 | Pass |
| JPY with 0.05 cash rounding | useful error: `0.05 cash rounding is not available for this currency.` | Pass |
| JPY recovery after selecting standard rounding | ¥98 is recalculated | Pass |
| Non-numeric amount | useful error: `Net amount must be a positive number.` | Pass |
| Reversed dates | useful error identifies the discount deadline before issue date; correcting it recalculates €98.00 | Pass |
| Payment card and receipt paths | Existing Playwright tests cover card fields/printing and exact full, on-time receipt; an ambiguous receipt is rejected | Pass |
| Draft persistence | Existing Playwright and independent offline run preserve the draft | Pass |

## Browser, accessibility, privacy, and PWA checks

- `/opt/fleet/lib/verify-url.sh http://127.0.0.1:4174/ /tmp/ept-verify` passed: title present, `lang=en`, one `h1`, `main`, no missing image alt text, no unlabeled buttons, no console/page errors; fresh load was 963 ms.
- Fresh axe scans on desktop and at 390×844 found **0 serious/critical** findings in each viewport. There was no horizontal overflow. Keyboard-only navigation reaches and activates the radio choices; desktop focus has the designed 3px ring and the mobile skip link becomes visible. Under `prefers-reduced-motion: reduce`, animation duration was `0.01ms` and no horizontal overflow occurred.
- Browser request capture on local production and on the live URL contained only the first-party origin for an ordinary free calculation. Source review found no analytics, pixels, remote fonts, or third-party runtime scripts. Invoice drafts/history/templates use IndexedDB; only the optional license and cached verdict use localStorage. The only optional cross-origin application request is the documented Sociobot license verification endpoint.
- The PWA registered and controlled `/sw.js`. In an independent context, after service-worker control and `context.setOffline(true)`, a reload retained invoice `OFFLINE-QA`, early amount €245.00, and status `Working offline`, with no errors.
- A controlled static test server serving the exact `dist/` changed only the service-worker response revision. After a normal controlled reload, `registration.update()` caused a controller change and the product displayed `A fresh version is ready.` This confirms the real update path and in-app notification; no product source was modified.

## Performance

Fresh Lighthouse 13.4.1, mobile/default throttling against the local production preview:

| Category | Score |
| --- | ---: |
| Performance | 94 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

FCP 0.9 s; LCP 1.0 s; interactive 1.3 s; TBT 280 ms; CLS 0. The required LCP and score thresholds pass.

## Live deployment identity and response policy

`GET https://early-pay-terms.sociobot.in/` returned 200 with no console/page errors in a fresh browser context. The root HTML SHA-256 was identical to fresh `dist/index.html`:

`d463fc2407aa1d70db1dbb400494be814927ecd6da9bcda9578a31cbcdee88a0`

Fresh byte comparisons also matched `/privacy/`, `/terms/`, `/sw.js`, `/manifest.webmanifest`, `/offline.html`, all three PNG icons, and both hero WebPs. The response has HSTS (`max-age=10886400; includeSubDomains; preload`), `X-Content-Type-Options: nosniff`, and `Referrer-Policy: strict-origin-when-cross-origin`.

### Non-blocking deployment observations (low severity)

1. The CDN serves `/manifest.webmanifest` as `application/octet-stream`, rather than `application/manifest+json` or `application/json`.
2. The CDN applies `public, must-revalidate, max-age=30` to all assets, including versioned/precached PWA assets. The service worker still provides offline operation, but immutable long-lived asset caching would be more efficient.
3. The live response does not currently include Content-Security-Policy or Permissions-Policy headers. The static app has no observed third-party runtime requests, but a restrictive CSP would be useful defense in depth.

These are factory/CDN hardening follow-ups, not product-code failures and do not prevent the documented PWA behavior or this acceptance PASS.

## Reproduce

```sh
npm ci --include=dev
npm test
npm run build
npm run preview
```

Then run Playwright/axe against the preview and compare the requested live artifacts with `sha256sum`. The candidate itself was not modified during verification.
