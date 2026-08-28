import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { readFile } from 'node:fs/promises';

test('@claim:demo-isolation opens a populated sample and cannot read production storage', async ({ browser }) => {
  const real = await browser.newContext(); const rp = await real.newPage();
  await rp.goto('/'); await rp.locator('#terms-form[data-ready="true"]').waitFor();
  await rp.getByLabel('Invoice reference').fill('REAL-ONLY'); await rp.waitForTimeout(350);
  const demo = await browser.newContext(); const dp = await demo.newPage();
  await dp.goto('/demo'); await dp.locator('#terms-form[data-ready="true"]').waitFor();
  await expect(dp.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await expect(dp.getByLabel('Invoice reference')).toHaveValue('HARBOR-1042');
  await expect(dp.locator('#payment-card-section')).toBeVisible();
  await dp.getByLabel('Invoice reference').fill('DEMO-ONLY'); await dp.waitForTimeout(350);
  await rp.reload(); await expect(rp.getByLabel('Invoice reference')).toHaveValue('REAL-ONLY');
  await dp.getByRole('button', { name: 'Start for real' }).click(); await expect(dp).toHaveURL(/\/$/); await expect(dp.getByLabel('Invoice reference')).not.toHaveValue('DEMO-ONLY');
  await real.close(); await demo.close();
});

test('query demo mode has its own metadata and reset only replaces sample data', async ({ browser }) => {
  const context = await browser.newContext(); const page = await context.newPage();
  await page.goto('/?demo=1'); await page.locator('#terms-form[data-ready="true"]').waitFor();
  await expect(page).toHaveTitle('Demo — Early Pay Terms');
  await expect(page.locator('link[rel="canonical"]')).toHaveAttribute('href', 'https://early-pay-terms.sociobot.in/demo');
  await page.getByLabel('Invoice reference').fill('RESET-ONLY'); await page.waitForTimeout(350);
  await page.getByRole('button', { name: 'Reset demo' }).click();
  await expect(page).toHaveURL(/\/demo$/); await expect(page.getByLabel('Invoice reference')).toHaveValue('HARBOR-1042');
  await expect(page.getByText('Demo — sample data, nothing is saved')).toBeVisible();
  await context.close();
});

test('@claim:payment-card calculates all visible card values from sample data', async ({ page }) => {
  await page.goto('/demo'); await page.locator('#terms-form[data-ready="true"]').waitFor();
  await page.locator('#netAmount').fill('1250'); await page.locator('#taxAmount').fill('250');
  await expect(page.locator('#early-amount')).toContainText('1,470.00');
  await expect(page.locator('#discount-amount')).toContainText('30.00');
  await expect(page.locator('#card-invoice')).toHaveText('Invoice HARBOR-1042');
  await expect(page.locator('#card-discount-date')).toContainText('Aug 11, 2026');
  await expect(page.locator('#card-regular')).toContainText('1,500.00');
});

test('@claim:browser-privacy demo calculation and export make no third-party requests', async ({ page }) => {
  const urls: string[] = []; page.on('request', r => urls.push(r.url()));
  await page.goto('/demo'); await page.locator('#terms-form[data-ready="true"]').waitFor();
  const download = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export JSON' }).click(); await (await download).delete();
  expect(urls.every(url => new URL(url).origin === 'http://127.0.0.1:4173')).toBe(true);
});

test('@claim:exports downloads JSON and CSV without Plus', async ({ page }) => {
  await page.goto('/demo'); await page.locator('#terms-form[data-ready="true"]').waitFor();
  const json = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export JSON' }).click();
  const jsonPath = await (await json).path(); expect(jsonPath && (await readFile(jsonPath, 'utf8')).includes('HARBOR-1042')).toBe(true);
  const csv = page.waitForEvent('download'); await page.getByRole('button', { name: 'Export CSV' }).click();
  const csvDownload = await csv; const csvPath = await csvDownload.path(); expect(csvDownload.suggestedFilename()).toContain('.csv'); expect(csvPath && (await readFile(csvPath, 'utf8')).includes('invoice_reference')).toBe(true);
});

test('@claim:offline-reload works offline after the first visit', async ({ page, context }) => {
  await page.goto('/demo'); await page.locator('#terms-form[data-ready="true"]').waitFor();
  await page.evaluate(() => navigator.serviceWorker.ready); await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await context.setOffline(true); await page.reload();
  await expect(page.getByLabel('Invoice reference')).toHaveValue('HARBOR-1042'); await expect(page.locator('#early-amount')).toBeVisible();
});

test('@claim:currencies supports advertised currency precision and rejects unavailable cash rounding', async ({ page }) => {
  await page.goto('/demo'); await page.locator('#terms-form[data-ready="true"]').waitFor();
  await page.locator('#netAmount').fill('1250'); await page.locator('#taxAmount').fill('250');
  for (const currency of ['EUR', 'USD', 'GBP', 'CHF', 'INR', 'JPY', 'BHD']) { await page.locator('#currency').selectOption(currency); await expect(page.locator('#early-amount')).toBeVisible(); }
  await page.locator('#currency').selectOption('JPY');
  await page.getByLabel('Currency rounding').selectOption('cash-005'); await page.getByRole('button', { name: 'Show payment card' }).click();
  await expect(page.locator('#form-error')).toContainText('not available');
});

test('@claim:receipt-validation accepts only full on-time payments', async ({ page }) => {
  await page.addInitScript(() => { localStorage.setItem('sb_license:early-pay-terms', 'test'); localStorage.setItem('sb_license_verdict:early-pay-terms', JSON.stringify({ valid: true, checkedAt: Date.now() })); });
  await page.goto('/demo'); await page.locator('#terms-form[data-ready="true"]').waitFor(); await page.getByRole('button', { name: /Create paid receipt/ }).click();
  await page.getByLabel('Amount received').fill('1.00'); await page.getByRole('button', { name: 'Create receipt' }).click(); await expect(page.locator('#receipt-error')).toContainText('must exactly match');
});

test('accessibility, title, focus, and mobile layout', async ({ page }, testInfo) => {
  await page.goto('/demo'); await page.locator('#terms-form[data-ready="true"]').waitFor(); await expect(page).toHaveTitle(/Demo — Early Pay Terms/);
  await page.getByRole('link', { name: 'Calculator', exact: true }).click(); await expect(page.locator('#workbench-title')).toBeFocused();
  const axe = await new AxeBuilder({ page: page as never }).analyze(); expect(axe.violations.filter(v => ['serious', 'critical'].includes(v.impact || ''))).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), testInfo.project.name).toBe(true);
});
