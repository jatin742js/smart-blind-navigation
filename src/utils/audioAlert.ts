// Synthesized acoustic alert using Web Audio API (zero external assets needed)
let audioCtx: AudioContext | null = null;
let alertInterval: any = null;

function getAudioContext(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!audioCtx) {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (AudioContextClass) {
      audioCtx = new AudioContextClass();
    }
  }
  if (audioCtx && audioCtx.state === 'suspended') {
    audioCtx.resume();
  }
  return audioCtx;
}

export function playEmergencyChime() {
  try {
    const ctx = getAudioContext();
    if (!ctx) return;

    // High urgent two-tone beep (880Hz / 1320Hz)
    const now = ctx.currentTime;

    const osc1 = ctx.createOscillator();
    const gain1 = ctx.createGain();
    osc1.type = 'sawtooth';
    osc1.frequency.setValueAtTime(880, now);
    osc1.frequency.exponentialRampToValueAtTime(1320, now + 0.15);

    gain1.gain.setValueAtTime(0.25, now);
    gain1.gain.exponentialRampToValueAtTime(0.01, now + 0.3);

    osc1.connect(gain1);
    gain1.connect(ctx.destination);

    osc1.start(now);
    osc1.stop(now + 0.32);
  } catch {
    // browser auto-play policy catch
  }
}

export function startRepeatingEmergencySiren() {
  stopEmergencySiren();
  playEmergencyChime();
  alertInterval = setInterval(() => {
    playEmergencyChime();
  }, 1200);
}

export function stopEmergencySiren() {
  if (alertInterval) {
    clearInterval(alertInterval);
    alertInterval = null;
  }
}
