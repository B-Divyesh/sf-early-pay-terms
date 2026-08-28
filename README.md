# Early Pay Terms

Early Pay Terms is a local-first invoice terms calculator for small B2B suppliers. It turns an agreed early-payment discount into an exact payable amount, deadline, post-deadline balance, printable payment card, and paid-on-time receipt without becoming an invoicing or accounting system.

Live site: https://early-pay-terms.sociobot.in

## What it does

- Calculates with integer minor units for reproducible currency rounding.
- Supports discounts on the whole invoice, net plus proportional tax, or net with tax fixed.
- Supports EUR, USD, GBP, CHF, INR, JPY, and BHD precision, including optional 0.05 cash rounding.
- Generates a clear printable/PDF payment-terms attachment.
- Keeps the working draft in IndexedDB and works after the first load without a network.
- Exports/imports local data as JSON and exports saved calculations as CSV.
- Offers a $19 one-time Plus license for saved versions, reusable templates, and exact paid-on-time receipts. Checkout and verification use Sociobot’s hosted billing API; no payment provider is embedded here.

The operator must choose and verify the correct tax treatment. This project is a calculation utility, not legal, tax, or accounting advice.

## Run locally

Requirements: Node.js 20+ and npm.

```sh
npm ci
npm run dev
```

Open the local URL printed by Vite. Local development uses the Sociobot pilot billing endpoint; production hosts use the live endpoint.

## Test and build

```sh
npm test
npm run build
```

`npm test` runs TypeScript checks, unit tests, a production build, and Playwright tests in desktop Chromium and a 390px mobile viewport. The exact deployment command is `npm run build`; static output lands in `dist/` with `dist/index.html` at its root.

To inspect only one layer:

```sh
npm run test:unit
npm run test:e2e
npm run preview
```

Playwright 1.58.2 is pinned. Install its browser with `npx playwright install chromium` if it is not already available.

## Data and privacy

Invoice data never leaves the browser. IndexedDB stores drafts, versions, and templates; localStorage stores only the optional license and its cached verification result. JSON/CSV exports are generated locally. See the in-product [privacy policy](https://early-pay-terms.sociobot.in/privacy/) and [terms](https://early-pay-terms.sociobot.in/terms/).

The service worker precaches the application shell and uses network-first navigation with cached fallback. No analytics, trackers, remote fonts, or third-party runtime scripts are included.

## Product references

- [Research brief](.factory/brief.json)
- [Visual system and asset provenance](.factory/design.md)
- [Build handoff](.factory/handoff.md)

## License

MIT — see [LICENSE](LICENSE).
