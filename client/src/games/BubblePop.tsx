import { useCallback, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';

const GAME_ID = 'bubble-pop';
const COLS = 8;
const ROWS = 10;
const COLORS = ['#f43f5e', '#eab308', '#22c55e', '#3b82f6', '#a855f7'];

type Grid = number[][];

function cluster(g: Grid, r: number, c: number, color: number): Set<string> {
  const seen = new Set<string>();
  const stack: [number, number][] = [[r, c]];
  while (stack.length) {
    const [y, x] = stack.pop()!;
    const k = `${y},${x}`;
    if (seen.has(k)) continue;
    if (y < 0 || x < 0 || y >= ROWS || x >= COLS) continue;
    if (g[y][x] !== color) continue;
    seen.add(k);
    stack.push([y + 1, x], [y - 1, x], [y, x + 1], [y, x - 1]);
  }
  return seen;
}

function drop(g: Grid): Grid {
  const next = g.map((row) => [...row]);
  for (let c = 0; c < COLS; c++) {
    const compact: number[] = [];
    for (let r = ROWS - 1; r >= 0; r--) {
      if (next[r][c] !== -1) compact.push(next[r][c]!);
    }
    while (compact.length < ROWS) compact.push(Math.floor(Math.random() * COLORS.length));
    for (let r = ROWS - 1; r >= 0; r--) {
      next[r][c] = compact[ROWS - 1 - r]!;
    }
  }
  return next;
}

const CHAIN_MS = 900;

export default function BubblePopGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const [grid, setGrid] = useState<Grid>(() =>
    Array.from({ length: ROWS }, () =>
      Array.from({ length: COLS }, () => Math.floor(Math.random() * COLORS.length))
    )
  );
  const [score, setScore] = useState(0);
  const [popping, setPopping] = useState<Set<string>>(new Set());
  const [chain, setChain] = useState(0);
  const chainTimer = useRef<number | null>(null);
  const streakRef = useRef(0);

  const bumpChain = useCallback(() => {
    if (chainTimer.current) window.clearTimeout(chainTimer.current);
    streakRef.current += 1;
    setChain(streakRef.current);
    chainTimer.current = window.setTimeout(() => {
      streakRef.current = 0;
      setChain(0);
    }, CHAIN_MS);
  }, []);

  const pop = useCallback(
    (r: number, c: number) => {
      const color = grid[r][c];
      const cl = cluster(grid, r, c, color);
      if (cl.size < 2) return;
      const chainBonus = Math.max(0, streakRef.current) * 12;
      bumpChain();
      setPopping(new Set(cl));
      window.setTimeout(() => setPopping(new Set()), 200);
      const next = grid.map((row) => [...row]);
      cl.forEach((k) => {
        const [y, x] = k.split(',').map(Number);
        next[y][x] = -1;
      });
      const dropped = drop(next);
      setGrid(dropped);
      const pts = cl.size * (cl.size + 5) + chainBonus;
      setScore((s) => {
        const ns = s + pts;
        void reportScore(ns);
        saveState({ score: ns });
        return ns;
      });
    },
    [grid, reportScore, saveState, bumpChain]
  );

  return (
    <GameShell
      gameId={GAME_ID}
      title="Bubble Pop"
      actions={
        <div className="flex flex-wrap items-center gap-2 text-xs font-bold text-slate-600 dark:text-slate-300 sm:text-sm">
          <span>
            Score: <span className="font-mono text-[#FF8A65]">{score}</span>
          </span>
          {chain > 1 && (
            <span className="rounded-full bg-gradient-to-r from-[#A78BFA] to-[#5DADE2] px-2 py-0.5 text-white shadow-sm">
              Chain ×{chain}
            </span>
          )}
        </div>
      }
    >
      <p className="mb-3 text-xs font-semibold text-slate-600 dark:text-slate-400 sm:text-sm">
        <strong className="text-[#FF6B6B]">Rules:</strong> tap a bubble that touches at least{' '}
        <strong>one more</strong> of the same color (groups of 2+). Pops score points.{' '}
        <strong>Chain pops</strong> (another group within about a second) add <strong>bonus</strong> points.
      </p>
      <div className="mx-auto inline-block rounded-2xl border-2 border-slate-200 bg-gradient-to-br from-[#EAF2FF] to-[#FFF4E6] p-1 dark:border-slate-600 dark:from-slate-900 dark:to-slate-800">
        {grid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => {
              const k = `${r},${c}`;
              const isPop = popping.has(k);
              return (
                <motion.button
                  key={`${r}-${c}`}
                  type="button"
                  onClick={() => pop(r, c)}
                  disabled={cell < 0}
                  animate={isPop ? { scale: [1, 1.35, 0.2], opacity: [1, 1, 0] } : { scale: 1, opacity: 1 }}
                  transition={{ duration: 0.2 }}
                  className="m-0.5 h-7 w-7 rounded-full border border-white/40 sm:h-8 sm:w-8"
                  style={{
                    background: cell < 0 ? 'transparent' : COLORS[cell],
                    boxShadow: cell >= 0 ? '0 4px 12px rgba(0,0,0,0.12)' : undefined,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>
    </GameShell>
  );
}
