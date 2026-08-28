# Adversarial first-read review 1 — Early Pay Terms

Work order: `early-pay-terms-review-1`

Reviewed: 28 August 2026 UTC

Base commit: `12a57713fce6e60120e075123f7ed16b39df7640`

Live URL: <https://early-pay-terms.sociobot.in>

## Verdict: FAIL

The product is not acceptable in this round. A cold visitor cannot identify the intended user from the first screen, there is no sample-data demo, both documented demo entry forms use the real IndexedDB namespace, `.factory/claims.json` is missing, the paid checkout is a live 404, and unknown routes masquerade as the home page with HTTP 200. Those are blocking failures before the copy, metadata, navigation, and accessibility findings below.

## Method and evidence

- Opened the live site in new Chromium contexts at 390×844 and 1440×900. No cookies or storage were preloaded.
- Captured viewport screenshots at `/tmp/ept-mobile.png` and `/tmp/ept-desktop.png` (review-container evidence, not committed).
- Recorded all Playwright requests and browser errors during the cold load and `?demo=1` flow.
- Entered `DEMO-COLLISION-1`, EUR 875.00 net, and EUR 166.25 tax at `/?demo=1`; the same reference loaded at `/` in the same fresh context.
- Crawled every distinct landing/legal link with HTTP requests. All internal/legal links and `https://sociobot.in/` returned 200; the checkout returned 404.
- Requested `/does-not-exist`; it returned 200 and the exact root HTML SHA-256, `d463fc2407aa1d70db1dbb400494be814927ecd6da9bcda9578a31cbcdee88a0`.
- Ran live axe scans at both viewports. Each found one moderate `landmark-complementary-is-top-level` violation and no serious/critical violations.
- Cloned the base commit to `/tmp/early-pay-terms-claimcheck-Rn26nm/clone`, ran `npm ci --include=dev`, then `npm test`: 7/7 unit tests and 16/16 Playwright tests passed; `dist/` was produced.
- Read `.factory/brief.json`, `.factory/design.md`, `.factory/handoff.md`, `.factory/verification-1.md`, source, tests, README, legal pages, manifest, service worker, and live response headers. No earlier `review-*.md` or `polish-*.md` files exist.

## 30-second cold read

### 390 px, before scrolling

Exact visible copy, in order:

> Early Pay Terms
>
> Invoice instrument no. 01
>
> Make the early amount impossible to misread.
>
> Set the basis, tax treatment, dates and rounding once. Get an exact payment card for your invoice—and a clean receipt when it is paid on time.
>
> Set payment terms
>
> Local-first. Your invoices stay on this device.

- What it does: probably calculates an early-payment amount and makes a payment card, but “early amount,” “basis,” and “tax treatment” require interpretation.
- For whom: cannot answer. “Small suppliers” does not appear until the footer, about 6,320 px down the page.
- What to click first: “Set payment terms,” although there is no indication of what will appear and no sample-data choice.

### Desktop, before scrolling

The same copy is visible beside the instrument artwork. The navigation adds “Calculator,” “Records,” and “Unlock.” It still does not name small B2B suppliers, and it still offers no sample-data path.

## Blocking findings

### F-1-1 — The first screen does not identify the user or state the job plainly

- Quote/location: hero `<h1>`, “Make the early amount impossible to misread.” Hero text: “Set the basis, tax treatment, dates and rounding once.”
- Evidence: neither viewport names the intended “tiny B2B supplier.” “Early amount,” “basis,” and “tax treatment” are unexplained on first read. Only the footer says “small suppliers.” The first screen also has one fact, not the required privacy/offline/price three.
- Impact: a cold visitor cannot answer all three required questions within one screen.
- Concrete fix: use `Calculate exact early-payment invoice terms` as the headline. Follow with `For small B2B suppliers, calculate the discounted amount, deadline, and balance after the deadline.` Add three short facts: `Invoice figures stay in this browser.`, `Works offline after the first visit.`, and `Calculator free; saved records cost $19 once.`

### F-1-2 — There is no one-click sample-data demo

- Quote/location: hero action is “Set payment terms.” The page contains no “Try it with sample data,” no realistic seeded invoice, no demo banner, no “Reset demo,” and no “Start for real.”
- Evidence: a fresh search of the live DOM found none of the required strings. `/demo` and `?demo=1` both show the empty production calculator and the home-page title.
- Impact: a visitor must understand and enter financial/tax inputs before seeing value. The required product demonstration cannot be evaluated.
- Concrete fix: put `Try it with sample data` on the first screen. Open `/demo` with a realistic supplier, customer, invoice, tax, discount, dates, calculated payment card, and saved version already visible. Keep a persistent `Demo — sample data, nothing is saved` banner with working `Reset demo` and `Start for real` actions.

### F-1-3 — The apparent demo entry writes to and reads from real storage

- Quote/location: `https://early-pay-terms.sociobot.in/?demo=1` and `/demo`.
- Evidence: `?demo=1` opened IndexedDB database `early-pay-terms`. After entering invoice reference `DEMO-COLLISION-1`, navigating to `/` loaded `DEMO-COLLISION-1`. Source confirms one hard-coded database name in `src/db.ts` and no demo branch.
- Impact: a catalog/verifier URL containing `demo=1` silently modifies the visitor's real draft. This violates the isolation requirement and makes “nothing is saved” impossible to state honestly.
- Concrete fix: route demo mode explicitly and use a separate `demo:early-pay-terms` database or in-memory store. Never read production keys in demo mode. Reset must clear only that namespace, and leaving demo must discard it. Document the URL, sample, reset, and namespace in `.factory/demo.md`; test collision in both directions.

### F-1-4 — The required claim registry and tagged claim tests do not exist

- Quote/location: `.factory/claims.json` is absent. `rg '@claim:' tests` returns no matches.
- Evidence: the clean-clone `npm test` passes, but these are general tests, not the required one-test-per-claim contract. There were therefore zero listed commands to run and no way to mark any live/README claim tested.
- Impact: every product, privacy, offline, paid, and export statement is untracked. A passing general suite cannot show which promise it proves.
- Concrete fix: add `.factory/claims.json`; give every retained claim exactly one `@claim:<id>` test runnable from a fresh demo context. Add measured output assertions, same-origin request logging for privacy, offline reload after first visit, downloaded-file content checks, and recorded billing fixtures. Remove claims that cannot be tested.

### F-1-5 — The paid call to action is a dead link

- Quote/location: “Buy Plus — $19 once” → `https://api.sociobot.in/api/v1/products/early-pay-terms/checkout`.
- Evidence: HEAD and GET both returned HTTP 404. GET body: `{"error":"enabled factory product","status":404}`.
- Impact: the site advertises a purchase that cannot be completed. “Hosted checkout” and the $19 offer are presently misleading.
- Concrete fix: register and enable the product through the Sociobot billing API before showing the button. Add a claim test that follows the checkout link to a valid hosted checkout without creating a charge. Until enabled, remove the purchase CTA and state that Plus is unavailable.

### F-1-6 — Routing has no real demo or designed 404

- Quote/location: `/demo` returns the home app and title `Early Pay Terms — exact invoice discount terms`; `/does-not-exist` returns HTTP 200 and byte-identical root HTML.
- Evidence: sitemap lists only `/`, `/privacy/`, and `/terms/`. There is no `404.html` or `staticwebapp.config.json`.
- Impact: deep links lie about their state, bad URLs look valid, and a screen reader receives the home headline instead of a not-found message. This is broken routing.
- Concrete fix: implement `/demo` as the sandbox, add a designed `/404.html` with `404 — Early Pay Terms`, one plain `<h1>`, and a home action. Configure the host's 404 response override and list real indexable routes in the sitemap.

## Unlisted claim findings

Every row below is a separate unlisted-claim finding. Because the registry is absent, none has the required `@claim:<id>` evidence. “Test” below is the concrete test to add; where a statement is not objectively testable, remove or rewrite it.

| ID | Exact claim and location | Concrete fix/test |
| --- | --- | --- |
| F-1-7 | Meta description: “Calculate exact early-payment discounts and print unambiguous invoice payment terms.” | Demo calculation fixture must assert all displayed/printed values; replace “unambiguous” with the observable output fields. |
| F-1-8 | Hero: “Make the early amount impossible to misread.” | Remove the absolute, subjective promise; use `Calculate exact early-payment invoice terms`. |
| F-1-9 | Hero: “Get an exact payment card for your invoice—and a clean receipt when it is paid on time.” | Test card and receipt values from demo data; say that the receipt requires Plus. Remove “clean.” |
| F-1-10 | Hero: “Your invoices stay on this device.” | Request-log test must exercise the whole demo and assert only approved same-origin requests; change “invoices” to “invoice figures.” |
| F-1-11 | Calculator: “Every choice remains visible on the output.” | Assert each entered choice appears in the payment card, or narrow the sentence to the fields actually printed. |
| F-1-12 | Calculator: “Nothing is inferred from your region.” | Test that location/language does not alter tax method; rewrite as `You choose the tax rule; the calculator does not choose one by location.` |
| F-1-13 | Records: “Your current draft is always kept on this device.” | Test reload persistence and outgoing requests. Replace “always” with the actual IndexedDB/browser-storage limitation. |
| F-1-14 | Records: “Plus unlocks reusable templates, saved versions and paid-on-time receipts.” | Recorded valid/invalid license fixtures must assert all three entitlements. |
| F-1-15 | Pricing: “The free calculator, payment card, and data export stay free.” | Test each feature without a license. Replace future-tense “stay” with `are available without Plus`. |
| F-1-16 | Pricing: “Plus adds unlimited saved versions, reusable term templates, and paid-on-time receipts on this device.” | Test more than any enforced limit and all three features with a fixture license, or remove “unlimited.” |
| F-1-17 | Pricing: “No subscription.” | Registry test must confirm the configured billing product is one-time; do not show it while checkout is unregistered. |
| F-1-18 | Pricing: “Hosted checkout.” | Test that the live link resolves to the approved Sociobot checkout. It currently fails with 404. |
| F-1-19 | Pricing: “Restore on another device.” | Test license restoration in a fresh browser context using a recorded verification fixture. |
| F-1-20 | Pricing: “Secure checkout and refunds are handled by Sociobot, the merchant of record.” | Link to the applicable policy and test only the observable host/redirect. Remove “secure” unless a defined security property is asserted. |
| F-1-21 | Data tools: “Export is never paywalled.” | Unlicensed demo must successfully download each offered format; replace “never” with `Export does not require Plus`. |
| F-1-22 | Data tools: “JSON preserves every field; CSV is convenient for checking saved amounts.” | Round-trip JSON and assert all fields; assert CSV headers and rows. Remove subjective “convenient.” |
| F-1-23 | Caution: “This tool applies the choices shown; it does not decide which treatment is legal or create accounting entries.” | Test each input affects the documented formula and verify no accounting-entry feature exists; keep the boundary wording. |
| F-1-24 | Footer: “Exact terms for small suppliers.” | Demo fixture must assert exact amounts/deadlines; make this the clear first-screen audience sentence instead of a footer-only slogan. |
| F-1-25 | Footer: “Local-first and usable offline.” | Offline demo test must load, calculate, save/reset in demo, set the context offline, reload, and confirm no network dependency. |
| F-1-26 | Footer: “The fictional instrument scene was generated with AI for this product; all interface graphics are original.” | Add a provenance/source audit or retain this only in `.factory/design.md`; “all” needs evidence. |
| F-1-27 | Receipt: “This receipt is for a full discounted payment received by the deadline. Partial or late payments need manual review.” | Fixture tests must accept exact/on-time and reject partial, overpaid, pre-issue, and late cases with the stated guidance. |
| F-1-28 | README: “Early Pay Terms is a local-first invoice terms calculator for small B2B suppliers.” | Register the calculator and local-storage behavior; replace “local-first” with plain storage wording. |
| F-1-29 | README: “It turns an agreed early-payment discount into an exact payable amount, deadline, post-deadline balance, printable payment card, and paid-on-time receipt without becoming an invoicing or accounting system.” | Split it, test each output, test excluded operations by UI/API surface, and mark the receipt as Plus. |
| F-1-30 | README: “Calculates with integer minor units for reproducible currency rounding.” | Unit tests must cover every advertised precision/rounding mode; rewrite in user terms. |
| F-1-31 | README: “Supports discounts on the whole invoice, net plus proportional tax, or net with tax fixed.” | Demo/unit fixtures must assert each method's observable amounts. |
| F-1-32 | README: “Supports EUR, USD, GBP, CHF, INR, JPY, and BHD precision, including optional 0.05 cash rounding.” | Parameterized claim test must assert every named currency and reject 0.05 rounding where unsupported. |
| F-1-33 | README: “Generates a clear printable/PDF payment-terms attachment.” | Test print output and fields. The app opens browser print; rewrite as `Creates a payment card you can print or save as PDF.` |
| F-1-34 | README: “Keeps the working draft in IndexedDB and works after the first load without a network.” | Fresh demo context must persist, become service-worker controlled, go offline, reload, and preserve sample/draft data. |
| F-1-35 | README: “Exports/imports local data as JSON and exports saved calculations as CSV.” | Round-trip JSON and assert CSV header plus one row per saved record in demo mode. |
| F-1-36 | README: “Offers a $19 one-time Plus license for saved versions, reusable templates, and exact paid-on-time receipts.” | Test configured price/type and entitlements via recorded fixtures; live checkout must first stop returning 404. |
| F-1-37 | README: “Checkout and verification use Sociobot’s hosted billing API; no payment provider is embedded here.” | Request-log test must allow only the stated API during explicit license actions; verify checkout URL. |
| F-1-38 | README: “This project is a calculation utility, not legal, tax, or accounting advice.” | Keep as a limitation, but use the same term (“calculator”) everywhere. |
| F-1-39 | README: “`npm test` runs TypeScript checks, unit tests, a production build, and Playwright tests in desktop Chromium and a 390px mobile viewport.” | A CI assertion or script inspection can prove this; current clean run confirms it but no claim entry maps it. |
| F-1-40 | README: “The exact deployment command is `npm run build`; static output lands in `dist/` with `dist/index.html` at its root.” | Claim test should run the command in a clean clone and assert the file. |
| F-1-41 | README: “Invoice data never leaves the browser.” | Full demo request log must exercise calculate, save, export, import, receipt, and reset. Replace absolute “never” if optional license data could contain invoice content. |
| F-1-42 | README: “IndexedDB stores drafts, versions, and templates; localStorage stores only the optional license and its cached verification result.” | Inspect both stores after each demo action and assert exact keys/records. |
| F-1-43 | README: “JSON/CSV exports are generated locally.” | Intercept requests during export and assert downloaded content with no external request. |
| F-1-44 | README: “The service worker precaches the application shell and uses network-first navigation with cached fallback.” | Service-worker test must inspect cache entries and offline navigation fallback. |
| F-1-45 | README: “No analytics, trackers, remote fonts, or third-party runtime scripts are included.” | Request/resource scan must assert no third-party script/font/tracker requests through the entire demo flow. |

## Copy findings

The word-count audit is in the next section. These are the flagged lines; each has a concrete replacement.

| ID | Exact quote/location | Why it fails | Proposed rewrite |
| --- | --- | --- | --- |
| F-1-46 | Hero label: “Invoice instrument no. 01” | Invented instrument lore carries no task information. | Delete it, or use `Early-payment invoice calculator`. |
| F-1-47 | Hero: “Set the basis, tax treatment, dates and rounding once.” | “Basis,” “tax treatment,” and “rounding” are specialist terms before any example; it does not name the user. | `For small B2B suppliers, calculate the discounted amount, deadline, and later balance.` |
| F-1-48 | Figure caption: “Three controls. One exact amount.” | It is a slogan and is factually inconsistent with the form's many controls. | `Illustration of a payment calculator beside invoice slips.` |
| F-1-49 | Section label: “Workbench / live calculation” | “Workbench” is a metaphor and the slash label is not a section name. | `Early-payment calculator`. |
| F-1-50 | Empty state: “Enter the net amount to bring the payment terms into focus.” | “Bring … into focus” is a metaphor. | `Enter the net amount to calculate the discounted payment.` |
| F-1-51 | Section label: “Local ledger” | The product does not create an accounting ledger; this conflicts with its stated non-goal. | `Saved calculations`. |
| F-1-52 | Heading: “Versions you can audit” | “Audit” overstates a list stored in a browser and is not the user's task name. | `Saved calculation versions`. |
| F-1-53 | Pricing label: “Permanent utility” | Decorative and unsupported; browser storage and service availability are not permanent. | Delete it, or use `Plus features`. |
| F-1-54 | Pricing heading: “Keep the paper trail for $19 once.” | “Paper trail” is a metaphor and does not name the paid features. | `Save versions and receipts for $19 once`. |
| F-1-55 | Data heading: “Take the ledger with you” | Metaphor plus the inconsistent “ledger” term. | `Import or export your data`. |
| F-1-56 | Safety heading: “You remain the reviewer.” | It makes little sense out of context and does not name the section. | `Check your tax and contract rules`. |
| F-1-57 | Hero/footer/README: “Local-first.” / “Local-first and usable offline.” / “local-first invoice terms calculator” | “Local-first” is jargon and is used beside a clearer storage claim. | `Your invoice figures stay in this browser.` |
| F-1-58 | README, 31 words: “It turns an agreed early-payment discount into an exact payable amount, deadline, post-deadline balance, printable payment card, and paid-on-time receipt without becoming an invoicing or accounting system.” | Exceeds the 22-word hard cap and combines capability, outputs, and exclusions. | `It calculates the discounted amount, deadline, and later balance. It creates a payment card and, with Plus, an on-time receipt.` |
| F-1-59 | README: “Calculates with integer minor units for reproducible currency rounding.” | “Integer minor units” and “reproducible currency rounding” are implementation jargon. | `Uses whole cents or the currency's smallest unit so repeated calculations match.` |
| F-1-60 | README: “Supports discounts on the whole invoice, net plus proportional tax, or net with tax fixed.” | “Proportional tax” and “tax fixed” are unexplained. | `Choose whether the discount applies to the full invoice, reduces tax proportionally, or leaves tax unchanged.` |
| F-1-61 | README: “Supports EUR, USD, GBP, CHF, INR, JPY, and BHD precision, including optional 0.05 cash rounding.” | “Currency precision” is jargon. | `Calculates in EUR, USD, GBP, CHF, INR, JPY, and BHD, with optional rounding to the nearest 0.05.` |
| F-1-62 | README: “Generates a clear printable/PDF payment-terms attachment.” | “Clear” is a marketing adjective; “generates PDF” overstates a browser print dialog. | `Creates a payment card you can print or save as PDF.` |
| F-1-63 | README: “Keeps the working draft in IndexedDB and works after the first load without a network.” | Mixes user value with a browser implementation name. | `Saves the current calculation in this browser. After the first visit, it works without a network.` |
| F-1-64 | README: “IndexedDB stores drafts, versions, and templates; localStorage stores only the optional license and its cached verification result.” | Unexplained implementation names impede the privacy explanation. | `Your browser stores calculations and templates. It separately stores your optional license and its last verification result.` |
| F-1-65 | README: “The service worker precaches the application shell and uses network-first navigation with cached fallback.” | “Service worker,” “application shell,” “network-first,” and “cached fallback” are developer jargon in user-facing privacy copy. | `After the first visit, the browser keeps the app files needed to reopen the calculator offline.` |
| F-1-66 | Buttons: “Set payment terms” and “Review exact terms” | Neither names the immediate result; the first merely scrolls, and the second reveals/scrolls to the card. | Use `Try it with sample data` for the primary hero action and `Show payment card` for the form action. |
| F-1-67 | Across landing/README: “invoice,” “invoice figures,” “invoice data,” “working draft,” “current draft,” “calculation,” “version,” “record,” and “ledger” | Storage and record concepts change names; “ledger” also implies accounting functionality. | Use `invoice figures` for entered data, `current calculation` for the draft, `saved version` for a snapshot, and `payment card` for the output. Never call the list a ledger. |

## Structure, navigation, accessibility, and delivery findings

### F-1-68 — Canonical, social metadata, and the required touch/share assets are missing

- Location: `/`, `/privacy/`, and `/terms/` all lack canonical links, Open Graph metadata, Twitter card metadata, and an apple-touch icon. There is no 1200×630 share image.
- Impact: routes do not declare their canonical URLs and shared links have no product-specific preview.
- Concrete fix: add per-route canonical, OG/Twitter title and description, a 1200×630 image derived from the instrument art, and a 180 px apple-touch icon. Keep the existing SVG favicon and route-specific titles.

### F-1-69 — Route changes do not move focus or restore the prior location

- Location/evidence: after activating “Calculator,” URL becomes `/#workbench`, but `document.activeElement` is `<body>`; the `<h1>` has no `tabindex`; no route announcement contains the heading. After opening `/privacy/` and going back to `/#workbench`, `scrollY` is 0 rather than the workbench.
- Impact: keyboard and screen-reader users are not placed at the new content, and back navigation loses position.
- Concrete fix: use real route handling for real pages; after each route/section change focus a programmatically focusable heading and announce it in a dedicated polite live region. Preserve/restore scroll for popstate. Add Playwright coverage.

### F-1-70 — Header/footer skeleton is inconsistent and incomplete

- Location: home header has Calculator/Records/Unlock but no Demo or Privacy. Legal headers only say “Back to calculator.” Home footer has Privacy and Terms; each legal footer links only to the other policy. No footer says “Built by Param Factory” or includes a version/build ID.
- Impact: visitors cannot rely on the required navigation skeleton across routes.
- Concrete fix: use one consistent header with wordmark, Demo, product section(s), and Privacy. Use one consistent footer with the product one-liner, Privacy, Terms, `Built by Param Factory`, and build ID on every route.

### F-1-71 — External links are not identified as external

- Quote/location: “By Sociobot” and legal-page “Sociobot” links go to another origin without saying so.
- Impact: the destination change is not communicated.
- Concrete fix: label them `Sociobot (external)` or add equally clear accessible text.

### F-1-72 — Required browser security policy headers remain absent

- Location/evidence: live root response has no `Content-Security-Policy` and no `Permissions-Policy`; repository has no `staticwebapp.config.json`.
- History: this is the still-unfixed third observation in `.factory/verification-1.md`.
- Concrete fix: add deployment headers matching actual self-hosted assets and Sociobot billing connections. Put `frame-ancestors` only in the response header. Add a header smoke test.

### F-1-73 — Manifest MIME type remains incorrect

- Location/evidence: live `/manifest.webmanifest` returns `application/octet-stream`.
- History: this is the still-unfixed first observation in `.factory/verification-1.md`.
- Concrete fix: configure `application/manifest+json` (or `application/json`) and assert it in deployment verification.

### F-1-74 — Static assets still receive a 30-second cache policy

- Location/evidence: live assets use `cache-control: public, must-revalidate, max-age=30`.
- History: this is the still-unfixed second observation in `.factory/verification-1.md`.
- Concrete fix: give content-hashed assets a long immutable lifetime while keeping HTML/service-worker update behavior appropriate; add header assertions.

### F-1-75 — The result panel creates a moderate landmark violation

- Location/evidence: live axe at 390 px and desktop reports `landmark-complementary-is-top-level` for `<aside class="result-panel" aria-labelledby="result-title">`; failure summary: “The complementary landmark is contained in another landmark.”
- Impact: the calculator result is exposed as a nested complementary landmark rather than part of the main task.
- Concrete fix: use a labelled `<section>` or `<div>` for this paired result panel, then rerun axe at both viewports.

### F-1-76 — Legal-page H1s are mood lines, not page names

- Quote/location: Privacy H1 “Privacy, without small-print surprises.” Terms H1 “A calculator, not an adviser.”
- Impact: the headings do not identify the routes when heard out of context.
- Concrete fix: use `Privacy policy` and `Terms of use` as the H1s; move a useful limitation sentence below if needed.

### F-1-77 — The landing skeleton omits “How it works” and puts limitations after pricing/data tools

- Location: after the live calculator, the page moves through records, pricing, data tools, then the legal/tax caution. There is no named three-step “How it works” section.
- Impact: a first-time visitor gets controls before a short task model, and the key limitation appears after the purchase offer.
- Concrete fix: after the live sample, add three verb-led steps such as `Enter invoice figures`, `Choose the agreed discount rule`, `Attach the payment card`. Put `What this does not do` and privacy facts before pricing.

### F-1-78 — “Ready offline” can be shown when offline setup failed

- Quote/location: header status “Ready offline”; toast “Offline setup could not finish. The calculator still works while this page is open.”
- Evidence: in a fresh context with service workers blocked, both messages were visible at the same time. `updateNetworkStatus()` checks only network reachability and sets “Ready offline” without checking service-worker control or cache readiness.
- Impact: the status gives the opposite of the observed setup result.
- Concrete fix: show `Online` until the service worker is installed and controlling the page; show `Ready offline` only after cache readiness is confirmed; on failure show `Offline setup failed`. Add a claim test for each state.

### F-1-79 — The draft-save error gives no cause or next action

- Quote/location: interactive toast, “Draft could not be saved on this device.” (8 words)
- Impact: the visitor is not told whether storage is blocked or how to preserve the calculation.
- Concrete fix: `Your browser blocked local storage. Export JSON now or allow site storage, then try again.`

### F-1-80 — Import errors can expose parser text or a vague dead end

- Quote/location: JSON import catch displays the raw `error.message`; fallback is “Could not import this file.” (5 words).
- Impact: malformed JSON can show technical parser text, while the fallback gives neither the accepted format nor a next action.
- Concrete fix: validate and map failures to `This file is not an Early Pay Terms JSON export. Choose a JSON file exported by this app.` Keep schema-version errors similarly explicit and announced.

## Complete landing-page copy audit

Counts use `Intl.Segmenter('en', {granularity: 'word'})`; hyphenated compounds count as one word and symbols do not count. The table includes every sentence plus sentence-like headings, labels, captions, and actions so no flagged slogan or button is hidden by grammar classification. `—` means no separate copy defect beyond any claim finding above.

| # | Type | Words | Exact copy | Copy finding |
| ---: | --- | ---: | --- | --- |
| 1 | Meta | 11 | Calculate exact early-payment discounts and print unambiguous invoice payment terms. | F-1-7 |
| 2 | Label | 4 | Invoice instrument no. 01 | F-1-46 |
| 3 | H1 | 7 | Make the early amount impossible to misread. | F-1-1, F-1-8 |
| 4 | Sentence | 9 | Set the basis, tax treatment, dates and rounding once. | F-1-47 |
| 5 | Sentence | 18 | Get an exact payment card for your invoice—and a clean receipt when it is paid on time. | F-1-9 |
| 6 | Action | 3 | Set payment terms | F-1-2, F-1-66 |
| 7 | Sentence | 2 | Local-first. | F-1-57 |
| 8 | Sentence | 6 | Your invoices stay on this device. | F-1-10, F-1-67 |
| 9 | Caption sentence | 2 | Three controls. | F-1-48 |
| 10 | Caption sentence | 3 | One exact amount. | F-1-48 |
| 11 | Label | 3 | Workbench / live calculation | F-1-49 |
| 12 | H2 | 6 | Set the terms you actually agreed | — |
| 13 | Sentence | 7 | Every choice remains visible on the output. | F-1-11 |
| 14 | Sentence | 6 | Nothing is inferred from your region. | F-1-12 |
| 15 | Sentence | 7 | Enter the figures printed on your invoice. | — |
| 16 | Sentence | 5 | Do not include thousands separators. | — |
| 17 | Label | 5 | Discount basis and tax treatment | — |
| 18 | Sentence | 6 | Apply the rate to net + tax. | — |
| 19 | Sentence | 8 | Round the net discount and tax reduction separately. | — |
| 20 | Sentence | 8 | Discount net and leave the entered tax unchanged. | — |
| 21 | Summary | 7 | Names and note for the printed card | — |
| 22 | Action | 3 | Review exact terms | F-1-66 |
| 23 | H3 | 3 | Awaiting invoice amount | — |
| 24 | Sentence | 11 | Enter the net amount to bring the payment terms into focus. | F-1-50 |
| 25 | Label | 2 | Pay by | — |
| 26 | Label | 2 | You save | — |
| 27 | Action | 3 | Print payment card | — |
| 28 | Action | 2 | Copy wording | — |
| 29 | Action | 4 | Save this version Plus | — |
| 30 | Label | 2 | Attachment preview | — |
| 31 | H2 | 3 | Payment terms card | — |
| 32 | Sentence | 18 | Print this page or choose “Save as PDF” in your print dialog, then attach it to the invoice. | — |
| 33 | Label | 3 | Early-payment terms | — |
| 34 | H3 | 1 | Invoice | — |
| 35 | Label | 2 | Pay exactly | — |
| 36 | Label | 5 | Funds must be received by | — |
| 37 | Label | 2 | Local ledger | F-1-51 |
| 38 | H2 | 4 | Versions you can audit | F-1-52 |
| 39 | Sentence | 9 | Your current draft is always kept on this device. | F-1-13, F-1-67 |
| 40 | Sentence | 11 | Plus unlocks reusable templates, saved versions and paid-on-time receipts. | F-1-14 |
| 41 | Action | 5 | Save terms as template Plus | — |
| 42 | Action | 4 | Create paid receipt Plus | — |
| 43 | Sentence | 4 | No saved versions yet. | — |
| 44 | Sentence | 9 | Save a calculation to preserve what the customer saw. | — |
| 45 | Label | 2 | Permanent utility | F-1-53 |
| 46 | H2 | 7 | Keep the paper trail for $19 once. | F-1-54 |
| 47 | Sentence | 10 | The free calculator, payment card, and data export stay free. | F-1-15 |
| 48 | Sentence | 16 | Plus adds unlimited saved versions, reusable term templates, and paid-on-time receipts on this device. | F-1-16 |
| 49 | Fact | 2 | No subscription | F-1-17 |
| 50 | Fact | 2 | Hosted checkout | F-1-18 |
| 51 | Fact | 4 | Restore on another device | F-1-19 |
| 52 | Status | 3 | Free calculator active | — |
| 53 | Action | 4 | Buy Plus — $19 once | F-1-5 |
| 54 | Summary | 5 | Have a license? Restore it | — |
| 55 | Action | 2 | Verify license | — |
| 56 | Sentence | 12 | Secure checkout and refunds are handled by Sociobot, the merchant of record. | F-1-20 |
| 57 | Label | 2 | Your data | — |
| 58 | H2 | 5 | Take the ledger with you | F-1-55 |
| 59 | Sentence | 4 | Export is never paywalled. | F-1-21 |
| 60 | Sentence | 11 | JSON preserves every field; CSV is convenient for checking saved amounts. | F-1-22 |
| 61 | Action | 2 | Export JSON | — |
| 62 | Action | 2 | Export CSV | — |
| 63 | Action | 2 | Import JSON | — |
| 64 | Action | 3 | Clear local data | — |
| 65 | H2 | 4 | You remain the reviewer. | F-1-56 |
| 66 | Sentence | 9 | Tax and discount rules vary by contract and region. | — |
| 67 | Sentence | 18 | This tool applies the choices shown; it does not decide which treatment is legal or create accounting entries. | F-1-23 |
| 68 | Sentence | 9 | Verify the card against your invoice before sending it. | — |
| 69 | Sentence | 5 | Exact terms for small suppliers. | F-1-24 |
| 70 | Sentence | 5 | Local-first and usable offline. | F-1-25, F-1-57 |
| 71 | Sentence | 16 | The fictional instrument scene was generated with AI for this product; all interface graphics are original. | F-1-26 |
| 72 | Label | 4 | Paid-on-time receipt | — |
| 73 | H2 | 4 | Record the payment received | — |
| 74 | Sentence | 12 | This receipt is for a full discounted payment received by the deadline. | F-1-27 |
| 75 | Sentence | 7 | Partial or late payments need manual review. | F-1-27 |
| 76 | Action | 2 | Create receipt | — |
| 77 | Label | 2 | Payment receipt | — |
| 78 | Label | 2 | Payment received | — |
| 79 | Sentence | 9 | This receipt records the figures entered by the supplier. | — |
| 80 | Sentence | 10 | It is not proof of bank settlement or tax advice. | — |
| 81 | Action | 2 | Print receipt | — |
| 82 | Status | 2 | Ready offline | F-1-78 |
| 83 | Status | 2 | Working offline | — |
| 84 | Placeholder sentence | 9 | For example: Include the invoice reference with your transfer. | — |
| 85 | Image alt sentence | 19 | A fictional teal and cream desktop accounting instrument with invoice slips, a date dial, and a coral signal button. | — |

No landing sentence exceeds 22 words. The audit still fails because the flagged jargon, metaphor, slogans, inconsistent terms, untestable adjectives, and non-result actions remain.

## Complete README copy audit

Code blocks are commands rather than sentences and are excluded. Headings and link labels are included as content units.

| # | Words | Exact copy | Copy/claim finding |
| ---: | ---: | --- | --- |
| 1 | 3 | Early Pay Terms | — |
| 2 | 14 | Early Pay Terms is a local-first invoice terms calculator for small B2B suppliers. | F-1-28, F-1-57 |
| 3 | 31 | It turns an agreed early-payment discount into an exact payable amount, deadline, post-deadline balance, printable payment card, and paid-on-time receipt without becoming an invoicing or accounting system. | F-1-29, F-1-58; over 22 |
| 4 | 3 | What it does | — |
| 5 | 9 | Calculates with integer minor units for reproducible currency rounding. | F-1-30, F-1-59 |
| 6 | 15 | Supports discounts on the whole invoice, net plus proportional tax, or net with tax fixed. | F-1-31, F-1-60 |
| 7 | 15 | Supports EUR, USD, GBP, CHF, INR, JPY, and BHD precision, including optional 0.05 cash rounding. | F-1-32, F-1-61 |
| 8 | 8 | Generates a clear printable/PDF payment-terms attachment. | F-1-33, F-1-62 |
| 9 | 15 | Keeps the working draft in IndexedDB and works after the first load without a network. | F-1-34, F-1-63 |
| 10 | 12 | Exports/imports local data as JSON and exports saved calculations as CSV. | F-1-35 |
| 11 | 18 | Offers a $19 one-time Plus license for saved versions, reusable templates, and exact paid-on-time receipts. | F-1-36 |
| 12 | 14 | Checkout and verification use Sociobot’s hosted billing API; no payment provider is embedded here. | F-1-37 |
| 13 | 10 | The operator must choose and verify the correct tax treatment. | — |
| 14 | 12 | This project is a calculation utility, not legal, tax, or accounting advice. | F-1-38 |
| 15 | 2 | Run locally | — |
| 16 | 5 | Requirements: Node.js 20+ and npm. | — |
| 17 | 7 | Open the local URL printed by Vite. | — |
| 18 | 14 | Local development uses the Sociobot pilot billing endpoint; production hosts use the live endpoint. | — |
| 19 | 3 | Test and build | — |
| 20 | 21 | `npm test` runs TypeScript checks, unit tests, a production build, and Playwright tests in desktop Chromium and a 390px mobile viewport. | F-1-39 |
| 21 | 19 | The exact deployment command is `npm run build`; static output lands in `dist/` with `dist/index.html` at its root. | F-1-40 |
| 22 | 5 | To inspect only one layer: | — |
| 23 | 4 | Playwright 1.58.2 is pinned. | — |
| 24 | 14 | Install its browser with `npx playwright install chromium` if it is not already available. | — |
| 25 | 3 | Data and privacy | — |
| 26 | 6 | Invoice data never leaves the browser. | F-1-41 |
| 27 | 17 | IndexedDB stores drafts, versions, and templates; localStorage stores only the optional license and its cached verification result. | F-1-42, F-1-64 |
| 28 | 6 | JSON/CSV exports are generated locally. | F-1-43 |
| 29 | 18 | See the in-product privacy policy and terms. | — |
| 30 | 15 | The service worker precaches the application shell and uses network-first navigation with cached fallback. | F-1-44, F-1-65 |
| 31 | 12 | No analytics, trackers, remote fonts, or third-party runtime scripts are included. | F-1-45 |
| 32 | 2 | Product references | — |
| 33 | 4 | Research brief | — |
| 34 | 7 | Visual system and asset provenance | — |
| 35 | 4 | Build handoff | — |
| 36 | 1 | License | — |
| 37 | 4 | MIT — see LICENSE. | — |

The opening product-description prose averages about 14.4 words, above the 14-word target, and the 31-word sentence breaches the hard cap.

## Terminology table

| Concept | Terms currently used | One term to use |
| --- | --- | --- |
| Entered financial data | invoice, invoice figures, invoice data | invoice figures |
| Unsaved form state | working draft, current draft, calculation | current calculation |
| Stored snapshot | calculation, version, record, local ledger | saved version |
| Customer-facing output | output, payment card, payment-terms attachment | payment card |
| Discount rule | basis, method, logic, tax treatment | discount rule (explain each option) |

## Claim and sandbox results

| Check | Result | Evidence |
| --- | --- | --- |
| `.factory/claims.json` present and parseable | FAIL / BLOCKING | File absent. |
| Every listed claim command run | UNTESTABLE / BLOCKING | There are no entries to enumerate. |
| Exactly one `@claim:<id>` test per claim | FAIL / BLOCKING | No `@claim:` tags exist. |
| General clean-clone gates | PASS, not claim evidence | `npm test`: 7 unit tests, build, 16 Playwright tests. |
| One-click demo | FAIL / BLOCKING | No action or seeded sample. |
| Demo storage isolation | FAIL / BLOCKING | `?demo=1` and `/` share IndexedDB `early-pay-terms`; `DEMO-COLLISION-1` crossed modes. |
| Demo reset/start-real controls | FAIL / BLOCKING | Neither control/banner exists. |
| Demo request privacy | UNTESTABLE | There is no demo mode. The ordinary root and fake `?demo=1` flow made only same-origin requests (`/`, hero asset, `__network_check__`). |
| Demo offline behavior | UNTESTABLE | The clean suite proves ordinary-mode offline reload, not an isolated seeded demo. |

## History recheck

| Earlier item | Live/code confirmation | Result |
| --- | --- | --- |
| `.factory/verification-1.md` observation 1: manifest MIME | Still `application/octet-stream`. | Unfixed → F-1-73 |
| `.factory/verification-1.md` observation 2: 30-second asset cache | Still `public, must-revalidate, max-age=30`. | Unfixed → F-1-74 |
| `.factory/verification-1.md` observation 3: no CSP/Permissions-Policy | Both still absent; no host config in repo. | Unfixed → F-1-72 |
| `.factory/handoff.md` known gap: billing product still needs registration/release | Checkout returns 404. | Unfixed and user-facing → F-1-5 |
| `.factory/handoff.md` tax/regional limitation | Still visible in calculator, output, terms, and caution copy. | Confirmed |
| `.factory/handoff.md` installable PWA/offline boundary | Manifest/service worker exist; clean ordinary-mode offline test passes. | Confirmed, but demo claim remains untestable |

No previous numbered review/polish findings exist, so there are no earlier review IDs to retain.

## Checks that passed

- Root, Privacy, and Terms titles follow the required pattern and are under 60 characters.
- Each existing route has `lang="en"`, one H1, and one main landmark.
- The live cold load produced no console/page errors; root requests were same-origin.
- All non-checkout links crawled successfully; mail links were treated as explicit exceptions.
- The clean build emits about 7.39 KB gzip application JavaScript, below the budget.
- Existing focus rings, 44 px targets, reduced-motion CSS, mobile layout, and serious/critical axe baseline pass.
- The visual identity is recognizably product-specific: warm paper, dark enamel, brass/coral controls, monospaced financial readouts, ruled document outputs, and original instrument art. It does not look like a generic gradient SaaS template.
- Import/export already covers the obvious portability need. The brief's arithmetic job does not benefit from an AI step; adding one would reduce trust. No runtime AI keys or provider calls were found.

## What would make this perfect

A perfect next round has nothing left in the findings list. Specifically: make the first screen name small B2B suppliers and the exact job; ship a seeded, resettable, isolated `/demo`; create and run the complete claims registry; enable or remove checkout; add real 404/demo routing; replace every flagged line and error with the proposed plain wording; standardize terminology; complete metadata and the route skeleton; repair focus/back behavior, offline status, and the axe landmark; add the response policies; and correct manifest/cache headers. Then repeat this entire cold/mobile/desktop/demo/claims/history/link/accessibility checklist from a fresh context and require zero findings and zero untested claims.
