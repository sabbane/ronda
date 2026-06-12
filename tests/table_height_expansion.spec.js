import { test, expect } from '@playwright/test';

test('Game table height stability and expansion assertions', async ({ page }) => {
  // ==========================================
  // PART 1: MOBILE VIEWPORT (3 cards per row)
  // ==========================================
  await page.setViewportSize({ width: 390, height: 844 });

  // 1a. Measure table height with 1 card (1 row)
  console.log('Mobile: Loading page with debug_table=1...');
  await page.goto('/?debug_table=1');
  const playButton1 = page.locator('button', { hasText: /Start Game/i }).first();
  if (await playButton1.isVisible().catch(() => false)) await playButton1.click();
  const table = page.locator('[data-test-id="game-table"]');
  await expect(table).toBeVisible();
  await expect(table.locator('.game-card-container')).toHaveCount(1, { timeout: 10000 });
  const boxMobile1 = await table.boundingBox();
  expect(boxMobile1).not.toBeNull();
  const heightMobile1 = boxMobile1.height;
  console.log(`Mobile table height (1 card): ${heightMobile1}px`);

  // 1b. Measure table height with 6 cards (2 rows)
  console.log('Mobile: Loading page with debug_table=6...');
  await page.goto('/?debug_table=6');
  const playButton2 = page.locator('button', { hasText: /Start Game/i }).first();
  if (await playButton2.isVisible().catch(() => false)) await playButton2.click();
  await expect(table).toBeVisible();
  await expect(table.locator('.game-card-container')).toHaveCount(6, { timeout: 10000 });
  const boxMobile6 = await table.boundingBox();
  expect(boxMobile6).not.toBeNull();
  const heightMobile6 = boxMobile6.height;
  console.log(`Mobile table height (6 cards): ${heightMobile6}px`);

  // 1c. Measure table height with 9 cards (3 rows)
  console.log('Mobile: Loading page with debug_table=9...');
  await page.goto('/?debug_table=9');
  const playButton3 = page.locator('button', { hasText: /Start Game/i }).first();
  if (await playButton3.isVisible().catch(() => false)) await playButton3.click();
  await expect(table).toBeVisible();
  await expect(table.locator('.game-card-container')).toHaveCount(9, { timeout: 10000 });
  const boxMobile9 = await table.boundingBox();
  expect(boxMobile9).not.toBeNull();
  const heightMobile9 = boxMobile9.height;
  console.log(`Mobile table height (9 cards): ${heightMobile9}px`);

  // 1d. Measure table height with 10 cards (4 rows)
  console.log('Mobile: Loading page with debug_table=10...');
  await page.goto('/?debug_table=10');
  const playButton4 = page.locator('button', { hasText: /Start Game/i }).first();
  if (await playButton4.isVisible().catch(() => false)) await playButton4.click();
  await expect(table).toBeVisible();
  await expect(table.locator('.game-card-container')).toHaveCount(10, { timeout: 10000 });
  const boxMobile10 = await table.boundingBox();
  expect(boxMobile10).not.toBeNull();
  const heightMobile10 = boxMobile10.height;
  console.log(`Mobile table height (10 cards): ${heightMobile10}px`);

  // ==========================================
  // PART 2: DESKTOP VIEWPORT (4 cards per row)
  // ==========================================
  await page.setViewportSize({ width: 1280, height: 800 });

  // 2a. Measure table height with 1 card (1 row)
  console.log('Desktop: Loading page with debug_table=1...');
  await page.goto('/?debug_table=1');
  const playButtonD1 = page.locator('button', { hasText: /Start Game/i }).first();
  if (await playButtonD1.isVisible().catch(() => false)) await playButtonD1.click();
  await expect(table).toBeVisible();
  await expect(table.locator('.game-card-container')).toHaveCount(1, { timeout: 10000 });
  const boxDesktop1 = await table.boundingBox();
  expect(boxDesktop1).not.toBeNull();
  const heightDesktop1 = boxDesktop1.height;
  console.log(`Desktop table height (1 card): ${heightDesktop1}px`);

  // 2b. Measure table height with 8 cards (2 rows)
  console.log('Desktop: Loading page with debug_table=8...');
  await page.goto('/?debug_table=8');
  const playButtonD8 = page.locator('button', { hasText: /Start Game/i }).first();
  if (await playButtonD8.isVisible().catch(() => false)) await playButtonD8.click();
  await expect(table).toBeVisible();
  await expect(table.locator('.game-card-container')).toHaveCount(8, { timeout: 10000 });
  const boxDesktop8 = await table.boundingBox();
  expect(boxDesktop8).not.toBeNull();
  const heightDesktop8 = boxDesktop8.height;
  console.log(`Desktop table height (8 cards): ${heightDesktop8}px`);

  // 2c. Measure table height with 9 cards (3 rows)
  console.log('Desktop: Loading page with debug_table=9...');
  await page.goto('/?debug_table=9');
  const playButtonD9 = page.locator('button', { hasText: /Start Game/i }).first();
  if (await playButtonD9.isVisible().catch(() => false)) await playButtonD9.click();
  await expect(table).toBeVisible();
  await expect(table.locator('.game-card-container')).toHaveCount(9, { timeout: 10000 });
  const boxDesktop9 = await table.boundingBox();
  expect(boxDesktop9).not.toBeNull();
  const heightDesktop9 = boxDesktop9.height;
  console.log(`Desktop table height (9 cards): ${heightDesktop9}px`);

  // ==========================================
  // ASSERTIONS
  // ==========================================
  
  // Mobile Assertions: 1, 6, 9 cards must have identical height, 10 must be strictly larger
  expect(heightMobile6, 'Mobile table height must not change between 1 and 6 cards').toBe(heightMobile1);
  expect(heightMobile9, 'Mobile table height must not change between 1 and 9 cards').toBe(heightMobile1);
  expect(heightMobile10, 'Mobile table height must expand starting from the 4th row (10+ cards)').toBeGreaterThan(heightMobile9);

  // Desktop Assertions: 1 and 8 cards must have identical height, 9 must be strictly larger
  expect(heightDesktop8, 'Desktop table height must not change between 1 and 8 cards').toBe(heightDesktop1);
  expect(heightDesktop9, 'Desktop table height must expand starting from the 3rd row (9+ cards)').toBeGreaterThan(heightDesktop8);
});
