import { test, expect } from '@playwright/test';

test('Background music must not start during the splashscreen even if the user interacts', async ({ page }) => {
  // 1. Force the splashscreen to show by overriding navigator.webdriver to false
  await page.addInitScript(() => {
    Object.defineProperty(navigator, 'webdriver', {
      get: () => false,
      configurable: true
    });
  });

  // 2. Inject spied AudioContext to track BGM start
  await page.addInitScript(() => {
    window.__bgmStarted = false;

    const OriginalAudioContext = window.AudioContext || window.webkitAudioContext;
    if (OriginalAudioContext) {
      class SpiedAudioContext extends OriginalAudioContext {
        constructor(...args) {
          super(...args);
        }
        createBufferSource() {
          const source = super.createBufferSource();
          const originalStart = source.start;
          source.start = function(...startArgs) {
            window.__bgmStarted = true;
            return originalStart.apply(this, startArgs);
          };
          return source;
        }
      }
      window.AudioContext = SpiedAudioContext;
      window.webkitAudioContext = SpiedAudioContext;
    }
  });

  // 3. Go to main page (which will display the splashscreen)
  await page.goto('/');

  // Verify splashscreen is visible
  const splashText = page.locator('h1', { hasText: 'RONDA' });
  await expect(splashText).toBeVisible({ timeout: 5000 });

  // 4. Perform a user gesture on the page (e.g., click the body) while on splashscreen
  await page.locator('body').click();

  // Give any asynchronous AudioContext code a moment to initialize/run
  await page.waitForTimeout(1000);

  // 5. Assert that the BGM did NOT start
  const bgmStarted = await page.evaluate(() => window.__bgmStarted);
  console.log(`[Diagnostic] BGM started on splashscreen gesture: ${bgmStarted}`);

  // The BGM should not start on the splashscreen click
  expect(bgmStarted).toBe(false);

  // 6. Wait for splashscreen to disappear and Main Menu to appear
  const startBtn = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i }).first();
  await expect(startBtn).toBeVisible({ timeout: 10000 });

  // Assert that BGM still hasn't started (since no post-splash screen user gesture has occurred yet)
  const bgmStartedAfterSplash = await page.evaluate(() => window.__bgmStarted);
  console.log(`[Diagnostic] BGM started after splash screen (before gesture): ${bgmStartedAfterSplash}`);
  expect(bgmStartedAfterSplash).toBe(false);

  // 7. Click on the main menu background/body to perform a gesture
  await page.locator('body').click();
  await page.waitForTimeout(1000);

  // Assert that the BGM now HAS started
  const bgmStartedAfterGesture = await page.evaluate(() => window.__bgmStarted);
  console.log(`[Diagnostic] BGM started after gesture on Main Menu: ${bgmStartedAfterGesture}`);
  expect(bgmStartedAfterGesture).toBe(true);
});
