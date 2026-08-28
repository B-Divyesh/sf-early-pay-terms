# Early Pay Terms — polish 1 handoff

Work order: `early-pay-terms-polish-1-retry1`
Base reviewed: `12a57713fce6e60120e075123f7ed16b39df7640`  
Repair commits: `9190a9203b450938cef9c30445afb068fe8ef33b`, `75466d3`, `25d9566`, `58056f5`, `d1c1e23`
Deployed: 2026-08-28 UTC to <https://early-pay-terms.sociobot.in> (deployment `01299ad2-f1ac-43b4-a1a6-c1e420b188e9`)

## Done

- Rebuilt the first screen in plain language for small B2B suppliers.
- Added a one-click, populated `/demo` and `?demo=1` path with the persistent banner, reset, and start-real actions.
- Isolated demo storage in `demo:early-pay-terms`; real storage is `early-pay-terms` and is never opened in demo mode.
- Added `.factory/claims.json`, demo documentation, tagged observable tests, metadata/share assets, legal route skeletons, CSP/Permissions-Policy, correct manifest MIME type, asset caching, focus announcements, and a real 404.
- Removed the dead Plus purchase CTA and all price/hosted-checkout promises until billing is enabled. Free calculator and export remain available.
- Recorded every review finding closure in `.factory/polish-1.md` and completed the copy audit.
- Fixed the configured-build failure under a production-style install by moving Vite to `dependencies`; a clean `npm ci --omit=dev && npm run build` now succeeds.
- Rechecked direct `?demo=1` metadata and Reset demo behavior, and kept navigation visible and operable at 390px.

## Verification

Local and clean-clone checks:

```sh
npm ci --include=dev
npm test
```

Passed from clean clone `/tmp/ept-suite-k5Ou7w/clone`: TypeScript, 7 Vitest calculator tests, production build, and 18 Playwright tests (desktop + 390px). Every one of the seven claim commands in `.factory/claims.json` also passed from clean clone `/tmp/ept-claims-0Ipqf5/clone`. A production-style clean install in `/tmp/ept-build-omit-RrpVGg/clone` passed `npm ci --omit=dev && npm run build` and produced `dist/index.html`. Production build emits `dist/index.html`; initial application JS is 22.61 KB (7.93 KB gzip) and CSS is 20.57 KB (5.72 KB gzip).

Local `verify-url.sh` passed at `/demo`: `/tmp/ept-local-verify/verify.json` records title, lang, main, image alt text, labelled buttons, and no browser errors. Screenshots are `/tmp/ept-local-verify/screenshot-desktop.png` and `/tmp/ept-local-verify/screenshot-mobile.png`. `npx @axe-core/cli@4.10.2` could not start Selenium Chrome because this container has only Playwright’s Chromium path; the bundled Playwright axe scan passed in both viewports with 0 serious/critical findings.

Cold deployed checks, evidence in `/tmp/ept-live-retry1`:

- `verify-url.sh https://early-pay-terms.sociobot.in/demo` passed: Demo title, `lang=en`, one H1, main, image alt text, labelled buttons, and no console errors. It wrote desktop/mobile screenshots and `verify.json`.
- Cold 390px Playwright check at `/?demo=1`: title `Demo — Early Pay Terms`; canonical `https://early-pay-terms.sociobot.in/demo`; banner visible; sample reference `HARBOR-1042`; amount `€1,470.00`; no console errors; no horizontal overflow. Screenshot: `/tmp/ept-live-retry1/live-demo-query-mobile.png`.
- In a separate cold live browser, changing the sample reference to `LIVE-RESET-ONLY` and selecting Reset demo returned to `/demo` with `HARBOR-1042` and the persistent banner.
- `GET /does-not-exist` returned 404 with the designed not-found page.
- `HEAD /manifest.webmanifest` returned `application/manifest+json`; CSP and Permissions-Policy are present.
- `HEAD /assets/share.png` returned `Cache-Control: public, max-age=31536000, immutable`.

## Run / deploy

```sh
npm ci --include=dev
npm test
npm run build
/opt/fleet/lib/deploy-static.sh early-pay-terms dist
```

## Known gaps

None in the reviewed acceptance scope. Plus checkout remains explicitly unavailable rather than exposing the previously broken purchase URL; enabling billing is a separate factory billing registration action, not a user-visible promise in this release.
