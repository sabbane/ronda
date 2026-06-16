import { test, expect } from '@playwright/test';

test.describe('Multiplayer Play Again Consent Bug Detection', () => {
  test.setTimeout(420_000); // 7 minutes - game animations and turns can take a few minutes

  test('Clicking Play Again by only one player must NOT immediately restart the game for the opponent', async ({ browser }) => {
    const hostNickname = 'ConsentHost';
    const guestNickname = 'ConsentGuest';

    // 1. Setup isolated contexts
    const hostContext = await browser.newContext();
    const guestContext = await browser.newContext();
    const hostPage = await hostContext.newPage();
    const guestPage = await guestContext.newPage();

    hostPage.on('console', msg => console.log(`[Host Console] ${msg.text()}`));
    guestPage.on('console', msg => console.log(`[Guest Console] ${msg.text()}`));

    // 2. Host creates room
    console.log('Host: Creating a multiplayer room...');
    await hostPage.goto('/');

    const enButton1 = hostPage.locator('button', { hasText: /^EN$/i });
    if (await enButton1.isVisible().catch(() => false)) await enButton1.click();

    const createRoomBtn = hostPage.locator('button', { hasText: /Create Room/i }).first();
    await expect(createRoomBtn).toBeVisible();
    await createRoomBtn.click();

    const hostNicknameInput = hostPage.locator('input[placeholder*="name" i]').first();
    await hostNicknameInput.fill(hostNickname);

    const publicBtn = hostPage.locator('button', { hasText: /Public/i }).first();
    await publicBtn.click();

    const createSubmitBtn = hostPage.locator('button', { hasText: /^Create$/i }).first();
    await createSubmitBtn.click();

    const hostLobbyHeader = hostPage.locator('h1', { hasText: /Game Lobby/i });
    await expect(hostLobbyHeader).toBeVisible({ timeout: 10000 });

    const url = hostPage.url();
    const realMatchID = new URL(url).searchParams.get('room');
    console.log(`Host created room successfully. Room ID: ${realMatchID}`);

    // 3. Guest joins room
    console.log(`Guest: Joining room ${realMatchID}...`);
    await guestPage.goto(`/`);

    const enButton2 = guestPage.locator('button', { hasText: /^EN$/i });
    if (await enButton2.isVisible().catch(() => false)) await enButton2.click();

    await guestPage.locator('button', { hasText: /Join Room/i }).first().click();

    const guestNicknameInput = guestPage.locator('input[placeholder*="name" i]').first();
    await guestNicknameInput.fill(guestNickname);

    await guestPage.locator('button', { hasText: /Private Room/i }).first().click();
    await guestPage.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first().fill(realMatchID);

    const joinBtn = guestPage.locator('button', { hasText: /^Join$/i }).first();
    await joinBtn.click();

    const guestLobbyHeader = guestPage.locator('h1', { hasText: /Game Lobby/i });
    await expect(guestLobbyHeader).toBeVisible({ timeout: 10000 });
    console.log('Guest joined the lobby successfully.');

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

    // 6. Only Host clicks "Play Again"
    console.log('Host clicks Play Again...');
    const playAgainBtn = hostPage.locator('button', { hasText: /Play Again|Rejouer/i }).first();
    await expect(playAgainBtn).toBeVisible();
    await playAgainBtn.click();

    // 7. Verify Guest (who has NOT clicked Play Again) sees the challenge card
    console.log('Checking if Guest sees the challenge card...');

    // Locate the challenge card container or text
    const challengeCardText = guestPage.locator('text=/ConsentHost wants a (revanche|rematch)/').first();
    await expect(challengeCardText).toBeVisible({ timeout: 10000 });

    const acceptChallengeBtn = guestPage.locator('button', { hasText: /Accept Challenge/i }).first();
    await expect(acceptChallengeBtn).toBeVisible();

    // 8. Click "Accept Challenge" on Guest screen
    console.log('Guest clicks Accept Challenge...');
    await acceptChallengeBtn.click();

    // 9. Verify the game restarts for both players
    console.log('Verifying game restart for both players...');
    await expect(gameOver1).not.toBeVisible({ timeout: 10000 });
    await expect(gameOver2).not.toBeVisible({ timeout: 10000 });

    // Wait for the dealing animation to finish and cards to settle
    await hostPage.waitForTimeout(4000);

    // A new active round should be set up, so card hands are visible on both screens
    const myCards1 = hostPage.locator('[data-testid^="card-"]');
    const myCards2 = guestPage.locator('[data-testid^="card-"]');
    await expect(myCards1.first()).toBeVisible({ timeout: 15000 });
    await expect(myCards2.first()).toBeVisible({ timeout: 15000 });

    console.log('✅ Success: Rematch challenge was accepted and game restarted successfully.');

    // Clean up
    await hostContext.close();
    await guestContext.close();
  });
});
