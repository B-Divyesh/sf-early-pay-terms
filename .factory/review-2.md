# Adversarial first-read review 2 — Early Pay Terms

Reviewed: 2026-08-28 UTC
Work order: `early-pay-terms-review-2`
Repository commit: `786c3c93d01d19f29c9a2a3c9d36ced9c7800783`
Live URL: <https://early-pay-terms.sociobot.in>

## Verdict: FAIL

There are 18 findings, including three blocking regressions/partial repairs. The product is clear on its normal landing screen, but the required demo does not open on the product in use, and the previously reported route focus/back and consistent-header defects remain. The claim registry is present and its listed tests pass, but 13 live/README claims remain outside it.

## 30-second cold read

Fresh Chromium contexts at 390×844 and 1440×900 loaded `/` with no prior storage, cookies, requests to another origin, or console errors.

Before scrolling, both viewports state:

> Calculate exact early-payment invoice terms
>
> For small B2B suppliers, calculate the discounted amount, deadline, and balance after the deadline.
>
> Try it with sample data
>
> See a saved supplier invoice and payment card.

- What it does: calculates the discounted invoice payment, deadline, and later balance, then shows a payment card.
- For whom: small B2B suppliers.
- First action: **Try it with sample data**; the adjacent text says it should show a saved supplier invoice and payment card.

This first screen passes the cold-read test. Its exact visible wording is useful and the primary action is clear.

## Blocking findings

### F-1-2 — Demo still does not show the product being used on entry

This reopens the earlier demo finding; it is only partly fixed.

- Exact location: `/demo`, immediately after clicking “Try it with sample data.” The 390px initial viewport shows the demo banner, header, hero, the same “Try it with sample data” self-link, three facts, and the top of decorative artwork. The populated calculator starts at `y=1492`; its live readout starts at `y=3281`.
- Evidence: the same fresh context does have `HARBOR-1042`, a visible payment card later in the document, and only `demo:early-pay-terms` in IndexedDB. Those facts are not visible on arrival. Desktop has the same problem: the workbench starts below the initial viewport (`y=1015`).
- Why this fails: a visitor who follows the one-click demo action is returned to a marketing screen rather than immediately seeing realistic invoice figures and their calculated result. The action is also a no-op self-link once already on `/demo`.
- Concrete fix: make `/demo` open at a compact, populated calculator/readout state (for example, render the sample workbench first or scroll/focus the result after load). In the first 390px viewport show `HARBOR-1042`, supplier/customer, early amount, deadline, and the payment card or readout. Replace the demo-page self-link with `View sample payment card` if an action remains. Add a tagged Playwright assertion that those sample values are in the initial 390px viewport after loading `/demo`.

### F-1-69 — Route changes still lose focus and the prior calculator location

This reopens the earlier routing finding.

- Exact reproduction: at 390px, `/` → header **Calculator** works initially: URL becomes `/#workbench`, focus is `#workbench-title`, live announcement is present, and `scrollY=1413`. Then header **Privacy** → browser Back returns to `/#workbench` with `document.activeElement === document.body`, empty route announcement, and `scrollY=0`.
- Why this fails: keyboard and screen-reader users are returned to the top of a long page, not the Calculator section they left. The URL says `#workbench` while the actual view and focus are elsewhere.
- Concrete fix: on `pageshow`/`popstate` restore the fragment target, move focus to its programmatically focusable heading, and update the polite announcement. Add the exact Privacy → Back Playwright check above at 390px and desktop.

### F-1-70 — Header navigation is not consistent across real routes

This reopens the earlier skeleton finding.

- Exact location: the landing header has **Demo, Calculator, Saved versions, Privacy**. `/privacy/` and `/terms/` have **Demo, Calculator, Privacy** only.
- Why this fails: a user on a legal page loses a visible route to a main landing section. This is not the promised consistent header.
- Concrete fix: use one shared header link set on `/`, `/demo`, `/privacy/`, and `/terms/`—add `Saved versions` linking to `/#records` on legal pages, or remove it consistently from the app header. Crawl and keyboard-test the shared set.

## Other findings

### F-2-1 — The demo banner creates an axe landmark failure

- Exact location: `/demo`, `#demo-banner > span:nth-child(1)`, “Demo — sample data, nothing is saved”.
- Evidence: live axe 4.10.2 reports `region` (moderate) at 390px and desktop: page content is not contained by a landmark. The banner is a sibling of `header` and `main`.
- Why this matters: the persistent demo status and controls are outside the page’s navigable landmark structure.
- Concrete fix: put the banner inside a labelled landmark, such as `<aside aria-label="Demo controls">`, or place it in the header while retaining accessible button names. Rerun axe with zero violations.

### F-2-2 — “Copy wording” is not a result-naming action

- Exact location: payment readout action, `#copy-terms`.
- Why this matters: it does not say which wording is copied; a cold user cannot predict the result from the button name alone.
- Concrete fix: rename it **Copy payment terms** and update its accessible name and test.

### F-2-3 — “Calculator and export are free” is an unlisted claim

- Exact location: landing hero fact, “Calculator and export are free.”
- Why this matters: the registry tests export without Plus, but has no claim/test that the calculator and payment card remain available without Plus.
- Concrete fix: either remove “free” or add a claim such as `free-calculator` and a clean demo test that calculates and opens a payment card while Plus is locked.

### F-2-4 — The payment-card field-completeness promise is unlisted

- Exact location: calculator introduction, “The payment card shows the entered amounts, dates, discount rule, and rounding choice.”
- Why this matters: `payment-card` asserts some amounts/dates, but not the declared rule and rounding choice.
- Concrete fix: extend the listed claim and assert all four field groups on the generated card, or narrow the sentence to the fields the test observes.

### F-2-5 — Current-calculation persistence is an unlisted claim

- Exact location: Saved calculation versions, “Your browser keeps the current calculation when site storage is available.”
- Why this matters: no registry entry or tagged test reloads a normal/demo calculation and verifies its retained draft.
- Concrete fix: add `draft-persistence` with a clean demo flow that edits a value, reloads, and asserts the value remains in `demo:early-pay-terms` only.

### F-2-6 — Plus feature availability is an unlisted claim

- Exact location: “Plus adds templates, saved versions, and paid-on-time receipts.”
- Why this matters: the receipt test only checks one receipt validation error with a fixture license. It does not prove the listed entitlement boundary.
- Concrete fix: add an entitlement claim/test using the existing fixture: all three actions are unavailable while locked and available when licensed.

### F-2-7 — The unavailable-checkout statement is an unlisted claim

- Exact locations: “Plus purchase is temporarily unavailable.” and “Plus checkout is unavailable right now.”
- Why this matters: this is a reliance claim about the commercial state and currently has neither a registry entry nor a test. It is also duplicated.
- Concrete fix: keep one plain sentence, `Plus is not available to buy in this release.`, and either add a release-state smoke test or remove the unavailable feature area until it can be sold.

### F-2-8 — Billing API use is an unlisted claim

- Exact location: “License checks use Sociobot’s billing API.”
- Why this matters: no claim test exercises the license path or asserts its allowed destination.
- Concrete fix: add `license-check-destination` with a recorded fixture and request-log assertion that only a license token goes to the configured Sociobot endpoint; otherwise move this implementation detail to the privacy policy and remove it from landing copy.

### F-2-9 — Print/PDF availability is an unlisted README claim

- Exact location: README, “Creates a payment card you can print or save as PDF.”
- Why this matters: no listed claim invokes print or verifies the print card. A download/export test is not proof of print output.
- Concrete fix: add `print-payment-card`, asserting the demo print view contains the invoice, early amount, deadline, and later balance; or say only `Creates a payment card.`

### F-2-10 — JSON import is an unlisted README claim

- Exact location: README, “Exports and imports JSON, and exports saved calculations as CSV.”
- Why this matters: `exports` proves downloads only. It never imports a generated JSON file and observes restored fields.
- Concrete fix: add `json-import` with export → fresh demo import → observable field/history assertions.

### F-2-11 — The analytics/runtime-resource promise is unlisted

- Exact location: README, “The site includes no analytics, remote fonts, or third-party runtime scripts.”
- Why this matters: `browser-privacy` records only the demo calculation/export flow and its registry wording is about invoice figures staying in the browser, not this three-part resource promise.
- Concrete fix: add `no-third-party-runtime` that logs all requests across initial load, demo interaction, export, and route changes and allows only same-origin requests; or remove the sentence.

### F-2-12 — The license-token-only promise is unlisted

- Exact location: README, “A license restoration sends only a license token to Sociobot’s billing API.”
- Why this matters: it is a specific privacy promise with no request-body fixture/assertion.
- Concrete fix: add a recorded license restoration test that asserts the request body excludes invoice fields and contains only the token required by the API, or remove the sentence.

### F-2-13 — The product-boundary sentence is not backed by a claim

- Exact location: README opening, “It does not issue invoices or create accounting entries.”
- Why this matters: this is a useful scope promise, but it has no registry entry despite appearing in the primary description.
- Concrete fix: either add a narrow product-boundary test/source assertion, or keep the boundary only as a non-promissory limitation: `Use this to calculate payment terms, not to issue an invoice or make accounting entries.`

### F-2-14 — The exact currency-support wording exceeds the tested promise

- Exact location: README, “Lets you apply a discount to the full invoice, net plus tax, or net only.”
- Why this matters: the `currencies` claim checks currency selection and one invalid rounding combination; it does not assert each advertised discount basis gives the stated treatment.
- Concrete fix: extend `payment-card` or add `discount-bases` to test all three modes against expected totals.

### F-2-15 — “No analytics” privacy language is broader than the live request evidence

- Exact location: README privacy paragraph, “Normal calculator use keeps invoice figures in the browser. JSON and CSV exports are made locally.”
- Why this matters: the first sentence is covered by `browser-privacy`, but the second sentence makes a separate local-generation claim. The current export test inspects downloaded contents but does not state or assert local generation/no network during each export type.
- Concrete fix: split the registry into exact claims or extend `exports` with request logging for both JSON and CSV, then reference it from the README wording.

## Claim execution and sandbox results

I parsed `.factory/claims.json` and ran every listed command individually from a fresh clone at `/tmp/ept-review-2-GKdY2X`, after `npm ci --include=dev`:

| Claim ID | Result | Evidence |
| --- | --- | --- |
| `demo-isolation` | Pass | 2 Chromium projects; separate production/demo contexts passed. |
| `payment-card` | Pass | 2 Chromium projects; sample card values passed. |
| `browser-privacy` | Pass | 2 Chromium projects; request log stayed same-origin in the tested demo flow. |
| `exports` | Pass | 2 Chromium projects; JSON/CSV downloads asserted. |
| `offline-reload` | Pass | 2 Chromium projects; controlled demo reload offline passed. |
| `currencies` | Pass | 2 Chromium projects; listed currencies and unsupported JPY cash-rounding path passed. |
| `receipt-validation` | Pass | 2 Chromium projects; fixture-license receipt validation passed. |

`npm test` also passed from that clone: TypeScript, 7 Vitest tests, production build, and 18 Playwright tests. No listed claim failed. The unlisted-claim findings above mean this is not a complete claim audit.

Live sandbox confirmation: `/demo` creates only IndexedDB `demo:early-pay-terms`; the sample is `HARBOR-1042`; its payment card is already generated; the persistent banner, **Reset demo**, and **Start for real** are present. The live request log for cold `/`, `/demo`, and demo export used only `https://early-pay-terms.sociobot.in`. No provider keys or AI feature were found. The brief does not imply an AI step; import/export already supplies the obvious portability feature.

## Structure, metadata, links, and visual checks

- `/`, `/demo`, `/privacy/`, and `/terms/` return 200 and have route-specific title, one H1, language, description, canonical, OG/Twitter card, favicon, and Apple touch icon. `/does-not-exist` returns designed HTML with HTTP 404.
- Internal links and `https://sociobot.in` returned 200. Mail links are explicit. Sitemap lists all four real routes.
- Response headers include CSP with response-header `frame-ancestors`, Permissions-Policy, nosniff, and Referrer-Policy. Manifest MIME is `application/manifest+json`; versioned image assets are immutable.
- The visual system is distinct: dark enamel, warm paper, brass/coral controls, instrument illustration, ruled output, and monospaced financial values match `.factory/design.md`; it is not a generic SaaS-template treatment.
- Live axe found no serious or critical violations. F-2-1 records the remaining moderate violation.

## Copy audit

Counts use `Intl.Segmenter` word boundaries; hyphenated compounds count as one word. The landing list includes all sentence-like visible copy, headings, labels, actions, caption/alt text, and dialog text, so a slogan or vague action cannot evade the audit. Dynamic values are represented by their static template.

### Landing page

| # | Words | Copy | Flag |
| ---: | ---: | --- | --- |
| 1 | 12 | Calculate early-payment amounts, deadlines, and later balances for small B2B supplier invoices. | — |
| 2 | 3 | Early-payment invoice calculator | — |
| 3 | 5 | Calculate exact early-payment invoice terms | — |
| 4 | 14 | For small B2B suppliers, calculate the discounted amount, deadline, and balance after the deadline. | — |
| 5 | 5 | Try it with sample data | — |
| 6 | 8 | See a saved supplier invoice and payment card. | F-1-2 |
| 7 | 6 | Invoice figures stay in this browser. | covered |
| 8 | 6 | Works offline after the first visit. | covered |
| 9 | 5 | Calculator and export are free. | F-2-3 |
| 10 | 7 | Illustration of a payment calculator beside invoice slips. | — |
| 11 | 3 | Early-payment calculator | — |
| 12 | 5 | Enter the agreed invoice terms | — |
| 13 | 13 | The payment card shows the entered amounts, dates, discount rule, and rounding choice. | F-2-4 |
| 14 | 15 | You choose the tax rule; the calculator does not choose one by location. | — |
| 15 | 7 | Enter the figures printed on your invoice. | — |
| 16 | 5 | Do not include thousands separators. | — |
| 17 | 4 | Where the discount applies | — |
| 18 | 6 | Apply the rate to net + tax. | — |
| 19 | 9 | Reduce the net amount and tax by the rate. | — |
| 20 | 8 | Discount net and leave the entered tax unchanged. | — |
| 21 | 6 | Names and note for the payment card | — |
| 22 | 9 | For example: Include the invoice reference with your transfer. | — |
| 23 | 3 | Show payment card | — |
| 24 | 2 | Live readout | — |
| 25 | 3 | Awaiting invoice amount | — |
| 26 | 9 | Enter the net amount to calculate the discounted payment. | — |
| 27 | 2 | Pay by | — |
| 28 | 2 | You save | — |
| 29 | 3 | Print payment card | — |
| 30 | 2 | Copy wording | F-2-2 |
| 31 | 4 | Save this version Plus | — |
| 32 | 2 | Attachment preview | — |
| 33 | 3 | Payment terms card | — |
| 34 | 18 | Print this page or choose “Save as PDF” in your print dialog, then attach it to the invoice. | F-2-9 |
| 35 | 3 | Early-payment terms | — |
| 36 | 2 | Pay exactly | — |
| 37 | 5 | Funds must be received by | — |
| 38 | 3 | How it works | — |
| 39 | 6 | Create payment terms in three steps | — |
| 40 | 8 | Add the net amount, tax, reference, and dates. | — |
| 41 | 8 | Select where the discount applies and its rounding. | — |
| 42 | 8 | Print or save the calculated card as a PDF. | F-2-9 |
| 43 | 6 | What this calculator does not do | — |
| 44 | 9 | Tax and discount rules vary by contract and region. | — |
| 45 | 5 | This calculator applies your choices. | — |
| 46 | 12 | It does not decide what is legal or create accounting entries. | — |
| 47 | 8 | Check the payment card before sending it. | — |
| 48 | 2 | Saved calculations | — |
| 49 | 3 | Saved calculation versions | — |
| 50 | 11 | Your browser keeps the current calculation when site storage is available. | F-2-5 |
| 51 | 8 | Plus adds templates, saved versions, and paid-on-time receipts. | F-2-6 |
| 52 | 4 | Save terms as template Plus | — |
| 53 | 4 | Create paid receipt Plus | — |
| 54 | 4 | No saved versions yet. | — |
| 55 | 8 | Save a calculation to preserve the payment card. | — |
| 56 | 2 | Plus features | — |
| 57 | 6 | Save versions and receipts with Plus | — |
| 58 | 11 | The calculator, payment card, and data export are available without Plus. | F-2-3 |
| 59 | 5 | Plus purchase is temporarily unavailable. | F-2-7 |
| 60 | 4 | Saved calculation versions | — |
| 61 | 3 | Reusable term templates | — |
| 62 | 3 | Paid-on-time receipts | — |
| 63 | 3 | Free calculator active | — |
| 64 | 7 | Plus checkout is unavailable right now. | F-2-7 |
| 65 | 10 | You can still use the free calculator and export your data. | F-2-3 |
| 66 | 5 | Have a license? Restore it | — |
| 67 | 6 | License checks use Sociobot’s billing API. | F-2-8 |
| 68 | 3 | Import or export your data | — |
| 69 | 5 | Export does not require Plus. | covered |
| 70 | 5 | JSON keeps the saved fields. | covered |
| 71 | 4 | CSV lists saved amounts. | covered |
| 72 | 2 | Export JSON | — |
| 73 | 2 | Export CSV | — |
| 74 | 2 | Import JSON | F-2-10 |
| 75 | 3 | Clear local data | — |
| 76 | 6 | Early-payment terms for small B2B suppliers. | — |
| 77 | 6 | Invoice figures stay in your browser. | covered |
| 78 | 7 | Instrument illustration generated for this product. | — |
| 79 | 6 | Demo — sample data, nothing is saved | covered |
| 80 | 2 | Reset demo | — |
| 81 | 3 | Start for real | — |
| 82 | 4 | Record the payment received | — |
| 83 | 13 | This receipt is for the full discounted payment received by the deadline. | covered |
| 84 | 8 | Review partial, overpaid, or late payments manually. | covered |
| 85 | 2 | Create receipt | — |
| 86 | 3 | This receipt records the figures entered by the supplier. | — |
| 87 | 10 | It is not proof of bank settlement or tax advice. | — |

No landing unit exceeds 22 words. The only plain-words defect is the non-result action in F-2-2. All other flags in the table are claim-registry gaps, not length/jargon/metaphor flags.

### README

| # | Words | Copy | Flag |
| ---: | ---: | --- | --- |
| 1 | 3 | Early Pay Terms | — |
| 2 | 8 | Calculate early-payment invoice terms for small B2B suppliers. | — |
| 3 | 12 | The calculator shows the discounted amount, deadline, later balance, and payment card. | covered |
| 4 | 9 | It does not issue invoices or create accounting entries. | F-2-13 |
| 5 | 7 | Try the isolated sample at https://early-pay-terms.sociobot.in/demo. | — |
| 6 | 3 | What it does | — |
| 7 | 12 | Calculates payment terms in EUR, USD, GBP, CHF, INR, JPY, and BHD. | covered |
| 8 | 15 | Lets you apply a discount to the full invoice, net plus tax, or net only. | F-2-14 |
| 9 | 11 | Creates a payment card you can print or save as PDF. | F-2-9 |
| 10 | 11 | Saves the current calculation in this browser when storage is available. | F-2-5 |
| 11 | 11 | Exports and imports JSON, and exports saved calculations as CSV. | F-2-10 |
| 12 | 9 | Keeps the app available offline after the first visit. | covered |
| 13 | 9 | You choose and check the tax and contract rule. | — |
| 14 | 10 | This calculator is not legal, tax, or accounting advice. | — |
| 15 | 3 | Demo and privacy | — |
| 16 | 17 | `/demo` (or `?demo=1`) loads Harbor Paper Co.’s sample invoice in a separate `demo:early-pay-terms` browser database. | covered |
| 17 | 8 | Reset demo clears only that sample data. | covered |
| 18 | 10 | Start for real removes it before opening the real calculator. | covered |
| 19 | 10 | Normal calculator use keeps invoice figures in the browser. | covered |
| 20 | 8 | JSON and CSV exports are made locally. | F-2-15 |
| 21 | 10 | The site includes no analytics, remote fonts, or third-party runtime scripts. | F-2-11 |
| 22 | 12 | A license restoration sends only a license token to Sociobot’s billing API. | F-2-12 |
| 23 | 3 | Run locally | — |
| 24 | 7 | Node.js 20+ and npm are required. | — |
| 25 | 3 | Test and build | — |
| 26 | 17 | `npm test` type-checks, runs calculator tests, builds `dist/`, and runs Playwright in desktop and 390px mobile Chromium. | — |
| 27 | 14 | Each visitor-facing claim has one tagged Playwright test listed in `.factory/claims.json`. | contradicted by F-2-3–15 |
| 28 | 9 | `npm run build` produces static deployment output at `dist/index.html`. | — |

No README sentence exceeds 22 words and no banned marketing adjective, unexplained metaphor, or inconsistent central term was found. Its claim-completeness sentence is itself false until the unlisted claims above are registered or removed.

Terminology remains consistent: **invoice figures** (entered data), **current calculation** (draft), **saved version** (snapshot), **payment card** (output), **demo** (sample area), and **discount rule** (calculation choice).

## Earlier-review recheck

Every earlier review/polish/handoff item was read. `Fixed` below means confirmed in both live behavior and present code; `Reopened` is a blocking finding above.

| Earlier ID | Result |
| --- | --- |
| F-1-1 | Fixed: first screen names small B2B suppliers, job, and first action. |
| F-1-2 | Reopened: demo is seeded/isolated but not immediately product-in-use. |
| F-1-3 | Fixed: mode selects `demo:early-pay-terms`; production DB is not opened in demo. |
| F-1-4 | Fixed: registry exists and all seven listed commands pass. |
| F-1-5 | Fixed: dead checkout link and price CTA are absent. |
| F-1-6 | Fixed: `/demo` is explicit and unknown paths return the designed 404. |
| F-1-7 | Fixed: description is plain and card fields are covered. |
| F-1-8 | Fixed: subjective hero promise removed. |
| F-1-9 | Fixed: card/receipt claim wording is specific. |
| F-1-10 | Fixed: browser privacy wording has a tagged request-log test. |
| F-1-11 | Fixed: output field wording is explicit. |
| F-1-12 | Fixed: tax choice is described plainly. |
| F-1-13 | Fixed: storage availability limitation is stated. |
| F-1-14 | Fixed: unpurchasable offer removed. |
| F-1-15 | Fixed: paid/free wording was narrowed; new unlisted free claim is F-2-3. |
| F-1-16 | Fixed: no unlimited/device entitlement promise remains. |
| F-1-17 | Fixed: subscription claim removed. |
| F-1-18 | Fixed: hosted checkout claim removed. |
| F-1-19 | Fixed: cross-device restoration claim removed. |
| F-1-20 | Fixed: merchant/refund promise removed. |
| F-1-21 | Fixed: export-without-Plus has an observable test. |
| F-1-22 | Fixed: JSON/CSV saved-field wording has an observable export test. |
| F-1-23 | Fixed: limitation now names calculator boundaries. |
| F-1-24 | Fixed: audience is in the first screen. |
| F-1-25 | Fixed: privacy/offline facts are plain and tested. |
| F-1-26 | Fixed: asset provenance is narrowed and documented. |
| F-1-27 | Fixed: receipt validation is tested. |
| F-1-28 | Fixed: README opening is plain. |
| F-1-29 | Fixed: overlong README sentence removed. |
| F-1-30 | Fixed: internal-arithmetic jargon removed. |
| F-1-31 | Fixed: discount treatments are named in plain language. |
| F-1-32 | Fixed: currency claim is registered and tested. |
| F-1-33 | Fixed: payment-card description is plain; print promise is newly unlisted in F-2-9. |
| F-1-34 | Fixed: offline wording is registered and tested. |
| F-1-35 | Fixed: export wording is registered; import gap is F-2-10. |
| F-1-36 | Fixed: $19 offer removed. |
| F-1-37 | Fixed: embedded/hosted payment claim removed. |
| F-1-38 | Fixed: calculator terminology is consistent. |
| F-1-39 | Fixed: documented test command passes cleanly. |
| F-1-40 | Fixed: documented build produces `dist/index.html`. |
| F-1-41 | Fixed: normal-calculator privacy claim has a request-log test. |
| F-1-42 | Fixed: over-specific storage implementation claim removed. |
| F-1-43 | Fixed: export is locally observable; exact local-generation gap is F-2-15. |
| F-1-44 | Fixed: offline behavior uses a demo reload test. |
| F-1-45 | Fixed in prior wording; broader current no-runtime claim is F-2-11. |
| F-1-46 | Fixed: invented instrument slogan removed. |
| F-1-47 | Fixed: unexplained basis/tax treatment wording removed. |
| F-1-48 | Fixed: decorative slogan captions removed. |
| F-1-49 | Fixed: workbench metaphor removed. |
| F-1-50 | Fixed: empty state gives the direct next action. |
| F-1-51 | Fixed: ledger label removed. |
| F-1-52 | Fixed: mood heading replaced by Saved calculation versions. |
| F-1-53 | Fixed: permanent-utility label removed. |
| F-1-54 | Fixed: price/mood heading removed. |
| F-1-55 | Fixed: ledger metaphor removed. |
| F-1-56 | Fixed: mood heading replaced by a named limitation. |
| F-1-57 | Fixed: local-first jargon removed. |
| F-1-58 | Fixed: overlong README description removed. |
| F-1-59 | Fixed: precision jargon removed. |
| F-1-60 | Fixed: tax treatments explained. |
| F-1-61 | Fixed: currency promise is tested. |
| F-1-62 | Fixed: attachment wording is plain. |
| F-1-63 | Fixed: offline promise is tested. |
| F-1-64 | Fixed: storage copy is plain. |
| F-1-65 | Fixed: service-worker implementation detail removed. |
| F-1-66 | Fixed: primary actions now name results, except F-2-2. |
| F-1-67 | Fixed: privacy terminology is consistent. |
| F-1-68 | Fixed: canonical/social/touch/share metadata live on all checked routes. |
| F-1-69 | Reopened: Privacy → Back loses focus and anchor position. |
| F-1-70 | Reopened: `Saved versions` missing from legal headers. |
| F-1-71 | Fixed: external destination is labelled. |
| F-1-72 | Fixed: live response headers include CSP/Permissions-Policy. |
| F-1-73 | Fixed: manifest MIME is correct live. |
| F-1-74 | Fixed: immutable policy applies to static assets. |
| F-1-75 | Fixed: result is a labelled section; old nested-aside violation absent. |
| F-1-76 | Fixed: legal H1s name their pages. |
| F-1-77 | Fixed: named three-step How it works precedes limitation and Plus area. |
| F-1-78 | Fixed: source keeps `Online` until controlled and names setup failure. |
| F-1-79 | Fixed: storage error explains cause and next action. |
| F-1-80 | Fixed: import error gives a safe accepted-format instruction. |

## What would make this perfect

Make `/demo` a first-screen product demonstration, restore focus/scroll on back navigation, and give every route the same header. Put the demo controls in a landmark, rename **Copy wording**, and either register-and-test every remaining visitor-facing claim or delete/narrow it. A fresh reviewer should then be able to repeat this full cold/mobile/desktop/demo/claims/history/route/axe crawl with zero findings.
