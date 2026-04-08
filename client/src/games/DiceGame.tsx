import { useEffect, useRef, useState } from 'react';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';
import { useGameSounds } from '@/hooks/useGameSounds';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { Dice5 } from 'lucide-react';
import { motion } from 'framer-motion';
import { poki } from '@/theme/pokiGameTheme';
import { confettiCelebration } from '@/utils/gameFx';

const GAME_ID = 'dice-game';
const ROUNDS = 5;

/** 1-based face value 1..6 */
const PIP_LAYOUT: Record<number, [number, number][]> = {
  1: [[50, 50]],
  2: [
    [30, 30],
    [70, 70],
  ],
  3: [
    [30, 30],
    [50, 50],
    [70, 70],
  ],
  4: [
    [30, 30],
    [70, 30],
    [30, 70],
    [70, 70],
  ],
  5: [
    [30, 30],
    [70, 30],
    [50, 50],
    [30, 70],
    [70, 70],
  ],
  6: [
    [30, 28],
    [70, 28],
    [30, 50],
    [70, 50],
    [30, 72],
    [70, 72],
  ],
};

function DiceFace({ value, rolling }: { value: number; rolling: boolean }) {
  const pips = PIP_LAYOUT[value] ?? [[50, 50]];

  return (
    <motion.svg
      width={100}
      height={100}
      viewBox="0 0 100 100"
      className="drop-shadow-xl"
      animate={
        rolling
          ? { rotateX: [0, 360, 720], rotateY: [0, -180, -360], scale: [1, 0.92, 1] }
          : { rotateX: 12, rotateY: -18, scale: 1 }
      }
      transition={rolling ? { repeat: Infinity, duration: 0.35, ease: 'linear' } : { type: 'spring', stiffness: 120 }}
      style={{ transformStyle: 'preserve-3d' }}
    >
      <defs>
        <linearGradient id="diceBody" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#f8fafc" />
          <stop offset="50%" stopColor="#e2e8f0" />
          <stop offset="100%" stopColor="#cbd5e1" />
        </linearGradient>
        <linearGradient id="pipGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#1e293b" />
          <stop offset="100%" stopColor="#0f172a" />
        </linearGradient>
      </defs>
      <rect
        x="8"
        y="8"
        width="84"
        height="84"
        rx="14"
        fill="url(#diceBody)"
        stroke="#94a3b8"
        strokeWidth="3"
      />
      {pips.map(([cx, cy], i) => (
        <circle key={i} cx={cx} cy={cy} r="7" fill="url(#pipGrad)" />
      ))}
    </motion.svg>
  );
}

export default function DiceGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const { playDice, playWin } = useGameSounds();
  const [rolls, setRolls] = useState(0);
  const [total, setTotal] = useState(0);
  const [target, setTarget] = useState(() => 15 + Math.floor(Math.random() * 10));
  const [last, setLast] = useState<number | null>(null);
  const [done, setDone] = useState(false);
  const [rolling, setRolling] = useState(false);
  const [faceA, setFaceA] = useState(1);
  const [faceB, setFaceB] = useState(1);
  const [summary, setSummary] = useState<{ pts: number; win: boolean } | null>(null);
  const timerRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timerRef.current !== null) window.clearInterval(timerRef.current);
    },
    []
  );

  const roll = () => {
    if (done || rolls >= ROUNDS || rolling) return;
    setRolling(true);
    playDice();
    let ticks = 0;
    timerRef.current = window.setInterval(() => {
      ticks += 1;
      setFaceA(1 + Math.floor(Math.random() * 6));
      setFaceB(1 + Math.floor(Math.random() * 6));
      if (ticks > 16) {
        if (timerRef.current !== null) window.clearInterval(timerRef.current);
        const a = 1 + Math.floor(Math.random() * 6);
        const b = 1 + Math.floor(Math.random() * 6);
        setFaceA(a);
        setFaceB(b);
        const sum = a + b;
        setLast(sum);
        const nextTotal = total + sum;
        const nextRolls = rolls + 1;
        setTotal(nextTotal);
        setRolls(nextRolls);
        saveState({ rolls: nextRolls, total: nextTotal });
        setRolling(false);
        if (nextRolls >= ROUNDS) {
          const win = nextTotal >= target;
          const pts = win ? 200 + Math.max(0, nextTotal - target) * 5 : Math.max(0, nextTotal);
          void reportScore(pts);
          saveState({ done: true, win }, { status: 'completed' });
          setDone(true);
          setSummary({ pts, win });
          if (win) {
            playWin();
            void confettiCelebration(0.5);
          }
        }
      }
    }, 42);
  };

  const resetRound = () => {
    setRolls(0);
    setTotal(0);
    setLast(null);
    setDone(false);
    setSummary(null);
    setFaceA(1);
    setFaceB(1);
    setTarget(15 + Math.floor(Math.random() * 10));
  };

  return (
    <GameShell
      gameId={GAME_ID}
      title="Dice Game"
      hud={
        <>
          <span className={poki.hudStat}>
            Rolls <span className="text-[#5DADE2]">{Math.min(rolls, ROUNDS)}/{ROUNDS}</span>
          </span>
          <span className={poki.hudStat}>
            Target <span className="text-[#FF8A65]">{target}</span>
          </span>
          <span className={poki.hudStat}>
            Total <span className="font-mono text-slate-800 dark:text-white">{total}</span>
          </span>
        </>
      }
      resultModal={
        summary
          ? {
              open: true,
              kind: summary.win ? 'win' : 'lose',
              title: summary.win ? 'You Win!' : 'You Lost',
              message: summary.win
                ? `You beat the target of ${target} with a total of ${total}.`
                : `Your total was ${total}. Target was ${target}.`,
              score: summary.pts,
              onPlayAgain: () => resetRound(),
            }
          : undefined
      }
    >
      <div className="mb-6 flex flex-wrap items-center justify-center gap-8 perspective-[800px]">
        <DiceFace value={faceA} rolling={rolling} />
        <DiceFace value={faceB} rolling={rolling} />
      </div>
      <p className="mb-6 text-center text-2xl font-mono font-bold text-slate-800 dark:text-[#E2E8F0]">
        Total: {total}
      </p>
      <div className="flex justify-center">
        <PlayfulButton disabled={done || rolls >= ROUNDS || rolling} onClick={roll}>
          <Dice5 className="h-6 w-6" />
          {rolling ? 'Rolling…' : done ? 'Done' : 'Roll'}
        </PlayfulButton>
      </div>
      {last !== null && !rolling && (
        <p className="mt-6 text-center text-lg font-bold text-[#5DADE2] dark:text-[#38BDF8]">Last roll: {last}</p>
      )}
    </GameShell>
  );
}
