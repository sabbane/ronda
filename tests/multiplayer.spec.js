import { test, expect } from '@playwright/test';

test('Multiplayer: Two players can join and see the board', async ({ browser }) => {
  const roomID = `test-${Math.floor(Math.random() * 1000)}`;
  
  // Context A: Host
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await pageA.goto('/');
  
  await pageA.fill('input[type="text"]', roomID);
  await pageA.click('button:has-text("Host")');
  
  // Wait for board to appear
  await expect(pageA.locator('h1')).not.toBeVisible({ timeout: 15000 }); // h1 is the logo on menu, board has h2 etc.
  // Actually check for specific board element
  await expect(pageA.locator('div.min-h-screen.bg-black')).toBeVisible();

  // Context B: Joiner
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await pageB.goto('/');

  await pageB.fill('input[type="text"]', roomID);
  await pageB.click('button:has-text("Join")');

  // Both should see the game container
  await expect(pageA.locator('.min-h-screen').first()).toBeVisible({ timeout: 15000 });
  await expect(pageB.locator('.min-h-screen').first()).toBeVisible({ timeout: 15000 });
});
