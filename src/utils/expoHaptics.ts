// Expo Haptics & Audio Synthesizer Simulator for Web & Mobile

class ExpoHapticsEngine {
  private audioCtx: AudioContext | null = null;
  private soundEnabled: boolean = true;

  constructor() {
    // Sound enabled by default
    this.soundEnabled = true;
  }

  public setSoundEnabled(enabled: boolean) {
    this.soundEnabled = enabled;
  }

  public isSoundEnabled(): boolean {
    return this.soundEnabled;
  }

  private getAudioContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    try {
      if (!this.audioCtx) {
        const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
        if (AudioContextClass) {
          this.audioCtx = new AudioContextClass();
        }
      }
      if (this.audioCtx && this.audioCtx.state === 'suspended') {
        this.audioCtx.resume();
      }
      return this.audioCtx;
    } catch (_) {
      return null;
    }
  }

  private playTone(freq: number, duration: number, type: OscillatorType = 'sine', gainVal = 0.08) {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;

      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);

      gain.gain.setValueAtTime(gainVal, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + duration);

      osc.connect(gain);
      gain.connect(ctx.destination);

      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (_) {}
  }

  // Haptic impact (light, medium, heavy)
  public impactAsync(style: 'light' | 'medium' | 'heavy' = 'light') {
    try {
      if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
        const duration = style === 'light' ? 10 : style === 'medium' ? 25 : 45;
        navigator.vibrate(duration);
      }
    } catch (_) {}

    // Audio click feedback
    if (style === 'light') {
      this.playTone(800, 0.03, 'sine', 0.04);
    } else if (style === 'medium') {
      this.playTone(600, 0.04, 'triangle', 0.06);
    } else {
      this.playTone(400, 0.06, 'triangle', 0.08);
    }
  }

  // Keypad tap
  public selection() {
    this.impactAsync('light');
  }

  // Push Notification Chime
  public playPushNotificationChime() {
    if (!this.soundEnabled) return;
    try {
      const ctx = this.getAudioContext();
      if (!ctx) return;
      
      const now = ctx.currentTime;
      // Chime note 1: E6 (1318 Hz)
      const osc1 = ctx.createOscillator();
      const gain1 = ctx.createGain();
      osc1.frequency.setValueAtTime(1318, now);
      gain1.gain.setValueAtTime(0.09, now);
      gain1.gain.exponentialRampToValueAtTime(0.001, now + 0.35);
      osc1.connect(gain1);
      gain1.connect(ctx.destination);
      osc1.start(now);
      osc1.stop(now + 0.35);

      // Chime note 2: B6 (1975 Hz)
      const osc2 = ctx.createOscillator();
      const gain2 = ctx.createGain();
      osc2.frequency.setValueAtTime(1975, now + 0.12);
      gain2.gain.setValueAtTime(0.09, now + 0.12);
      gain2.gain.exponentialRampToValueAtTime(0.001, now + 0.55);
      osc2.connect(gain2);
      gain2.connect(ctx.destination);
      osc2.start(now + 0.12);
      osc2.stop(now + 0.55);
    } catch (_) {}
  }

  // Notification types
  public notificationAsync(type: 'success' | 'warning' | 'error') {
    if (typeof navigator !== 'undefined' && 'vibrate' in navigator) {
      try {
        if (type === 'success') {
          navigator.vibrate([15, 30, 20]);
        } else if (type === 'warning') {
          navigator.vibrate([30, 40, 30]);
        } else {
          navigator.vibrate([50, 50, 50, 50]);
        }
      } catch (_) {}
    }

    if (type === 'success') {
      this.playTone(880, 0.08, 'sine', 0.07);
      setTimeout(() => this.playTone(1174, 0.14, 'sine', 0.08), 80);
    } else if (type === 'error') {
      this.playTone(250, 0.12, 'sawtooth', 0.08);
      setTimeout(() => this.playTone(180, 0.16, 'sawtooth', 0.08), 100);
    } else {
      this.playTone(500, 0.1, 'triangle', 0.07);
    }
  }
}

export const ExpoHaptics = new ExpoHapticsEngine();
