# Demo sandbox

Open `https://early-pay-terms.sociobot.in/?demo=1` or `/demo` for a one-click sample.

The first screen shows Harbor Paper Co.’s EUR 1,500.00 invoice HARBOR-1042 for Moss & Field Studio. It shows the EUR 1,470.00 early amount, 11 August deadline, later balance, and a direct payment-card action. The populated calculator, payment note, card, and saved version follow below.

Demo data is stored only in the IndexedDB database `demo:early-pay-terms`. Demo license fixtures use `demo:sb_license:*` keys. Production uses `early-pay-terms` and unprefixed license keys; the demo never opens or reads them. **Reset demo** clears every demo store and license key, waits for completion, reloads `/demo`, and seeds the sample. **Start for real** clears the demo namespace before opening `/`; production data remains unchanged.
