import { useCallback, useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Maximize, Minimize } from 'lucide-react';
import { GuestBanner } from '@/components/GuestBanner';
import { GameRulesTooltip } from '@/components/GameRulesTooltip';
import { GameResultModal } from '@/components/GameResultModal';
import type { GameShellResultModal } from '@/types/gameResultModal';
import { GAME_RULES } from '@/data/gameRules';

export function GameShell({
  title,
  gameId,
  children,
  actions,
  resultModal,
}: {
  title: string;
  gameId: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  /** Standard win / lose / warning / gameover overlay (optional). */
  resultModal?: GameShellResultModal;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(false);

  const toggleFs = useCallback(async () => {
    const el = cardRef.current;
    if (!el) return;
    try {
      if (!document.fullscreenElement) {
        await el.requestFullscreen();
        setFs(true);
      } else {
        await document.exitFullscreen();
        setFs(false);
      }
    } catch {
      setFs(Boolean(document.fullscreenElement));
    }
  }, []);

  useEffect(() => {
    const onFsChange = () => setFs(Boolean(document.fullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  const rules = GAME_RULES[gameId] ?? {
    goal: 'Have fun and try to beat your best score.',
    controls: 'Use mouse, touch, or keys as described in-game.',
    tip: 'Take breaks — it is Mind-Free time.',
  };

  const fsCard =
    'min-h-0 flex-1 flex-col overflow-hidden rounded-[24px] border-2 border-slate-200/90 bg-gradient-to-br from-white via-[#F7F8FC] to-[#EAF2F8] p-3 shadow-lg shadow-slate-200/60 dark:border-slate-600 dark:from-[#1E293B] dark:via-[#1E293B] dark:to-[#0F172A] dark:shadow-slate-900/50 sm:p-5 ' +
    '[&:fullscreen]:fixed [&:fullscreen]:inset-0 [&:fullscreen]:z-[100] [&:fullscreen]:m-0 [&:fullscreen]:flex [&:fullscreen]:h-screen [&:fullscreen]:w-screen [&:fullscreen]:max-w-none [&:fullscreen]:rounded-none [&:fullscreen]:border-0 [&:fullscreen]:p-4 [&:fullscreen]:shadow-none ' +
    '[&:fullscreen]:bg-gradient-to-br [&:fullscreen]:from-white [&:fullscreen]:via-[#F7F8FC] [&:fullscreen]:to-[#EAF2F8] dark:[&:fullscreen]:from-[#1E293B] dark:[&:fullscreen]:via-[#1E293B] dark:[&:fullscreen]:to-[#0F172A]';

  return (
    <div className="safe-pb flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center gap-3 overflow-hidden self-center">
      <div className="flex w-full shrink-0 flex-nowrap items-center justify-between gap-2">
        <Link
          to="/"
          className="inline-flex shrink-0 items-center gap-2 rounded-[20px] border-2 border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-[#5DADE2] hover:bg-sky-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-[#38BDF8] dark:hover:bg-slate-700 dark:hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
        >
          <ArrowLeft className="h-4 w-4 shrink-0" />
          All games
        </Link>
        <button
          type="button"
          onClick={toggleFs}
          className="inline-flex shrink-0 items-center gap-2 rounded-[20px] border-2 border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-800 shadow-sm transition hover:border-[#FF8A65] hover:bg-orange-50 hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:hover:border-[#38BDF8] dark:hover:bg-slate-700 dark:hover:text-white sm:px-4 sm:py-2.5 sm:text-sm"
          aria-label={fs ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {fs ? <Minimize className="h-4 w-4 shrink-0" /> : <Maximize className="h-4 w-4 shrink-0" />}
          {fs ? 'Exit' : 'Fullscreen'}
        </button>
      </div>
      <GuestBanner />
      <div ref={cardRef} className={`flex w-full min-h-0 flex-1 flex-col ${fsCard}`}>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
          <h1 className="flex flex-wrap items-center bg-gradient-to-r from-[#FF6B6B] to-[#5DADE2] bg-clip-text text-xl font-extrabold tracking-tight text-transparent dark:from-[#38BDF8] dark:to-[#C084FC] sm:text-2xl">
            {title}
            <GameRulesTooltip gameName={title} rules={rules} />
          </h1>
        </div>
        {actions ? (
          <div className="mt-3 flex flex-wrap items-center gap-2 border-b border-slate-200/80 pb-3 dark:border-slate-600">
            {actions}
          </div>
        ) : null}
        <div
          className={`flex min-h-0 w-full flex-1 flex-col items-center justify-start overflow-y-auto overflow-x-hidden ${actions ? 'mt-3' : 'mt-2'}`}
        >
          {children}
        </div>
      </div>
      {resultModal && (
        <GameResultModal
          open={resultModal.open}
          kind={resultModal.kind}
          title={resultModal.title}
          message={resultModal.message}
          score={resultModal.score}
          detail={resultModal.detail}
          onPlayAgain={resultModal.onPlayAgain}
          continueLabel={resultModal.continueLabel}
          onContinue={resultModal.onContinue}
          onClose={resultModal.onDismiss}
        />
      )}
    </div>
  );
}
