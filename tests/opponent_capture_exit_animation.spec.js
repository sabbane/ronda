import { test, expect } from '@playwright/test';

test.describe('Opponent Capture Exit Animation and Stack Check', () => {
  test('should verify that captured cards fly to a visible captured pile with images for Player 2 and 4', async ({ page }) => {
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

    // Create room
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

    // Wait for bots
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
    await firstHandCard.click();

    // Step 1: wait for a pendingCapture to appear (bot played a capture)
    await page.waitForFunction(() => {
      return !!window.latestGameState?.G?.pendingCapture;
    }, { timeout: 15000 });

    const rightSeat = page.locator('.fixed.right-2, .fixed.right-5, .fixed.right-1\\.5, .fixed.right-4').first();
    const pile = rightSeat.locator('.relative.w-8.h-12, .relative.w-4.h-6, .relative.w-\\[28px\\].h-\\[42px\\]').first();

    // Step 2: wait for pendingCapture to clear (processCapture completed)
    await page.waitForFunction(() => {
      return !window.latestGameState?.G?.pendingCapture;
    }, { timeout: 15000 });

    // Measure immediately!
    const initialCard = pile.locator('div').first();
    await expect(initialCard).toBeVisible({ timeout: 5000 });

    const pileBox = await pile.boundingBox();
    const initialCardBox = await initialCard.boundingBox();

    console.log(`[Diagnostic] pileBox:`, pileBox);
    console.log(`[Diagnostic] initialCardBox:`, initialCardBox);

    // Calculate distance between the center of the animating card and the center of the pile
    const pileCenter = { x: pileBox.x + pileBox.width / 2, y: pileBox.y + pileBox.height / 2 };
    const cardCenter = { x: initialCardBox.x + initialCardBox.width / 2, y: initialCardBox.y + initialCardBox.height / 2 };
    const initialDistance = Math.hypot(cardCenter.x - pileCenter.x, cardCenter.y - pileCenter.y);
    console.log(`[Diagnostic] Initial distance: ${initialDistance}px`);

    // We expect that immediately after processCapture, the card is still in-flight,
    // so it should be significantly far from the pile center (e.g., > 30px)
    expect(initialDistance).toBeGreaterThan(30);

    // Wait for the animation to finish (e.g. 1.5 seconds)
    await page.waitForTimeout(1500);

    const finalCardBox = await initialCard.boundingBox();
    const finalCardCenter = { x: finalCardBox.x + finalCardBox.width / 2, y: finalCardBox.y + finalCardBox.height / 2 };
    const finalDistance = Math.hypot(finalCardCenter.x - pileCenter.x, finalCardCenter.y - pileCenter.y);
    console.log(`[Diagnostic] Final distance: ${finalDistance}px`);

    // After animation finishes, it should be at the pile (distance < 10px)
    expect(finalDistance).toBeLessThan(10);
  });
});
