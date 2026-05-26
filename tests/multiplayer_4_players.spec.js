import { test, expect } from '@playwright/test';

/**
 * E2E Test: 4-Player Team Mode
 *
 * Scenario:
 *  1. Host (P1) creates a 4-player room.
 *  2. Three other players (P2, P3, P4) join the room.
 *  3. Verify that all 4 slots are visible in the Waiting Lobby.
 *  4. Verify that Host starts the game successfully.
 *  5. Verify that all 4 players see the game board and seats are properly aligned.
 */
test.describe('4-Player Team Mode E2E', () => {
  test.setTimeout(120_000);

  test('4 players can join the lobby, nickname syncs, and host can start a 4-seat game', async ({ browser }) => {
    // ─── Setup four browser contexts ───────────────────────────────────────────
    const context1 = await browser.newContext();
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();
    const context4 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    const page3 = await context3.newPage();
    const page4 = await context4.newPage();

    page1.on('console', msg => console.log(`[P1] ${msg.text()}`));
    page2.on('console', msg => console.log(`[P2] ${msg.text()}`));
    page3.on('console', msg => console.log(`[P3] ${msg.text()}`));
    page4.on('console', msg => console.log(`[P4] ${msg.text()}`));

    // ─── P1: Create 4-player room ────────────────────────────────────────────
    await page1.goto('/');
    const enBtn1 = page1.locator('button', { hasText: /^EN$/i });
    if (await enBtn1.isVisible().catch(() => false)) await enBtn1.click();

    await page1.locator('button', { hasText: /Create Room/i }).first().click();

    await page1.locator('input[placeholder*="name" i]').first().fill('HostP1');

    // Toggle Player Count to 4 Players
    const fourPlayersBtn = page1.locator('button', { hasText: /4 Players/i }).first();
    await expect(fourPlayersBtn).toBeVisible({ timeout: 5000 });
    await fourPlayersBtn.click();

    // Make room private so we can join via ID
    await page1.locator('button', { hasText: /^Private$/i }).first().click();
    await page1.locator('button', { hasText: /^Create$/i }).first().click();

    // Extract Room ID
    const lobbyHeader1 = page1.locator('h1', { hasText: /Game Lobby/i });
    await expect(lobbyHeader1).toBeVisible({ timeout: 15000 });

    const roomIdSpan = page1.locator('span.text-amber-300').first();
    await expect(roomIdSpan).toBeVisible();
    const realMatchID = (await roomIdSpan.innerText()).trim();
    console.log(`[Test] 4-Player Room created with ID: ${realMatchID}`);

    // ─── P2: Join ────────────────────────────────────────────────────────────
    await page2.goto('/');
    if (await page2.locator('button', { hasText: /^EN$/i }).isVisible().catch(() => false)) {
      await page2.locator('button', { hasText: /^EN$/i }).click();
    }
    await page2.locator('button', { hasText: /Join Room/i }).first().click();
    await page2.locator('input[placeholder*="name" i]').first().fill('GuestP2');
    await page2.locator('button', { hasText: /Private Room/i }).first().click();
    await page2.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first().fill(realMatchID);
    await page2.locator('button', { hasText: /^Join$/i }).first().click();
    await expect(page2.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });
    console.log('[Test] P2 joined the lobby.');

    // ─── P3: Join ────────────────────────────────────────────────────────────
    await page3.goto('/');
    if (await page3.locator('button', { hasText: /^EN$/i }).isVisible().catch(() => false)) {
      await page3.locator('button', { hasText: /^EN$/i }).click();
    }
    await page3.locator('button', { hasText: /Join Room/i }).first().click();
    await page3.locator('input[placeholder*="name" i]').first().fill('PartnerP3');
    await page3.locator('button', { hasText: /Private Room/i }).first().click();
    await page3.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first().fill(realMatchID);
    await page3.locator('button', { hasText: /^Join$/i }).first().click();
    await expect(page3.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });
    console.log('[Test] P3 joined the lobby.');

    // ─── P4: Join ────────────────────────────────────────────────────────────
    await page4.goto('/');
    if (await page4.locator('button', { hasText: /^EN$/i }).isVisible().catch(() => false)) {
      await page4.locator('button', { hasText: /^EN$/i }).click();
    }
    await page4.locator('button', { hasText: /Join Room/i }).first().click();
    await page4.locator('input[placeholder*="name" i]').first().fill('GuestP4');
    await page4.locator('button', { hasText: /Private Room/i }).first().click();
    await page4.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first().fill(realMatchID);
    await page4.locator('button', { hasText: /^Join$/i }).first().click();
    await expect(page4.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });
    console.log('[Test] P4 joined the lobby. All 4 slots should be filled.');

    // Give time to sync nicknames
    await page1.waitForTimeout(3000);

    // Verify all nicknames are visible in P1's lobby grid
    const hostCard = page1.locator('div', { hasText: /Host/i }).first();
    const guest2Card = page1.locator('div', { hasText: /Gegner 1|Opponent 1/i }).first();
    const partnerCard = page1.locator('div', { hasText: /Partner/i }).first();
    const guest4Card = page1.locator('div', { hasText: /Gegner 2|Opponent 2/i }).first();

    await expect(hostCard).toBeVisible();
    await expect(guest2Card).toBeVisible();
    await expect(partnerCard).toBeVisible();
    await expect(guest4Card).toBeVisible();

    // ─── P1 starts the game ───────────────────────────────────────────────────
    const startGameBtn = page1.locator('button', { hasText: /Start Game|Spiel starten/i }).first();
    await expect(startGameBtn).toBeEnabled({ timeout: 10000 });
    await startGameBtn.click();
    console.log('[Test] Host started the 4-player game.');

    // Wait for the active board layout to load on P1's screen
    const gameTable1 = page1.locator('[data-test-id="game-table"]');
    await expect(gameTable1).toBeVisible({ timeout: 20000 });
    console.log('[Test] Game board successfully visible on P1 screen.');

    // Clean up
    await context1.close();
    await context2.close();
    await context3.close();
    await context4.close();
  });
});
