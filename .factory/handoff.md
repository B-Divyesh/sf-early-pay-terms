# Early Pay Terms — polish 2 handoff

Work order: `early-pay-terms-polish-2`

Repair commits: `4020f6a`, `5e6d653`, `674ba911b998710c0ae2f657ccc02744486b4680`, and `6f4d0c71b6207663eba15fb01d0594bfd73c3aef`.

Final deployment ID: `822be708-1606-4c56-9b5d-7bf3411f9b83`

Live URL: <https://early-pay-terms.sociobot.in>

## Done

- Closed all 18 review-2 findings and rechecked all 80 earlier finding IDs. The per-finding map is in `.factory/polish-2.md`.
- Made `/demo` and `?demo=1` an immediate, first-viewport product demonstration at 390×844 and desktop sizes.
- Kept demo state in `demo:early-pay-terms`; reset and exit clear only that database’s stores and never open production data.
- Added complete claim coverage: 17 registry entries, exactly one `@claim:<id>` test per entry, and observable assertions for outcomes and requests.
- Restored anchor scroll, heading focus, and route announcement after Privacy → browser Back.
- Made header navigation, titles, canonical/social metadata, legal links, and 404 behavior consistent across routes.
- Fixed the final axe region issue, 44px demo controls, **Copy payment terms**, mobile layout, and the cumulative copy findings.
- Fixed a production-only PWA install defect: Azure consumes `staticwebapp.config.json`, so it is now excluded from precache. Cache `early-pay-terms-v2` installs and controls the live app.
- Preserved the warm-paper/dark-enamel payment-instrument visual system and added a compact on-thesis demo readout.
- Updated the catalog description, README, demo documentation, design note, copy audit, claims registry, screenshots, and this handoff.

AI was not added. The researched task is deterministic financial calculation, and the brief does not benefit from model output.

## Exact verification

### Browser-suite reliability repair

- `tests/e2e/fixtures.ts` now gives each Playwright spec a new Chromium process, browser context, and page, then closes all three during fixture teardown. The suite runs one spec at a time with `CI=1`; it does not reuse a browser lifecycle across specs.
- The tests no longer sleep for a debounced persistence guess. The app marks `#terms-form[data-draft-state="saved"]` only after IndexedDB resolves, and persistence tests wait for that observable state.
- Chromium is explicitly 1440×900 and mobile is explicitly 390×844. Additional contexts inherit the project settings, so claim tests run at both declared viewports.
- Local evidence: `CI=1 npm test` passed TypeScript, 7/7 Vitest tests, the production build, and 42/42 Playwright tests.
- Fresh-clone evidence: `/tmp/ept-polish2-retry1-aH4owc` was cloned from repair commit `674ba911b998710c0ae2f657ccc02744486b4680`, then ran `npm ci --include=dev`. All 17 exact commands listed in `.factory/claims.json` passed separately. `CI=1 npm run test:stable` then passed twice in succession: each run had TypeScript, 7/7 Vitest, `dist/index.html`, and 42/42 Playwright passing.
- Claim audit: 17 claims, 17 tagged tests, and every ID appeared exactly once in `tests/e2e/app.spec.ts`.
- Local route verifier: `/opt/fleet/lib/verify-url.sh` passed `/`, `/demo`, `/privacy/`, and `/terms/` against the clean build. Each had zero console errors, `lang=en`, one h1, a main landmark, and no missing image alt text or unlabeled buttons. Playwright axe remains zero-violation in both browser projects.

### Final clean clone

Final evidence directory: `/tmp/ept-polish2-final-JjUbHw` (clone of `5e6d653`).

```sh
npm ci --include=dev
# each of the 17 commands from .factory/claims.json, individually
npm test
```

- All 17 claim commands passed in desktop Chromium and 390×844 Chromium.
- Full suite passed: TypeScript, 7/7 Vitest tests, production build, and 42/42 Playwright tests.
- Build output: `dist/index.html`; Vite reported 23.80 KB JS (8.22 KB gzip) and 21.92 KB CSS (5.98 KB gzip) before deliberate inlining.
- Delivered `index.html`: 18,721 bytes gzip. Hero WebP files: 18 KB mobile and 42 KB desktop. No remote fonts.

### Accessibility, browser, privacy, and offline

- Playwright axe integration found zero violations on the demo in desktop and mobile projects.
- `verify-url.sh` passed local and final live `/`, `/demo`, `/privacy/`, and `/terms/`: correct title, `lang=en`, one H1, one main, no missing alt text, no unlabeled buttons, and no console errors.
- Final live load times reported by the post-deploy verifier: root 943 ms, demo 624 ms, privacy 732 ms, terms 719 ms.
- Request-log tests passed for normal calculations, both exports, all real routes, and runtime assets. Only same-origin requests occurred unless the explicit mocked license check was invoked.
- License test asserted the Sociobot product-verification destination, GET method, exactly one license query key, no request body, and no invoice reference.
- Offline reload passed locally, from the final clean clone, and on the final live deployment in both browser projects.
- Demo reset and `?demo=1` metadata passed locally and on the final live deployment in both browser projects.
- Privacy → Back restored `/#workbench`, `#workbench-title` focus, the polite announcement, and nonzero calculator scroll in both projects.
- Unknown live paths return HTTP 404 with the designed `404 — Early Pay Terms` document.

### Live production recheck

```sh
PLAYWRIGHT_BASE_URL=https://early-pay-terms.sociobot.in npx playwright test
```

After the browser-lifecycle repair, `CI=1 PLAYWRIGHT_BASE_URL=https://early-pay-terms.sociobot.in npx playwright test` passed 42/42 tests in one uninterrupted live run. That includes all 17 tagged claims, desktop and mobile axe checks, history focus restoration, metadata/header/404 checks, and controlled offline reload. The cold verifier again passed `/`, `/demo`, `/privacy/`, and `/terms/` with no console errors; `/does-not-exist` returned HTTP 404 and the designed title/h1.

Committed cold screenshots from the final live deployment:

- `.factory/evidence/polish-2-demo-mobile.png` — 390×844
- `.factory/evidence/polish-2-demo-desktop.png` — 1440×900

Live response headers include HSTS, CSP with `frame-ancestors 'none'`, Permissions-Policy, nosniff, and strict-origin referrer policy. `/manifest.webmanifest` uses the manifest MIME type; `/sw.js` is no-cache; static assets have immutable caching.

### Performance

Lighthouse 13.0.1, final live URL, mobile profile:

| Category | Score |
| --- | ---: |
| Performance | 100 |
| Accessibility | 100 |
| Best practices | 100 |
| SEO | 100 |

FCP 1.0 s; LCP 1.1 s; TBT 0 ms; CLS 0.

## Deploy

The tested `dist/` was uploaded with:

```sh
/opt/fleet/lib/deploy-static.sh early-pay-terms dist
```

Final Azure Static Web Apps deployment succeeded under ID `822be708-1606-4c56-9b5d-7bf3411f9b83`, and the custom domain returned 200 immediately afterward.

## Known gaps

None within the reviewed product scope. Plus is deliberately not offered for sale in this release because the billing product is not enabled; there is no checkout link or purchase promise. Existing licenses can still be restored and all entitlement behavior is fixture-tested. Enabling sale later requires a separate authorized billing work order.
