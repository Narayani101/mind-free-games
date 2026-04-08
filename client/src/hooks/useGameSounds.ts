import { useCallback, useRef } from 'react';

function ctx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  const Ctx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
  return Ctx ? new Ctx() : null;
}

function beep(ac: AudioContext, freq: number, dur: number, type: OscillatorType = 'sine', gain = 0.08) {
  const o = ac.createOscillator();
  const g = ac.createGain();
  o.type = type;
  o.frequency.value = freq;
  g.gain.value = gain;
  o.connect(g);
  g.connect(ac.destination);
  o.start();
  o.stop(ac.currentTime + dur);
}

export function useGameSounds() {
  const acRef = useRef<AudioContext | null>(null);

  const getAc = useCallback(() => {
    if (!acRef.current) acRef.current = ctx();
    return acRef.current;
  }, []);

  const playDice = useCallback(() => {
    const ac = getAc();
    if (!ac) return;
    if (ac.state === 'suspended') void ac.resume();
    for (let i = 0; i < 4; i++) {
      window.setTimeout(() => beep(ac, 180 + i * 40, 0.05, 'square', 0.06), i * 45);
    }
  }, [getAc]);

  const playCrash = useCallback(() => {
    const ac = getAc();
    if (!ac) return;
    if (ac.state === 'suspended') void ac.resume();
    beep(ac, 90, 0.15, 'sawtooth', 0.12);
    window.setTimeout(() => beep(ac, 60, 0.2, 'square', 0.1), 40);
  }, [getAc]);

  const playWin = useCallback(() => {
    const ac = getAc();
    if (!ac) return;
    if (ac.state === 'suspended') void ac.resume();
    [523, 659, 784].forEach((f, i) => {
      window.setTimeout(() => beep(ac, f, 0.12, 'triangle', 0.07), i * 100);
    });
  }, [getAc]);

  const playPop = useCallback(() => {
    const ac = getAc();
    if (!ac) return;
    if (ac.state === 'suspended') void ac.resume();
    beep(ac, 520, 0.04, 'sine', 0.09);
    window.setTimeout(() => beep(ac, 380, 0.05, 'sine', 0.06), 35);
  }, [getAc]);

  const playMatch = useCallback(() => {
    const ac = getAc();
    if (!ac) return;
    if (ac.state === 'suspended') void ac.resume();
    [660, 880, 990].forEach((f, i) => {
      window.setTimeout(() => beep(ac, f, 0.06, 'triangle', 0.065), i * 45);
    });
  }, [getAc]);

  const playSparkle = useCallback(() => {
    const ac = getAc();
    if (!ac) return;
    if (ac.state === 'suspended') void ac.resume();
    beep(ac, 1200, 0.03, 'sine', 0.05);
    window.setTimeout(() => beep(ac, 1600, 0.04, 'sine', 0.04), 40);
  }, [getAc]);

  const playJump = useCallback(() => {
    const ac = getAc();
    if (!ac) return;
    if (ac.state === 'suspended') void ac.resume();
    beep(ac, 340, 0.06, 'square', 0.07);
  }, [getAc]);

  return { playDice, playCrash, playWin, playPop, playMatch, playSparkle, playJump };
}
