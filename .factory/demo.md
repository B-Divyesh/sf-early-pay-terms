# Demo sandbox

Open `https://early-pay-terms.sociobot.in/demo` or `/?demo=1` for a one-click sample.

The sample is Harbor Paper Co.’s EUR 1,500.00 invoice HARBOR-1042 for Moss & Field Studio. It includes a 2% whole-invoice early-payment discount, dates, supplier/customer names, a payment note, calculated card, and sample saved version state.

Demo data is stored only in the IndexedDB database `demo:early-pay-terms`. Production data uses `early-pay-terms`; the demo never opens or reads it. **Reset demo** deletes only the demo database and reloads the sample. **Start for real** deletes the demo database before opening `/`.
