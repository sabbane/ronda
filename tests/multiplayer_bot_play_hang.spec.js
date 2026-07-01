import { test, expect } from '@playwright/test';

test.describe('Multiplayer: 4-Player Bot Play Hang', () => {
  test('should allow all 3 bots to play their turns and return the turn to the host', async ({ page }) => {
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

    // 7. Wait for 3 Bots to join seats 2, 3, and 4
    console.log('Waiting for all 3 bots to join...');
    const p2Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 2/i }) }).first();
    const p3Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 3/i }) }).first();
    const p4Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 4/i }) }).first();

    const p2Name = p2Seat.locator('span.text-slate-200').first();
    const p3Name = p3Seat.locator('span.text-slate-200').first();
    const p4Name = p4Seat.locator('span.text-slate-200').first();

    await expect(p2Name).toBeVisible({ timeout: 15000 });
    await expect(p3Name).toBeVisible({ timeout: 15000 });
    await expect(p4Name).toBeVisible({ timeout: 15000 });

    const name2 = await p2Name.innerText();
    const name3 = await p3Name.innerText();
    const name4 = await p4Name.innerText();
    console.log(`All bots joined: "${name2}", "${name3}", "${name4}"`);

    // 8. Start Game
    const startBtn = page.locator('button', { hasText: /Start Game/i }).first();
    await expect(startBtn).toBeEnabled({ timeout: 5000 });
    await startBtn.click();

    // 9. Wait for game board to load
    console.log('Waiting for game board...');
    const turnIndicator = page.locator('text=/Your Turn/i');
    await expect(turnIndicator).toBeVisible({ timeout: 15000 });

    // 10. Play Host's first card
    const myCards = page.locator('.cursor-grab');
    await expect(myCards).toHaveCount(3, { timeout: 10000 });
    console.log('Playing Host Card 1...');
    await myCards.first().click({ force: true });
    await expect(turnIndicator).not.toBeVisible({ timeout: 5000 });

    // Wait for the turn to return to Host (after all 3 bots play Card 1)
    console.log('Waiting for turn to return to Host (Card 1 done)...');
    await expect(turnIndicator).toBeVisible({ timeout: 30000 });

    // 11. Play Host's second card
    await expect(myCards).toHaveCount(2, { timeout: 15000 });
    console.log('Playing Host Card 2...');
    await myCards.first().click({ force: true });
    await expect(turnIndicator).not.toBeVisible({ timeout: 5000 });

    // Wait for the turn to return to Host (after all 3 bots play Card 2)
    console.log('Waiting for turn to return to Host (Card 2 done)...');
    await expect(turnIndicator).toBeVisible({ timeout: 30000 });

    // 12. Play Host's third card
    await expect(myCards).toHaveCount(1, { timeout: 15000 });
    console.log('Playing Host Card 3...');
    await myCards.first().click({ force: true });
    await expect(turnIndicator).not.toBeVisible({ timeout: 5000 });

    // Wait for the turn to return to Host (after all 3 bots play Card 3 and new cards are dealt)
    console.log('Waiting for turn to return to Host (Card 3 done, next deal)...');
    await expect(turnIndicator).toBeVisible({ timeout: 30000 });

    console.log('✅ Success: All cards played and new deal completed.');
  });
});
