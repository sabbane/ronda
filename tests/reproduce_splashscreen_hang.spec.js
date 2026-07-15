import { test, expect, webkit, devices } from '@playwright/test';

test.describe('Safari iPhone Splashscreen Loading Hang Bug Reproduction', () => {
  test('Splashscreen must complete loading and reveal the Main Menu even if audio elements do not fire oncanplaythrough', async () => {
    const iphone = devices['iPhone 12'];
    const browser = await webkit.launch({ headless: true });
    
    // Create an emulated iPhone context
    const context = await browser.newContext({
      ...iphone,
      // Playwright WebKit uses WebKit engine, the same engine as Safari
    });
    const page = await context.newPage();

    // Set up console listener to capture any warnings or errors
    const consoleLogs = [];
    page.on('console', msg => {
      consoleLogs.push(`[Console ${msg.type()}] ${msg.text()}`);
    });

    // 1. Force the splashscreen to show by overriding navigator.webdriver to false
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', {
        get: () => false,
        configurable: true
      });
    });

    // 2. Emulate iOS Safari audio loading block:
    // Mock the HTMLAudioElement/Audio constructor so that setting 'src' does not automatically load
    // or trigger 'oncanplaythrough' (simulating iOS Safari deferring background media loading).
    await page.addInitScript(() => {
      console.log('[Spy] Injecting blocked audio loading simulation...');
      
      const OriginalAudio = window.Audio;
      
      class BlockedAudio {
        constructor() {
          this._src = '';
          this.preload = 'none';
          this.oncanplaythrough = null;
          this.onerror = null;
          console.log('[MockAudio] Created blocked audio instance.');
        }

        get src() {
          return this._src;
        }

        set src(value) {
          this._src = value;
          console.log(`[MockAudio] src set to: ${value}. Simulating iOS block (not firing oncanplaythrough).`);
          // We intentionally do NOT call this.oncanplaythrough() or this.onerror() here.
          // This simulates iOS Safari's policy of completely ignoring/suspending media loads
          // without a user gesture, leaving the promise hanging.
        }
      }

      window.Audio = BlockedAudio;
    });

    // 3. Navigate to the game (Splashscreen shows up)
    console.log('Navigating to the home page...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 4. Wait for Splashscreen to render
    const splashImg = page.locator('img[alt="Ronda"]');
    await expect(splashImg).toBeVisible({ timeout: 5000 });
    console.log('Splashscreen is visible.');

    // 5. Assert that the Main Menu eventually becomes visible (Desired correct behavior)
    // We expect the loading to complete and show the start game button.
    // In the buggy implementation, this will fail (timeout) because the loading gets stuck at 69%.
    console.log('Waiting for Main Menu "Start Game" button (expecting it to eventually show up)...');
    const startGameBtn = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i }).first();
    
    // We use a 12-second timeout to allow the 5-second minimum timer to pass.
    // If it is stuck at 69%, this will time out and fail.
    await expect(startGameBtn).toBeVisible({ timeout: 12000 });
    console.log('Main menu is visible! Loading completed successfully.');

    await context.close();
    await browser.close();
  });
});
