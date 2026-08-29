import { appUrl, expect, openApp, test } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

async function waitForDraftValue(page: import('@playwright/test').Page, field: string, value: string): Promise<void> {
  await expect.poll(() => page.evaluate(async (fieldName) => {
    const databaseName = document.documentElement.dataset.demo === 'true' ? 'demo:early-pay-terms' : 'early-pay-terms';
    return new Promise<unknown>((resolve, reject) => {
      const request = indexedDB.open(databaseName, 1);
      request.onerror = () => reject(request.error);
      request.onsuccess = () => {
        const database = request.result; const get = database.transaction('state', 'readonly').objectStore('state').get('draft');
        get.onerror = () => { database.close(); reject(get.error); };
        get.onsuccess = () => { const draft = get.result as Record<string, unknown> | undefined; database.close(); resolve(draft?.[fieldName]); };
      };
    });
  }, field)).toBe(value);
  await expect(page.locator('#terms-form')).toHaveAttribute('data-draft-state', 'saved');
}

async function fillAndWaitForDraft(page: import('@playwright/test').Page, label: string, value: string): Promise<void> {
  await page.getByLabel(label).fill(value);
  const field = await page.getByLabel(label).getAttribute('name');
  if (!field) throw new Error(`No form field name for ${label}`);
  await waitForDraftValue(page, field, value);
}

async function computedContrast(page: import('@playwright/test').Page, foreground: string, background: string): Promise<number> {
  return page.locator(foreground).evaluate((node, backgroundSelector) => {
    const channels = (value: string) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = (value: string) => {
      const [r, g, b] = channels(value).map((channel) => { const n = channel / 255; return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    const [lighter, darker] = [luminance(getComputedStyle(node).color), luminance(getComputedStyle(document.querySelector(backgroundSelector)! as Element).backgroundColor)].sort((a, b) => b - a);
    return (lighter + 0.05) / (darker + 0.05);
  }, background);
}

test('@claim:demo-isolation opens a populated sample and cannot read production storage', async ({ isolated }) => {
  const { newContext } = isolated;
  const context = await newContext(); const rp = await context.newPage();
  await openApp(rp, '/');
  await fillAndWaitForDraft(rp, 'Invoice reference', 'REAL-SAME-CONTEXT');
  await rp.evaluate(() => {
    localStorage.setItem('sb_license:early-pay-terms', 'production-license');
    localStorage.setItem('sb_license_verdict:early-pay-terms', JSON.stringify({ valid: true, checkedAt: Date.now() }));
  });
  const dp = await context.newPage(); await openApp(dp, '/?demo=1');
  await expect(dp.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(dp.locator('#license-state')).toContainText('No Plus license active');
  await expect(dp.getByLabel('Invoice reference')).toHaveValue('HARBOR-1042');
  await expect(dp.locator('#payment-card-section')).toBeVisible();
  for (const text of ['HARBOR-1042', 'Harbor Paper Co. → Moss & Field Studio', '€1,470.00', '€1,500.00']) {
    await expect(dp.locator('.demo-summary').getByText(text, { exact: true })).toBeInViewport();
  }
  await expect(dp.getByRole('link', { name: 'View sample payment card' })).toBeInViewport();
  const databaseNames = await dp.evaluate(async () => (await indexedDB.databases()).map((database) => database.name).sort());
  expect(databaseNames).toEqual(['demo:early-pay-terms', 'early-pay-terms']);
  await fillAndWaitForDraft(dp, 'Invoice reference', 'DEMO-SAME-CONTEXT');
  await rp.reload(); await rp.locator('#terms-form[data-ready="true"]').waitFor(); await expect(rp.getByLabel('Invoice reference')).toHaveValue('REAL-SAME-CONTEXT');
  await dp.reload(); await dp.locator('#terms-form[data-ready="true"]').waitFor(); await expect(dp.getByLabel('Invoice reference')).toHaveValue('DEMO-SAME-CONTEXT');

  const resetNavigation = dp.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await dp.getByRole('button', { name: 'Reset demo' }).click(); await resetNavigation; await dp.locator('#terms-form[data-ready="true"]').waitFor();
  await expect(dp.getByLabel('Invoice reference')).toHaveValue('HARBOR-1042');
  await rp.reload(); await rp.locator('#terms-form[data-ready="true"]').waitFor(); await expect(rp.getByLabel('Invoice reference')).toHaveValue('REAL-SAME-CONTEXT');

  await fillAndWaitForDraft(dp, 'Invoice reference', 'DEMO-BEFORE-EXIT');
  const exitNavigation = dp.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await dp.getByRole('button', { name: 'Start for real' }).click(); await exitNavigation; await dp.locator('#terms-form[data-ready="true"]').waitFor();
  await expect(dp).toHaveURL(/\/$/); await expect(dp.getByLabel('Invoice reference')).toHaveValue('REAL-SAME-CONTEXT'); await expect(dp.locator('#license-state')).toContainText('Plus license active');
  await openApp(dp, '/demo'); await expect(dp.getByLabel('Invoice reference')).toHaveValue('HARBOR-1042'); await expect(dp.locator('#license-state')).toContainText('No Plus license active');
  await context.close();
});

test('query demo mode has its own metadata and reset only replaces sample data', async ({ isolated }) => {
  const { newContext } = isolated;
  const context = await newContext(); const page = await context.newPage();
  await openApp(page, '/?demo=1');
  await expect(page).toHaveTitle('Demo — Early Pay Terms');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://early-pay-terms.sociobot.in/demo');
  await fillAndWaitForDraft(page, 'Invoice reference', 'RESET-ONLY');
  const navigation = page.waitForNavigation({ waitUntil: 'domcontentloaded' });
  await page.getByRole('button', { name: 'Reset demo' }).click(); await navigation; await page.locator('#terms-form[data-ready="true"]').waitFor();
  await expect(page).toHaveURL(/\/demo$/); await expect(page.getByLabel('Invoice reference')).toHaveValue('HARBOR-1042');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await context.close();
});

test('@claim:payment-card calculates all visible card values from sample data', async ({ isolated }) => {
  const { page } = isolated; await openApp(page, '/demo');
  await page.locator('#netAmount').fill('1250'); await page.locator('#taxAmount').fill('250');
  await expect(page.locator('#early-amount')).toContainText('1,470.00');
  await expect(page.locator('#discount-amount')).toContainText('30.00');
  await expect(page.locator('#card-invoice')).toHaveText('Invoice HARBOR-1042');
  await expect(page.locator('#card-net')).toContainText('1,250.00');
  await expect(page.locator('#card-tax')).toContainText('250.00');
  await expect(page.locator('#card-discount-date')).toContainText('Aug 11, 2026');
  await expect(page.locator('#card-regular')).toContainText('1,500.00');
  await expect(page.locator('#card-due-date')).toContainText('Aug 31, 2026');
  await expect(page.locator('#card-method')).toContainText('tax is included in the discount basis');
  await expect(page.locator('#card-method')).toContainText('minor currency unit');
});

test('@claim:browser-privacy demo calculation and export make no third-party requests', async ({ isolated }) => {
  const { page } = isolated;
  const urls: string[] = []; page.on('request', r => urls.push(r.url()));
  await openApp(page, '/demo');
  const origin = new URL(page.url()).origin;
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export JSON' }).click(); await (await download).delete();
  expect(urls.every(url => new URL(url).origin === origin)).toBe(true);
});

test('@claim:exports downloads JSON and CSV without a license', async ({ isolated }) => {
  const { page } = isolated;
  const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  await openApp(page, '/demo');
  await page.evaluate(() => localStorage.setItem('demo:sb_license:early-pay-terms', 'MUST-NOT-EXPORT'));
  const origin = new URL(page.url()).origin;
  const json = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export JSON' }).click();
  const jsonPath = await (await json).path(); const jsonText = jsonPath ? await readFile(jsonPath, 'utf8') : ''; expect(jsonText).toContain('HARBOR-1042'); expect(jsonText).not.toContain('MUST-NOT-EXPORT');
  const csv = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export CSV' }).click();
  const csvDownload = await csv; const csvPath = await csvDownload.path(); expect(csvDownload.suggestedFilename()).toContain('.csv'); expect(csvPath && (await readFile(csvPath, 'utf8')).includes('invoice_reference')).toBe(true);
  expect(requests.every(url => new URL(url).origin === origin)).toBe(true);
});

test('@claim:offline-reload works offline after the first visit', async ({ isolated }) => {
  const { page, context } = isolated; await openApp(page, '/demo');
  await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true); await page.reload();
  await expect(page.getByLabel('Invoice reference')).toHaveValue('HARBOR-1042'); await expect(page.locator('#early-amount')).toBeVisible();
});

test('@claim:currencies supports advertised currency precision and rejects unavailable cash rounding', async ({ isolated }) => {
  const { page } = isolated; await openApp(page, '/demo');
  await page.locator('#netAmount').fill('1250'); await page.locator('#taxAmount').fill('250');
  const expected = { EUR: '€1,470.00', USD: '$1,470.00', GBP: '£1,470.00', CHF: 'CHF 1’470.00', INR: '₹1,470.00', JPY: '￥1,470', BHD: 'BHD 1,470.000' };
  for (const [currency, amount] of Object.entries(expected)) {
    await page.locator('#currency').selectOption(currency);
    await expect.poll(async () => (await page.locator('#early-amount').textContent())?.replace(/\s/g, ' ')).toBe(amount);
  }
  await page.locator('#currency').selectOption('CHF'); await page.locator('#netAmount').fill('100'); await page.locator('#taxAmount').fill('0'); await page.locator('#discountPercent').fill('2.03'); await page.getByLabel('Currency rounding').selectOption('cash-005');
  await expect.poll(async () => (await page.locator('#early-amount').textContent())?.replace(/\s/g, ' ')).toBe('CHF 97.95'); await expect(page.locator('#formula')).toContainText('nearest 0.05');
  await page.locator('#currency').selectOption('JPY');
  await page.getByLabel('Currency rounding').selectOption('cash-005'); await page.getByRole('button', { name: 'Show payment card' }).click();
  await expect(page.locator('#form-error')).toContainText('not available');
});

test('@claim:receipt-validation accepts only full on-time payments', async ({ isolated }) => {
  const { page } = isolated;
  await page.addInitScript(() => { localStorage.setItem('demo:sb_license:early-pay-terms', 'test'); localStorage.setItem('demo:sb_license_verdict:early-pay-terms', JSON.stringify({ valid: true, checkedAt: Date.now() })); });
  await openApp(page, '/demo'); await page.getByRole('button', { name: /Create paid receipt/ }).click();
  const submit = () => page.getByRole('button', { name: 'Create receipt' }).click();
  await page.getByLabel('Amount received').fill('1.00'); await submit(); await expect(page.locator('#receipt-error')).toContainText('must exactly match');
  await page.getByLabel('Amount received').fill('1470.01'); await submit(); await expect(page.locator('#receipt-error')).toContainText('overpayments manually');
  await page.getByLabel('Amount received').fill('1470.00'); await page.getByLabel('Payment date').fill('2026-07-31'); await submit(); await expect(page.locator('#receipt-error')).toContainText('before the invoice issue date');
  await page.getByLabel('Payment date').fill('2026-08-12'); await submit(); await expect(page.locator('#receipt-error')).toContainText('after the discount deadline');
  await page.getByLabel('Payment date').fill('2026-08-11'); await submit();
  await expect(page.locator('#receipt-document')).toBeVisible(); await expect(page.locator('#receipt-invoice')).toHaveText('Invoice HARBOR-1042'); await expect(page.locator('#receipt-paid')).toContainText('1,470.00'); await expect(page.locator('#receipt-date')).toContainText('Aug 11, 2026'); await expect(page.locator('#receipt-discount')).toContainText('30.00'); await expect(page.locator('#receipt-remaining')).toContainText('0.00');
});

test('@claim:free-core calculates, creates a payment card, and exports while Plus is locked', async ({ isolated }) => {
  const { page } = isolated; await openApp(page, '/demo');
  await expect(page.locator('#license-state')).toContainText('No Plus license active');
  await page.locator('#netAmount').fill('900'); await expect(page.locator('#early-amount')).toBeVisible(); await expect(page.locator('#payment-card-section')).toBeVisible();
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export JSON' }).click(); await (await download).delete();
});

test('unavailable Plus sales controls are absent while existing-license restoration remains available', async ({ isolated }) => {
  const { page } = isolated; await openApp(page, '/');
  await expect(page.getByRole('link', { name: /buy|checkout|purchase/i })).toHaveCount(0);
  await expect(page.getByRole('button', { name: /buy|checkout|purchase/i })).toHaveCount(0);
  await expect(page.getByRole('heading', { name: 'Restore an existing Plus license' })).toBeVisible();
  await expect(page.getByLabel('License token')).toBeVisible();
});

test('@claim:draft-persistence keeps edits in the demo database only', async ({ isolated }) => {
  const { newContext } = isolated;
  const demo = await newContext(); const dp = await demo.newPage(); await openApp(dp, '/demo');
  await fillAndWaitForDraft(dp, 'Invoice reference', 'PERSIST-DEMO'); await dp.reload(); await dp.locator('#terms-form[data-ready="true"]').waitFor(); await expect(dp.getByLabel('Invoice reference')).toHaveValue('PERSIST-DEMO');
  const real = await newContext(); const rp = await real.newPage(); await openApp(rp, '/'); await expect(rp.getByLabel('Invoice reference')).not.toHaveValue('PERSIST-DEMO');
  await demo.close(); await real.close();
});

test('@claim:plus-entitlements gates all three Plus tools and enables each with a valid cached license', async ({ isolated }) => {
  const { newContext } = isolated;
  const locked = await newContext(); const lp = await locked.newPage(); await openApp(lp, '/demo');
  const lockedCount = await lp.locator('#history-list article').count();
  await expect(lp.locator('#save-version')).toBeHidden(); await expect(lp.locator('#save-template')).toBeHidden(); await expect(lp.locator('#create-receipt')).toBeHidden(); await expect(lp.locator('#history-list article')).toHaveCount(lockedCount); await locked.close();

  const licensed = await newContext(); await licensed.addInitScript(() => { localStorage.setItem('demo:sb_license:early-pay-terms', 'fixture'); localStorage.setItem('demo:sb_license_verdict:early-pay-terms', JSON.stringify({ valid: true, checkedAt: Date.now() })); });
  const up = await licensed.newPage(); up.on('dialog', dialog => dialog.accept('Standard 2%'));
  await openApp(up, '/demo'); await expect(up.locator('#license-state')).toContainText('Plus license active'); await expect(up.locator('#save-version')).toBeVisible(); await expect(up.locator('#save-template')).toBeVisible(); await expect(up.locator('#create-receipt')).toBeVisible();
  const initial = await up.locator('#history-list article').count(); await up.getByRole('button', { name: /Save this version/ }).click(); await expect(up.locator('#history-list article')).toHaveCount(initial + 1);
  await up.getByRole('button', { name: /Save terms as template/ }).click(); await expect(up.locator('#template-list')).toContainText('Standard 2%');
  await up.getByRole('button', { name: /Create paid receipt/ }).click(); await expect(up.locator('#receipt-dialog')).toBeVisible(); await licensed.close();
});

test('@claim:license-check-privacy sends only the token to the Sociobot verification endpoint', async ({ isolated }) => {
  const { page } = isolated;
  let requestUrl = ''; let method = ''; let body: string | null = 'unset';
  await page.route(/https:\/\/(?:pilot-)?api\.sociobot\.in\/api\/v1\/products\/early-pay-terms\/verify\?.*/, async route => {
    requestUrl = route.request().url(); method = route.request().method(); body = route.request().postData();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await openApp(page, '/demo');
  await page.getByLabel('License token').fill('fixture-token'); await page.getByRole('button', { name: 'Verify license' }).click(); await expect(page.locator('#license-state')).toContainText('Plus license active');
  const url = new URL(requestUrl); expect(['https://pilot-api.sociobot.in', 'https://api.sociobot.in']).toContain(url.origin); expect(url.pathname).toBe('/api/v1/products/early-pay-terms/verify'); expect([...url.searchParams.keys()]).toEqual(['license']); expect(url.searchParams.get('license')).toBe('fixture-token'); expect(method).toBe('GET'); expect(body).toBeNull(); expect(requestUrl).not.toContain('HARBOR-1042');
  expect(await page.evaluate(() => Object.keys(localStorage).filter((key) => key.includes('early-pay-terms')).sort())).toEqual(['demo:sb_license:early-pay-terms', 'demo:sb_license_verdict:early-pay-terms']);
});

test('@claim:license-restoration handles valid, invalid, unavailable, and reload cases', async ({ isolated }) => {
  const { newContext } = isolated;
  const valid = await newContext(); let validRequests = 0;
  await valid.route(/https:\/\/(?:pilot-)?api\.sociobot\.in\/api\/v1\/products\/early-pay-terms\/verify\?.*/, async route => {
    validRequests += 1; await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  const vp = await valid.newPage(); await openApp(vp, '/demo'); await vp.getByLabel('License token').fill('valid-fixture'); await vp.getByRole('button', { name: 'Verify license' }).click();
  await expect(vp.locator('#license-state')).toContainText('Plus license active'); await expect(vp.locator('#save-version')).toBeVisible();
  await vp.reload(); await vp.locator('#terms-form[data-ready="true"]').waitFor(); await expect(vp.locator('#license-state')).toContainText('Plus license active'); expect(validRequests).toBe(1); await valid.close();

  const invalid = await newContext(); await invalid.route(/https:\/\/(?:pilot-)?api\.sociobot\.in\/api\/v1\/products\/early-pay-terms\/verify\?.*/, route => route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: false, reason: 'invalid' }) }));
  const ip = await invalid.newPage(); await openApp(ip, '/demo'); await ip.getByLabel('License token').fill('invalid-fixture'); await ip.getByRole('button', { name: 'Verify license' }).click();
  await expect(ip.locator('#license-state')).toContainText('No Plus license active'); await expect(ip.locator('#save-version')).toBeHidden(); await invalid.close();

  const unavailable = await newContext(); await unavailable.route(/https:\/\/(?:pilot-)?api\.sociobot\.in\/api\/v1\/products\/early-pay-terms\/verify\?.*/, route => route.fulfill({ status: 503, body: 'unavailable' }));
  const ep = await unavailable.newPage(); await openApp(ep, '/demo'); await ep.getByLabel('License token').fill('service-error-fixture'); await ep.getByRole('button', { name: 'Verify license' }).click();
  await expect(ep.locator('#toast')).toContainText('Could not reach the license service'); await expect(ep.locator('#license-state')).toContainText('No Plus license active'); await unavailable.close();
});

test('@claim:tax-rule-user-selected keeps the tax rule independent of locale, timezone, and location', async ({ isolated }) => {
  const { newContext } = isolated;
  for (const profile of [
    { locale: 'en-US', timezoneId: 'America/New_York', geolocation: { latitude: 40.7128, longitude: -74.006 } },
    { locale: 'de-DE', timezoneId: 'Europe/Berlin', geolocation: { latitude: 52.52, longitude: 13.405 } }
  ]) {
    const context = await newContext({ ...profile, permissions: [] });
    await context.addInitScript(() => {
      (window as typeof window & { __geoRequests?: number }).__geoRequests = 0;
      Object.defineProperty(navigator, 'geolocation', { configurable: true, value: {
        getCurrentPosition: () => { (window as typeof window & { __geoRequests?: number }).__geoRequests! += 1; },
        watchPosition: () => { (window as typeof window & { __geoRequests?: number }).__geoRequests! += 1; return 1; },
        clearWatch: () => undefined
      } });
    });
    const page = await context.newPage(); await openApp(page, '/demo');
    await expect(page.getByLabel('Whole invoice')).toBeChecked(); await expect(page.getByLabel('Net + proportional tax')).not.toBeChecked(); await expect(page.getByLabel('Net only; tax fixed')).not.toBeChecked();
    expect(await page.evaluate(() => (window as typeof window & { __geoRequests?: number }).__geoRequests)).toBe(0);
    await page.getByLabel('Net only; tax fixed').check(); await waitForDraftValue(page, 'method', 'net-tax-fixed'); await page.reload(); await page.locator('#terms-form[data-ready="true"]').waitFor(); await expect(page.getByLabel('Net only; tax fixed')).toBeChecked();
    expect(await page.evaluate(() => (window as typeof window & { __geoRequests?: number }).__geoRequests)).toBe(0); await context.close();
  }
});

test('@claim:print-payment-card opens print with the complete sample card', async ({ isolated }) => {
  const { page } = isolated;
  await page.addInitScript(() => { (window as typeof window & { printCalled?: boolean }).print = () => { (window as typeof window & { printCalled?: boolean }).printCalled = true; }; });
  await openApp(page, '/demo');
  await expect(page.locator('#card-invoice')).toHaveText('Invoice HARBOR-1042'); await expect(page.locator('#card-early-amount')).toContainText('1,470.00'); await expect(page.locator('#card-discount-date')).toContainText('Aug 11, 2026'); await expect(page.locator('#card-regular')).toContainText('1,500.00');
  await page.getByRole('button', { name: 'Print payment card' }).click(); expect(await page.evaluate(() => Boolean((window as typeof window & { printCalled?: boolean }).printCalled))).toBe(true);
});

test('@claim:json-import restores an exported current calculation and saved fields', async ({ isolated }) => {
  const { newContext } = isolated;
  const source = await newContext(); const sp = await source.newPage(); await openApp(sp, '/demo');
  await fillAndWaitForDraft(sp, 'Invoice reference', 'IMPORTED-2048'); await sp.getByText('Names and note for the payment card').click(); await fillAndWaitForDraft(sp, 'Supplier name', 'Imported Paper Ltd');
  const download = sp.waitForEvent('download'); await sp.getByRole('button', { name: 'Export JSON' }).click(); const path = await (await download).path(); if (!path) throw new Error('Export had no local path'); const payload = await readFile(path);
  const target = await newContext(); const tp = await target.newPage(); await openApp(tp, '/demo');
  await tp.locator('#import-json').setInputFiles({ name: 'early-pay-terms.json', mimeType: 'application/json', buffer: payload }); await expect(tp.locator('#toast')).toContainText('Imported local data successfully'); await expect(tp.getByLabel('Invoice reference')).toHaveValue('IMPORTED-2048'); await expect(tp.getByLabel('Supplier name')).toHaveValue('Imported Paper Ltd');
  await source.close(); await target.close();
});

test('@claim:data-deletion clears calculations, saved versions, and templates but keeps the license', async ({ isolated }) => {
  const { page } = isolated;
  await page.addInitScript(() => { localStorage.setItem('demo:sb_license:early-pay-terms', 'fixture'); localStorage.setItem('demo:sb_license_verdict:early-pay-terms', JSON.stringify({ valid: true, checkedAt: Date.now() })); });
  page.on('dialog', dialog => dialog.type() === 'prompt' ? dialog.accept('Delete fixture') : dialog.accept());
  await openApp(page, '/demo'); await fillAndWaitForDraft(page, 'Invoice reference', 'DELETE-ME');
  await page.getByRole('button', { name: /Save this version/ }).click(); await page.getByRole('button', { name: /Save terms as template/ }).click(); await expect(page.locator('#template-list')).toContainText('Delete fixture');
  await page.getByRole('button', { name: 'Clear local data' }).click(); await expect(page.locator('#toast')).toContainText('Local invoice data cleared');
  await expect(page.getByLabel('Invoice reference')).toHaveValue(''); await expect(page.locator('#history-list article')).toHaveCount(0); await expect(page.locator('#template-list')).toBeEmpty();
  expect(await page.evaluate(() => localStorage.getItem('demo:sb_license:early-pay-terms'))).toBe('fixture');
});

test('@claim:no-third-party-runtime uses only same-origin runtime resources', async ({ isolated }) => {
  const { page } = isolated;
  const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  await openApp(page, '/'); const origin = new URL(page.url()).origin;
  for (const route of ['/privacy/', '/terms/']) { await page.goto(appUrl(route)); await expect(page.locator('main')).toBeVisible(); }
  await openApp(page, '/demo'); const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export CSV' }).click(); await (await download).delete();
  expect(requests.length).toBeGreaterThan(4); expect(requests.every(url => new URL(url).origin === origin)).toBe(true);
});

test('@claim:product-boundary presents calculation tools without invoice, collection, or accounting actions', async ({ isolated }) => {
  const { page } = isolated; await openApp(page, '/'); await expect(page.getByRole('heading', { name: 'What this calculator does not do' })).toBeVisible(); await expect(page.getByText('It does not decide what is legal or create accounting entries.')).toBeVisible();
  await expect(page.getByRole('button', { name: /issue invoice|collect payment|accounting entry/i })).toHaveCount(0); await expect(page.getByRole('link', { name: /issue invoice|collect payment|accounting entry/i })).toHaveCount(0);
});

test('@claim:discount-bases applies each advertised discount rule', async ({ isolated }) => {
  const { page } = isolated; await openApp(page, '/demo'); await page.locator('#netAmount').fill('100.25'); await page.locator('#taxAmount').fill('19.25');
  await page.getByLabel('Whole invoice').check(); await expect(page.locator('#early-amount')).toContainText('117.11'); await expect(page.locator('#formula')).toContainText('tax is included');
  await page.getByLabel('Net + proportional tax').check(); await expect(page.locator('#early-amount')).toContainText('117.10'); await expect(page.locator('#tax-reduction')).toContainText('0.39');
  await page.getByLabel('Net only; tax fixed').check(); await expect(page.locator('#early-amount')).toContainText('117.49'); await expect(page.locator('#formula')).toContainText('tax amount remains unchanged');
});

test('accessibility, title, focus, and mobile layout', async ({ isolated }, testInfo) => {
  const { page } = isolated; await openApp(page, '/demo'); await expect(page).toHaveTitle(/Demo — Early Pay Terms/);
  await page.getByRole('link', { name: 'Calculator', exact: true }).click(); await expect(page.locator('#workbench-title')).toBeFocused();
  expect(await computedContrast(page, '#early-amount', '.result-panel')).toBeGreaterThanOrEqual(4.5);
  const axe = await new AxeBuilder({ page: page as never }).analyze(); expect(axe.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), testInfo.project.name).toBe(true);
});

test('first screen wording, contrast, skip link, and viewport fit', async ({ isolated }) => {
  const { page } = isolated; await openApp(page, '/');
  await expect(page.getByRole('heading', { level: 1 })).toHaveText('Calculate early-payment invoice terms');
  for (const text of ['See a saved supplier invoice and payment card.', 'Invoice figures stay in this browser.', 'Works offline after the first visit.', 'Use the calculator and export data without a license.']) await expect(page.getByText(text, { exact: true })).toBeInViewport();
  const contrastRatios = await page.locator('#hero-action-note, .plain-facts li').evaluateAll((nodes) => {
    const channels = (value: string) => (value.match(/[\d.]+/g) || []).slice(0, 3).map(Number);
    const luminance = (value: string) => {
      const [r, g, b] = channels(value).map((channel) => { const n = channel / 255; return n <= 0.04045 ? n / 12.92 : ((n + 0.055) / 1.055) ** 2.4; });
      return 0.2126 * r + 0.7152 * g + 0.0722 * b;
    };
    return nodes.map((node) => { const style = getComputedStyle(node); const background = getComputedStyle(node.closest('.hero')!).backgroundColor; const [lighter, darker] = [luminance(style.color), luminance(background)].sort((a, b) => b - a); return (lighter + 0.05) / (darker + 0.05); });
  });
  for (const ratio of contrastRatios) expect(ratio).toBeGreaterThanOrEqual(4.5);
  await page.locator('.skip-link').focus(); await expect(page.locator('.skip-link')).toHaveText('Skip to content'); await page.keyboard.press('Enter'); await expect(page.locator('#hero-title')).toBeFocused();
});

test('Privacy then browser Back restores the calculator fragment, focus, scroll, and announcement', async ({ isolated }) => {
  const { page } = isolated; await openApp(page, '/'); await page.getByRole('link', { name: 'Calculator', exact: true }).click();
  await expect(page).toHaveURL(/#workbench$/); await expect(page.locator('#workbench-title')).toBeFocused();
  await page.getByRole('link', { name: 'Privacy', exact: true }).first().click(); await expect(page).toHaveURL(/\/privacy\/$/); await page.goBack();
  await expect(page).toHaveURL(/#workbench$/); await expect(page.locator('#workbench-title')).toBeFocused(); await expect(page.locator('#route-announcement')).toHaveText('Enter the agreed invoice terms');
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBeGreaterThan(500);
});

test('every real route has complete metadata and the shared main navigation', async ({ isolated }) => {
  const { page } = isolated;
  const expected = ['Demo', 'Calculator', 'Saved versions', 'Privacy'];
  for (const [route, title] of [['/', 'Early Pay Terms — invoice discount calculator'], ['/demo', 'Demo — Early Pay Terms'], ['/privacy/', 'Privacy — Early Pay Terms'], ['/terms/', 'Terms — Early Pay Terms']] as const) {
    await page.goto(appUrl(route)); await expect(page).toHaveTitle(title); await expect(page.locator('html')).toHaveAttribute('lang', 'en'); await expect(page.locator('main')).toHaveCount(1); await expect(page.locator('h1')).toHaveCount(1);
    for (const name of expected) await expect(page.locator('header').getByRole('link', { name, exact: true })).toHaveCount(1);
    for (const name of ['Privacy', 'Terms']) await expect(page.locator('footer nav').getByRole('link', { name, exact: true })).toHaveCount(1);
    await expect(page.locator('footer').getByText('Built by Param Factory', { exact: true })).toHaveCount(1);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\//); await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /share\.png$/); await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /share\.png$/);
    const axe = await new AxeBuilder({ page: page as never }).analyze(); expect(axe.violations).toEqual([]);
  }
  await page.goto(appUrl('/404.html')); await expect(page).toHaveTitle('404 — Early Pay Terms'); await expect(page.getByRole('heading', { level: 1 })).toContainText('does not exist'); await expect(page.locator('footer').getByText('Built by Param Factory', { exact: true })).toBeVisible();
  const notFoundAxe = await new AxeBuilder({ page: page as never }).analyze(); expect(notFoundAxe.violations).toEqual([]);
  const config = JSON.parse(await readFile('dist/staticwebapp.config.json', 'utf8')) as { responseOverrides?: { '404'?: { rewrite?: string; statusCode?: number } } };
  expect(config.responseOverrides?.['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  if (process.env.PLAYWRIGHT_BASE_URL) { const response = await page.goto(appUrl('/does-not-exist')); expect(response?.status()).toBe(404); await expect(page).toHaveTitle('404 — Early Pay Terms'); }
});
