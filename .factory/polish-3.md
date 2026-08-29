# Perfection loop round 3 — finding closure

Completed: 29 August 2026 UTC  
Work order: `early-pay-terms-polish-3`  
Reviewed base: `70f99d25b678634533dd7f4dc2f9dcfdd38b1acf`  
Shipped application commit: `59ba83172b74f454e2ad43e2c7c7b28b8d4dd8de`  
Deployment: `5e52db98-adc7-49d8-930c-01f9502d6717` at <https://early-pay-terms.sociobot.in>

## Verification anchors

- Every one of the 19 commands in `.factory/claims.json` passed from clean clone `/tmp/early-pay-terms-verified-clean-QFUWTp/repo` at application commit `59ba831`.
- `npm run test:stable` passed twice in that clone: each run had 7/7 unit tests, a successful `dist/` build, and 50/50 Playwright tests.
- The cold production run `CI=1 PLAYWRIGHT_BASE_URL=https://early-pay-terms.sociobot.in npx playwright test` passed 50/50.
- Local and live route verification found one H1, `lang=en`, a main landmark, complete image alt text, labelled buttons, and no console/page errors.
- Landing evidence: `.factory/evidence/polish-3-live-root/screenshot-desktop.png` and `.factory/evidence/polish-3-live-root/screenshot-mobile.png`.
- Demo evidence: `.factory/evidence/polish-3-live-demo/screenshot-desktop.png` and `.factory/evidence/polish-3-live-demo/screenshot-mobile.png`.
- Legal evidence: `.factory/evidence/polish-3-live-privacy/` and `.factory/evidence/polish-3-live-terms/`.
- Local and live Lighthouse 13.4.1 scored 100 in performance, accessibility, best practices, and SEO. Reports: `.factory/evidence/polish-3-lighthouse.json` and `.factory/evidence/polish-3-live-lighthouse.json`.

## Review 3 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-3-1 | Hero helper and fact text now use `#d8e6df` on `#153c3b` (9.36:1). The obscuring texture overlay and moving financial readout were removed. | `first screen wording, contrast, skip link, and viewport fit`; `accessibility, title, focus, and mobile layout`; live landing screenshots; live 50/50. |
| F-3-2 | Removed the unbounded “exact” claim. The H1 is “Calculate early-payment invoice terms.” | First-screen wording test; `.factory/copy-audit.md`; live `/` screenshot. |
| F-3-3 | Added the `license-restoration` registry claim with valid, invalid, unavailable-service, and cached-reload fixtures. | `@claim:license-restoration` from the clean clone and live suite. |
| F-3-4 | Reset waits for a new document and `data-ready`; handlers cancel pending draft writes, make the form inert, clear demo stores, and then navigate. | Query-demo reset test; `@claim:demo-isolation` repeated three times during repair; live 50/50. |
| F-3-5 | Root skip link now says “Skip to content” and moves focus to the H1. | First-screen keyboard test; live `/`. |
| F-3-6 | Removed the unavailable Plus promotion, price language, purchase links, and locked paid controls. Only existing-license restoration remains. | `unavailable Plus sales controls are absent…`; `@claim:plus-entitlements`; live checkout independently remains 404 and is not linked. |

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-2-1 | Demo controls remain a labelled aside with 44px controls. | Axe route tests; live demo screenshots. |
| F-2-2 | The action is consistently “Copy payment terms.” | `@claim:payment-card`; live `/demo`. |
| F-2-3 | Unlicensed calculation, card creation, and export are registered and exercised. | `@claim:free-core`; `@claim:exports`. |
| F-2-4 | The card test asserts every displayed amount, date, rule, and rounding note. | `@claim:payment-card`. |
| F-2-5 | Edited demo drafts survive reload without entering production storage. | `@claim:draft-persistence`; `@claim:demo-isolation`. |
| F-2-6 | All three paid controls are hidden without a license and functional with a valid cached fixture. | `@claim:plus-entitlements`. |
| F-2-7 | Removed the unavailable sales tier instead of advertising something that cannot be bought. | Unavailable-sales browser test; live `/` and screenshots. |
| F-2-8 | Landing copy contains no billing implementation language; token verification has its own privacy claim. | `@claim:license-check-privacy`; copy audit. |
| F-2-9 | Print flow asserts invoice, early amount, deadline, later balance, and two print invocations. | `@claim:print-payment-card`. |
| F-2-10 | JSON export/import restores edited calculation and supplier fields in a fresh context. | `@claim:json-import`. |
| F-2-11 | Runtime request logging covers landing, demo, export, privacy, and terms and permits only same-origin resources. | `@claim:no-third-party-runtime`. |
| F-2-12 | Verification asserts GET, product-bound endpoint, sole `license` query key, empty body, exact demo key namespace, and no invoice reference. | `@claim:license-check-privacy`. |
| F-2-13 | The visible limitation names calculation-only scope and tests absent invoice, collection, and accounting actions. | `@claim:product-boundary`. |
| F-2-14 | Rounding-sensitive fixtures assert all three discount bases and formulas. | `@claim:discount-bases`. |
| F-2-15 | JSON and CSV downloads are both inspected while the request log stays same-origin. | `@claim:exports`. |

## Review 1 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | The first screen names the calculation job, small B2B suppliers, the sample action, and three facts. | First-screen browser test; live landing screenshots. |
| F-1-2 | `/demo` and `?demo=1` open the populated Harbor invoice in one click with banner, reset, and exit. | `@claim:demo-isolation`; live demo screenshots. |
| F-1-3 | Demo calculations use `demo:early-pay-terms`; production uses `early-pay-terms`. Demo license keys also use a `demo:` prefix. | Same-context `@claim:demo-isolation`; `.factory/demo.md`. |
| F-1-4 | Registry now has 19 claims with exactly one tag each. Demo isolation uses two pages in one storage partition and asserts both database names, bidirectional isolation, reset, exit, and license isolation. | All 19 clean-clone claim commands; tag-count audit; `@claim:demo-isolation`. |
| F-1-5 | Removed the dead checkout and every purchase control. | Unavailable-sales browser test; live link/route run. |
| F-1-6 | `/demo` is real; unknown URLs return the designed 404 with HTTP 404. | `every real route…`; live `/does-not-exist` = 404. |
| F-1-7 | Metadata states observable calculator outputs and the card fields are asserted. | Metadata route test; `@claim:payment-card`. |
| F-1-8 | Removed subjective and absolute readability wording, including “exact.” | Copy audit; live H1. |
| F-1-9 | Card and receipt copy names observable outputs and the licensed receipt boundary. | `@claim:payment-card`; `@claim:receipt-validation`. |
| F-1-10 | Privacy wording is “invoice figures,” backed by request logging. | `@claim:browser-privacy`; live privacy page. |
| F-1-11 | Card copy names the exact repeated field groups. | `@claim:payment-card`. |
| F-1-12 | Added a registered user-selected tax-rule promise tested across two locales, timezones, and denied geolocation, including reload persistence and zero location calls. | `@claim:tax-rule-user-selected`. |
| F-1-13 | Persistence is qualified by browser storage availability and proven across reload. | `@claim:draft-persistence`. |
| F-1-14 | The page makes no sale offer; valid existing licenses alone expose saved versions, templates, and receipts. | `@claim:plus-entitlements`; unavailable-sales test. |
| F-1-15 | Core calculator, payment card, and exports work without any license. | `@claim:free-core`; `@claim:exports`. |
| F-1-16 | Removed “unlimited” and other unproven entitlement language. | Copy audit; live `/`. |
| F-1-17 | Removed the unproven “No subscription” sales claim. | Copy audit; live `/`. |
| F-1-18 | Removed hosted-checkout claims and links while the endpoint is unavailable. | Unavailable-sales browser test; live checkout status 404. |
| F-1-19 | Restoration is now a tested existing-license flow, without an unproven sales promise. | `@claim:license-restoration`. |
| F-1-20 | Removed merchant, security, and refund promises from the unavailable offer. | Copy audit; legal route checks. |
| F-1-21 | Export wording is qualified and both formats work unlicensed. | `@claim:exports`; `@claim:free-core`. |
| F-1-22 | JSON content, license-token exclusion, CSV headers, and JSON round-trip are asserted. | `@claim:exports`; `@claim:json-import`. |
| F-1-23 | The limitations section appears before data/license utility sections and names the calculation boundary. | `@claim:product-boundary`; live `/`. |
| F-1-24 | Audience and job now appear in the first screen. | Live landing screenshots. |
| F-1-25 | Browser-only and offline facts are plain, visible, and tested. | `@claim:browser-privacy`; `@claim:offline-reload`; contrast test. |
| F-1-26 | Image provenance is narrowed to the generated instrument illustration and recorded with prompt/model/date. | `.factory/design.md`; footer; live screenshots. |
| F-1-27 | Receipt rejects partial, overpaid, pre-issue, and post-deadline payments, then accepts exactly EUR 1,470.00 on the deadline and asserts every receipt field. | `@claim:receipt-validation`. |
| F-1-28 | README opens with the task and audience in plain words. | README copy audit. |
| F-1-29 | Split the long capability/boundary sentence; all audited sentences are at most 22 words. | `.factory/copy-audit.md`; `@claim:product-boundary`. |
| F-1-30 | Removed minor-unit implementation jargon from visitor copy while retaining unit coverage. | Copy audit; 7/7 unit tests. |
| F-1-31 | All three discount treatments are described plainly and tested by total/formula. | `@claim:discount-bases`. |
| F-1-32 | The tagged test asserts symbol/code, decimal precision, and output amount for EUR, USD, GBP, CHF, INR, JPY, and BHD, plus supported/rejected 0.05 rounding. | `@claim:currencies`. |
| F-1-33 | Payment-card print wording matches the real browser print flow and required fields. | `@claim:print-payment-card`. |
| F-1-34 | A service-worker-controlled sample reload retains data offline. | `@claim:offline-reload` locally and in the live 50/50 run. |
| F-1-35 | JSON export/import and CSV export are observable, content-checked behaviors. | `@claim:exports`; `@claim:json-import`. |
| F-1-36 | Removed the unregistered $19 offer and price. | Unavailable-sales test; live `/`. |
| F-1-37 | Removed checkout claims; the optional verification request is narrowly documented and tested. | `@claim:license-check-privacy`. |
| F-1-38 | “Calculator” is the consistent scope term. | Copy audit; `@claim:product-boundary`. |
| F-1-39 | README documents the actual combined quality gate. | Clean-clone `npm run test:stable`: 7 unit + 50 browser tests twice. |
| F-1-40 | The documented build produces root `dist/index.html`. | Clean-clone build and deployed artifact; live/dist SHA match. |
| F-1-41 | Normal calculation and export request logs remain same-origin; token verification is separately and explicitly scoped. | `@claim:browser-privacy`; `@claim:license-check-privacy`. |
| F-1-42 | Privacy copy uses plain browser-storage language; tests inspect exact demo license keys and databases. | `@claim:demo-isolation`; `@claim:license-check-privacy`; privacy route. |
| F-1-43 | JSON/CSV exports are generated locally and inspected. | `@claim:exports`. |
| F-1-44 | The service worker precaches the shell and the controlled demo reloads offline. | `@claim:offline-reload`; `public/sw.js`. |
| F-1-45 | No analytics, pixel, remote font, or third-party script request appears across all product routes and export. | `@claim:no-third-party-runtime`. |
| F-1-46 | Replaced invented instrument lore with “Early-payment invoice calculator.” | Copy audit; live `/`. |
| F-1-47 | First-screen sentence names supplier, amount, deadline, and later balance without basis/tax jargon. | First-screen test; live screenshots. |
| F-1-48 | Replaced the slogan caption with a literal illustration description. | Copy audit; live screenshots. |
| F-1-49 | Removed “Workbench” from visitor copy. | Copy audit. |
| F-1-50 | Empty state instructs the user to enter the net amount and names the discounted payment. | Live `/`; browser suite. |
| F-1-51 | Removed “ledger” from the product. | Copy audit. |
| F-1-52 | The section, navigation, eyebrow, and empty state now use “Saved versions.” | Live `/`; metadata/navigation route test. |
| F-1-53 | Removed “Permanent utility.” | Copy audit. |
| F-1-54 | Removed the paper-trail price metaphor and unavailable tier. | Copy audit; unavailable-sales test. |
| F-1-55 | Data heading is “Import or export your data.” | Live `/`; copy audit. |
| F-1-56 | Limitation heading is “What this calculator does not do.” | `@claim:product-boundary`. |
| F-1-57 | Removed “local-first” jargon from visitor copy. | Copy audit. |
| F-1-58 | README capability copy is split into short sentences. | Copy audit. |
| F-1-59 | Removed arithmetic implementation jargon. | Copy audit. |
| F-1-60 | Each tax treatment has plain help text and an expected result test. | `@claim:discount-bases`. |
| F-1-61 | Currency wording is plain and every named output is now asserted. | `@claim:currencies`. |
| F-1-62 | Payment-card attachment wording names print or Save as PDF. | `@claim:print-payment-card`; copy audit. |
| F-1-63 | Offline wording is plain and backed by a controlled reload. | `@claim:offline-reload`. |
| F-1-64 | Storage wording is plain, qualified, and consistent. | `@claim:draft-persistence`; privacy route. |
| F-1-65 | Service-worker implementation detail stays out of visitor copy. | Copy audit. |
| F-1-66 | Actions name their results: sample, payment card, print, copy, export, import, reset, and start. | Browser action tests; live screenshots. |
| F-1-67 | Standardized snapshot terminology to “saved version(s)”; unsaved work is “current calculation.” | Copy audit terminology table; live `/`. |
| F-1-68 | Every real route has its own title, description, canonical, OG/Twitter metadata, favicon, touch icon, and one H1. | `every real route…`; live route verify directories. |
| F-1-69 | Fragment navigation and Privacy → Back restore URL, scroll, focus, and polite announcement. | `Privacy then browser Back restores…` locally and live. |
| F-1-70 | App, legal routes, and 404 share the four-link header and complete footer, including Built by Param Factory. | `every real route…`; live `/does-not-exist` = 404. |
| F-1-71 | External Sociobot links retain explicit external accessible labels. | Route/link checks; 404 route test. |
| F-1-72 | CSP, HSTS, Permissions-Policy, nosniff, and referrer headers are live; `frame-ancestors` is a response header. | Cold live `HEAD /`; no console errors in live verify. |
| F-1-73 | Manifest is routed with `application/manifest+json`. | Live `/manifest.webmanifest` = 200; deployment config. |
| F-1-74 | Hashed assets are immutable while HTML, mode, and service worker use update-safe caching. | `staticwebapp.config.json`; live header checks. |
| F-1-75 | Result is a labelled section and demo controls are a labelled aside. | Axe browser tests, 0 violations. |
| F-1-76 | Legal H1s are “Privacy policy” and “Terms of use.” | Live legal verification directories. |
| F-1-77 | Three-step “How it works” precedes limitations and utility/license sections. | Live landing screenshots. |
| F-1-78 | Status distinguishes online, ready offline, working offline, and setup failure. | `@claim:offline-reload`; source path inspection. |
| F-1-79 | Storage errors state the failure and direct the user to export/copy. | Browser source/error-path inspection; copy audit. |
| F-1-80 | Import errors name the accepted Early Pay Terms JSON export and the next action. | `@claim:json-import`; source/error-path inspection. |

## Final result

Every F-1, F-2, and F-3 identifier is closed. There are no deferred minor findings, TODOs, dead purchase controls, unregistered visitor promises, serious/critical axe violations, console errors, or known product gaps.
