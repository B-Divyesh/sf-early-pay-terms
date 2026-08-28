import './style.css';
import { calculate, CalculationError, formatMoney, minorToDecimal, parseMinor, serializeResult } from './calculator';
import { db } from './db';
import { captureReturnedLicense, checkoutUrl, isOptimisticallyUnlocked, storedToken, verifyLicense } from './license';
import { CURRENCIES, emptyInput, type CalculationInput, type CalculationResult, type DiscountMethod, type RoundingMode, type SavedCalculation, type SavedTemplate } from './types';

const $ = <T extends Element>(selector: string) => document.querySelector<T>(selector)!;
const demoMode = document.documentElement.dataset.demo === 'true';
const demoInput: CalculationInput = {
  invoiceRef: 'HARBOR-1042', supplierName: 'Harbor Paper Co.', customerName: 'Moss & Field Studio', currency: 'EUR',
  netAmount: '1250.00', taxAmount: '250.00', discountPercent: '2', method: 'gross', rounding: 'currency',
  issueDate: '2026-08-01', discountDate: '2026-08-11', dueDate: '2026-08-31', note: 'Include invoice HARBOR-1042 with your transfer.'
};
const form = $('#terms-form') as HTMLFormElement;
form.inert = true;
form.setAttribute('aria-busy', 'true');
let currentInput: CalculationInput = emptyInput();
let currentResult: CalculationResult | null = null;
let unlocked = isOptimisticallyUnlocked();
let historyRecords: SavedCalculation[] = [];
let templates: SavedTemplate[] = [];
let deletedRecord: SavedCalculation | null = null;
let undoTimer = 0;
let draftTimer = 0;

function inputElement(name: keyof CalculationInput): HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement {
  return form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;
}

function readInput(): CalculationInput {
  const method = (new FormData(form).get('method') || 'gross') as DiscountMethod;
  return {
    invoiceRef: inputElement('invoiceRef').value.trim(),
    supplierName: inputElement('supplierName').value.trim(),
    customerName: inputElement('customerName').value.trim(),
    currency: inputElement('currency').value as CalculationInput['currency'],
    netAmount: inputElement('netAmount').value.trim(),
    taxAmount: inputElement('taxAmount').value.trim(),
    discountPercent: inputElement('discountPercent').value.trim(),
    method,
    rounding: inputElement('rounding').value as RoundingMode,
    issueDate: inputElement('issueDate').value,
    discountDate: inputElement('discountDate').value,
    dueDate: inputElement('dueDate').value,
    note: inputElement('note').value.trim()
  };
}

function fillForm(input: CalculationInput): void {
  for (const [name, value] of Object.entries(input)) {
    if (name === 'method') {
      const radio = form.querySelector<HTMLInputElement>(`input[name="method"][value="${value}"]`);
      if (radio) radio.checked = true;
    } else {
      const control = form.elements.namedItem(name) as HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null;
      if (control) control.value = String(value);
    }
  }
}

function humanDate(value: string): string {
  if (!value) return '—';
  return new Intl.DateTimeFormat('en', { day: 'numeric', month: 'short', year: 'numeric', timeZone: 'UTC' }).format(new Date(`${value}T00:00:00Z`));
}

function setError(message = ''): void {
  const error = $('#form-error') as HTMLElement;
  error.hidden = !message; error.textContent = message;
}

function showToast(message: string, action?: { label: string; run: () => void }): void {
  const toast = $('#toast') as HTMLElement;
  const button = $('#toast-action') as HTMLButtonElement;
  $('#toast-text').textContent = message;
  button.hidden = !action; button.textContent = action?.label || '';
  button.onclick = action?.run || null;
  toast.hidden = false;
  window.setTimeout(() => { if (!toast.matches(':hover')) toast.hidden = true; }, 5000);
}

function updateDocument(input: CalculationInput, result: CalculationResult): void {
  $('#payment-card-section').removeAttribute('hidden');
  $('#card-invoice').textContent = input.invoiceRef ? `Invoice ${input.invoiceRef}` : 'Invoice payment terms';
  $('#card-supplier').textContent = input.supplierName ? `From ${input.supplierName}` : '';
  $('#card-customer').textContent = input.customerName ? `For ${input.customerName}` : '';
  $('#card-early-amount').textContent = formatMoney(result.earlyPayMinor, input.currency);
  $('#card-discount-date').textContent = humanDate(input.discountDate);
  $('#card-total').textContent = formatMoney(result.invoiceMinor, input.currency);
  $('#card-net').textContent = formatMoney(result.netMinor, input.currency);
  $('#card-tax').textContent = formatMoney(result.taxMinor, input.currency);
  $('#card-discount').textContent = `−${formatMoney(result.discountMinor, input.currency)} (${input.discountPercent}%)`;
  $('#card-regular').textContent = formatMoney(result.regularPayMinor, input.currency);
  $('#card-due-date').textContent = humanDate(input.dueDate);
  const note = $('#card-note'); note.textContent = input.note; note.toggleAttribute('hidden', !input.note);
  $('#card-method').textContent = `${result.formula} Discount rounded ${roundingLabel(input)}. Full discounted amount must be received by the deadline. Verify regional tax treatment before sending.`;
  $('#card-version').textContent = 'Unsaved calculation · engine v1';
}

function roundingLabel(input: CalculationInput): string {
  if (input.rounding === 'cash-005') return 'to the nearest 0.05';
  if (input.rounding === 'whole') return 'to the nearest whole unit';
  return `to the nearest ${CURRENCIES[input.currency].digits === 0 ? 'currency unit' : 'minor currency unit'}`;
}

function renderCalculation(showErrors = false): boolean {
  currentInput = readInput();
  clearTimeout(draftTimer);
  draftTimer = window.setTimeout(() => db.saveDraft(currentInput).catch(() => showToast('Your browser blocked local storage. Export JSON now or allow site storage, then try again.')), 250);
  if (!currentInput.netAmount.trim()) {
    currentResult = null; $('#empty-result').removeAttribute('hidden'); $('#calculation-result').setAttribute('hidden', '');
    $('#payment-card-section').setAttribute('hidden', ''); setError(''); return false;
  }
  try {
    currentResult = calculate(currentInput);
    setError('');
    $('#empty-result').setAttribute('hidden', ''); $('#calculation-result').removeAttribute('hidden');
    $('#readout-date').textContent = humanDate(currentInput.discountDate);
    $('#early-amount').textContent = formatMoney(currentResult.earlyPayMinor, currentInput.currency);
    $('#discount-amount').textContent = formatMoney(currentResult.discountMinor, currentInput.currency);
    $('#invoice-total').textContent = formatMoney(currentResult.invoiceMinor, currentInput.currency);
    $('#discount-base').textContent = formatMoney(currentResult.discountBaseMinor, currentInput.currency);
    $('#tax-reduction').textContent = formatMoney(currentResult.taxReductionMinor, currentInput.currency);
    $('#tax-reduction-row').toggleAttribute('hidden', currentInput.method !== 'net-proportional');
    $('#regular-amount').textContent = formatMoney(currentResult.regularPayMinor, currentInput.currency);
    $('#formula').textContent = `${currentResult.formula} Rounded ${roundingLabel(currentInput)}.`;
    updateDocument(currentInput, currentResult);
    return true;
  } catch (error) {
    currentResult = null; $('#empty-result').removeAttribute('hidden'); $('#calculation-result').setAttribute('hidden', '');
    $('#payment-card-section').setAttribute('hidden', '');
    if (showErrors) setError(error instanceof CalculationError ? error.message : 'Check the entered figures and try again.');
    return false;
  }
}

function requirePlus(): boolean {
  if (unlocked) return true;
  $('#unlock').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth' });
  showToast('Plus is needed for saved versions, templates, and receipts.');
  return false;
}

function updateLicenseUI(message?: string): void {
  document.body.classList.toggle('is-unlocked', unlocked);
  const state = $('#license-state');
  state.innerHTML = unlocked ? '<span class="status-lamp"></span> Plus is active on this device' : '<span class="status-lamp"></span> Free calculator active';
  if (message) showToast(message);
  const unlockNav = document.querySelector<HTMLElement>('#unlock-nav');
  if (unlockNav) unlockNav.textContent = unlocked ? 'Plus active' : 'Unlock';
}

async function saveVersion(): Promise<void> {
  if (!requirePlus() || !renderCalculation(true) || !currentResult) return;
  const related = historyRecords.filter((item) => item.input.invoiceRef === currentInput.invoiceRef);
  const version = Math.max(0, ...related.map((item) => item.version)) + 1;
  const record: SavedCalculation = { id: crypto.randomUUID(), version, createdAt: new Date().toISOString(), input: currentInput, result: serializeResult(currentResult) };
  await db.saveHistory(record); historyRecords.unshift(record); renderHistory();
  $('#card-version').textContent = `Calculation v${version} · ${new Date(record.createdAt).toLocaleString()}`;
  showToast(`Saved version ${version}${currentInput.invoiceRef ? ` of ${currentInput.invoiceRef}` : ''}.`);
}

function renderHistory(): void {
  historyRecords.sort((a, b) => b.createdAt.localeCompare(a.createdAt));
  $('#history-empty').toggleAttribute('hidden', historyRecords.length > 0);
  const list = $('#history-list');
  list.innerHTML = historyRecords.map((record) => {
    const result = record.result;
    return `<article data-id="${record.id}"><div><p>${escapeHtml(record.input.invoiceRef || 'Unreferenced invoice')} <span>v${record.version}</span></p><strong>${formatMoney(BigInt(result.earlyPayMinor), record.input.currency)}</strong><small>Pay by ${humanDate(record.input.discountDate)} · saved ${new Date(record.createdAt).toLocaleDateString()}</small></div><div><button type="button" data-action="restore">Restore</button><button type="button" data-action="delete" aria-label="Delete version ${record.version}">Delete</button></div></article>`;
  }).join('');
}

function renderTemplates(): void {
  const list = $('#template-list');
  list.innerHTML = templates.length ? `<h3>Saved templates</h3>${templates.map((template) => `<button type="button" data-id="${template.id}"><span>${escapeHtml(template.name)}</span><small>${escapeHtml(String(template.input.discountPercent || ''))}% · ${methodShort(template.input.method as DiscountMethod)}</small></button>`).join('')}` : '';
}

function methodShort(method: DiscountMethod): string {
  return method === 'gross' ? 'whole invoice' : method === 'net-proportional' ? 'net + proportional tax' : 'net only';
}

function escapeHtml(value: string): string {
  const el = document.createElement('span'); el.textContent = value; return el.innerHTML;
}

function printMode(mode: 'card' | 'receipt'): void {
  document.body.dataset.print = mode; window.print();
  window.setTimeout(() => delete document.body.dataset.print, 500);
}

function download(name: string, body: string, type: string): void {
  const url = URL.createObjectURL(new Blob([body], { type }));
  const link = document.createElement('a'); link.href = url; link.download = name; link.click();
  URL.revokeObjectURL(url);
}

async function exportData(kind: 'json' | 'csv'): Promise<void> {
  const draft = readInput();
  const payload = { schema: 'early-pay-terms/v1', exportedAt: new Date().toISOString(), draft, history: historyRecords, templates };
  const date = new Date().toISOString().slice(0, 10);
  if (kind === 'json') download(`early-pay-terms-${date}.json`, JSON.stringify(payload, null, 2), 'application/json');
  else {
    const rows = [['invoice_reference', 'version', 'currency', 'invoice_total_minor', 'discount_minor', 'early_pay_minor', 'discount_deadline', 'due_date', 'saved_at'], ...historyRecords.map((r) => [r.input.invoiceRef, String(r.version), r.input.currency, r.result.invoiceMinor, r.result.discountMinor, r.result.earlyPayMinor, r.input.discountDate, r.input.dueDate, r.createdAt])];
    download(`early-pay-terms-${date}.csv`, rows.map((row) => row.map((cell) => `"${String(cell).replaceAll('"', '""')}"`).join(',')).join('\n'), 'text/csv');
  }
  showToast(`Exported ${kind.toUpperCase()} to your downloads.`);
}

function copyWording(): void {
  if (!currentResult) return;
  const ref = currentInput.invoiceRef ? ` for invoice ${currentInput.invoiceRef}` : '';
  const text = `Early-payment terms${ref}: Pay exactly ${formatMoney(currentResult.earlyPayMinor, currentInput.currency)} by ${humanDate(currentInput.discountDate)} to receive a ${currentInput.discountPercent}% discount of ${formatMoney(currentResult.discountMinor, currentInput.currency)}. After that deadline, ${formatMoney(currentResult.regularPayMinor, currentInput.currency)} is due by ${humanDate(currentInput.dueDate)}. Full discounted amount must be received by the deadline.`;
  navigator.clipboard.writeText(text).then(() => showToast('Payment wording copied.')).catch(() => showToast('Copy was blocked. Select the text on the payment card instead.'));
}

function openReceipt(): void {
  if (!requirePlus() || !renderCalculation(true) || !currentResult) return;
  const dialog = $('#receipt-dialog') as HTMLDialogElement;
  ($('#payment-date') as HTMLInputElement).value = currentInput.discountDate;
  ($('#payment-amount') as HTMLInputElement).value = minorToDecimal(currentResult.earlyPayMinor, CURRENCIES[currentInput.currency].digits);
  $('#receipt-form-view').removeAttribute('hidden'); $('#receipt-document').setAttribute('hidden', '');
  dialog.showModal(); window.setTimeout(() => ($('#payment-date') as HTMLInputElement).focus(), 0);
}

async function initialize(): Promise<void> {
  if (demoMode) $('#demo-banner').removeAttribute('hidden');
  fillForm((await db.loadDraft().catch(() => undefined)) || (demoMode ? demoInput : emptyInput()));
  [historyRecords, templates] = await Promise.all([db.getHistory().catch(() => []), db.getTemplates().catch(() => [])]);
  if (demoMode && historyRecords.length === 0) {
    const sampleResult = calculate(demoInput);
    const sample: SavedCalculation = { id: 'demo-harbor-v1', version: 1, createdAt: '2026-08-01T09:00:00.000Z', input: demoInput, result: serializeResult(sampleResult) };
    await db.saveHistory(sample); historyRecords = [sample];
  }
  renderCalculation(); renderHistory(); renderTemplates(); updateLicenseUI();

  const returned = captureReturnedLicense();
  if (returned || storedToken()) {
    verifyLicense(undefined, returned).then((verdict) => {
      unlocked = verdict.valid; updateLicenseUI(verdict.valid ? 'Plus license verified.' : 'License no longer active. The free calculator is still available.');
    }).catch((error: Error) => showToast(error.message));
  }

  const buy = $('#buy-link') as HTMLAnchorElement | null;
  if (buy) buy.href = checkoutUrl();
  setupServiceWorker(); updateNetworkStatus();
  form.inert = false;
  form.removeAttribute('aria-busy');
  form.dataset.ready = 'true';
}

form.addEventListener('input', () => renderCalculation(false));
form.addEventListener('change', () => renderCalculation(false));
form.addEventListener('submit', (event) => {
  event.preventDefault();
  if (renderCalculation(true)) { $('#payment-card-section').scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' }); announceAndFocus('card-title'); }
});
$('#print-card').addEventListener('click', () => printMode('card'));
$('#copy-terms').addEventListener('click', copyWording);
$('#save-version').addEventListener('click', () => void saveVersion());
$('#create-receipt').addEventListener('click', openReceipt);
$('#save-template').addEventListener('click', async () => {
  if (!requirePlus()) return;
  const name = prompt('Name this terms template', `${currentInput.discountPercent}% · ${methodShort(currentInput.method)}`)?.trim();
  if (!name) return;
  const { netAmount: _net, taxAmount: _tax, invoiceRef: _ref, customerName: _customer, ...reusable } = readInput();
  const template: SavedTemplate = { id: crypto.randomUUID(), name, createdAt: new Date().toISOString(), input: reusable };
  await db.saveTemplate(template); templates.push(template); renderTemplates(); showToast(`Saved template “${name}”.`);
});

$('#history-list').addEventListener('click', async (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button'); const article = button?.closest<HTMLElement>('article');
  if (!button || !article) return; const record = historyRecords.find((item) => item.id === article.dataset.id); if (!record) return;
  if (button.dataset.action === 'restore') { fillForm(record.input); renderCalculation(true); $('#card-version').textContent = `Restored v${record.version} · ${new Date(record.createdAt).toLocaleString()}`; $('#workbench').scrollIntoView(); showToast(`Restored version ${record.version}. Saving again will create a new version.`); }
  if (button.dataset.action === 'delete') {
    await db.deleteHistory(record.id); historyRecords = historyRecords.filter((item) => item.id !== record.id); deletedRecord = record; renderHistory(); clearTimeout(undoTimer);
    showToast(`Deleted version ${record.version}.`, { label: 'Undo', run: () => { if (!deletedRecord) return; void db.saveHistory(deletedRecord); historyRecords.push(deletedRecord); deletedRecord = null; renderHistory(); } });
    undoTimer = window.setTimeout(() => { deletedRecord = null; }, 5000);
  }
});

$('#template-list').addEventListener('click', (event) => {
  const button = (event.target as Element).closest<HTMLButtonElement>('button[data-id]'); const template = templates.find((item) => item.id === button?.dataset.id);
  if (!template) return; fillForm({ ...readInput(), ...template.input }); renderCalculation(); $('#workbench').scrollIntoView(); showToast(`Applied template “${template.name}”.`);
});

$('#receipt-form').addEventListener('submit', (event) => {
  event.preventDefault(); if (!currentResult) return;
  const date = ($('#payment-date') as HTMLInputElement).value; const amountText = ($('#payment-amount') as HTMLInputElement).value;
  const error = $('#receipt-error');
  try {
    const amount = parseMinor(amountText, CURRENCIES[currentInput.currency].digits, 'Payment amount');
    if (date > currentInput.discountDate) throw new CalculationError('This payment is after the discount deadline. Review it manually instead of issuing an on-time receipt.');
    if (date < currentInput.issueDate) throw new CalculationError('Payment date cannot be before the invoice issue date.');
    if (amount !== currentResult.earlyPayMinor) throw new CalculationError(`The received amount must exactly match the early-payment amount of ${formatMoney(currentResult.earlyPayMinor, currentInput.currency)}. Review partial payments or overpayments manually.`);
    error.setAttribute('hidden', '');
    $('#receipt-invoice').textContent = currentInput.invoiceRef ? `Invoice ${currentInput.invoiceRef}` : 'Invoice payment';
    $('#receipt-supplier').textContent = currentInput.supplierName ? `From ${currentInput.supplierName}` : '';
    $('#receipt-customer').textContent = currentInput.customerName ? `For ${currentInput.customerName}` : '';
    $('#receipt-paid').textContent = formatMoney(amount, currentInput.currency); $('#receipt-date').textContent = humanDate(date);
    $('#receipt-discount').textContent = formatMoney(currentResult.discountMinor, currentInput.currency); $('#receipt-remaining').textContent = formatMoney(0n, currentInput.currency);
    $('#receipt-version').textContent = $('#card-version').textContent || 'Current calculation';
    $('#receipt-form-view').setAttribute('hidden', ''); $('#receipt-document').removeAttribute('hidden');
  } catch (caught) { error.textContent = caught instanceof Error ? caught.message : 'Check the payment details.'; error.removeAttribute('hidden'); }
});
$('#print-receipt').addEventListener('click', () => printMode('receipt'));

$('#license-form').addEventListener('submit', async (event) => {
  event.preventDefault(); const token = ($('#license-input') as HTMLInputElement).value.trim(); if (!token) return;
  const button = (event.currentTarget as HTMLFormElement).querySelector('button')!; button.textContent = 'Checking…'; button.setAttribute('disabled', '');
  try { const verdict = await verifyLicense(token, true); unlocked = verdict.valid; updateLicenseUI(verdict.valid ? 'Plus restored on this device.' : 'That license is not active for this product.'); }
  catch (error) { showToast((error as Error).message); } finally { button.textContent = 'Verify license'; button.removeAttribute('disabled'); }
});

$('#export-json').addEventListener('click', () => void exportData('json')); $('#export-csv').addEventListener('click', () => void exportData('csv'));
$('#import-json').addEventListener('change', async (event) => {
  const file = (event.target as HTMLInputElement).files?.[0]; if (!file) return;
  try {
    const data = JSON.parse(await file.text()) as { schema?: string; draft?: CalculationInput; history?: SavedCalculation[]; templates?: SavedTemplate[] };
    if (data.schema !== 'early-pay-terms/v1') throw new Error('This is not an Early Pay Terms v1 export.');
    if (data.draft) { fillForm(data.draft); await db.saveDraft(data.draft); }
    for (const record of data.history || []) await db.saveHistory(record);
    for (const template of data.templates || []) await db.saveTemplate(template);
    [historyRecords, templates] = await Promise.all([db.getHistory(), db.getTemplates()]); renderCalculation(); renderHistory(); renderTemplates(); showToast('Imported local data successfully.');
  } catch { showToast('This file is not an Early Pay Terms JSON export. Choose a JSON file exported by this app.'); }
  (event.target as HTMLInputElement).value = '';
});
$('#clear-data').addEventListener('click', async () => {
  if (!confirm('Clear the current draft, all saved versions, and all templates from this device? Export first if you need a backup.')) return;
  await db.clearAll(); historyRecords = []; templates = []; fillForm(emptyInput()); renderCalculation(); renderHistory(); renderTemplates(); showToast('Local invoice data cleared. Your license was not removed.');
});

async function updateNetworkStatus(): Promise<void> {
  setNetworkStatus(navigator.onLine);
}
function setNetworkStatus(online: boolean): void {
  const status = $('#network-status'); status.classList.toggle('offline', !online);
  status.querySelector('span')!.textContent = online ? (navigator.serviceWorker?.controller ? 'Ready offline' : 'Online') : 'Working offline';
}
addEventListener('online', () => void updateNetworkStatus()); addEventListener('offline', () => setNetworkStatus(false));

function setupServiceWorker(): void {
  if (!('serviceWorker' in navigator)) { $('#network-status span')!.textContent = 'Offline setup failed'; return; }
  navigator.serviceWorker.register('/sw.js').then((registration) => {
    const wasAlreadyControlled = Boolean(navigator.serviceWorker.controller);
    let refreshing = false;
    navigator.serviceWorker.addEventListener('controllerchange', () => {
      if (refreshing || !wasAlreadyControlled) return; refreshing = true;
      showToast('A fresh version is ready.', { label: 'Reload', run: () => location.reload() });
    });
    registration.update().catch(() => undefined);
  }).catch(() => { $('#network-status span')!.textContent = 'Offline setup failed'; showToast('Offline setup failed. Check your connection, then reload to try again.'); });
}

function announceAndFocus(id: string): void {
  const heading = document.getElementById(id);
  if (!heading) return;
  heading.setAttribute('tabindex', '-1'); heading.focus({ preventScroll: true });
  const live = document.getElementById('route-announcement'); if (live) live.textContent = heading.textContent || '';
}

document.querySelectorAll<HTMLAnchorElement>('a[href^="#"]').forEach((link) => link.addEventListener('click', () => {
  const id = link.getAttribute('href')?.slice(1); const section = id ? document.getElementById(id) : null;
  const heading = section?.querySelector<HTMLElement>('h2,h1');
  if (heading) window.setTimeout(() => announceAndFocus(heading.id), 250);
}));

document.querySelector<HTMLButtonElement>('#reset-demo')?.addEventListener('click', async () => {
  await db.clearDemo(); location.href = '/demo';
});
document.querySelector<HTMLButtonElement>('#start-real')?.addEventListener('click', async () => {
  await db.clearDemo(); location.href = '/';
});

void initialize();
