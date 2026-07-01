import { test, expect } from '@playwright/test';

test.describe('Opponent and Partner Card Animations', () => {
  test('should ensure all players hands and captured piles are set up for layout animations', async ({ page }) => {
    test.setTimeout(120000);

    // 1. Navigate to homepage in test mode
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });
    await page.goto('/?botFallback=true');

    // 2. Select English
    const enButton = page.locator('button', { hasText: /^EN$/i });
    if (await enButton.isVisible().catch(() => false)) await enButton.click();

    // 3. Create a 4-player Room
    await page.locator('button', { hasText: /Create Room/i }).first().click();
    await page.locator('input[placeholder*="name" i]').first().fill('HostPlayer');

    const fourPlayersBtn = page.locator('button', { hasText: /4 Players/i }).first();
    await expect(fourPlayersBtn).toBeVisible({ timeout: 5000 });
    await fourPlayersBtn.click();

    await page.locator('button', { hasText: /^Public$/i }).first().click();
    await page.locator('button', { hasText: /^Create$/i }).first().click();

    // 4. Wait for Game Lobby and 3 bots to join
    await expect(page.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    const p2Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 2/i }) }).first();
    const p3Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 3/i }) }).first();
    const p4Seat = page.locator('div.group', { has: page.locator('span', { hasText: /Player 4/i }) }).first();

    await expect(p2Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 15000 });
    await expect(p3Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 15000 });
    await expect(p4Seat.locator('span.text-slate-200').first()).toBeVisible({ timeout: 15000 });

    // 5. Start Game
    const startBtn = page.locator('button', { hasText: /Start Game/i }).first();
    await expect(startBtn).toBeEnabled({ timeout: 5000 });
    await startBtn.click();

    // 6. Wait for game board to load
    const turnIndicator = page.locator('text=/Your Turn/i');
    await expect(turnIndicator).toBeVisible({ timeout: 15000 });

    // 7. Verify Left Seat Hand and Captured Pile layout setup
    console.log('Verifying Left player (Player 1) hand and captured pile...');
    const leftSeat = page.locator('div.fixed.left-1\\.5, div.fixed.left-4').first();
    await expect(leftSeat).toBeVisible();
    
    // Left hand cards should be rendered inside PlayerHand containers (with class hand-card-container)
    const leftHandCards = leftSeat.locator('.hand-card-container');
    await expect(leftHandCards).toHaveCount(3);

    // Verify Left hand cards are rendered small (around 20px width)
    const leftCardBox = await leftHandCards.first().boundingBox();
    expect(leftCardBox.width).toBeLessThan(25);

    // Left seat should NOT have a separate captured card pile container
    const leftCapturedPile = leftSeat.locator('.relative.w-8.h-12');
    await expect(leftCapturedPile).not.toBeVisible();

    // Score badge should have absolute invisible motion anchors for layout animations
    const leftScoreBadge = leftSeat.locator('div', { hasText: /pts/ }).first();
    const leftMotionAnchors = leftScoreBadge.locator('div.absolute.inset-0.opacity-0');
    await expect(leftMotionAnchors).toBeAttached();

    // 8. Verify Right Seat Hand and Captured Pile layout setup
    console.log('Verifying Right player (Player 3) hand and captured pile...');
    const rightSeat = page.locator('div.fixed.right-1\\.5, div.fixed.right-4').first();
    await expect(rightSeat).toBeVisible();

    const rightHandCards = rightSeat.locator('.hand-card-container');
    await expect(rightHandCards).toHaveCount(3);

    const rightCardBox = await rightHandCards.first().boundingBox();
    expect(rightCardBox.width).toBeLessThan(25);

    const rightCapturedPile = rightSeat.locator('.relative.w-8.h-12');
    await expect(rightCapturedPile).not.toBeVisible();

    const rightScoreBadge = rightSeat.locator('div', { hasText: /pts/ }).first();
    const rightMotionAnchors = rightScoreBadge.locator('div.absolute.inset-0.opacity-0');
    await expect(rightMotionAnchors).toBeAttached();

    // 9. Verify Partner (Player 2) Captured Pile uses animated motion elements
    console.log('Verifying Partner (Player 2) captured pile is set up for motion...');
    const partnerArea = page.locator('.top-partner-hand').first();
    await expect(partnerArea).toBeVisible();

    // Partner captured cards should be motion elements (e.g. have specific motion style classes or attributes)
    const partnerCapturedPile = partnerArea.locator('.relative.w-8.h-12');
    await expect(partnerCapturedPile).toBeVisible();
  });
});
