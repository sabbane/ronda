import { test, expect } from '@playwright/test';

test('Main Menu: Footer and buttons must be fully contained within constrained viewport heights without cutoff', async ({ page }) => {
  // Array of constrained windowed browser viewports to verify
  const viewports = [
    { width: 1280, height: 720 },
    { width: 1024, height: 600 },
    { width: 768, height: 800 }
  ];

  for (const vp of viewports) {
    console.log(`[Test] Setting viewport size to ${vp.width}x${vp.height}...`);
    await page.setViewportSize({ width: vp.width, height: vp.height });

    // Navigate to Main Menu
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 1. Assert that the "How to Play" button is visible
    // First let's check for translation selector (make sure it's in EN)
    const enButton = page.locator('button', { hasText: /^EN$/i });
    if (await enButton.isVisible().catch(() => false)) {
      await enButton.click();
    }

    const rulesButton = page.locator('button', { hasText: /How to Play/i });
    await expect(rulesButton).toBeVisible();

    // 2. Programmatically verify that the "How to Play" button is fully within the viewport
    const rulesBox = await rulesButton.boundingBox();
    expect(rulesBox, 'Rules button bounding box should exist').not.toBeNull();
    if (rulesBox) {
      const bottomCoord = rulesBox.y + rulesBox.height;
      console.log(`[Test] Rules button bottom coordinate is ${bottomCoord}px (Viewport Height: ${vp.height}px)`);
      expect(bottomCoord).toBeLessThanOrEqual(vp.height);
    }

    // 3. Assert that the Facebook button has been successfully removed (no element matching the Facebook URL)
    const facebookLink = page.locator('a[href*="facebook.com"]');
    await expect(facebookLink).toHaveCount(0);
  }
});

test('Main Menu: Root font-size clamping prevents gigantic elements on huge high-DPI viewports', async ({ page }) => {
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 1. Test QHD/4K high resolution viewport (e.g. 2560x1440)
  await page.setViewportSize({ width: 2560, height: 1440 });
  await page.waitForTimeout(500); // Wait for CSS calculation

  const qhdFontSize = await page.evaluate(() => {
    return window.getComputedStyle(document.documentElement).fontSize;
  });
  console.log(`[Test] Computed HTML root font-size at 2560x1440 (QHD): ${qhdFontSize}`);
  
  // Clamped to maximum 17px to prevent gigantic bloated visuals on large displays
  expect(qhdFontSize).toBe('17px');

  // 2. Test mid-range viewport (e.g. 1280x900)
  await page.setViewportSize({ width: 1280, height: 900 });
  await page.waitForTimeout(500);

  const midFontSize = await page.evaluate(() => {
    return window.getComputedStyle(document.documentElement).fontSize;
  });
  console.log(`[Test] Computed HTML root font-size at 1280x900 (Mid): ${midFontSize}`);
  
  // 1.4vh of 900px is 12.6px. Let's parse and check range.
  const numericSize = parseFloat(midFontSize);
  expect(numericSize).toBeLessThanOrEqual(13);
  expect(numericSize).toBeGreaterThanOrEqual(12.2);

  // 3. Test short viewport (e.g. 1280x720)
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.waitForTimeout(500);

  const shortFontSize = await page.evaluate(() => {
    return window.getComputedStyle(document.documentElement).fontSize;
  });
  console.log(`[Test] Computed HTML root font-size at 1280x720 (Short): ${shortFontSize}`);
  
  // Clamped to minimum 11px to keep text perfectly legible
  expect(shortFontSize).toBe('11px');
});

test('Main Menu: Mobile layout has large fonts, comfortable touch targets, and proper spacing', async ({ page }) => {
  // Set viewport to a typical tall mobile size (iPhone 12 Pro dimensions: 390 x 844)
  await page.setViewportSize({ width: 390, height: 844 });
  
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 1. Verify that the title "RONDA" (logo) is large and prominent on mobile (at least 48px / 3rem)
  const logo = page.locator('.menu-logo');
  await expect(logo).toBeVisible();
  const logoFontSize = await logo.evaluate(el => window.getComputedStyle(el).fontSize);
  console.log(`[Test] Mobile Logo Font Size: ${logoFontSize}`);
  const logoPx = parseFloat(logoFontSize);
  expect(logoPx).toBeGreaterThanOrEqual(48);

  // 2. Verify that the singleplayer button has a tall, comfortable height (excellent touch target, >= 52px)
  const singleplayerBtn = page.locator('.menu-btn-large');
  await expect(singleplayerBtn).toBeVisible();
  
  const btnBox = await singleplayerBtn.boundingBox();
  expect(btnBox).not.toBeNull();
  if (btnBox) {
    console.log(`[Test] Mobile Button Height: ${btnBox.height}px, Width: ${btnBox.width}px`);
    // Ensure button is nice and chunky, at least 52px tall
    expect(btnBox.height).toBeGreaterThanOrEqual(52);
    
    // Ensure button width does not stretch excessively flat across the screen (max 90% of screen width)
    expect(btnBox.width).toBeLessThanOrEqual(360);
  }
});


