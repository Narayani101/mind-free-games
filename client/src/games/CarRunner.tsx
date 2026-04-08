import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { GameResultModal } from '@/components/GameResultModal';
import { LaneNudge } from '@/components/MobileGameControls';
import { useGameSession } from '@/hooks/useGameSession';
import { useGameSounds } from '@/hooks/useGameSounds';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { RotateCcw } from 'lucide-react';
import { drawRoadScene, drawStylizedCar } from '@/games/canvas/pokiCanvasDraw';
import { confettiSpark } from '@/utils/gameFx';
import { poki } from '@/theme/pokiGameTheme';

const GAME_ID = 'car-runner';
const LANES = 3;
const MAX_CRASHES = 3;

export default function CarRunnerGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const { playCrash } = useGameSounds();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [score, setScore] = useState(0);
  const [over, setOver] = useState(false);
  const [crashTotal, setCrashTotal] = useState(0);
  const [flash, setFlash] = useState(false);
  const [warnOpen, setWarnOpen] = useState(false);
  const [goOpen, setGoOpen] = useState(false);
  const [remainingLives, setRemainingLives] = useState(MAX_CRASHES);
  const scoreRef = useRef(0);
  scoreRef.current = score;
  const game = useRef({
    lane: 1,
    cars: [] as { y: number; lane: number }[],
    t: 0,
    speed: 4,
    alive: true,
    crashes: 0,
    invuln: 0,
    roadScroll: 0,
  });

  const reset = useCallback(() => {
    game.current = {
      lane: 1,
      cars: [],
      t: 0,
      speed: 4,
      alive: true,
      crashes: 0,
      invuln: 0,
      roadScroll: 0,
    };
    setScore(0);
    setOver(false);
    setCrashTotal(0);
    setWarnOpen(false);
    setGoOpen(false);
    setRemainingLives(MAX_CRASHES);
  }, []);

  useEffect(() => {
    reset();
  }, [reset]);

  const nudgeLeft = useCallback(() => {
    if (!game.current.alive) return;
    game.current.lane = Math.max(0, game.current.lane - 1);
  }, []);
  const nudgeRight = useCallback(() => {
    if (!game.current.alive) return;
    game.current.lane = Math.min(LANES - 1, game.current.lane + 1);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!game.current.alive) return;
      if (e.key === 'ArrowLeft') nudgeLeft();
      if (e.key === 'ArrowRight') nudgeRight();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [nudgeLeft, nudgeRight]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    let raf = 0;
    const loop = () => {
      const w = canvas.width;
      const h = canvas.height;
      const g = game.current;
      g.t += 1;
      g.speed += 0.0005;
      if (g.t % 55 === 0) {
        g.cars.push({ y: -40, lane: Math.floor(Math.random() * LANES) });
      }
      g.cars.forEach((c) => {
        c.y += g.speed;
      });
      g.cars = g.cars.filter((c) => c.y < h + 40);
      const px = (w / LANES) * (g.lane + 0.5) - 20;
      const py = h - 70;
      if (g.invuln > 0) g.invuln -= 1;
      if (g.alive && g.invuln === 0) {
        for (let idx = 0; idx < g.cars.length; idx++) {
          const c = g.cars[idx];
          if (c.lane === g.lane && c.y + 40 > py && c.y < py + 40) {
            playCrash();
            const rect = canvas.getBoundingClientRect();
            void confettiSpark({
              x: (rect.left + rect.width / 2) / window.innerWidth,
              y: (rect.top + rect.height * 0.55) / window.innerHeight,
            });
            setFlash(true);
            window.setTimeout(() => setFlash(false), 120);
            g.crashes += 1;
            setCrashTotal(g.crashes);
            const left = Math.max(0, MAX_CRASHES - g.crashes);
            setRemainingLives(left);
            c.y = h + 999;
            g.invuln = 45;
            if (g.crashes >= MAX_CRASHES) {
              g.alive = false;
              setOver(true);
              setWarnOpen(false);
              setGoOpen(true);
              void reportScore(scoreRef.current);
              saveState({ crashed: true, crashes: g.crashes }, { status: 'completed' });
            } else {
              setWarnOpen(true);
            }
            break;
          }
        }
      }
      if (g.alive && g.t % 15 === 0) {
        setScore((s) => {
          const ns = s + 1;
          saveState({ score: ns });
          return ns;
        });
      }
      g.roadScroll += g.speed * 1.15;
      drawRoadScene(ctx, w, h, g.roadScroll, LANES);
      drawStylizedCar(ctx, px, py, 40, 40, '#ca8a04', '#fde047');
      if (g.invuln > 0 && g.t % 6 < 3) {
        ctx.save();
        ctx.globalAlpha = 0.45;
        drawStylizedCar(ctx, px, py, 40, 40, '#ca8a04', '#fde047');
        ctx.restore();
      }
      for (const c of g.cars) {
        const cx = (w / LANES) * (c.lane + 0.5) - 20;
        drawStylizedCar(ctx, cx, c.y, 40, 40, '#dc2626', '#991b1b');
      }
      raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [reportScore, saveState, playCrash]);

  return (
    <GameShell
      gameId={GAME_ID}
      title="Car Runner"
      hud={
        <>
          <span className={poki.hudStat}>
            Score <span className="text-[#FF8A65]">{score}</span>
          </span>
          <span className={poki.hudStat}>
            Lives <span className="text-[#5DADE2]">{remainingLives}</span>
          </span>
          <span className={poki.hudStat}>
            Crashes <span className="text-slate-500 dark:text-slate-400">{crashTotal}</span>
          </span>
        </>
      }
      actions={
        <PlayfulButton variant="secondary" className="!rounded-2xl !py-2.5 !px-6 !text-sm" onClick={reset}>
          <RotateCcw className="h-4 w-4" />
          Restart
        </PlayfulButton>
      }
    >
      <motion.div
        animate={flash ? { x: [-6, 6, -6, 6, 0] } : {}}
        transition={{ duration: 0.2 }}
        className={`mx-auto w-full max-w-lg rounded-2xl border-2 ${flash ? 'border-red-500 bg-red-100 dark:bg-red-950/40' : 'border-slate-200 dark:border-slate-600'}`}
      >
        <canvas
          ref={canvasRef}
          width={420}
          height={320}
          className="game-canvas w-full max-w-full touch-none rounded-xl"
        />
      </motion.div>
      <LaneNudge onLeft={nudgeLeft} onRight={nudgeRight} className="mt-3 md:hidden" />
      {!over && (
        <GameResultModal
          open={warnOpen}
          kind="warning"
          title="Crash!"
          message="Watch the lanes — you are invulnerable for a moment."
          detail={`Remaining lives: ${remainingLives}`}
          continueLabel="Keep driving"
          onContinue={() => setWarnOpen(false)}
          onClose={() => setWarnOpen(false)}
        />
      )}
      <GameResultModal
        open={goOpen}
        kind="gameover"
        title="Game Over"
        message="Too many crashes!"
        detail="💥 You used all your lives."
        score={score}
        onPlayAgain={() => {
          setGoOpen(false);
          reset();
        }}
        onClose={() => setGoOpen(false)}
      />
    </GameShell>
  );
}
