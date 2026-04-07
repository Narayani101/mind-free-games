import { useCallback, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';

/**
 * Tube array: index 0 = TOP of tube (mouth), last index = BOTTOM.
 * Move: take from top with shift(), place on destination top with unshift().
 * Destination must be empty OR top ball (dst[0]) matches moving color.
 */
const GAME_ID = 'magic-sort';
const COLORS = ['#f43f5e', '#eab308', '#22c55e', '#3b82f6'];
const CAP = 4;

type Tubes = number[][];

function solved(tubes: Tubes) {
  return tubes.every((t) => {
    if (t.length === 0) return true;
    const topColor = t[0];
    return t.every((x) => x === topColor);
  });
}

/** Same puzzle as before, stored top → bottom (mouth at index 0). */
const INITIAL: Tubes = [
  [0, 0, 1, 1],
  [2, 2, 3, 3],
  [1, 3, 0, 2],
  [],
  [],
];

export default function MagicSortGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const [tubes, setTubes] = useState<Tubes>(() => INITIAL.map((t) => [...t]));
  const [from, setFrom] = useState<number | null>(null);
  const [moves, setMoves] = useState(0);
  const [won, setWon] = useState(false);

  const tap = useCallback(
    (i: number) => {
      if (won) return;
      if (from === null) {
        if (tubes[i]!.length > 0) setFrom(i);
        return;
      }
      if (from === i) {
        setFrom(null);
        return;
      }
      const src = [...tubes[from]!];
      const dst = [...tubes[i]!];
      if (src.length === 0 || dst.length >= CAP) {
        setFrom(null);
        return;
      }
      const ball = src.shift()!;
      if (dst.length > 0 && dst[0] !== ball) {
        setFrom(null);
        return;
      }
      dst.unshift(ball);
      const next = tubes.map((t, idx) => {
        if (idx === from) return src;
        if (idx === i) return dst;
        return t;
      });
      setTubes(next);
      setFrom(null);
      const mv = moves + 1;
      setMoves(mv);
      saveState({ tubes: next, moves: mv });
      if (solved(next)) {
        setWon(true);
        const pts = Math.max(100, 500 - mv * 5);
        void reportScore(pts);
        saveState({ done: true }, { status: 'completed' });
      }
    },
    [from, tubes, moves, reportScore, saveState, won]
  );

  const reset = useCallback(() => {
    setTubes(INITIAL.map((t) => [...t]));
    setFrom(null);
    setMoves(0);
    setWon(false);
  }, []);

  return (
    <GameShell
      gameId={GAME_ID}
      title="Magic Sort"
      actions={<span className="text-sm font-bold text-slate-600 dark:text-slate-300">Moves: {moves}</span>}
      resultModal={
        won
          ? {
              open: true,
              kind: 'win',
              title: 'You Win!',
              message: 'Every tube is one color — perfect sort.',
              score: Math.max(100, 500 - moves * 5),
              onPlayAgain: () => {
                reset();
              },
            }
          : undefined
      }
    >
      <p className="mb-4 text-xs font-semibold text-slate-600 dark:text-slate-400 sm:text-sm">
        The <strong>top</strong> of each tube is the <strong>mouth</strong> (first ball you move). Tap a tube to pick
        the top ball, then another tube to drop it on top. Only the same color can stack. Empty tubes accept any
        color.
      </p>
      <div className="flex flex-wrap justify-center gap-3">
        {tubes.map((tube, i) => (
          <button
            key={i}
            type="button"
            onClick={() => tap(i)}
            className={`relative flex h-52 w-[4.75rem] flex-col overflow-hidden rounded-b-3xl rounded-t-2xl border-2 border-slate-300 bg-gradient-to-b from-[#EAF2FF] to-white p-1 shadow-[0_8px_24px_rgba(0,0,0,0.08)] transition hover:border-[#5DADE2] dark:border-slate-600 dark:from-[#1E293B] dark:to-[#0F172A] dark:hover:border-[#38BDF8] ${
              from === i ? 'ring-4 ring-[#FFD93D] ring-offset-2 dark:ring-offset-slate-900' : ''
            }`}
          >
            <div className="flex min-h-0 flex-1 flex-col items-center gap-0.5 pt-1">
              <AnimatePresence initial={false}>
                {tube.map((ball, j) => (
                  <motion.div
                    key={`${i}-${j}`}
                    layout
                    initial={{ y: -14, opacity: 0.65, scale: 0.88 }}
                    animate={{ y: 0, opacity: 1, scale: 1 }}
                    exit={{ y: 20, opacity: 0, scale: 0.85 }}
                    transition={{ type: 'spring', stiffness: 420, damping: 28 }}
                    className="mx-auto flex h-9 w-9 items-center justify-center"
                  >
                    <span
                      className="block h-8 w-8 rounded-full border-2 border-white shadow-md"
                      style={{ background: COLORS[ball] }}
                    />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
            <div className="h-2 shrink-0 rounded-full bg-slate-200/80 dark:bg-slate-700" aria-hidden />
          </button>
        ))}
      </div>
    </GameShell>
  );
}
