import { test, expect } from '@playwright/test';

/**
 * This test file is designed to reproduce the bug reported by the user:
 * 1. /test/p1 works correctly.
 * 2. /test/p2 fails to load the game (likely stays on menu).
 * 3. /test/p2?test=true loads the board but cards are unplayable.
 */

test.describe('Reproduction: Test Route Bugs', () => {
  
  test('P2 fails to join via /test/p2 (should stay on menu or fail)', async ({ browser }) => {
    // Start P1 first to ensure match is created
    const contextP1 = await browser.newContext();
    const pageP1 = await contextP1.newPage();
    await pageP1.goto('/test/p1');
    
    // Wait for P1 to see the board (confirming match creation)
    await expect(pageP1.locator('div.min-h-screen.bg-black')).toBeVisible({ timeout: 10000 });

    // Try to join as P2 via the direct route
    const contextP2 = await browser.newContext();
    const pageP2 = await contextP2.newPage();
    await pageP2.goto('/test/p2');

    // BUG DETECTION: P2 should see the board, but based on user report, it fails.
    // We expect the board NOT to be visible if the bug exists.
    const board = pageP2.locator('div.min-h-screen.bg-black');
    const isBoardVisible = await board.isVisible();
    
    if (!isBoardVisible) {
      console.log('BUG REPRODUCED: P2 cannot see the board via /test/p2');
    } else {
      console.log('P2 can see the board. Investigating card playability...');
    }
    
    // The user wants a test that FAILS when the bug is present.
    await expect(board).toBeVisible({ 
      message: 'Bug: /test/p2 should directly show the game board but it is hidden.' 
    });

    await contextP1.close();
    await contextP2.close();
  });

  test('P2 sees board and can play cards after P1 plays', async ({ browser }) => {
    test.setTimeout(90_000); // P1 waits 4s + plays + animations (~10s) before P2's turn
    // Start P1 via the correct test route
    const contextP1 = await browser.newContext();
    const pageP1 = await contextP1.newPage();
    pageP1.on('console', msg => console.log(`[P1 Console] ${msg.type()}: ${msg.text()}`));
    await pageP1.goto('/test/p1');
    await expect(pageP1.locator('div.min-h-screen.bg-black')).toBeVisible({ timeout: 10000 });

    // Join as P2 via the direct route
    const contextP2 = await browser.newContext();
    const pageP2 = await contextP2.newPage();
    pageP2.on('console', msg => console.log(`[P2 Console] ${msg.type()}: ${msg.text()}`));
    await pageP2.goto('/test/p2');

    // Board should be visible for both
    await expect(pageP2.locator('div.min-h-screen.bg-black')).toBeVisible({ timeout: 10000 });

    // STEP 1: Player 1 plays a card — wait for cards to appear first
    const p1Cards = pageP1.locator('.cursor-grab');
    await expect(p1Cards.first()).toBeVisible({ timeout: 15000 });

    // Wait for any initial announcements (like Ronda) to clear before clicking
    await pageP1.waitForTimeout(4000); 

    const p1FirstCardId = await p1Cards.first().getAttribute('data-testid');
    await p1Cards.first().click();
    
    // Wait for P1's move to be processed by the server (including Board.jsx timeout)
    await pageP1.waitForTimeout(3000);
    await expect(pageP1.locator(`[data-testid="${p1FirstCardId}"]`)).not.toBeVisible({
      timeout: 5000,
      message: `P1 move failed! Card '${p1FirstCardId}' remains in hand.`
    });

    // STEP 2: Attempt to play a card as Player 2
    // P2 can only play after P1's move AND all animations/announcements clear (~8-15s total).
    const p2Cards = pageP2.locator('.cursor-grab');
    await expect(p2Cards.first()).toBeVisible({ timeout: 40000 });

    // Wait for P1's move to reflect on P2's screen and animations to finish
    await pageP2.waitForTimeout(4000);

    // Record the card's test-id before clicking
    const p2FirstCardId = await p2Cards.first().getAttribute('data-testid');
    await p2Cards.first().click();

    // The card should disappear from P2's hand after playing.
    await pageP2.waitForTimeout(3000);
    await expect(pageP2.locator(`[data-testid="${p2FirstCardId}"]`)).not.toBeVisible({ 
      timeout: 5000, 
      message: `Card '${p2FirstCardId}' remains in hand after P1 played. /test/p2 puts P2 in wrong game state.` 
    });

    await contextP1.close();
    await contextP2.close();
  });
});
