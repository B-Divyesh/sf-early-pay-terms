# Adversarial first-read review 4 — Early Pay Terms

Reviewed: 29 August 2026 UTC

Work order: `early-pay-terms-review-4`

Repository/base commit: `fa6bcf72541edd237ef3827eed05dd0a4464d5fa`

Live URL: <https://early-pay-terms.sociobot.in>

## Verdict: PASS

No findings remain. The cold first screen is clear at both required sizes, the one-click demo immediately shows a realistic calculation, demo and production storage remain isolated, all 19 registered claim commands pass from a clean clone, all live browser checks pass, and no unlisted claim or unresolved earlier finding was found.

## Method and evidence

- Opened the live root before reading product documentation in fresh Chromium contexts at 390×844 and 1440×900, without scrolling.
- Captured the cold viewports at `/tmp/early-pay-mobile.png` and `/tmp/early-pay-desktop.png`, then independently entered the demo through the hero action.
- Captured the demo first screens at `/tmp/early-pay-demo-mobile.png` and `/tmp/early-pay-demo-desktop.png`.
- Cloned the repository into `/tmp/ept-review4.MTASrs/repo`, checked out the supplied base commit, and installed with `npm ci --include=dev`.
- Ran every command in `.factory/claims.json` separately. All 19 commands passed in both browser projects.
- Ran unfiltered `CI=1 npm test`; TypeScript, 7/7 unit tests, the production build, and 50/50 local browser tests passed.
- Ran `PLAYWRIGHT_BASE_URL=https://early-pay-terms.sociobot.in CI=1 npx playwright test`; all 50 live tests passed.
- Ran the factory URL verifier against `/`, `/demo`, `/privacy/`, and `/terms/`; every route passed with one H1, `lang=en`, a main landmark, complete image alternatives, labelled buttons, and no browser errors.
- Crawled every live link from the root, demo, legal pages, and 404. All internal pages and the external Sociobot destination resolved; `mailto:` links were treated as explicit protocols.
- Read the brief, design thesis, claims registry, demo notes, source, tests, README, every prior review, every polish report, verification report, and the previous handoff.
- Compared the clean build and live root. Both have SHA-256 `112efe49ed9ef42dd6ec27289ccc3ee53e9a1c65b20bbcfedad1cfa02f102573`.

## 30-second cold read

### 390px, before scrolling

The first screen says:

> Calculate early-payment invoice terms
>
> For small B2B suppliers, calculate the discounted amount, deadline, and balance after the deadline.
>
> Try it with sample data
>
> See a saved supplier invoice and payment card.
>
> Invoice figures stay in this browser.
>
> Works offline after the first visit.
>
> Use the calculator and export data without a license.

- What it does: calculates the discounted payment, its deadline, and the balance due later, then provides a payment card.
- For whom: small B2B suppliers.
- What to click first: **Try it with sample data**; the adjacent sentence states the result.

All three answers are available without scrolling. The full first-screen copy, including all three facts, is readable at 390px.

### Desktop, before scrolling

The same job, audience, action, outcome, and three facts appear beside the product-specific payment-instrument illustration. All three questions are equally clear.

## Copy audit

Counts below use `Intl.Segmenter` word boundaries; Markdown code spans and URLs count as one unit. Metadata and image text are included so reliance copy cannot evade the audit. No line exceeds 22 words, contains a banned marketing term, uses a metaphor or mood slogan, or needs a rewrite.

### Landing-page sentences

| # | Words | Exact sentence | Result |
| ---: | ---: | --- | --- |
| 1 | 13 | Calculate early-payment amounts, deadlines, and later balances for small B2B supplier invoices. | Pass — meta description; `payment-card` |
| 2 | 8 | Calculate early-payment amounts, deadlines, and later balances. | Pass — social description; `payment-card` |
| 3 | 5 | Calculate early-payment invoice terms. | Pass |
| 4 | 14 | For small B2B suppliers, calculate the discounted amount, deadline, and balance after the deadline. | Pass — `payment-card` |
| 5 | 8 | See a saved supplier invoice and payment card. | Pass — demo outcome |
| 6 | 6 | Invoice figures stay in this browser. | Pass — `browser-privacy` |
| 7 | 6 | Works offline after the first visit. | Pass — `offline-reload` |
| 8 | 9 | Use the calculator and export data without a license. | Pass — `free-core`, `exports` |
| 9 | 8 | Illustration of a payment calculator beside invoice slips. | Pass — caption and image alternative |
| 10 | 13 | The payment card repeats the entered amounts, dates, discount rule, and rounding choice. | Pass — `payment-card` |
| 11 | 13 | You choose the tax rule; the calculator does not choose one by location. | Pass — `tax-rule-user-selected` |
| 12 | 7 | Enter the figures printed on your invoice. | Pass |
| 13 | 5 | Do not include thousands separators. | Pass |
| 14 | 6 | Apply the rate to net + tax. | Pass — `discount-bases` |
| 15 | 9 | Reduce the net amount and tax by the rate. | Pass — `discount-bases` |
| 16 | 8 | Discount net and leave the entered tax unchanged. | Pass — `discount-bases` |
| 17 | 9 | For example: Include the invoice reference with your transfer. | Pass |
| 18 | 9 | Enter the net amount to calculate the discounted payment. | Pass |
| 19 | 18 | Print this page or choose “Save as PDF” in your print dialog, then attach it to the invoice. | Pass — `print-payment-card` |
| 20 | 8 | Add the net amount, tax, reference, and dates. | Pass |
| 21 | 8 | Select where the discount applies and its rounding. | Pass |
| 22 | 9 | Print or save the calculated card as a PDF. | Pass — `print-payment-card` |
| 23 | 9 | Tax and discount rules vary by contract and region. | Pass |
| 24 | 5 | This calculator applies your choices. | Pass — `product-boundary` |
| 25 | 11 | It does not decide what is legal or create accounting entries. | Pass — `product-boundary` |
| 26 | 7 | Check the payment card before sending it. | Pass |
| 27 | 11 | Your browser keeps the current calculation when site storage is available. | Pass — `draft-persistence` |
| 28 | 4 | No saved versions yet. | Pass |
| 29 | 8 | Save a version to preserve the payment card. | Pass |
| 30 | 6 | Export does not require a license. | Pass — `exports` |
| 31 | 5 | JSON keeps the saved fields. | Pass — `exports`, `json-import` |
| 32 | 4 | CSV lists saved amounts. | Pass — `exports` |
| 33 | 15 | Enter a Plus license token to restore saved versions, templates, and paid-on-time receipts. | Pass — `license-restoration`, `plus-entitlements` |
| 34 | 7 | Early-payment terms for small B2B suppliers. | Pass |
| 35 | 6 | Invoice figures stay in your browser. | Pass — `browser-privacy` |
| 36 | 6 | Instrument illustration generated for this product. | Pass — provenance is recorded in `.factory/design.md` |
| 37 | 6 | Demo — sample data, nothing is saved. | Pass — `demo-isolation` |
| 38 | 8 | The populated calculator and saved version are below. | Pass — visible on demo entry |
| 39 | 12 | This receipt is for the full discounted payment received by the deadline. | Pass — `receipt-validation` |
| 40 | 7 | Review partial, overpaid, or late payments manually. | Pass — `receipt-validation` |
| 41 | 9 | This receipt records the figures entered by the supplier. | Pass |
| 42 | 10 | It is not proof of bank settlement or tax advice. | Pass |

### README sentences

| # | Words | Exact sentence | Result |
| ---: | ---: | --- | --- |
| 1 | 9 | Calculate early-payment invoice terms for small B2B suppliers. | Pass |
| 2 | 12 | The calculator shows the discounted amount, deadline, later balance, and payment card. | Pass — `payment-card` |
| 3 | 15 | Use it to calculate terms, not to issue invoices, collect money, or make accounting entries. | Pass — `product-boundary` |
| 4 | 8 | Try the isolated sample at `https://early-pay-terms.sociobot.in/?demo=1` or `/demo`. | Pass — `demo-isolation` |
| 5 | 12 | Calculates payment terms in EUR, USD, GBP, CHF, INR, JPY, and BHD. | Pass — `currencies` |
| 6 | 15 | Lets you apply a discount to the full invoice, net plus tax, or net only. | Pass — `discount-bases` |
| 7 | 16 | Creates a payment card that opens the browser print flow for printing or saving as PDF. | Pass — `print-payment-card` |
| 8 | 11 | Saves the current calculation in this browser when storage is available. | Pass — `draft-persistence` |
| 9 | 10 | Exports and imports JSON, and exports saved versions as CSV. | Pass — `exports`, `json-import` |
| 10 | 9 | Keeps the app available offline after the first visit. | Pass — `offline-reload` |
| 11 | 15 | A verified existing Plus license enables saved versions, reusable templates, and paid-on-time receipts. | Pass — `plus-entitlements` |
| 12 | 9 | You choose and check the tax and contract rule. | Pass — `tax-rule-user-selected` |
| 13 | 9 | This calculator is not legal, tax, or accounting advice. | Pass |
| 14 | 16 | `/demo` (or `?demo=1`) loads Harbor Paper Co.’s sample invoice in a separate `demo:early-pay-terms` browser database. | Pass — `demo-isolation` |
| 15 | 7 | Reset demo clears only that sample data. | Pass — `demo-isolation` |
| 16 | 10 | Start for real removes it before opening the real calculator. | Pass — `demo-isolation` |
| 17 | 9 | Normal calculator use keeps invoice figures in the browser. | Pass — `browser-privacy` |
| 18 | 7 | JSON and CSV exports are made locally. | Pass — `exports` |
| 19 | 14 | The site includes no analytics, advertising pixels, remote fonts, or third-party runtime scripts. | Pass — `no-third-party-runtime` |
| 20 | 12 | License restoration sends only the entered token to Sociobot’s product verification endpoint. | Pass — `license-check-privacy` |
| 21 | 10 | The restore form accepts valid licenses and rejects invalid ones. | Pass — `license-restoration` |
| 22 | 11 | It reports connection errors and retains a valid result after reload. | Pass — `license-restoration` |
| 23 | 6 | See the privacy policy and terms. | Pass |
| 24 | 6 | Node.js 20+ and npm are required. | Pass |
| 25 | 18 | `npm test` type-checks, runs calculator tests, builds `dist/`, and runs Playwright in desktop and 390px mobile Chromium. | Pass — verified from clean clone |
| 26 | 13 | Each visitor-facing claim has one tagged Playwright test listed in `.factory/claims.json`. | Pass — tag count is exactly one for all 19 IDs |
| 27 | 10 | `npm run build` produces static deployment output at `dist/index.html`. | Pass — clean build produced it |
| 28 | 3 | MIT — see LICENSE. | Pass |

### Headings, labels, actions, and terms

The headings name their sections without context: **Early-payment invoice calculator**, **Enter the agreed invoice terms**, **Payment terms card**, **Create payment terms in three steps**, **What this calculator does not do**, **Saved versions**, **Import or export your data**, and **Restore an existing Plus license**.

README headings also name their contents directly: **What it does**, **Demo and privacy**, **Run locally**, **Test and build**, **References**, and **License**.

Actions name their result: **Try it with sample data**, **View sample payment card**, **Show payment card**, **Print payment card**, **Copy payment terms**, **Save this version**, **Save terms as template**, **Create paid receipt**, **Export JSON**, **Export CSV**, **Import JSON**, **Clear local data**, **Verify license**, **Reset demo**, **Start for real**, **Create receipt**, and **Print receipt**. Contextual saved-version controls expose **Restore** and **Delete version 1** inside the named saved-version card.

Terminology is consistent:

| Concept | Term used |
| --- | --- |
| Entered data | invoice figures |
| Unsaved work | current calculation |
| Stored snapshot | saved version |
| Customer-facing output | payment card |
| Sample area | demo |
| Calculation choice | discount rule |
| Existing paid feature set | Plus |

## Demo and sandbox

Clicking **Try it with sample data** opens `/demo` in one click. At 390px and desktop, the first screen already shows:

- `HARBOR-1042`;
- Harbor Paper Co. → Moss & Field Studio;
- €1,470.00 due 11 August 2026;
- €1,500.00 after the deadline; and
- **View sample payment card**.

The persistent banner says **Demo — sample data, nothing is saved** and provides **Reset demo** and **Start for real**. The registered same-context isolation test verifies both database names, collisions in both directions, reset scope, exit scope, and separate demo license keys. Reset restores the sample, leaving production data unchanged. Start for real clears the demo namespace and preserves production data.

The browser request log remained same-origin through landing, demo interaction, export, privacy, and terms. The controlled demo reloaded with the context offline. No runtime provider key, analytics request, advertising pixel, remote font, or third-party script was found.

## Claims

Every claim entry has exactly one `@claim:<id>` tag. Every listed command was run separately from the clean clone.

| Claim ID | Result | Observable evidence |
| --- | --- | --- |
| `demo-isolation` | Pass | Populated first screen; same-partition production/demo collision, reset, exit, and license isolation |
| `payment-card` | Pass | Amounts, dates, rule, rounding, formula, and payment-card fields |
| `browser-privacy` | Pass | Same-origin request log through calculation and export |
| `exports` | Pass | JSON/CSV downloads, contents, token exclusion, and no export request |
| `offline-reload` | Pass | Service-worker-controlled demo reload while offline |
| `currencies` | Pass | Symbol/code, precision, and amount for seven currencies; cash-rounding boundaries |
| `receipt-validation` | Pass | Partial, overpaid, pre-issue, and late rejection; exact deadline payment accepted |
| `free-core` | Pass | Calculator, card, and export work without a license |
| `draft-persistence` | Pass | Edited demo draft survives reload without entering production storage |
| `plus-entitlements` | Pass | Three tools hidden while locked and functional with a valid fixture |
| `license-check-privacy` | Pass | Product endpoint, method, sole token query, empty body, and no invoice fields |
| `license-restoration` | Pass | Valid, invalid, unavailable, and cached-reload cases |
| `print-payment-card` | Pass | Complete card and browser print invocation |
| `json-import` | Pass | Export/import restores current calculation and saved fields |
| `data-deletion` | Pass | Calculation, versions, and templates removed while license remains |
| `no-third-party-runtime` | Pass | Same-origin resources across all routes and export |
| `product-boundary` | Pass | Visible limitation and no issue/collect/accounting actions |
| `discount-bases` | Pass | Expected formulas and totals for all three choices |
| `tax-rule-user-selected` | Pass | Same rule across locales/timezones, denied geolocation, and reload |

No live or README reliance statement lacks a corresponding claim entry. No listed claim is untested.

## Structure, routing, accessibility, and visual identity

- Titles are route-specific and follow the required pattern: `Early Pay Terms — invoice discount calculator`, `Demo — Early Pay Terms`, `Privacy — Early Pay Terms`, `Terms — Early Pay Terms`, and `404 — Early Pay Terms`.
- Every real route has one H1, `lang=en`, one main landmark, a plain description, canonical URL, OG/Twitter metadata, SVG favicon, 180px touch icon, and the 1200×630 product share image.
- `/does-not-exist` returns HTTP 404 with the designed product-styled page and routes back to the calculator or demo.
- Deep links, calculator fragments, browser Back, restored scroll, focused route heading, and polite announcement pass at desktop and 390px.
- The shared header has the wordmark, Demo, Calculator, Saved versions, and Privacy. Every route, including 404, has the product line, Privacy, Terms, Built by Param Factory, and build ID in its footer.
- All crawled links resolve. The Sociobot link is labelled as external.
- CSP is delivered as a response header with `frame-ancestors`; HSTS, Permissions-Policy, `nosniff`, and Referrer-Policy are live. The manifest MIME is `application/manifest+json`; hashed assets are immutable.
- Axe reports zero violations on root, demo, Privacy, Terms, and 404 in both viewports. Contrast, 44px controls, keyboard access, reduced motion, and horizontal fit are covered by the passing suite.
- Main JavaScript is 24.03 KB raw and 8.25 KB gzip. `dist/index.html` exists.
- The dark enamel, warm paper, brass/coral controls, monospaced figures, ruled payment card, and original instrument scene make the product recognisable and match `.factory/design.md`. It is not a generic SaaS template.

## Earlier finding recheck

`Confirmed` means the current live behavior and present code/test were checked, not merely the prior closure note. The same original ID would have been reopened if either side failed.

### Review 1

| ID | Independent confirmation | Result |
| --- | --- | --- |
| F-1-1 | First screen names job, audience, action, and three facts. | Confirmed |
| F-1-2 | One-click demo shows the product in use in the first viewport. | Confirmed |
| F-1-3 | Demo database and license namespaces are separate; real data survives reset/exit. | Confirmed |
| F-1-4 | Registry has 19 entries, one tag each; all commands pass. | Confirmed |
| F-1-5 | No dead purchase or checkout control is exposed. | Confirmed |
| F-1-6 | `/demo` is real and unknown paths return the designed 404. | Confirmed |
| F-1-7 | Metadata names observable calculator outputs. | Confirmed |
| F-1-8 | Subjective “impossible” and unbounded “exact” copy are absent. | Confirmed |
| F-1-9 | Card and receipt copy names tested outputs. | Confirmed |
| F-1-10 | Browser-only invoice-figure wording has request-log coverage. | Confirmed |
| F-1-11 | Card field groups are named and asserted. | Confirmed |
| F-1-12 | User-selected tax rule is registered and tested across location settings. | Confirmed |
| F-1-13 | Persistence is storage-qualified and reload-tested. | Confirmed |
| F-1-14 | No sale offer appears; existing-license entitlements are tested. | Confirmed |
| F-1-15 | Unlicensed calculator, card, and export work. | Confirmed |
| F-1-16 | “Unlimited” entitlement language is absent. | Confirmed |
| F-1-17 | “No subscription” sales claim is absent. | Confirmed |
| F-1-18 | Hosted-checkout copy and links are absent. | Confirmed |
| F-1-19 | Existing-license restoration is narrowly stated and tested. | Confirmed |
| F-1-20 | Merchant, security, and refund promises are absent. | Confirmed |
| F-1-21 | Both exports work without a license. | Confirmed |
| F-1-22 | JSON/CSV content and JSON round-trip are asserted. | Confirmed |
| F-1-23 | Calculation-only boundary is visible and tested. | Confirmed |
| F-1-24 | Small B2B suppliers appear on the first screen. | Confirmed |
| F-1-25 | Browser privacy and offline facts are visible, contrasted, and tested. | Confirmed |
| F-1-26 | Illustration provenance is narrowed and documented. | Confirmed |
| F-1-27 | Receipt rejects every stated invalid boundary and accepts the exact deadline case. | Confirmed |
| F-1-28 | README opens with task and audience. | Confirmed |
| F-1-29 | README has no sentence over 22 words. | Confirmed |
| F-1-30 | Minor-unit implementation jargon is absent. | Confirmed |
| F-1-31 | Three discount treatments are plainly described and tested. | Confirmed |
| F-1-32 | Seven currency outputs and cash-rounding cases are asserted. | Confirmed |
| F-1-33 | Payment-card print wording matches the tested browser print flow. | Confirmed |
| F-1-34 | Controlled demo reload works offline. | Confirmed |
| F-1-35 | JSON import and JSON/CSV export pass. | Confirmed |
| F-1-36 | Unsupported $19 offer is absent. | Confirmed |
| F-1-37 | Checkout claims are absent; token verification is narrowly tested. | Confirmed |
| F-1-38 | “Calculator” is the consistent scope term. | Confirmed |
| F-1-39 | Documented combined test command passes from the clean clone. | Confirmed |
| F-1-40 | The build produces `dist/index.html`. | Confirmed |
| F-1-41 | Normal calculation/export requests stay same-origin. | Confirmed |
| F-1-42 | Storage wording is plain; exact namespaces are tested. | Confirmed |
| F-1-43 | JSON/CSV are local, inspected downloads. | Confirmed |
| F-1-44 | Service-worker-controlled sample reopens offline. | Confirmed |
| F-1-45 | Route/export crawl contains no tracker, remote font, or third-party script. | Confirmed |
| F-1-46 | Invented instrument label is replaced with the task name. | Confirmed |
| F-1-47 | Hero sentence avoids unexplained tax/basis jargon. | Confirmed |
| F-1-48 | Decorative slogan caption is replaced by a literal description. | Confirmed |
| F-1-49 | “Workbench” metaphor is absent. | Confirmed |
| F-1-50 | Empty state gives the next input and result. | Confirmed |
| F-1-51 | “Ledger” is absent. | Confirmed |
| F-1-52 | Section and nav use “Saved versions.” | Confirmed |
| F-1-53 | “Permanent utility” is absent. | Confirmed |
| F-1-54 | Paper-trail price metaphor is absent. | Confirmed |
| F-1-55 | Data heading names import/export. | Confirmed |
| F-1-56 | Limitation heading names the section. | Confirmed |
| F-1-57 | “Local-first” jargon is absent from visitor copy. | Confirmed |
| F-1-58 | Former long README sentence remains split. | Confirmed |
| F-1-59 | Arithmetic implementation jargon is absent. | Confirmed |
| F-1-60 | Tax treatments have plain help and expected-result tests. | Confirmed |
| F-1-61 | Currency wording is plain and tested. | Confirmed |
| F-1-62 | Attachment wording names print or Save as PDF. | Confirmed |
| F-1-63 | Offline wording is plain and tested. | Confirmed |
| F-1-64 | Browser-storage wording is plain and qualified. | Confirmed |
| F-1-65 | Service-worker jargon is absent from visitor copy. | Confirmed |
| F-1-66 | Product actions name their results. | Confirmed |
| F-1-67 | “Invoice figures,” “current calculation,” “saved version,” and “payment card” are consistent. | Confirmed |
| F-1-68 | Real routes have complete canonical/social/icon metadata. | Confirmed |
| F-1-69 | Fragment and Back navigation restore scroll, focus, and announcement. | Confirmed |
| F-1-70 | App, legal pages, and 404 share complete header/footer content. | Confirmed |
| F-1-71 | External Sociobot destination is labelled. | Confirmed |
| F-1-72 | CSP and related browser policy headers are live. | Confirmed |
| F-1-73 | Manifest MIME is correct. | Confirmed |
| F-1-74 | Static assets use immutable caching; update files remain revalidatable. | Confirmed |
| F-1-75 | Result is a labelled section and demo controls are a labelled aside; axe is clear. | Confirmed |
| F-1-76 | Legal H1s are “Privacy policy” and “Terms of use.” | Confirmed |
| F-1-77 | Three-step explanation precedes limitations and utility/license areas. | Confirmed |
| F-1-78 | Network status distinguishes online, ready, offline, and setup failure. | Confirmed |
| F-1-79 | Storage error states cause and next action. | Confirmed |
| F-1-80 | Import error names the accepted file and next action. | Confirmed |

### Review 2

| ID | Independent confirmation | Result |
| --- | --- | --- |
| F-2-1 | Demo controls are in a labelled landmark with 44px targets. | Confirmed |
| F-2-2 | Action is “Copy payment terms.” | Confirmed |
| F-2-3 | No-license calculator/export statement is registered and tested. | Confirmed |
| F-2-4 | Payment-card completeness statement and assertions match. | Confirmed |
| F-2-5 | Current-calculation persistence is registered and isolated. | Confirmed |
| F-2-6 | All three Plus entitlements are tested locked and licensed. | Confirmed |
| F-2-7 | Unavailable sales promotion is removed. | Confirmed |
| F-2-8 | Landing has no billing implementation claim; token destination is tested. | Confirmed |
| F-2-9 | Print/PDF capability has an observable print test. | Confirmed |
| F-2-10 | JSON import round-trip is tested. | Confirmed |
| F-2-11 | No-third-party runtime promise has a route/export request crawl. | Confirmed |
| F-2-12 | Token-only verification request is fully asserted. | Confirmed |
| F-2-13 | Product-boundary instruction is registered and tested. | Confirmed |
| F-2-14 | All three discount bases have expected formula/total assertions. | Confirmed |
| F-2-15 | Both export formats have no-network assertions. | Confirmed |

### Review 3

| ID | Independent confirmation | Result |
| --- | --- | --- |
| F-3-1 | First-screen helper/facts meet contrast; deterministic contrast assertions pass. | Confirmed |
| F-3-2 | Unbounded “exact” claim is absent. | Confirmed |
| F-3-3 | License restoration has valid, invalid, unavailable, and reload fixtures. | Confirmed |
| F-3-4 | Reset waits for a new document and ready state; repeated live suite passes. | Confirmed |
| F-3-5 | Skip link says “Skip to content” and focuses the H1. | Confirmed |
| F-3-6 | Unavailable Plus tier, price, purchase links, and locked controls are absent. | Confirmed |

The three earlier verification observations—manifest MIME, asset caching, and missing response policies—are also fixed live. The prior handoff's only conditional future item is billing: the checkout endpoint remains unavailable, and the product honestly exposes no sale, price, or checkout link.

## Missed leverage

No obvious implied feature is missing. Import/export already covers local portability. Cloud sync would contradict the current browser-only privacy contract unless introduced as a separate, explicit mode. The core job is deterministic financial arithmetic; an AI-assisted calculation would reduce auditability rather than add value. No decorative AI runtime, provider key, Azure endpoint, or unexplained model call exists.

## What would make this perfect

Nothing remains to change for the current brief and deployed scope. Preserve the existing claim, demo-isolation, route, accessibility, and live-browser gates. If billing becomes available later, treat the exact price and Sociobot checkout as new tested claims before exposing any sales control.
