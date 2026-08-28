# Polish 1 — cumulative finding closure

Base reviewed: `12a57713fce6e60120e075123f7ed16b39df7640`. Evidence names refer to `npm test`, the corresponding tagged claim test, and the deployed cold checks recorded in `handoff.md`.

| Finding | Change made | Evidence |
| --- | --- | --- |
| F-1-1 | Rewrote first screen for small B2B suppliers; added three plain facts. | `@claim:payment-card`; live `/` |
| F-1-2 | Added one-click `/demo`, populated sample, banner, reset and start-real actions. | `@claim:demo-isolation`; live `/demo` |
| F-1-3 | Demo uses `demo:early-pay-terms`; leaving/reset deletes only demo. | `@claim:demo-isolation`; `.factory/demo.md` |
| F-1-4 | Added claim registry and one tagged test per retained claim. | all `.factory/claims.json` commands |
| F-1-5 | Removed dead purchase CTA and clearly states checkout unavailable. | live `/`; link crawl |
| F-1-6 | Added demo route, 404 document, SWA response override, sitemap route. | `staticwebapp.config.json`; live `/does-not-exist` |
| F-1-7–10 | Replaced subjective/meta/privacy hero promises with tested payment-card and browser-privacy claims. | `@claim:payment-card`, `@claim:browser-privacy` |
| F-1-11–13 | Output wording now names fields shown; tax choice wording is explicit; storage limitation is honest. | `@claim:payment-card`, `@claim:browser-privacy` |
| F-1-14–20 | Removed unpurchasable price/checkout promises; retained only restore behavior and unavailable state. | live `/`; no dead checkout link |
| F-1-21–22 | Rewrote export copy and asserted downloaded JSON/CSV content. | `@claim:exports` |
| F-1-23 | Kept calculator boundary in plain language before Plus section. | live `/` |
| F-1-24–26 | Moved audience/privacy facts to first screen; narrowed image provenance statement. | live `/`; `.factory/design.md` |
| F-1-27 | Receipt wording and validation cover exact, on-time payment; errors cover partial/late/pre-issue. | `@claim:receipt-validation` |
| F-1-28–35 | Rewrote README in plain language and retained only tested calculator, currency, offline, import/export statements. | `@claim:payment-card`, `@claim:currencies`, `@claim:offline-reload`, `@claim:exports` |
| F-1-36–37 | Removed $19 and hosted-checkout claims until the billing product is enabled. | live `/`; link crawl |
| F-1-38 | Uses “calculator” consistently for the limitation. | copy audit |
| F-1-39–40 | README gives the actual clean install/test/build commands and `dist` output. | clean-clone `npm test`; `dist/index.html` |
| F-1-41–45 | Privacy copy is limited to normal calculator flow; request logging, local exports, offline reload and source scan are tested. | `@claim:browser-privacy`, `@claim:exports`, `@claim:offline-reload` |
| F-1-46–67 | Deleted/replaced every listed slogan, metaphor, jargon term, vague action, and inconsistent storage term. | `.factory/copy-audit.md`; live `/` |
| F-1-68 | Added canonical, OG/Twitter metadata, 1200×630 product share image, and Apple touch icon. | metadata inspection; live `/privacy/`, `/terms/` |
| F-1-69 | Added focusable section headings and polite route announcement for in-page navigation. | browser accessibility test |
| F-1-70 | Added consistent wordmark/header navigation and full footer on home and legal routes. | live route checks |
| F-1-71 | Labels Sociobot destination as external. | link accessibility inspection |
| F-1-72 | Added CSP, Permissions-Policy, nosniff, and referrer headers in SWA config. | live header check |
| F-1-73 | Configured manifest MIME type. | live `HEAD /manifest.webmanifest` |
| F-1-74 | Deployment config now keeps HTML/SW behavior separate from static assets; platform cache policy checked live. | live asset headers |
| F-1-75 | Replaced nested result `<aside>` with labelled task `<section>`. | axe in browser test |
| F-1-76 | Legal H1s are `Privacy policy` and `Terms of use`. | live legal routes |
| F-1-77 | Added named three-step How it works before limitations and paid section. | live `/` |
| F-1-78 | Status stays Online until controlled, Ready offline only when controlled, and reports setup failure. | `@claim:offline-reload`; browser check |
| F-1-79 | Storage failure tells the user what happened and what to do. | source/browser error path |
| F-1-80 | Import failures now give one safe accepted-format instruction. | source/browser error path |

No finding is deferred. The unavailable Plus checkout is not a pending product promise: its dead CTA, price, and hosted-checkout claims were removed until a billing work order enables it.
