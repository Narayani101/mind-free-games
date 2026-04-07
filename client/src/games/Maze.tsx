import { useCallback, useEffect, useMemo, useState } from 'react';
import { GameShell } from '@/components/GameShell';
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

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return;
      e.preventDefault();
      setPos((p) => {
        let nx = p.x;
        let ny = p.y;
        if (e.key === 'ArrowUp') ny -= 1;
        if (e.key === 'ArrowDown') ny += 1;
        if (e.key === 'ArrowLeft') nx -= 1;
        if (e.key === 'ArrowRight') nx += 1;
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
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [maze, size, goal.x, goal.y, reportScore, saveState]);

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
      <p className="mb-4 text-sm text-zinc-500">Reach the gold cell. Use arrow keys.</p>
      <div
        className="mx-auto inline-grid gap-px border border-white/20 bg-white/10 p-1"
        style={{ gridTemplateColumns: `repeat(${size}, minmax(0, 10px))` }}
      >
        {maze.flatMap((row, y) =>
          row.map((cell, x) => {
            const isPlayer = pos.x === x && pos.y === y;
            const isGoal = goal.x === x && goal.y === y;
            let bg = cell === 1 ? 'bg-zinc-800' : 'bg-zinc-950';
            if (isPlayer) bg = 'bg-cyan-400';
            if (isGoal) bg = 'bg-amber-400';
            return <div key={`${x}-${y}`} className={`h-2.5 w-2.5 sm:h-3 sm:w-3 ${bg}`} />;
          })
        )}
      </div>
    </GameShell>
  );
}
