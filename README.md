# Early Pay Terms

Calculate early-payment invoice terms for small B2B suppliers. The calculator shows the discounted amount, deadline, later balance, and payment card. Use it to calculate terms, not to issue invoices, collect money, or make accounting entries.

Try the isolated sample at https://early-pay-terms.sociobot.in/?demo=1 or `/demo`.

## What it does

- Calculates payment terms in EUR, USD, GBP, CHF, INR, JPY, and BHD.
- Lets you apply a discount to the full invoice, net plus tax, or net only.
- Creates a payment card that opens the browser print flow for printing or saving as PDF.
- Saves the current calculation in this browser when storage is available.
- Exports and imports JSON, and exports saved calculations as CSV.
- Keeps the app available offline after the first visit.

You choose and check the tax and contract rule. This calculator is not legal, tax, or accounting advice.

## Demo and privacy

`/demo` (or `?demo=1`) loads Harbor Paper Co.’s sample invoice in a separate `demo:early-pay-terms` browser database. Reset demo clears only that sample data. Start for real removes it before opening the real calculator.

Normal calculator use keeps invoice figures in the browser. JSON and CSV exports are made locally. The site includes no analytics, advertising pixels, remote fonts, or third-party runtime scripts. License restoration sends only the entered token to Sociobot’s product verification endpoint. See the [privacy policy](https://early-pay-terms.sociobot.in/privacy/) and [terms](https://early-pay-terms.sociobot.in/terms/).

## Run locally

Node.js 20+ and npm are required.

```sh
npm ci --include=dev
npm run dev
```

## Test and build

```sh
npm test
npm run build
```

`npm test` type-checks, runs calculator tests, builds `dist/`, and runs Playwright in desktop and 390px mobile Chromium. Each visitor-facing claim has one tagged Playwright test listed in `.factory/claims.json`.

```sh
npm run test:unit
npm run test:e2e
npm run preview
```

`npm run build` produces static deployment output at `dist/index.html`.

## References

- [Research brief](.factory/brief.json)
- [Design system and asset provenance](.factory/design.md)
- [Demo sandbox](.factory/demo.md)
- [Claim registry](.factory/claims.json)

## License

MIT — see [LICENSE](LICENSE).
