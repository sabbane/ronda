import { test, expect } from '@playwright/test';

test.describe('Functional Test: Complete Multiplayer Game', () => {
  test.setTimeout(420_000); // 7 minutes - animations are now much longer

  test('Two human players can complete a full game', async ({ browser }) => {
    const roomID = `mp-test-${Date.now()}`;
    
    // 1. Setup Player 1 (Host)
    const context1 = await browser.newContext();
    const page1 = await context1.newPage();
    await page1.goto('/');
    
    // Select Language (English) for consistency if buttons appear
    const enButton1 = page1.locator('button', { hasText: /^EN$/i });
    if (await enButton1.isVisible().catch(() => false)) await enButton1.click();

    console.log(`P1: Hosting room ${roomID}...`);
    const roomInput1 = page1.locator('input[type="text"]');
    await expect(roomInput1).toBeVisible();
    await roomInput1.fill(roomID);
    
    const hostBtn = page1.locator('button', { hasText: /Host|Créer|Hosten|انشاء/i });
    await hostBtn.click();

    // 2. Setup Player 2 (Joiner)
    const context2 = await browser.newContext();
    const page2 = await context2.newPage();
    await page2.goto('/');
    
    const enButton2 = page2.locator('button', { hasText: /^EN$/i });
    if (await enButton2.isVisible().catch(() => false)) await enButton2.click();

    console.log(`P2: Joining room ${roomID}...`);
    const roomInput2 = page2.locator('input[type="text"]');
    await roomInput2.fill(roomID);
    
    const joinBtn = page2.locator('button', { hasText: /Join|Rejoindre|Beitreten|انضمام/i });
    await joinBtn.click();

    // 3. Verify Board Loading & Rendering for both
    const tableArea1 = page1.locator('.bg-emerald-900\\/40').first();
    const tableArea2 = page2.locator('.bg-emerald-900\\/40').first();
    
    await expect(tableArea1).toBeVisible({ timeout: 20000 });
    await expect(tableArea2).toBeVisible({ timeout: 20000 });
    console.log('Game board loaded for both players.');

    // --- RENDERING CHECK (Wait for dealing) ---
    await page1.waitForTimeout(5000); 
    
    const tableCount1 = await tableArea1.locator('img').count();
    const tableCount2 = await tableArea2.locator('img').count();
    
    console.log(`Diagnostic: P1 Table Cards: ${tableCount1}, P2 Table Cards: ${tableCount2}`);
    
    expect(tableCount1, 'P1 should see 4 cards on table').toBe(4);
    expect(tableCount2, 'P2 should see 4 cards on table').toBe(4);
    console.log('✅ Initial rendering verified for both players.');

    // 4. Play Game Automatically
    const gameOver1 = page1.locator('h2', { hasText: /Game Over|Partie Terminée|Spielende|انتهت اللعبة/i });
    const gameOver2 = page2.locator('h2', { hasText: /Game Over|Partie Terminée|Spielende|انتهت اللعبة/i });

    let attempts = 0;
    const MAX_ATTEMPTS = 500;

    console.log('Starting automated multiplayer gameplay...');

    while (attempts < MAX_ATTEMPTS) {
      // Check for Game Over
      if (await gameOver1.isVisible().catch(() => false)) {
        console.log('Game Over detected on P1 screen.');
        break;
      }

      // Try to play card for P1
      const p1Hand = page1.locator('.cursor-grab');
      if (await p1Hand.count() > 0) {
        try {
          await p1Hand.first().click({ timeout: 500 });
          await page1.waitForTimeout(500);
        } catch { /* ignore */ }
      }

      // Try to play card for P2
      const p2Hand = page2.locator('.cursor-grab');
      if (await p2Hand.count() > 0) {
        try {
          await p2Hand.first().click({ timeout: 500 });
          await page2.waitForTimeout(500);
        } catch { /* ignore */ }
      }

      await page1.waitForTimeout(600);
      attempts++;
    }

    // 5. Final Assertions
    await expect(gameOver1).toBeVisible({ timeout: 10000 });
    await expect(gameOver2).toBeVisible({ timeout: 10000 });
    console.log('✅ Success: Both players reached the Game Over screen.');

    const playAgain1 = page1.locator('button', { hasText: /Play Again|Rejouer|Erneut spielen|إعادة اللعب/i });
    await expect(playAgain1).toBeVisible();
    console.log('✅ Success: Multiplayer game lifecycle completed successfully.');
  });
});
