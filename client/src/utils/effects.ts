export async function fireConfetti() {
  const { default: confetti } = await import('canvas-confetti');
  confetti({
    particleCount: 120,
    spread: 70,
    origin: { y: 0.65 },
    colors: ['#FF8A65', '#7ED957', '#FFD93D', '#5DADE2'],
  });
}
