import { useCallback, useEffect, useRef, useState } from 'react';
import { useAuth } from '@/context/AuthContext';
import * as api from '@/api/client';
import type { ServerSession } from '@/types';

const guestKey = (gameId: string) => `mindfree_guest_${gameId}`;
const guestScoreKey = 'mindfree_guest_scores';

export type GuestScores = Record<string, { best: number; last: number }>;

export function readGuestScores(): GuestScores {
  try {
    const raw = sessionStorage.getItem(guestScoreKey);
    if (!raw) return {};
    return JSON.parse(raw) as GuestScores;
  } catch {
    return {};
  }
}

export function writeGuestScore(gameId: string, score: number) {
  const prev = readGuestScores();
  const best = Math.max(prev[gameId]?.best ?? 0, score);
  sessionStorage.setItem(
    guestScoreKey,
    JSON.stringify({ ...prev, [gameId]: { best, last: score } })
  );
}

export function useGameSession(gameId: string) {
  const { token, user } = useAuth();
  const [serverSession, setServerSession] = useState<ServerSession | null>(null);
  const [loading, setLoading] = useState(Boolean(user));
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (!user || !token) {
      setServerSession(null);
      setLoading(false);
      return;
    }
    let cancelled = false;
    (async () => {
      try {
        const { sessions } = await api.listActiveSessions(token, gameId);
        if (!cancelled && sessions[0]) setServerSession(sessions[0]);
      } catch {
        /* ignore */
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [user, token, gameId]);

  const saveState = useCallback(
    (state: Record<string, unknown>, opts?: { status?: ServerSession['status']; difficulty?: string }) => {
      if (user && token) {
        if (saveTimer.current) clearTimeout(saveTimer.current);
        saveTimer.current = setTimeout(async () => {
          try {
            const r = await api.saveSession(token, {
              gameId,
              state,
              sessionId: serverSession?.sessionId,
              status: opts?.status ?? 'active',
              difficulty: opts?.difficulty,
            });
            setServerSession(r.session);
          } catch (e) {
            console.warn('Session sync failed', e);
          }
        }, 400);
        return;
      }
      try {
        sessionStorage.setItem(guestKey(gameId), JSON.stringify({ state, at: Date.now() }));
      } catch {
        /* quota */
      }
    },
    [user, token, gameId, serverSession?.sessionId]
  );

  const loadGuestState = useCallback((): Record<string, unknown> | null => {
    try {
      const raw = sessionStorage.getItem(guestKey(gameId));
      if (!raw) return null;
      const parsed = JSON.parse(raw) as { state?: Record<string, unknown> };
      return parsed.state ?? null;
    } catch {
      return null;
    }
  }, [gameId]);

  const reportScore = useCallback(
    async (score: number) => {
      if (user && token) {
        try {
          await api.submitScore(token, gameId, score);
        } catch (e) {
          console.warn('Score sync failed', e);
        }
        return;
      }
      writeGuestScore(gameId, score);
    },
    [user, token, gameId]
  );

  return {
    isLoggedIn: Boolean(user),
    serverSession,
    loading,
    saveState,
    loadGuestState,
    reportScore,
  };
}
