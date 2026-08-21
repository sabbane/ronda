import { test, expect } from '@playwright/test';

test('Player should be able to set name once as a guest, after which name is permanent and non-editable', async ({ page }) => {
  // 1. Start at the main page
  await page.goto('/');

  // Select English language for consistency
  const enButton = page.locator('button', { hasText: /^EN$/i });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // 2. Locate the editable guest profile button in the Main Menu
  const editProfileBtn = page.locator('button[title*="choose Player Name"], button:has-text("✏️")').first();
  await expect(editProfileBtn).toBeVisible({ timeout: 10000 });

  // 3. Click the profile button to trigger the name modal
  await editProfileBtn.click();

  // 4. Assert that UsernameModal opens with Cancel and Save buttons
  const usernameModalInput = page.locator('input[placeholder*="Nickname"], input[placeholder*="name"]');
  await expect(usernameModalInput).toBeVisible({ timeout: 5000 });

  const cancelButton = page.locator('button', { hasText: /^Cancel$/i }).first();
  await expect(cancelButton).toBeVisible();

  const saveButton = page.locator('button', { hasText: /^Save$/i }).first();
  await expect(saveButton).toBeVisible();

  // 5. Test Cancel button functionality (remains guest)
  await cancelButton.click();
  await expect(usernameModalInput).not.toBeVisible({ timeout: 5000 });
  await expect(editProfileBtn).toBeVisible();

  // 6. Re-open and save new permanent name
  await editProfileBtn.click();
  await expect(usernameModalInput).toBeVisible({ timeout: 5000 });
  await usernameModalInput.fill('AtlasMaster');
  await saveButton.click();

  // 7. Assert that the modal closes, name is updated, and edit icon/button is no longer available
  await expect(usernameModalInput).not.toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=AtlasMaster')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('button:has-text("✏️")')).not.toBeVisible({ timeout: 5000 });
});

test('Player should be able to set name once from Leaderboard, after which edit button disappears', async ({ page }) => {
  // 1. Start at main page
  await page.goto('/');

  // Select English
  const enButton = page.locator('button', { hasText: /^EN$/i });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // 2. Open Leaderboard by clicking trophy/points button in Main Menu
  const lbTrigger = page.locator('button[title*="view Leaderboard"], button[title*="Leaderboard"]').first();
  await expect(lbTrigger).toBeVisible({ timeout: 10000 });
  await lbTrigger.click();

  // 3. Click on the name edit button in the Leaderboard header (as a guest)
  const editNameBtn = page.locator('button[title*="choose name"], button:has-text("✏️")').first();
  await expect(editNameBtn).toBeVisible({ timeout: 5000 });
  await editNameBtn.click();

  // 4. Enter new name and submit with Save
  const usernameModalInput = page.locator('input[placeholder*="Nickname"], input[placeholder*="name"]');
  await expect(usernameModalInput).toBeVisible({ timeout: 5000 });
  await usernameModalInput.fill('RondaChampion');

  const saveButton = page.locator('button', { hasText: /^Save$/i }).first();
  await expect(saveButton).toBeVisible();
  await saveButton.click();

  // 5. Assert updated permanent name is displayed in Leaderboard header and pencil icon is gone
  await expect(usernameModalInput).not.toBeVisible({ timeout: 5000 });
  await expect(page.locator('text=RondaChampion')).toBeVisible({ timeout: 5000 });
  await expect(page.locator('button:has-text("✏️")')).not.toBeVisible({ timeout: 5000 });
});

test('Multiplayer room creation panel shows editable username for guests and read-only for registered users', async ({ page }) => {
  // 1. Start at main page as a fresh guest
  await page.goto('/');

  // Select English
  const enButton = page.locator('button', { hasText: /^EN$/i });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // 2. Click "Create Room" in Multiplayer
  const createRoomBtn = page.locator('button', { hasText: /Create Room/i }).first();
  await expect(createRoomBtn).toBeVisible({ timeout: 10000 });
  await createRoomBtn.click();

  // 3. Verify the Username input field is editable for a guest
  const mpUsernameInput = page.locator('input[aria-label="Username"], input[placeholder*="Nickname"]');
  await expect(mpUsernameInput).toBeVisible({ timeout: 5000 });
  await expect(mpUsernameInput).toBeEditable();

  // 4. Return to Main Menu and set permanent name via profile button
  const backBtn = page.locator('button', { hasText: /Back/i }).first();
  if (await backBtn.isVisible()) {
    await backBtn.click();
  } else {
    await page.goto('/');
  }

  const editProfileBtn = page.locator('button[title*="choose Player Name"], button:has-text("✏️")').first();
  if (await editProfileBtn.isVisible()) {
    await editProfileBtn.click();
    const modalInput = page.locator('input[placeholder*="Nickname"], input[placeholder*="name"]');
    await modalInput.fill('MultiMaster');
    const saveBtn = page.locator('button', { hasText: /^Save$/i }).first();
    await saveBtn.click();
    await expect(modalInput).not.toBeVisible({ timeout: 5000 });
  }

  // 5. Re-open Multiplayer "Create Room"
  await createRoomBtn.click();
  await expect(mpUsernameInput).toBeVisible({ timeout: 5000 });
  await expect(mpUsernameInput).not.toBeEditable();
  await expect(mpUsernameInput).toHaveValue(/MultiMaster/);
});
