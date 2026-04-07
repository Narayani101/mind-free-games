/** Production: VITE_API_ORIGIN (e.g. https://your-api.onrender.com). Trailing slashes are stripped — avoid //api URLs (Render 404s). */
const origin = (import.meta.env.VITE_API_ORIGIN as string | undefined)?.replace(/\/$/, '') ?? '';
const API = origin ? `${origin}/api` : '/api';

export async function api<T>(
  path: string,
  options: RequestInit & { token?: string | null } = {}
): Promise<T> {
  const { token, headers: h, ...rest } = options;
  const headers: HeadersInit = {
    'Content-Type': 'application/json',
    ...h,
  };
  if (token) {
    (headers as Record<string, string>)['Authorization'] = `Bearer ${token}`;
  }
  const res = await fetch(`${API}${path}`, { ...rest, headers });
  const text = await res.text();
  const data = text ? (JSON.parse(text) as unknown) : null;
  if (!res.ok) {
    const err = (data as { error?: string })?.error ?? res.statusText;
    throw new Error(err);
  }
  return data as T;
}

export type GameConfig = {
  gameId: string;
  name: string;
  category: string;
  description: string;
  difficulties: string[];
  settings: Record<string, unknown>;
};

export async function fetchGames(): Promise<{ games: GameConfig[] }> {
  return api('/games');
}

export async function fetchGameConfig(gameId: string): Promise<GameConfig> {
  return api(`/games/${gameId}/config`);
}

export type AuthUser = { userId: string; email: string; name?: string | null };

export async function login(email: string, password: string) {
  return api<{ token: string; user: AuthUser }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export async function register(name: string, email: string, password: string) {
  return api<{ token: string; user: AuthUser }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name: name.trim() || undefined, email, password }),
  });
}

export async function me(token: string) {
  return api<{ userId: string; email: string; name?: string | null; createdAt: string }>('/auth/me', {
    token,
  });
}

export async function saveSession(
  token: string,
  body: {
    gameId: string;
    state: Record<string, unknown>;
    status?: 'active' | 'completed' | 'abandoned';
    difficulty?: string;
    sessionId?: string;
  }
) {
  return api<{ session: import('../types').ServerSession }>('/sessions', {
    method: 'POST',
    token,
    body: JSON.stringify(body),
  });
}

export async function getSession(token: string, sessionId: string) {
  return api<{ session: import('../types').ServerSession }>(`/sessions/${sessionId}`, {
    token,
  });
}

export async function listActiveSessions(token: string, gameId?: string) {
  const q = gameId ? `?gameId=${encodeURIComponent(gameId)}` : '';
  return api<{ sessions: import('../types').ServerSession[] }>(`/sessions/active/list${q}`, {
    token,
  });
}

export async function submitScore(token: string, gameId: string, score: number) {
  return api<{ bestScore: number; lastScore: number; totalPlays: number }>('/scores', {
    method: 'POST',
    token,
    body: JSON.stringify({ gameId, score }),
  });
}

export async function myScores(token: string) {
  return api<{
    scores: Array<{
      userId: string;
      gameId: string;
      bestScore: number;
      lastScore: number;
      totalPlays: number;
    }>;
  }>('/scores/mine', { token });
}
