import { test, expect } from '@playwright/test';

/**
 * Regression test to detect the "Stuck on Connecting" bug in Multiplayer.
 * 
 * The bug occurs when the App component crashes during initialization (e.g. undefined variables 
 * in setupData), causing it to stay on the LoadingScreen indefinitely instead of rendering 
 * the RondaClientOnline and the Board.
 */
test('Multiplayer: Should NOT get stuck on Connecting screen', async ({ page }) => {
  await page.goto('/');

  // Select Language (English) for consistency
  const enButton = page.locator('button', { hasText: /^EN$/i });
  if (await enButton.isVisible().catch(() => false)) await enButton.click();

  // 1. Click Create Room
  const createBtn = page.locator('button', { hasText: /Create Room/i }).first();
  await createBtn.click();

  // 2. Fill in Nickname
  const nicknameInput = page.locator('input[placeholder*="name" i]').first();
  await nicknameInput.fill('Tester');

  // 3. Click Create
  const submitCreate = page.locator('button', { hasText: /^Create$/i }).first();
  await submitCreate.click();

  // 3. EXPECT: The Loading Screen should appear briefly but THEN disappear
  // The loading screen has the "Connecting..." text (or localized version)
  const loadingText = page.locator('h2', { hasText: /Connecting|Connexion|جاري الاتصال/i });
  
  // Wait for loading screen to appear (it should be there almost immediately)
  // But more importantly, wait for it to DISAPPEAR within a reasonable time.
  await expect(loadingText).not.toBeVisible({ timeout: 15000 });

  // 4. EXPECT: The Game Board should be visible
  // The Board has a "Back to Menu" button (localized)
  const backToMenuBtn = page.locator('button', { hasText: /Back to Menu|Retour au Menu|العودة إلى القائمة/i });
  await expect(backToMenuBtn).toBeVisible({ timeout: 5000 });

  console.log('✅ Connection successful: Board is visible and Loading screen is gone.');
});
