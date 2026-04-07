import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from 'react';
import * as api from '@/api/client';
import {
  STORAGE_GUEST_NAME,
  STORAGE_TOKEN,
  STORAGE_WELCOME_DONE,
} from '@/constants/brand';

export type User = { userId: string; email: string; name?: string | null };

type AuthContextValue = {
  user: User | null;
  token: string | null;
  guestDisplayName: string | null;
  loading: boolean;
  welcomeDone: boolean;
  setWelcomeDone: () => void;
  setGuestDisplayName: (name: string) => void;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => void;
  displayName: string | null;
};

const AuthContext = createContext<AuthContextValue | null>(null);

function readGuestName(): string | null {
  try {
    const n = localStorage.getItem(STORAGE_GUEST_NAME);
    return n?.trim() ? n.trim() : null;
  } catch {
    return null;
  }
}

function readWelcomeDone(): boolean {
  return localStorage.getItem(STORAGE_WELCOME_DONE) === '1';
}

function readToken(): string | null {
  const t = localStorage.getItem(STORAGE_TOKEN);
  if (t) return t;
  const legacy = localStorage.getItem('wholesome_token');
  if (legacy) {
    localStorage.setItem(STORAGE_TOKEN, legacy);
    localStorage.removeItem('wholesome_token');
    return legacy;
  }
  return null;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => readToken());
  const [user, setUser] = useState<User | null>(null);
  const [guestDisplayName, setGuestState] = useState<string | null>(() => readGuestName());
  const [welcomeDone, setWelcomeDoneState] = useState(readWelcomeDone);
  const [loading, setLoading] = useState(true);

  const setWelcomeDone = useCallback(() => {
    localStorage.setItem(STORAGE_WELCOME_DONE, '1');
    setWelcomeDoneState(true);
  }, []);

  const setGuestDisplayName = useCallback((name: string) => {
    const t = name.trim();
    if (t) localStorage.setItem(STORAGE_GUEST_NAME, t);
    else localStorage.removeItem(STORAGE_GUEST_NAME);
    setGuestState(t || null);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      if (!token) {
        setUser(null);
        setLoading(false);
        return;
      }
      try {
        const u = await api.me(token);
        if (!cancelled)
          setUser({ userId: u.userId, email: u.email, name: u.name ?? undefined });
      } catch {
        if (!cancelled) {
          setToken(null);
          localStorage.removeItem(STORAGE_TOKEN);
          setUser(null);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [token]);

  const login = useCallback(async (email: string, password: string) => {
    const r = await api.login(email, password);
    localStorage.setItem(STORAGE_TOKEN, r.token);
    setToken(r.token);
    setUser({
      userId: r.user.userId,
      email: r.user.email,
      name: r.user.name ?? undefined,
    });
    setWelcomeDone();
    localStorage.removeItem(STORAGE_GUEST_NAME);
    setGuestState(null);
  }, [setWelcomeDone]);

  const register = useCallback(
    async (name: string, email: string, password: string) => {
      const r = await api.register(name, email, password);
      localStorage.setItem(STORAGE_TOKEN, r.token);
      setToken(r.token);
      setUser({
        userId: r.user.userId,
        email: r.user.email,
        name: r.user.name ?? undefined,
      });
      setWelcomeDone();
      localStorage.removeItem(STORAGE_GUEST_NAME);
      setGuestState(null);
    },
    [setWelcomeDone]
  );

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_TOKEN);
    setToken(null);
    setUser(null);
  }, []);

  const displayName =
    user?.name?.trim() ||
    user?.email?.split('@')[0] ||
    guestDisplayName ||
    null;

  const value = useMemo(
    () => ({
      user,
      token,
      guestDisplayName,
      loading,
      welcomeDone,
      setWelcomeDone,
      setGuestDisplayName,
      login,
      register,
      logout,
      displayName,
    }),
    [
      user,
      token,
      guestDisplayName,
      loading,
      welcomeDone,
      setWelcomeDone,
      setGuestDisplayName,
      login,
      register,
      logout,
      displayName,
    ]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth outside provider');
  return ctx;
}
