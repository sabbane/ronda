import { test, expect } from '@playwright/test';

test.describe('Multiplayer Play Again Regression Test', () => {
  test.setTimeout(420_000); // 7 minutes - game animations and turns can take a few minutes

  test('Clicking Play Again in multiplayer should directly start a new game instead of going back to the lobby', async ({ browser }) => {
    const hostNickname = 'RondaHost';
    const guestNickname = 'CardGuest';

    // 1. Setup isolation
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    hostPage.on('console', msg => console.log(`[Host Console] ${msg.text()}`));
    guestPage.on('console', msg => console.log(`[Guest Console] ${msg.text()}`));

    // 2. Host creates room
    console.log('Host: Creating a multiplayer room...');
    await hostPage.goto('/');

    // Choose English language for consistent selectors
    const enButton1 = hostPage.locator('button', { hasText: /^EN$/i });
    if (await enButton1.isVisible().catch(() => false)) await enButton1.click();

    // Click "Create Room"
    const createRoomBtn = hostPage.locator('button', { hasText: /Create Room/i }).first();
    await expect(createRoomBtn).toBeVisible();
    await createRoomBtn.click();

    // Fill in Host Nickname
    const hostNicknameInput = hostPage.locator('input[placeholder*="name" i]').first();
    await hostNicknameInput.fill(hostNickname);

    // Set privacy to Public
    const publicBtn = hostPage.locator('button', { hasText: /Public/i }).first();
    await publicBtn.click();

    // Click "Create"
    const createSubmitBtn = hostPage.locator('button', { hasText: /^Create$/i }).first();
    await createSubmitBtn.click();

    // Wait until Host is in the Lobby
    const hostLobbyHeader = hostPage.locator('h1', { hasText: /Game Lobby/i });
    await expect(hostLobbyHeader).toBeVisible({ timeout: 10000 });

    // Extract generated Room ID from Lobby URL
    const url = hostPage.url();
    const realMatchID = new URL(url).searchParams.get('room');
    console.log(`Host created room successfully. Room ID: ${realMatchID}`);

    // 3. Guest joins room
    console.log(`Guest: Joining room ${realMatchID}...`);
    await guestPage.goto(`/`);

    // Choose English language for guest
    const enButton2 = guestPage.locator('button', { hasText: /^EN$/i });
    if (await enButton2.isVisible().catch(() => false)) await enButton2.click();

    // Click Join Room
    await guestPage.locator('button', { hasText: /Join Room/i }).first().click();

    // Fill in Guest Nickname
    const guestNicknameInput = guestPage.locator('input[placeholder*="name" i]').first();
    await guestNicknameInput.fill(guestNickname);

    // Click Private Room tab
    await guestPage.locator('button', { hasText: /Private Room/i }).first().click();

    // Fill Room ID
    await guestPage.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first().fill(realMatchID);

    // Click Join button
    const joinBtn = guestPage.locator('button', { hasText: /^Join$/i }).first();
    await joinBtn.click();

    // Wait until Guest is in the Lobby
    const guestLobbyHeader = guestPage.locator('h1', { hasText: /Game Lobby/i });
    await expect(guestLobbyHeader).toBeVisible({ timeout: 10000 });
    console.log('Guest joined the lobby successfully.');

    // Verify Host sees the Guest's nickname in the Lobby
    const hostLobbyGuestName = hostPage.locator(`text=${guestNickname}`).first();
    await expect(hostLobbyGuestName).toBeVisible({ timeout: 10000 });

    // 4. Host starts the game
    console.log('Host starting the multiplayer game...');
    const startGameBtn = hostPage.locator('button', { hasText: /Start Game/i }).first();
    await expect(startGameBtn).toBeEnabled();
    await startGameBtn.click();

    // Wait for game board to render on both screens
    const tableArea1 = hostPage.locator('.bg-emerald-900\\/40').first();
    const tableArea2 = guestPage.locator('.bg-emerald-900\\/40').first();
    await expect(tableArea1).toBeVisible({ timeout: 20000 });
    await expect(tableArea2).toBeVisible({ timeout: 20000 });
    console.log('Game board loaded on both screens.');

    // 5. Play game automatically until Game Over is reached
    const gameOver1 = hostPage.locator('h2', { hasText: /Game Over|Partie Terminée|انتهت اللعبة/i });
    const gameOver2 = guestPage.locator('h2', { hasText: /Game Over|Partie Terminée|انتهت اللعبة/i });

    let attempts = 0;
    const MAX_ATTEMPTS = 500;

    console.log('Playing multiplayer game to completion...');
    while (attempts < MAX_ATTEMPTS) {
      if (await gameOver1.isVisible().catch(() => false)) {
        console.log('Game Over detected on Host screen.');
        break;
      }

      // Try playing card for Host (P1)
      const p1Hand = hostPage.locator('.cursor-grab');
      if (await p1Hand.count() > 0) {
        try {
          await p1Hand.first().click({ timeout: 500 });
          await hostPage.waitForTimeout(500);
        } catch { /* ignore */ }
      }

      // Try playing card for Guest (P2)
      const p2Hand = guestPage.locator('.cursor-grab');
      if (await p2Hand.count() > 0) {
        try {
          await p2Hand.first().click({ timeout: 500 });
          await guestPage.waitForTimeout(500);
        } catch { /* ignore */ }
      }

      await hostPage.waitForTimeout(600);
      attempts++;
    }

    await expect(gameOver1).toBeVisible({ timeout: 10000 });
    await expect(gameOver2).toBeVisible({ timeout: 10000 });
    console.log('Both players reached the Game Over screen.');

    // Mock adBreak for both screens before clicking to prevent ad blocks
    await hostPage.evaluate(() => {
      window.adBreak = (options) => {
        if (options && typeof options.adBreakDone === 'function') {
          options.adBreakDone({ breakStatus: 'not_shown' });
        }
      };
    });
    await guestPage.evaluate(() => {
      window.adBreak = (options) => {
        if (options && typeof options.adBreakDone === 'function') {
          options.adBreakDone({ breakStatus: 'not_shown' });
        }
      };
    });

    // 6. Host clicks "Play Again"
    console.log('Host clicking Play Again...');
    const playAgainBtn1 = hostPage.locator('button', { hasText: /Play Again|Rejouer/i }).first();
    await expect(playAgainBtn1).toBeVisible();
    await playAgainBtn1.click();

    // Verify Host's button goes into a waiting state (e.g. text changes to "Waiting..." or similar)
    // The English waiting text is "Waiting..."
    console.log('Verifying Host button is in waiting state...');
    await expect(hostPage.locator('button', { hasText: /Waiting/i }).first()).toBeVisible({ timeout: 5000 });

    // 7. Guest clicks "Accept Challenge"
    console.log('Guest clicking Accept Challenge...');
    const acceptChallengeBtn = guestPage.locator('button', { hasText: /Accept Challenge/i }).first();
    await expect(acceptChallengeBtn).toBeVisible();
    await acceptChallengeBtn.click();

    // 8. Verify both players directly start a new game instead of going back to the lobby
    console.log('Verifying play again behavior...');

    // The Game Over overlay should disappear on both screens
    await expect(gameOver1).not.toBeVisible({ timeout: 10000 });
    await expect(gameOver2).not.toBeVisible({ timeout: 10000 });

    // ASSERTION: The Lobby waiting screen should NOT be visible.
    await expect(hostLobbyHeader).not.toBeVisible({ timeout: 5000 });
    await expect(guestLobbyHeader).not.toBeVisible({ timeout: 5000 });

    // Wait for the dealing animation to finish and cards to settle
    await hostPage.waitForTimeout(4000);

    // A new active round should be set up, so card hands are visible on both screens
    const myCards1 = hostPage.locator('[data-testid^="card-"]');
    const myCards2 = guestPage.locator('[data-testid^="card-"]');
    await expect(myCards1.first()).toBeVisible({ timeout: 15000 });
    await expect(myCards2.first()).toBeVisible({ timeout: 15000 });

    console.log('✅ Success: New multiplayer round started directly without returning to lobby after consensus.');

    // Clean up
    await hostContext.close();
    await guestContext.close();
  });
});
