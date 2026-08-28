# Early Pay Terms — build handoff

Work order: `early-pay-terms-build-1`

Completed: 28 August 2026

## Independent verification 1 — PASS

Candidate `243f5c9909a683c7cea9292c1cb9f346fd0caab9` was independently verified on 28 August 2026 against https://early-pay-terms.sociobot.in/. **PASS:** a clean detached checkout passed typecheck, 7 Vitest tests, the exact `npm run build`, and all 16 supplied Playwright cases after installing dev dependencies with `npm ci --include=dev`; the live root, legal pages, service worker, manifest, offline page, icons, and hero files byte-match the fresh build.

Independent coverage additionally confirmed gross/net-tax-fixed calculations, BHD precision, CHF cash rounding, JPY rounding validation and recovery, malformed figures, date recovery, keyboard behavior, 390px layout, reduced motion, no serious/critical axe findings, no browser errors, local-only free-path requests, offline reload, and the controlled service-worker update toast. Fresh Lighthouse scores were Performance 94, Accessibility 100, Best Practices 100, and SEO 100 (LCP 1.0 s, CLS 0). Full evidence and three low-severity CDN hardening observations (manifest MIME type, 30-second asset caching, absent CSP/Permissions-Policy) are in `.factory/verification-1.md`.

The verifier made no product-code changes. In this container bare `npm ci` honored a global `dev=false` npm setting and omitted test tools; use `npm ci --include=dev` for the quality gates.

## What shipped

- A responsive early-payment terms calculator using integer minor-unit arithmetic. Operators explicitly select currency precision, discount basis/tax treatment, rounding, issue date, discount deadline, and final due date.
- A live breakdown and printable/PDF payment card showing the exact early amount, discount, original total, net and tax inputs, post-deadline amount, dates, formula, and calculation-engine version.
- A $19 one-time Plus unlock through the Sociobot hosted checkout and license verification contract. Returned licenses are stored locally and removed from the URL; cached valid licenses unlock optimistically; licenses can be pasted to restore on another device.
- Plus features: versioned local calculation history with restore/delete/undo, reusable terms templates, and paid-on-time receipts that require the received date and amount to exactly satisfy the terms.
- Local-first data in IndexedDB with automatic draft persistence, JSON import/export, CSV export, confirmed clearing, and no invoice-data network transfer.
- Installable PWA metadata, original 192/512/maskable icons, a versioned app-shell service worker, offline navigation fallback, cache-first assets, and in-app update messaging.
- Product-specific mid-century instrument-panel interface, including the selected generated instrument still-life in 18 KB and 42 KB responsive WebP files. Sources, prompts, review criteria, and provenance are recorded in `.factory/design.md` and `assets/src/`.
- Privacy and terms pages, MIT license, crawler metadata, and full operator/developer documentation.

## How to run

```sh
npm ci
npm run dev
```

Production build command (exact work-order command):

```sh
npm run build
```

The static deploy output is `dist/`, with `dist/index.html` at its root.

## Verification performed

- `npm test` — passed: TypeScript check, 7 Vitest calculation tests, production build, and 16 Playwright cases (8 desktop Chromium + 8 at 390×844).
- Browser coverage includes gross/net-only/proportional-tax calculations, currency and 0.05 rounding, large-value precision, useful validation errors, printable terms, exact-payment receipt validation, IndexedDB persistence, returned/cached licenses, legal landmarks, and horizontal overflow.
- Offline test — passed with `browserContext.setOffline(true)`: cached app shell reloads, the saved draft and calculated result remain available, and the UI reports “Working offline.”
- Axe via Playwright — zero serious or critical violations on desktop and mobile.
- `/opt/fleet/lib/verify-url.sh` against the production preview — HTTP 200, no console/page errors, `lang="en"`, one `h1`, a `main` landmark, no images missing alt text, and no unlabeled buttons. Load completed in 887 ms in the final smoke run.
- Lighthouse 12.8.2 mobile/default throttling against the production preview:
  - Performance: 100
  - Accessibility: 100
  - Best Practices: 100
  - SEO: 100
  - FCP: 0.9 s; LCP: 1.1 s; TBT: 0 ms; CLS: 0; interactive: 1.1 s
  - Initial transfer: 59 KiB
- Build budgets: application JS 20.82 KB raw / 7.39 KB gzip; application CSS 18.78 KB raw / 5.39 KB gzip; mobile hero 18 KB; desktop hero 42 KB; no webfonts.

## Privacy and external services

There is no analytics, tracking, remote font, or third-party runtime script. Invoice data remains in the browser. The only optional external request is license verification; checkout is a normal link to Sociobot. Local development uses `pilot-api.sociobot.in`, while the deployed Sociobot domain uses the production API.

## Known boundaries / next steps

- The factory still needs to register and release the paid product; no product ID is hardcoded. The slug-only checkout/verify URLs are already wired as required.
- Tax and early-discount rules vary by contract and region. The app deliberately does not choose a treatment; operators must select and verify it. This limitation is visible in the workbench, output, terms, and receipt.
- The PWA is not wrapped with Capacitor because the job requires no native capability. It is installable directly from supported browsers.
- Lighthouse values are local preview measurements and should be rechecked after production deployment/CDN configuration.
