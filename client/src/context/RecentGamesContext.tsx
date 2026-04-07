import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import { STORAGE_RECENT_GAMES } from '@/constants/brand';

const MAX = 3;

type Ctx = {
  recentIds: string[];
  recordPlay: (gameId: string) => void;
};

const RecentGamesContext = createContext<Ctx | null>(null);

export function RecentGamesProvider({ children }: { children: ReactNode }) {
  const [recentIds, setRecentIds] = useState<string[]>(() => {
    try {
      const raw = localStorage.getItem(STORAGE_RECENT_GAMES);
      if (!raw) return [];
      const p = JSON.parse(raw) as unknown;
      return Array.isArray(p) ? p.filter((x): x is string => typeof x === 'string').slice(0, MAX) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_RECENT_GAMES, JSON.stringify(recentIds));
    } catch {
      /* ignore */
    }
  }, [recentIds]);

  const recordPlay = useCallback((gameId: string) => {
    setRecentIds((prev) => [gameId, ...prev.filter((id) => id !== gameId)].slice(0, MAX));
  }, []);

  const value = useMemo(() => ({ recentIds, recordPlay }), [recentIds, recordPlay]);

  return <RecentGamesContext.Provider value={value}>{children}</RecentGamesContext.Provider>;
}

export function useRecentGames() {
  const ctx = useContext(RecentGamesContext);
  if (!ctx) throw new Error('useRecentGames outside provider');
  return ctx;
}
