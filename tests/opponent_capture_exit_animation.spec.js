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

    console.log('Playing card and waiting for opponent capture + exit animation...');
    await firstHandCard.click();

    // Track how long the card element stays in the DOM after processCapture.
    // When processCapture fires:
    //   - G.pendingCapture becomes null
    //   - The captured card leaves G.table
    //   - Framer Motion AnimatePresence triggers the exit animation on the card
    //   - The card's element remains in the DOM while the exit animation plays,
    //     then is removed once the animation completes.
    // The duration of this DOM presence after processCapture = the exit animation duration.
    const result = await page.evaluate(async () => {
      // Step 1: wait for a pendingCapture to appear (bot played a capture)
      const startWait = Date.now();
      while (!window.latestGameState?.G?.pendingCapture) {
        await new Promise(r => setTimeout(r, 50));
        if (Date.now() - startWait > 12000) throw new Error('Timeout waiting for pendingCapture to be set');
      }

      const playedCardId = window.latestGameState.G.pendingCapture.playedCardId;
      // Format to get suit and value, e.g. "jben-1" -> data-testid="card-jben-1"
      const cardSelector = `[data-testid="card-${playedCardId}"]`;

      // Step 2: wait for pendingCapture to clear (processCapture was called)
      while (window.latestGameState?.G?.pendingCapture) {
        await new Promise(r => setTimeout(r, 50));
        if (Date.now() - startWait > 24000) throw new Error('Timeout waiting for pendingCapture to clear');
      }

      const exitStart = Date.now();

      // Step 3: check if the card element is still present in the DOM immediately after.
      const elAtStart = document.querySelector(cardSelector);
      if (!elAtStart) {
        return { exitDuration: 0, elementFoundAtStart: false, cardId: playedCardId };
      }

      // Step 4: poll until the element disappears (exit animation completes)
      while (document.querySelector(cardSelector)) {
        await new Promise(r => setTimeout(r, 50));
        if (Date.now() - exitStart > 5000) break;
      }

      return {
        exitDuration: Date.now() - exitStart,
        elementFoundAtStart: true,
        cardId: playedCardId
      };
    });

    console.log(`[Animation Log] Card exit from table: card=${result.cardId}, foundAtStart=${result.elementFoundAtStart}, exitDuration=${result.exitDuration}ms`);

    // The card element must still exist right after processCapture fires —
    // the exit animation should be playing, not instant.
    expect(result.elementFoundAtStart).toBe(true);

    // The Framer Motion AnimatePresence exit transition is 0.8s.
    // So the element must stay in the DOM for at least 400ms after processCapture.
    // Under the buggy state the element would disappear instantly (< 100ms).
    expect(result.exitDuration).toBeGreaterThan(400);
  });
});
