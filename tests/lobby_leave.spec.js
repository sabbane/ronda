import { test, expect } from '@playwright/test';

test('Multiplayer: Guest leaving the lobby should remove them from the Host view and make the slot available again', async ({ browser }) => {
  // 1. Setup two isolated browser contexts to simulate Host (Player 1) and Guest (Player 2)
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();

  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();

  hostPage.on('console', msg => console.log(`[Host Console] ${msg.text()}`));
  guestPage.on('console', msg => console.log(`[Guest Console] ${msg.text()}`));

  const hostNickname = 'RondaHost';
  const guestNickname = 'CardGuest';

  // ─── STEP 1: HOST CREATES A PUBLIC ROOM ───
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
  const hostLobbyHeader = hostPage.locator('h1', { hasText: /Game Lobby|Spiel-Lobby/i });
  await expect(hostLobbyHeader).toBeVisible({ timeout: 10000 });

  // Extract the generated match ID
  const roomIdLocator = hostPage.locator('span.text-amber-300').first();
  await expect(roomIdLocator).toBeVisible();
  const realMatchID = (await roomIdLocator.innerText()).trim();

  // ─── STEP 2: GUEST JOINS THE PUBLIC ROOM ───
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

  // Wait for the room to appear and click "Join" / "Beitreten"
  const joinActionBtn = guestPage.locator(`xpath=//div[contains(., "${realMatchID}")]//button[contains(., "Join") or contains(., "Beitreten")]`).first();
  await expect(joinActionBtn).toBeVisible({ timeout: 10000 });
  await joinActionBtn.click();

  // Wait until Guest is in the Lobby
  const guestLobbyHeader = guestPage.locator('h1', { hasText: /Game Lobby|Spiel-Lobby/i });
  await expect(guestLobbyHeader).toBeVisible({ timeout: 10000 });

  // Verify Host sees the Guest's nickname in the Lobby
  const hostLobbyGuestName = hostPage.locator(`text=${guestNickname}`).first();
  await expect(hostLobbyGuestName).toBeVisible({ timeout: 5000 });

  // ─── STEP 3: GUEST LEAVES THE LOBBY ───
  const leaveLobbyBtn = guestPage.locator('button', { hasText: /Leave Lobby|Raum verlassen/i }).first();
  await expect(leaveLobbyBtn).toBeVisible();
  await leaveLobbyBtn.click();

  // Verify Guest has returned to the main menu
  const guestMainMenuLogo = guestPage.locator('h1', { hasText: /RONDA/i });
  await expect(guestMainMenuLogo).toBeVisible({ timeout: 5000 });

  await expect(hostLobbyGuestName).not.toBeVisible({ timeout: 10000 });

  // ─── STEP 4: VERIFY ROOM IS LISTED AS AVAILABLE AGAIN ───
  // Give the server a small moment to fully process the leaveMatch request
  await guestPage.waitForTimeout(1000);
  // Open another guest page to check if the room is available in Public Rooms again
  const anotherGuestContext = await browser.newContext();
  const anotherGuestPage = await anotherGuestContext.newPage();
  await anotherGuestPage.goto('/');

  const anotherJoinRoomBtn = anotherGuestPage.locator('button', { hasText: /Join Room|Raum beitreten/i }).first();
  await anotherJoinRoomBtn.click();

  const anotherGuestNicknameInput = anotherGuestPage.locator('input[placeholder*="name" i], input[placeholder*="Namen" i]').first();
  await anotherGuestNicknameInput.fill('AnotherGuest');

  const anotherPublicRoomsTab = anotherGuestPage.locator('button', { hasText: /Public Rooms|Öffentlicher Raum/i }).first();
  await anotherPublicRoomsTab.click();

  // Assert that the room ID is visible again in the list
  const listedRoom = anotherGuestPage.locator(`text=${realMatchID}`);
  await expect(listedRoom).toBeVisible({ timeout: 5000 });

  // Clean up
  await hostContext.close();
  await guestContext.close();
  await anotherGuestContext.close();
});
