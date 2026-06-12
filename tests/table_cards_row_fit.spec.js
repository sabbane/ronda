import { test, expect } from '@playwright/test';

test('Mobile layout: at least 3 cards must fit in a single row on the table', async ({ page }) => {
  // Set viewport to a standard mobile screen size
  await page.setViewportSize({ width: 390, height: 844 });

  console.log('Navigating to game...');
  await page.goto('/');

  // Select English for consistent navigation
  const enButton = page.locator('button').filter({ has: page.locator('img[alt="EN"]') }).first();
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // Click Start Game to load the table
  const playButton = page.locator('button', { hasText: /Start Game/i }).first();
  await expect(playButton).toBeVisible();
  await playButton.click();

  // Wait for the table and cards to load (initial state has 4 cards on the table)
  const table = page.locator('[data-test-id="game-table"]');
  await expect(table).toBeVisible();
  
  const tableCards = table.locator('.game-card-container');
  await expect(tableCards).toHaveCount(4, { timeout: 10000 });

  // Get bounding box of the first three table cards
  const box1 = await tableCards.nth(0).boundingBox();
  const box2 = await tableCards.nth(1).boundingBox();
  const box3 = await tableCards.nth(2).boundingBox();

  expect(box1).not.toBeNull();
  expect(box2).not.toBeNull();
  expect(box3).not.toBeNull();

  if (box1 && box2 && box3) {
    console.log(`Card 1 Y position: ${box1.y}px`);
    console.log(`Card 2 Y position: ${box2.y}px`);
    console.log(`Card 3 Y position: ${box3.y}px`);

    // We check if Card 3 is in the same row as Card 1.
    // If only 2 cards fit in a row, Card 3 wraps to a new line, and its Y coordinate
    // will be significantly larger (by the height of a card, which is > 100px).
    const yDifference = Math.abs(box3.y - box1.y);
    console.log(`Y difference between Card 1 and Card 3: ${yDifference}px`);

    // Assert that the difference is minimal (less than 10px), meaning they are on the same line.
    expect(yDifference, 'Card 3 should be on the same row as Card 1').toBeLessThan(10);
  }
});
