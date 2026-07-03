import { test, expect } from '@playwright/test';

test.describe('Sequential Deal Card Delays Check', () => {
  test('should assert sequential deal delays for all 4 players', async ({ page }) => {
    test.setTimeout(60000);

    // 1. Navigate to homepage
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });
    await page.goto('/?botFallback=true');

    // 2. Select English
    const enButton = page.locator('button', { hasText: /^EN$/i });
    if (await enButton.isVisible().catch(() => false)) await enButton.click();

    // 3. Create Room
    await page.locator('button', { hasText: /Create Room/i }).first().click();
    await page.locator('input[placeholder*="name" i]').first().fill('HostPlayer');

    // 4. Select 4 Players
    const fourPlayersBtn = page.locator('button', { hasText: /4 Players/i }).first();
    await expect(fourPlayersBtn).toBeVisible({ timeout: 5000 });
    await fourPlayersBtn.click();

    // 5. Create
    await page.locator('button', { hasText: /^Public$/i }).first().click();
    await page.locator('button', { hasText: /^Create$/i }).first().click();

    // 6. Wait for Game Lobby
    await expect(page.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // 7. Wait for all 3 bots to join
    const p2Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 2/i }) }).first();
    const p3Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 3/i }) }).first();
    const p4Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 4/i }) }).first();

    await expect(p2Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 30000 });
    await expect(p3Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 30000 });
    await expect(p4Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 30000 });

    // 8. Start Game
    const startBtn = page.locator('button', { hasText: /Start Game/i }).first();
    await expect(startBtn).toBeEnabled({ timeout: 5000 });
    await startBtn.click();

    // 9. Wait for game board to load
    const turnIndicator = page.locator('text=/Your Turn/i');
    await expect(turnIndicator).toBeVisible({ timeout: 15000 });

    // Helper to extract the transition delay of a card from its React props
    const getCardDelay = async (locator, index) => {
      const card = locator.locator('.hand-card-container').nth(index);
      return await card.evaluate((el) => {
        const fiberKey = Object.keys(el).find(k => k.startsWith('__reactFiber'));
        if (!fiberKey) return null;
        let fiber = el[fiberKey];
        while (fiber) {
          if (fiber.memoizedProps && fiber.memoizedProps.transition) {
            return fiber.memoizedProps.transition.delay;
          }
          fiber = fiber.return;
        }
        return null;
      });
    };

    // Locators for each player's hand container
    const player0Hand = page.locator('.game-hand').last(); // Player 0 (Host)
    const player1Hand = page.locator('.game-hand-vertical').nth(1); // Player 1 (Right opponent)
    const player2Hand = page.locator('.game-hand').first(); // Player 2 (Top partner)
    const player3Hand = page.locator('.game-hand-vertical').first(); // Player 3 (Left opponent)

    // Expected sequential deal delays:
    // Player 0: [0.0, 1.2, 2.4]
    // Player 1: [0.3, 1.5, 2.7]
    // Player 2: [0.6, 1.8, 3.0]
    // Player 3: [0.9, 2.1, 3.3]
    const expectedDelays = [
      [0.0, 1.2, 2.4],
      [0.3, 1.5, 2.7],
      [0.6, 1.8, 3.0],
      [0.9, 2.1, 3.3],
    ];

    const hands = [player0Hand, player1Hand, player2Hand, player3Hand];

    for (let p = 0; p < 4; p++) {
      console.log(`Checking Player ${p} card deal delays...`);
      for (let c = 0; c < 3; c++) {
        const delay = await getCardDelay(hands[p], c);
        console.log(`Player ${p} Card ${c} delay: ${delay}s (Expected: ${expectedDelays[p][c]}s)`);
        expect(delay).toBeCloseTo(expectedDelays[p][c], 1);
      }
    }
  });
});
