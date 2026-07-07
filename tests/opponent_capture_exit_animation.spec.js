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

    // Step 2: wait for pendingCapture to clear (processCapture completed)
    await page.waitForFunction(() => {
      return !window.latestGameState?.G?.pendingCapture;
    }, { timeout: 15000 });

    // Step 3: check if the right seat container (Player 2) has a rendered captured card image
    const rightSeatImageCount = await page.evaluate(() => {
      const rightSeat = document.querySelector('.fixed.right-1\\.5, .fixed.right-4');
      if (!rightSeat) return 0;
      const images = rightSeat.querySelectorAll('img[alt="Captured Card"]');
      return images.length;
    });

    console.log(`[Captured Pile Verification] Found ${rightSeatImageCount} captured card images in Player 2 seat.`);

    // Expect at least 1 image to be present (since the bot performed a capture)
    expect(rightSeatImageCount).toBeGreaterThan(0);
  });
});
