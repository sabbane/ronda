import { test, expect } from '@playwright/test';

test('Table should not shift when hand is empty', async ({ page }) => {
  test.setTimeout(60000);
  
  // Set viewport to mobile size (iPhone X/12/13/14 size) where flex justify-between causes shifts
  await page.setViewportSize({ width: 375, height: 812 });

  console.log('Navigating to game...');
  await page.goto('/');

  // Start game vs Bot
  const playBtn = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i });
  await expect(playBtn.first()).toBeVisible({ timeout: 10000 });
  await playBtn.first().click();

  // Wait for table to be visible
  const table = page.locator('[data-test-id="game-table"]');
  await expect(table).toBeVisible({ timeout: 10000 });

  const getTableY = async () => {
    // Scroll container to bottom to ensure stable relative layout measurements
    await page.evaluate(() => {
      const container = document.querySelector('.game-board-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
    await page.waitForTimeout(200);

    const box = await table.boundingBox();
    return box ? box.y : null;
  };

  const getPlayableCard = () => {
    // Select our hand's playable card (last .game-hand container is ours)
    return page.locator('.game-hand').last().locator('.cursor-grab .game-card').first();
  };

  const playCardDirectly = async () => {
    // Ensure container is scrolled to the bottom
    await page.evaluate(() => {
      const container = document.querySelector('.game-board-container');
      if (container) {
        container.scrollTop = container.scrollHeight;
      }
    });
    await page.waitForTimeout(200);

    // Click the actual card inside our hand directly in the DOM to bypass Playwright click interception
    await page.evaluate(() => {
      const hands = document.querySelectorAll('.game-hand');
      if (hands.length > 0) {
        const myHand = hands[hands.length - 1];
        const card = myHand.querySelector('.cursor-grab .game-card');
        if (card) {
          card.click();
        }
      }
    });
  };

  // 1. Wait for 3 cards to be dealt and become playable
  console.log('Waiting for cards to be dealt...');
  await expect(getPlayableCard()).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1000); // let UI settle
  
  const yAt3 = await getTableY();
  console.log(`Table Y position at 3 cards: ${yAt3}`);

  // Play Card 1
  console.log('Playing Card 1...');
  await playCardDirectly();
  
  // Wait for hand size to drop to 2
  await page.waitForFunction(() => {
    const hands = document.querySelectorAll('.game-hand');
    if (hands.length === 0) return false;
    const myHand = hands[hands.length - 1];
    return myHand.querySelectorAll('.hand-card-container').length === 2;
  }, { timeout: 10000 });
  const yAt2 = await getTableY();
  console.log(`Table Y position at 2 cards: ${yAt2}`);

  // 2. Wait until it is our turn again
  await expect(getPlayableCard()).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1000); // let UI settle

  // Play Card 2
  console.log('Playing Card 2...');
  await playCardDirectly();

  // Wait for hand size to drop to 1
  await page.waitForFunction(() => {
    const hands = document.querySelectorAll('.game-hand');
    if (hands.length === 0) return false;
    const myHand = hands[hands.length - 1];
    return myHand.querySelectorAll('.hand-card-container').length === 1;
  }, { timeout: 10000 });
  const yAt1 = await getTableY();
  console.log(`Table Y position at 1 card: ${yAt1}`);

  // 3. Wait until it is our turn again
  await expect(getPlayableCard()).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1000); // let UI settle

  // Play Card 3 (last card)
  console.log('Playing Card 3...');
  await playCardDirectly();

  // Wait for hand size to drop to 0
  await page.waitForFunction(() => {
    const hands = document.querySelectorAll('.game-hand');
    if (hands.length === 0) return false;
    const myHand = hands[hands.length - 1];
    return myHand.querySelectorAll('.hand-card-container').length === 0;
  }, { timeout: 10000 });
  const yAt0 = await getTableY();
  console.log(`Table Y position at 0 cards: ${yAt0}`);

  // 4. Wait for redeal: hand becomes 3 again
  console.log('Waiting for redeal...');
  await page.waitForFunction(() => {
    const hands = document.querySelectorAll('.game-hand');
    if (hands.length === 0) return false;
    const myHand = hands[hands.length - 1];
    return myHand.querySelectorAll('.hand-card-container').length === 3;
  }, { timeout: 20000 });
  await expect(getPlayableCard()).toBeVisible({ timeout: 15000 });
  await page.waitForTimeout(1000);

  const yAfterRedeal = await getTableY();
  console.log(`Table Y position after redeal: ${yAfterRedeal}`);

  // Assertions:
  // Assert the correct, bug-free behavior. The test should FAIL right now because the bug exists.
  const shiftDiff = Math.abs(yAt0 - yAt1);
  console.log(`Checking layout shift: Difference is ${shiftDiff}px`);
  expect(shiftDiff, 'Table layout should not shift when hand is empty').toBeLessThan(1.5);

  const recoveryDiff = Math.abs(yAfterRedeal - yAt3);
  console.log(`Checking position recovery: Difference is ${recoveryDiff}px`);
  expect(recoveryDiff, 'Table should remain at its original position after redeal').toBeLessThan(1.5);
});
