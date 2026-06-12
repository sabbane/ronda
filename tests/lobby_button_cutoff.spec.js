import { test, expect } from '@playwright/test';

test('Lobby: Start Game button must be visible within the mobile viewport in 4-player mode', async ({ page }) => {
  // Set viewport to mobile size
  await page.setViewportSize({ width: 390, height: 844 });

  console.log('Navigating to home page...');
  await page.goto('/');

  // 1. Select English language
  const enButton = page.locator('button').filter({ has: page.locator('img[alt="EN"]') }).first();
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // 2. Click "Create Room"
  const createRoomBtn = page.locator('button', { hasText: /Create Room/i }).first();
  await expect(createRoomBtn).toBeVisible();
  await createRoomBtn.click();

  // 3. Fill in nickname
  const nicknameInput = page.locator('input[placeholder*="name" i]').first();
  await expect(nicknameInput).toBeVisible();
  await nicknameInput.fill('HostP1');

  // 4. Toggle Player Count to 4 Players
  const fourPlayersBtn = page.locator('button', { hasText: /4 Players/i }).first();
  await expect(fourPlayersBtn).toBeVisible();
  await fourPlayersBtn.click();

  // 5. Click "Create" to build the room
  const createBtn = page.locator('button', { hasText: /^Create$/i }).first();
  await expect(createBtn).toBeVisible();
  await createBtn.click();

  // 6. Wait for the Game Lobby to load
  const lobbyHeader = page.locator('h1', { hasText: /Game Lobby/i });
  await expect(lobbyHeader).toBeVisible({ timeout: 15000 });

  // 7. Locate the "Start Game" button at the bottom of the lobby
  const startBtn = page.locator('button', { hasText: /Start Game/i }).first();
  await expect(startBtn).toBeVisible();

  // 8. Assert that the "Start Game" button is fully visible in the viewport (not cut off at the bottom)
  // This assertion will fail if the lobby card exceeds the mobile viewport height and pushes the button off-screen.
  await expect(startBtn).toBeInViewport();
  console.log('Start Game button is in viewport.');
});
