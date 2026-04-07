import { useCallback, useMemo, useState } from 'react';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';

const GAME_ID = 'jigsaw';

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function JigsawGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const pieces = 9;
  const side = 3;
  const [tiles, setTiles] = useState(() => shuffle([...Array(pieces).keys()]));
  const [selected, setSelected] = useState<number | null>(null);

  const solved = useMemo(
    () => tiles.every((v, i) => v === i),
    [tiles]
  );

  const swap = useCallback(
    (i: number) => {
      if (selected === null) {
        setSelected(i);
        return;
      }
      if (selected === i) {
        setSelected(null);
        return;
      }
      const next = [...tiles];
      [next[selected], next[i]] = [next[i], next[selected]];
      setTiles(next);
      setSelected(null);
      saveState({ tiles: next });
      if (next.every((v, idx) => v === idx)) {
        void reportScore(300);
        saveState({ done: true }, { status: 'completed' });
      }
    },
    [selected, tiles, reportScore, saveState]
  );

  const reset = () => {
    setTiles(shuffle([...Array(pieces).keys()]));
    setSelected(null);
  };

  return (
    <GameShell
      gameId={GAME_ID}
      title="Jigsaw"
      actions={
        <div className="flex gap-2">
          {solved && <span className="text-emerald-400">Solved!</span>}
          <button type="button" onClick={reset} className="rounded-lg bg-indigo-600 px-3 py-1 text-sm text-white">
            Shuffle
          </button>
        </div>
      }
    >
      <p className="mb-4 text-sm text-zinc-500">
        Tap two tiles to swap. Restore the gradient order from top-left to bottom-right.
      </p>
      <div
        className="mx-auto grid max-w-xs gap-2"
        style={{ gridTemplateColumns: `repeat(${side}, 1fr)` }}
      >
        {tiles.map((id, idx) => {
          const row = Math.floor(id / side);
          const col = id % side;
          const hue = (row * side + col) * 25;
          return (
            <button
              key={idx}
              type="button"
              onClick={() => swap(idx)}
              className={`aspect-square rounded-lg border-2 text-lg font-bold text-white/90 transition ${
                selected === idx ? 'border-cyan-400 ring-2 ring-cyan-400/50' : 'border-white/10'
              }`}
              style={{
                background: `linear-gradient(135deg, hsl(${hue},70%,45%), hsl(${(hue + 40) % 360},60%,35%))`,
              }}
            >
              {id + 1}
            </button>
          );
        })}
      </div>
    </GameShell>
  );
}
