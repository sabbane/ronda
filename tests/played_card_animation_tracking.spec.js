import { test, expect } from '@playwright/test';

test('Played card must move along with subsequent target cards during a capture animation', async ({ page }) => {
  // Listen for console and page errors
  page.on('pageerror', err => {
    console.error('>>> [Page Error]:', err.message);
  });
  page.on('console', msg => {
    if (msg.type() === 'error') {
      console.error('>>> [Console Error]:', msg.text());
    } else {
      console.log('>>> [Console]:', msg.text());
    }
  });

  // Set to mobile viewport size
  await page.setViewportSize({ width: 375, height: 812 });

  // 1. Load the page in debug capture mode with 10 cards (9 table cards + 1 played card)
  console.log('Loading page with debug_table=10&debug_capture=true...');
  await page.goto('/?debug_table=10&debug_capture=true');
  
  // Switch to English language to stabilize button texts
  const enButton = page.locator('button', { hasText: 'EN' }).first();
  await enButton.waitFor({ state: 'visible', timeout: 10000 });
  await enButton.click();
  
  const playButton = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i }).first();
  await expect(playButton).toBeVisible({ timeout: 15000 });
  await playButton.click();

  const table = page.locator('[data-test-id="game-table"]');
  await expect(table).toBeVisible({ timeout: 15000 });
  
  // Locate the played card (dheb-10) and target cards (dheb-1, dheb-2)
  const playedCard = page.locator('[data-testid="card-dheb-10"]').first();
  const targetCard1 = page.locator('[data-testid="card-dheb-1"]').first();
  const targetCard2 = page.locator('[data-testid="card-dheb-2"]').first();

  await expect(playedCard).toBeVisible({ timeout: 10000 });
  await expect(targetCard1).toBeVisible({ timeout: 10000 });
  await expect(targetCard2).toBeVisible({ timeout: 10000 });

  // 2. Wait for captureStep to be 0 and measure positions (after entry transition completes)
  console.log('Waiting for data-capture-step to be 0...');
  await expect(table).toHaveAttribute('data-capture-step', '0', { timeout: 10000 });
  console.log('Waiting for card to enter table and settle at step 0 (600ms)...');
  await page.waitForTimeout(600); // let initial layout and entry transition settle
  const playedBox0 = await playedCard.boundingBox();
  const targetBox1 = await targetCard1.boundingBox();
  const targetBox2 = await targetCard2.boundingBox();

  expect(playedBox0).not.toBeNull();
  expect(targetBox1).not.toBeNull();
  expect(targetBox2).not.toBeNull();

  // The played card should start aligned with the first target card (dheb-1)
  const distToTarget1_Step0 = Math.abs(playedBox0.x - targetBox1.x) + Math.abs(playedBox0.y - targetBox1.y);
  console.log(`Step 0: Distance from played card to target 1 is ${distToTarget1_Step0}px`);
  expect(distToTarget1_Step0).toBeLessThan(35); // Allow some offset/padding stack spacing

  // 3. Wait for captureStep to increment to 1 (targeting dheb-2) and the animation to finish
  console.log('Waiting for data-capture-step to be 1...');
  await expect(table).toHaveAttribute('data-capture-step', '1', { timeout: 10000 });
  console.log('Waiting for step 1 slide transition to settle (1000ms)...');
  await page.waitForTimeout(1000); // the transition duration is 1.0s

  const playedBox1 = await playedCard.boundingBox();
  expect(playedBox1).not.toBeNull();

  const distToTarget2_Step1 = Math.abs(playedBox1.x - targetBox2.x) + Math.abs(playedBox1.y - targetBox2.y);
  console.log(`Step 1: Distance from played card to target 2 is ${distToTarget2_Step1}px`);

  // Assert that the played card has moved to target 2 (dheb-2)
  expect(distToTarget2_Step1, 'Played card should be aligned with target card 2 at step 1').toBeLessThan(35);
});
