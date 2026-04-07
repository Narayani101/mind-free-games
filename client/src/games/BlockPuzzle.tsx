import { useCallback, useState } from 'react';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';

const GAME_ID = 'block-puzzle';
const N = 8;

const SHAPES: number[][][] = [
  [[1, 1]],
  [[1], [1]],
  [[1, 1, 1]],
  [[1, 1], [1, 0]],
  [[0, 1, 1], [1, 1, 0]],
];

function empty(): number[][] {
  return Array.from({ length: N }, () => Array(N).fill(0));
}

export default function BlockPuzzleGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const [grid, setGrid] = useState<number[][]>(() => empty());
  const [options, setOptions] = useState(() =>
    [0, 1, 2].map(() => SHAPES[Math.floor(Math.random() * SHAPES.length)])
  );
  const [score, setScore] = useState(0);
  const [picked, setPicked] = useState(0);

  const clearLines = useCallback(
    (g: number[][]) => {
      let pts = 0;
      const rows = new Set<number>();
      const cols = new Set<number>();
      for (let r = 0; r < N; r++) {
        if (g[r].every((c) => c === 1)) rows.add(r);
      }
      for (let c = 0; c < N; c++) {
        if (g.every((row) => row[c] === 1)) cols.add(c);
      }
      const ng = g.map((row) => [...row]);
      rows.forEach((r) => {
        ng[r] = Array(N).fill(0);
        pts += 100;
      });
      cols.forEach((c) => {
        for (let r = 0; r < N; r++) ng[r][c] = 0;
        pts += 100;
      });
      return { ng, pts };
    },
    []
  );

  const place = (shape: number[][]) => {
    const g = grid.map((r) => [...r]);
    outer: for (let sr = 0; sr <= N - shape.length; sr++) {
      for (let sc = 0; sc <= N - shape[0].length; sc++) {
        let ok = true;
        for (let r = 0; r < shape.length && ok; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c] && g[sr + r][sc + c]) ok = false;
          }
        }
        if (!ok) continue;
        for (let r = 0; r < shape.length; r++) {
          for (let c = 0; c < shape[r].length; c++) {
            if (shape[r][c]) g[sr + r][sc + c] = 1;
          }
        }
        const { ng, pts } = clearLines(g);
        const ns = score + pts + 10;
        setScore(ns);
        setGrid(ng);
        void reportScore(ns);
        saveState({ grid: ng, score: ns });
        const next = [...options];
        next[picked] = SHAPES[Math.floor(Math.random() * SHAPES.length)];
        setOptions(next);
        break outer;
      }
    }
  };

  return (
    <GameShell
      gameId={GAME_ID}
      title="Block Puzzle"
      actions={<span className="text-sm text-zinc-400">Score: <span className="text-white">{score}</span></span>}
    >
      <p className="mb-4 text-sm text-zinc-500">
        Pick a shape, then tap Place to drop it on the grid. Full rows and columns clear for points.
      </p>
      <div className="mx-auto grid w-fit gap-px border border-white/20 bg-white/10 p-1">
        {grid.map((row, r) => (
          <div key={r} className="flex">
            {row.map((cell, c) => (
              <div
                key={c}
                className={`h-6 w-6 sm:h-6 sm:w-6 ${cell ? 'bg-indigo-500' : 'bg-zinc-900'}`}
              />
            ))}
          </div>
        ))}
      </div>
      <div className="mt-6 flex flex-wrap justify-center gap-4">
        {options.map((shape, i) => (
          <div key={i} className="text-center">
            <button
              type="button"
              onClick={() => setPicked(i)}
              className={`rounded-lg border p-2 ${picked === i ? 'border-cyan-400' : 'border-white/10'}`}
            >
              <div className="inline-block">
                {shape.map((row, r) => (
                  <div key={r} className="flex">
                    {row.map((cell, c) => (
                      <div
                        key={c}
                        className={`h-4 w-4 ${cell ? 'bg-cyan-500' : 'bg-transparent'}`}
                      />
                    ))}
                  </div>
                ))}
              </div>
            </button>
            <button
              type="button"
              onClick={() => place(shape)}
              className="mt-2 block w-full rounded bg-white/10 px-2 py-1 text-xs hover:bg-white/20"
            >
              Place
            </button>
          </div>
        ))}
      </div>
    </GameShell>
  );
}
