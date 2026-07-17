import { test, expect, webkit, devices } from '@playwright/test';

test.describe('Safari iPhone Audio Autoplay Bug Reproduction', () => {
  test('AudioContext must remain suspended on iOS WebKit when pointerdown triggers first', async () => {
    const iphone = devices['iPhone 12'];
    const browser = await webkit.launch({ headless: true });
    
    // Create an emulated iPhone context
    const context = await browser.newContext({
      ...iphone,
      // Playwright WebKit uses WebKit engine, the same engine as Safari
    });
    const page = await context.newPage();

    // Set up console listener to capture any warnings or errors
    page.on('console', msg => {
      console.log(`[Browser Console] ${msg.type()}: ${msg.text()}`);
    });

    // 1. Force the splashscreen to show by overriding navigator.webdriver to false
    await page.addInitScript(() => {
      console.log('[InitScript] Overriding navigator.webdriver to false');
      try {
        Object.defineProperty(navigator, 'webdriver', {
          get: () => false,
          configurable: true
        });
        Object.defineProperty(Navigator.prototype, 'webdriver', {
          get: () => false,
          configurable: true
        });
        console.log('[InitScript] Overrides complete. navigator.webdriver =', navigator.webdriver);
      } catch (e) {
        console.error('[InitScript] Override failed:', e);
      }
    });

    // 2. Inject spied/mocked AudioContext
    // This handles the case where headless WebKit on Windows lacks native audio support,
    // while also emulating the iOS Safari restriction where pointerdown cannot unlock audio.
    await page.addInitScript(() => {
      const nativeExists = !!(window.AudioContext || window.webkitAudioContext);
      
      if (!nativeExists) {
        console.log('[Spy] Native AudioContext is undefined (common in Windows headless WebKit). Injecting iOS Safari mock...');
        
        class MockAudioContext {
          constructor() {
            this.state = 'suspended';
            this.destination = {};
            console.log('[Mock] MockAudioContext constructed.');
          }
          
          createGain() {
            return {
              gain: {
                setValueAtTime: () => {}
              },
              connect: () => {}
            };
          }
          
          createBufferSource() {
            return {
              connect: () => {},
              start: () => {}
            };
          }
          
          async resume() {
            // Emulate iOS Safari: resume() ONLY succeeds if the current event is a valid gesture (click, touchstart, touchend)
            // If the current event is pointerdown, iOS Safari does not unlock the audio context.
            const currentEvent = window.event;
            const eventType = currentEvent ? currentEvent.type : 'none';
            console.log('[Mock] resume() called. Current event type:', eventType);
            
            if (eventType === 'click' || eventType === 'touchstart' || eventType === 'touchend') {
              this.state = 'running';
              console.log('[Mock] resume() succeeded. State: running');
            } else {
              this.state = 'suspended';
              console.log('[Mock] resume() ignored/failed due to invalid gesture type. State: suspended');
            }
          }
          
          decodeAudioData() {
            return Promise.resolve({});
          }
        }
        
        window.AudioContext = MockAudioContext;
        window.webkitAudioContext = MockAudioContext;
        window.__audioCtxInstance = null;
        
        // Intercept instance creation
        const OriginalMock = window.AudioContext;
        window.AudioContext = function(...args) {
          const inst = new OriginalMock(...args);
          window.__audioCtxInstance = inst;
          return inst;
        };
        window.webkitAudioContext = window.AudioContext;
      } else {
        // Native exists (e.g. headed mode or other platforms), wrap it to emulate iOS Safari pointerdown block
        console.log('[Spy] Native AudioContext exists. Wrapping resume to emulate iOS Safari pointerdown block...');
        ['AudioContext', 'webkitAudioContext'].forEach(name => {
          const Ctx = window[name];
          if (Ctx && Ctx.prototype) {
            const origResume = Ctx.prototype.resume;
            if (origResume) {
              Ctx.prototype.resume = function(...args) {
                window.__audioCtxInstance = this;
                const currentEvent = window.event;
                const eventType = currentEvent ? currentEvent.type : 'none';
                console.log(`[Spy] Native resume called. Event type: ${eventType}`);
                
                if (eventType === 'pointerdown') {
                  console.log('[Spy] Blocking native resume on pointerdown (iOS Safari behavior).');
                  return Promise.resolve(); // keeps context suspended
                }
                return origResume.apply(this, args);
              };
            }
          }
        });
      }
    });

    // 3. Navigate to the game (Splashscreen shows up)
    console.log('Navigating to the home page...');
    await page.goto('/');
    await page.waitForLoadState('networkidle');

    // 4. Wait for Main Menu to appear (allowing time for Splashscreen to fade out if visible)
    const startGameBtn = page.locator('button', { hasText: /Start Game|Play vs AI Bot/i }).first();
    await expect(startGameBtn).toBeVisible({ timeout: 25000 });
    console.log('Main menu is now visible.');

    // 5. Perform gesture on Main Menu body to trigger audio context activation
    // In SoundContext.jsx, listeners are click, pointerdown, keydown.
    // Playwright's page.locator('body').click() triggers pointerdown, then mousedown, then mouseup, then click.
    console.log('Triggering user gesture on Main Menu body...');
    await page.locator('body').click();

    // Allow asynchronous AudioContext operations to settle
    await page.waitForTimeout(2000);

    // 6. Evaluate AudioContext state
    const audioStateResult = await page.evaluate(() => {
      const ctx = window.__audioCtxInstance;
      return ctx ? {
        exists: true,
        state: ctx.state
      } : {
        exists: false,
        state: null
      };
    });

    console.log(`[Reproduction Results] AudioContext state:`, audioStateResult);

    // Assert that the AudioContext is RUNNING (the desired correct behavior)
    // Currently, it will fail (state is 'suspended') because the bug is still present.
    expect(audioStateResult.exists).toBe(true);
    expect(audioStateResult.state).toBe('running');

    await context.close();
    await browser.close();
  });
});
