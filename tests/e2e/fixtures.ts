import { chromium, expect, test as base } from '@playwright/test';
import type { Browser, BrowserContext, BrowserContextOptions, Page } from '@playwright/test';

type IsolatedSession = {
  browser: Browser;
  context: BrowserContext;
  page: Page;
  newContext: () => Promise<BrowserContext>;
};

/**
 * A spec owns its Chromium process as well as its context and page.  The
 * browser suite previously reused Playwright's worker browser; if Chromium
 * exited during a long run that made an unrelated later spec look flaky.
 */
export const test = base.extend<{ isolated: IsolatedSession }>({
  isolated: async ({}, use, testInfo) => {
    const browser = await chromium.launch({ headless: true });
    const { baseURL: _baseURL, ...projectUse } = testInfo.project.use;
    const contextOptions = projectUse as BrowserContextOptions;
    const newContext = () => browser.newContext(contextOptions);
    const context = await newContext();
    const page = await context.newPage();
    try {
      await use({ browser, context, page, newContext });
    } finally {
      await context.close();
      await browser.close();
    }
  }
});

export { expect };

export function appUrl(path: string): string {
  return new URL(path, process.env.PLAYWRIGHT_BASE_URL || 'http://127.0.0.1:4173').toString();
}

export async function openApp(page: Page, path: string): Promise<void> {
  await page.goto(appUrl(path), { waitUntil: 'domcontentloaded' });
  await page.locator('#terms-form[data-ready="true"]').waitFor();
}
