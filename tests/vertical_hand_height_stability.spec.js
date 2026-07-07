import { test, expect } from '@playwright/test';

test.describe('Vertical Hand Height Stability Check', () => {
  test('should verify that vertical hands (Player 2 and 4) do not shrink in height when they play cards', async ({ page }) => {
    test.setTimeout(60000);

    // Navigate to homepage
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

    // Wait for all bots to join
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

    // Wait for our turn
    await expect(page.locator('text=/Your Turn/i')).toBeVisible({ timeout: 15000 });

    // Identify the two vertical hand containers
    const player1Hand = page.locator('.game-hand-vertical').nth(1); // Player 1 (Right opponent)
    const player3Hand = page.locator('.game-hand-vertical').first(); // Player 3 (Left opponent)

    // Measure initial heights (when players have 3 cards)
    const initialHeightP1 = (await player1Hand.boundingBox())?.height || 0;
    const initialHeightP3 = (await player3Hand.boundingBox())?.height || 0;
    console.log(`[Initial Heights] Player 1: ${initialHeightP1}px, Player 3: ${initialHeightP3}px`);

    expect(initialHeightP1).toBeGreaterThan(0);
    expect(initialHeightP3).toBeGreaterThan(0);

    // Play a card to proceed the game
    const firstHandCard = page.locator('.game-hand').last().locator('.hand-card-container').first();
    await expect(firstHandCard).toBeVisible({ timeout: 5000 });
    await firstHandCard.click();

    // Wait for Player 1 to play a card (their hand size in state becomes 2)
    console.log('Waiting for Player 1 (Right) to play a card...');
    await page.waitForFunction(() => {
      return window.latestGameState?.G?.players?.['1']?.hand?.length === 2;
    }, { timeout: 15000 });

    // Measure Player 1's height with 2 cards
    const heightP1With2Cards = (await player1Hand.boundingBox())?.height || 0;
    console.log(`[P1 Height with 2 Cards] Player 1: ${heightP1With2Cards}px`);

    // Expect the height to be equal to the initial height (so it hasn't shrunk)
    expect(heightP1With2Cards).toBeCloseTo(initialHeightP1, 1);
  });
});
