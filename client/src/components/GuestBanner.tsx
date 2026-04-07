import { Link } from 'react-router-dom';
import { Sparkles } from 'lucide-react';
import { useAuth } from '@/context/AuthContext';

export function GuestBanner() {
  const { user } = useAuth();
  if (user) return null;
  return (
    <div className="flex gap-3 rounded-[20px] border-2 border-amber-200 bg-gradient-to-r from-[#FFF4E6] to-[#FDEDEC] px-4 py-3 text-sm text-amber-950">
      <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-amber-600" />
      <div>
        <p className="font-bold text-amber-900">Playing as a guest</p>
        <p className="mt-1 text-amber-900/85">
          Scores and sessions stay in this browser only — you may lose them if you clear data.{' '}
          <Link className="font-bold text-[#5DADE2] underline decoration-2 underline-offset-2" to="/register">
            Sign up
          </Link>{' '}
          or{' '}
          <Link className="font-bold text-[#5DADE2] underline decoration-2 underline-offset-2" to="/login">
            log in
          </Link>{' '}
          to save to the cloud.
        </p>
      </div>
    </div>
  );
}
