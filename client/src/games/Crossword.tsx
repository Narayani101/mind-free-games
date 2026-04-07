import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { Lightbulb, Eye, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';

const GAME_ID = 'crossword';
const SIZE = 5;

type WordDef = {
  num: number;
  clue: string;
  row: number;
  c0: number;
  answer: string;
};

const WORDS: WordDef[] = [
  {
    num: 1,
    clue: 'Twinkle twinkle little ___ (5 — left to right)',
    row: 0,
    c0: 0,
    answer: 'STARS',
  },
  {
    num: 3,
    clue: 'King of the jungle, for short — think “mane” (4 — left to right)',
    row: 2,
    c0: 0,
    answer: 'LION',
  },
  {
    num: 5,
    clue: 'Opposite of cold (3 — left to right)',
    row: 4,
    c0: 0,
    answer: 'HOT',
  },
];

function buildSolutionGrid(): (string | null)[][] {
  const g: (string | null)[][] = Array.from({ length: SIZE }, () => Array(SIZE).fill(null));
  for (const w of WORDS) {
    for (let i = 0; i < w.answer.length; i++) {
      g[w.row]![w.c0 + i] = w.answer[i]!;
    }
  }
  return g;
}

const SOLUTION = buildSolutionGrid();

function cellNumber(r: number, c: number): number | undefined {
  const w = WORDS.find((x) => x.row === r && x.c0 === c);
  return w?.num;
}

function wordAtCell(r: number, c: number): WordDef | null {
  const ch = SOLUTION[r]![c];
  if (!ch) return null;
  return WORDS.find((w) => w.row === r && c >= w.c0 && c < w.c0 + w.answer.length) ?? null;
}

function wordCells(w: WordDef): { r: number; c: number }[] {
  return w.answer.split('').map((_, i) => ({ r: w.row, c: w.c0 + i }));
}

export default function CrosswordGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const [input, setInput] = useState<string[][]>(() =>
    Array.from({ length: SIZE }, () => Array(SIZE).fill(''))
  );
  const [activeNum, setActiveNum] = useState<number>(WORDS[0]!.num);
  const [focus, setFocus] = useState<{ r: number; c: number }>(() => ({
    r: WORDS[0]!.row,
    c: WORDS[0]!.c0,
  }));
  const [won, setWon] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[][]>(
    Array.from({ length: SIZE }, () => Array(SIZE).fill(null))
  );

  const activeWord = useMemo(() => WORDS.find((w) => w.num === activeNum)!, [activeNum]);

  const highlight = useMemo(() => {
    const set = new Set<string>();
    for (const { r, c } of wordCells(activeWord)) set.add(`${r},${c}`);
    return set;
  }, [activeWord]);

  const isComplete = useCallback(() => {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const sol = SOLUTION[r][c];
        if (!sol) continue;
        if (input[r][c]?.toUpperCase() !== sol) return false;
      }
    }
    return true;
  }, [input]);

  useEffect(() => {
    if (won || !isComplete()) return;
    setWon(true);
    void reportScore(500);
    saveState({ solved: true }, { status: 'completed' });
  }, [input, isComplete, reportScore, saveState, won]);

  const focusCell = useCallback((r: number, c: number) => {
    setFocus({ r, c });
    requestAnimationFrame(() => inputRefs.current[r]?.[c]?.focus());
  }, []);

  const selectWord = useCallback(
    (w: WordDef) => {
      setActiveNum(w.num);
      const cells = wordCells(w);
      const empty = cells.find(({ r, c }) => !input[r][c]);
      const target = empty ?? cells[0]!;
      focusCell(target.r, target.c);
    },
    [focusCell, input]
  );

  const advanceInWord = useCallback(
    (r: number, c: number, forward: boolean) => {
      const w = wordAtCell(r, c);
      if (!w) return;
      const cells = wordCells(w);
      const idx = cells.findIndex((x) => x.r === r && x.c === c);
      if (idx < 0) return;
      const nextIdx = forward ? idx + 1 : idx - 1;
      if (nextIdx >= 0 && nextIdx < cells.length) {
        const n = cells[nextIdx]!;
        focusCell(n.r, n.c);
      }
    },
    [focusCell]
  );

  const setLetter = useCallback((r: number, c: number, letter: string) => {
    const sol = SOLUTION[r][c];
    if (!sol) return;
    const v = letter.replace(/[^a-zA-Z]/g, '').toUpperCase().slice(-1);
    setInput((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = v;
      saveState({ input: next });
      return next;
    });
    if (v) advanceInWord(r, c, true);
  }, [advanceInWord, saveState]);

  const hint = useCallback(() => {
    const cells = wordCells(activeWord);
    const wrong = cells.filter(({ r, c }) => input[r][c]?.toUpperCase() !== SOLUTION[r][c]);
    const pool = wrong.length ? wrong : cells;
    const pick = pool[Math.floor(Math.random() * pool.length)]!;
    const sol = SOLUTION[pick.r][pick.c]!;
    setInput((prev) => {
      const next = prev.map((row) => [...row]);
      next[pick.r][pick.c] = sol;
      saveState({ input: next });
      return next;
    });
    focusCell(pick.r, pick.c);
  }, [activeWord, focusCell, input, saveState]);

  const revealLetter = useCallback(() => {
    const { r, c } = focus;
    const sol = SOLUTION[r][c];
    if (!sol) return;
    setInput((prev) => {
      const next = prev.map((row) => [...row]);
      next[r][c] = sol;
      saveState({ input: next });
      return next;
    });
  }, [focus, saveState]);

  const revealWord = useCallback(() => {
    setInput((prev) => {
      const next = prev.map((row) => [...row]);
      for (const { r, c } of wordCells(activeWord)) {
        next[r][c] = SOLUTION[r][c]!;
      }
      saveState({ input: next });
      return next;
    });
  }, [activeWord, saveState]);

  return (
    <GameShell
      gameId={GAME_ID}
      title="Crossword"
      resultModal={
        won
          ? {
              open: true,
              kind: 'win',
              title: 'You Win!',
              message: 'Every letter matches — nice solve.',
              score: 500,
              onPlayAgain: () => {
                setWon(false);
                const blank = Array.from({ length: SIZE }, () => Array(SIZE).fill(''));
                setInput(blank);
                saveState({ input: blank });
                selectWord(WORDS[0]!);
              },
            }
          : undefined
      }
      actions={
        <div className="flex flex-wrap items-center gap-2">
          <PlayfulButton variant="secondary" className="!py-2 !px-4 !text-sm" type="button" onClick={hint}>
            <Lightbulb className="h-4 w-4" />
            Hint
          </PlayfulButton>
          <PlayfulButton variant="ghost" className="!py-2 !px-4 !text-sm" type="button" onClick={revealLetter}>
            <Eye className="h-4 w-4" />
            Reveal letter
          </PlayfulButton>
          <PlayfulButton variant="ghost" className="!py-2 !px-4 !text-sm" type="button" onClick={revealWord}>
            <Sparkles className="h-4 w-4" />
            Reveal word
          </PlayfulButton>
        </div>
      }
    >
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-center">
        <div className="mx-auto w-full max-w-[220px] shrink-0 lg:mx-0">
          <h3 className="mb-2 text-xs font-black uppercase tracking-widest text-[#5DADE2] dark:text-[#38BDF8]">
            Across
          </h3>
          <ul className="space-y-2 text-left text-xs font-semibold text-slate-700 dark:text-slate-300 sm:text-sm">
            {WORDS.map((w) => (
              <li key={w.num}>
                <button
                  type="button"
                  onClick={() => selectWord(w)}
                  className={`w-full rounded-xl border-2 px-3 py-2 text-left transition ${
                    activeNum === w.num
                      ? 'border-[#FF8A65] bg-gradient-to-r from-[#FFE8E8] to-[#FFD6A5] shadow-md dark:border-[#38BDF8] dark:from-slate-800 dark:to-slate-900'
                      : 'border-slate-200 bg-white/70 hover:border-[#5DADE2] dark:border-slate-600 dark:bg-slate-800/80'
                  }`}
                >
                  <span className="font-mono font-black text-[#FF6B6B] dark:text-[#F472B6]">{w.num}.</span>{' '}
                  {w.clue}
                </button>
              </li>
            ))}
          </ul>
        </div>

        <motion.div
          layout
          className="mx-auto flex flex-col items-center gap-2"
        >
          <div
            className="inline-grid gap-0 rounded-[18px] border-2 border-slate-200 bg-gradient-to-br from-white to-[#EAF2FF] p-2 shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-slate-600 dark:from-[#1E293B] dark:to-[#0F172A]"
            style={{ gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))` }}
          >
            {Array.from({ length: SIZE }, (_, r) =>
              Array.from({ length: SIZE }, (_, c) => {
                const sol = SOLUTION[r]![c];
                const blocked = !sol;
                const num = cellNumber(r, c);
                const hi = highlight.has(`${r},${c}`);
                if (blocked) {
                  return (
                    <div
                      key={`${r}-${c}`}
                      className="relative h-9 w-9 bg-slate-900 sm:h-10 sm:w-10 dark:bg-black"
                    />
                  );
                }
                return (
                  <div
                    key={`${r}-${c}`}
                    className={`relative h-9 w-9 sm:h-10 sm:w-10 ${
                      hi ? 'ring-2 ring-[#FF8A65] ring-offset-1 dark:ring-[#38BDF8]' : ''
                    }`}
                  >
                    {num != null && (
                      <span className="absolute left-0.5 top-0 z-10 text-[9px] font-black text-[#FF6B6B] dark:text-[#F472B6]">
                        {num}
                      </span>
                    )}
                    <input
                      ref={(el) => {
                        inputRefs.current[r]![c] = el;
                      }}
                      maxLength={1}
                      value={input[r][c]}
                      onChange={(e) => setLetter(r, c, e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Backspace') {
                          if (input[r][c]) {
                            setInput((prev) => {
                              const next = prev.map((row) => [...row]);
                              next[r][c] = '';
                              saveState({ input: next });
                              return next;
                            });
                          } else advanceInWord(r, c, false);
                          e.preventDefault();
                        }
                        if (e.key === 'ArrowLeft') {
                          advanceInWord(r, c, false);
                          e.preventDefault();
                        }
                        if (e.key === 'ArrowRight') {
                          advanceInWord(r, c, true);
                          e.preventDefault();
                        }
                      }}
                      onFocus={() => {
                        const w = wordAtCell(r, c);
                        if (w) setActiveNum(w.num);
                        setFocus({ r, c });
                      }}
                      className="h-full w-full border border-slate-300 bg-white text-center text-sm font-black uppercase text-slate-900 dark:border-slate-600 dark:bg-slate-900 dark:text-[#E2E8F0] sm:text-base"
                    />
                  </div>
                );
              })
            )}
          </div>
          <p className="max-w-xs text-center text-[11px] font-medium text-slate-500 dark:text-slate-400">
            Tap a clue to highlight its row. Letters advance automatically. Use Hint / Reveal when stuck.
          </p>
        </motion.div>
      </div>

    </GameShell>
  );
}
