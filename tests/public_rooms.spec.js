import { test, expect } from '@playwright/test';

test('Multiplayer: Created public room should be listed in Public Rooms with correct host nickname', async ({ browser }) => {
  // 1. Setup two isolated browser contexts to simulate Host (Player 1) and Guest (Player 2)
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();

  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();

  const uniqueRoomId = `public-room-${Date.now()}`;
  const hostNickname = 'RondaLegend';
  const guestNickname = 'CardMaster';

  // ─── PLAYER 1 (HOST) CREATES A PUBLIC ROOM ───
  await hostPage.goto('/');

  // Click "Create Room" / "Raum erstellen"
  const createRoomBtn = hostPage.locator('button', { hasText: /Create Room|Raum erstellen/i }).first();
  await expect(createRoomBtn).toBeVisible();
  await createRoomBtn.click();

  // Fill in Host Nickname
  const hostNicknameInput = hostPage.locator('input[placeholder*="name" i], input[placeholder*="Namen" i]').first();
  await hostNicknameInput.fill(hostNickname);

  // Set privacy to Public (Öffentlich)
  const publicBtn = hostPage.locator('button', { hasText: /Public|Öffentlich/i }).first();
  await publicBtn.click();

  // Click "Create" / "Erstellen"
  const createSubmitBtn = hostPage.locator('button', { hasText: /^Create$|^Erstellen$/i }).first();
  await createSubmitBtn.click();

  // Wait until Host is in the Lobby
  const lobbyHeader = hostPage.locator('h1', { hasText: /Game Lobby|Spiel-Lobby/i });
  await expect(lobbyHeader).toBeVisible({ timeout: 10000 });

  // Extract the dynamically generated match ID from the host's Lobby screen
  const roomIdLocator = hostPage.locator('span.text-amber-300').first();
  await expect(roomIdLocator).toBeVisible();
  const realMatchID = (await roomIdLocator.innerText()).trim();
  console.log('Extracted generated Match ID:', realMatchID);

  // ─── PLAYER 2 (GUEST) TRIES TO FIND THE ROOM ───
  await guestPage.goto('/');

  // Click "Join Room" / "Raum beitreten"
  const joinRoomBtn = guestPage.locator('button', { hasText: /Join Room|Raum beitreten/i }).first();
  await expect(joinRoomBtn).toBeVisible();
  await joinRoomBtn.click();

  // Fill in Guest Nickname
  const guestNicknameInput = guestPage.locator('input[placeholder*="name" i], input[placeholder*="Namen" i]').first();
  await guestNicknameInput.fill(guestNickname);

  // Select "Public Rooms" / "Öffentlicher Raum" tab
  const publicRoomsTab = guestPage.locator('button', { hasText: /Public Rooms|Öffentlicher Raum/i }).first();
  await publicRoomsTab.click();

  // Wait for loading indicator to disappear, or wait for open rooms list to update
  await guestPage.waitForTimeout(2000); // Give the API list response some time to complete

  // Assert that the created room ID is listed in the open rooms section
  const listedRoom = guestPage.locator(`text=${realMatchID}`);
  await expect(listedRoom).toBeVisible({ timeout: 5000 });

  // Assert that the listed host nickname is exactly what the host entered (e.g. "RondaLegend") and not "Host"
  const hostNameLabel = guestPage.locator(`text=Host: ${hostNickname}`).first();
  await expect(hostNameLabel).toBeVisible({ timeout: 5000 });

  // Clean up contexts
  await hostContext.close();
  await guestContext.close();
});
