# Early Pay Terms — polish 1 handoff

Work order: `early-pay-terms-polish-1`  
Base reviewed: `12a57713fce6e60120e075123f7ed16b39df7640`  
Repair commits: `9190a9203b450938cef9c30445afb068fe8ef33b`, `75466d3`, `25d9566`  
Deployed: 2026-08-28 UTC to <https://early-pay-terms.sociobot.in>

## Done

- Rebuilt the first screen in plain language for small B2B suppliers.
- Added a one-click, populated `/demo` and `?demo=1` path with the persistent banner, reset, and start-real actions.
- Isolated demo storage in `demo:early-pay-terms`; real storage is `early-pay-terms` and is never opened in demo mode.
- Added `.factory/claims.json`, demo documentation, tagged observable tests, metadata/share assets, legal route skeletons, CSP/Permissions-Policy, correct manifest MIME type, asset caching, focus announcements, and a real 404.
- Removed the dead Plus purchase CTA and all price/hosted-checkout promises until billing is enabled. Free calculator and export remain available.
- Recorded every review finding closure in `.factory/polish-1.md` and completed the copy audit.

## Verification

Local and clean-clone checks:

```sh
npm ci --include=dev
npm test
```

Passed locally and from clean clone `/tmp/early-pay-terms-clean-wGNpGq`: TypeScript, 7 Vitest calculator tests, production build, and 16 Playwright tests (desktop + 390px). All seven claim tests in `.factory/claims.json` run through `npm test` and passed. Production build emits `dist/index.html`; initial application JS is 22.61 KB (7.93 KB gzip) and CSS is 20.44 KB (5.69 KB gzip).

Local `verify-url.sh` passed at `/demo`. The explicit `npx @axe-core/cli` run was attempted twice but its Selenium Chrome launcher failed in this container; the equivalent bundled Playwright axe scan passed in both test viewports and again against the deployed mobile `/demo` route with 0 serious/critical violations.

Cold deployed checks, evidence at `/tmp/ept-live-evidence-final`:

- `verify-url.sh https://early-pay-terms.sociobot.in/demo` passed: Demo title, `lang=en`, one H1, main, image alt text, labelled buttons, and no console errors.
- Cold 390px Playwright check: title `Demo — Early Pay Terms`; banner visible; sample reference `HARBOR-1042`; amount `€1,470.00`; no console errors; zero serious/critical axe findings; no horizontal overflow. Screenshot: `/tmp/ept-live-evidence-final/live-demo-mobile.png`.
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
