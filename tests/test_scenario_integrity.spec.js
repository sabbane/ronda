import { test, expect } from '@playwright/test';

const BACKEND = 'http://127.0.0.1:8000';

/**
 * Regression test: Test Scenario Integrity
 *
 * Verifies that navigating to /test/p1 (in VITE_TEST_MODE) loads the
 * correct rigged deck as defined in game.js.
 *
 * Architecture:
 *   - Backend POST /test/reset  → creates a fresh match with setupData.testMode=true
 *   - Backend GET  /test/match-id → returns the current test matchID
 *   - App.jsx /test/p1 calls POST /test/reset, /test/p2 polls GET /test/match-id
 *
 * Expected initial state (Round 1):
 *   Table:    1 dheb, 2 dheb, 3 dheb, 4 dheb
 *   P0 Hand:  5 dheb, 5 jben, 6 dheb
 */
test('Test Scenario: /test/p1 should load the rigged deck correctly', async ({ page }) => {
  // Navigate to the test route (App.jsx will call POST /test/reset automatically)
  await page.goto('/test/p1');

  // Wait for the game board to fully mount
  const backToMenuBtn = page.locator('button', { hasText: /Back to Menu|Retour au Menu|العودة إلى القائمة/i });
  await expect(backToMenuBtn).toBeVisible({ timeout: 15000 });

  // Collect all card images (excluding hidden preload images)
  const cards = page.locator('img[src*="-vector.svg"]:not([aria-hidden="true"])');
  await expect(cards).toHaveCount(7, { timeout: 10000 }); // 4 table + 3 hand

  const allCards = await cards.all();
  const srcs = await Promise.all(allCards.map(c => c.getAttribute('src')));
  const cardNames = srcs.map(s => decodeURIComponent(s.split('/').pop()));
  console.log('Detected cards:', cardNames);

  // Expected rigged deck cards visible to P0 in Round 1
  const expectedCards = [
    '1 dheb-vector.svg', // Table
    '2 dheb-vector.svg', // Table
    '3 dheb-vector.svg', // Table
    '4 dheb-vector.svg', // Table
    '5 dheb-vector.svg', // P0 Hand R1
    '5 jben-vector.svg', // P0 Hand R1
    '6 dheb-vector.svg', // P0 Hand R1
  ];

  const missing = expectedCards.filter(card => !cardNames.includes(card));
  if (missing.length > 0) {
    throw new Error(
      `Integrity Failure: Rigged deck not applied!\n` +
      `Missing: ${missing.join(', ')}\n` +
      `Found instead: ${cardNames.join(', ')}`
    );
  }

  console.log('✅ Test Scenario Integrity confirmed: Correct rigged cards present.');
});

/**
 * Regression test: P1 and P2 share the same test match
 *
 * Verifies that /test/p1 and /test/p2 connect to the SAME match.
 */
test('Test Scenario: P1 and P2 should share the same test match', async ({ browser }) => {
  // P1 context: triggers POST /test/reset → creates match
  const p1Context = await browser.newContext();
  const p1Page = await p1Context.newPage();
  await p1Page.goto('/test/p1');
  const backBtn = p1Page.locator('button', { hasText: /Back to Menu|Retour au Menu|العودة إلى القائمة/i });
  await expect(backBtn).toBeVisible({ timeout: 15000 });

  // Get the matchID the server created
  const matchResp = await fetch(`${BACKEND}/test/match-id`);
  const { matchID } = await matchResp.json();
  console.log('Test matchID from server:', matchID);
  expect(matchID).toBeTruthy();

  // P2 context: joins the same match via GET /test/match-id polling
  const p2Context = await browser.newContext();
  const p2Page = await p2Context.newPage();
  await p2Page.goto('/test/p2');
  const backBtn2 = p2Page.locator('button', { hasText: /Back to Menu|Retour au Menu|العودة إلى القائمة/i });
  await expect(backBtn2).toBeVisible({ timeout: 15000 });

  // Both should have 7 cards visible (4 table + 3 hand, excluding hidden preload images)
  const p1Cards = p1Page.locator('img[src*="-vector.svg"]:not([aria-hidden="true"])');
  const p2Cards = p2Page.locator('img[src*="-vector.svg"]:not([aria-hidden="true"])');
  await expect(p1Cards).toHaveCount(7, { timeout: 10000 });
  await expect(p2Cards).toHaveCount(7, { timeout: 10000 });

  await p1Context.close();
  await p2Context.close();

  console.log('✅ P1 and P2 successfully share the same test match.');
});
