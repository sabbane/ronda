class AdService {
  constructor() {
    this.platform = import.meta.env.VITE_PLATFORM || 'web';
    this.isOffline = !navigator.onLine;

    // Listen to online/offline events
    window.addEventListener('online', () => { this.isOffline = false; });
    window.addEventListener('offline', () => { this.isOffline = true; });
  }

  /**
   * Triggers an interstitial ad.
   * @param {Object} callbacks
   * @param {Function} callbacks.onBeforeAd - Called when the ad is about to start playing (shows spinner/overlay).
   * @param {Function} callbacks.onComplete - Called when the ad finishes, fails, is skipped, or times out.
   */
  showInterstitial(callbacks = {}) {
    const defaultCallbacks = {
      onBeforeAd: () => {},
      onComplete: () => {},
      ...callbacks
    };

    console.log(`[AdService] Requesting interstitial for platform: ${this.platform}`);

    // Rule 1: Offline protection
    if (this.isOffline || !navigator.onLine) {
      console.log('[AdService] Client is offline. Bypassing ad.');
      defaultCallbacks.onComplete();
      return;
    }

    // Safety Timeout: 45 seconds to prevent hanging
    let resolved = false;
    const safetyTimeout = setTimeout(() => {
      if (!resolved) {
        resolved = true;
        console.warn('[AdService] Ad playback timed out (45s safety limit reached). Continuing game.');
        defaultCallbacks.onComplete();
      }
    }, 45000);

    const completeWrapper = () => {
      if (!resolved) {
        resolved = true;
        clearTimeout(safetyTimeout);
        defaultCallbacks.onComplete();
      }
    };

    // Platform Routing
    if (this.platform === 'playgama') {
      this._showPlayGamaAd(defaultCallbacks.onBeforeAd, completeWrapper);
    } else {
      this._showGoogleH5Ad(defaultCallbacks.onBeforeAd, completeWrapper);
    }
  }

  _showPlayGamaAd(onBeforeAd, onComplete) {
    if (window.bridge && window.bridge.advertisement) {
      console.log('[AdService] PlayGama Bridge SDK detected. Showing interstitial.');
      // Notify the UI that ad is starting
      onBeforeAd();
      
      try {
        window.bridge.advertisement.showInterstitial({
          onClose: (wasShown) => {
            console.log(`[AdService] PlayGama interstitial closed. Was shown: ${wasShown}`);
            onComplete();
          }
        });
      } catch (err) {
        console.error('[AdService] Error running PlayGama showInterstitial:', err);
        onComplete();
      }
    } else {
      console.warn('[AdService] PlayGama platform configured, but window.bridge is not available. Bypassing.');
      onComplete();
    }
  }

  _showGoogleH5Ad(onBeforeAd, onComplete) {
    if (typeof window.adBreak === 'function') {
      console.log('[AdService] Google H5 Games Ads (adBreak) detected. Triggering break.');
      let adStarted = false;

      // Fallback Timeout: If beforeAd is not called within 1.5 seconds,
      // assume Google H5 Ads failed to load or got blocked, and continue the game.
      const fallbackTimeout = setTimeout(() => {
        if (!adStarted) {
          console.warn('[AdService] Google H5 Ad did not start within 1.5s (pending account or adblock). Bypassing.');
          onComplete();
        }
      }, 1500);

      try {
        window.adBreak({
          type: 'next',
          name: 'game-over',
          beforeAd: () => {
            console.log('[AdService] Google H5 Ad starting.');
            adStarted = true;
            clearTimeout(fallbackTimeout);
            onBeforeAd();
          },
          afterAd: () => {
            console.log('[AdService] Google H5 Ad completed successfully.');
            clearTimeout(fallbackTimeout);
            onComplete();
          },
          adBreakDone: (placementInfo) => {
            console.log('[AdService] Google H5 adBreakDone. Info:', placementInfo);
            clearTimeout(fallbackTimeout);
            // If beforeAd was never triggered, it means no ad was shown.
            // In that case, we need to complete now since afterAd won't run.
            if (!adStarted) {
              onComplete();
            }
          }
        });
      } catch (err) {
        console.error('[AdService] Error running Google H5 adBreak:', err);
        clearTimeout(fallbackTimeout);
        onComplete();
      }
    } else {
      console.warn('[AdService] Google H5 adBreak function is not defined. Bypassing.');
      onComplete();
    }
  }

  /**
   * Sends game ready signal (specifically for PlayGama or similar platforms).
   */
  sendGameReady() {
    if (this.platform === 'playgama') {
      if (window.bridge && typeof window.bridge.gameReady === 'function') {
        try {
          console.log('[AdService] Sending gameReady signal to PlayGama.');
          window.bridge.gameReady();
        } catch (err) {
          console.error('[AdService] Error sending PlayGama gameReady:', err);
        }
      }
    }
  }
}

export const adService = new AdService();
