import { test, expect, webkit, devices } from '@playwright/test';

test.describe('iOS Safari Layout and Interaction Quirks Verification', () => {
  test('Page must implement iOS Safari best practices for safe area, overscroll, and double-tap zoom', async () => {
    const iphone = devices['iPhone 12'];
    const browser = await webkit.launch({ headless: true });
    
    // Create an emulated iPhone context
    const context = await browser.newContext({
      ...iphone,
    });
    const page = await context.newPage();

    // 1. Force splashscreen skip to immediately get to game layout
    await page.addInitScript(() => {
      Object.defineProperty(Navigator.prototype, 'webdriver', {
        get: () => true,
        configurable: true
      });
    });

    console.log('Navigating to the home page...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // --- 1. Viewport Fit Cover Assertion ---
    console.log('Verifying index.html viewport meta tag for viewport-fit=cover...');
    const viewportMeta = await page.locator('meta[name="viewport"]').getAttribute('content');
    console.log(`Viewport meta content: "${viewportMeta}"`);
    expect(viewportMeta).toContain('viewport-fit=cover');

    // --- 2. CSS Styles Verification ---
    // We check the styles injected by Vite in the style tags to ensure the build includes
    // safe area, overscroll behavior, and touch action manipulation.
    console.log('Verifying CSS declarations in style tags...');
    const cssChecks = await page.evaluate(() => {
      const styles = Array.from(document.querySelectorAll('style')).map(s => s.textContent).join('\n');
      return {
        hasOverscroll: styles.includes('overscroll-behavior: none') || styles.includes('overscroll-behavior-y: none'),
        hasTouchAction: styles.includes('touch-action: manipulation'),
        hasSafeArea: styles.includes('safe-area-inset-bottom')
      };
    });

    console.log('CSS Checks:', cssChecks);
    
    expect(cssChecks.hasOverscroll).toBe(true);
    expect(cssChecks.hasTouchAction).toBe(true);
    expect(cssChecks.hasSafeArea).toBe(true);

    await context.close();
    await browser.close();
  });
});
