import { test, expect } from '@playwright/test';

test('Singleplayer: Start Game should directly launch the game without landing in the lobby', async ({ page }) => {
  // 1. Start at the main page
  await page.goto('/');

  // 2. Select English language for consistency
  const enButton = page.locator('button', { hasText: /^EN$/i });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // 3. Locate and click "Start Game" in the Singleplayer section
  const playButton = page.locator('button', { hasText: /Start Game/i }).first();
  await expect(playButton).toBeVisible();
  await playButton.click();

  // 4. Assert that we DO NOT land in the Game Lobby
  const lobbyHeader = page.locator('h1', { hasText: /Game Lobby/i });
  await expect(lobbyHeader).not.toBeVisible({ timeout: 5000 });

  // 5. Assert that we instead directly see the active game board with dealt cards (4 table + 3 hand cards)
  const cards = page.locator('img[src*="-vector.svg"]:not([aria-hidden="true"])');
  await expect(cards).toHaveCount(7, { timeout: 10000 });
});
