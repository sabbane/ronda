import { test, expect } from '@playwright/test';

test('Non-interactive cards (opponent hand and table cards) should not have hover scale animations', async ({ page }) => {
  console.log('Navigating to home...');
  await page.goto('/');

  // 1. Set language to English for predictable UI elements
  const enButton = page.locator('button', { hasText: /^EN$/i });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // 2. Start a single-player game vs AI Bot
  const playButton = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i }).first();
  await expect(playButton).toBeVisible({ timeout: 10000 });
  await playButton.click();

  // 3. Wait for the game screen and ensure cards are loaded
  // The table should be visible and contain the initial 4 cards
  const table = page.locator('[data-test-id="game-table"]');
  await expect(table).toBeVisible({ timeout: 10000 });
  
  const tableCards = table.locator('.game-card');
  await expect(tableCards.first()).toBeVisible({ timeout: 10000 });

  // Opponent cards (hidden/face-down in 2-player mode) should also be visible
  const opponentCards = page.locator('.top-partner-hand .game-card');
  await expect(opponentCards.first()).toBeVisible({ timeout: 10000 });

  // Helper to verify that hovering does NOT scale/transform the card
  const verifyNoHoverScale = async (locator, label) => {
    // Scroll element into view if needed
    await locator.scrollIntoViewIfNeeded();

    // Get transform style before hover
    const transformBefore = await locator.evaluate(el => window.getComputedStyle(el).transform);
    console.log(`[${label}] Transform before hover: "${transformBefore}"`);

    // Hover over the element
    await locator.hover();
    
    // Wait for any potential Framer Motion / CSS transitions to complete (300ms)
    await page.waitForTimeout(300);

    // Get transform style after hover
    const transformAfter = await locator.evaluate(el => window.getComputedStyle(el).transform);
    console.log(`[${label}] Transform after hover: "${transformAfter}"`);

    // Clean up hover state by moving mouse back to body
    await page.locator('body').hover({ position: { x: 0, y: 0 } });
    await page.waitForTimeout(100);

    // Assert that the transform did not change (meaning no scale/hover effect applied)
    expect(transformAfter, `${label} card should not change its transform/scale on hover`).toBe(transformBefore);
  };

  // 4. Verify first opponent hand card does NOT scale on hover
  console.log('Verifying opponent card hover behavior...');
  await verifyNoHoverScale(opponentCards.first(), 'Opponent hand');

  // 5. Verify first table card does NOT scale on hover
  console.log('Verifying table card hover behavior...');
  await verifyNoHoverScale(tableCards.first(), 'Table');
});
