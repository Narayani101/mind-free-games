import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import * as api from '@/api/client';
import { GAME_COMPONENTS } from '@/games/registry';
import { useRecentGames } from '@/context/RecentGamesContext';

export function GamePage() {
  const { gameId = '' } = useParams();
  const { recordPlay } = useRecentGames();
  const [config, setConfig] = useState<api.GameConfig | null>(null);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (gameId) recordPlay(gameId);
  }, [gameId, recordPlay]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const c = await api.fetchGameConfig(gameId);
        if (!cancelled) setConfig(c);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed to load');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [gameId]);

  const Cmp = GAME_COMPONENTS[gameId];

  if (err) {
    return (
      <div className="rounded-card border-2 border-red-200 bg-[#FDEDEC] p-4 font-semibold text-red-800">
        {err}{' '}
        <Link to="/" className="underline">
          Back home
        </Link>
      </div>
    );
  }

  if (!Cmp) {
    return (
      <div className="font-medium text-slate-600">
        Unknown game.{' '}
        <Link to="/" className="font-bold text-[#5DADE2] underline">
          Home
        </Link>
      </div>
    );
  }

  return (
    <div className="flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center overflow-hidden self-center">
      {config && (
        <p className="mb-2 line-clamp-2 w-full shrink-0 text-center text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-sm">
          {config.description}
          {config.difficulties?.length ? (
            <span className="ml-2 text-slate-500 dark:text-slate-500">
              · {config.difficulties.join(', ')}
            </span>
          ) : null}
        </p>
      )}
      <div className="flex min-h-0 w-full flex-1 flex-col items-center overflow-hidden">
        <Cmp />
      </div>
    </div>
  );
}
