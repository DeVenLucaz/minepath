// Web Audio API Sound Engine - No external files

let ctx = null;
let bgGain = null;
let bgNodes = [];
let bgPlaying = false;
let masterGain = null;
let isTransitioning = false;

let bgEndlessGain = null;
let bgEndlessNodes = [];
let bgEndlessPlaying = false;

document.addEventListener('visibilitychange', () => {
  if (document.hidden) {
    if (ctx) ctx.suspend();
  } else {
    if (ctx) ctx.resume();
  }
});

function getCtx() {
  if (!ctx) {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    masterGain = ctx.createGain();
    masterGain.gain.value = 0.7;
    masterGain.connect(ctx.destination);

    const resumeAudio = () => {
      if (ctx && ctx.state === 'suspended') {
        ctx.resume().then(() => {
          document.removeEventListener('click', resumeAudio);
          document.removeEventListener('touchstart', resumeAudio);
        }).catch(() => {});
      } else if (ctx && ctx.state === 'running') {
        document.removeEventListener('click', resumeAudio);
        document.removeEventListener('touchstart', resumeAudio);
      }
    };
    document.addEventListener('click', resumeAudio);
    document.addEventListener('touchstart', resumeAudio);
  }
  if (ctx.state === 'suspended') ctx.resume().catch(() => {});
  return ctx;
}

function getSettings() {
  try {
    const val = localStorage.getItem('minepath_settings');
    if (!val || val === 'null' || val === 'undefined') return { bgm: true, sfx: true };
    const parsed = JSON.parse(val);
    return parsed !== null && typeof parsed === 'object' ? parsed : { bgm: true, sfx: true };
  } catch {
    return { bgm: true, sfx: true };
  }
}

function playTone(freq, duration, type = 'sine', gainVal = 0.3, delay = 0) {
  if (!getSettings().sfx) return;
  const c = getCtx();
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.connect(g);
  g.connect(masterGain);
  osc.type = type;
  osc.frequency.setValueAtTime(freq, c.currentTime + delay);
  g.gain.setValueAtTime(gainVal, c.currentTime + delay);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + delay + duration);
  osc.start(c.currentTime + delay);
  osc.stop(c.currentTime + delay + duration);
}

function playFreqSeq(freqs, noteDuration, type = 'square', gainVal = 0.2) {
  if (!getSettings().sfx) return;
  freqs.forEach((freq, i) => {
    if (freq > 0) playTone(freq, noteDuration, type, gainVal, i * noteDuration);
  });
}

export const audio = {
  init() {
    getCtx();
  },

  setMasterVolume(val) {
    if (!masterGain) getCtx();
    masterGain.gain.setTargetAtTime(val, getCtx().currentTime, 0.05);
  },

  safeTap() {
    playTone(520, 0.08, 'sine', 0.25);
    playTone(780, 0.06, 'sine', 0.15, 0.07);
  },

  mineExplosion() {
    const c = getCtx();
    if (!getSettings().sfx) return;
    // Boom
    const buf = c.createBuffer(1, c.sampleRate * 0.5, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const g = c.createGain();
    g.gain.setValueAtTime(0.8, c.currentTime);
    g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
    src.connect(g);
    g.connect(masterGain);
    src.start();
    // Sad trombone
    setTimeout(() => {
      playFreqSeq([440, 415, 392, 349], 0.2, 'sawtooth', 0.15);
    }, 400);
  },

  powerupCollect() {
    playFreqSeq([523, 659, 784, 1047], 0.08, 'sine', 0.2);
  },

  levelComplete() {
    const melody = [523, 659, 784, 1047, 784, 1047, 1175, 1319];
    melody.forEach((freq, i) => {
      playTone(freq, 0.15, 'sine', 0.25, i * 0.1);
    });
  },

  timerLow() {
    playTone(880, 0.05, 'square', 0.1);
  },

  thiefFox() {
    playFreqSeq([784, 698, 659, 587, 523], 0.1, 'sawtooth', 0.2);
  },

  windGust() {
    if (!getSettings().sfx) return;
    const c = getCtx();
    const buf = c.createBuffer(1, c.sampleRate * 0.4, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * 0.3 * Math.sin(i / data.length * Math.PI);
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const filter = c.createBiquadFilter();
    filter.type = 'bandpass';
    filter.frequency.value = 800;
    src.connect(filter);
    filter.connect(masterGain);
    src.start();
  },

  peek() {
    playTone(300, 0.1, 'sine', 0.15);
    playTone(400, 0.1, 'sine', 0.1, 0.1);
  },

  startBackground(force = false) {
    if (isTransitioning && !force) return;
    if (audio._fadeOutTimer) {
      clearTimeout(audio._fadeOutTimer);
      audio._fadeOutTimer = null;
      if (bgGain) {
        const c = getCtx();
        bgGain.gain.cancelScheduledValues(c.currentTime);
        bgGain.gain.setValueAtTime(bgGain.gain.value, c.currentTime);
        bgGain.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.5);
      }
      return;
    }
    if (bgPlaying) return;
    if (!getSettings().bgm) return;
    const c = getCtx();
    bgPlaying = true;

    bgGain = c.createGain();
    bgGain.gain.value = 0.12;
    bgGain.connect(masterGain);

    const bpm = 130;
    const beat = 60 / bpm;

    // Chiptune melody
    const melody = [
      523, 523, 659, 0, 784, 659, 523, 0,
      392, 392, 523, 0, 659, 523, 392, 0,
      523, 659, 784, 784, 698, 659, 523, 0,
      392, 523, 659, 784, 523, 0, 392, 0,
    ];

    const bassline = [
      131, 0, 131, 0, 165, 0, 165, 0,
      196, 0, 196, 0, 131, 0, 131, 0,
      131, 0, 131, 0, 165, 0, 165, 0,
      196, 0, 131, 0, 0, 0, 196, 0,
    ];

    let loopId = null;
    let startTime = c.currentTime;

    function scheduleLoop() {
      if (!bgPlaying) return;
      const c = getCtx();
      if (c.state === 'suspended') {
        startTime = c.currentTime;
        audio._bgLoopId = setTimeout(scheduleLoop, 100);
        return;
      }

      const loopDuration = beat * melody.length;

      melody.forEach((freq, i) => {
        if (freq > 0) {
          const osc = c.createOscillator();
          const g = c.createGain();
          osc.connect(g);
          g.connect(bgGain);
          osc.type = 'square';
          osc.frequency.value = freq;
          const t = startTime + i * beat;
          g.gain.setValueAtTime(0.3, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.8);
          osc.start(t);
          osc.stop(t + beat * 0.85);
          bgNodes.push(osc);
        }
      });

      bassline.forEach((freq, i) => {
        if (freq > 0) {
          const osc = c.createOscillator();
          const g = c.createGain();
          osc.connect(g);
          g.connect(bgGain);
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const t = startTime + i * beat;
          g.gain.setValueAtTime(0.5, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.9);
          osc.start(t);
          osc.stop(t + beat * 0.95);
          bgNodes.push(osc);
        }
      });

      startTime += loopDuration;
      loopId = setTimeout(scheduleLoop, (loopDuration - 0.5) * 1000);
    }

    scheduleLoop();
    audio._bgLoopId = loopId;
  },

  fadeInBackground() {
    isTransitioning = true;
    this.fadeOutBackground();
    this.stopEndlessBackground();
    setTimeout(() => {
      this.stopBackground();
      this.startBackground(true);
      if (bgGain) {
        const c = getCtx();
        bgGain.gain.cancelScheduledValues(c.currentTime);
        bgGain.gain.setValueAtTime(0, c.currentTime);
        bgGain.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.5);
      }
      setTimeout(() => { isTransitioning = false; }, 500);
    }, 550);
  },

  fadeOutBackground() {
    if (bgGain && bgPlaying) {
      if (audio._fadeOutTimer) clearTimeout(audio._fadeOutTimer);
      const c = getCtx();
      bgGain.gain.cancelScheduledValues(c.currentTime);
      bgGain.gain.setValueAtTime(bgGain.gain.value, c.currentTime);
      bgGain.gain.linearRampToValueAtTime(0.001, c.currentTime + 0.5);
      audio._fadeOutTimer = setTimeout(() => {
        this.stopBackground();
        audio._fadeOutTimer = null;
      }, 500);
    } else {
      this.stopBackground();
    }
  },

  stopBackground() {
    bgPlaying = false;
    if (audio._fadeOutTimer) {
      clearTimeout(audio._fadeOutTimer);
      audio._fadeOutTimer = null;
    }
    if (audio._bgLoopId) clearTimeout(audio._bgLoopId);
    
    if (bgGain) {
      const c = getCtx();
      bgGain.gain.cancelScheduledValues(c.currentTime);
      bgGain.gain.setValueAtTime(bgGain.gain.value, c.currentTime);
      bgGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.1);
    }
    
    const oldNodes = bgNodes;
    bgNodes = [];
    setTimeout(() => {
      oldNodes.forEach(n => { try { n.stop(); } catch {} });
    }, 150);
    bgGain = null;
  },

  gameOver() {
    this.fadeOutBackground();
    this.stopEndlessBackground();
    this.mineExplosion();
  },

  obstacleScramble() {
    playFreqSeq([800, 600, 400, 700, 500, 300], 0.07, 'sawtooth', 0.15);
  },

  fakeMinePop() {
    playTone(300, 0.05, 'sine', 0.2);
    playTone(250, 0.05, 'sine', 0.15, 0.05);
    this.mineExplosion();
  },

  purchase() {
    playFreqSeq([523, 784], 0.1, 'sine', 0.25);
  },

  skillUnlock() {
    playFreqSeq([392, 523, 659, 784], 0.08, 'sine', 0.2);
  },

  featherEarned() {
    playTone(1047, 0.15, 'sine', 0.15);
    playTone(1319, 0.1, 'sine', 0.15, 0.15);
  },

  eggHatch() {
    if (!getSettings().sfx) return;
    const c = getCtx();
    const buf = c.createBuffer(1, c.sampleRate * 0.15, c.sampleRate);
    const data = buf.getChannelData(0);
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / data.length, 2);
    }
    const src = c.createBufferSource();
    src.buffer = buf;
    const gNoise = c.createGain();
    gNoise.gain.setValueAtTime(0.2, c.currentTime);
    gNoise.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.15);
    src.connect(gNoise);
    gNoise.connect(masterGain);
    src.start();

    const osc = c.createOscillator();
    const gOsc = c.createGain();
    osc.connect(gOsc);
    gOsc.connect(masterGain);
    osc.type = 'sine';
    osc.frequency.setValueAtTime(300, c.currentTime);
    osc.frequency.linearRampToValueAtTime(600, c.currentTime + 0.2);
    gOsc.gain.setValueAtTime(0.2, c.currentTime);
    gOsc.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.2);
    osc.start(c.currentTime);
    osc.stop(c.currentTime + 0.2);
  },

  safeFloor() {
    playFreqSeq([784, 659, 523], 0.15, 'triangle', 0.15);
  },

  startEndlessBackground(force = false) {
    if (isTransitioning && !force) return;
    if (audio._endlessFadeOutTimer) {
      clearTimeout(audio._endlessFadeOutTimer);
      audio._endlessFadeOutTimer = null;
      if (bgEndlessGain) {
        const c = getCtx();
        bgEndlessGain.gain.cancelScheduledValues(c.currentTime);
        bgEndlessGain.gain.setValueAtTime(bgEndlessGain.gain.value, c.currentTime);
        bgEndlessGain.gain.linearRampToValueAtTime(0.12, c.currentTime + 0.5);
      }
      return;
    }
    if (bgEndlessPlaying) return;
    if (!getSettings().bgm) return;
    const c = getCtx();
    bgEndlessPlaying = true;

    this.stopBackground();

    bgEndlessGain = c.createGain();
    bgEndlessGain.gain.value = 0.12;
    bgEndlessGain.connect(masterGain);

    const bpm = 155;
    const beat = 60 / bpm;

    const melody = [659, 659, 784, 0, 880, 784, 659, 0, 523, 523, 659, 0, 784, 659, 523, 0];
    const bassline = [165, 0, 165, 0, 196, 0, 196, 0, 131, 0, 131, 0, 165, 0, 165, 0];

    let loopId = null;
    let startTime = c.currentTime;

    function scheduleLoop() {
      if (!bgEndlessPlaying) return;
      const c = getCtx();
      if (c.state === 'suspended') {
        startTime = c.currentTime;
        audio._bgEndlessLoopId = setTimeout(scheduleLoop, 100);
        return;
      }

      const loopDuration = beat * melody.length;

      melody.forEach((freq, i) => {
        if (freq > 0) {
          const osc = c.createOscillator();
          const g = c.createGain();
          osc.connect(g);
          g.connect(bgEndlessGain);
          osc.type = 'square';
          osc.frequency.value = freq;
          const t = startTime + i * beat;
          g.gain.setValueAtTime(0.3, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.8);
          osc.start(t);
          osc.stop(t + beat * 0.85);
          bgEndlessNodes.push(osc);
        }
      });

      bassline.forEach((freq, i) => {
        if (freq > 0) {
          const osc = c.createOscillator();
          const g = c.createGain();
          osc.connect(g);
          g.connect(bgEndlessGain);
          osc.type = 'triangle';
          osc.frequency.value = freq;
          const t = startTime + i * beat;
          g.gain.setValueAtTime(0.5, t);
          g.gain.exponentialRampToValueAtTime(0.001, t + beat * 0.9);
          osc.start(t);
          osc.stop(t + beat * 0.95);
          bgEndlessNodes.push(osc);
        }
      });

      for (let i = 0; i < melody.length; i++) {
        const buf = c.createBuffer(1, c.sampleRate * 0.02, c.sampleRate);
        const data = buf.getChannelData(0);
        for (let j = 0; j < data.length; j++) {
          data[j] = Math.random() * 2 - 1;
        }
        const src = c.createBufferSource();
        src.buffer = buf;
        const gNoise = c.createGain();
        src.connect(gNoise);
        gNoise.connect(bgEndlessGain);
        const t = startTime + i * beat;
        gNoise.gain.setValueAtTime(0.05, t);
        gNoise.gain.exponentialRampToValueAtTime(0.001, t + 0.02);
        src.start(t);
        src.stop(t + 0.05);
        bgEndlessNodes.push(src);
      }

      startTime += loopDuration;
      loopId = setTimeout(scheduleLoop, (loopDuration - 0.5) * 1000);
    }

    scheduleLoop();
    audio._bgEndlessLoopId = loopId;
  },

  stopEndlessBackground() {
    bgEndlessPlaying = false;
    if (audio._endlessFadeOutTimer) {
      clearTimeout(audio._endlessFadeOutTimer);
      audio._endlessFadeOutTimer = null;
    }
    if (audio._bgEndlessLoopId) clearTimeout(audio._bgEndlessLoopId);
    
    if (bgEndlessGain) {
      const c = getCtx();
      bgEndlessGain.gain.cancelScheduledValues(c.currentTime);
      bgEndlessGain.gain.setValueAtTime(bgEndlessGain.gain.value, c.currentTime);
      bgEndlessGain.gain.exponentialRampToValueAtTime(0.001, c.currentTime + 0.5);
    }
    
    const oldNodes = bgEndlessNodes;
    bgEndlessNodes = [];
    setTimeout(() => {
      oldNodes.forEach(n => { try { n.stop(); } catch {} });
    }, 550);
    bgEndlessGain = null;
  },
};
