# Polish 2 — cumulative finding closure

Work order: `early-pay-terms-polish-2`

Reviewed base: `698f20a5c8ddf850d03f0bf1f18e5fe87105bfb0`

Deployed app commit: `5e6d653`

Live URL: <https://early-pay-terms.sociobot.in>

Evidence shorthand:

- `clean claims`: every one of the 17 commands in `.factory/claims.json` passed from `/tmp/ept-polish2-final-JjUbHw/clone`, twice (desktop and 390px).
- `clean suite`: the same clean clone passed 7 Vitest tests and 42 Playwright tests.
- `live suite`: 41/42 passed in one final live run; Chromium itself crashed before the remaining mobile receipt test, which was rerun and passed in both projects (2/2). The separate reset/offline live run passed 4/4.
- `live verify`: `verify-url.sh` passed `/`, `/demo`, `/privacy/`, and `/terms/` with route titles, `lang=en`, one H1, one main, labelled images/buttons, and no console errors.
- Screenshots: `.factory/evidence/polish-2-demo-mobile.png` (390×844 live) and `.factory/evidence/polish-2-demo-desktop.png` (1440×900 live).

## Review 2 findings

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-2 | `/demo` and `?demo=1` now open with HARBOR-1042, both parties, EUR 1,470.00, the deadline, later balance, and **View sample payment card** in the first viewport. Reset clears only the demo stores; Start for real clears them before leaving. | `@claim:demo-isolation`; query-demo reset test; both screenshots; live `/demo` |
| F-1-69 | Fragment restoration now runs after initialization and again after browser history restoration; it scrolls the section, focuses its heading, and updates the polite announcement. | `Privacy then browser Back restores…` passed desktop/mobile locally and live |
| F-1-70 | Demo, Calculator, Saved versions, and Privacy now appear in the same header navigation on app, privacy, terms, and 404 routes. | `every real route has complete metadata and the shared main navigation`; live route crawl |
| F-2-1 | Changed the demo strip to `<aside aria-label="Demo controls">`; its buttons are 44px tall. | zero axe violations in `accessibility, title, focus, and mobile layout`; live verify |
| F-2-2 | Renamed **Copy wording** to **Copy payment terms**. | live screenshots and live `/demo` DOM |
| F-2-3 | Registered and tested the locked, no-license calculator, payment card, and JSON export path. | `@claim:free-core` |
| F-2-4 | Expanded the payment-card claim to assert net, tax, early amount, both dates, later amount, selected discount formula, and rounding. | `@claim:payment-card` |
| F-2-5 | Added a reload test for the edited demo draft plus a cross-check that production does not receive it. | `@claim:draft-persistence` |
| F-2-6 | Tested all three locked actions and all three valid-license fixture actions: saved versions, templates, and receipts. | `@claim:plus-entitlements` |
| F-2-7 | Kept one sentence, “Plus is not available to buy in this release,” and asserted that no checkout or Buy Plus action exists. | `@claim:plus-sale-state` |
| F-2-8 | Removed billing implementation copy from the landing page; the privacy claim now intercepts the real configured verification destination. | `@claim:license-check-privacy` |
| F-2-9 | Added a print-flow test that asserts the invoice, amount, deadline, and later balance before invoking `window.print`. | `@claim:print-payment-card` |
| F-2-10 | Added an export-to-fresh-context JSON round-trip and asserted restored invoice and supplier fields. | `@claim:json-import` |
| F-2-11 | Added a request crawl across landing, demo, export, privacy, and terms; every runtime request must be same-origin. | `@claim:no-third-party-runtime` |
| F-2-12 | Intercepts license restoration and asserts GET, the product endpoint, exactly one `license` query key, no body, and no invoice reference. | `@claim:license-check-privacy` |
| F-2-13 | Reworded the README limitation as an instruction and tested the visible boundary plus absence of issue/collect/accounting actions. | `@claim:product-boundary` |
| F-2-14 | Added rounding-sensitive expected totals and formula checks for whole invoice, proportional tax, and fixed-tax net-only modes. | `@claim:discount-bases` |
| F-2-15 | Export tests now record requests around both JSON and CSV and assert both are local downloads. | `@claim:exports` |

## Earlier findings, individually rechecked

| Finding | Cumulative change confirmed | Evidence |
| --- | --- | --- |
| F-1-1 | First screen names the job and small B2B suppliers, gives one action and three facts. | live `/`; copy audit |
| F-1-2 | Real first-screen isolated demo, banner, reset, and exit. | `@claim:demo-isolation`; screenshots |
| F-1-3 | Demo and production use separate IndexedDB databases. | `@claim:demo-isolation`; `src/db.ts` |
| F-1-4 | Claim registry has one tagged test for each of 17 retained claims. | clean claims; tag-count audit |
| F-1-5 | Dead checkout and price CTA remain absent. | `@claim:plus-sale-state`; live link crawl |
| F-1-6 | Demo route and designed 404 are real; unknown live URL returns 404. | route test; live `/does-not-exist` = 404 |
| F-1-7 | Metadata claim is plain and the payment output is field-tested. | `@claim:payment-card`; live verify |
| F-1-8 | Subjective “impossible to misread” copy remains removed. | copy audit |
| F-1-9 | Payment card and receipt wording names observable outputs. | `@claim:payment-card`; `@claim:receipt-validation` |
| F-1-10 | Browser privacy wording has request-log coverage. | `@claim:browser-privacy` |
| F-1-11 | Output field wording is specific and complete. | `@claim:payment-card` |
| F-1-12 | Tax choice is explicitly user-selected. | calculator copy; `@claim:discount-bases` |
| F-1-13 | Persistence is qualified by storage availability. | `@claim:draft-persistence` |
| F-1-14 | No unpurchasable offer is shown. | `@claim:plus-sale-state` |
| F-1-15 | Free-core boundary is explicit and tested. | `@claim:free-core` |
| F-1-16 | No unlimited/device entitlement promise exists. | copy audit |
| F-1-17 | No subscription claim exists. | copy audit |
| F-1-18 | No hosted-checkout claim exists. | live link crawl |
| F-1-19 | No cross-device restore promise exists. | copy audit |
| F-1-20 | No merchant/refund promise exists. | terms and copy audit |
| F-1-21 | Data export works while locked. | `@claim:exports`; `@claim:free-core` |
| F-1-22 | JSON/CSV contents are asserted. | `@claim:exports` |
| F-1-23 | Product limitations are visible before Plus. | `@claim:product-boundary` |
| F-1-24 | Audience appears in the first screen. | live screenshot |
| F-1-25 | Privacy and offline facts are plain and tested. | `@claim:browser-privacy`; `@claim:offline-reload` |
| F-1-26 | Generated image provenance is narrowed and recorded. | `.factory/design.md`; footer |
| F-1-27 | Receipt rejects wrong payments and records an exact on-time payment. | `@claim:receipt-validation` |
| F-1-28 | README opening states the task and audience plainly. | README; copy audit |
| F-1-29 | README sentence cap is met. | copy audit |
| F-1-30 | Internal arithmetic jargon remains removed. | copy audit |
| F-1-31 | All discount treatments are named in plain language. | `@claim:discount-bases` |
| F-1-32 | Seven currencies and available/unavailable cash rounding paths are tested. | `@claim:currencies` |
| F-1-33 | Payment-card and print statements have observable tests. | `@claim:payment-card`; `@claim:print-payment-card` |
| F-1-34 | Offline statement has a controlled reload test. | `@claim:offline-reload`; live 4/4 retry |
| F-1-35 | Export and JSON import are both tested. | `@claim:exports`; `@claim:json-import` |
| F-1-36 | $19 offer remains removed. | live copy crawl |
| F-1-37 | Hosted payment statement remains removed. | live link crawl |
| F-1-38 | “Calculator” terminology is consistent. | copy audit |
| F-1-39 | Documented clean test command passes. | clean suite |
| F-1-40 | Build produces `dist/index.html`. | clean suite; deployment ID `6b04f6fa-d33e-4e0b-a550-e4ae139936f0` |
| F-1-41 | Normal calculation request logging is same-origin. | `@claim:browser-privacy` |
| F-1-42 | Visitor copy avoids needless storage implementation claims. | privacy and README |
| F-1-43 | Both exports are asserted local. | `@claim:exports` |
| F-1-44 | Offline demo reload works locally and live. | `@claim:offline-reload`; live retry 2/2 |
| F-1-45 | No analytics/pixels/fonts/scripts claim has a full route request crawl. | `@claim:no-third-party-runtime` |
| F-1-46 | Instrument slogan remains removed. | copy audit |
| F-1-47 | First screen avoids unexplained basis/tax jargon. | screenshot; copy audit |
| F-1-48 | Decorative slogan captions remain removed. | copy audit |
| F-1-49 | “Workbench” metaphor remains removed from copy. | copy audit |
| F-1-50 | Empty state says to enter the net amount. | live `/` |
| F-1-51 | “Ledger” label remains removed. | copy audit |
| F-1-52 | Saved section is named “Saved calculation versions.” | live `/`; shared nav test |
| F-1-53 | “Permanent utility” label remains removed. | copy audit |
| F-1-54 | Price/mood heading remains removed. | copy audit |
| F-1-55 | Ledger metaphor remains removed. | copy audit |
| F-1-56 | Limitation heading names the calculator boundary. | `@claim:product-boundary` |
| F-1-57 | “Local-first” jargon remains removed from visitor copy. | copy audit |
| F-1-58 | README description stays within the sentence cap. | copy audit |
| F-1-59 | Precision jargon remains removed from visitor copy. | copy audit |
| F-1-60 | Tax treatments have descriptions and expected totals. | `@claim:discount-bases` |
| F-1-61 | Currency promise remains tested. | `@claim:currencies` |
| F-1-62 | Attachment wording is direct. | copy audit |
| F-1-63 | Offline promise is tested locally and live. | `@claim:offline-reload` |
| F-1-64 | Storage wording is plain and qualified. | `@claim:draft-persistence` |
| F-1-65 | Service-worker implementation detail stays out of visitor copy. | copy audit |
| F-1-66 | Result actions name their outputs, including Copy payment terms. | live screenshot |
| F-1-67 | “Invoice figures” is consistent privacy terminology. | copy audit |
| F-1-68 | Every real route has its title, description, canonical, OG/Twitter image, favicon, and touch icon. | metadata route test; live verify |
| F-1-69 | Back restores calculator scroll, focus, and announcement. | history test desktop/mobile locally and live |
| F-1-70 | Shared four-link header is present on all real routes and 404. | route test; live crawl |
| F-1-71 | External Sociobot destination retains its accessible label. | link crawl |
| F-1-72 | CSP, Permissions-Policy, nosniff, referrer policy, and HSTS are live headers. | final live `HEAD /` |
| F-1-73 | Manifest is served as `application/manifest+json`. | final live header check |
| F-1-74 | Static asset caching remains configured immutable; SW and mode stay no-cache. | `staticwebapp.config.json`; live headers |
| F-1-75 | Result remains a labelled section; demo aside now also fixes the last region violation. | zero-violation axe test |
| F-1-76 | Legal H1s name Privacy policy and Terms of use. | live verify |
| F-1-77 | Three-step How it works remains before limitations and Plus. | live `/` |
| F-1-78 | Network status distinguishes online, ready offline, working offline, and setup failure. | `@claim:offline-reload` |
| F-1-79 | Storage error says what happened and what to do. | source/error-path inspection |
| F-1-80 | Import error identifies the accepted exported JSON file. | `@claim:json-import`; source/error-path inspection |

No finding is deferred. During the first live pass, the production host’s non-served configuration file exposed a service-worker install failure; cache v2 now excludes that file. Live demo reset was also made transactional to avoid an IndexedDB deletion/autosave race. Both fixes were redeployed and rechecked.
