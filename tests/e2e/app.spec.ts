import { expect, test } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

test('calculates, explains, and prints exact terms', async ({ page }) => {
  const errors: string[] = [];
  page.on('console', (message) => { if (message.type() === 'error') errors.push(message.text()); });
  await page.goto('/');
  await page.locator('#terms-form[data-ready="true"]').waitFor();
  await expect(page.locator('h1')).toHaveCount(1);
  await page.getByLabel('Invoice reference').fill('INV-1042');
  await page.getByLabel('Net amount').fill('1000.00');
  await page.getByLabel('Tax amount').fill('190.00');
  await page.getByRole('button', { name: 'Review exact terms' }).click();
  await expect(page.locator('#early-amount')).toContainText('1,166.20');
  await expect(page.locator('#discount-amount')).toContainText('23.80');
  await expect(page.locator('#card-invoice')).toHaveText('Invoice INV-1042');
  await expect(page.locator('#payment-card-section')).toBeVisible();
  expect(errors).toEqual([]);
});

test('has no serious accessibility violations', async ({ page }, testInfo) => {
  await page.goto('/');
  await page.locator('#terms-form[data-ready="true"]').waitFor();
  await page.getByLabel('Net amount').fill('1000.00');
  await page.getByLabel('Tax amount').fill('190.00');
  const results = await new AxeBuilder({ page: page as never }).analyze();
  expect(results.violations.filter((item) => ['serious', 'critical'].includes(item.impact || '')), JSON.stringify(results.violations, null, 2)).toEqual([]);
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth), `${testInfo.project.name} has horizontal overflow`).toBe(true);
});

test('persists the draft and works after the network goes offline', async ({ page, context }) => {
  await page.goto('/');
  await page.locator('#terms-form[data-ready="true"]').waitFor();
  await page.getByLabel('Invoice reference').fill('OFFLINE-7');
  await page.getByLabel('Net amount').fill('250.00');
  await page.waitForTimeout(400);
  await page.reload();
  await expect(page.getByLabel('Invoice reference')).toHaveValue('OFFLINE-7');
  await page.evaluate(() => navigator.serviceWorker.ready);
  await page.waitForFunction(() => Boolean(navigator.serviceWorker.controller));
  await page.reload();
  await expect(page.locator('#early-amount')).toBeVisible();
  await context.setOffline(true);
  await page.reload();
  await expect(page.getByRole('heading', { name: 'Make the early amount impossible to misread.' })).toBeVisible();
  await expect(page.locator('#early-amount')).toBeVisible();
  await page.evaluate(() => window.dispatchEvent(new Event('offline')));
  await expect(page.locator('#network-status')).toContainText('Working offline');
});

test('unlocks saved versions and creates an on-time receipt from a cached license', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:early-pay-terms', 'test-license');
    localStorage.setItem('sb_license_verdict:early-pay-terms', JSON.stringify({ valid: true, checkedAt: Date.now(), reason: 'ok' }));
  });
  await page.goto('/');
  await page.locator('#terms-form[data-ready="true"]').waitFor();
  await page.getByLabel('Invoice reference').fill('PAID-88');
  await page.getByLabel('Net amount').fill('500.00');
  await page.getByRole('button', { name: /Save this version/ }).click();
  await expect(page.locator('#history-list article')).toHaveCount(1);
  await page.getByRole('button', { name: /Create paid receipt/ }).click();
  await expect(page.getByRole('dialog')).toBeVisible();
  await page.getByRole('button', { name: 'Create receipt' }).click();
  await expect(page.locator('#receipt-remaining')).toContainText('0.00');
  await expect(page.locator('#receipt-document')).toBeVisible();
});

test('refuses an ambiguous paid-on-time receipt amount', async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.setItem('sb_license:early-pay-terms', 'test-license');
    localStorage.setItem('sb_license_verdict:early-pay-terms', JSON.stringify({ valid: true, checkedAt: Date.now(), reason: 'ok' }));
  });
  await page.goto('/');
  await page.locator('#terms-form[data-ready="true"]').waitFor();
  await page.getByLabel('Net amount').fill('100.00');
  await page.getByRole('button', { name: /Create paid receipt/ }).click();
  await page.getByLabel('Amount received').fill('99.00');
  await page.getByRole('button', { name: 'Create receipt' }).click();
  await expect(page.locator('#receipt-error')).toContainText('must exactly match');
  await expect(page.locator('#receipt-document')).toBeHidden();
});

test('legal pages have the required landmarks', async ({ page }) => {
  for (const path of ['/privacy/', '/terms/']) {
    await page.goto(path);
    await expect(page.locator('main')).toHaveCount(1);
    await expect(page.locator('h1')).toHaveCount(1);
    await expect(page).toHaveTitle(/Early Pay Terms/);
  }
});
