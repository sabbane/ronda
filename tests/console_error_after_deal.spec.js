import { test, expect } from '@playwright/test';

test('Detect console error after card dealing', async ({ page }) => {
  test.setTimeout(60000);
  const consoleErrors = [];

  // Register listeners to capture the specific error
  page.on('console', msg => {
    const text = msg.text();
    console.log(`[Browser Console] ${msg.type()}: ${text}`);
    // Catch either type 'error' or messages mentioning 'payload' or 'Cannot read properties of undefined'
    if (msg.type() === 'error' || text.includes('Cannot read properties of undefined') || text.includes('payload')) {
      consoleErrors.push(text);
    }
  });

  page.on('pageerror', error => {
    console.log(`[Captured Page Error] ${error.stack || error.message}`);
    consoleErrors.push(error.message);
  });

  // 1. Navigate to the game
  await page.goto('/');

  // 2. Select English language
  const enButton = page.locator('button', { hasText: /^EN$/i });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // 3. Click "Start Game" to play vs AI Bot
  const playBtn = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i });
  await expect(playBtn.first()).toBeVisible({ timeout: 10000 });
  await playBtn.first().click();

  // 4. Wait for the game board to load
  const mainContainer = page.locator('.min-h-screen').first();
  await expect(mainContainer).toBeVisible({ timeout: 10000 });
  console.log('Game board loaded. Waiting for cards to deal...');

  // Wait for initial dealing animations to complete and interactive cards to appear
  await expect(page.locator('.cursor-grab')).toHaveCount(3, { timeout: 15000 });
  console.log('Cards dealt. Watching for console errors...');

  // 5. Play through several moves to trigger redeals
  const myCards = page.locator('.cursor-grab');
  const gameOverOverlay = page.locator('h2', { hasText: /Game Over|Partie Terminée|انتهت اللعبة/i });

  const MAX_ATTEMPTS = 150;
  let attempts = 0;
  let cardsPlayed = 0;

  while (attempts < MAX_ATTEMPTS) {
    const cardCount = await myCards.count().catch(() => 0);
    console.log(`[Test Loop] attempt: ${attempts}, cardCount: ${cardCount}, cardsPlayed: ${cardsPlayed}`);

    // Assert no console errors have occurred so far
    if (consoleErrors.length > 0) {
      throw new Error(`Target console error detected: ${consoleErrors.join(', ')}`);
    }

    if (await gameOverOverlay.isVisible().catch(() => false) || cardsPlayed >= 4) {
      console.log(`Finished monitoring. Cards played: ${cardsPlayed}`);
      break;
    }

    if (cardCount > 0) {
      try {
        await myCards.first().click({ timeout: 500, force: true });
        cardsPlayed++;
        await page.waitForTimeout(800);
      } catch (e) {
        console.log(`[Test Loop] click failed: ${e.message}`);
      }
    }

    await page.waitForTimeout(600);
    attempts++;
  }

  // Final check
  expect(consoleErrors).toEqual([]);
});
