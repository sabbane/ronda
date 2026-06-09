import { test, expect } from '@playwright/test';

test('Gameplay: Gameplay board should never have vertical scrolling on constrained viewports (laptop / mobile)', async ({ page }) => {
  test.setTimeout(90_000);
  // 1. Setup a constrained viewport size (e.g. 1280x720, typical scaled 14" laptop view)
  await page.setViewportSize({ width: 1280, height: 720 });

  // 2. Load the app and start a singleplayer game
  await page.goto('/');

  // Select English language for consistency
  const enButton = page.locator('button', { hasText: /^EN$/i });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // Click "Start Game" under Singleplayer
  const playButton = page.locator('button', { hasText: /Start Game/i }).first();
  await expect(playButton).toBeVisible();
  await playButton.click();

  // Wait for the gameplay board to render (cards count should be visible)
  const cards = page.locator('img[src*="-vector.svg"]:not([aria-hidden="true"])');
  await expect(cards).toHaveCount(7, { timeout: 10000 });

  // Assert that vertical scrolling is strictly disabled via overflow CSS properties
  const bodyOverflow = await page.evaluate(() => {
    return window.getComputedStyle(document.body).overflow;
  });
  const containerOverflowY = await page.evaluate(() => {
    const container = document.querySelector('.min-h-\\[100dvh\\]');
    return container ? window.getComputedStyle(container).overflowY : null;
  });

  console.log('[Test Log] Laptop view overflow styles - body:', bodyOverflow, 'containerY:', containerOverflowY);
  expect(bodyOverflow, 'Body overflow should be hidden').toBe('hidden');
  expect(containerOverflowY, 'Gameplay container overflow-y should be hidden').toBe('hidden');

  // 3. Test standard mobile viewport (e.g. 375x667)
  await page.setViewportSize({ width: 375, height: 667 });
  // Give the browser a small timeout to finish CSS calculations and layout rendering
  await page.waitForTimeout(1000);

  // Assert overflow on standard mobile (should fit and stay hidden)
  const bodyOverflowMobile = await page.evaluate(() => {
    return window.getComputedStyle(document.body).overflow;
  });
  const containerOverflowYMobile = await page.evaluate(() => {
    const container = document.querySelector('.min-h-\\[100dvh\\]');
    return container ? window.getComputedStyle(container).overflowY : null;
  });

  console.log('[Test Log] Mobile view overflow styles - body:', bodyOverflowMobile, 'containerY:', containerOverflowYMobile);
  expect(bodyOverflowMobile, 'Mobile body overflow should be hidden').toBe('hidden');
  expect(containerOverflowYMobile, 'Mobile gameplay container overflow-y should be hidden').toBe('hidden');

  // 4. Test extremely short/constrained mobile viewport (e.g. 375x300)
  await page.setViewportSize({ width: 375, height: 300 });
  await page.waitForTimeout(1000);

  const containerOverflowYShort = await page.evaluate(() => {
    const container = document.querySelector('.min-h-\\[100dvh\\]');
    return container ? window.getComputedStyle(container).overflowY : null;
  });

  console.log('[Test Log] Ultra-short Mobile view overflow styles - containerY:', containerOverflowYShort);
  // On highly constrained viewport heights, it must dynamically enable scroll
  expect(containerOverflowYShort, 'Ultra-short Mobile gameplay container overflow-y should be auto').toBe('auto');
});
