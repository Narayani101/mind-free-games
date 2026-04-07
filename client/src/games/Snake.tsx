import { useCallback, useEffect, useRef, useState } from 'react';
import { Play } from 'lucide-react';
import { GameShell } from '@/components/GameShell';
import { DirectionPad } from '@/components/MobileGameControls';
import { useGameSession } from '@/hooks/useGameSession';
import { PlayfulButton } from '@/components/ui/PlayfulButton';

const SIZE = 20;
const GAME_ID = 'snake';

type Pt = { x: number; y: number };

export default function SnakeGame() {
  const { saveState, loadGuestState, reportScore, isLoggedIn } = useGameSession(GAME_ID);
  const [difficulty, setDifficulty] = useState<'easy' | 'normal' | 'hard'>('normal');
  const tick = difficulty === 'easy' ? 180 : difficulty === 'hard' ? 100 : 140;
  const [snake, setSnake] = useState<Pt[]>(() => [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }]);
  const [food, setFood] = useState<Pt>({ x: 15, y: 10 });
  const dir = useRef<Pt>({ x: 1, y: 0 });
  const nextDir = useRef<Pt>({ x: 1, y: 0 });
  const [running, setRunning] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const score = Math.max(0, snake.length - 3) * 10;
  const scoreRef = useRef(score);
  scoreRef.current = score;

  const spawnFood = useCallback((body: Pt[]) => {
    for (let i = 0; i < 500; i++) {
      const x = Math.floor(Math.random() * SIZE);
      const y = Math.floor(Math.random() * SIZE);
      if (!body.some((s) => s.x === x && s.y === y)) return { x, y };
    }
    return { x: 0, y: 0 };
  }, []);

  useEffect(() => {
    const g = loadGuestState();
    if (g?.difficulty) setDifficulty(g.difficulty as 'easy' | 'normal' | 'hard');
  }, [loadGuestState]);

  const bumpDir = useCallback((dx: number, dy: number) => {
    if (dx === 0 && dy === -1 && dir.current.y === 0) nextDir.current = { x: 0, y: -1 };
    if (dx === 0 && dy === 1 && dir.current.y === 0) nextDir.current = { x: 0, y: 1 };
    if (dx === -1 && dy === 0 && dir.current.x === 0) nextDir.current = { x: -1, y: 0 };
    if (dx === 1 && dy === 0 && dir.current.x === 0) nextDir.current = { x: 1, y: 0 };
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'ArrowUp') bumpDir(0, -1);
      if (e.key === 'ArrowDown') bumpDir(0, 1);
      if (e.key === 'ArrowLeft') bumpDir(-1, 0);
      if (e.key === 'ArrowRight') bumpDir(1, 0);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [bumpDir]);

  useEffect(() => {
    if (!running || gameOver) return;
    const id = window.setInterval(() => {
      dir.current = nextDir.current;
      setSnake((prev) => {
        const head = { x: prev[0].x + dir.current.x, y: prev[0].y + dir.current.y };
        if (head.x < 0 || head.y < 0 || head.x >= SIZE || head.y >= SIZE) {
          setGameOver(true);
          setRunning(false);
          void reportScore(scoreRef.current);
          return prev;
        }
        if (prev.some((s) => s.x === head.x && s.y === head.y)) {
          setGameOver(true);
          setRunning(false);
          void reportScore(scoreRef.current);
          return prev;
        }
        const ate = head.x === food.x && head.y === food.y;
        const next = [head, ...prev];
        if (!ate) next.pop();
        const newFood = ate ? spawnFood(next) : food;
        if (ate) setFood(newFood);
        const nextScore = Math.max(0, next.length - 3) * 10;
        saveState({ difficulty, score: nextScore, snake: next, food: newFood }, { difficulty });
        return next;
      });
    }, tick);
    return () => window.clearInterval(id);
  }, [running, gameOver, tick, food, spawnFood, saveState, difficulty, reportScore]);

  const start = () => {
    const body = [{ x: 10, y: 10 }, { x: 9, y: 10 }, { x: 8, y: 10 }];
    setSnake(body);
    setFood(spawnFood(body));
    setGameOver(false);
    setRunning(true);
    dir.current = { x: 1, y: 0 };
    nextDir.current = { x: 1, y: 0 };
  };

  return (
    <GameShell
      gameId={GAME_ID}
      title="Snake"
      actions={
        <div className="flex flex-wrap items-center gap-3">
          <span className="text-sm font-bold text-slate-600 dark:text-slate-300">
            Score: <span className="font-mono text-[#FF8A65]">{score}</span>
          </span>
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value as typeof difficulty)}
            className="rounded-playful border-2 border-slate-200 bg-white px-3 py-2 text-sm font-bold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
          >
            <option value="easy">Easy</option>
            <option value="normal">Normal</option>
            <option value="hard">Hard</option>
          </select>
          <PlayfulButton variant="primary" className="!py-2 !px-5 !text-sm" onClick={start}>
            <Play className="h-4 w-4" />
            {running ? 'Restart' : 'Start game'}
          </PlayfulButton>
        </div>
      }
      resultModal={
        gameOver
          ? {
              open: true,
              kind: 'lose',
              title: 'You Lost',
              message: 'You hit a wall or yourself.',
              score,
              onPlayAgain: () => {
                start();
              },
            }
          : undefined
      }
    >
      <p className="mb-3 text-center text-xs font-medium text-slate-600 dark:text-slate-400 sm:mb-4 sm:text-sm">
        Arrows or pad to steer. {isLoggedIn ? 'Scores sync to your account.' : ''}
      </p>
      <div
        className="mx-auto grid w-fit max-w-[100vw] gap-px overflow-x-auto rounded-playful border-2 border-emerald-800/30 bg-emerald-900/20 p-1 shadow-inner dark:border-emerald-500/30"
        style={{
          gridTemplateColumns: `repeat(${SIZE}, minmax(0, 1fr))`,
          backgroundImage:
            'linear-gradient(to right, rgba(16,185,129,0.15) 1px, transparent 1px), linear-gradient(to bottom, rgba(16,185,129,0.15) 1px, transparent 1px)',
          backgroundSize: `calc(100% / ${SIZE}) 100%, 100% calc(100% / ${SIZE})`,
        }}
      >
        {Array.from({ length: SIZE * SIZE }).map((_, i) => {
          const x = i % SIZE;
          const y = Math.floor(i / SIZE);
          const isHead = snake[0]?.x === x && snake[0]?.y === y;
          const isBody = snake.some((s, idx) => idx > 0 && s.x === x && s.y === y);
          const isFood = food.x === x && food.y === y;
          let bg = 'bg-[#ecfdf5] dark:bg-[#064e3b]';
          if (isFood) bg = 'bg-[#e11d48] ring-1 ring-white/80 dark:ring-rose-300';
          else if (isHead) bg = 'bg-[#059669] ring-1 ring-emerald-200 dark:ring-emerald-400';
          else if (isBody) bg = 'bg-[#34d399]';
          return <div key={i} className={`h-2.5 w-2.5 min-[380px]:h-3 min-[380px]:w-3 sm:h-4 sm:w-4 ${bg}`} />;
        })}
      </div>
      <DirectionPad onDir={bumpDir} className="mt-4 md:hidden" />
    </GameShell>
  );
}
