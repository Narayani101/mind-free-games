import { useCallback, useEffect, useRef, useState } from 'react';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';

const GAME_ID = 'plinko';
const MULTS = [10, 25, 50, 100, 50, 25, 10];

export default function PlinkoGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [last, setLast] = useState<number | null>(null);
  const ball = useRef<{ x: number; y: number; vx: number; vy: number; active: boolean }>({
    x: 0.5,
    y: 0.05,
    vx: 0,
    vy: 0,
    active: false,
  });

  const drop = useCallback(() => {
    ball.current = {
      x: 0.45 + Math.random() * 0.1,
      y: 0.05,
      vx: (Math.random() - 0.5) * 0.02,
      vy: 0.01,
      active: true,
    };
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#0c0c12';
      ctx.fillRect(0, 0, w, h);
      const pegRows = 10;
      for (let r = 0; r < pegRows; r++) {
        const count = 9;
        for (let c = 0; c < count; c++) {
          const px = ((c + 0.5) / count) * w + (r % 2 === 0 ? 0 : (0.5 / count) * w);
          const py = 0.12 + (r / pegRows) * 0.65;
          ctx.beginPath();
          ctx.arc(px, py * h, 4, 0, Math.PI * 2);
          ctx.fillStyle = '#94a3b8';
          ctx.fill();
        }
      }
      MULTS.forEach((m, i) => {
        const x = (i + 0.5) / MULTS.length;
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x * w - w / MULTS.length / 2 + 4, h * 0.88, w / MULTS.length - 8, 32);
        ctx.fillStyle = '#e2e8f0';
        ctx.font = '12px system-ui';
        ctx.fillText(String(m), x * w - 10, h * 0.88 + 20);
      });
      const b = ball.current;
      if (b.active) {
        b.x += b.vx;
        b.y += b.vy;
        b.vy += 0.0004;
        if (b.x < 0.05 || b.x > 0.95) b.vx *= -1;
        for (let r = 0; r < pegRows; r++) {
          const count = 9;
          for (let c = 0; c < count; c++) {
            const px = ((c + 0.5) / count) * w + (r % 2 === 0 ? 0 : (0.5 / count) * w);
            const py = 0.12 + (r / pegRows) * 0.65;
            const dx = b.x * w - px;
            const dy = b.y * h - py;
            if (Math.hypot(dx, dy) < 12) {
              b.vx += (dx > 0 ? 0.004 : -0.004) + (Math.random() - 0.5) * 0.008;
              b.vy = -Math.abs(b.vy) * 0.4;
            }
          }
        }
        ctx.beginPath();
        ctx.arc(b.x * w, b.y * h, 8, 0, Math.PI * 2);
        ctx.fillStyle = '#f472b6';
        ctx.fill();
        if (b.y > 0.85) {
          b.active = false;
          const slot = Math.min(MULTS.length - 1, Math.max(0, Math.floor(b.x * MULTS.length)));
          const gain = MULTS[slot];
          setLast(gain);
          setScore((s) => {
            const ns = s + gain;
            void reportScore(ns);
            saveState({ lastGain: gain });
            return ns;
          });
        }
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reportScore, saveState]);

  return (
    <GameShell
      gameId={GAME_ID}
      title="Plinko"
      actions={
        <div className="flex gap-4 text-sm">
          <span className="text-zinc-400">
            Total: <span className="text-white">{score}</span>
          </span>
          {last !== null && <span className="text-emerald-400">Last +{last}</span>}
          <button type="button" onClick={drop} className="rounded-lg bg-indigo-600 px-3 py-1 text-white">
            Drop
          </button>
        </div>
      }
    >
      <canvas ref={canvasRef} width={400} height={480} className="mx-auto w-full max-w-md rounded-xl border border-white/10" />
    </GameShell>
  );
}
