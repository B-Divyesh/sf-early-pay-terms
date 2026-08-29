# Early Pay Terms — polish round 3 handoff

Work order: `early-pay-terms-polish-3`

Completed: 29 August 2026 UTC

Base: `70f99d25b678634533dd7f4dc2f9dcfdd38b1acf`

Shipped application commit: `59ba83172b74f454e2ad43e2c7c7b28b8d4dd8de`

Live URL: <https://early-pay-terms.sociobot.in>

## What changed

- Rewrote the first screen to state the calculation job plainly and removed the unbounded “exact” claim.
- Raised first-screen helper/fact contrast to 9.36:1 and made the financial readout stable and directly contrast-testable.
- Made `/demo` and `?demo=1` a one-click Harbor Paper Co. sample with a persistent banner, Reset demo, and Start for real.
- Isolated demo and production IndexedDB data in one browser partition and isolated their license/localStorage namespaces.
- Cancelled pending draft writes before reset/exit so demo data cannot be recreated during navigation.
- Expanded `.factory/claims.json` to 19 visitor claims, each with exactly one tagged observable browser test.
- Added complete currency, receipt-boundary, tax-location-independence, license-restoration, deletion, privacy, import/export, and entitlement assertions.
- Removed the unavailable Plus sales tier, price copy, checkout links, and locked paid actions. Existing-license restoration remains tested.
- Standardized “saved version,” completed route metadata/navigation/footer/404/legal structure, and fixed route focus/back behavior.
- Preserved the product-specific mid-century payment-instrument design and updated its motion policy in `.factory/design.md`.
- Updated README, privacy, terms, demo documentation, catalog description, copy audit, and the complete finding matrix in `.factory/polish-3.md`.

## Exact verification

### Clean clone and claims

- Fresh clone: `/tmp/early-pay-terms-verified-clean-QFUWTp/repo` at `59ba83172b74f454e2ad43e2c7c7b28b8d4dd8de`.
- `npm ci --include=dev`: 61 packages installed, 0 vulnerabilities.
- Every command in `.factory/claims.json`: **19/19 passed individually**.
- `npm run test:stable`: **passed twice**. Each run completed TypeScript checks, **7/7 unit tests**, a production build, and **50/50 Playwright tests** across desktop Chromium and 390×844 mobile.
- A focused route/axe/focus/contrast run passed **12/12** across three repetitions after the final accessibility change.

### Build and budgets

- `npm run build`: passed; `dist/index.html` exists.
- Main JavaScript: 24.03 KB raw / **8.25 KB gzip**.
- Main CSS: 20.89 KB raw / **5.58 KB gzip**.
- Mobile hero image: **18.34 KB**; desktop hero image: 41.93 KB.
- Local Lighthouse 13.4.1: **100 performance / 100 accessibility / 100 best practices / 100 SEO**.
- Local metrics: FCP 0.9 s; LCP 1.2 s; interactive 1.2 s; TBT 0 ms; CLS 0.
- Report: `.factory/evidence/polish-3-lighthouse.json`.

### Accessibility, mobile, and browser behavior

- Axe integration reports **0 violations** on `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404 in both viewports.
- Deterministic contrast checks cover the first-screen helper/facts and the main result readout at least 4.5:1.
- Skip-link activation focuses the page H1; route/back navigation restores calculator scroll, focus, URL, and polite announcement.
- No horizontal overflow at 1440×900 or 390×844; touch controls meet the 44px baseline; reduced motion remains supported.
- Local route verifier reported one H1, `lang=en`, a main landmark, complete alt text, labelled buttons, and no console/page errors on every route.
- Screenshots: `.factory/evidence/polish-3-local-root/`, `.factory/evidence/polish-3-local-demo/`, `.factory/evidence/polish-3-local-privacy/`, and `.factory/evidence/polish-3-local-terms/`.

### Privacy, demo, and offline

- The same-context isolation test observes both `early-pay-terms` and `demo:early-pay-terms`, verifies collisions in both directions, and proves Reset/Start for real preserve production data.
- Demo license keys use `demo:sb_license:*`; production keys are never read or changed while the demo banner is visible.
- Calculator/export request logs are same-origin; the optional verification test allows only the product-bound Sociobot GET with a sole token query and empty body.
- JSON export excludes a sentinel license token. Clear local data removes calculations, saved versions, and templates while retaining the license.
- A service-worker-controlled demo reload passed after `context.setOffline(true)` locally and on production.

### Deployment and cold production audit

- Deployment command: `/opt/fleet/lib/deploy-static.sh early-pay-terms dist`.
- Azure Static Web Apps deployment ID: `5e52db98-adc7-49d8-930c-01f9502d6717`.
- Cold live Playwright run: **50/50 passed** in 1.7 minutes.
- Cold live verifier: `/`, `?demo=1`, `/privacy/`, and `/terms/` returned 200 with correct titles, one H1, no missing alt text, and no console/page errors.
- Unknown route `/does-not-exist` returned the designed page with HTTP 404. `/sw.js` and `/manifest.webmanifest` returned 200.
- `dist/index.html` and the cold live root response have identical SHA-256: `112efe49ed9ef42dd6ec27289ccc3ee53e9a1c65b20bbcfedad1cfa02f102573`.
- Required security headers are live, including CSP as a response header, HSTS, `nosniff`, referrer policy, and a restrictive permissions policy.
- Live Lighthouse 13.4.1: **100 / 100 / 100 / 100**; FCP 1.0 s, LCP 1.0 s, interactive 1.1 s, TBT 30 ms, CLS 0.
- Live evidence: `.factory/evidence/polish-3-live-root/`, `.factory/evidence/polish-3-live-demo/`, `.factory/evidence/polish-3-live-privacy/`, `.factory/evidence/polish-3-live-terms/`, and `.factory/evidence/polish-3-live-lighthouse.json`.

## Run locally

```bash
npm ci
npm test
npm run build
npm run preview
```

Use `http://localhost:4173/?demo=1` for an isolated sample. See `.factory/demo.md` for its data and reset contract.

## Known gaps and next steps

No review finding or product defect is left unresolved. The Sociobot checkout endpoint still returns 404, so the product correctly exposes no sales offer. If billing is registered later, add the exact price and tested Sociobot checkout before showing purchase controls.
