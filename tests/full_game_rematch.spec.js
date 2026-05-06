import { test, expect } from '@playwright/test';

test('Full Game Rematch: Round ends correctly and Play Again resets for both', async ({ browser }) => {
  const roomID = `fullgame-${Math.floor(Math.random() * 1000)}`;
  
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

  // Wait for initial deal
  await pageA.waitForTimeout(3000);

  // Play until both hands are empty (2 cards each)
  for (let i = 0; i < 2; i++) {
    // Player A (Turn 0)
    const cardA = pageA.locator('img[alt*="coins"], img[alt*="cups"]').first();
    await cardA.click();
    await pageA.waitForTimeout(2000); // Wait for turn transition

    // Player B (Turn 1)
    const cardB = pageB.locator('img[alt*="coins"], img[alt*="cups"]').first();
    await cardB.click();
    await pageB.waitForTimeout(2000);
  }

  // Check overlay (should appear now as deck and hands are empty)
  await expect(pageA.locator('h2')).toBeVisible({ timeout: 15000 });
  await expect(pageB.locator('h2')).toBeVisible({ timeout: 15000 });

  console.log('Round Over overlay visible for both players.');

  // Click Play Again on Host
  await pageA.click('button:has-text("Play Again")');

  // Verify it disappears for BOTH
  await expect(pageA.locator('h2')).not.toBeVisible({ timeout: 10000 });
  await expect(pageB.locator('h2')).not.toBeVisible({ timeout: 10000 });

  // Verify new cards are dealt (deck should be fresh)
  await expect(pageA.locator('img').nth(2)).toBeVisible();
  
  console.log('Rematch successful: Game restarted for both.');
});
