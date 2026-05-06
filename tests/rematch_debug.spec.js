import { test, expect } from '@playwright/test';

test('Rematch: Clicking Play Again resets for both players', async ({ browser }) => {
  const roomID = `rematch-${Math.floor(Math.random() * 1000)}`;
  
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await pageA.goto('http://localhost:5173');
  await pageA.fill('input[type="text"]', roomID);
  await pageA.click('button:has-text("Host")');

  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await pageB.goto('http://localhost:5173');
  await pageB.fill('input[type="text"]', roomID);
  await pageB.click('button:has-text("Join")');

  // Wait for board to load and animations
  await pageA.waitForTimeout(4000);
  
  // Play a card to trigger endIf on server
  const firstCard = pageA.locator('img').nth(1);
  await firstCard.click();

  // Check overlay (should appear due to temporary logic in game.js)
  await expect(pageA.locator('h2')).toBeVisible({ timeout: 15000 });
  await expect(pageB.locator('h2')).toBeVisible({ timeout: 15000 });

  console.log('GameOver overlay visible for both players.');

  // Click Play Again on Host
  await pageA.click('button:has-text("Play Again")');

  // Verify it disappears for BOTH
  await expect(pageA.locator('h2')).not.toBeVisible({ timeout: 10000 });
  await expect(pageB.locator('h2')).not.toBeVisible({ timeout: 10000 });

  console.log('Rematch successful: Overlay disappeared for both.');
});
