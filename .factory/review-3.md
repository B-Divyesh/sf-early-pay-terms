# Adversarial first-read review 3 — Early Pay Terms

Reviewed: 29 August 2026 UTC

Work order: `early-pay-terms-review-3`

Repository/base commit: `fbc7e0363e5bc5dfa7b5997c6dafb72ee5ecda27`

Live URL: <https://early-pay-terms.sociobot.in>

## Verdict: FAIL

There are 12 findings. Seven are blocking: required first-screen copy is rendered at 1.69:1 contrast; four earlier test/claim findings are only partly fixed; saved-version terminology has regressed; and the required footer skeleton is still incomplete on the 404 route. All 17 registered claim commands and the full local suite pass, but several tagged tests do not assert the whole claim they name. A passing command is not proof when its setup cannot expose the named failure.

## Method and evidence

- Opened the live root cold in new Chromium contexts at 390×844 and 1440×900 before scrolling. Screenshots were recorded at `/tmp/ept3-mobile.png` and `/tmp/ept3-desktop.png`.
- Opened `/demo` cold at both sizes. The sample invoice, parties, early amount, later amount, demo controls, and payment-card action were inside the first viewport.
- Verified production/demo collision manually in one browser storage partition: production retained `REAL-SAME-CONTEXT`, demo opened as `HARBOR-1042`, demo retained `DEMO-SAME-CONTEXT`, and IndexedDB contained the separate databases `early-pay-terms` and `demo:early-pay-terms`.
- Verified Reset demo ten times at 390px. All ten restored `HARBOR-1042`. The repository's live reset test failed once because it waits for a URL that already matches, then passed six repeated runs; see F-3-4.
- Recorded live requests for root, demo, calculation/export, privacy, and terms. They stayed on `https://early-pay-terms.sociobot.in`. The live offline, browser-privacy, and demo-isolation tests passed in both projects (6/6).
- Crawled all links from `/`, `/demo`, `/privacy/`, `/terms/`, and the designed 404. Real internal routes and `https://sociobot.in/` returned 200; the unknown route correctly returned 404; `mailto:` links were explicit.
- Ran every command in `.factory/claims.json` individually from fresh clone `/tmp/ept-review3-NxMEON/clone`. All 17 passed. Then ran `CI=1 npm test`: 7/7 Vitest and 42/42 Playwright tests passed; `dist/` was produced.
- Ran axe 4.10.2 at both viewports on all four live routes. It reported no violations, but marked hero contrast as a serious `incomplete` result because `.hero::after` prevents background detection. Manual color calculation exposes F-3-1.
- Read `.factory/brief.json`, `.factory/design.md`, `.factory/claims.json`, `.factory/demo.md`, all earlier reviews, both polish reports, the handoff, source, tests, README, legal pages, manifest, service worker, and deployment configuration.

## 30-second cold read

### 390px, before scrolling

The readable primary copy is:

> Calculate exact early-payment invoice terms
>
> For small B2B suppliers, calculate the discounted amount, deadline, and balance after the deadline.
>
> Try it with sample data

- What it does: calculates the discounted invoice amount, deadline, and post-deadline balance, then provides a payment card.
- For whom: small B2B suppliers.
- What to click first: **Try it with sample data**.

All three questions are answerable, so the wording itself passes the cold-read gate. However, the adjacent outcome sentence and all three required facts are barely visible because of F-3-1.

### Desktop, before scrolling

The same headline, audience sentence, and primary action are visible beside the original instrument illustration. The three questions remain answerable. The same low-contrast helper and facts fail visually.

## Blocking findings

### F-3-1 — Required first-screen facts fail contrast at 1.69:1

- Exact location/quote: root hero, `#hero-action-note`, “See a saved supplier invoice and payment card.”; `.plain-facts`, “Invoice figures stay in this browser.”, “Works offline after the first visit.”, and “The calculator and data export work without Plus.” The demo also renders “The populated calculator and saved version are below.” with the same colors.
- Evidence: computed foreground is `#4d5b57` on hero background `#153c3b`, a 1.69:1 ratio. Required normal-text contrast is 4.5:1. Both screenshots show the text washed out. Axe places these nodes in serious `incomplete`, not `violations`, because `.hero::after` obscures its background calculation; the current test checks only `axe.violations`.
- Why this blocks: the mandatory action outcome and privacy/offline/price facts are not reliably readable on the first phone screen. The accessibility baseline and first-screen shape are therefore not met.
- Concrete fix: give `.hero-actions > span` and `.plain-facts` a light enamel-safe color such as the already used `#d8e6df`, verify at least 4.5:1, and add a deterministic computed-color contrast assertion or fail the build on relevant axe `incomplete` results.

### F-1-4 — The demo-isolation claim test cannot detect a storage collision

This earlier claim-contract finding is only partly fixed.

- Exact location: `.factory/claims.json` claim `demo-isolation`; `tests/e2e/app.spec.ts`, “opens a populated sample and cannot read production storage.”
- Evidence: the test writes `REAL-ONLY` in one `BrowserContext`, then opens demo in another `BrowserContext`. Playwright contexts have separate IndexedDB storage, so the test would not expose a shared database name in the app. The original collision from review 1 occurred within one browser storage partition. Manual same-context verification currently passes, but the registered test does not prove the claim.
- Why this blocks: the central privacy boundary can regress while its required claim command stays green.
- Concrete fix: use one fresh context with two pages, or navigate one page `/` → `/demo` → `/`; assert both database names, collision in both directions, Reset affecting only demo, and Start for real leaving production untouched.

### F-1-12 — The location-independence statement remains unregistered and untested

- Exact quote/location: calculator introduction, “You choose the tax rule; the calculator does not choose one by location.”
- Evidence: no `.factory/claims.json` entry states this behavior. `@claim:discount-bases` tests three selected formulas but does not vary locale, language, timezone, or geolocation and does not assert that the selection remains unchanged.
- Why this blocks: this was the required repair for F-1-12, but only the rewrite was made. A supplier may rely on the calculator not silently selecting a regional rule.
- Concrete fix: add a `tax-rule-user-selected` claim and test at least two locale/timezone contexts with geolocation denied, asserting the same default and no location request; or remove the second clause.

### F-1-27 — Receipt validation still does not test the deadline or every stated invalid payment

- Exact quotes: “This receipt is for the full discounted payment received by the deadline.” and “Review partial, overpaid, or late payments manually.”
- Evidence: `@claim:receipt-validation` rejects only amount `1.00`, then accepts `1470.00` on the prefilled deadline. It never attempts an overpayment, a payment before issue, or a payment after the deadline. The registered claim explicitly says “by the deadline.”
- Why this blocks: the test can pass if date validation breaks, despite the receipt representing an on-time payment.
- Concrete fix: in the tagged test reject a partial amount, an overpayment, a pre-issue date, and a post-deadline date, then accept exactly `1470.00` on or before the deadline and assert the receipt fields.

### F-1-32 — The seven-currency claim test does not verify five advertised outputs

- Exact quote/location: README, “Calculates payment terms in EUR, USD, GBP, CHF, INR, JPY, and BHD.”
- Evidence: `@claim:currencies` selects each currency and asserts only that `#early-amount` is visible. A stale EUR value would pass for USD, GBP, INR, JPY, and BHD. It checks CHF cash rounding and rejected JPY cash rounding, while unit tests cover BHD formatting and two precision helpers, not each advertised currency's observable output.
- Why this blocks: this is the still-incomplete repair required by F-1-32. The seven named currency results are not proven.
- Concrete fix: parameterize expected symbol/code, decimal precision, and amount for all seven currencies in the tagged test; retain supported and rejected cash-rounding cases.

### F-1-67 — Saved snapshots again use inconsistent names

- Exact locations: section label “Saved calculations,” H2 “Saved calculation versions,” navigation “Saved versions,” and empty-state instruction “Save a calculation to preserve the payment card.”
- Why this blocks: the earlier terminology finding required one term, `saved version`, for a snapshot. The current page presents three names for the same stored object.
- Concrete fix: use **Saved versions** consistently for the nav, label, heading, and empty state; reserve **current calculation** for the unsaved form.

### F-1-70 — The 404 footer still omits a required shared item

- Exact location: live `/does-not-exist` and `public/404.html`. The footer contains the one-line description, Privacy, Terms, and build ID, but no **Built by Param Factory** link. All other real routes include it.
- Why this blocks: F-1-70 required the complete shared footer on every route. The 404 route remains inconsistent, so the earlier finding is only partly fixed.
- Concrete fix: use the same footer contents on the 404 route, including `Built by Param Factory` with an external-destination accessible label.

## Other findings

### F-3-2 — “Exact” is an unlisted accuracy claim

- Exact quote/location: root H1, “Calculate exact early-payment invoice terms.”
- Why this matters: no registry entry claims accuracy or defines “exact.” `payment-card` proves one browser fixture, while the untagged unit suite covers several arithmetic cases. The claim registry does not state the absolute promise visitors see.
- Concrete fix: prefer **Calculate early-payment invoice terms**. If “exact” is retained, add a narrowly defined accuracy claim with rounding, boundary, large-number, all-basis, and all-currency fixtures.

### F-3-3 — License restoration is an unlisted capability claim

- Exact quote/location: Plus panel, “Existing Plus license holders can restore access below.”
- Why this matters: `license-check-privacy` states only what data the request sends. Its test happens to assert “Plus is active,” but the registry does not list restoration as a promise. `plus-entitlements` starts from a cached verdict and does not restore a license.
- Concrete fix: add `license-restoration` with valid, invalid, unavailable-service, and reload-persistence fixtures, or remove the restoration promise and control until that behavior has its own claim.

### F-3-4 — The Reset demo browser test has a same-URL race

- Exact location: `tests/e2e/app.spec.ts`, query-demo reset test. `mode.js` changes `/?demo=1` to `/demo`, then the test clicks Reset and waits with `toHaveURL(/\/demo$/)`—a condition already true before the click.
- Evidence: the live mobile run inspected the stale `RESET-ONLY` value and failed once. Six repeated runs and ten manual runs passed after reload.
- Why this matters: the required Reset behavior has nondeterministic verification; a real regression or a false failure can be hidden by timing.
- Concrete fix: wait for the new document/navigation event and then `#terms-form[data-ready="true"]`, or reset and reseed in place with an explicit completion state.

### F-3-5 — The root skip-link label does not match its destination

- Exact location: root `<a class="skip-link" href="#main">Skip to calculator</a>`. `#main` starts at the marketing hero; the calculator begins at `#workbench`.
- Why this matters: a keyboard user asking to skip to the calculator lands before it. Legal pages correctly use “Skip to content.”
- Concrete fix: rename it **Skip to content**, or point it to `#workbench` and focus `#workbench-title`.

### F-3-6 — The visible Plus tier has no exact price and cannot be bought

- Exact location: “Save versions and receipts with Plus” and “Plus is not available to buy in this release.”
- Why this matters: the required site skeleton says a paid tier must state its exact price and unlocks. This section lists unlocks but no price, and a new visitor cannot obtain them.
- Concrete fix: hide the Plus promotion and disabled Plus actions until launch, or state the exact one-time price and enable only the Sociobot billing path once it resolves successfully.

## Demo, privacy, and offline result

The visitor-facing demo itself passes the product-use test:

- `/demo` and `?demo=1` show `HARBOR-1042`, Harbor Paper Co. → Moss & Field Studio, €1,470.00 due 11 August 2026, €1,500.00 after the deadline, and **View sample payment card** in the first viewport.
- The persistent banner, Reset demo, and Start for real are present.
- Manual same-context storage checks confirm separate `early-pay-terms` and `demo:early-pay-terms` databases; real data was unchanged by demo edits.
- Reset restored the sample in ten manual mobile runs; Start for real removed the demo edit before opening `/`.
- Live request logs were same-origin. A service-worker-controlled demo reloaded offline at both viewports.

The claim-test weakness in F-1-4 and reset-test race in F-3-4 remain despite the observed implementation working today.

## Claim execution

Every registered command was run separately from the fresh clone. “Pass” means the command exited 0; it does not override the assertion-quality findings above.

| Claim ID | Result | Review note |
| --- | --- | --- |
| `demo-isolation` | Pass | Tagged test has the separate-context gap in F-1-4. |
| `payment-card` | Pass | Required sample amounts, dates, formula, and rounding were asserted. |
| `browser-privacy` | Pass | Demo/export request log stayed same-origin. |
| `exports` | Pass | JSON and CSV downloads and request log passed. |
| `offline-reload` | Pass | Controlled demo reloaded offline. |
| `currencies` | Pass | Assertions are incomplete; see F-1-32. |
| `receipt-validation` | Pass | Assertions are incomplete; see F-1-27. |
| `free-core` | Pass | Locked calculator, card, and JSON export passed. |
| `draft-persistence` | Pass | Demo reload and production separation passed. |
| `plus-entitlements` | Pass | Cached-license gating passed. |
| `plus-sale-state` | Pass | No checkout or purchase action rendered. |
| `license-check-privacy` | Pass | GET destination, sole token query, empty body passed. |
| `print-payment-card` | Pass | Required card fields and print call passed. |
| `json-import` | Pass | Export/import restored invoice and supplier fields. |
| `no-third-party-runtime` | Pass | Route/export crawl stayed same-origin. |
| `product-boundary` | Pass | Limitation and absent product actions passed. |
| `discount-bases` | Pass | Three formulas and expected totals passed. |

Full clean-clone quality gate: `CI=1 npm test` passed 7 unit tests and 42 browser tests. Build output included 8.26 KB gzip JavaScript and produced `dist/index.html`.

## Structure, routing, and visual identity

- `/`, `/demo`, `/privacy/`, and `/terms/` return 200 with route-specific titles, `lang=en`, one H1, one main, descriptions, canonicals, OG/Twitter images, favicon, and Apple touch icon.
- `/does-not-exist` returns the designed 404 with HTTP 404. The 404 footer defect is F-1-70.
- Calculator fragment navigation and Privacy → Back restore URL, scroll, focus on `#workbench-title`, and the polite announcement at 390px.
- All crawled internal links and the external Sociobot link resolve; mail links are explicit.
- CSP is a response header, headers match the runtime, the manifest MIME is correct, and hashed assets are immutable.
- The mid-century payment-instrument identity is distinct and matches `.factory/design.md`; it is not a generic SaaS hero/cards treatment.
- The landing order is header, first screen, live calculator/payment output, three-step explanation, limitations, Plus, data tools, and footer.

## Missed leverage

No additional AI feature is justified. The calculation must be deterministic, and the brief does not imply summarisation, extraction, or drafting. Import/export is already present; cloud sync would conflict with the local browser-storage promise unless introduced as an explicit optional product change. No provider key or decorative AI runtime was found.

## Copy audit

Counts treat a hyphenated compound as one word. No sentence exceeds 22 words, and no banned marketing adjective appears. Findings are attached to the exact units below; unmarked sentences are plain and within the cap.

### Landing-page sentences

| # | Words | Sentence | Flag |
|---:|---:|---|---|
| 1 | 12 | Calculate early-payment amounts, deadlines, and later balances for small B2B supplier invoices. | — |
| 2 | 14 | For small B2B suppliers, calculate the discounted amount, deadline, and balance after the deadline. | — |
| 3 | 8 | See a saved supplier invoice and payment card. | contrast: F-3-1 |
| 4 | 6 | Invoice figures stay in this browser. | contrast: F-3-1 |
| 5 | 6 | Works offline after the first visit. | contrast: F-3-1 |
| 6 | 8 | The calculator and data export work without Plus. | contrast: F-3-1 |
| 7 | 8 | Illustration of a payment calculator beside invoice slips. | — |
| 8 | 13 | The payment card repeats the entered amounts, dates, discount rule, and rounding choice. | — |
| 9 | 13 | You choose the tax rule; the calculator does not choose one by location. | F-1-12 |
| 10 | 7 | Enter the figures printed on your invoice. | — |
| 11 | 5 | Do not include thousands separators. | — |
| 12 | 6 | Apply the rate to net + tax. | — |
| 13 | 9 | Reduce the net amount and tax by the rate. | — |
| 14 | 8 | Discount net and leave the entered tax unchanged. | — |
| 15 | 9 | For example: Include the invoice reference with your transfer. | — |
| 16 | 9 | Enter the net amount to calculate the discounted payment. | — |
| 17 | 18 | Print this page or choose “Save as PDF” in your print dialog, then attach it to the invoice. | — |
| 18 | 8 | Add the net amount, tax, reference, and dates. | — |
| 19 | 8 | Select where the discount applies and its rounding. | — |
| 20 | 9 | Print or save the calculated card as a PDF. | — |
| 21 | 9 | Tax and discount rules vary by contract and region. | — |
| 22 | 5 | This calculator applies your choices. | — |
| 23 | 11 | It does not decide what is legal or create accounting entries. | — |
| 24 | 7 | Check the payment card before sending it. | — |
| 25 | 11 | Your browser keeps the current calculation when site storage is available. | — |
| 26 | 8 | Plus adds templates, saved versions, and paid-on-time receipts. | — |
| 27 | 4 | No saved versions yet. | — |
| 28 | 8 | Save a calculation to preserve the payment card. | terminology: F-1-67 |
| 29 | 10 | The calculator, payment card, and data export work without Plus. | — |
| 30 | 9 | Plus is not available to buy in this release. | F-3-6 |
| 31 | 8 | Existing Plus license holders can restore access below. | F-3-3 |
| 32 | 5 | Export does not require Plus. | — |
| 33 | 5 | JSON keeps the saved fields. | — |
| 34 | 4 | CSV lists saved amounts. | — |
| 35 | 6 | Early-payment terms for small B2B suppliers. | — |
| 36 | 6 | Invoice figures stay in your browser. | — |
| 37 | 6 | Instrument illustration generated for this product. | — |
| 38 | 6 | Demo — sample data, nothing is saved. | — |
| 39 | 8 | The populated calculator and saved version are below. | contrast: F-3-1 |
| 40 | 12 | This receipt is for the full discounted payment received by the deadline. | F-1-27 |
| 41 | 7 | Review partial, overpaid, or late payments manually. | F-1-27 |
| 42 | 9 | This receipt records the figures entered by the supplier. | — |
| 43 | 10 | It is not proof of bank settlement or tax advice. | — |

### README sentences

| # | Words | Sentence | Flag |
|---:|---:|---|---|
| 1 | 8 | Calculate early-payment invoice terms for small B2B suppliers. | — |
| 2 | 12 | The calculator shows the discounted amount, deadline, later balance, and payment card. | — |
| 3 | 15 | Use it to calculate terms, not to issue invoices, collect money, or make accounting entries. | — |
| 4 | 8 | Try the isolated sample at `https://early-pay-terms.sociobot.in/?demo=1` or `/demo`. | F-1-4 test gap |
| 5 | 12 | Calculates payment terms in EUR, USD, GBP, CHF, INR, JPY, and BHD. | F-1-32 |
| 6 | 15 | Lets you apply a discount to the full invoice, net plus tax, or net only. | — |
| 7 | 16 | Creates a payment card that opens the browser print flow for printing or saving as PDF. | — |
| 8 | 11 | Saves the current calculation in this browser when storage is available. | — |
| 9 | 10 | Exports and imports JSON, and exports saved calculations as CSV. | — |
| 10 | 9 | Keeps the app available offline after the first visit. | — |
| 11 | 9 | You choose and check the tax and contract rule. | — |
| 12 | 9 | This calculator is not legal, tax, or accounting advice. | — |
| 13 | 16 | `/demo` (or `?demo=1`) loads Harbor Paper Co.’s sample invoice in a separate `demo:early-pay-terms` browser database. | F-1-4 test gap |
| 14 | 7 | Reset demo clears only that sample data. | F-3-4 test race |
| 15 | 10 | Start for real removes it before opening the real calculator. | — |
| 16 | 9 | Normal calculator use keeps invoice figures in the browser. | — |
| 17 | 7 | JSON and CSV exports are made locally. | — |
| 18 | 13 | The site includes no analytics, advertising pixels, remote fonts, or third-party runtime scripts. | — |
| 19 | 12 | License restoration sends only the entered token to Sociobot’s product verification endpoint. | — |
| 20 | 6 | See the privacy policy and terms. | — |
| 21 | 7 | Node.js 20+ and npm are required. | — |
| 22 | 17 | `npm test` type-checks, runs calculator tests, builds `dist/`, and runs Playwright in desktop and 390px mobile Chromium. | — |
| 23 | 11 | Each visitor-facing claim has one tagged Playwright test listed in `.factory/claims.json`. | F-1-4, F-1-12, F-1-27, F-1-32, F-3-2, F-3-3 |
| 24 | 9 | `npm run build` produces static deployment output at `dist/index.html`. | — |
| 25 | 3 | MIT — see LICENSE. | — |

### Headings, labels, and actions

| Words | Exact copy | Result |
| ---: | --- | --- |
| 3 | Early-payment invoice calculator | Pass |
| 5 | Calculate exact early-payment invoice terms | F-3-2 |
| 5 | Try it with sample data | Pass |
| 5 | Review sample early-payment invoice terms | Pass |
| 4 | View sample payment card | Pass |
| 2 | Early-payment calculator | Pass |
| 5 | Enter the agreed invoice terms | Pass |
| 1 | Invoice | Pass |
| 2 | Discount rule | Pass |
| 1 | Dates | Pass |
| 7 | Names and note for the payment card | Pass |
| 3 | Show payment card | Pass |
| 2 | Live readout | Pass |
| 3 | Awaiting invoice amount | Pass |
| 3 | Print payment card | Pass |
| 3 | Copy payment terms | Pass |
| 4 | Save this version Plus | Pass |
| 2 | Attachment preview | Pass |
| 3 | Payment terms card | Pass |
| 3 | How it works | Pass |
| 6 | Create payment terms in three steps | Pass |
| 3 | Enter invoice figures | Pass |
| 5 | Choose the agreed discount rule | Pass |
| 4 | Attach the payment card | Pass |
| 6 | What this calculator does not do | Pass |
| 2 | Saved calculations | F-1-67 |
| 3 | Saved calculation versions | F-1-67 |
| 5 | Save terms as template Plus | Pass |
| 4 | Create paid receipt Plus | Pass |
| 2 | Plus features | Pass |
| 6 | Save versions and receipts with Plus | Pass |
| 5 | Have a license? Restore it | Pass |
| 2 | Verify license | Pass |
| 2 | Your data | Pass with descriptive H2 below |
| 6 | Import or export your data | Pass |
| 2 | Export JSON | Pass |
| 2 | Export CSV | Pass |
| 2 | Import JSON | Pass |
| 3 | Clear local data | Pass |
| 2 | Reset demo | Pass |
| 3 | Start for real | Pass |
| 3 | Paid-on-time receipt | Pass |
| 4 | Record the payment received | Pass |
| 2 | Create receipt | Pass |
| 2 | Payment receipt | Pass |
| 3 | Print receipt | Pass |
| 3 | Skip to calculator | F-3-5 |

No action other than the mislabeled skip link fails the result-naming rule. The required demo actions retain their prescribed names.

### Terminology table

| Concept | Required term | Observed exception |
| --- | --- | --- |
| Entered data | invoice figures | None |
| Unsaved work | current calculation | None |
| Saved snapshot | saved version | “Saved calculations”; “Save a calculation” (F-1-67) |
| Output | payment card | None |
| Sample area | demo | None |
| Calculation choice | discount rule | None |
| Paid feature set | Plus | None |

## Earlier-review recheck

`Fixed` means the current live behavior and corresponding source/test were both checked. `Reopened` uses the original ID because the required repair is incomplete.

| Earlier ID | Result and current evidence |
| --- | --- |
| F-1-1 | Fixed — live first screen names the task, small B2B suppliers, and first action. |
| F-1-2 | Fixed — live demo has sample terms and action inside both initial viewports. |
| F-1-3 | Fixed in behavior — same-context live collision check and separate DB names passed; registry-test weakness is F-1-4. |
| F-1-4 | **Reopened** — registry exists, but `demo-isolation` uses separate storage partitions and cannot prove its privacy boundary. |
| F-1-5 | Fixed — no checkout/purchase link; link crawl has no dead sale action. |
| F-1-6 | Fixed — `/demo` is real and unknown routes return the designed 404 with status 404. |
| F-1-7 | Fixed — current description is plain and card fields are asserted. |
| F-1-8 | Fixed — “impossible to misread” is absent; the new unlisted “exact” claim is F-3-2. |
| F-1-9 | Fixed — payment-card and receipt wording names observable outputs. |
| F-1-10 | Fixed — browser privacy has same-origin request logging. |
| F-1-11 | Fixed — entered payment-card field groups are named and asserted. |
| F-1-12 | **Reopened** — rewritten location-independence promise has no claim entry or locale/location test. |
| F-1-13 | Fixed — persistence is qualified by storage availability and reload-tested. |
| F-1-14 | Fixed — no purchase offer is shown; unavailability is explicit. |
| F-1-15 | Fixed — locked core calculator/card/export path is tested. |
| F-1-16 | Fixed — no “unlimited” promise remains. |
| F-1-17 | Fixed — no subscription claim remains. |
| F-1-18 | Fixed — no hosted-checkout claim remains. |
| F-1-19 | Fixed — no cross-device restoration promise remains. |
| F-1-20 | Fixed — no merchant/refund promise remains. |
| F-1-21 | Fixed — JSON and CSV export work without Plus in the tagged test. |
| F-1-22 | Fixed — export contents and JSON round-trip are asserted to the narrowed wording. |
| F-1-23 | Fixed — visible limitation and absence of invoicing/collection/accounting actions are tested. |
| F-1-24 | Fixed — audience appears in the first viewport. |
| F-1-25 | Fixed — privacy and offline claims have live request/offline checks; contrast regression is F-3-1. |
| F-1-26 | Fixed — narrowed provenance appears in `.factory/design.md`, source sidecars, and footer. |
| F-1-27 | **Reopened** — receipt test omits overpaid, pre-issue, and late cases. |
| F-1-28 | Fixed — README opens with task and audience. |
| F-1-29 | Fixed — every README sentence is under 22 words. |
| F-1-30 | Fixed — integer-arithmetic jargon is absent from visitor copy. |
| F-1-31 | Fixed — three discount treatments are described and total-tested. |
| F-1-32 | **Reopened** — five named currencies are selected but their outputs are not asserted. |
| F-1-33 | Fixed — card/print fields and print invocation are asserted. |
| F-1-34 | Fixed — controlled demo reload works offline locally and live. |
| F-1-35 | Fixed — JSON import and JSON/CSV export tests pass. |
| F-1-36 | Fixed — the unsupported $19 offer is absent. |
| F-1-37 | Fixed — hosted-payment wording is absent; verification destination is fixture-tested. |
| F-1-38 | Fixed — product is called a calculator consistently. |
| F-1-39 | Fixed — documented `npm test` passed from a fresh clone. |
| F-1-40 | Fixed — documented build produced `dist/index.html`. |
| F-1-41 | Fixed — live and local request logs stayed same-origin during calculator/demo use. |
| F-1-42 | Fixed — visitor copy avoids unnecessary storage implementation detail. |
| F-1-43 | Fixed — export downloads and absence of export requests are asserted. |
| F-1-44 | Fixed — service-worker-controlled offline navigation returns the sample app. |
| F-1-45 | Fixed — runtime crawl covers root, legal routes, demo, and export with only same-origin requests. |
| F-1-46 | Fixed — invented instrument label is absent. |
| F-1-47 | Fixed — first-screen basis/tax jargon is absent. |
| F-1-48 | Fixed — slogan caption was replaced by a literal illustration description. |
| F-1-49 | Fixed — “Workbench” is absent from visitor copy. |
| F-1-50 | Fixed — empty state says to enter the net amount and names the result. |
| F-1-51 | Fixed — “ledger” is absent. |
| F-1-52 | Fixed — H2 is “Saved calculation versions”; terminology regression is separately F-1-67. |
| F-1-53 | Fixed — “Permanent utility” is absent. |
| F-1-54 | Fixed — price/mood heading is absent. |
| F-1-55 | Fixed — data heading names import/export. |
| F-1-56 | Fixed — limitation heading names what the calculator does not do. |
| F-1-57 | Fixed — “local-first” jargon is absent from visitor copy. |
| F-1-58 | Fixed — former 31-word README sentence is split. |
| F-1-59 | Fixed — precision implementation jargon is absent. |
| F-1-60 | Fixed — each tax treatment has a plain description and tested total. |
| F-1-61 | Fixed to current wording; the assertion-depth regression is F-1-32. |
| F-1-62 | Fixed — payment-card print wording is direct. |
| F-1-63 | Fixed — offline wording is plain and reload-tested. |
| F-1-64 | Fixed — browser-storage wording is plain. |
| F-1-65 | Fixed — service-worker jargon is absent from visitor privacy copy. |
| F-1-66 | Fixed — visible product actions name results. |
| F-1-67 | **Reopened** — “saved calculations,” “saved calculation versions,” and “saved versions” name one concept. |
| F-1-68 | Fixed — all real routes have canonical/social/touch metadata; 404 has favicon/touch metadata appropriate to an error page. |
| F-1-69 | Fixed — live Privacy → Back restores fragment, focus, announcement, and scroll. |
| F-1-70 | **Reopened** — shared header is fixed, but 404 footer omits Built by Param Factory. |
| F-1-71 | Fixed — external Sociobot link has an external accessible label. |
| F-1-72 | Fixed — live CSP/Permissions/nosniff/referrer headers are present; `frame-ancestors` is a response header. |
| F-1-73 | Fixed — manifest is `application/manifest+json`. |
| F-1-74 | Fixed — hashed assets are immutable; mode/service-worker are no-cache. |
| F-1-75 | Fixed — result is a section and demo controls are an aside; no landmark violation. |
| F-1-76 | Fixed — legal H1s are “Privacy policy” and “Terms of use.” |
| F-1-77 | Fixed — named three-step section precedes limitations and Plus. |
| F-1-78 | Fixed — source distinguishes Online, Ready offline, Working offline, and failure. |
| F-1-79 | Fixed — storage error states the cause and next action. |
| F-1-80 | Fixed — import error names the accepted export and next action. |
| F-2-1 | Fixed — demo banner is a labelled aside; live axe has no landmark violation. |
| F-2-2 | Fixed — action is “Copy payment terms.” |
| F-2-3 | Fixed — `free-core` registers and tests the no-Plus path. |
| F-2-4 | Fixed — payment-card claim/test covers amounts, dates, formula, and rounding. |
| F-2-5 | Fixed — edited draft reload and production separation are tested. |
| F-2-6 | Fixed — all three Plus entitlements are compared locked vs cached valid license. |
| F-2-7 | Fixed — one unavailability sentence remains and absence of checkout is tested. |
| F-2-8 | Fixed — landing billing-implementation copy is absent; verification privacy is tested. |
| F-2-9 | Fixed — print invocation and required card contents are tested. |
| F-2-10 | Fixed — JSON export/import restoration is tested. |
| F-2-11 | Fixed — no-third-party runtime claim has a route/export request crawl. |
| F-2-12 | Fixed — license request destination, method, sole query key, empty body, and absent invoice reference are asserted. |
| F-2-13 | Fixed — product-boundary wording and absent actions are tested. |
| F-2-14 | Fixed — all three discount bases have expected formula/total assertions. |
| F-2-15 | Fixed — both export types are covered by no-request checks. |

## What would make this perfect

Raise the hero helper/fact contrast, repair the four incomplete claim tests, and register or remove the two remaining unlisted promises. Use one saved-version term, finish the 404 footer, correct the skip link, and make the Reset test wait for a new document. Finally, either hide unavailable Plus UI or state an exact purchasable one-time price through Sociobot. A repeat review should then have zero findings, zero serious axe incompletes, and no claim whose test can pass without observing the promised behavior.
