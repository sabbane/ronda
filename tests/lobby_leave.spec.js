import { test, expect } from '@playwright/test';

test('Multiplayer: Guest leaving the lobby should remove them from the Host view and make the slot available again', async ({ browser }) => {
  // 1. Setup two isolated browser contexts to simulate Host (Player 1) and Guest (Player 2)
  const hostContext = await browser.newContext();
  const guestContext = await browser.newContext();

  const hostPage = await hostContext.newPage();
  const guestPage = await guestContext.newPage();

  hostPage.on('console', msg => console.log(`[Host Console] ${msg.text()}`));
  guestPage.on('console', msg => console.log(`[Guest Console] ${msg.text()}`));

  hostPage.on('pageerror', err => console.error(`[Host Page Error] ${err.message}\n${err.stack}`));
  guestPage.on('pageerror', err => console.error(`[Guest Page Error] ${err.message}\n${err.stack}`));

  const hostNickname = 'RondaHost';
  const guestNickname = 'CardGuest';

  // ─── STEP 1: HOST CREATES A PUBLIC ROOM ───
  await hostPage.goto('/');

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

  // Extract the generated match ID
  const roomIdLocator = hostPage.locator('span.text-amber-300').first();
  await expect(roomIdLocator).toBeVisible();
  const realMatchID = (await roomIdLocator.innerText()).trim();
  console.log('[Test Log] Extracted realMatchID:', realMatchID);

  // ─── STEP 2: GUEST JOINS THE PUBLIC ROOM ───
  await guestPage.goto('/');

  // Click "Join Room"
  const joinRoomBtn = guestPage.locator('button', { hasText: /Join Room/i }).first();
  await expect(joinRoomBtn).toBeVisible();
  await joinRoomBtn.click();

  // Fill in Guest Nickname
  const guestNicknameInput = guestPage.locator('input[placeholder*="name" i]').first();
  await guestNicknameInput.fill(guestNickname);

  // Select "Public Rooms" tab
  const publicRoomsTab = guestPage.locator('button', { hasText: /Public Rooms/i }).first();
  await publicRoomsTab.click();

  // Wait for the room to appear and click "Join"
  const joinActionBtn = guestPage.locator(`span.text-amber-200:has-text("${realMatchID}")`).locator('xpath=../..').locator('button', { hasText: /Join|Rejoindre/i }).first();
  await expect(joinActionBtn).toBeVisible({ timeout: 10000 });
  await joinActionBtn.click();

  // Wait until Guest is in the Lobby
  const guestLobbyHeader = guestPage.locator('h1', { hasText: /Game Lobby/i });
  await expect(guestLobbyHeader).toBeVisible({ timeout: 15000 });

  // Verify Host sees the Guest's nickname in the Lobby
  const hostLobbyGuestName = hostPage.locator(`text=${guestNickname}`).first();
  await expect(hostLobbyGuestName).toBeVisible({ timeout: 15000 });

  // ─── STEP 3: GUEST LEAVES THE LOBBY ───
  const leaveLobbyBtn = guestPage.locator('button', { hasText: /Leave Lobby/i }).first();
  await expect(leaveLobbyBtn).toBeVisible();
  await leaveLobbyBtn.click();

  // Verify Guest has returned to the main menu
  const guestMainMenuLogo = guestPage.locator('h1', { hasText: /RONDA/i });
  await expect(guestMainMenuLogo).toBeVisible({ timeout: 15000 });

  await expect(hostLobbyGuestName).not.toBeVisible({ timeout: 10000 });

  // ─── STEP 4: VERIFY ROOM IS LISTED AS AVAILABLE AGAIN ───
  // Give the server a small moment to fully process the leaveMatch request
  await guestPage.waitForTimeout(1000);
  // Open another guest page to check if the room is available in Public Rooms again
  const anotherGuestContext = await browser.newContext();
  const anotherGuestPage = await anotherGuestContext.newPage();
  await anotherGuestPage.goto('/');

  const anotherJoinRoomBtn = anotherGuestPage.locator('button', { hasText: /Join Room/i }).first();
  await anotherJoinRoomBtn.click();

  const anotherGuestNicknameInput = anotherGuestPage.locator('input[placeholder*="name" i]').first();
  await anotherGuestNicknameInput.fill('AnotherGuest');

  const anotherPublicRoomsTab = anotherGuestPage.locator('button', { hasText: /Public Rooms/i }).first();
  await anotherPublicRoomsTab.click();

  // Assert that the room ID is visible again in the list
  const listedRoom = anotherGuestPage.locator(`text=${realMatchID}`);
  await expect(listedRoom).toBeVisible({ timeout: 15000 });

  // Clean up
  await hostContext.close();
  await guestContext.close();
  await anotherGuestContext.close();
});
