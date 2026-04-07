import { useState } from 'react';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { BRAND_NAME } from '@/constants/brand';
import { PlayfulButton } from '@/components/ui/PlayfulButton';

export function WelcomeModal() {
  const { loading, user, welcomeDone, setWelcomeDone, register, setGuestDisplayName } = useAuth();
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  const open = !loading && !user && !welcomeDone;

  async function startPlaying() {
    setError(null);
    const n = name.trim();
    if (!n) {
      setError('Please enter your name.');
      return;
    }
    setBusy(true);
    try {
      if (email.trim() && password.length >= 6) {
        await register(n, email.trim(), password);
      } else {
        setGuestDisplayName(n);
        setWelcomeDone();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Something went wrong');
    } finally {
      setBusy(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm">
      <div
        className="w-full max-w-md rounded-[28px] border-2 border-white bg-gradient-to-br from-[#FFF4E6] via-white to-[#E8F8F5] p-8 shadow-2xl"
        role="dialog"
        aria-modal="true"
        aria-labelledby="welcome-title"
      >
        <div className="mb-6 flex items-center gap-3">
          <span className="flex h-12 w-12 items-center justify-center rounded-2xl bg-[#FFD93D] text-2xl shadow-md">
            <Sparkles className="h-6 w-6 text-amber-800" />
          </span>
          <div>
            <h2 id="welcome-title" className="text-xl font-extrabold text-slate-800">
              Welcome to {BRAND_NAME}
            </h2>
            <p className="text-sm text-slate-600">Sign up or jump in as a guest.</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="text-sm font-bold text-slate-700">Name</label>
            <input
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="mt-1 w-full rounded-[16px] border-2 border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 outline-none transition focus:border-[#5DADE2]"
              placeholder="How should we greet you?"
              autoComplete="nickname"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700">Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-1 w-full rounded-[16px] border-2 border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 outline-none transition focus:border-[#5DADE2]"
              placeholder="For saving scores (optional)"
              autoComplete="email"
            />
          </div>
          <div>
            <label className="text-sm font-bold text-slate-700">Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-1 w-full rounded-[16px] border-2 border-slate-200 bg-white px-4 py-3 font-medium text-slate-800 outline-none transition focus:border-[#5DADE2]"
              placeholder="6+ characters to create an account"
              autoComplete="new-password"
            />
          </div>
          {error && <p className="text-sm font-semibold text-red-600">{error}</p>}
          <p className="text-xs text-slate-500">
            With email + password we create your account. Otherwise you play as a guest — progress stays in this
            browser only.
          </p>
          <PlayfulButton className="w-full" disabled={busy} onClick={startPlaying}>
            {busy ? 'Starting…' : 'Start playing'}
          </PlayfulButton>
        </div>
      </div>
    </div>
  );
}
