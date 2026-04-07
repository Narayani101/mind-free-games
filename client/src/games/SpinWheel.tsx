import { useState } from 'react';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';

const GAME_ID = 'spin-wheel';
const SECTORS = [20, 50, 10, 100, 30, 15, 200, 5];

export default function SpinWheelGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const [rotation, setRotation] = useState(0);
  const [spinning, setSpinning] = useState(false);
  const [score, setScore] = useState(0);
  const [message, setMessage] = useState('');

  const spin = () => {
    if (spinning) return;
    setSpinning(true);
    setMessage('');
    const extra = 360 * 5 + Math.random() * 360;
    const start = performance.now();
    const from = rotation;
    const duration = 3200;
    const tick = (now: number) => {
      const t = Math.min(1, (now - start) / duration);
      const ease = 1 - (1 - t) ** 3;
      setRotation(from + extra * ease);
      if (t < 1) requestAnimationFrame(tick);
      else {
        setSpinning(false);
        const final = (from + extra) % 360;
        const idx =
          Math.floor(((360 - (final % 360)) % 360) / (360 / SECTORS.length)) % SECTORS.length;
        const gain = SECTORS[idx];
        setMessage(`Sector ${idx + 1}: +${gain} points`);
        setScore((s) => {
          const ns = s + gain;
          void reportScore(ns);
          saveState({ score: ns });
          return ns;
        });
      }
    };
    requestAnimationFrame(tick);
  };

  return (
    <GameShell
      gameId={GAME_ID}
      title="Spin Wheel"
      actions={<span className="text-sm text-zinc-400">Score: {score}</span>}
    >
      <div className="relative mx-auto h-64 w-64 sm:h-72 sm:w-72">
        <div className="absolute left-1/2 top-0 z-10 -translate-x-1/2 text-2xl text-amber-300" aria-hidden>
          ▼
        </div>
        <div
          className="h-full w-full rounded-full border-4 border-white/20 shadow-xl"
          style={{
            transform: `rotate(${rotation}deg)`,
            transition: spinning ? undefined : 'none',
            background: `conic-gradient(${SECTORS.map((_, i) => {
              const hue = (i * 360) / SECTORS.length;
              return `hsl(${hue}, 70%, 45%) ${(i * 100) / SECTORS.length}% ${((i + 1) * 100) / SECTORS.length}%`;
            }).join(', ')})`,
          }}
        />
      </div>
      <p className="mt-4 text-center text-xs text-zinc-500">
        Sectors (clockwise): {SECTORS.join(', ')}
      </p>
      <div className="mt-6 text-center">
        <button
          type="button"
          disabled={spinning}
          onClick={spin}
          className="rounded-full bg-indigo-600 px-8 py-3 text-lg font-semibold text-white disabled:opacity-50"
        >
          {spinning ? 'Spinning…' : 'Spin'}
        </button>
        {message && <p className="mt-4 text-emerald-400">{message}</p>}
      </div>
    </GameShell>
  );
}
