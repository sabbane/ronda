import { test, expect } from '@playwright/test';

test('Smoke Test: App loads correctly and is not a white page', async ({ page }) => {
  // Navigate to the local dev server
  await page.goto('http://localhost:5173');

  // 1. Check if the page title is correct
  await expect(page).toHaveTitle(/Ronda/);

  // 2. Check for the presence of the main logo/title text
  // The app uses t('logo') which should be "Ronda"
  const logo = page.locator('h1');
  await expect(logo).toBeVisible();
  
  // 3. Check if the main action buttons are rendered
  // This confirms the component tree didn't crash before rendering the menu
  const playButton = page.locator('button', { hasText: /Play|Jouer|لعب/i });
  await expect(playButton.first()).toBeVisible();

  // 4. Verify no "White Screen of Death" by checking background visibility
  // If we can see the background div or the main container, it's rendering
  const mainContainer = page.locator('.min-h-screen');
  await expect(mainContainer).toBeVisible();
  
  console.log('Smoke test passed: App is rendering correctly.');
});
