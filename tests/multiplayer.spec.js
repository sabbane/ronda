import { test, expect } from '@playwright/test';

test('Multiplayer: Two players can join and see the board', async ({ browser }) => {
  // Context A: Host
  const contextA = await browser.newContext();
  const pageA = await contextA.newPage();
  await pageA.goto('/');
  
  const enButtonA = pageA.locator('button', { hasText: /^EN$/i });
  if (await enButtonA.isVisible().catch(() => false)) await enButtonA.click();

  await pageA.locator('button', { hasText: /Create Room/i }).first().click();
  await pageA.locator('input[placeholder*="name" i]').first().fill('HostP1');
  
  // Set to private and Create
  await pageA.locator('button', { hasText: /^Private$/i }).first().click();
  await pageA.locator('button', { hasText: /^Create$/i }).first().click();
  
  // Wait for Lobby to appear
  const lobbyHeader = pageA.locator('h1', { hasText: /Game Lobby/i });
  await expect(lobbyHeader).toBeVisible({ timeout: 15000 });

  // Extract real Room ID
  const roomIdSpan = pageA.locator('span.text-amber-300').first();
  await expect(roomIdSpan).toBeVisible();
  const realMatchID = (await roomIdSpan.innerText()).trim();

  // Context B: Joiner
  const contextB = await browser.newContext();
  const pageB = await contextB.newPage();
  await pageB.goto('/');
  
  const enButtonB = pageB.locator('button', { hasText: /^EN$/i });
  if (await enButtonB.isVisible().catch(() => false)) await enButtonB.click();

  await pageB.locator('button', { hasText: /Join Room/i }).first().click();
  await pageB.locator('input[placeholder*="name" i]').first().fill('GuestP2');
  await pageB.locator('button', { hasText: /Private Room/i }).first().click();
  await pageB.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first().fill(realMatchID);
  await pageB.locator('button', { hasText: /^Join$/i }).first().click();

  // Wait for Lobby to appear on Guest Page
  await expect(pageB.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

  // Host starts the game
  const startGameBtn = pageA.locator('button', { hasText: /Start Game/i }).first();
  await expect(startGameBtn).toBeEnabled();
  await startGameBtn.click();

  // Both should see the game container (board)
  await expect(pageA.locator('.bg-emerald-900\\/40').first()).toBeVisible({ timeout: 20000 });
  await expect(pageB.locator('.bg-emerald-900\\/40').first()).toBeVisible({ timeout: 20000 });
});
