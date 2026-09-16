export class AudioSystem {
  private ctx: AudioContext | null = null;
  
  constructor() {
    // AudioContext must be resumed or created after user interaction
    // We'll initialize it lazily on the first sound playback
  }
  
  private getContext(): AudioContext {
    if (!this.ctx) {
      this.ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    }
    return this.ctx;
  }
  
  public playFlap() {
    this.playTone(300, 'sine', 0.1, -10);
    setTimeout(() => this.playTone(400, 'sine', 0.1, -10), 50);
  }
  
  public playScore() {
    this.playTone(600, 'square', 0.1, -15);
    setTimeout(() => this.playTone(800, 'square', 0.2, -15), 100);
  }
  
  public playHit() {
    this.playTone(150, 'sawtooth', 0.3, -5);
    setTimeout(() => this.playTone(100, 'sawtooth', 0.3, -5), 100);
  }
  
  private playTone(freq: number, type: OscillatorType, duration: number, volDb: number = -10) {
    try {
      const ctx = this.getContext();
      if (ctx.state === 'suspended') {
        ctx.resume();
      }
      
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      
      // Convert dB to linear gain
      const gainValue = Math.pow(10, volDb / 20);
      
      gain.gain.setValueAtTime(gainValue, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + duration);
      
      osc.connect(gain);
      gain.connect(ctx.destination);
      
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch (e) {
      console.warn("Audio playback failed", e);
    }
  }
}
