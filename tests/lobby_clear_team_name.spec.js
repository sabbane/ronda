import { test, expect } from '@playwright/test';

test.describe('Multiplayer Lobby: Clear Team Name Bug', () => {
  test('should allow fully clearing the team name input field', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/?botFallback=true');

    // 2. Select English
    const enButton = page.locator('button', { hasText: /^EN$/i });
    if (await enButton.isVisible().catch(() => false)) await enButton.click();

    // 3. Create Room
    await page.locator('button', { hasText: /Create Room/i }).first().click();
    await page.locator('input[placeholder*="name" i]').first().fill('HostPlayer');

    // 4. Select 4 Players
    const fourPlayersBtn = page.locator('button', { hasText: /4 Players/i }).first();
    await expect(fourPlayersBtn).toBeVisible({ timeout: 5000 });
    await fourPlayersBtn.click();

    // 5. Create
    await page.locator('button', { hasText: /^Public$/i }).first().click();
    await page.locator('button', { hasText: /^Create$/i }).first().click();

    // 6. Wait for Game Lobby
    await expect(page.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // 7. Locate Team A name input
    const teamAInput = page.locator('input[placeholder*="Team A" i]').first();
    await expect(teamAInput).toBeVisible();

    // 8. Enter "Warriors" into Team A name
    console.log('[Test Log] Entering "Warriors" into Team A name input...');
    await teamAInput.fill('Warriors');
    await expect(teamAInput).toHaveValue('Warriors', { timeout: 5000 });

    // 9. Clear the input field
    console.log('[Test Log] Clearing Team A name input...');
    await teamAInput.fill('');
    
    // We expect the value to successfully become empty ""
    console.log('[Test Log] Verifying if Team A name input is empty...');
    await expect(teamAInput).toHaveValue('', { timeout: 5000 });

    console.log('✅ Success: Team A name was cleared successfully.');
  });
});
