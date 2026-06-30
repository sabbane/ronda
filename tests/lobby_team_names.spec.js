import { test, expect } from '@playwright/test';

test.describe('Multiplayer Lobby: Team Names', () => {
  test('team name inputs must be empty on lobby creation (no pre-filled default names)', async ({ page }) => {
    // 1. Navigate to homepage
    await page.goto('/');

    // 2. Select English
    const enButton = page.locator('button', { hasText: /^EN$/i });
    if (await enButton.isVisible().catch(() => false)) await enButton.click();

    // 3. Click "Create Room"
    await page.locator('button', { hasText: /Create Room/i }).first().click();
    await page.locator('input[placeholder*="name" i]').first().fill('HostPlayer');

    // 4. Select 4 Players
    const fourPlayersBtn = page.locator('button', { hasText: /4 Players/i }).first();
    await expect(fourPlayersBtn).toBeVisible({ timeout: 5000 });
    await fourPlayersBtn.click();

    // 5. Create the room (Public/Create)
    await page.locator('button', { hasText: /^Public$/i }).first().click();
    await page.locator('button', { hasText: /^Create$/i }).first().click();

    // 6. Wait for Game Lobby
    await expect(page.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // 7. Verify Team A and Team B name inputs are empty
    const teamAInput = page.locator('input[placeholder*="Team A" i]').first();
    const teamBInput = page.locator('input[placeholder*="Team B" i]').first();

    await expect(teamAInput).toBeVisible();
    await expect(teamBInput).toBeVisible();

    const valA = await teamAInput.inputValue();
    const valB = await teamBInput.inputValue();

    console.log(`[Test Log] Team A Name Input Value: "${valA}"`);
    console.log(`[Test Log] Team B Name Input Value: "${valB}"`);

    // We assert that the inputs are empty.
    // If the server randomly pre-filled them, this assertion will fail.
    expect(valA).toBe('');
    expect(valB).toBe('');
  });
});
