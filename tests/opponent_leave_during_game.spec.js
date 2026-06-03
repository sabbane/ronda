import { test, expect } from '@playwright/test';

/**
 * Test: Opponent leaves during an active game
 *
 * Scenario:
 *  1. Two players join the same room and start a game.
 *  2. Player 1 leaves the game by clicking "Back to Menu".
 *  3. Player 2 should see a notification modal that the opponent has left.
 *
 * This test is written to DETECT the bug, not fix it.
 * It will FAIL if the notification does not appear.
 */
test.describe('Opponent leaves during game', () => {
  test.setTimeout(120_000);

  test('Remaining player sees "opponent left" notification when other player leaves during active game', async ({ browser }) => {
    const roomID = `leave-test-${Date.now()}`;

    // ─── Setup two browser contexts ───────────────────────────────────────────
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    page1.on('console', msg => console.log(`[P1] ${msg.text()}`));
    page2.on('console', msg => console.log(`[P2] ${msg.text()}`));

    // ─── P1: Create room ─────────────────────────────────────────────────────
    await page1.goto('/');
    const enBtn1 = page1.locator('button', { hasText: /^EN$/i });
    if (await enBtn1.isVisible().catch(() => false)) await enBtn1.click();

    await page1.locator('button', { hasText: /Create Room/i }).first().click();

    const p1NicknameInput = page1.locator('input[placeholder*="name" i]').first();
    await p1NicknameInput.fill('HostPlayer');

    // Make room private so we can use a known ID
    const privateBtn = page1.locator('button', { hasText: /^Private$/i }).first();
    await privateBtn.click();

    await page1.locator('button', { hasText: /^Create$/i }).first().click();

    // Wait for the game lobby to appear and extract the real room ID
    const lobbyHeader1 = page1.locator('h1', { hasText: /Game Lobby/i });
    await expect(lobbyHeader1).toBeVisible({ timeout: 15000 });

    const roomIdSpan = page1.locator('span.text-amber-300').first();
    await expect(roomIdSpan).toBeVisible();
    const realMatchID = (await roomIdSpan.innerText()).trim();
    console.log(`[Test] Room created: ${realMatchID}`);

    // ─── P2: Join room ────────────────────────────────────────────────────────
    await page2.goto('/');
    const enBtn2 = page2.locator('button', { hasText: /^EN$/i });
    if (await enBtn2.isVisible().catch(() => false)) await enBtn2.click();

    await page2.locator('button', { hasText: /Join Room/i }).first().click();

    const p2NicknameInput = page2.locator('input[placeholder*="name" i]').first();
    await p2NicknameInput.fill('GuestPlayer');

    // Switch to Private Room tab and enter the room ID
    await page2.locator('button', { hasText: /Private Room/i }).first().click();
    const roomIdInput = page2.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first();
    await roomIdInput.fill(realMatchID);
    await page2.locator('button', { hasText: /^Join$/i }).first().click();

    // Wait for P2 to enter the lobby
    const lobbyHeader2 = page2.locator('h1', { hasText: /Game Lobby/i });
    await expect(lobbyHeader2).toBeVisible({ timeout: 15000 });
    console.log('[Test] Both players in lobby.');

    // ─── P1 starts the game ───────────────────────────────────────────────────
    const startGameBtn = page1.locator('button', { hasText: /Start Game/i }).first();
    await expect(startGameBtn).toBeVisible({ timeout: 10000 });
    await expect(startGameBtn).toBeEnabled({ timeout: 10000 });
    await startGameBtn.click();
    console.log('[Test] P1 started the game.');

    // Wait for the game board to be visible on both sides
    const gameTable1 = page1.locator('[data-test-id="game-table"]');
    const gameTable2 = page2.locator('[data-test-id="game-table"]');
    await expect(gameTable1).toBeVisible({ timeout: 20000 });
    await expect(gameTable2).toBeVisible({ timeout: 20000 });
    console.log('[Test] Game board visible for both players.');

    // Give time for the game to stabilize (animations etc.)
    await page1.waitForTimeout(3000);

    // ─── P1: Leave the game mid-match ─────────────────────────────────────────
    const backToMenuBtn = page1.locator('button', { hasText: /Back to Menu/i }).first();
    await expect(backToMenuBtn).toBeVisible({ timeout: 5000 });
    await backToMenuBtn.click();
    console.log('[Test] P1 clicked "Back to Menu" — left during game.');

    // ─── P2: Should see the "opponent left" modal ─────────────────────────────
    // The modal title should be visible in any supported language
    const opponentLeftModal = page2.locator([
      'h2:has-text("Opponent has left the game")',
      'h2:has-text("adversaire a quitté")',
      'h2:has-text("غادر")',
    ].join(', '));

    await expect(opponentLeftModal).toBeVisible({
      timeout: 15000,
      message: 'BUG: P2 should see an "opponent has left" notification, but the modal is not visible.',
    });

    console.log('✅ Opponent-left modal appeared correctly on P2 screen.');

    // ─── P2: Click "Main Menu" from the modal ─────────────────────────────────
    const mainMenuBtn = page2.locator('button', { hasText: /Main Menu/i }).first();
    await expect(mainMenuBtn).toBeVisible({ timeout: 5000 });
    await mainMenuBtn.click();

    // P2 should be back at the main menu (RONDA logo)
    const rondaLogo2 = page2.locator('h1', { hasText: /RONDA/i });
    await expect(rondaLogo2).toBeVisible({ timeout: 10000 });
    console.log('✅ P2 successfully returned to main menu after opponent left.');

    // Cleanup
    await context1.close();
    await context2.close();
  });

  test('Remaining player sees notification when opponent closes the browser tab abruptly', async ({ browser }) => {
    test.setTimeout(90_000);

    // ─── Setup ────────────────────────────────────────────────────────────────
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const page1 = await context1.newPage();
    const page2 = await context2.newPage();

    page1.on('console', msg => console.log(`[P1] ${msg.text()}`));
    page2.on('console', msg => console.log(`[P2] ${msg.text()}`));

    // ─── P1: Create room ─────────────────────────────────────────────────────
    await page1.goto('/');
    await page1.locator('button', { hasText: /Create Room/i }).first().click();
    await page1.locator('input[placeholder*="name" i]').first().fill('HostPlayer2');
    await page1.locator('button', { hasText: /^Private$/i }).first().click();
    await page1.locator('button', { hasText: /^Create$/i }).first().click();

    const lobbyHeader1 = page1.locator('h1', { hasText: /Game Lobby/i });
    await expect(lobbyHeader1).toBeVisible({ timeout: 15000 });
    const realMatchID = (await page1.locator('span.text-amber-300').first().innerText()).trim();
    console.log(`[Test] Room created: ${realMatchID}`);

    // ─── P2: Join room ────────────────────────────────────────────────────────
    await page2.goto('/');
    await page2.locator('button', { hasText: /Join Room/i }).first().click();
    await page2.locator('input[placeholder*="name" i]').first().fill('GuestPlayer2');
    await page2.locator('button', { hasText: /Private Room/i }).first().click();
    await page2.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first().fill(realMatchID);
    await page2.locator('button', { hasText: /^Join$/i }).first().click();
    await expect(page2.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // ─── P1: Start game ───────────────────────────────────────────────────────
    const startBtn = page1.locator('button', { hasText: /Start Game/i }).first();
    await expect(startBtn).toBeEnabled({ timeout: 10000 });
    await startBtn.click();

    await expect(page1.locator('[data-test-id="game-table"]')).toBeVisible({ timeout: 20000 });
    await expect(page2.locator('[data-test-id="game-table"]')).toBeVisible({ timeout: 20000 });
    console.log('[Test] Game board visible for both players.');

    await page1.waitForTimeout(3000);

    // ─── P1: "Close tab" by closing the page ─────────────────────────────────
    // Pass runBeforeUnload: true so Playwright fires the beforeunload event,
    // which triggers moves.playerLeft() in our handler.
    await page1.close({ runBeforeUnload: true });
    console.log('[Test] P1 page closed abruptly (simulates tab close).');

    // ─── P2: Should see the "opponent left" modal ─────────────────────────────
    const opponentLeftModal = page2.locator([
      'h2:has-text("Opponent has left the game")',
      'h2:has-text("adversaire a quitté")',
      'h2:has-text("غادر")',
    ].join(', '));

    await expect(opponentLeftModal).toBeVisible({
      timeout: 15000,
      message: 'BUG: P2 should see an "opponent has left" notification after P1 closes the tab, but the modal is not visible.',
    });

    console.log('✅ Opponent-left modal appeared after tab close.');

    await context2.close();
  });
});
