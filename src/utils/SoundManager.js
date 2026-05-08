/**
 * SoundManager - Maneja los efectos de sonido del sistema
 * Incluye el efecto de tipeo mecánico con variaciones.
 */

class SoundManager {
  constructor() {
    this.context = null;
    const saved = localStorage.getItem("system_sfx_enabled");
    this.enabled = saved !== null ? saved === "true" : true;
    this.volume = 0.04;
    this._setupWakeListeners();
  }

  _setupWakeListeners() {
    if (typeof window === "undefined") return;
    const wake = () => {
      if (!this.context) {
        try {
          this.context = new (window.AudioContext || window.webkitAudioContext)();
        } catch (e) { return; }
      }
      if (this.context.state === "suspended") {
        this.context.resume();
      }
      document.removeEventListener("mousedown", wake);
      document.removeEventListener("touchstart", wake);
      document.removeEventListener("keydown", wake);
    };
    document.addEventListener("mousedown", wake, { once: true });
    document.addEventListener("touchstart", wake, { once: true });
    document.addEventListener("keydown", wake, { once: true });
  }

  toggle(state) {
    this.enabled = state !== undefined ? state : !this.enabled;
    localStorage.setItem("system_sfx_enabled", this.enabled);
    return this.enabled;
  }

  setVolume(val) {
    this.volume = Math.max(0, Math.min(1, val));
  }

  /**
   * Genera un sonido de "bip" digital muy corto para hovers
   */
  playHover() {
    if (!this.enabled) return;
    if (!this.context) {
      try {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { return; }
    }

    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    osc.type = 'sine';
    osc.frequency.setValueAtTime(800 + Math.random() * 200, this.context.currentTime);
    
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(this.volume * 0.5, this.context.currentTime + 0.01);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.1);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.1);
  }

  /**
   * Genera un sonido de "click" mecánico usando síntesis
   */
  playTypeClick() {
    if (!this.enabled) return;
    if (!this.context) {
      try {
        this.context = new (window.AudioContext || window.webkitAudioContext)();
      } catch (e) { return; }
    }
    const osc = this.context.createOscillator();
    const gain = this.context.createGain();
    
    const freq = 150 + Math.random() * 100;
    osc.type = 'square';
    osc.frequency.setValueAtTime(freq, this.context.currentTime);
    
    gain.gain.setValueAtTime(0, this.context.currentTime);
    gain.gain.linearRampToValueAtTime(this.volume, this.context.currentTime + 0.001);
    gain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.02);
    
    osc.connect(gain);
    gain.connect(this.context.destination);
    
    osc.start();
    osc.stop(this.context.currentTime + 0.03);

    this.playKeyNoise();
  }

  playKeyNoise() {
    const bufferSize = this.context.sampleRate * 0.02;
    const buffer = this.context.createBuffer(1, bufferSize, this.context.sampleRate);
    const data = buffer.getChannelData(0);
    
    for (let i = 0; i < bufferSize; i++) {
      data[i] = Math.random() * 2 - 1;
    }

    const noise = this.context.createBufferSource();
    noise.buffer = buffer;
    
    const noiseGain = this.context.createGain();
    noiseGain.gain.setValueAtTime(this.volume * 0.3, this.context.currentTime);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, this.context.currentTime + 0.015);
    
    const filter = this.context.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 1000 + Math.random() * 500;
    
    noise.connect(filter);
    filter.connect(noiseGain);
    noiseGain.connect(this.context.destination);
    
    noise.start();
  }

  playJesterLaugh() {
    if (!this.enabled) return;
    const audio = new Audio("/audio/Jester Laugh Reverb.mp3");
    audio.volume = this.volume * 8; // Boost slightly as it's a thematic event
    audio.play().catch(e => console.warn("Audio playback failed", e));
  }
}

const soundManager = new SoundManager();
export default soundManager;
