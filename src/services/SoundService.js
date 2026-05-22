/**
 * SoundService.js
 * High-fidelity, zero-weight procedural sound synthesis using the Web Audio API.
 * Ensures compatibility with PlayGama single-file compile (0KB asset bloat).
 */

class SoundService {
  constructor() {
    this.ctx = null;
    this._muted = localStorage.getItem('ronda_muted') === 'true';
    
    // Procedural Background Music State
    this.bgmPlaying = false;
    this.bgmMasterGain = null;
    this.bgmNodes = [];      // Track active audio nodes for clean disposal on mute
    this.bgmIntervals = [];  // Track scheduler intervals
    this.currentChordIndex = 0;
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

    // Automatically trigger BGM on first successful user interaction
    if (this.ctx && this.ctx.state === 'running' && !this.bgmPlaying) {
      setTimeout(() => {
        this.startBGM();
      }, 100);
    }

    return this.ctx;
  }

  /**
   * Start highly authentic and beautiful Moroccan background music.
   * Generates a slow, relaxing traditional composition loop (48 seconds / 64 steps at 80 BPM).
   * Features arpeggiated/strummed Oud chords and a breathy Ney flute melody in the traditional Hijaz scale.
   */
  async startBGM() {
    if (this.muted) return;
    if (this.bgmPlaying) return;

    // Ensure audio context is ready
    if (!this.ctx || this.ctx.state === 'suspended') {
      const initSuccess = await this.initContext();
      if (!initSuccess) return;
    }

    const ctx = this.ctx;
    this.bgmPlaying = true;

    // 1. Master BGM Gain to allow elegant fades and subtle background leveling
    this.bgmMasterGain = ctx.createGain();
    this.bgmMasterGain.gain.setValueAtTime(0, ctx.currentTime);
    // Smooth 2.5 second fade-in to let the music rise gently
    this.bgmMasterGain.gain.linearRampToValueAtTime(0.42, ctx.currentTime + 2.5);
    this.bgmMasterGain.connect(ctx.destination);
    this.bgmNodes.push(this.bgmMasterGain);

    // 2. Setup a premium Feedback Delay line for lush string/bell echo tails
    const delayNode = ctx.createDelay(2.0);
    const delayGain = ctx.createGain();

    delayNode.delayTime.setValueAtTime(0.5625, ctx.currentTime); // ~80 BPM dotted-eighth beat delay
    delayGain.gain.setValueAtTime(0.34, ctx.currentTime);       // feedback volume

    delayNode.connect(delayGain);
    delayGain.connect(delayNode);
    delayNode.connect(this.bgmMasterGain);

    this.bgmNodes.push(delayNode, delayGain);

    // 3. Scale and chords definition in the traditional Arabic/Moroccan Hijaz scale (D-Hijaz)
    // Notes: D (root), Eb, F#, G, A, Bb, C
    const chords = [
      // Chord 0 (D Hijaz): D3 (146.83), A3 (220.00), D4 (293.66), F#4 (369.99)
      [146.83, 220.00, 293.66, 369.99],
      // Chord 1 (Eb Major): Eb3 (155.56), Bb3 (233.08), Eb4 (311.13), Bb4 (466.16)
      [155.56, 233.08, 311.13, 466.16],
      // Chord 2 (Cm / C minor): C3 (130.81), G3 (196.00), C4 (261.63), Eb4 (311.13)
      [130.81, 196.00, 261.63, 311.13],
      // Chord 3 (D Majorish cadence): D3 (146.83), A3 (220.00), D4 (293.66), F#4 (369.99)
      [146.83, 220.00, 293.66, 369.99]
    ];

    // Hand-crafted traditional Moroccan melody on the Ney Flute (64 steps)
    // Each step is 1 beat = 0.75 seconds. Total loop duration = 48 seconds!
    const melody = [
      { step: 0, f: 293.66, d: 1.4 },  // D4
      { step: 2, f: 311.13, d: 0.7 },  // Eb4
      { step: 3, f: 369.99, d: 0.7 },  // F#4
      { step: 4, f: 392.00, d: 1.4 },  // G4
      { step: 6, f: 369.99, d: 0.7 },  // F#4
      { step: 7, f: 311.13, d: 0.7 },  // Eb4
      { step: 8, f: 293.66, d: 2.8 },  // D4
      
      { step: 16, f: 440.00, d: 1.4 }, // A4
      { step: 18, f: 466.16, d: 0.7 }, // Bb4
      { step: 19, f: 523.25, d: 0.7 }, // C5
      { step: 20, f: 587.33, d: 1.4 }, // D5
      { step: 22, f: 523.25, d: 0.7 }, // C5
      { step: 23, f: 466.16, d: 0.7 }, // Bb4
      { step: 24, f: 440.00, d: 2.8 }, // A4
      
      { step: 32, f: 466.16, d: 1.4 }, // Bb4
      { step: 34, f: 440.00, d: 0.7 }, // A4
      { step: 35, f: 392.00, d: 0.7 }, // G4
      { step: 36, f: 369.99, d: 1.4 }, // F#4
      { step: 38, f: 392.00, d: 0.7 }, // G4
      { step: 39, f: 311.13, d: 0.7 }, // Eb4
      { step: 40, f: 293.66, d: 2.8 }, // D4
      
      { step: 48, f: 392.00, d: 1.4 }, // G4
      { step: 50, f: 440.00, d: 0.7 }, // A4
      { step: 51, f: 466.16, d: 0.7 }, // Bb4
      { step: 52, f: 440.00, d: 1.4 }, // A4
      { step: 54, f: 369.99, d: 0.7 }, // F#4
      { step: 55, f: 311.13, d: 0.7 }, // Eb4
      { step: 56, f: 293.66, d: 2.8 }  // D4
    ];

    // Helper to play an acoustic Oud strum (rolls notes with a slight delay)
    const playStrummedChord = (chordNotes) => {
      const now = ctx.currentTime;
      chordNotes.forEach((freq, idx) => {
        const strumDelay = idx * 0.045; // 45ms arpeggiation (finger roll effect)
        const noteTime = now + strumDelay;

        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        const filter = ctx.createBiquadFilter();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, noteTime);

        filter.type = 'lowpass';
        filter.frequency.setValueAtTime(1200, noteTime);
        filter.Q.setValueAtTime(1.0, noteTime);
        filter.frequency.exponentialRampToValueAtTime(320, noteTime + 0.22); // plucked damping

        gain.gain.setValueAtTime(0, noteTime);
        gain.gain.linearRampToValueAtTime(0.015, noteTime + 0.003); // extremely quiet and warm
        gain.gain.exponentialRampToValueAtTime(0.0001, noteTime + 1.8); // natural echo tail

        osc.connect(filter);
        filter.connect(gain);
        gain.connect(this.bgmMasterGain);
        gain.connect(delayNode);

        osc.start(noteTime);

        this.bgmNodes.push(osc, gain, filter);

        setTimeout(() => {
          try {
            osc.stop();
            osc.disconnect();
            filter.disconnect();
            gain.disconnect();
          } catch (e) { /* ignore */ }
          this.bgmNodes = this.bgmNodes.filter(n => n !== osc && n !== gain && n !== filter);
        }, 2500);
      });
    };

    // Helper to play a breathy Ney flute note
    const playNeyNote = (freq, duration) => {
      const now = ctx.currentTime;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      const filter = ctx.createBiquadFilter();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, now);

      // Subtle Vibrato LFO (5.5Hz) for realistic, expressive woodwind tone
      const lfo = ctx.createOscillator();
      const lfoGain = ctx.createGain();

      lfo.frequency.value = 5.5; // Vibrato speed
      lfoGain.gain.value = 3.2;  // Vibrato depth

      lfo.connect(lfoGain);
      lfoGain.connect(osc.frequency);

      // Dynamic Breath friction noise component
      const breathDuration = duration + 0.2;
      const noiseSource = ctx.createBufferSource();
      noiseSource.buffer = this.createNoiseBuffer(ctx, breathDuration);

      const breathFilter = ctx.createBiquadFilter();
      breathFilter.type = 'bandpass';
      breathFilter.frequency.setValueAtTime(freq * 1.5, now);
      breathFilter.Q.setValueAtTime(8.0, now);

      const breathGain = ctx.createGain();
      breathGain.gain.setValueAtTime(0, now);
      breathGain.gain.linearRampToValueAtTime(0.005, now + 0.14); // soft breathing swell
      breathGain.gain.setValueAtTime(0.005, now + duration - 0.06);
      breathGain.gain.linearRampToValueAtTime(0, now + duration + 0.1);

      noiseSource.connect(breathFilter);
      breathFilter.connect(breathGain);
      breathGain.connect(this.bgmMasterGain);

      // Flute envelope
      filter.type = 'lowpass';
      filter.frequency.setValueAtTime(1400, now);

      gain.gain.setValueAtTime(0, now);
      gain.gain.linearRampToValueAtTime(0.015, now + 0.16); // slow breathing blow attack
      gain.gain.setValueAtTime(0.015, now + duration - 0.08);
      gain.gain.linearRampToValueAtTime(0.0001, now + duration + 0.15); // soft breath release

      osc.connect(filter);
      filter.connect(gain);

      // Route Ney flute directly to Master Gain and into delay node for beautiful feedback tail
      gain.connect(this.bgmMasterGain);
      gain.connect(delayNode);

      osc.start(now);
      noiseSource.start(now);
      lfo.start(now);

      this.bgmNodes.push(osc, gain, filter, noiseSource, breathFilter, breathGain, lfo, lfoGain);

      setTimeout(() => {
        try {
          osc.stop();
          noiseSource.stop();
          lfo.stop();

          osc.disconnect();
          noiseSource.disconnect();
          lfo.disconnect();
          lfoGain.disconnect();
          breathFilter.disconnect();
          breathGain.disconnect();
          filter.disconnect();
          gain.disconnect();
        } catch (e) { /* ignore */ }

        this.bgmNodes = this.bgmNodes.filter(n =>
          n !== osc && n !== gain && n !== filter &&
          n !== noiseSource && n !== breathFilter && n !== breathGain &&
          n !== lfo && n !== lfoGain
        );
      }, (duration + 0.8) * 1000);
    };

    // 4. BGM Clock Sequencer - ticks every beat (0.75s) at 80 BPM
    let step = 0;

    const tick = () => {
      if (!this.bgmPlaying) return;

      // Chord Triggering (every 16 beats = 12 seconds)
      if (step % 16 === 0) {
        const chordIndex = Math.floor(step / 16) % chords.length;
        playStrummedChord(chords[chordIndex]);
      }

      // Melody Triggering
      const note = melody.find(m => m.step === step);
      if (note) {
        playNeyNote(note.f, note.d);
      }

      // Advance sequence counter (wraps at 64 steps = 48 seconds)
      step = (step + 1) % 64;
    };

    // Run first step immediately
    tick();

    const sequencerInterval = setInterval(tick, 750);
    this.bgmIntervals.push(sequencerInterval);
  }

  /**
   * Smoothly fade out and shut down BGM synthesizer nodes.
   */
  async stopBGM() {
    if (!this.bgmPlaying) return;
    this.bgmPlaying = false;

    // Clear active schedulers
    this.bgmIntervals.forEach(id => clearInterval(id));
    this.bgmIntervals = [];

    // Fade out Master Gain to prevent popping/clicks
    if (this.bgmMasterGain) {
      try {
        const now = this.ctx.currentTime;
        this.bgmMasterGain.gain.setValueAtTime(this.bgmMasterGain.gain.value, now);
        this.bgmMasterGain.gain.linearRampToValueAtTime(0, now + 0.35);
      } catch (e) { /* ignore */ }
    }

    const nodesToDispose = [...this.bgmNodes];
    this.bgmNodes = [];

    // Give it time to fade out before destroying nodes
    setTimeout(() => {
      nodesToDispose.forEach(node => {
        try {
          node.stop();
        } catch (e) { /* ignore */ }
        try {
          node.disconnect();
        } catch (e) { /* ignore */ }
      });
    }, 450);
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
