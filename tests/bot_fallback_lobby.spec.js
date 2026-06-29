import { test, expect } from '@playwright/test';

test.describe('Multiplayer: Bot Matchmaking Fallback System', () => {
  test('2-player lobby: bot joins automatically after timeout and does not autostart the game', async ({ page }) => {
    test.setTimeout(45000);

    // Listen for console logs
    page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
    page.on('pageerror', err => console.log(`[Browser Page Error] ${err.message}`));

    // 1. Go to homepage
    console.log('Navigating to homepage...');
    await page.goto('/?botFallback=true');

    // 2. Select Language (English) for consistency
    const enButton = page.locator('button', { hasText: /^EN$/i });
    if (await enButton.isVisible().catch(() => false)) await enButton.click();

    // 3. Create a public multiplayer room
    console.log('Creating a public multiplayer room...');
    await page.locator('button', { hasText: /Create Room/i }).first().click();
    await page.locator('input[placeholder*="name" i]').first().fill('HostP1');
    // Ensure it is set to Public
    await page.locator('button', { hasText: /^Public$/i }).first().click();
    await page.locator('button', { hasText: /^Create$/i }).first().click();

    // 4. We should land directly in the Game Lobby for Player 0 (Host)
    console.log('Waiting for Game Lobby to render...');
    await expect(page.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // 5. Locate the seat card of the Opponent (Player 1)
    // Initially, it should show "Waiting" or similar
    const opponentSeat = page.locator('div', { has: page.locator('div', { hasText: /^Opponent$/i }) }).first();
    await expect(opponentSeat).toBeVisible({ timeout: 10000 });

    const waitingSpan = opponentSeat.locator('span', { hasText: /Waiting/i }).first();
    await expect(waitingSpan).toBeVisible({ timeout: 5000 });
    console.log('Verified: Opponent slot is initially waiting.');

    // 6. In test mode, the 2-player bot timeout is 3 seconds.
    // Wait up to 10 seconds for the bot to join automatically.
    console.log('Waiting for bot to automatically join (up to 10 seconds)...');
    
    // We expect the "Waiting" text to disappear and be replaced by the bot's name
    const botNameSpan = opponentSeat.locator('span.text-slate-200').first();
    await expect(botNameSpan).toBeVisible({ timeout: 10000 });

    const botName = await botNameSpan.innerText();
    console.log(`Bot joined successfully with name: "${botName}"`);
    
    // Verify bot has a non-empty name and is not the "Host"
    expect(botName.trim()).not.toBe('');
    expect(botName.trim()).not.toBe('Host');

    // 7. Verify that the match does NOT start automatically
    // The lobby header should still be visible, and the "Start Game" button should be visible and enabled
    console.log('Verifying that the lobby is still open and did not autostart...');
    await expect(page.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 5000 });

    const startGameBtn = page.locator('button', { hasText: /Start Game/i }).first();
    await expect(startGameBtn).toBeVisible({ timeout: 5000 });
    await expect(startGameBtn).toBeEnabled();
  });
});
