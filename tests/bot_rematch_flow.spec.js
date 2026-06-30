import { test, expect } from '@playwright/test';

test.describe('Multiplayer: Bot Rematch Flow and Early Disconnect', () => {
  test.setTimeout(300_000); // 5 minutes safety timeout for a complete game

  test('bot stays connected at game over and accepts rematch challenge', async ({ page }) => {
    // Listen to console logs for debugging
    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));

    // 1. Navigate to homepage with botFallback enabled
    console.log('Navigating to homepage...');
    await page.goto('/?botFallback=true');

    // 2. Select English
    const enButton = page.locator('button', { hasText: /^EN$/i });
    if (await enButton.isVisible().catch(() => false)) await enButton.click();

    // 3. Create a public multiplayer room
    console.log('Creating a public multiplayer room...');
    await page.locator('button', { hasText: /Create Room/i }).first().click();
    await page.locator('input[placeholder*="name" i]').first().fill('HostPlayer');
    await page.locator('button', { hasText: /^Public$/i }).first().click();
    await page.locator('button', { hasText: /^Create$/i }).first().click();

    // 4. Wait for Game Lobby
    console.log('Waiting for lobby...');
    await expect(page.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // 5. Wait for bot to automatically join
    const opponentSeat = page.locator('div', { has: page.locator('div', { hasText: /^Opponent$/i }) }).first();
    const botNameSpan = opponentSeat.locator('span.text-slate-200').first();
    await expect(botNameSpan).toBeVisible({ timeout: 10000 });
    const botName = await botNameSpan.innerText();
    console.log(`Bot joined: "${botName}"`);

    // 6. Host starts the game manually
    const startGameBtn = page.locator('button', { hasText: /Start Game/i }).first();
    await expect(startGameBtn).toBeEnabled();
    await startGameBtn.click();
    console.log('Game started.');

    // 7. Wait for the game board to load
    const myCards = page.locator('.cursor-grab');
    await expect(myCards).toHaveCount(3, { timeout: 15000 });
    console.log('Game board loaded. Playing cards to completion...');

    // 8. Auto-play cards until Game Over or Opponent Left modal appears
    const gameOverOverlay = page.locator('h2', { hasText: /Game Over|Partie Terminée|انتهت اللعبة/i });
    const opponentLeftModal = page.locator('text=/opponent left|adversaire a quitté|غادر الخصم/i').first();

    let attempts = 0;
    const MAX_ATTEMPTS = 400;

    while (attempts < MAX_ATTEMPTS) {
      if (await gameOverOverlay.isVisible().catch(() => false)) {
        console.log('Game Over screen is visible.');
        break;
      }
      if (await opponentLeftModal.isVisible().catch(() => false)) {
        console.log('WARNING: Opponent Left modal appeared early!');
        break;
      }

      const cardCount = await myCards.count().catch(() => 0);
      if (cardCount > 0) {
        try {
          await myCards.first().click({ timeout: 500, force: true });
          await page.waitForTimeout(700);
        } catch { /* ignore */ }
      }
      await page.waitForTimeout(500);
      attempts++;
    }

    // 9. Assertions at game end:
    // - Opponent Left modal must NOT be visible (bot should not disconnect/leave)
    // - Game Over overlay must be visible
    console.log('Verifying end game states...');
    await expect(opponentLeftModal).not.toBeVisible({ timeout: 1000 });
    await expect(gameOverOverlay).toBeVisible({ timeout: 10000 });

    // 10. Click "Play Again" and verify game restarts
    console.log('Clicking Play Again...');
    // Mock adBreak so it bypasses instantly in tests
    await page.evaluate(() => {
      window.adBreak = (options) => {
        if (options && typeof options.adBreakDone === 'function') {
          options.adBreakDone({ breakStatus: 'not_shown' });
        }
      };
    });
    
    const playAgainBtn = page.locator('button', { hasText: /Play Again|Rejouer|إعادة اللعب/i }).first();
    await expect(playAgainBtn).toBeVisible();
    await playAgainBtn.click();

    // Verify game over screen is dismissed and new cards are dealt
    console.log('Verifying game restarts...');
    await expect(gameOverOverlay).not.toBeVisible({ timeout: 15000 });
    await expect(myCards.first()).toBeVisible({ timeout: 15000 });
    console.log('✅ Success: New round started after rematch!');
  });
});
