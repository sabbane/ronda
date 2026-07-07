import { test, expect } from '@playwright/test';

test.describe('Opponent Capture Exit Animation Speed Check', () => {
  test('should verify that captured cards visually animate (fly) to the player pile slow enough to be seen', async ({ page }) => {
    test.setTimeout(60000);

    page.on('console', msg => {
      if (!msg.text().startsWith('[vite]') && !msg.text().startsWith('%c')) {
        console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
      }
    });

    page.on('pageerror', exception => {
      console.log(`[Browser PageError] ${exception.message}\n${exception.stack}`);
    });

    await page.goto('/?botFallback=true');

    // Create room, pick 4 players
    const createRoomBtn = page.locator('button', { hasText: /Create Room/i }).first();
    await expect(createRoomBtn).toBeVisible({ timeout: 15000 });
    await createRoomBtn.click();

    const nameInput = page.locator('input[placeholder*="name" i]').first();
    await expect(nameInput).toBeVisible({ timeout: 5000 });
    await nameInput.fill('HostPlayer');

    const fourPlayersBtn = page.locator('button', { hasText: /4 Players/i }).first();
    await expect(fourPlayersBtn).toBeVisible({ timeout: 5000 });
    await fourPlayersBtn.click();

    await page.locator('button', { hasText: /^Public$/i }).first().click();
    await page.locator('button', { hasText: /^Create$/i }).first().click();

    await expect(page.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // Wait for all 3 bots
    const p2Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 2/i }) }).first();
    const p3Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 3/i }) }).first();
    const p4Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 4/i }) }).first();
    await expect(p2Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 30000 });
    await expect(p3Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 30000 });
    await expect(p4Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 30000 });

    // Start game
    const startBtn = page.locator('.btn-moroccan-gold').first();
    await expect(startBtn).toBeEnabled({ timeout: 5000 });
    await startBtn.click();

    await expect(page.locator('text=/Your Turn/i')).toBeVisible({ timeout: 15000 });

    // Play a card to trigger opponent capture
    const firstHandCard = page.locator('.game-hand').last().locator('.hand-card-container').first();
    await expect(firstHandCard).toBeVisible({ timeout: 5000 });
    await expect(firstHandCard).toHaveClass(/cursor-grab/, { timeout: 15000 });

    console.log('Playing card and waiting for opponent capture to register in G...');
    await firstHandCard.click();

    // Step 1: wait for a pendingCapture to appear (bot played a capture)
    await page.waitForFunction(() => {
      return !!window.latestGameState?.G?.pendingCapture;
    }, { timeout: 15000 });

    // Step 2: wait for pendingCapture to clear (processCapture was called and cards moved to captured pile)
    await page.waitForFunction(() => {
      return !window.latestGameState?.G?.pendingCapture;
    }, { timeout: 15000 });

    // Step 3: Inspect the transition properties of the captured card element in the Right player's seat (Player 2)
    const cardTransition = await page.evaluate(async () => {
      const rightSeat = document.querySelector('.fixed.right-1\\.5, .fixed.right-4');
      if (!rightSeat) return null;

      const divs = Array.from(rightSeat.querySelectorAll('div'));
      for (const div of divs) {
        // Skip divs that are part of the hand container
        if (div.closest('.game-hand-vertical')) continue;

        const fiberKey = Object.keys(div).find(k => k.startsWith('__reactFiber'));
        if (!fiberKey) continue;
        let fiber = div[fiberKey];
        while (fiber) {
          if (fiber.memoizedProps && fiber.memoizedProps.layoutId && fiber.memoizedProps.layoutId.startsWith('card-')) {
            return {
              layoutId: fiber.memoizedProps.layoutId,
              transition: fiber.memoizedProps.transition
            };
          }
          fiber = fiber.return;
        }
      }
      return null;
    });

    console.log(`[Captured Card Transition Check] Result: ${JSON.stringify(cardTransition)}`);

    expect(cardTransition).not.toBeNull();
    expect(cardTransition.transition).not.toBeUndefined();
    expect(cardTransition.transition.type).toBe('spring');
    expect(cardTransition.transition.stiffness).toBe(40);
    expect(cardTransition.transition.damping).toBe(12);
  });
});
