/**
 * Controlled Web Audio utility for MYJPG Safety SOS.
 * - Never auto-plays on mount or inside React useEffect.
 * - Never creates infinite/looping beeps.
 * - Stops and disconnects all active nodes immediately on cancel, mute, or unmount.
 */
class SosAudioController {
  private ctx: AudioContext | null = null;
  private activeNodes: Array<{ stop?: () => void; disconnect: () => void }> = [];
  private timers: number[] = [];

  private ensureContext(): AudioContext | null {
    if (typeof window === 'undefined') return null;
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
    if (!AudioCtx) return null;

    if (!this.ctx || this.ctx.state === 'closed') {
      this.ctx = new AudioCtx();
    }
    if (this.ctx.state === 'suspended') {
      this.ctx.resume().catch(() => {});
    }
    return this.ctx;
  }

  public stopAll(): void {
    for (const id of this.timers) {
      window.clearTimeout(id);
    }
    this.timers = [];

    for (const node of this.activeNodes) {
      try {
        node.stop?.();
      } catch {
        // Already stopped
      }
      try {
        node.disconnect();
      } catch {
        // Already disconnected
      }
    }
    this.activeNodes = [];
  }

  /**
   * Plays a single brief, clean confirmation chime ONLY when SOS is explicitly
   * confirmed and submitted (never on screen open, brief tap, partial hold, or cancel).
   */
  public playConfirmationTone(enabled: boolean): void {
    if (!enabled) {
      this.stopAll();
      return;
    }

    this.stopAll();

    const ctx = this.ensureContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      const notes = [
        { freq: 587.33, start: 0, duration: 0.14 },
        { freq: 880.0, start: 0.16, duration: 0.22 },
      ];

      for (const note of notes) {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();

        osc.type = 'sine';
        osc.frequency.setValueAtTime(note.freq, now + note.start);

        gain.gain.setValueAtTime(0.0001, now + note.start);
        gain.gain.exponentialRampToValueAtTime(0.16, now + note.start + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + note.start + note.duration);

        osc.connect(gain);
        gain.connect(ctx.destination);

        osc.start(now + note.start);
        osc.stop(now + note.start + note.duration + 0.02);

        this.activeNodes.push(osc, gain);
      }

      const cleanupTimer = window.setTimeout(() => {
        this.stopAll();
      }, 450);
      this.timers.push(cleanupTimer);
    } catch {
      this.stopAll();
    }
  }
}

export const sosAudioController = new SosAudioController();
