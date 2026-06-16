import { test, expect } from '@playwright/test';

test('Bot should be named El Haj and Darba announcement should display You hit El Haj', async ({ page }) => {
  test.setTimeout(60000);
  page.on('console', msg => console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`));
  console.log('Navigating to game...');
  await page.goto('/');

  // Set language to English for predictable texts
  const enButton = page.locator('button', { hasText: /^EN$/i });
  if (await enButton.isVisible().catch(() => false)) {
    await enButton.click();
  }

  // Click "Start Game" (vs Bot)
  const playBtn = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i });
  await expect(playBtn.first()).toBeVisible({ timeout: 10000 });
  await playBtn.first().click();

  // Wait for board to render
  const mainContainer = page.locator('.min-h-screen').first();
  await expect(mainContainer).toBeVisible({ timeout: 10000 });

  // 1. Verify opponent's name is "El Haj"
  // The opponent's name is rendered in the top seat area
  const opponentNameEl = page.locator('.top-partner-hand .text-slate-400').first();
  await expect(opponentNameEl).toBeVisible({ timeout: 10000 });
  
  const actualName = await opponentNameEl.innerText();
  console.log(`Opponent name in UI: "${actualName}"`);
  expect(actualName.trim(), 'Opponent name should be El Haj').toBe('El Haj');

  // 2. Play cards until a Darba happens, then check the popup text
  const myCards = page.locator('.cursor-grab');
  const popupText = page.locator('.fixed.inset-0.z-\\[100\\] p');

  console.log('Playing cards to trigger Darba...');
  let darbaDetected = false;

  for (let i = 0; i < 80; i++) {
    // Check if Darba popup is visible
    if (await popupText.isVisible().catch(() => false)) {
      const text = await popupText.innerText();
      console.log(`Popup text detected: "${text}"`);
      if (text.includes('hit') || text.includes('hits') || text.includes('Darba')) {
        expect(text).toContain('El Haj');
        if (text.includes('You hit')) {
          expect(text).toContain('You hit El Haj (+1 you)');
        } else {
          expect(text).toContain('hits you (+1 El Haj)');
        }
        darbaDetected = true;
        break;
      }
    }

    // Play a card if it's our turn
    const cardCount = await myCards.count().catch(() => 0);
    if (cardCount > 0) {
      try {
        const tableCardTestIds = await page.locator('[data-test-id="game-table"] [data-testid]').evaluateAll(elements =>
          elements.map(el => el.getAttribute('data-testid'))
        );
        const handCardTestIds = await page.locator('.game-hand').last().locator('[data-testid]').evaluateAll(elements =>
          elements.map(el => el.getAttribute('data-testid'))
        );

        let matchingHandIndex = 0; // Default to first card
        for (let h = 0; h < handCardTestIds.length; h++) {
          if (!handCardTestIds[h]) continue;
          const handVal = handCardTestIds[h].split('-')[2];
          for (let t = 0; t < tableCardTestIds.length; t++) {
            if (!tableCardTestIds[t]) continue;
            const tableVal = tableCardTestIds[t].split('-')[2];
            if (handVal === tableVal) {
              matchingHandIndex = h;
              break;
            }
          }
          if (matchingHandIndex !== 0) break;
        }

        await myCards.nth(matchingHandIndex).click({ force: true });
      } catch {
        await myCards.first().click({ force: true }).catch(() => {});
      }
    }

    await page.waitForTimeout(1000);
  }

  expect(darbaDetected, 'A Darba should have occurred during the game').toBe(true);
});
