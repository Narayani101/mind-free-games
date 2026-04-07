import { useCallback, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { RotateCcw } from 'lucide-react';

const GAME_ID = 'tic-tac-toe';
type Cell = 'X' | 'O' | '';

function winner(b: Cell[]): Cell | 'draw' | null {
  const lines = [
    [0, 1, 2],
    [3, 4, 5],
    [6, 7, 8],
    [0, 3, 6],
    [1, 4, 7],
    [2, 5, 8],
    [0, 4, 8],
    [2, 4, 6],
  ];
  for (const [a, c, d] of lines) {
    if (b[a] && b[a] === b[c] && b[a] === b[d]) return b[a];
  }
  if (b.every(Boolean)) return 'draw';
  return null;
}

function minimax(b: Cell[], ai: 'O', human: 'X'): number {
  const w = winner(b);
  if (w === ai) return 10;
  if (w === human) return -10;
  if (w === 'draw') return 0;
  const empty = b.map((v, i) => (v === '' ? i : -1)).filter((i) => i >= 0);
  const isMax = b.filter(Boolean).length % 2 === (human === 'X' ? 1 : 0);
  let best = isMax ? -Infinity : Infinity;
  for (const i of empty) {
    const nb = [...b] as Cell[];
    nb[i] = isMax ? ai : human;
    const sc = minimax(nb, ai, human);
    best = isMax ? Math.max(best, sc) : Math.min(best, sc);
  }
  return best;
}

function aiMove(board: Cell[], depth: 'easy' | 'medium'): number {
  const empties = board.map((v, i) => (v === '' ? i : -1)).filter((i) => i >= 0);
  if (depth === 'easy') return empties[Math.floor(Math.random() * empties.length)]!;
  let best = -Infinity;
  let choice = empties[0]!;
  for (const i of empties) {
    const nb = [...board] as Cell[];
    nb[i] = 'O';
    const sc = minimax(nb, 'O', 'X');
    if (sc > best) {
      best = sc;
      choice = i;
    }
  }
  return choice;
}

type EndState = { outcome: 'win' | 'lose' | 'draw'; score: number };

export default function TicTacToeGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(''));
  const [mode, setMode] = useState<'easy' | 'medium'>('medium');
  const [status, setStatus] = useState<string>('Your turn (X)');
  const [shake, setShake] = useState(false);
  const [end, setEnd] = useState<EndState | null>(null);

  const play = useCallback(
    (i: number) => {
      if (board[i] || winner(board)) return;
      const nb = [...board] as Cell[];
      nb[i] = 'X';
      setBoard(nb);
      const w = winner(nb);
      if (w === 'X') {
        setStatus('You win!');
        void reportScore(100);
        saveState({ board: nb, mode }, { status: 'completed' });
        setEnd({ outcome: 'win', score: 100 });
        return;
      }
      if (w === 'draw') {
        setStatus('Draw');
        void reportScore(30);
        saveState({ board: nb, mode }, { status: 'completed' });
        setEnd({ outcome: 'draw', score: 30 });
        return;
      }
      setStatus('Computer thinking…');
      window.setTimeout(() => {
        const j = aiMove(nb, mode);
        const nb2 = [...nb] as Cell[];
        nb2[j] = 'O';
        setBoard(nb2);
        const w2 = winner(nb2);
        if (w2 === 'O') {
          setStatus('Computer wins');
          void reportScore(10);
          saveState({ board: nb2, mode }, { status: 'completed' });
          setShake(true);
          window.setTimeout(() => setShake(false), 500);
          setEnd({ outcome: 'lose', score: 10 });
        } else if (w2 === 'draw') {
          setStatus('Draw');
          void reportScore(30);
          saveState({ board: nb2, mode }, { status: 'completed' });
          setEnd({ outcome: 'draw', score: 30 });
        } else {
          setStatus('Your turn (X)');
          saveState({ board: nb2, mode });
        }
      }, 200);
    },
    [board, mode, reportScore, saveState]
  );

  const playRef = useRef(play);
  playRef.current = play;
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key >= '1' && e.key <= '9') playRef.current(Number(e.key) - 1);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, []);

  const reset = () => {
    setBoard(Array(9).fill(''));
    setStatus('Your turn (X)');
    setShake(false);
    setEnd(null);
  };

  return (
    <GameShell
      gameId={GAME_ID}
      title="Tic Tac Toe"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <select
            value={mode}
            onChange={(e) => setMode(e.target.value as 'easy' | 'medium')}
            className="rounded-playful border-2 border-slate-200 bg-white px-4 py-2.5 text-sm font-bold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
          </select>
          <PlayfulButton variant="secondary" className="!py-2 !px-5 !text-sm" onClick={reset}>
            <RotateCcw className="h-4 w-4" />
            New game
          </PlayfulButton>
        </div>
      }
      resultModal={
        end
          ? {
              open: true,
              kind: end.outcome === 'lose' ? 'lose' : 'win',
              title:
                end.outcome === 'win' ? 'You Win!' : end.outcome === 'lose' ? 'You Lost' : "It's a draw!",
              message:
                end.outcome === 'win'
                  ? 'Three in a row — nice game.'
                  : end.outcome === 'lose'
                    ? 'The computer closed you out.'
                    : 'Nobody wins this time.',
              score: end.score,
              onPlayAgain: () => reset(),
            }
          : undefined
      }
    >
      <p className="mb-4 text-sm font-semibold text-slate-600 dark:text-slate-300">{status}</p>
      <motion.div
        animate={shake ? { x: [-8, 8, -8, 8, 0] } : {}}
        transition={{ duration: 0.4 }}
        className="mx-auto grid w-64 grid-cols-3 gap-2"
      >
        {board.map((c, i) => (
          <button
            key={i}
            type="button"
            onClick={() => play(i)}
            className="flex h-20 items-center justify-center rounded-playful border-2 border-slate-200 bg-white text-3xl font-bold text-slate-800 shadow-sm transition hover:border-[#5DADE2] hover:bg-sky-50 hover:shadow-md dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-[#38BDF8]"
          >
            {c}
          </button>
        ))}
      </motion.div>
      <p className="mt-4 text-center text-xs font-medium text-slate-500 dark:text-slate-400">
        Keys 1–9 place your mark (top-left → bottom-right).
      </p>
    </GameShell>
  );
}
