/**
 * SoundService.js
 * Manages background music and gameplay sound effects using standard HTML5 Audio.
 * Easily customized by placing MP3/OGG files in the assets directory.
 */

class SoundService {
  constructor() {
    this._muted = localStorage.getItem('ronda_muted') === 'true';
    
    // BGM State
    this.bgmPlaying = false;
    this.bgmAudio = null;
    
    // Load BGM tracks
    this.tracks = [
      {
        name: "Casablanca",
        path: "/assets/sounds/casablanca.mp3",
        gain: 0.50
      },
      {
        name: "Desert Night",
        path: "/assets/sounds/desert_night.mp3",
        gain: 0.65
      },
      {
        name: "No Sound",
        path: null,
        gain: 0
      }
    ];

    const storedTrack = localStorage.getItem('ronda_bgm_track');
    this.currentTrackIndex = storedTrack !== null ? parseInt(storedTrack, 10) : 0;

    this.adPlaying = false;
    this._wasBGMPlayingBeforeAd = false;

    // Listen for global ad events to auto-pause/resume BGM
    window.addEventListener('ronda-ad-started', () => {
      if (this.adPlaying) return;
      this.adPlaying = true;
      this._wasBGMPlayingBeforeAd = this.bgmPlaying;
      if (this._wasBGMPlayingBeforeAd) {
        this.stopBGM();
      }
    });

    window.addEventListener('ronda-ad-completed', () => {
      if (!this.adPlaying) return;
      this.adPlaying = false;
      if (this._wasBGMPlayingBeforeAd) {
        this.startBGM();
        this._wasBGMPlayingBeforeAd = false;
      }
    });
  }

  get muted() {
    return this._muted;
  }

  set muted(value) {
    this._muted = value;
    localStorage.setItem('ronda_muted', String(value));
    if (value) {
      this.stopBGM();
    } else {
      this.startBGM();
    }
  }

  async changeTrack(index) {
    const finalIdx = index % this.tracks.length;
    this.currentTrackIndex = finalIdx;
    localStorage.setItem('ronda_bgm_track', String(finalIdx));
    
    if (this.bgmPlaying) {
      await this.stopBGM();
      await this.startBGM();
    }
    return finalIdx;
  }

  async nextTrack() {
    const nextIdx = (this.currentTrackIndex + 1) % this.tracks.length;
    return await this.changeTrack(nextIdx);
  }

  /**
   * Fallback for autoplay policies / initialization compatibility.
   */
  async initContext() {
    // Automatically trigger BGM on first successful user interaction
    if (!this.bgmPlaying && !this.muted && !this.adPlaying) {
      this.startBGM().catch(e => console.warn('Failed to auto-start BGM:', e));
    }
    return true;
  }

  async startBGM() {
    if (this.muted || this.adPlaying) return;
    if (this.bgmPlaying) return;

    const track = this.tracks[this.currentTrackIndex];
    if (!track || track.name === "No Sound" || !track.path) {
      this.bgmPlaying = true; // logically playing, but silent
      return;
    }

    try {
      if (this.bgmAudio) {
        this.bgmAudio.pause();
        this.bgmAudio = null;
      }

      this.bgmAudio = new Audio(track.path);
      this.bgmAudio.loop = true;
      this.bgmAudio.volume = track.gain;
      
      this.bgmPlaying = true;
      await this.bgmAudio.play();
    } catch (e) {
      console.warn('[SoundService] BGM play failed (audio asset may be missing):', e.message);
      this.bgmPlaying = false; // Reset to false to allow autoplay gesture retry
    }
  }

  async stopBGM() {
    if (!this.bgmPlaying) return;
    this.bgmPlaying = false;

    if (this.bgmAudio) {
      try {
        this.bgmAudio.pause();
      } catch (e) { /* ignore */ }
    }
  }

  /**
   * Helper to play an SFX file from the assets/sounds/ directory.
   * If the file is not found or fails to play, catches the exception and logs a warning.
   */
  _playSFX(filename, volume = 0.8) {
    if (this.muted) return;
    
    try {
      const audio = new Audio(`/assets/sounds/${filename}`);
      audio.volume = volume;
      audio.play().catch(err => {
        console.warn(`[SoundService] SFX play failed for ${filename}:`, err.message);
      });
    } catch (e) {
      console.warn(`[SoundService] Failed to initialize SFX for ${filename}:`, e.message);
    }
  }

  // 1. UI Click
  async playClick() {
    this._playSFX('click.mp3', 0.6);
  }

  // 2. Card Deal
  async playCardDeal() {
    this._playSFX('card_deal.mp3', 0.7);
  }

  // 3. Card Place
  async playCardPlace() {
    this._playSFX('card_place.mp3', 0.75);
  }

  // 4. Card Sweep
  async playCardSweep() {
    this._playSFX('card_sweep.mp3', 0.8);
  }

  // 5. Missa
  async playMissa(isSuccess = true) {
    this._playSFX(isSuccess ? 'missa_success.mp3' : 'missa_fail.mp3', 0.85);
  }

  // 6. Derba
  async playDerba(isSuccess = true) {
    this._playSFX(isSuccess ? 'derba_success.mp3' : 'derba_fail.mp3', 0.85);
  }

  // 7. Ultimate Attack
  async playUltimateAttack() {
    this._playSFX('ultimate_attack.mp3', 0.9);
  }

  // 8. Ronda/Tringa
  async playRondaTringa(isSuccess = true) {
    this._playSFX(isSuccess ? 'ronda_tringa.mp3' : 'ronda_tringa_fail.mp3', 0.9);
  }

  // 8. Clash
  async playClash(isSuccess = true) {
    this._playSFX(isSuccess ? 'clash.mp3' : 'clash_fail.mp3', 0.9);
  }

  // 9. Victory Fanfare
  async playVictory() {
    this._playSFX('victory.mp3', 0.9);
  }

  // 10. Defeat
  async playDefeat() {
    this._playSFX('defeat.mp3', 0.9);
  }
}

export const soundService = new SoundService();
