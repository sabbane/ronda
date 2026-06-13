class SoundService {
  constructor() {
    this._muted = localStorage.getItem('ronda_muted') === 'true';
    this.bgmPlaying = false;
    this.audioCtx = null;
    this.gainNode = null;
    this.activeSources = [];
    this.decodedBuffers = {};
    
    this.tracks = [
      {
        name: "Casablanca",
        path: "/assets/sounds/casablanca.mp3",
        introPath: "/assets/sounds/casablanca_intro.mp3",
        gain: 0.50
      },
      {
        name: "Desert Night",
        path: "/assets/sounds/desert_night.mp3",
        introPath: "/assets/sounds/desert_night_intro.mp3",
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

    // Suspend BGM context during ads to pause seamlessly from current playback position
    window.addEventListener('ronda-ad-started', () => {
      if (this.adPlaying) return;
      this.adPlaying = true;
      if (this.audioCtx && this.bgmPlaying) {
        this.audioCtx.suspend().catch(e => console.warn('Failed to suspend BGM:', e));
      }
    });

    window.addEventListener('ronda-ad-completed', () => {
      if (!this.adPlaying) return;
      this.adPlaying = false;
      if (this.audioCtx && this.bgmPlaying && !this.muted) {
        this.audioCtx.resume().catch(e => console.warn('Failed to resume BGM:', e));
      }
    });

    this._preloadTrack(this.currentTrackIndex);

    // Preload SFX to avoid latency
    this.sfxCache = {};
    this.sfxFiles = [
      'click.mp3',
      'card_deal.mp3',
      'card_place.mp3',
      'card_sweep.mp3',
      'missa_success.mp3',
      'missa_fail.mp3',
      'darba_success.mp3',
      'darba_fail.mp3',
      'ultimate_attack.mp3',
      'ronda_tringa.mp3',
      'ronda_tringa_fail.mp3',
      'clash.mp3',
      'clash_fail.mp3',
      'victory.mp3',
      'defeat.mp3'
    ];
    
    this.sfxFiles.forEach(file => {
      try {
        const audio = new Audio(`/assets/sounds/${file}`);
        audio.preload = 'auto';
        this.sfxCache[file] = audio;
      } catch (e) {
        console.warn(`[SoundService] Failed to preload SFX ${file}:`, e.message);
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
    
    this._preloadTrack(finalIdx);

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

  async _preloadTrack(index) {
    const track = this.tracks[index];
    if (!track || track.name === "No Sound" || !track.path) return;
    
    try {
      if (!this.audioCtx) {
        this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      }
      
      const promises = [this._loadBuffer(track.path)];
      if (track.introPath) {
        promises.push(this._loadBuffer(track.introPath));
      }
      await Promise.all(promises);
      console.log(`[SoundService] Preloaded track: ${track.name}`);
    } catch (e) {
      console.warn(`[SoundService] Preload failed for ${track.name}:`, e.message);
    }
  }

  async _loadBuffer(url) {
    if (this.decodedBuffers[url]) {
      return this.decodedBuffers[url];
    }
    const response = await fetch(url);
    const arrayBuffer = await response.arrayBuffer();
    const audioBuffer = await new Promise((resolve, reject) => {
      this.audioCtx.decodeAudioData(
        arrayBuffer,
        (buffer) => resolve(buffer),
        (err) => reject(err)
      );
    });
    this.decodedBuffers[url] = audioBuffer;
    return audioBuffer;
  }

  async initContext() {
    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      await this.audioCtx.resume();
    }
    if (!this.bgmPlaying && !this.muted && !this.adPlaying) {
      this.startBGM().catch(e => console.warn('Failed to auto-start BGM:', e));
    }
    return true;
  }

  async startBGM() {
    if (this.muted || this.adPlaying) return;
    if (this.bgmPlaying) return;

    const trackIndex = this.currentTrackIndex;
    const track = this.tracks[trackIndex];
    if (!track || track.name === "No Sound" || !track.path) {
      this.bgmPlaying = true;
      return;
    }

    if (!this.audioCtx) {
      this.audioCtx = new (window.AudioContext || window.webkitAudioContext)();
    }
    if (this.audioCtx.state === 'suspended') {
      try {
        await this.audioCtx.resume();
      } catch (e) {
        console.warn('Failed to resume context:', e);
      }
    }

    if (!this.gainNode) {
      this.gainNode = this.audioCtx.createGain();
      this.gainNode.connect(this.audioCtx.destination);
    }
    this.gainNode.gain.setValueAtTime(this.muted ? 0 : track.gain, this.audioCtx.currentTime);

    this.bgmPlaying = true;

    try {
      this.stopActiveSources();

      const promises = [this._loadBuffer(track.path)];
      if (track.introPath) {
        promises.push(this._loadBuffer(track.introPath));
      }

      const [loopBuffer, introBuffer] = await Promise.all(promises);

      // Guard: cancel if state changed during load
      if (!this.bgmPlaying || this.currentTrackIndex !== trackIndex || this.adPlaying) {
        return;
      }

      const startTime = this.audioCtx.currentTime;

      if (introBuffer) {
        const introSource = this.audioCtx.createBufferSource();
        introSource.buffer = introBuffer;
        introSource.connect(this.gainNode);

        const loopSource = this.audioCtx.createBufferSource();
        loopSource.buffer = loopBuffer;
        loopSource.loop = true;
        loopSource.connect(this.gainNode);

        introSource.start(startTime);
        loopSource.start(startTime + introBuffer.duration);

        this.activeSources.push(introSource, loopSource);
      } else {
        const loopSource = this.audioCtx.createBufferSource();
        loopSource.buffer = loopBuffer;
        loopSource.loop = true;
        loopSource.connect(this.gainNode);

        loopSource.start(startTime);
        this.activeSources.push(loopSource);
      }
    } catch (e) {
      console.warn('[SoundService] BGM play failed:', e.message);
      this.bgmPlaying = false;
    }
  }

  async stopBGM() {
    if (!this.bgmPlaying) return;
    this.bgmPlaying = false;
    this.stopActiveSources();
  }

  stopActiveSources() {
    this.activeSources.forEach(source => {
      try {
        source.stop();
      } catch { /* ignore */ }
    });
    this.activeSources = [];
  }

  _playSFX(filename, volume = 0.8) {
    if (this.muted) return;
    
    try {
      const cached = this.sfxCache[filename];
      const audio = cached ? cached.cloneNode() : new Audio(`/assets/sounds/${filename}`);
      audio.volume = volume;
      audio.play().catch(err => {
        console.warn(`[SoundService] SFX play failed for ${filename}:`, err.message);
      });
    } catch (e) {
      console.warn(`[SoundService] Failed to initialize SFX for ${filename}:`, e.message);
    }
  }

  async playClick() {
    this._playSFX('click.mp3', 0.6);
  }

  async playCardDeal() {
    this._playSFX('card_deal.mp3', 0.7);
  }

  async playCardPlace() {
    this._playSFX('card_place.mp3', 0.75);
  }

  async playCardSweep() {
    this._playSFX('card_sweep.mp3', 0.8);
  }

  async playMissa(isSuccess = true) {
    this._playSFX(isSuccess ? 'missa_success.mp3' : 'missa_fail.mp3', 0.85);
  }

  async playDarba(isSuccess = true, double = false) {
    this._playSFX(isSuccess ? 'darba_success.mp3' : 'darba_fail.mp3', 0.85);
    if (double) {
      setTimeout(() => {
        this._playSFX(isSuccess ? 'darba_success.mp3' : 'darba_fail.mp3', 0.85);
      }, 250);
    }
  }

  async playUltimateAttack() {
    this._playSFX('ultimate_attack.mp3', 0.9);
  }

  async playRondaTringa(isSuccess = true) {
    this._playSFX(isSuccess ? 'ronda_tringa.mp3' : 'ronda_tringa_fail.mp3', 0.9);
  }

  async playClash(isSuccess = true) {
    this._playSFX(isSuccess ? 'clash.mp3' : 'clash_fail.mp3', 0.9);
  }

  async playVictory() {
    this._playSFX('victory.mp3', 0.9);
  }

  async playDefeat() {
    this._playSFX('defeat.mp3', 0.9);
  }
}

export const soundService = new SoundService();
