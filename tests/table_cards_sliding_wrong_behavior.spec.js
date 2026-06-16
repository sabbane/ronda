import { test, expect } from '@playwright/test';

test('Table cards stable slot positioning (cards do not slide after a capture)', async ({ browser }) => {
  // P1 context
  const p1Context = await browser.newContext();
  const p1Page = await p1Context.newPage();
  await p1Page.setViewportSize({ width: 1280, height: 800 });
  console.log('P1: Navigating to /test/p1...');
  await p1Page.goto('/test/p1');

  // Wait for board
  const backBtn1 = p1Page.locator('button', { hasText: /Back to Menu|Retour au Menu|العودة إلى القائمة/i });
  await expect(backBtn1).toBeVisible({ timeout: 15000 });

  // P2 context
  const p2Context = await browser.newContext();
  const p2Page = await p2Context.newPage();
  await p2Page.setViewportSize({ width: 1280, height: 800 });
  console.log('P2: Navigating to /test/p2...');
  await p2Page.goto('/test/p2');

  // Wait for board
  const backBtn2 = p2Page.locator('button', { hasText: /Back to Menu|Retour au Menu|العودة إلى القائمة/i });
  await expect(backBtn2).toBeVisible({ timeout: 15000 });

  // Verify hand cards count in our own hand
  const p1Hand = p1Page.locator('.game-hand').last().locator('.hand-card-container');
  await expect(p1Hand).toHaveCount(3, { timeout: 10000 });

  const p2Hand = p2Page.locator('.game-hand').last().locator('.hand-card-container');
  await expect(p2Hand).toHaveCount(3, { timeout: 10000 });

  // P1 plays 5 of dheb (first card in hand)
  console.log('P1 playing 5 of dheb...');
  const p1SelectableHand = p1Page.locator('.game-hand').last().locator('.cursor-grab');
  await expect(p1SelectableHand).toHaveCount(3, { timeout: 10000 });
  await p1SelectableHand.nth(0).click();

  // P2 plays 7 of dheb (first card in hand)
  console.log('P2: Waiting for turn and playing 7 of dheb...');
  const p2SelectableHand = p2Page.locator('.game-hand').last().locator('.cursor-grab');
  await expect(p2SelectableHand).toHaveCount(3, { timeout: 15000 }); // Wait for turn to switch
  await p2SelectableHand.nth(0).click();

  // Wait for 7 of dheb to be visible on P1's page
  const card7 = p1Page.locator('[data-testid="card-dheb-7"]').first();
  await expect(card7).toBeVisible({ timeout: 10000 });

  // Measure bounding box of table and card 7 before capture
  const tableBoxBefore = await p1Page.locator('[data-test-id="game-table"]').boundingBox();
  const boxBefore = await card7.boundingBox();
  expect(tableBoxBefore).not.toBeNull();
  expect(boxBefore).not.toBeNull();
  console.log(`Table width before: ${tableBoxBefore.width}px, x: ${tableBoxBefore.x}px`);
  console.log(`Card 7 dheb before capture x: ${boxBefore.x}px`);

  // P1 plays 5 of jben (first card in hand) to trigger capture
  console.log('P1: Waiting for turn and playing 5 of jben...');
  await expect(p1SelectableHand).toHaveCount(2, { timeout: 15000 }); // Wait for turn to switch back
  await p1SelectableHand.nth(0).click();

  // Wait for capture animation to complete
  await p1Page.waitForTimeout(3500);

  // Measure bounding box of table and card 7 after capture
  const tableBoxAfter = await p1Page.locator('[data-test-id="game-table"]').boundingBox();
  const boxAfter = await card7.boundingBox();
  expect(tableBoxAfter).not.toBeNull();
  expect(boxAfter).not.toBeNull();
  console.log(`Table width after: ${tableBoxAfter.width}px, x: ${tableBoxAfter.x}px`);
  console.log(`Card 7 dheb after capture x: ${boxAfter.x}px`);

  // Cleanup
  await p1Context.close();
  await p2Context.close();

  // Assert they are identical (within a subpixel tolerance)
  expect(Math.abs(boxAfter.x - boxBefore.x), 'Card 7 should stay in the same slot/position (within 5px)').toBeLessThan(5.0);
});
