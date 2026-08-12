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
    // 1. Post a started event via API
    const matchID = `test-match-${Date.now()}`;
    const startResp = await request.post('http://localhost:8000/api/analytics/event', {
      data: {
        matchID,
        type: 'game_started',
        mode: 'singleplayer',
        numPlayers: 2,
        platform: 'desktop',
        language: 'en'
      }
    });
    expect(startResp.ok()).toBeTruthy();

    // 2. Post a completed event via API
    const completeResp = await request.post('http://localhost:8000/api/analytics/event', {
      data: {
        matchID,
        type: 'game_completed',
        mode: 'singleplayer',
        numPlayers: 2,
        platform: 'desktop',
        language: 'en',
        duration: 180,
        finalScores: [21, 15]
      }
    });
    expect(completeResp.ok()).toBeTruthy();

    // 3. Open dashboard and login
    await page.goto('/#/stats');
    await page.locator('input[type="password"]').fill('fkpLU46:');
    await page.locator('button', { hasText: 'Access Dashboard' }).click();

    // 4. Verify that the started count is displayed (at least 1)
    const startedCardValue = page.getByTestId('kpi-games-started');
    await expect(startedCardValue).not.toHaveText('0');

    // 5. Verify that the completed count is displayed (at least 1)
    const completedCardValue = page.getByTestId('kpi-games-completed');
    await expect(completedCardValue).not.toHaveText('0');
  });

});
