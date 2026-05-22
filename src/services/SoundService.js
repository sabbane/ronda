/**
 * SoundService.js
 * High-fidelity, zero-weight procedural sound synthesis using the Web Audio API.
 * Ensures compatibility with PlayGama single-file compile (0KB asset bloat).
 */

class SoundService {
  constructor() {
    this.ctx = null;
    this._muted = localStorage.getItem('ronda_muted') === 'true';
  }

  get muted() {
    return this._muted;
  }

  set muted(value) {
    this._muted = value;
    localStorage.setItem('ronda_muted', String(value));
  }

  /**
   * Lazily initialize/resume the audio context upon user gesture.
   */
  async initContext() {
    if (this.muted) return null;

    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || window.webkitAudioContext;
      if (!AudioContextClass) return null;
      this.ctx = new AudioContextClass();
    }

    if (this.ctx.state === 'suspended') {
      try {
        await this.ctx.resume();
      } catch (e) {
        console.warn('AudioContext failed to resume:', e);
      }
    }

    return this.ctx;
  }

  /**
   * Helper to generate a brief buffer of random noise (for card friction sounds).
   */
  createNoiseBuffer(ctx, duration) {
    const bufferSize = ctx.sampleRate * duration;
    const buffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const data = buffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }
    return buffer;
  }

  /**
   * 1. UI Click: Clean crisp frequency sweep.
   */
  async playClick() {
    const ctx = await this.initContext();
    if (!ctx) return;

    const osc = ctx.createOscillator();
    const gainNode = ctx.createGain();

    osc.type = 'sine';
    osc.frequency.setValueAtTime(1000, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(350, ctx.currentTime + 0.05);

    gainNode.gain.setValueAtTime(0.06, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.05);

    osc.connect(gainNode);
    gainNode.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.06);
  }

  /**
   * 2. Card Deal: Soft friction whoosh sound (filtered noise decay).
   */
  async playCardDeal() {
    const ctx = await this.initContext();
    if (!ctx) return;

    const duration = 0.16;
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(1.8, ctx.currentTime);
    filter.frequency.setValueAtTime(1300, ctx.currentTime);
    filter.frequency.exponentialRampToValueAtTime(450, ctx.currentTime + duration);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.08, ctx.currentTime);
    gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start();
    noise.stop(ctx.currentTime + duration + 0.02);
  }

  /**
   * 3. Card Place/Snap: Dual sound (low wood thud + high paper snap).
   */
  async playCardPlace() {
    const ctx = await this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // --- Component A: Low Thud (Wood knock) ---
    const thud = ctx.createOscillator();
    const thudGain = ctx.createGain();
    thud.type = 'sine';
    thud.frequency.setValueAtTime(140, now);
    thud.frequency.exponentialRampToValueAtTime(40, now + 0.12);

    thudGain.gain.setValueAtTime(0.12, now);
    thudGain.gain.exponentialRampToValueAtTime(0.001, now + 0.12);

    thud.connect(thudGain);
    thudGain.connect(ctx.destination);
    thud.start(now);
    thud.stop(now + 0.13);

    // --- Component B: High Snap (Paper transient) ---
    const snapDuration = 0.04;
    const snapSource = ctx.createBufferSource();
    snapSource.buffer = this.createNoiseBuffer(ctx, snapDuration);

    const snapFilter = ctx.createBiquadFilter();
    snapFilter.type = 'highpass';
    snapFilter.frequency.setValueAtTime(1800, now);

    const snapGain = ctx.createGain();
    snapGain.gain.setValueAtTime(0.05, now);
    snapGain.gain.exponentialRampToValueAtTime(0.001, now + snapDuration);

    snapSource.connect(snapFilter);
    snapFilter.connect(snapGain);
    snapGain.connect(ctx.destination);

    snapSource.start(now);
    snapSource.stop(now + snapDuration + 0.01);
  }

  /**
   * 4. Card Sweep: Sequence of card brush slides simulating gathering cards.
   */
  async playCardSweep() {
    const ctx = await this.initContext();
    if (!ctx) return;

    // A multi-card brush sweep
    const playBrush = (delay) => {
      const now = ctx.currentTime + delay;
      const duration = 0.15;
      const noise = ctx.createBufferSource();
      noise.buffer = this.createNoiseBuffer(ctx, duration);

      const filter = ctx.createBiquadFilter();
      filter.type = 'bandpass';
      filter.Q.setValueAtTime(2.0, now);
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(300, now + duration);

      const gainNode = ctx.createGain();
      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

      noise.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      noise.start(now);
      noise.stop(now + duration + 0.02);
    };

    // Trigger three overlapping card movements
    playBrush(0.0);
    playBrush(0.07);
    playBrush(0.14);

    // Finish with a small final pickup sound
    setTimeout(() => {
      this.playCardPlace();
    }, 200);
  }

  /**
   * 5. Missa Announcement: High ascending C-major arpeggio.
   */
  async playMissa(isSuccess = true) {
    const ctx = await this.initContext();
    if (!ctx) return;

    const baseNow = ctx.currentTime;
    const notes = isSuccess ? [523.25, 659.25, 783.99, 1046.50] : [311.13, 261.63, 196.00, 155.56];

    notes.forEach((freq, i) => {
      const now = baseNow + i * 0.07;
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2000, now);

      gainNode.gain.setValueAtTime(0.06, now);
      gainNode.gain.setTargetAtTime(0.001, now + 0.02, 0.08); // Sweet exponential decay

      osc.connect(filter);
      filter.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.6);
    });
  }

  /**
   * 6. Derba Announcement: Punchy, descending arcade stinger.
   */
  async playDerba(isSuccess = true) {
    const ctx = await this.initContext();
    if (!ctx) return;

    const baseNow = ctx.currentTime;
    // Descending, heavy frequency ramps
    const playTone = (startFreq, endFreq, startTime, duration) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(startFreq, startTime);
      osc.frequency.linearRampToValueAtTime(endFreq, startTime + duration);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1200, startTime);

      gain.gain.setValueAtTime(0.08, startTime);
      gain.gain.exponentialRampToValueAtTime(0.001, startTime + duration);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    };

    if (isSuccess) {
      playTone(650, 350, baseNow, 0.08);
      playTone(800, 400, baseNow + 0.06, 0.1);
    } else {
      playTone(350, 200, baseNow, 0.1);
      playTone(250, 150, baseNow + 0.08, 0.12);
    }
  }

  /**
   * 7. Ronda or Tringa Announcement: Sparkling magical pentatonic chime sequence.
   */
  async playRondaTringa(isSuccess = true) {
    const ctx = await this.initContext();
    if (!ctx) return;

    const baseNow = ctx.currentTime;
    const notes = isSuccess 
      ? [523.25, 587.33, 659.25, 783.99, 880.00, 1046.50]
      : [622.25, 523.25, 466.16, 392.00, 311.13, 261.63];

    notes.forEach((freq, i) => {
      const now = baseNow + i * 0.05;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      // Combined oscillators for nice harmonized chime tone
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(2500, now);

      gain.gain.setValueAtTime(0.05, now);
      gain.gain.setTargetAtTime(0.001, now + 0.05, 0.15); // Ringing decay

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 1.2);
    });
  }

  /**
   * 8. Clash: Sword/metal impact sound.
   */
  async playClash(isSuccess = true) {
    const ctx = await this.initContext();
    if (!ctx) return;

    const now = ctx.currentTime;

    // A metallic sound combines several high-pitch non-harmonics
    const frequencies = isSuccess ? [880, 1240, 1420, 1680, 2040] : [440, 620, 710, 840, 1020];
    frequencies.forEach((freq) => {
      const osc = ctx.createOscillator();
      const gainNode = ctx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      gainNode.gain.setValueAtTime(0.02, now);
      gainNode.gain.exponentialRampToValueAtTime(0.001, now + 0.3);

      osc.connect(gainNode);
      gainNode.connect(ctx.destination);

      osc.start(now);
      osc.stop(now + 0.35);
    });

    // Sword friction metallic swoosh (filtered noise burst)
    const duration = 0.15;
    const noise = ctx.createBufferSource();
    noise.buffer = this.createNoiseBuffer(ctx, duration);

    const filter = ctx.createBiquadFilter();
    filter.type = 'bandpass';
    filter.Q.setValueAtTime(4.0, now);
    filter.frequency.setValueAtTime(2000, now);
    filter.frequency.exponentialRampToValueAtTime(1000, now + duration);

    const gainNode = ctx.createGain();
    gainNode.gain.setValueAtTime(0.06, now);
    gainNode.gain.exponentialRampToValueAtTime(0.001, now + duration);

    noise.connect(filter);
    filter.connect(gainNode);
    gainNode.connect(ctx.destination);

    noise.start(now);
    noise.stop(now + duration + 0.02);
  }

  /**
   * 9. Game Over Victory: Triumphant happy melody.
   */
  async playVictory() {
    const ctx = await this.initContext();
    if (!ctx) return;

    const baseNow = ctx.currentTime;
    
    // Notes: C5, E5, G5, C6 (chord progression with timing)
    const notes = [
      { f: 523.25, t: 0, d: 0.15 },
      { f: 659.25, t: 0.12, d: 0.15 },
      { f: 783.99, t: 0.24, d: 0.15 },
      { f: 1046.50, t: 0.36, d: 1.0 }
    ];

    notes.forEach((note) => {
      const time = baseNow + note.t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1800, time);

      gain.gain.setValueAtTime(0.06, time);
      gain.gain.setTargetAtTime(0.001, time + (note.d * 0.3), note.d * 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + note.d + 0.5);
    });

    // Harmony backing (gorgeous warm triad at the end)
    const harmonies = [659.25, 783.99]; // E5, G5
    harmonies.forEach((freq) => {
      const time = baseNow + 0.36;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, time);

      gain.gain.setValueAtTime(0.04, time);
      gain.gain.setTargetAtTime(0.001, time + 0.3, 0.4);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + 1.5);
    });
  }

  /**
   * 10. Game Over Defeat: Sad, solemn minor descending progression.
   */
  async playDefeat() {
    const ctx = await this.initContext();
    if (!ctx) return;

    const baseNow = ctx.currentTime;
    
    // Descending sad minor chimes: G4 (392), E4 (329.63), Eb4 (311.13), C4 (261.63)
    const notes = [
      { f: 392.00, t: 0, d: 0.3 },
      { f: 329.63, t: 0.25, d: 0.3 },
      { f: 311.13, t: 0.50, d: 0.3 },
      { f: 261.63, t: 0.75, d: 0.8 }
    ];

    notes.forEach((note) => {
      const time = baseNow + note.t;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'triangle';
      osc.frequency.setValueAtTime(note.f, time);

      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1000, time);

      gain.gain.setValueAtTime(0.07, time);
      gain.gain.setTargetAtTime(0.001, time + (note.d * 0.3), note.d * 0.4);

      osc.connect(filter);
      filter.connect(gain);
      gain.connect(ctx.destination);

      osc.start(time);
      osc.stop(time + note.d + 0.6);
    });
  }
}

export const soundService = new SoundService();
