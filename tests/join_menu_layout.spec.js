import { test, expect } from '@playwright/test';

test('Join Menu: Join button must be fully contained within the menu subpanel on mobile', async ({ page }) => {
  // Set viewport to mobile size
  await page.setViewportSize({ width: 375, height: 812 });

  console.log('Navigating to home page...');
  await page.goto('/');

  // 1. Select English language if language selector is visible
  const enButton = page.locator('button').filter({ has: page.locator('img[alt="EN"]') }).first();
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // 2. Click "Join Room" button on the Main Menu
  const joinRoomBtn = page.locator('button', { hasText: /Join Room/i }).first();
  await expect(joinRoomBtn).toBeVisible();
  await joinRoomBtn.click();

  // 3. Click "Private Room" tab to open the Room ID input view
  const privateRoomTab = page.locator('button', { hasText: /Private Room/i }).first();
  await expect(privateRoomTab).toBeVisible();
  await privateRoomTab.click();

  // 4. Locate the "Join" button next to the Room ID input
  // In MainMenu.jsx, this is the submit button for joining:
  // <button className="btn-moroccan-primary ...">{isCheckingRoom ? '...' : t('join')}</button>
  // Let's target the button inside the input container or by text "Join"
  const joinSubmitBtn = page.locator('div.flex.gap-2 button', { hasText: /^Join$/i }).first();
  await expect(joinSubmitBtn).toBeVisible();

  // 5. Locate the subpanel container
  const subpanel = page.locator('.menu-subpanel').first();
  await expect(subpanel).toBeVisible();

  // 6. Get bounding boxes of both elements
  const subpanelBox = await subpanel.boundingBox();
  const buttonBox = await joinSubmitBtn.boundingBox();

  expect(subpanelBox).not.toBeNull();
  expect(buttonBox).not.toBeNull();

  const subpanelRight = subpanelBox.x + subpanelBox.width;
  const buttonRight = buttonBox.x + buttonBox.width;

  console.log(`Subpanel right boundary: ${subpanelRight}px`);
  console.log(`Join button right boundary: ${buttonRight}px`);

  // Assert that the Join button does not overflow the subpanel on the right
  expect(buttonRight).toBeLessThanOrEqual(subpanelRight);
});
