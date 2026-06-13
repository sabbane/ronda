import { test, expect } from '@playwright/test';

test('Card background should remain white in dark mode', async ({ page }) => {
  // 1. Emulate dark mode in the browser
  await page.emulateMedia({ colorScheme: 'dark' });

  // 2. Start at the main page
  await page.goto('/');

  // 3. Select English language
  const enButton = page.locator('button', { hasText: /^EN$/i });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // 4. Click "Start Game" in the Singleplayer section
  const playBtn = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i });
  await expect(playBtn.first()).toBeVisible({ timeout: 10000 });
  await playBtn.first().click();

  // 5. Wait for cards to appear
  const firstCard = page.locator('[data-testid^="card-"]').first();
  await expect(firstCard).toBeVisible({ timeout: 10000 });

  // 6. Get the computed style of the card
  const styles = await firstCard.evaluate(el => {
    const computed = window.getComputedStyle(el);
    return {
      backgroundColor: computed.backgroundColor
    };
  });

  console.log(`[Diagnostic] Card background: ${styles.backgroundColor}`);

  // In dark mode, the card background must change to #f4ecc2 (rgb(244, 236, 194))
  expect(styles.backgroundColor).toBe('rgb(244, 236, 194)');
});
