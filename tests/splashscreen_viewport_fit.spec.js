import { test, expect } from '@playwright/test';

test.use({
  viewport: { width: 1280, height: 650 },
});

test('Splashscreen content must fit completely within a standard laptop viewport height without overflowing', async ({ page }) => {
  // 1. Force the splashscreen to show by overriding navigator.webdriver to false
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
      configurable: true
    });
  });

  // 2. Go to main page (which will display the splashscreen)
  await page.goto('/');

  // 3. Verify splashscreen is visible
  const splashBanner = page.locator('img[alt="Ronda"]');
  await expect(splashBanner).toBeVisible({ timeout: 5000 });

  // 4. Measure the bounding boxes of key elements
  const bannerBox = await page.locator('img[alt="Ronda"]').boundingBox();
  const logoBox = await page.locator('img[alt="Logo"]').boundingBox();
  const viewportSize = page.viewportSize();

  console.log(`[Diagnostic] Viewport Height: ${viewportSize.height}px`);
  console.log(`[Diagnostic] Banner Bounding Box: y=${bannerBox.y}, height=${bannerBox.height}, bottom=${bannerBox.y + bannerBox.height}`);
  console.log(`[Diagnostic] Logo Bounding Box: y=${logoBox.y}, height=${logoBox.height}, bottom=${logoBox.y + logoBox.height}`);

  // 5. Assert that the bottom of the logo fits inside the viewport
  // If this fails, it confirms the content overflows the screen and is cut off.
  expect(logoBox.y + logoBox.height).toBeLessThanOrEqual(viewportSize.height);
});
