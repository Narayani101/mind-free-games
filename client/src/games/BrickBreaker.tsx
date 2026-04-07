import { useCallback, useEffect, useRef, useState } from 'react';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';
import { PlayfulButton } from '@/components/ui/PlayfulButton';

const GAME_ID = 'brick-breaker';

export default function BrickBreakerGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [ui, setUi] = useState({ score: 0, lives: 3, won: false, lost: false });
  const scoreRef = useRef(0);
  const game = useRef({
    paddle: 0.4,
    ball: { x: 0.5, y: 0.85, vx: 0.014, vy: -0.02 },
    bricks: [] as boolean[],
    cols: 8,
    rows: 5,
    running: true,
    reportedWin: false,
  });

  const syncScore = useCallback(() => {
    saveState({ score: scoreRef.current });
  }, [saveState]);

  const reset = useCallback(() => {
    const g = game.current;
    g.rows = 5;
    g.cols = 8;
    g.bricks = Array(g.rows * g.cols).fill(true);
    g.paddle = 0.4;
    g.ball = { x: 0.5, y: 0.85, vx: 0.014, vy: -0.02 };
    g.running = true;
    g.reportedWin = false;
    scoreRef.current = 0;
    setUi({ score: 0, lives: 3, won: false, lost: false });
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const step = () => {
      const g = game.current;
      const w = canvas.width;
      const h = canvas.height;
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(0, 0, w, h);
      if (g.running) {
        g.ball.x += g.ball.vx;
        g.ball.y += g.ball.vy;
        if (g.ball.x < 0.02 || g.ball.x > 0.98) g.ball.vx *= -1;
        if (g.ball.y < 0.05) g.ball.vy *= -1;
        const px = g.paddle;
        if (g.ball.y > 0.88 && g.ball.y < 0.94 && g.ball.x > px && g.ball.x < px + 0.2) {
          g.ball.vy = -Math.abs(g.ball.vy);
          g.ball.vx += (g.ball.x - (px + 0.1)) * 0.05;
        }
        if (g.ball.y > 1) {
          g.running = false;
          setUi((prev) => {
            const lives = prev.lives - 1;
            if (lives <= 0) {
              void reportScore(scoreRef.current);
              saveState({ done: true }, { status: 'completed' });
              return { ...prev, lives: 0, lost: true };
            }
            g.ball = { x: 0.5, y: 0.85, vx: 0.014, vy: -0.02 };
            g.running = true;
            return { ...prev, lives };
          });
        }
        const bw = 1 / g.cols;
        const bh = 0.06;
        const top = 0.08;
        for (let r = 0; r < g.rows; r++) {
          for (let c = 0; c < g.cols; c++) {
            const idx = r * g.cols + c;
            if (!g.bricks[idx]) continue;
            const bx = c * bw + 0.02;
            const by = top + r * bh;
            if (
              g.ball.x > bx &&
              g.ball.x < bx + bw - 0.04 &&
              g.ball.y > by &&
              g.ball.y < by + bh * 0.8
            ) {
              g.bricks[idx] = false;
              g.ball.vy *= -1;
              scoreRef.current += 15;
              setUi((prev) => ({ ...prev, score: scoreRef.current }));
              syncScore();
            }
            ctx.fillStyle = `hsl(${(r * g.cols + c) * 20}, 70%, 55%)`;
            ctx.fillRect(bx * w, by * h, (bw - 0.02) * w, bh * h * 0.7);
          }
        }
      }
      ctx.fillStyle = '#6366f1';
      ctx.fillRect(game.current.paddle * w, 0.92 * h, 0.2 * w, 0.02 * h);
      ctx.beginPath();
      ctx.arc(game.current.ball.x * w, game.current.ball.y * h, 6, 0, Math.PI * 2);
      ctx.fillStyle = '#f8fafc';
      ctx.fill();
      if (game.current.bricks.every((b) => !b) && !game.current.reportedWin) {
        game.current.reportedWin = true;
        game.current.running = false;
        void reportScore(scoreRef.current + 500);
        saveState({ cleared: true }, { status: 'completed' });
        setUi((s) => ({ ...s, won: true }));
      }
      raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
    return () => cancelAnimationFrame(raf);
  }, [reportScore, saveState, syncScore, reset]);

  useEffect(() => {
    const onMove = (e: MouseEvent) => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const r = canvas.getBoundingClientRect();
      const x = (e.clientX - r.left) / r.width;
      game.current.paddle = Math.min(0.78, Math.max(0.02, x - 0.1));
    };
    window.addEventListener('mousemove', onMove);
    return () => window.removeEventListener('mousemove', onMove);
  }, []);

  return (
    <GameShell
      gameId={GAME_ID}
      title="Brick Breaker"
      actions={
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
          <span>
            Score: <span className="font-mono text-[#5DADE2] dark:text-[#38BDF8]">{ui.score}</span>
          </span>
          <span>Lives: {ui.lives}</span>
          <PlayfulButton variant="secondary" className="!py-2 !px-4 !text-sm" type="button" onClick={reset}>
            Reset
          </PlayfulButton>
        </div>
      }
      resultModal={
        ui.won
          ? {
              open: true,
              kind: 'win',
              title: 'You Win!',
              message: 'Every brick is cleared.',
              score: ui.score + 500,
              onPlayAgain: () => reset(),
            }
          : ui.lost
            ? {
                open: true,
                kind: 'lose',
                title: 'You Lost',
                message: 'The ball slipped past your paddle too many times.',
                score: ui.score,
                onPlayAgain: () => reset(),
              }
            : undefined
      }
    >
      <p className="mb-2 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
        Move the mouse to steer the paddle.
      </p>
      <canvas
        ref={canvasRef}
        width={480}
        height={360}
        className="game-canvas mx-auto w-full max-w-lg rounded-xl border-2 border-slate-200 bg-slate-950 dark:border-slate-600"
      />
    </GameShell>
  );
}
