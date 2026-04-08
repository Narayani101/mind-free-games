import { useCallback, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';
import { useGameSounds } from '@/hooks/useGameSounds';
import { confettiMatchBurst } from '@/utils/gameFx';
import { poki } from '@/theme/pokiGameTheme';

const GAME_ID = 'match-3';
const N = 8;
const TYPES = 6;

const CANDY_IMG = ['🍬', '🍭', '🍩', '🧁', '🍪', '🍫'];

function gen(): number[][] {
  return Array.from({ length: N }, () =>
    Array.from({ length: N }, () => Math.floor(Math.random() * TYPES))
  );
}

function findMatches(g: number[][]) {
  const clear = new Set<string>();
  for (let r = 0; r < N; r++) {
    for (let c = 0; c < N - 2; c++) {
      if (g[r][c] === g[r][c + 1] && g[r][c] === g[r][c + 2]) {
        clear.add(`${r},${c}`);
        clear.add(`${r},${c + 1}`);
        clear.add(`${r},${c + 2}`);
      }
    }
  }
  for (let c = 0; c < N; c++) {
    for (let r = 0; r < N - 2; r++) {
      if (g[r][c] === g[r + 1][c] && g[r][c] === g[r + 2][c]) {
        clear.add(`${r},${c}`);
        clear.add(`${r + 1},${c}`);
        clear.add(`${r + 2},${c}`);
      }
    }
  }
  return clear;
}

const colors = ['#f43f5e', '#eab308', '#22c55e', '#3b82f6', '#a855f7', '#f97316'];

export default function Match3Game() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const { playMatch } = useGameSounds();
  const [grid, setGrid] = useState(() => gen());
  const [picked, setPicked] = useState<{ r: number; c: number } | null>(null);
  const [score, setScore] = useState(0);
  const [swapPair, setSwapPair] = useState<{ a: { r: number; c: number }; b: { r: number; c: number } } | null>(
    null
  );
  const [popCells, setPopCells] = useState<Set<string>>(new Set());
  const [floatScore, setFloatScore] = useState<{ id: number; pts: number; x: number; y: number } | null>(null);
  const floatId = useRef(0);

  const resolve = useCallback(
    (g: number[][]) => {
      let cur = g.map((row) => [...row]);
      let total = 0;
      for (let iter = 0; iter < 20; iter++) {
        const m = findMatches(cur);
        if (!m.size) break;
        total += m.size * 10;
        setPopCells(new Set(m));
        window.setTimeout(() => setPopCells(new Set()), 280);
        m.forEach((k) => {
          const [r, c] = k.split(',').map(Number);
          cur[r]![c] = -1;
        });
        for (let c = 0; c < N; c++) {
          for (let r = N - 1; r >= 0; r--) {
            if (cur[r][c] === -1) {
              let rr = r;
              while (rr >= 0 && cur[rr][c] === -1) rr--;
              if (rr >= 0) {
                cur[r][c] = cur[rr][c]!;
                cur[rr][c] = -1;
              }
            }
          }
          for (let r = 0; r < N; r++) {
            if (cur[r][c] === -1) cur[r][c] = Math.floor(Math.random() * TYPES);
          }
        }
      }
      setGrid(cur);
      if (total) {
        playMatch();
        void confettiMatchBurst();
        setScore((s) => {
          const ns = s + total;
          void reportScore(ns);
          saveState({ score: ns });
          return ns;
        });
        floatId.current += 1;
        setFloatScore({ id: floatId.current, pts: total, x: 50, y: 42 });
        window.setTimeout(() => setFloatScore(null), 900);
      }
    },
    [reportScore, saveState, playMatch]
  );

  const tap = (r: number, c: number) => {
    if (!picked) {
      setPicked({ r, c });
      return;
    }
    const dr = Math.abs(picked.r - r);
    const dc = Math.abs(picked.c - c);
    if (dr + dc !== 1) {
      setPicked(null);
      return;
    }
    const next = grid.map((row) => [...row]);
    setSwapPair({ a: picked, b: { r, c } });
    window.setTimeout(() => setSwapPair(null), 220);
    [next[picked.r][picked.c], next[r][c]] = [next[r][c], next[picked.r][picked.c]];
    setPicked(null);
    setGrid(next);
    resolve(next);
  };

  return (
    <GameShell
      gameId={GAME_ID}
      title="Match-3"
      hud={
        <>
          <span className={poki.hudStat}>
            Score <span className="text-[#22C55E]">{score}</span>
          </span>
          <span className={poki.hudStat}>8×8 grid</span>
        </>
      }
    >
      <div className="relative mx-auto inline-block">
        <AnimatePresence>
          {floatScore && (
            <motion.div
              key={floatScore.id}
              initial={{ opacity: 0, y: 8, scale: 0.85 }}
              animate={{ opacity: 1, y: -28, scale: 1.1 }}
              exit={{ opacity: 0 }}
              className="pointer-events-none absolute left-1/2 z-20 -translate-x-1/2 text-lg font-black text-[#22C55E] drop-shadow-md"
              style={{ top: `${floatScore.y}%` }}
            >
              +{floatScore.pts}
            </motion.div>
          )}
        </AnimatePresence>
        <div className="inline-block rounded-[20px] border-2 border-white/80 bg-gradient-to-br from-[#fff7ed] via-[#fce7f3] to-[#e0f2fe] p-2 shadow-[0_12px_40px_rgba(99,102,241,0.15)] dark:border-slate-600 dark:from-slate-900 dark:via-slate-900 dark:to-slate-800">
          {grid.map((row, r) => (
            <div key={r} className="flex">
              {row.map((cell, c) => {
                const isPick = picked?.r === r && picked?.c === c;
                const isSwap =
                  swapPair &&
                  ((swapPair.a.r === r && swapPair.a.c === c) || (swapPair.b.r === r && swapPair.b.c === c));
                const k = `${r},${c}`;
                const popping = popCells.has(k);
                return (
                  <motion.button
                    key={`${r}-${c}`}
                    type="button"
                    layout
                    animate={
                      isSwap
                        ? { scale: [1, 1.12, 1], rotate: [0, -4, 4, 0] }
                        : popping
                          ? { scale: [1, 1.25, 0], opacity: [1, 1, 0] }
                          : { scale: 1, opacity: 1 }
                    }
                    transition={{ duration: popping ? 0.25 : 0.22 }}
                    onClick={() => tap(r, c)}
                    className={`m-0.5 flex h-9 w-9 items-center justify-center rounded-2xl border-2 border-white/90 text-lg shadow-[0_6px_14px_rgba(15,23,42,0.12)] transition-shadow sm:h-10 sm:w-10 ${
                      isPick ? 'ring-2 ring-[#FF8A65] ring-offset-2 ring-offset-white dark:ring-[#38BDF8] dark:ring-offset-slate-900' : ''
                    }`}
                    style={{
                      background: `radial-gradient(circle at 30% 28%, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.35) 18%, ${colors[cell % TYPES]} 45%, ${colors[cell % TYPES]} 100%)`,
                      boxShadow: 'inset 0 -4px 8px rgba(0,0,0,0.12), inset 0 2px 6px rgba(255,255,255,0.35)',
                    }}
                  >
                    <span className="select-none drop-shadow-md">{CANDY_IMG[cell % TYPES]}</span>
                  </motion.button>
                );
              })}
            </div>
          ))}
        </div>
      </div>
    </GameShell>
  );
}
