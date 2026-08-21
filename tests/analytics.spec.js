import { test, expect } from '@playwright/test';

test.describe('Analytics & Stats Dashboard Tests', () => {
  
  test('1. Direct URL navigation to statistics dashboard requires password', async ({ page }) => {
    // Navigate directly to statistics route
    await page.goto('/#/stats');

    // Confirm that the login page is shown
    const title = page.locator('h2', { hasText: 'Ronda Analytics' });
    await expect(title).toBeVisible();

    const passwordInput = page.locator('input[type="password"]');
    await expect(passwordInput).toBeVisible();
  });

  test('2. Entering invalid password shows error', async ({ page }) => {
    await page.goto('/#/stats');

    const passwordInput = page.locator('input[type="password"]');
    await passwordInput.fill('wrong_password_123');
    
    const submitBtn = page.locator('button', { hasText: 'Access Dashboard' });
    await submitBtn.click();

    // Verify error display
    const errorMsg = page.locator('text=Invalid password');
    await expect(errorMsg).toBeVisible();
  });

  test('3. Entering correct password logs in and shows the dashboard', async ({ page }) => {
    await page.goto('/#/stats');

    const passwordInput = page.locator('input[type="password"]');
    // Using default VITE_TEST_MODE admin password
    await passwordInput.fill('fkpLU46:');

    const submitBtn = page.locator('button', { hasText: 'Access Dashboard' });
    await submitBtn.click();

    // Verify dashboard displays
    const header = page.locator('h1', { hasText: 'Ronda Dashboard' });
    await expect(header).toBeVisible();

    const kpiStarted = page.locator('p', { hasText: 'Games Started' });
    await expect(kpiStarted).toBeVisible();

    const signOutBtn = page.locator('button', { hasText: 'Sign Out' });
    await expect(signOutBtn).toBeVisible();
  });

  test('4. End-to-end API event tracking verifies in dashboard', async ({ request, page }) => {
    const timestamp = Date.now();
    // 1. Post singleplayer started and completed event with 1 player
    const matchID1 = `test-match-sp-${timestamp}`;
    const startResp1 = await request.post('http://localhost:8000/api/analytics/event', {
      data: {
        matchID: matchID1,
        type: 'game_started',
        mode: 'singleplayer',
        numPlayers: 1,
        platform: 'desktop',
        language: 'en'
      }
    });
    expect(startResp1.ok()).toBeTruthy();

    const completeResp1 = await request.post('http://localhost:8000/api/analytics/event', {
      data: {
        matchID: matchID1,
        type: 'game_completed',
        mode: 'singleplayer',
        numPlayers: 1,
        platform: 'desktop',
        language: 'en',
        duration: 180,
        finalScores: [21, 15]
      }
    });
    expect(completeResp1.ok()).toBeTruthy();

    // 2. Post multiplayer private 4p started event
    const matchID2 = `test-match-priv4p-${timestamp}`;
    const startResp2 = await request.post('http://localhost:8000/api/analytics/event', {
      data: {
        matchID: matchID2,
        type: 'game_started',
        mode: 'multiplayer_private',
        numPlayers: 4,
        platform: 'mobile',
        language: 'fr'
      }
    });
    expect(startResp2.ok()).toBeTruthy();

    // 3. Open dashboard and login
    await page.goto('/#/stats');
    await page.locator('input[type="password"]').fill('fkpLU46:');
    await page.locator('button', { hasText: 'Access Dashboard' }).click();

    // 4. Verify that the started count and completed count are displayed
    const startedCardValue = page.getByTestId('kpi-games-started');
    await expect(startedCardValue).not.toHaveText('0');

    const completedCardValue = page.getByTestId('kpi-games-completed');
    await expect(completedCardValue).not.toHaveText('0');

    // 5. Verify the Detailed Modes Table is rendered
    const matrixTitle = page.locator('h4', { hasText: 'Mode & Player Count Matrix' });
    await expect(matrixTitle).toBeVisible();

    const singleplayerRow = page.locator('tr', { hasText: 'Singleplayer (1 Player vs Bot)' });
    await expect(singleplayerRow).toBeVisible();

    const private4pRow = page.locator('tr', { hasText: 'Multiplayer Private (4 Players)' });
    await expect(private4pRow).toBeVisible();

    // 6. Verify Player Count segment shows 1 Player (Single)
    const singlePlayerLabel = page.locator('span', { hasText: '1 Player (Single)' });
    await expect(singlePlayerLabel).toBeVisible();
  });
});
