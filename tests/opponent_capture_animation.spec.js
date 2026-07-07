import { test, expect } from '@playwright/test';

test.describe('Opponent Capture Animation Speed Check', () => {
  test('should verify that opponent captures animate sequentially and do not settle too fast', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Navigate to homepage
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });
    
    page.on('pageerror', exception => {
      console.log(`[Browser PageError] ${exception.message}\n${exception.stack}`);
    });
    
    await page.goto('/?botFallback=true');

    // 2. Click Create Room
    const createRoomBtn = page.locator('button', { hasText: /Create Room/i }).first();
    await expect(createRoomBtn).toBeVisible({ timeout: 15000 });
    await createRoomBtn.click();

    // Fill Host Nickname
    const nameInput = page.locator('input[placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('HostPlayer');

    // 3. Select 4 Players
    const fourPlayersBtn = page.locator('button', { hasText: /4 Players/i }).first();
    await expect(fourPlayersBtn).toBeVisible({ timeout: 5000 });
    await fourPlayersBtn.click();

    // 4. Create
    await page.locator('button', { hasText: /^Public$/i }).first().click();
    await page.locator('button', { hasText: /^Create$/i }).first().click();

    // 5. Wait for Game Lobby
    await expect(page.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // 6. Wait for all 3 bots to join (checking their seat cards)
    const p2Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 2/i }) }).first();
    const p3Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 3/i }) }).first();
    const p4Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 4/i }) }).first();

    await expect(p2Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 30000 });
    await expect(p3Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 30000 });
    await expect(p4Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 30000 });

    // 7. Start Game using the gold button
    const startBtn = page.locator('.btn-moroccan-gold').first();
    await expect(startBtn).toBeEnabled({ timeout: 5000 });
    await startBtn.click();

    // 8. Wait for game board to load (our turn indicator)
    const turnIndicator = page.locator('text=/Your Turn/i');
    await expect(turnIndicator).toBeVisible({ timeout: 15000 });

    // 9. Locate first card in the player hand (10-dheb)
    const firstHandCard = page.locator('.game-hand').last().locator('.hand-card-container').first();
    await expect(firstHandCard).toBeVisible({ timeout: 5000 });
    await expect(firstHandCard).toHaveClass(/cursor-grab/, { timeout: 15000 });

    // 10. Play the card and measure the duration G.pendingCapture stays active on Player 1's capture
    console.log('Playing card and waiting for opponent capture...');
    await firstHandCard.click();

    const captureDuration = await page.evaluate(async () => {
      const startTime = Date.now();
      // Wait for G.pendingCapture to be set
      while (!window.latestGameState?.G?.pendingCapture) {
        await new Promise(r => setTimeout(r, 50));
        if (Date.now() - startTime > 10000) {
          throw new Error('Timeout waiting for pendingCapture');
        }
      }
      
      const captureStart = Date.now();
      // Wait for G.pendingCapture to be cleared
      while (window.latestGameState?.G?.pendingCapture) {
        await new Promise(r => setTimeout(r, 50));
        if (Date.now() - captureStart > 10000) {
          break;
        }
      }
      return Date.now() - captureStart;
    });

    console.log(`[Animation Log] G.pendingCapture was active for: ${captureDuration}ms`);
    
    // Assert that the capture stays active for at least 3000ms to allow sequential animation.
    // Under the buggy state, the bot calls processCapture immediately, clearing pendingCapture in < 1000ms.
    expect(captureDuration).toBeGreaterThan(3000);
  });
});
