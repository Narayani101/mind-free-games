import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { PlayfulButton } from '@/components/ui/PlayfulButton';

export function Login() {
  const { login } = useAuth();
  const nav = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login(email, password);
      nav('/');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Login failed');
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="safe-pb mx-auto w-full max-w-md rounded-card border-2 border-slate-200 bg-white/90 p-5 shadow-lift backdrop-blur-sm min-[400px]:p-8">
      <h1 className="text-2xl font-extrabold text-slate-800">Log in</h1>
      <p className="mt-2 text-sm font-medium text-slate-600">
        No account?{' '}
        <Link to="/register" className="font-bold text-[#5DADE2] underline">
          Sign up
        </Link>
      </p>
      <form onSubmit={onSubmit} className="mt-8 space-y-4">
        <div>
          <label className="block text-sm font-bold text-slate-700">Email</label>
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-1 w-full rounded-playful border-2 border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-800 outline-none focus:border-[#5DADE2]"
            autoComplete="email"
            inputMode="email"
          />
        </div>
        <div>
          <label className="block text-sm font-bold text-slate-700">Password</label>
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-1 w-full rounded-playful border-2 border-slate-200 bg-white px-4 py-3 text-base font-medium text-slate-800 outline-none focus:border-[#FFD93D]"
            autoComplete="current-password"
          />
        </div>
        {error && <p className="text-sm font-bold text-red-600">{error}</p>}
        <PlayfulButton type="submit" className="w-full" disabled={pending} variant="secondary">
          <LogIn className="h-5 w-5" />
          {pending ? 'Signing in…' : 'Continue'}
        </PlayfulButton>
      </form>
    </div>
  );
}
