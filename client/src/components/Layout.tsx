import { useMemo, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import {
  Gamepad2,
  Home,
  LogOut,
  Moon,
  Sun,
  Trophy,
  UserPlus,
  LogIn,
  Joystick,
  Puzzle,
  Zap,
  Footprints,
  Candy,
} from 'lucide-react';
import { useAuth } from '@/context/AuthContext';
import { useTheme } from '@/context/ThemeContext';
import { BRAND_NAME } from '@/constants/brand';
import { WelcomeModal } from '@/components/WelcomeModal';
import { PlayfulButton } from '@/components/ui/PlayfulButton';

const HUB_PATHS = ['/', '/arcade', '/puzzle', '/action', '/runner', '/match'];

const catNav: { to: string; label: string; Icon: typeof Joystick }[] = [
  { to: '/arcade', label: 'Arcade', Icon: Joystick },
  { to: '/puzzle', label: 'Puzzle', Icon: Puzzle },
  { to: '/action', label: 'Action', Icon: Zap },
  { to: '/runner', label: 'Runner', Icon: Footprints },
  { to: '/match', label: 'Match', Icon: Candy },
];

function firstName(displayName: string | null): string | null {
  if (!displayName?.trim()) return null;
  return displayName.trim().split(/\s+/)[0] ?? null;
}

export function Layout() {
  const { user, logout, loading, displayName } = useAuth();
  const { theme, toggle } = useTheme();
  const [confirmLogout, setConfirmLogout] = useState(false);
  const loc = useLocation();
  const isHub = HUB_PATHS.includes(loc.pathname);
  const hiName = useMemo(() => firstName(displayName), [displayName]);

  return (
    <>
      <WelcomeModal />
      {confirmLogout && (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-sm dark:bg-black/60">
          <div className="w-full max-w-sm rounded-[24px] border-2 border-slate-200 bg-white p-6 shadow-2xl dark:border-slate-600 dark:bg-slate-800">
            <p className="text-center text-lg font-bold text-slate-800 dark:text-[#E2E8F0]">
              Are you sure you want to logout?
            </p>
            <div className="mt-6 flex gap-3">
              <PlayfulButton variant="ghost" className="flex-1" onClick={() => setConfirmLogout(false)}>
                Cancel
              </PlayfulButton>
              <PlayfulButton
                variant="secondary"
                className="flex-1"
                onClick={() => {
                  setConfirmLogout(false);
                  logout();
                }}
              >
                Logout
              </PlayfulButton>
            </div>
          </div>
        </div>
      )}
      <div className="flex min-h-[100dvh] flex-col">
        <header className="portal-header sticky top-0 z-40 shrink-0">
          <div className="mx-auto flex max-w-[1400px] flex-nowrap items-center gap-2 px-3 py-2 sm:gap-3 sm:px-4 lg:px-6">
            {/* Left: logo + title */}
            <Link
              to="/"
              className="flex min-w-0 shrink-0 items-center gap-2 no-underline"
              title={BRAND_NAME}
            >
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[16px] bg-gradient-to-br from-[#FF8A65] via-[#FFD93D] to-[#5DADE2] text-white shadow-[0_8px_24px_rgba(0,0,0,0.12)] sm:h-10 sm:w-10 sm:rounded-[18px]">
                <Gamepad2 className="h-5 w-5 text-white" />
              </span>
              <span className="hidden max-w-[140px] truncate bg-gradient-to-r from-[#FF6B6B] to-[#5DADE2] bg-clip-text text-sm font-black tracking-tight text-transparent dark:from-[#38BDF8] dark:to-[#C084FC] sm:inline sm:max-w-[200px] sm:text-lg">
                {BRAND_NAME}
              </span>
            </Link>

            {/* Center: nav — scroll horizontally on narrow screens, single row */}
            <nav
              className="min-w-0 flex-1 overflow-x-auto overflow-y-hidden [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
              aria-label="Main"
            >
              <div className="mx-auto flex w-max max-w-full flex-nowrap items-center justify-center gap-0.5 py-1 sm:gap-1">
                <NavLink
                  to="/"
                  end
                  className={({ isActive }) =>
                    `inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[11px] font-bold transition sm:px-3 sm:text-xs ${
                      isActive
                        ? 'bg-gradient-to-r from-[#FF8A65] to-[#FF6B6B] text-white shadow-md'
                        : 'text-slate-700 hover:bg-white/90 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`
                  }
                >
                  <Home className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Home
                </NavLink>
                <NavLink
                  to="/scores"
                  className={({ isActive }) =>
                    `inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[11px] font-bold transition sm:px-3 sm:text-xs ${
                      isActive
                        ? 'bg-gradient-to-r from-[#5DADE2] to-[#7ED957] text-white shadow-md'
                        : 'text-slate-700 hover:bg-white/90 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white'
                    }`
                  }
                >
                  <Trophy className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                  Scores
                </NavLink>
                {catNav.map(({ to, label, Icon }) => (
                  <NavLink
                    key={to}
                    to={to}
                    className={({ isActive }) =>
                      `inline-flex shrink-0 items-center gap-1 whitespace-nowrap rounded-full px-2.5 py-2 text-[11px] font-bold transition sm:px-3 sm:text-xs ${
                        isActive
                          ? 'bg-gradient-to-r from-[#A78BFA] to-[#5DADE2] text-white shadow-md'
                          : 'text-slate-700 hover:bg-white/90 hover:text-slate-900 dark:text-slate-200 dark:hover:bg-slate-800 dark:hover:text-white'
                      }`
                    }
                  >
                    <Icon className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    {label}
                  </NavLink>
                ))}
              </div>
            </nav>

            {/* Right: theme, greeting, auth */}
            <div className="flex shrink-0 flex-nowrap items-center gap-1.5 sm:gap-2">
              <button
                type="button"
                onClick={toggle}
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full border-2 border-slate-200 bg-white text-slate-800 shadow-sm transition hover:border-[#5DADE2] hover:bg-sky-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-[#38BDF8] dark:hover:border-[#38BDF8] dark:hover:bg-slate-700 dark:hover:text-white sm:h-10 sm:w-10"
                aria-label={theme === 'dark' ? 'Light mode' : 'Dark mode'}
              >
                {theme === 'dark' ? <Sun className="h-4 w-4 sm:h-5 sm:w-5" /> : <Moon className="h-4 w-4 sm:h-5 sm:w-5" />}
              </button>
              {!loading && hiName && (
                <span className="hidden max-w-[120px] truncate text-xs font-bold text-slate-800 dark:text-slate-100 sm:inline sm:max-w-[100px] md:max-w-[140px] md:text-sm">
                  Hi, {hiName}
                </span>
              )}
              {!loading &&
                (user ? (
                  <PlayfulButton
                    variant="ghost"
                    className="!shrink-0 !rounded-full !py-2 !px-3 !text-xs font-bold text-slate-800 hover:border-[#FF8A65] hover:bg-orange-50 hover:text-slate-900 dark:!border-slate-600 dark:text-slate-100 dark:hover:border-[#38BDF8] dark:hover:bg-slate-700 dark:hover:text-white sm:!px-4 sm:!text-sm"
                    onClick={() => setConfirmLogout(true)}
                  >
                    <LogOut className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                    <span className="hidden sm:inline">Log out</span>
                  </PlayfulButton>
                ) : (
                  <>
                    <NavLink to="/login" className="shrink-0">
                      <PlayfulButton
                        variant="ghost"
                        className="!rounded-full !py-2 !px-3 !text-xs font-bold text-slate-800 hover:border-[#5DADE2] hover:bg-sky-50 dark:text-slate-100 dark:hover:bg-slate-700 sm:!px-4 sm:!text-sm"
                      >
                        <LogIn className="h-3.5 w-3.5 sm:h-4 sm:w-4" />
                        <span className="hidden sm:inline">Log in</span>
                      </PlayfulButton>
                    </NavLink>
                    <NavLink to="/register" className="hidden shrink-0 sm:block">
                      <PlayfulButton variant="secondary" className="!rounded-full !py-2 !px-4 !text-sm">
                        <UserPlus className="h-4 w-4" />
                        Sign up
                      </PlayfulButton>
                    </NavLink>
                  </>
                ))}
            </div>
          </div>
        </header>
        <main
          className={`mx-auto flex w-full max-w-6xl flex-1 min-h-0 flex-col overflow-hidden ${
            isHub ? '' : 'items-center px-3 py-3 sm:px-6 sm:py-4'
          }`}
        >
          <Outlet />
        </main>
        {!isHub && (
          <footer className="shrink-0 border-t-2 border-slate-200/80 py-4 text-center text-xs font-semibold text-slate-500 dark:border-slate-700 dark:text-slate-400">
            {BRAND_NAME} · Play free · Save scores when you sign in
          </footer>
        )}
      </div>
    </>
  );
}
