/** Lightweight burst effects — dynamic import keeps initial bundle smaller */

export async function confettiCelebration(originY = 0.55) {
  const { default: confetti } = await import('canvas-confetti');
  confetti({
    particleCount: 90,
    spread: 65,
    origin: { y: originY },
    colors: ['#FF8A65', '#7ED957', '#FFD93D', '#5DADE2', '#A78BFA', '#F472B6'],
    ticks: 200,
    gravity: 1.05,
    scalar: 0.9,
  });
}

export async function confettiMatchBurst() {
  const { default: confetti } = await import('canvas-confetti');
  confetti({
    particleCount: 55,
    spread: 50,
    startVelocity: 35,
    origin: { y: 0.45 },
    colors: ['#f43f5e', '#eab308', '#22c55e', '#3b82f6', '#a855f7'],
    ticks: 120,
  });
}

export async function confettiSpark(origin: { x: number; y: number }) {
  const { default: confetti } = await import('canvas-confetti');
  confetti({
    particleCount: 28,
    spread: 360,
    startVelocity: 18,
    origin,
    ticks: 80,
    gravity: 1.2,
    scalar: 0.75,
    colors: ['#fbbf24', '#f97316', '#ef4444', '#ffffff'],
  });
}
