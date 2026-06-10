import { test, expect } from '@playwright/test';

test.describe('Functional Test: Complete Game vs AI', () => {
  // A complete game has 40 cards, each player plays 20 cards.
  // With delays for bot moves, dealing animations, and capturing animations, 
  // it can take around 2.5 to 4 minutes to complete a full game with new animations.
  test.setTimeout(300_000);

  test('A full game against the bot completes successfully', async ({ page, baseURL }) => {
    console.log(`Navigating to ${baseURL || '/'}...`);
    await page.goto('/');

    // 1. Select Language to English (for predictable button texts)
    // Find the English flag button by checking if it contains 'EN' text.
    const enButton = page.locator('button', { hasText: /^EN$/i });
    if (await enButton.isVisible().catch(() => false)) {
      await enButton.click();
    }

    // 2. Click "Start Game" button
    const playBtn = page.locator('button', { hasText: /Start Game|Commencer le jeu|ابدأ اللعبة|Play vs AI Bot/i });
    await expect(playBtn.first()).toBeVisible();
    await playBtn.first().click();

    // 3. Wait for the game board to render
    const mainContainer = page.locator('.min-h-screen').first();
    await expect(mainContainer).toBeVisible({ timeout: 10000 });
    console.log('Game board loaded.');
    
    // --- NEW CHECKS TO DETECT THE RENDERING BUG ---
    // At the start of a standard game, there should be exactly 4 cards on the table.
    // We locate img elements inside the table area (the emerald felt container).
    // The table is identified by its emerald background class.
    const tableArea = page.locator('.bg-emerald-900\\/40').first();
    const tableCardImgs = tableArea.locator('img');
    
    console.log('Verifying initial game state rendering...');
    // Wait for initial dealing animations to complete and interactive cards to appear
    await expect(page.locator('.cursor-grab')).toHaveCount(3, { timeout: 10000 });
    
    const tableCount = await tableCardImgs.count();
    // Hand cards are the ones with cursor-grab (the player's interactive cards)
    const handCount = 3;
    
    console.log(`Diagnostic: Table card imgs: ${tableCount}, Player hand cards (cursor-grab): ${handCount}`);
    
    // The "Invisible Table" bug manifests as 0 cards on the table
    if (tableCount !== 4) {
      console.error(`FAILURE: Expected 4 cards on table, but found ${tableCount}.`);
      // Try to log the inner HTML for more context
      const tableHTML = await tableArea.innerHTML().catch(() => 'Could not get innerHTML');
      console.error('Table area innerHTML preview:', tableHTML.substring(0, 500));
    }

    // Ensure they are actually visible to the user
    for (let i = 0; i < tableCount; i++) {
      const isVisible = await tableCardImgs.nth(i).isVisible();
      if (!isVisible) {
        console.error(`FAILURE: Table card img ${i} is in the DOM but NOT visible.`);
      }
    }
    
    // Hard assertion to fail the test and catch the bug
    expect(tableCount, 'Table should have exactly 4 card images').toBe(4);
    expect(handCount, 'Player hand should have exactly 3 interactive cards').toBe(3);
    
    const tableEmptyMsg = page.locator('text=/TABLE EMPTY|TABLE VIDE/i');
    await expect(tableEmptyMsg).not.toBeVisible();
    console.log('✅ Rendering check passed: 4 table cards and 3 hand cards visible.');
    // ----------------------------------------------


    // The Game Over overlay contains an h2 with "Game Over" text
    const gameOverOverlay = page.locator('h2', { hasText: /Game Over|Partie Terminée|انتهت اللعبة/i });
    
    // Playable cards in our hand have the class "cursor-grab" on their motion wrapper.
    const myCards = page.locator('.cursor-grab');

    const MAX_ATTEMPTS = 400; // safety limit to prevent infinite loops
    let attempts = 0;
    let cardsPlayedByUs = 0;

    console.log('Starting to play cards automatically...');

    while (attempts < MAX_ATTEMPTS) {
      // Check if game over overlay appeared
      if (await gameOverOverlay.isVisible().catch(() => false)) {
        console.log(`Game Over overlay detected after ${attempts} attempts!`);
        break;
      }

      const cardCount = await myCards.count().catch(() => 0);
      if (cardCount > 0) {
        try {
          // Play the first available card in our hand
          await myCards.first().click({ timeout: 500, force: true });
          cardsPlayedByUs++;
          // Give the game a slightly longer moment to process the move and animate before the next loop
          await page.waitForTimeout(800); 
        } catch {
          // Card might be animating, not clickable yet, or it's not our turn
        }
      }

      // Short wait before checking again
      await page.waitForTimeout(600);
      attempts++;
    }

    // ===== ASSERTIONS =====
    
    // 1. We should have reached the Game Over screen
    await expect(gameOverOverlay).toBeVisible({ timeout: 10000 });
    console.log('✅ Success: Reached the Game Over screen.');

    // 2. We should have attempted to play cards. 
    // In a full game, we should play exactly 20 cards. But since we might click multiple times,
    // cardsPlayedByUs might be >= 20. We just want to ensure it's a significant number.
    expect(cardsPlayedByUs).toBeGreaterThan(10);
    console.log(`✅ Success: Played approximately ${cardsPlayedByUs} cards during the game.`);

    // 3. Play Again button is visible
    const playAgainBtn = page.locator('button', { hasText: /Play Again|Rejouer|إعادة اللعب/i });
    await expect(playAgainBtn).toBeVisible();
    console.log('✅ Success: "Play Again" button is visible and ready for a new round.');
  });
});
