import { test, expect } from '@playwright/test';

test('Navigation: Creating a room should navigate the user to the Lobby, not directly to the Game', async ({ page }) => {
  // 1. Start at the main page
  await page.goto('/');

  // 2. Locate the "Create Room" / "Raum erstellen" button in the Online Multiplayer section
  const createRoomButton = page.locator('button', { hasText: /Create Room|Raum erstellen/i }).first();
  await expect(createRoomButton).toBeVisible();
  await createRoomButton.click();

  // 3. Verify the Create Room view has rendered by checking for inputs
  const nicknameInput = page.locator('input[placeholder*="name" i], input[placeholder*="Namen" i]').first();
  await expect(nicknameInput).toBeVisible();

  // 4. Fill in a nickname
  const testNickname = 'HostPlayer';

  await nicknameInput.fill(testNickname);

  // 5. Click the "Create" / "Erstellen" button to instantiate the room
  const createButton = page.locator('button', { hasText: /^Create$|^Erstellen$/i }).first();
  await expect(createButton).toBeVisible();
  await createButton.click();

  // 6. Assert that the player lands in the Lobby (should see "Game Lobby" or "Spiel-Lobby")
  // Note: Currently, the app takes the user directly to the game, so this assertion will fail.
  const lobbyHeader = page.locator('h1', { hasText: /Game Lobby|Spiel-Lobby/i });
  await expect(lobbyHeader).toBeVisible({ timeout: 10000 });

  // 7. Verify we are not seeing the active gameplay board (e.g., cards or interactive game UI)
  const lobbySubtitle = page.locator('p', { hasText: /Waiting for players|Warten auf Spieler/i });
  await expect(lobbySubtitle).toBeVisible();
});
