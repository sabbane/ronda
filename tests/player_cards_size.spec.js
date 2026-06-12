import { test, expect } from '@playwright/test';

test('Gameplay: Player hand cards must be compact and well-proportioned at QHD/4K resolutions', async ({ page }) => {
  // 1. Set a standard QHD 4K scaled viewport (2560x1440)
  await page.setViewportSize({ width: 2560, height: 1440 });

  // 2. Load the main page
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // Select English language for consistency
  const enButton = page.locator('button', { hasText: /^EN$/i });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // 3. Click "Start Game" under Singleplayer
  const playButton = page.locator('button', { hasText: /Start Game/i }).first();
  await expect(playButton).toBeVisible();
  await playButton.click();

  // 4. Wait for the gameplay board to render (cards count should be visible)
  const cards = page.locator('img[src*="-vector.svg"]:not([aria-hidden="true"])');
  await expect(cards).toHaveCount(7, { timeout: 10000 });

  // 5. Locate the first card in the player's active hand
  // The player area's hand is the bottom .game-hand container
  const playerHand = page.locator('.game-hand').last();
  const playerCard = playerHand.locator('.hand-card-container').first();
  await expect(playerCard).toBeVisible();

  // 6. Get bounding box coordinates and size
  const box = await playerCard.boundingBox();
  expect(box, 'Player card bounding box should exist').not.toBeNull();
  
  if (box) {
    console.log(`[Test Measure] Player Hand Card - Width: ${box.width}px, Height: ${box.height}px`);
    
    // Assert that the card height is compact (strictly under 155px)
    // This will pass now that we have constrained the parent motion.div wrapper size
    expect(box.height, 'Player hand cards should be compact (<= 155px) on large screens').toBeLessThanOrEqual(155);
  }
});
