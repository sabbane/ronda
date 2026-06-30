import { test, expect } from '@playwright/test';

test.describe('Multiplayer: Bot Play Delay Optimization', () => {
  test('bot plays last card of a round with minimal delay (< 4.5s)', async ({ page }) => {
    // Set a long timeout for E2E play session
    test.setTimeout(60000);

    // Listen to console log messages
    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));

    // 1. Navigate to home with botFallback enabled
    console.log('Navigating to homepage...');
    await page.goto('/?botFallback=true');

    // 2. Select English
    const enButton = page.locator('button', { hasText: /^EN$/i });
    if (await enButton.isVisible().catch(() => false)) await enButton.click();

    // 3. Create a public multiplayer room
    console.log('Creating a public multiplayer room...');
    await page.locator('button', { hasText: /Create Room/i }).first().click();
    await page.locator('input[placeholder*="name" i]').first().fill('HostP1');
    await page.locator('button', { hasText: /^Public$/i }).first().click();
    await page.locator('button', { hasText: /^Create$/i }).first().click();

    // 4. Wait for Game Lobby
    console.log('Waiting for lobby...');
    await expect(page.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // 5. Wait for bot to automatically join (up to 10 seconds in test mode)
    const opponentSeat = page.locator('div', { has: page.locator('div', { hasText: /^Opponent$/i }) }).first();
    const botNameSpan = opponentSeat.locator('span.text-slate-200').first();
    await expect(botNameSpan).toBeVisible({ timeout: 10000 });
    const botName = await botNameSpan.innerText();
    console.log(`Bot joined: "${botName}"`);

    // 6. Host starts the game manually
    const startGameBtn = page.locator('button', { hasText: /Start Game/i }).first();
    await expect(startGameBtn).toBeEnabled();
    await startGameBtn.click();
    console.log('Game started manually by Host.');

    // 7. Wait for the game board to load and dealing to finish (hand cards appear)
    const myCards = page.locator('.cursor-grab');
    const opponentCards = page.locator('.top-partner-hand .hand-card-container');
    const turnIndicator = page.locator('text=/Your Turn/i');
    await expect(myCards).toHaveCount(3, { timeout: 10000 });
    await expect(opponentCards).toHaveCount(3, { timeout: 10000 });
    console.log('Initial cards dealt.');

    // --- MEASURE PLAY DELAYS FOR THE 3 CARDS IN THE ROUND ---

    // CARD 1: Play 1st card.
    console.log('Playing Card 1...');
    await myCards.first().click({ force: true });
    await expect(turnIndicator).not.toBeVisible({ timeout: 5000 });
    
    let t0 = Date.now();
    await expect(turnIndicator).toBeVisible({ timeout: 15000 });
    let t1 = Date.now() - t0;
    console.log(`Bot play delay for Card 1: ${t1}ms`);

    // CARD 2: Play 2nd card.
    console.log('Playing Card 2...');
    await myCards.first().click({ force: true });
    await expect(turnIndicator).not.toBeVisible({ timeout: 5000 });
    
    t0 = Date.now();
    await expect(turnIndicator).toBeVisible({ timeout: 15000 });
    let t2 = Date.now() - t0;
    console.log(`Bot play delay for Card 2: ${t2}ms`);

    // CARD 3: Play 3rd/last card.
    console.log('Playing Card 3 (last card)...');
    t0 = Date.now();
    await myCards.first().click({ force: true });
    
    // Wait until the bot plays its card (opponent hand cards count goes to 0)
    await expect(opponentCards).toHaveCount(0, { timeout: 15000 });
    let t3 = Date.now() - t0;
    console.log(`Bot play delay for Card 3 (last card): ${t3}ms`);

    // ===== DELAY ASSERTIONS =====
    // Card 3 should be processed extremely fast by the bot because it is the last card.
    // The total time from Host click to Bot play (including click/animations + bot delay 500-1500ms)
    // should be under 4.5 seconds (4500ms).
    console.log(`Summary of delays: Card 1: ${t1}ms, Card 2: ${t2}ms, Card 3: ${t3}ms`);
    expect(t3).toBeLessThan(4500);
  });
});
