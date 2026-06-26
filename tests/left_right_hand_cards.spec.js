import { test, expect } from '@playwright/test';

test.describe('4-Player Hidden Hand Cards Visibility for Left/Right Seats on Mobile', () => {
  test.setTimeout(240_000);

  test('Opponent seat containers on mobile must render the hidden hand cards container', async ({ browser }) => {
    // ─── Setup four browser contexts ───────────────────────────────────────────
    // P1 (Host) is simulated on a mobile viewport
    const context1 = await browser.newContext({
      viewport: { width: 390, height: 844 },
      userAgent: 'Mozilla/5.0 (iPhone; CPU iPhone OS 14_0 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/14.0 Mobile/15E148 Safari/604.1',
    });
    const context2 = await browser.newContext();
    const context3 = await browser.newContext();
    const context4 = await browser.newContext();

    const page1 = await context1.newPage();
    const page2 = await context2.newPage();
    const page3 = await context3.newPage();
    const page4 = await context4.newPage();

    // ─── P1: Create 4-player room ────────────────────────────────────────────
    await page1.goto('/');
    // Select English language if buttons are present
    const enBtn1 = page1.locator('button', { hasText: /^EN$/i });
    if (await enBtn1.isVisible().catch(() => false)) await enBtn1.click();

    await page1.locator('button', { hasText: /Create Room/i }).first().click();
    await page1.locator('input[placeholder*="name" i]').first().fill('HostP1');

    // Toggle Player Count to 4 Players
    const fourPlayersBtn = page1.locator('button', { hasText: /4 Players/i }).first();
    await expect(fourPlayersBtn).toBeVisible({ timeout: 5000 });
    await fourPlayersBtn.click();

    // Make room private so we can join via ID
    await page1.locator('button', { hasText: /^Private$/i }).first().click();
    await page1.locator('button', { hasText: /^Create$/i }).first().click();

    // Extract Room ID
    const lobbyHeader1 = page1.locator('h1', { hasText: /Game Lobby/i });
    await expect(lobbyHeader1).toBeVisible({ timeout: 15000 });

    const roomIdSpan = page1.locator('span.text-amber-300').first();
    await expect(roomIdSpan).toBeVisible();
    const realMatchID = (await roomIdSpan.innerText()).trim();

    // ─── P2: Join (joins Slot 1 by default) ───────────────────────────────────
    await page2.goto('/');
    if (await page2.locator('button', { hasText: /^EN$/i }).isVisible().catch(() => false)) {
      await page2.locator('button', { hasText: /^EN$/i }).click();
    }
    await page2.locator('button', { hasText: /Join Room/i }).first().click();
    await page2.locator('input[placeholder*="name" i]').first().fill('GuestP2');
    await page2.locator('button', { hasText: /Private Room/i }).first().click();
    await page2.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first().fill(realMatchID);
    await page2.locator('button', { hasText: /^Join$/i }).first().click();
    await expect(page2.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // P2 Switches Seat to Slot 2 (Team A) so Team A has P1 & P2
    const joinTeamABtn = page2.locator('button', { hasText: /Join Team A/i }).first();
    await expect(joinTeamABtn).toBeVisible({ timeout: 10000 });
    await joinTeamABtn.click();
    await page2.waitForTimeout(4000);

    // ─── P3: Join (joins Slot 1 - Team B) ─────────────────────────────────────
    await page3.goto('/');
    if (await page3.locator('button', { hasText: /^EN$/i }).isVisible().catch(() => false)) {
      await page3.locator('button', { hasText: /^EN$/i }).click();
    }
    await page3.locator('button', { hasText: /Join Room/i }).first().click();
    await page3.locator('input[placeholder*="name" i]').first().fill('GuestP3');
    await page3.locator('button', { hasText: /Private Room/i }).first().click();
    await page3.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first().fill(realMatchID);
    await page3.locator('button', { hasText: /^Join$/i }).first().click();
    await expect(page3.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // ─── P4: Join (joins Slot 3 - Team B) ─────────────────────────────────────
    await page4.goto('/');
    if (await page4.locator('button', { hasText: /^EN$/i }).isVisible().catch(() => false)) {
      await page4.locator('button', { hasText: /^EN$/i }).click();
    }
    await page4.locator('button', { hasText: /Join Room/i }).first().click();
    await page4.locator('input[placeholder*="name" i]').first().fill('GuestP4');
    await page4.locator('button', { hasText: /Private Room/i }).first().click();
    await page4.locator('input[placeholder*="Room ID" i], input[placeholder*="Enter Room" i]').first().fill(realMatchID);
    await page4.locator('button', { hasText: /^Join$/i }).first().click();
    await expect(page4.locator('h1', { hasText: /Game Lobby/i })).toBeVisible({ timeout: 15000 });

    // ─── Start the Game ───────────────────────────────────────────────────────
    await page1.waitForTimeout(2000);
    const p1StartBtn = page1.locator('button', { hasText: /Start Game/i }).first();
    await expect(p1StartBtn).toBeEnabled({ timeout: 10000 });
    await p1StartBtn.click();

    // Wait for the active board layout to load on P1's (mobile) screen
    const gameTable1 = page1.locator('[data-test-id="game-table"]');
    await expect(gameTable1).toBeVisible({ timeout: 20000 });
    
    // Allow deal and fade-in animations to fully complete
    await page1.waitForTimeout(5000);

    // ─── Assert Hidden Hand Cards Visibility on Mobile Seats ───────────
    const leftSeat = page1.locator('.fixed.left-1\\.5, .fixed.left-4').first();
    const rightSeat = page1.locator('.fixed.right-1\\.5, .fixed.right-4').first();

    await expect(leftSeat).toBeVisible();
    await expect(rightSeat).toBeVisible();

    // Select the hand cards container (looks for the div with negative letter spacing and card back images)
    // inside the left and right opponent seats.
    const leftHandContainer = leftSeat.locator('.flex.flex-col.-space-y-3, .flex.-space-x-4');
    const rightHandContainer = rightSeat.locator('.flex.flex-col.-space-y-3, .flex.-space-x-4');

    const leftBackImage = leftHandContainer.locator('img[alt="Back"]').first();
    const rightBackImage = rightHandContainer.locator('img[alt="Back"]').first();

    // Verify both seats render their containers
    const leftSeatBox = await leftSeat.boundingBox();
    const leftHandBox = await leftHandContainer.boundingBox();
    const leftBackBox = await leftBackImage.boundingBox();

    console.log(`[Diagnostic] leftSeat Box:`, leftSeatBox);
    console.log(`[Diagnostic] leftHand Box:`, leftHandBox);
    console.log(`[Diagnostic] leftBack Box:`, leftBackBox);

    const leftBackStyles = await leftBackImage.evaluate(el => {
      const style = window.getComputedStyle(el);
      return {
        display: style.display,
        visibility: style.visibility,
        opacity: style.opacity,
        width: style.width,
        height: style.height,
        position: style.position,
      };
    });
    console.log(`[Diagnostic] leftBack Styles:`, leftBackStyles);

    await expect(leftBackImage).toBeVisible({ timeout: 5000 });
    await expect(rightBackImage).toBeVisible({ timeout: 5000 });

    // Assert that the cards are rotated by 90 degrees (oriented towards the table: Left rotated 90, Right rotated -90)
    const leftDebug = await leftBackImage.evaluate(el => {
      const getDetails = (element) => {
        const style = window.getComputedStyle(element);
        return {
          tag: element.tagName,
          classes: element.className,
          transform: style.transform,
          rotate: style.rotate,
        };
      };
      return {
        self: getDetails(el),
        parent: getDetails(el.parentElement),
      };
    });
    console.log(`[Diagnostic] leftDebug:`, leftDebug);

    const rightDebug = await rightBackImage.evaluate(el => {
      const getDetails = (element) => {
        const style = window.getComputedStyle(element);
        return {
          tag: element.tagName,
          classes: element.className,
          transform: style.transform,
          rotate: style.rotate,
        };
      };
      return {
        self: getDetails(el),
        parent: getDetails(el.parentElement),
      };
    });
    console.log(`[Diagnostic] rightDebug:`, rightDebug);

    const parseAngle = (debugInfo) => {
      // Check legacy transform first
      const transform = debugInfo.transform;
      if (transform && transform !== 'none') {
        const values = transform.split('(')[1].split(')')[0].split(',');
        const a = parseFloat(values[0]);
        const b = parseFloat(values[1]);
        return Math.round(Math.atan2(b, a) * (180 / Math.PI));
      }
      // Check modern standalone rotate property (e.g. "90deg" or "-90deg")
      const rotate = debugInfo.rotate;
      if (rotate && rotate !== 'none') {
        const match = rotate.match(/^(-?\d+)(deg|rad|turn)?$/);
        if (match) {
          let angle = parseFloat(match[1]);
          if (match[2] === 'rad') angle = angle * (180 / Math.PI);
          if (match[2] === 'turn') angle = angle * 360;
          return Math.round(angle);
        }
      }
      return 0;
    };

    const leftAngle = parseAngle(leftDebug.self) || parseAngle(leftDebug.parent);
    const rightAngle = parseAngle(rightDebug.self) || parseAngle(rightDebug.parent);

    console.log(`[Diagnostic] leftAngle:`, leftAngle);
    console.log(`[Diagnostic] rightAngle:`, rightAngle);

    expect(leftAngle).toBe(90);
    expect(rightAngle).toBe(-90);

    // Verify vertical stacking: cards must be aligned vertically (similar X) and stack downwards (increasing Y)
    const leftBackImages = leftHandContainer.locator('img[alt="Back"]');
    const leftCount = await leftBackImages.count();
    console.log(`[Diagnostic] Left cards count:`, leftCount);
    if (leftCount >= 2) {
      const boxes = [];
      for (let i = 0; i < leftCount; i++) {
        const box = await leftBackImages.nth(i).boundingBox();
        boxes.push(box);
      }
      console.log(`[Diagnostic] Left card boxes:`, boxes);
      for (let i = 1; i < boxes.length; i++) {
        const diffX = Math.abs(boxes[i].x - boxes[0].x);
        expect(diffX).toBeLessThan(5); // Vertically aligned within 5px
        expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y); // Stacking downwards
      }
    }

    const rightBackImages = rightHandContainer.locator('img[alt="Back"]');
    const rightCount = await rightBackImages.count();
    console.log(`[Diagnostic] Right cards count:`, rightCount);
    if (rightCount >= 2) {
      const boxes = [];
      for (let i = 0; i < rightCount; i++) {
        const box = await rightBackImages.nth(i).boundingBox();
        boxes.push(box);
      }
      console.log(`[Diagnostic] Right card boxes:`, boxes);
      for (let i = 1; i < boxes.length; i++) {
        const diffX = Math.abs(boxes[i].x - boxes[0].x);
        expect(diffX).toBeLessThan(5); // Vertically aligned within 5px
        expect(boxes[i].y).toBeGreaterThan(boxes[i - 1].y); // Stacking downwards
      }
    }

    // Verify team card back colors: Left and Right must be identical (Team B), Partner must be the opposite (Team A)
    const getCardColor = async (locator) => {
      const src = await locator.getAttribute('src');
      if (src.includes('blue')) return 'blue';
      if (src.includes('red')) return 'red';
      return 'unknown';
    };

    const partnerBackImage = page1.locator('.top-partner-hand img[alt="Card Back"]').first();
    await expect(partnerBackImage).toBeVisible({ timeout: 5000 });

    const leftCardColorVal = await getCardColor(leftBackImage);
    const rightCardColorVal = await getCardColor(rightBackImage);
    const partnerCardColorVal = await getCardColor(partnerBackImage);

    console.log(`[Diagnostic] cardBack colors - Left: ${leftCardColorVal}, Right: ${rightCardColorVal}, Partner: ${partnerCardColorVal}`);

    // Verify that the actual card back colors match the synchronized team colors in G
    const teamAColor = await gameTable1.getAttribute('data-team-a-color');
    const teamBColor = await gameTable1.getAttribute('data-team-b-color');

    console.log(`[Diagnostic] data-team colors - Team A: ${teamAColor}, Team B: ${teamBColor}`);

    expect(teamAColor).not.toBeNull();
    expect(teamBColor).not.toBeNull();
    expect(teamAColor).not.toBe(teamBColor);

    expect(partnerCardColorVal).toBe(teamAColor);
    expect(leftCardColorVal).toBe(teamBColor);
    expect(rightCardColorVal).toBe(teamBColor);

    // Verify that the centered Team Score HUD lies physically above the partner's hand cards
    const teamScoreHud = page1.locator('.absolute.left-1\\/2.-translate-x-1\\/2');
    await expect(teamScoreHud).toBeVisible({ timeout: 5000 });

    const hudBox = await teamScoreHud.boundingBox();
    const partnerCardBox = await partnerBackImage.boundingBox();

    console.log(`[Diagnostic] teamScoreHud Box:`, hudBox);
    console.log(`[Diagnostic] partnerCard Box:`, partnerCardBox);

    expect(hudBox).not.toBeNull();
    expect(partnerCardBox).not.toBeNull();

    const hudBottom = hudBox.y + hudBox.height;
    const partnerTop = partnerCardBox.y;

    console.log(`[Diagnostic] hudBottom: ${hudBottom}, partnerTop: ${partnerTop}`);
    expect(hudBottom).toBeLessThan(partnerTop);

    // Verify that the centered Team Score HUD lies physically above the partner's captured cards container
    const partnerCapturedContainer = page1.locator('.top-partner-hand .relative.w-8.h-12');
    await expect(partnerCapturedContainer).toBeVisible({ timeout: 5000 });
    const partnerCapturedBox = await partnerCapturedContainer.boundingBox();
    console.log(`[Diagnostic] partnerCaptured Box:`, partnerCapturedBox);
    expect(partnerCapturedBox).not.toBeNull();
    expect(hudBottom).toBeLessThan(partnerCapturedBox.y);

    // Clean up
    await context1.close();
    await context2.close();
    await context3.close();
    await context4.close();
  });
});
