import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { JumpButton } from '@/components/MobileGameControls';
import { useGameSession } from '@/hooks/useGameSession';
import { useGameSounds } from '@/hooks/useGameSounds';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { RotateCcw } from 'lucide-react';

const GAME_ID = 'endless-runner';

function drawRunner(ctx: CanvasRenderingContext2D, px: number, py: number, pw: number, ph: number) {
  const cx = px + pw / 2;
  const headR = 7;
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.arc(cx, py + headR + 2, headR, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#0ea5e9';
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.strokeStyle = '#0c4a6e';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.moveTo(cx, py + headR * 2 + 2);
  ctx.lineTo(cx, py + ph - 10);
  ctx.stroke();
  ctx.lineWidth = 4;
  ctx.beginPath();
  ctx.moveTo(cx, py + headR * 2 + 10);
  ctx.lineTo(px + 6, py + ph - 4);
  ctx.moveTo(cx, py + headR * 2 + 10);
  ctx.lineTo(px + pw - 6, py + ph - 4);
  ctx.stroke();
  ctx.fillStyle = '#0369a1';
  ctx.fillRect(px + 4, py + ph - 8, 8, 5);
  ctx.fillRect(px + pw - 12, py + ph - 8, 8, 5);
}

function drawObstacle(ctx: CanvasRenderingContext2D, x: number, groundY: number) {
  const y = groundY - 26;
  ctx.fillStyle = '#c2410c';
  ctx.fillRect(x, y, 22, 26);
  ctx.strokeStyle = '#7c2d12';
  ctx.lineWidth = 2;
  ctx.strokeRect(x + 1, y + 1, 20, 24);
}

export default function EndlessRunnerGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const { playCrash } = useGameSounds();
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
    }
  }, []);

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
      const py = ground + g.y;
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
      sky.addColorStop(0, '#e0f2fe');
      sky.addColorStop(1, '#bae6fd');
      ctx.fillStyle = sky;
      ctx.fillRect(0, 0, w, ground);
      ctx.fillStyle = '#86efac';
      ctx.fillRect(0, ground, w, h - ground);
      ctx.fillStyle = '#22c55e';
      ctx.fillRect(0, ground, w, 4);
      drawRunner(ctx, px, py, pw, ph);
      ctx.fillStyle = '#f97316';
      for (const o of g.obs) drawObstacle(ctx, o.x, ground);
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reportScore, saveState, playCrash]);

  return (
    <GameShell
      gameId={GAME_ID}
      title="Endless Runner"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Score: <span className="text-[#FF8A65]">{score}</span>
          </span>
          <PlayfulButton variant="secondary" className="!py-2 !px-5 !text-sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            Restart
          </PlayfulButton>
        </div>
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
      <p className="mb-2 text-center text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-sm">
        Space, tap game, or Jump — avoid orange blocks.
      </p>
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
