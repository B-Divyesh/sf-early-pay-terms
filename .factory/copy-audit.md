# Copy audit — perfection loop round 2

Audited 28 August 2026 with `Intl.Segmenter` word boundaries. Hyphenated compounds count as one word. No sentence exceeds 22 words. No visitor-facing sentence uses a banned marketing word. Labels and buttons were also reviewed; every action names its result.

## First screen

| Words | Sentence |
| ---: | --- |
| 5 | Calculate exact early-payment invoice terms. |
| 14 | For small B2B suppliers, calculate the discounted amount, deadline, and balance after the deadline. |
| 8 | See a saved supplier invoice and payment card. |
| 6 | Invoice figures stay in this browser. |
| 6 | Works offline after the first visit. |
| 8 | The calculator and data export work without Plus. |

Primary action: **Try it with sample data**. In demo mode it becomes **View sample payment card** because the sample summary is already visible.

## Landing and product sentences

| Words | Sentence |
| ---: | --- |
| 13 | The payment card repeats the entered amounts, dates, discount rule, and rounding choice. |
| 15 | You choose the tax rule; the calculator does not choose one by location. |
| 7 | Enter the figures printed on your invoice. |
| 5 | Do not include thousands separators. |
| 6 | Apply the rate to net + tax. |
| 9 | Reduce the net amount and tax by the rate. |
| 8 | Discount net and leave the entered tax unchanged. |
| 9 | Enter the net amount to calculate the discounted payment. |
| 18 | Print this page or choose “Save as PDF” in your print dialog, then attach it to the invoice. |
| 8 | Add the net amount, tax, reference, and dates. |
| 8 | Select where the discount applies and its rounding. |
| 9 | Print or save the calculated card as a PDF. |
| 9 | Tax and discount rules vary by contract and region. |
| 5 | This calculator applies your choices. |
| 12 | It does not decide what is legal or create accounting entries. |
| 8 | Check the payment card before sending it. |
| 11 | Your browser keeps the current calculation when site storage is available. |
| 8 | Plus adds templates, saved versions, and paid-on-time receipts. |
| 4 | No saved versions yet. |
| 8 | Save a calculation to preserve the payment card. |
| 11 | The calculator, payment card, and data export work without Plus. |
| 9 | Plus is not available to buy in this release. |
| 8 | Existing Plus license holders can restore access below. |
| 5 | Export does not require Plus. |
| 5 | JSON keeps the saved fields. |
| 4 | CSV lists saved amounts. |
| 6 | Early-payment terms for small B2B suppliers. |
| 6 | Invoice figures stay in your browser. |
| 7 | Instrument illustration generated for this product. |
| 6 | Demo — sample data, nothing is saved. |
| 13 | This receipt is for the full discounted payment received by the deadline. |
| 8 | Review partial, overpaid, or late payments manually. |
| 9 | This receipt records the figures entered by the supplier. |
| 10 | It is not proof of bank settlement or tax advice. |

## README sentences

| Words | Sentence |
| ---: | --- |
| 8 | Calculate early-payment invoice terms for small B2B suppliers. |
| 12 | The calculator shows the discounted amount, deadline, later balance, and payment card. |
| 16 | Use it to calculate terms, not to issue invoices, collect money, or make accounting entries. |
| 12 | Calculates payment terms in EUR, USD, GBP, CHF, INR, JPY, and BHD. |
| 15 | Lets you apply a discount to the full invoice, net plus tax, or net only. |
| 14 | Creates a payment card that opens the browser print flow for printing or saving as PDF. |
| 11 | Saves the current calculation in this browser when storage is available. |
| 11 | Exports and imports JSON, and exports saved calculations as CSV. |
| 9 | Keeps the app available offline after the first visit. |
| 9 | You choose and check the tax and contract rule. |
| 10 | This calculator is not legal, tax, or accounting advice. |
| 8 | Reset demo clears only that sample data. |
| 10 | Start for real removes it before opening the real calculator. |
| 10 | Normal calculator use keeps invoice figures in the browser. |
| 8 | JSON and CSV exports are made locally. |
| 11 | The site includes no analytics, advertising pixels, remote fonts, or third-party runtime scripts. |
| 11 | License restoration sends only the entered token to Sociobot’s product verification endpoint. |

Every reliance statement above maps to `.factory/claims.json`. Setup, test, build, and license-reference sentences describe repository commands or links and were checked directly.

## Terminology

| Concept | One term used |
| --- | --- |
| Entered data | invoice figures |
| Unsaved work | current calculation |
| Saved snapshot | saved version |
| Output | payment card |
| Sample area | demo |
| Calculation choice | discount rule |
| Paid feature set | Plus |
