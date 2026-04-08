import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { JumpButton } from '@/components/MobileGameControls';
import { useGameSession } from '@/hooks/useGameSession';
import { useGameSounds } from '@/hooks/useGameSounds';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { RotateCcw } from 'lucide-react';
import { poki } from '@/theme/pokiGameTheme';

const GAME_ID = 'endless-runner';

function drawRunner(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number, ph: number) {
  const cx = px + pw / 2;
  const headR = 8;
  const hy = py + headR + 2;
  const hg = ctx.createRadialGradient(cx - 2, hy - 2, 1, cx, hy, headR);
  hg.addColorStop(0, '#fef9c3');
  hg.addColorStop(0.4, '#fde047');
  hg.addColorStop(1, '#ca8a04');
  ctx.fillStyle = hg;
  ctx.beginPath();
  ctx.arc(cx, hy, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.5)';
  ctx.lineWidth = 2;
  ctx.stroke();
  const shirt = ctx.createLinearGradient(px, py + headR * 2, px + pw, py + ph);
  shirt.addColorStop(0, '#38bdf8');
  shirt.addColorStop(1, '#1d4ed8');
  ctx.strokeStyle = '#0c4a6e';
  ctx.lineWidth = 3.5;
  ctx.beginPath();
  ctx.moveTo(cx, py + headR * 2 + 2);
  ctx.lineTo(cx, py + ph - 10);
  ctx.stroke();
  ctx.strokeStyle = '#172554';
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, py + headR * 2 + 10);
  ctx.lineTo(px + 5, py + ph - 4);
  ctx.moveTo(cx, py + headR * 2 + 10);
  ctx.lineTo(px + pw - 5, py + ph - 4);
  ctx.stroke();
  ctx.fillStyle = shirt;
  ctx.fillRect(px + 6, py + headR * 2 + 4, pw - 12, ph - headR * 2 - 18);
  ctx.fillStyle = '#1e3a8a';
  ctx.fillRect(px + 4, py + ph - 9, 9, 6);
  ctx.fillRect(px + pw - 13, py + ph - 9, 9, 6);
}

function drawObstacle(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  const y = groundY - 28;
  const w = 24;
  const h = 28;
  const rg = ctx.createLinearGradient(x, y, x + w, y + h);
  rg.addColorStop(0, '#fb923c');
  rg.addColorStop(0.5, '#ea580c');
  rg.addColorStop(1, '#9a3412');
  ctx.fillStyle = rg;
  ctx.beginPath();
  ctx.moveTo(x + 4, y + h);
  ctx.lineTo(x + w - 4, y + h);
  ctx.lineTo(x + w - 2, y + 6);
  ctx.lineTo(x + w / 2, y);
  ctx.lineTo(x + 2, y + 6);
  ctx.closePath();
  ctx.fill();
  ctx.strokeStyle = 'rgba(255,255,255,0.35)';
  ctx.lineWidth = 2;
  ctx.stroke();
}

export default function EndlessRunnerGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const { playCrash, playJump } = useGameSounds();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [flash, setFlash] = useState(false);
  const scoreRef = useRef(0);
  scoreRef.current = score;
  const game = useRef({
    y: 0,
    vy: 0,
    grounded: true,
    obs: [] as { x: number }[],
    speed: 5,
    t: 0,
    alive: true,
  });

  const reset = useCallback(() => {
    game.current = { y: 0, vy: 0, grounded: true, obs: [], speed: 5, t: 0, alive: true };
    setScore(0);
    setOver(false);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const doJump = useCallback(() => {
    if (game.current.grounded && game.current.alive) {
      game.current.vy = -12;
      game.current.grounded = false;
      playJump();
    }
  }, [playJump]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.code === 'Space') {
        e.preventDefault();
        doJump();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [doJump]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const ground = h * 0.62;
      const g = game.current;
      if (!g.alive) {
        raf = requestAnimationFrame(loop);
        return;
      }
      g.t += 1;
      g.vy += 0.65;
      g.y += g.vy;
      if (g.y >= 0) {
        g.y = 0;
        g.vy = 0;
        g.grounded = true;
      }
      g.speed += 0.0008;
      if (g.t % 90 === 0) g.obs.push({ x: w + 30 });
      g.obs = g.obs.filter((o) => o.x > -40);
      const px = 60;
      const pw = 40;
      const ph = 40;
      /* Feet on the ground line: py is top of sprite, so baseline ≈ py + ph (g.y ≤ 0 = jump upward). */
      const py = ground - ph + g.y;
      for (const o of g.obs) {
        o.x -= g.speed;
        if (o.x < px + pw && o.x + 20 > px && py + ph > ground - 24 && py < ground) {
          g.alive = false;
          playCrash();
          setFlash(true);
          window.setTimeout(() => setFlash(false), 150);
          setOver(true);
          void reportScore(scoreRef.current);
          saveState({ crashed: true }, { status: 'completed' });
        }
      }
      if (g.t % 12 === 0) {
        setScore((s) => {
          const ns = s + 1;
          saveState({ score: ns });
          return ns;
        });
      }
      const sky = ctx.createLinearGradient(0, 0, 0, ground);
      sky.addColorStop(0, '#7dd3fc');
      sky.addColorStop(0.55, '#bae6fd');
      sky.addColorStop(1, '#e0f2fe');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, ground);
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      for (let i = 0; i < 4; i++) {
        const cx = ((g.t * 0.4 + i * 140) % (w + 80)) - 40;
        const cy = 28 + (i % 3) * 22;
        ctx.beginPath();
        ctx.ellipse(cx, cy, 28, 14, 0, 0, Math.PI * 2);
        ctx.fill();
      }
      const grass = ctx.createLinearGradient(0, ground, 0, h);
      grass.addColorStop(0, '#4ade80');
      grass.addColorStop(1, '#166534');
      ctx.fillStyle = grass;
      ctx.fillRect(0, ground, w, h - ground);
      ctx.fillStyle = '#15803d';
      ctx.fillRect(0, ground, w, 5);
      ctx.fillStyle = 'rgba(255,255,255,0.15)';
      for (let x = (g.t * 2) % 40; x < w + 40; x += 40) {
        ctx.fillRect(x - 40, ground + 8, 18, 3);
      }
      for (const o of g.obs) drawObstacle(ctx, o.x, ground);
      drawRunner(ctx, px, py, pw, ph);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reportScore, saveState, playCrash]);

  return (
    <GameShell
      gameId={GAME_ID}
      title="Endless Runner"
      hud={
        <span className={poki.hudStat}>
          Score <span className="text-[#FF8A65]">{score}</span>
        </span>
      }
      actions={
        <PlayfulButton variant="secondary" className="!rounded-2xl !py-2.5 !px-6 !text-sm" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Restart
        </PlayfulButton>
      }
      resultModal={
        over
          ? {
              open: true,
              kind: 'lose',
              title: 'You Lost',
              message: 'You crashed into an obstacle.',
              score,
              onPlayAgain: () => reset(),
            }
          : undefined
      }
    >
      <motion.div
        animate={flash ? { x: [-5, 5, -5, 5, 0] } : {}}
        transition={{ duration: 0.18 }}
        className={`mx-auto w-full max-w-lg rounded-2xl border-2 ${flash ? 'border-red-400' : 'border-slate-200 dark:border-slate-600'}`}
      >
        <canvas
          ref={canvasRef}
          width={480}
          height={280}
          role="application"
          aria-label="Runner — tap to jump"
          className="game-canvas w-full max-w-full touch-manipulation rounded-xl"
          onPointerDown={(e) => {
            e.preventDefault();
            doJump();
          }}
        />
      </motion.div>
      <JumpButton onJump={doJump} className="mt-3 md:hidden" />
    </GameShell>
  );
}
