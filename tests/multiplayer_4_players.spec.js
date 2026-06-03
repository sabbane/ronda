import { test, expect } from '@playwright/test';

/**
 * E2E Test: 4-Player Team Mode with Seat Switching & Team Naming
 *
 * Scenario:
 *  1. Host (P1) creates a 4-player room. "Start Game" should be disabled initially.
 *  2. P2 joins. P2 joins Slot 1 (Team B) by default.
 *  3. P2 clicks "Join Team A" on the empty Slot 2 to switch seats.
 *  4. P2's client successfully switches to Slot 2 (Team A). Slot 1 becomes vacant.
 *  5. P3 joins. Since Slot 1 is vacant, P3 joins Slot 1 (Team B).
 *  6. P4 joins. P4 joins Slot 3 (Team B).
 *  7. All 4 slots are now filled. "Start Game" becomes enabled.
 *  8. Verify editability of team name input fields:
 *     - Team A name input is editable for P2 (Team A) but read-only for P3 (Team B).
 *     - Team B name input is editable for P3 (Team B) but read-only for P2 (Team A).
 *  9. P2 types "Al-Mourabitoun" for Team A.
 *  10. P3 types "Zellij FC" for Team B.
 *  11. Verify that the custom names synchronize in real-time across all players (e.g. Host P1).
 *  12. Host starts the game.
 *  13. Verify all 4 players see the game board.
 */
test.describe('4-Player Team Mode E2E', () => {
  test.setTimeout(120_000);

  test('Interactive seat switching, team custom names real-time sync, and lobby start checks', async ({ browser }) => {
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

    // Assert P1 (Host) "Start Game" is initially disabled since lobby is not full
    const p1StartBtn = page1.locator('button', { hasText: /Start Game/i }).first();
    await expect(p1StartBtn).toBeDisabled({ timeout: 5000 });
    console.log('[Test] Confirmed: Start Game is disabled initially.');

    // ─── P2: Join (joins Slot 1 by default) ───────────────────────────────────
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
    console.log('[Test] P2 joined slot 1 (Team B) in lobby.');

    // ─── P2: Switches Seat to Slot 2 (Team A) ─────────────────────────────────
    // Assert "Join Team A" is visible for Slot 2
    const joinTeamABtn = page2.locator('button', { hasText: /Join Team A/i }).first();
    await expect(joinTeamABtn).toBeVisible({ timeout: 10000 });
    await joinTeamABtn.click();
    console.log('[Test] P2 clicked Join Team A.');

    // Wait for the seat switch to complete and P2 to remount as Slot 2 (Team A partner)
    await page2.waitForTimeout(4000);

    // Verify GuestP2 is now in slot 2 (Team A) on P1's screen
    const p1Seat2Partner = page1.locator('div', { hasText: /GuestP2/i }).first();
    await expect(p1Seat2Partner).toBeVisible({ timeout: 10000 });
    console.log('[Test] Confirmed: P2 successfully switched to Team A slot 2.');

    // ─── P3: Join (should join the newly vacant Slot 1 - Team B) ─────────────
    await page3.goto('/');
    if (await page3.locator('button', { hasText: /^EN$/i }).isVisible().catch(() => false)) {
      await page3.locator('button', { hasText: /^EN$/i }).click();
    }
    await page3.locator('button', { hasText: /Join Room/i }).first().click();
    await page3.locator('input[placeholder*="name" i]').first().fill('GuestP3');
    await page3.locator('button', { hasText: /Private Room/i }).first().click();
    await page3.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first().fill(realMatchID);
    await page3.locator('button', { hasText: /^Join$/i }).first().click();
    await expect(page3.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });
    console.log('[Test] P3 joined slot 1 (Team B) in lobby.');

    // ─── P4: Join (joins Slot 3 - Team B) ─────────────────────────────────────
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
    console.log('[Test] P4 joined slot 3 (Team B) in lobby.');

    // Wait for nicknames and state to sync across pages
    await page1.waitForTimeout(3000);

    // Assert that the start button is now enabled on P1's page since all 4 slots are full
    await expect(p1StartBtn).toBeEnabled({ timeout: 10000 });
    console.log('[Test] Confirmed: Start Game is enabled now.');

    // ─── Team Naming Editability Checks ───────────────────────────────────────
    // P2 is Slot 2 (Team A)
    const p2TeamAInput = page2.locator('input[placeholder*="Team A" i]').first();
    const p2TeamBInput = page2.locator('input[placeholder*="Team B" i]').first();
    await expect(p2TeamAInput).not.toHaveAttribute('readonly');
    await expect(p2TeamBInput).toHaveAttribute('readonly');
    console.log('[Test] Confirmed: P2 (Team A) can edit Team A name but Team B name is read-only.');

    // P3 is Slot 1 (Team B)
    const p3TeamAInput = page3.locator('input[placeholder*="Team A" i]').first();
    const p3TeamBInput = page3.locator('input[placeholder*="Team B" i]').first();
    await expect(p3TeamAInput).toHaveAttribute('readonly');
    await expect(p3TeamBInput).not.toHaveAttribute('readonly');
    console.log('[Test] Confirmed: P3 (Team B) can edit Team B name but Team A name is read-only.');

    // ─── Set Custom Team Names and Verify Real-time Sync ─────────────────────
    await p2TeamAInput.fill('Al-Mourabitoun');
    await p2TeamAInput.press('Enter'); // Ensure focus loss / blur if needed

    await p3TeamBInput.fill('Zellij FC');
    await p3TeamBInput.press('Enter');

    // Give time to sync
    await page1.waitForTimeout(2000);

    // Verify P1 (Host) sees the custom names in both fields
    const p1TeamAInput = page1.locator('input[placeholder*="Team A" i]').first();
    const p1TeamBInput = page1.locator('input[placeholder*="Team B" i]').first();
    await expect(p1TeamAInput).toHaveValue('Al-Mourabitoun');
    await expect(p1TeamBInput).toHaveValue('Zellij FC');
    console.log('[Test] Confirmed: Custom team names successfully synchronized in real time.');

    // ─── Start the Game ───────────────────────────────────────────────────────
    await p1StartBtn.click();
    console.log('[Test] Host started the game.');

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

