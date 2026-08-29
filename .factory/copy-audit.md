# Copy audit — perfection loop round 3

Audited 29 August 2026 with `Intl.Segmenter` word boundaries. Hyphenated compounds are treated as one phrase for editorial review. No sentence exceeds 22 words. No visitor-facing sentence uses a banned marketing word. Every reliance statement maps to `.factory/claims.json`.

## First screen

| Words | Sentence |
| ---: | --- |
| 5 | Calculate early-payment invoice terms. |
| 14 | For small B2B suppliers, calculate the discounted amount, deadline, and balance after the deadline. |
| 8 | See a saved supplier invoice and payment card. |
| 6 | Invoice figures stay in this browser. |
| 6 | Works offline after the first visit. |
| 9 | Use the calculator and export data without a license. |

Primary action: **Try it with sample data**. In demo mode it becomes **View sample payment card** because the sample summary is already visible.

## Landing and product sentences

| Words | Sentence |
| ---: | --- |
| 13 | The payment card repeats the entered amounts, dates, discount rule, and rounding choice. |
| 13 | You choose the tax rule; the calculator does not choose one by location. |
| 7 | Enter the figures printed on your invoice. |
| 5 | Do not include thousands separators. |
| 6 | Apply the rate to net + tax. |
| 9 | Reduce the net amount and tax by the rate. |
| 8 | Discount net and leave the entered tax unchanged. |
| 9 | For example: Include the invoice reference with your transfer. |
| 9 | Enter the net amount to calculate the discounted payment. |
| 18 | Print this page or choose “Save as PDF” in your print dialog, then attach it to the invoice. |
| 8 | Add the net amount, tax, reference, and dates. |
| 8 | Select where the discount applies and its rounding. |
| 9 | Print or save the calculated card as a PDF. |
| 9 | Tax and discount rules vary by contract and region. |
| 5 | This calculator applies your choices. |
| 11 | It does not decide what is legal or create accounting entries. |
| 7 | Check the payment card before sending it. |
| 11 | Your browser keeps the current calculation when site storage is available. |
| 4 | No saved versions yet. |
| 8 | Save a version to preserve the payment card. |
| 6 | Export does not require a license. |
| 5 | JSON keeps the saved fields. |
| 4 | CSV lists saved amounts. |
| 15 | Enter a Plus license token to restore saved versions, templates, and paid-on-time receipts. |
| 7 | Early-payment terms for small B2B suppliers. |
| 6 | Invoice figures stay in your browser. |
| 7 | Instrument illustration generated for this product. |
| 6 | Demo — sample data, nothing is saved. |
| 8 | The populated calculator and saved version are below. |
| 13 | This receipt is for the full discounted payment received by the deadline. |
| 8 | Review partial, overpaid, or late payments manually. |
| 9 | This receipt records the figures entered by the supplier. |
| 10 | It is not proof of bank settlement or tax advice. |

Actions and headings were checked separately. They name their result: **Show payment card**, **Print payment card**, **Copy payment terms**, **Save this version**, **Export JSON**, **Export CSV**, **Import JSON**, **Clear local data**, **Restore an existing Plus license**, **Reset demo**, and **Start for real**.

Error and status copy was also checked. Each state says what happened and what to do next. The longest error is 19 words, and no state uses a banned word.

## README sentences

| Words | Sentence |
| ---: | --- |
| 9 | Calculate early-payment invoice terms for small B2B suppliers. |
| 12 | The calculator shows the discounted amount, deadline, later balance, and payment card. |
| 15 | Use it to calculate terms, not to issue invoices, collect money, or make accounting entries. |
| 8 | Try the isolated sample at `https://early-pay-terms.sociobot.in/?demo=1` or `/demo`. |
| 12 | Calculates payment terms in EUR, USD, GBP, CHF, INR, JPY, and BHD. |
| 15 | Lets you apply a discount to the full invoice, net plus tax, or net only. |
| 16 | Creates a payment card that opens the browser print flow for printing or saving as PDF. |
| 11 | Saves the current calculation in this browser when storage is available. |
| 10 | Exports and imports JSON, and exports saved versions as CSV. |
| 9 | Keeps the app available offline after the first visit. |
| 15 | A verified existing Plus license enables saved versions, reusable templates, and paid-on-time receipts. |
| 9 | You choose and check the tax and contract rule. |
| 9 | This calculator is not legal, tax, or accounting advice. |
| 16 | `/demo` (or `?demo=1`) loads Harbor Paper Co.’s sample invoice in a separate `demo:early-pay-terms` browser database. |
| 7 | Reset demo clears only that sample data. |
| 10 | Start for real removes it before opening the real calculator. |
| 9 | Normal calculator use keeps invoice figures in the browser. |
| 7 | JSON and CSV exports are made locally. |
| 14 | The site includes no analytics, advertising pixels, remote fonts, or third-party runtime scripts. |
| 12 | License restoration sends only the entered token to Sociobot’s product verification endpoint. |
| 10 | The restore form accepts valid licenses and rejects invalid ones. |
| 11 | It reports connection errors and retains a valid result after reload. |
| 6 | See the privacy policy and terms. |
| 6 | Node.js 20+ and npm are required. |
| 18 | `npm test` type-checks, runs calculator tests, builds `dist/`, and runs Playwright in desktop and 390px mobile Chromium. |
| 13 | Each visitor-facing claim has one tagged Playwright test listed in `.factory/claims.json`. |
| 10 | `npm run build` produces static deployment output at `dist/index.html`. |
| 3 | MIT — see LICENSE. |

The privacy and terms pages were scanned by the same sentence counter. Their longest sentence is 20 words. Neither page contains a banned word or unexplained product term.

## Terminology

| Concept | One term used |
| --- | --- |
| Entered data | invoice figures |
| Unsaved work | current calculation |
| Saved snapshot | saved version |
| Customer-facing output | payment card |
| Sample area | demo |
| Calculation choice | discount rule |
| Paid feature set | Plus |

The unavailable sales tier and disabled paid actions are absent. Existing-license restoration is presented only as a utility for a token the visitor already has.
