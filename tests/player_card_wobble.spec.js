import { test, expect } from '@playwright/test';

test.describe('Player Card Animation: Wobble Check', () => {
  test('should verify that playing a card transitions directly without wobbling/overshooting', async ({ page }) => {
    test.setTimeout(120000);

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

    const p2Name = p2Seat.locator('span.text-slate-200').first();
    const p3Name = p3Seat.locator('span.text-slate-200').first();
    const p4Name = p4Seat.locator('span.text-slate-200').first();

    await expect(p2Name).toBeVisible({ timeout: 30000 });
    await expect(p3Name).toBeVisible({ timeout: 30000 });
    await expect(p4Name).toBeVisible({ timeout: 30000 });

    // 8. Start Game
    const startBtn = page.locator('button', { hasText: /Start Game/i }).first();
    await expect(startBtn).toBeEnabled({ timeout: 5000 });
    await startBtn.click();

    // 9. Wait for game board to load
    const turnIndicator = page.locator('text=/Your Turn/i');
    await expect(turnIndicator).toBeVisible({ timeout: 15000 });

    // 10. Locate first card in the player hand
    const firstHandCard = page.locator('.game-hand').last().locator('.hand-card-container').first();
    await expect(firstHandCard).toBeVisible({ timeout: 5000 });
    await expect(firstHandCard).toHaveClass(/cursor-grab/, { timeout: 15000 });

    // 11. Play the card and sample its y-position on the table to detect bounce/overshoot
    console.log('Playing card and sampling animation coordinates...');
    await firstHandCard.click();

    const tableCard = page.locator('.game-table .z-50').first();
    try {
      await expect(tableCard).toBeVisible({ timeout: 5000 });
    } catch (err) {
      console.log('--- Game Table HTML ---');
      console.log(await page.locator('.game-table').innerHTML().catch(() => 'no table'));
      throw err;
    }

    const yValues = [];
    const startTime = Date.now();

    // Sample coordinates every 8ms for 1100ms
    while (Date.now() - startTime < 1100) {
      const box = await tableCard.boundingBox().catch(() => null);
      if (box) {
        yValues.push(box.y);
      }
      await page.waitForTimeout(8);
    }

    if (yValues.length < 15) {
      throw new Error(`Failed to capture sufficient animation frames. Frames captured: ${yValues.length}`);
    }

    const minY = Math.min(...yValues);
    const finalY = yValues[yValues.length - 1];

    console.log(`[Animation Trace] Captured ${yValues.length} frames.`);
    console.log(`[Animation Trace] Minimum Y (overshoot peak): ${minY}, Final Y (rest position): ${finalY}`);
    console.log(`[Animation Trace] Absolute Overshoot: ${finalY - minY}px`);

    // A wobble/overshoot is present if minY is significantly smaller than finalY (by more than 3px)
    // We assert that the overshoot must be less than 2px (i.e. direct tween or critically/over-dampened spring)
    expect(finalY - minY).toBeLessThan(2.0);
  });
});
