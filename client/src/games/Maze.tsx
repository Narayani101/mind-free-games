import { useCallback, useEffect, useMemo, useState } from 'react';
import { GameShell } from '@/components/GameShell';
import { DirectionPad } from '@/components/MobileGameControls';
import { useGameSession } from '@/hooks/useGameSession';

const GAME_ID = 'maze';

function generateMaze(size: number) {
  const grid = Array.from({ length: size }, () => Array(size).fill(1));
  const stack: [number, number][] = [[1, 1]];
  grid[1][1] = 0;
  const dirs = [
    [0, 2],
    [2, 0],
    [0, -2],
    [-2, 0],
  ];
  while (stack.length) {
    const [y, x] = stack[stack.length - 1];
    const opts: [number, number][] = [];
    for (const [dy, dx] of dirs) {
      const ny = y + dy;
      const nx = x + dx;
      if (ny > 0 && ny < size - 1 && nx > 0 && nx < size - 1 && grid[ny][nx] === 1) {
        opts.push([ny, nx]);
      }
    }
    if (!opts.length) {
      stack.pop();
      continue;
    }
    const [ny, nx] = opts[Math.floor(Math.random() * opts.length)];
    grid[ny][nx] = 0;
    grid[y + (ny - y) / 2][x + (nx - x) / 2] = 0;
    stack.push([ny, nx]);
  }
  grid[size - 2][size - 2] = 0;
  return grid;
}

export default function MazeGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const [size, setSize] = useState(17);
  const maze = useMemo(() => generateMaze(size), [size]);
  const [pos, setPos] = useState({ x: 1, y: 1 });
  const [steps, setSteps] = useState(0);
  const goal = useMemo(() => ({ x: size - 2, y: size - 2 }), [size]);

  useEffect(() => {
    setPos({ x: 1, y: 1 });
    setSteps(0);
  }, [size, maze]);

  const moveBy = useCallback(
    (dx: number, dy: number) => {
      setPos((p) => {
        const nx = p.x + dx;
        const ny = p.y + dy;
        if (ny < 0 || nx < 0 || ny >= size || nx >= size) return p;
        if (maze[ny][nx] === 1) return p;
        setSteps((s) => {
          const ns = s + 1;
          const atGoal = nx === goal.x && ny === goal.y;
          if (atGoal) {
            const pts = Math.max(50, 600 - ns);
            void reportScore(pts);
            saveState({ done: true, steps: ns }, { status: 'completed' });
          } else {
            saveState({ pos: { x: nx, y: ny }, steps: ns });
          }
          return ns;
        });
        return { x: nx, y: ny };
      });
    },
    [maze, size, goal.x, goal.y, reportScore, saveState]
  );

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      if (e.key === 'ArrowUp') moveBy(0, -1);
      if (e.key === 'ArrowDown') moveBy(0, 1);
      if (e.key === 'ArrowLeft') moveBy(-1, 0);
      if (e.key === 'ArrowRight') moveBy(1, 0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [moveBy]);

  const reset = useCallback(() => {
    setPos({ x: 1, y: 1 });
    setSteps(0);
  }, []);

  return (
    <GameShell
      gameId={GAME_ID}
      title="Maze"
      actions={
        <div className="flex flex-wrap gap-3 text-sm">
          <span className="text-zinc-400">
            Steps: <span className="text-white">{steps}</span>
          </span>
          <select
            value={size}
            onChange={(e) => setSize(Number(e.target.value))}
            className="rounded-lg border border-white/10 bg-black/40 px-2 py-1"
          >
            <option value={11}>Small</option>
            <option value={17}>Medium</option>
            <option value={23}>Large</option>
          </select>
          <button type="button" onClick={reset} className="rounded-lg bg-white/10 px-2 py-1">
            Reset position
          </button>
        </div>
      }
    >
      <p className="mb-3 text-center text-xs text-zinc-500 sm:mb-4 sm:text-left sm:text-sm">
        Reach the gold cell. Arrows or pad.
      </p>
      <div
        className="mx-auto inline-grid max-w-[100vw] gap-px overflow-x-auto border border-white/20 bg-white/10 p-1"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 8px))` }}
      >
        {maze.flatMap((row, y) =>
          row.map((cell, x) => {
            const isPlayer = pos.x === x && pos.y === y;
            const isGoal = goal.x === x && goal.y === y;
            let bg = cell === 1 ? 'bg-zinc-800' : 'bg-zinc-950';
            if (isPlayer) bg = 'bg-cyan-400';
            if (isGoal) bg = 'bg-amber-400';
            return (
              <div key={`${x}-${y}`} className={`h-2 w-2 min-[400px]:h-2.5 min-[400px]:w-2.5 sm:h-3 sm:w-3 ${bg}`} />
            );
          })
        )}
      </div>
      <DirectionPad
        onDir={(dx, dy) => moveBy(dx, dy)}
        className="mt-4 text-slate-800 dark:text-slate-100 md:hidden"
      />
    </GameShell>
  );
}
