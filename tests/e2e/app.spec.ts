import { appUrl, expect, openApp, test } from './fixtures';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('@claim:demo-isolation opens a populated sample and cannot read production storage', async ({ isolated }) => {
  const { newContext } = isolated;
  const real = await newContext(); const rp = await real.newPage();
  await openApp(rp, '/');
  await rp.getByLabel('Invoice reference').fill('REAL-ONLY'); await expect(rp.locator('#terms-form')).toHaveAttribute('data-draft-state', 'saved');
  const demo = await newContext(); const dp = await demo.newPage();
  await openApp(dp, '/demo');
  await expect(dp.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(dp.getByLabel('Invoice reference')).toHaveValue('HARBOR-1042');
  await expect(dp.locator('#payment-card-section')).toBeVisible();
  for (const text of ['HARBOR-1042', 'Harbor Paper Co. → Moss & Field Studio', '€1,470.00', '€1,500.00']) {
    await expect(dp.locator('.demo-summary').getByText(text, { exact: true })).toBeInViewport();
  }
  await expect(dp.getByRole('link', { name: 'View sample payment card' })).toBeInViewport();
  await dp.getByLabel('Invoice reference').fill('DEMO-ONLY'); await expect(dp.locator('#terms-form')).toHaveAttribute('data-draft-state', 'saved');
  await rp.reload(); await rp.locator('#terms-form[data-ready="true"]').waitFor(); await expect(rp.getByLabel('Invoice reference')).toHaveValue('REAL-ONLY');
  await dp.getByRole('button', { name: 'Start for real' }).click(); await expect(dp).toHaveURL(/\/$/); await expect(dp.getByLabel('Invoice reference')).not.toHaveValue('DEMO-ONLY');
  await real.close(); await demo.close();
});

test('query demo mode has its own metadata and reset only replaces sample data', async ({ isolated }) => {
  const { newContext } = isolated;
  const context = await newContext(); const page = await context.newPage();
  await openApp(page, '/?demo=1');
  await expect(page).toHaveTitle('Demo — Early Pay Terms');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://early-pay-terms.sociobot.in/demo');
  await page.getByLabel('Invoice reference').fill('RESET-ONLY'); await expect(page.locator('#terms-form')).toHaveAttribute('data-draft-state', 'saved');
  await page.getByRole('button', { name: 'Reset demo' }).click();
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

test('@claim:exports downloads JSON and CSV without Plus', async ({ isolated }) => {
  const { page } = isolated;
  const requests: string[] = []; page.on('request', request => requests.push(request.url()));
  await openApp(page, '/demo');
  const origin = new URL(page.url()).origin;
  const json = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export JSON' }).click();
  const jsonPath = await (await json).path(); expect(jsonPath && (await readFile(jsonPath, 'utf8')).includes('HARBOR-1042')).toBe(true);
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
  for (const currency of ['EUR', 'USD', 'GBP', 'CHF', 'INR', 'JPY', 'BHD']) { await page.locator('#currency').selectOption(currency); await expect(page.locator('#early-amount')).toBeVisible(); }
  await page.locator('#currency').selectOption('CHF'); await page.getByLabel('Currency rounding').selectOption('cash-005');
  await expect(page.locator('#formula')).toContainText('nearest 0.05');
  await page.locator('#currency').selectOption('JPY');
  await page.getByLabel('Currency rounding').selectOption('cash-005'); await page.getByRole('button', { name: 'Show payment card' }).click();
  await expect(page.locator('#form-error')).toContainText('not available');
});

test('@claim:receipt-validation accepts only full on-time payments', async ({ isolated }) => {
  const { page } = isolated;
  await page.addInitScript(() => { localStorage.setItem('sb_license:early-pay-terms', 'test'); localStorage.setItem('sb_license_verdict:early-pay-terms', JSON.stringify({ valid: true, checkedAt: Date.now() })); });
  await openApp(page, '/demo'); await page.getByRole('button', { name: /Create paid receipt/ }).click();
  await page.getByLabel('Amount received').fill('1.00'); await page.getByRole('button', { name: 'Create receipt' }).click(); await expect(page.locator('#receipt-error')).toContainText('must exactly match');
  await page.getByLabel('Amount received').fill('1470.00'); await page.getByRole('button', { name: 'Create receipt' }).click();
  await expect(page.locator('#receipt-document')).toBeVisible(); await expect(page.locator('#receipt-paid')).toContainText('1,470.00'); await expect(page.locator('#receipt-remaining')).toContainText('0.00');
});

test('@claim:free-core calculates, creates a payment card, and exports while Plus is locked', async ({ isolated }) => {
  const { page } = isolated; await openApp(page, '/demo');
  await expect(page.locator('#license-state')).toContainText('Free calculator active');
  await page.locator('#netAmount').fill('900'); await expect(page.locator('#early-amount')).toBeVisible(); await expect(page.locator('#payment-card-section')).toBeVisible();
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export JSON' }).click(); await (await download).delete();
});

test('@claim:draft-persistence keeps edits in the demo database only', async ({ isolated }) => {
  const { newContext } = isolated;
  const demo = await newContext(); const dp = await demo.newPage(); await openApp(dp, '/demo');
  await dp.getByLabel('Invoice reference').fill('PERSIST-DEMO'); await expect(dp.locator('#terms-form')).toHaveAttribute('data-draft-state', 'saved'); await dp.reload(); await dp.locator('#terms-form[data-ready="true"]').waitFor(); await expect(dp.getByLabel('Invoice reference')).toHaveValue('PERSIST-DEMO');
  const real = await newContext(); const rp = await real.newPage(); await openApp(rp, '/'); await expect(rp.getByLabel('Invoice reference')).not.toHaveValue('PERSIST-DEMO');
  await demo.close(); await real.close();
});

test('@claim:plus-entitlements gates all three Plus tools and enables each with a valid cached license', async ({ isolated }) => {
  const { newContext } = isolated;
  const locked = await newContext(); const lp = await locked.newPage(); await openApp(lp, '/demo');
  const lockedCount = await lp.locator('#history-list article').count();
  await lp.getByRole('button', { name: /Save this version/ }).click(); await expect(lp.locator('#toast')).toContainText('Plus is needed'); await expect(lp.locator('#history-list article')).toHaveCount(lockedCount);
  await lp.getByRole('button', { name: /Save terms as template/ }).click(); await expect(lp.locator('#template-list')).toBeEmpty();
  await lp.getByRole('button', { name: /Create paid receipt/ }).click(); await expect(lp.locator('#receipt-dialog')).not.toBeVisible(); await locked.close();

  const licensed = await newContext(); await licensed.addInitScript(() => { localStorage.setItem('sb_license:early-pay-terms', 'fixture'); localStorage.setItem('sb_license_verdict:early-pay-terms', JSON.stringify({ valid: true, checkedAt: Date.now() })); });
  const up = await licensed.newPage(); up.on('dialog', dialog => dialog.accept('Standard 2%'));
  await openApp(up, '/demo'); await expect(up.locator('#license-state')).toContainText('Plus is active');
  const initial = await up.locator('#history-list article').count(); await up.getByRole('button', { name: /Save this version/ }).click(); await expect(up.locator('#history-list article')).toHaveCount(initial + 1);
  await up.getByRole('button', { name: /Save terms as template/ }).click(); await expect(up.locator('#template-list')).toContainText('Standard 2%');
  await up.getByRole('button', { name: /Create paid receipt/ }).click(); await expect(up.locator('#receipt-dialog')).toBeVisible(); await licensed.close();
});

test('@claim:plus-sale-state renders no checkout or purchase action', async ({ isolated }) => {
  const { page } = isolated; await openApp(page, '/');
  await expect(page.locator('#unlock')).toContainText('Plus is not available to buy in this release.');
  await expect(page.locator('a[href*="checkout"], a:has-text("Buy Plus"), button:has-text("Buy Plus")')).toHaveCount(0);
});

test('@claim:license-check-privacy sends only the token to the Sociobot verification endpoint', async ({ isolated }) => {
  const { page } = isolated;
  let requestUrl = ''; let method = ''; let body: string | null = 'unset';
  await page.route(/https:\/\/(?:pilot-)?api\.sociobot\.in\/api\/v1\/products\/early-pay-terms\/verify\?.*/, async route => {
    requestUrl = route.request().url(); method = route.request().method(); body = route.request().postData();
    await route.fulfill({ status: 200, contentType: 'application/json', body: JSON.stringify({ valid: true, reason: 'ok' }) });
  });
  await openApp(page, '/demo');
  await page.getByText('Have a license? Restore it').click(); await page.getByLabel('License token').fill('fixture-token'); await page.getByRole('button', { name: 'Verify license' }).click(); await expect(page.locator('#license-state')).toContainText('Plus is active');
  const url = new URL(requestUrl); expect(['https://pilot-api.sociobot.in', 'https://api.sociobot.in']).toContain(url.origin); expect(url.pathname).toBe('/api/v1/products/early-pay-terms/verify'); expect([...url.searchParams.keys()]).toEqual(['license']); expect(url.searchParams.get('license')).toBe('fixture-token'); expect(method).toBe('GET'); expect(body).toBeNull(); expect(requestUrl).not.toContain('HARBOR-1042');
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
  await sp.getByLabel('Invoice reference').fill('IMPORTED-2048'); await sp.getByText('Names and note for the payment card').click(); await sp.getByLabel('Supplier name').fill('Imported Paper Ltd'); await expect(sp.locator('#terms-form')).toHaveAttribute('data-draft-state', 'saved');
  const download = sp.waitForEvent('download'); await sp.getByRole('button', { name: 'Export JSON' }).click(); const path = await (await download).path(); if (!path) throw new Error('Export had no local path'); const payload = await readFile(path);
  const target = await newContext(); const tp = await target.newPage(); await openApp(tp, '/demo');
  await tp.locator('#import-json').setInputFiles({ name: 'early-pay-terms.json', mimeType: 'application/json', buffer: payload }); await expect(tp.locator('#toast')).toContainText('Imported local data successfully'); await expect(tp.getByLabel('Invoice reference')).toHaveValue('IMPORTED-2048'); await expect(tp.getByLabel('Supplier name')).toHaveValue('Imported Paper Ltd');
  await source.close(); await target.close();
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
  const axe = await new AxeBuilder({ page: page as never }).analyze(); expect(axe.violations).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), testInfo.project.name).toBe(true);
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
    await expect(page.locator('meta[name="description"]')).toHaveAttribute('content', /.+/); await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', /^https:\/\//); await expect(page.locator('meta[property="og:image"]')).toHaveAttribute('content', /share\.png$/); await expect(page.locator('meta[name="twitter:image"]')).toHaveAttribute('content', /share\.png$/);
  }
  await page.goto(appUrl('/404.html')); await expect(page).toHaveTitle('404 — Early Pay Terms'); await expect(page.getByRole('heading', { level: 1 })).toContainText('does not exist');
  const config = JSON.parse(await readFile('dist/staticwebapp.config.json', 'utf8')) as { responseOverrides?: { '404'?: { rewrite?: string; statusCode?: number } } };
  expect(config.responseOverrides?.['404']).toEqual({ rewrite: '/404.html', statusCode: 404 });
  if (process.env.PLAYWRIGHT_BASE_URL) { const response = await page.goto(appUrl('/does-not-exist')); expect(response?.status()).toBe(404); await expect(page).toHaveTitle('404 — Early Pay Terms'); }
});
