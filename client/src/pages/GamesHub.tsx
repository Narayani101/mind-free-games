import { useEffect, useMemo, useState } from 'react';
import * as api from '@/api/client';
import type { GameConfig } from '@/api/client';
import { BRAND_NAME } from '@/constants/brand';
import { GameGridCard } from '@/components/GameGridCard';
import { useRecentGames } from '@/context/RecentGamesContext';
import { NAV_GAME_IDS, type NavCategory } from '@/data/gameNavFilters';

export type HubMode = 'all' | NavCategory;

const SECTION_LABEL: Record<NavCategory, string> = {
  arcade: 'Arcade',
  puzzle: 'Puzzle',
  action: 'Action',
  runner: 'Runner',
  match: 'Match',
};

export function GamesHub({ mode }: { mode: HubMode }) {
  const [games, setGames] = useState<GameConfig[]>([]);
  const [err, setErr] = useState<string | null>(null);
  const { recentIds, recordPlay } = useRecentGames();

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const r = await api.fetchGames();
        if (!cancelled) setGames(r.games);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to load games');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const byId = useMemo(() => {
    const m = new Map<string, GameConfig>();
    for (const g of games) m.set(g.gameId, g);
    return m;
  }, [games]);

  const filtered = useMemo(() => {
    if (mode === 'all') return games;
    const ids = NAV_GAME_IDS[mode];
    return ids.map((id) => byId.get(id)).filter(Boolean) as GameConfig[];
  }, [games, mode, byId]);

  const recentGames = useMemo(
    () => recentIds.map((id) => byId.get(id)).filter(Boolean) as GameConfig[],
    [recentIds, byId]
  );

  const subtitle =
    mode === 'all'
      ? 'All games — pick anything and play in seconds.'
      : `${SECTION_LABEL[mode]} — curated picks for this shelf.`;

  const allowScroll = mode === 'all';

  return (
    <div
      className={`flex h-full min-h-0 flex-1 flex-col overflow-x-hidden px-3 pb-4 pt-3 sm:px-5 ${
        allowScroll ? 'overflow-y-auto' : 'overflow-hidden'
      }`}
    >
      <header className="shrink-0 py-3 text-center">
        <h1 className="bg-gradient-to-r from-[#FF6B6B] via-[#5DADE2] to-[#A78BFA] bg-clip-text text-3xl font-black tracking-tight text-transparent dark:from-[#38BDF8] dark:via-[#C084FC] dark:to-[#F472B6] sm:text-4xl">
          {BRAND_NAME}
        </h1>
        <p className="mt-1 text-sm font-bold text-slate-600 dark:text-slate-300">{subtitle}</p>
      </header>

      {err && (
        <div className="mx-auto mb-3 max-w-xl shrink-0 rounded-[18px] border-2 border-red-300 bg-gradient-to-r from-[#FFE8E8] to-[#FFD6A5] px-4 py-3 text-center text-sm font-bold text-red-800 dark:border-red-800 dark:from-red-950 dark:to-slate-900 dark:text-red-200">
          {err}
          {import.meta.env.DEV && (
            <>
              {' '}
              — run <code className="rounded bg-white/80 px-1 dark:bg-slate-800">npm run dev</code>
            </>
          )}
        </div>
      )}

      {mode === 'all' && recentGames.length > 0 && (
        <section className="mx-auto mb-5 w-full max-w-5xl shrink-0">
          <h2 className="mb-3 text-center text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
            Recently played
          </h2>
          <div className="flex flex-wrap justify-center gap-4">
            {recentGames.map((g, i) => (
              <div key={g.gameId} className="w-full min-w-[260px] max-w-[300px] flex-1 sm:w-[280px] sm:flex-none">
                <GameGridCard game={g} onStart={() => recordPlay(g.gameId)} cardIndex={i} />
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="mx-auto flex w-full max-w-6xl min-h-0 flex-1 flex-col items-center">
        <h2 className="mb-3 text-center text-sm font-black uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
          {mode === 'all' ? 'All games' : SECTION_LABEL[mode]}
        </h2>
        <div className="flex flex-1 justify-center">
          <div
            className="grid w-full max-w-5xl justify-items-center gap-4"
            style={{
              gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 280px))',
            }}
          >
            {filtered.map((g, i) => (
              <div key={g.gameId} className="w-full max-w-[280px]">
                <GameGridCard game={g} onStart={() => recordPlay(g.gameId)} cardIndex={i} />
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
