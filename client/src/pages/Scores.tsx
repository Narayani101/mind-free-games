import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/api/client';

export function Scores() {
  const { token, user } = useAuth();
  const [rows, setRows] = useState<
    Array<{ gameId: string; bestScore: number; lastScore: number; totalPlays: number }>
  >([]);
  const [err, setErr] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    (async () => {
      try {
        const r = await api.myScores(token);
        if (!cancelled) setRows(r.scores);
      } catch (e) {
        if (!cancelled) setErr(e instanceof Error ? e.message : 'Failed');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  if (!user) {
    return (
      <div className="flex h-full min-h-0 flex-1 flex-col items-center justify-center overflow-hidden p-4">
        <div className="w-full max-w-md rounded-[20px] border-2 border-slate-200 bg-gradient-to-br from-[#FFF4E6] to-[#FFE0B2] p-6 text-center shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-slate-600 dark:from-[#1E293B] dark:to-[#0F172A]">
          <Trophy className="mx-auto h-12 w-12 text-[#FFD93D]" />
          <p className="mt-4 font-medium text-slate-700 dark:text-slate-200">
            <Link to="/login" className="font-bold text-[#5DADE2] underline dark:text-[#38BDF8]">
              Sign in
            </Link>{' '}
            to see cloud-saved scores.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full min-h-0 flex-1 flex-col gap-2 overflow-hidden py-1">
      <div className="shrink-0">
        <h1 className="flex items-center gap-2 text-xl font-extrabold text-slate-800 dark:text-[#E2E8F0] sm:text-2xl">
          <Trophy className="h-7 w-7 text-[#FFD93D]" />
          Your scores
        </h1>
        <p className="mt-1 text-xs font-medium text-slate-600 dark:text-slate-400 sm:text-sm">
          Best scores synced from games you played while logged in.
        </p>
        {err && <p className="mt-2 text-sm font-bold text-red-600">{err}</p>}
      </div>
      <div className="min-h-0 flex-1 overflow-x-auto overflow-y-auto rounded-[18px] border-2 border-slate-200 bg-white/90 shadow-[0_8px_24px_rgba(0,0,0,0.08)] dark:border-slate-600 dark:bg-slate-800/90">
        <table className="w-full min-w-[280px] text-left text-xs sm:text-sm">
          <thead className="sticky top-0 z-10 bg-gradient-to-r from-[#EAF2FF] to-[#E8F8F5] font-bold text-slate-600 dark:from-[#1E293B] dark:to-[#0F172A] dark:text-slate-300">
            <tr>
              <th className="px-3 py-2 sm:px-4 sm:py-3">Game</th>
              <th className="px-3 py-2 sm:px-4 sm:py-3">Best</th>
              <th className="px-3 py-2 sm:px-4 sm:py-3">Last</th>
              <th className="px-3 py-2 sm:px-4 sm:py-3">Plays</th>
            </tr>
          </thead>
          <tbody>
            {rows.length === 0 && !err && (
              <tr>
                <td colSpan={4} className="px-4 py-6 text-center font-medium text-slate-500 dark:text-slate-400">
                  No scores yet — play a game!
                </td>
              </tr>
            )}
            {rows.map((r) => (
              <tr key={r.gameId} className="border-t border-slate-100 hover:bg-[#F4ECF7]/50">
                <td className="px-4 py-3">
                  <Link to={`/play/${r.gameId}`} className="font-bold text-[#FF8A65] hover:underline">
                    {r.gameId}
                  </Link>
                </td>
                <td className="px-4 py-3 font-mono font-semibold">{r.bestScore}</td>
                <td className="px-4 py-3 font-mono font-semibold">{r.lastScore}</td>
                <td className="px-4 py-3">{r.totalPlays}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
