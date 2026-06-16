import { test, expect } from '@playwright/test';

test('Table must not temporarily expand during a capture at threshold limits (mobile and desktop)', async ({ page }) => {
  // Set to mobile viewport size (3 columns per row)
  await page.setViewportSize({ width: 375, height: 812 });

  // 1a. Measure the baseline height of a stable 9-card table (3 rows)
  console.log('Mobile: Loading baseline page with debug_table=9...');
  await page.goto('/?debug_table=9');
  
  const enButton1 = page.locator('button', { hasText: 'EN' }).first();
  await enButton1.waitFor({ state: 'visible', timeout: 10000 });
  await enButton1.click();
  
  const playButton1 = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i }).first();
  await expect(playButton1).toBeVisible({ timeout: 15000 });
  await playButton1.click();

  const table = page.locator('[data-test-id="game-table"]');
  await expect(table).toBeVisible({ timeout: 15000 });
  await expect(table.locator('.game-card')).toHaveCount(9, { timeout: 10000 });

  const baselineBoxMobile = await table.boundingBox();
  expect(baselineBoxMobile).not.toBeNull();
  const baselineHeightMobile = baselineBoxMobile.height;
  console.log(`Mobile table baseline height (9 cards, 3 rows): ${baselineHeightMobile}px`);

  // 1b. Measure the height during capture with 9 cards on table + 1 played card in-flight
  console.log('Mobile: Loading page with debug_table=10&debug_capture=true...');
  await page.goto('/?debug_table=10&debug_capture=true');

  const enButton2 = page.locator('button', { hasText: 'EN' }).first();
  await enButton2.waitFor({ state: 'visible', timeout: 10000 });
  await enButton2.click();

  const playButton2 = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i }).first();
  await expect(playButton2).toBeVisible({ timeout: 15000 });
  await playButton2.click();

  await expect(table).toBeVisible({ timeout: 15000 });
  await expect(table.locator('.game-card')).toHaveCount(10, { timeout: 10000 });

  const captureBoxMobile = await table.boundingBox();
  expect(captureBoxMobile).not.toBeNull();
  const captureHeightMobile = captureBoxMobile.height;
  console.log(`Mobile table height during capture (9+1 cards): ${captureHeightMobile}px`);


  // ==========================================
  // PART 2: DESKTOP VIEWPORT (4 columns, 8 cards threshold)
  // ==========================================
  await page.setViewportSize({ width: 1280, height: 800 });

  // 2a. Measure the baseline height of a stable 8-card table (2 rows)
  console.log('Desktop: Loading baseline page with debug_table=8...');
  await page.goto('/?debug_table=8');

  const enButton3 = page.locator('button', { hasText: 'EN' }).first();
  await enButton3.waitFor({ state: 'visible', timeout: 10000 });
  await enButton3.click();

  const playButton3 = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i }).first();
  await expect(playButton3).toBeVisible({ timeout: 15000 });
  await playButton3.click();

  await expect(table).toBeVisible({ timeout: 15000 });
  await expect(table.locator('.game-card')).toHaveCount(8, { timeout: 10000 });

  const baselineBoxDesktop = await table.boundingBox();
  expect(baselineBoxDesktop).not.toBeNull();
  const baselineHeightDesktop = baselineBoxDesktop.height;
  console.log(`Desktop table baseline height (8 cards, 2 rows): ${baselineHeightDesktop}px`);

  // 2b. Measure the height during capture with 8 cards on table + 1 played card in-flight
  console.log('Desktop: Loading page with debug_table=9&debug_capture=true...');
  await page.goto('/?debug_table=9&debug_capture=true');

  const enButton4 = page.locator('button', { hasText: 'EN' }).first();
  await enButton4.waitFor({ state: 'visible', timeout: 10000 });
  await enButton4.click();

  const playButton4 = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i }).first();
  await expect(playButton4).toBeVisible({ timeout: 15000 });
  await playButton4.click();

  await expect(table).toBeVisible({ timeout: 15000 });
  await expect(table.locator('.game-card')).toHaveCount(9, { timeout: 10000 });

  const captureBoxDesktop = await table.boundingBox();
  expect(captureBoxDesktop).not.toBeNull();
  const captureHeightDesktop = captureBoxDesktop.height;
  console.log(`Desktop table height during capture (8+1 cards): ${captureHeightDesktop}px`);


  // ==========================================
  // ASSERTIONS
  // ==========================================
  
  // Mobile: The capture height should be exactly the same as the 9-card baseline (3 rows).
  expect(captureHeightMobile, 'Mobile table must not expand during capture').toBe(baselineHeightMobile);

  // Desktop: The capture height should be exactly the same as the 8-card baseline (2 rows).
  expect(captureHeightDesktop, 'Desktop table must not expand during capture').toBe(baselineHeightDesktop);
});
