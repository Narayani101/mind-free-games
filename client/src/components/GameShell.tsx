import { useEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ArrowLeft, CircleHelp } from 'lucide-react';
import { GuestBanner } from '@/components/GuestBanner';
import { GameHowToPlayModal } from '@/components/GameHowToPlayModal';
import { GameResultModal } from '@/components/GameResultModal';
import type { GameShellResultModal } from '@/types/gameResultModal';
import { poki } from '@/theme/pokiGameTheme';
import { GameFullscreenProvider } from '@/context/GameFullscreenContext';

export function GameShell({
  title,
  gameId,
  children,
  actions,
  hud,
  howToPlayExtra,
  resultModal,
  autoShowHowToPlay = true,
}: {
  title: string;
  gameId: string;
  children: React.ReactNode;
  actions?: React.ReactNode;
  /** Score / lives / level row — sits under title, above toolbar actions */
  hud?: React.ReactNode;
  howToPlayExtra?: React.ReactNode;
  resultModal?: GameShellResultModal;
  /** First visit this session opens How to play automatically */
  autoShowHowToPlay?: boolean;
}) {
  const cardRef = useRef<HTMLDivElement>(null);
  const [fs, setFs] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);

  /* Fullscreen toggle — restore with the button below
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
  */

  useEffect(() => {
    const onFsChange = () => {
      setFs(document.fullscreenElement === cardRef.current);
    };
    document.addEventListener('fullscreenchange', onFsChange);
    onFsChange();
    return () => document.removeEventListener('fullscreenchange', onFsChange);
  }, []);

  useEffect(() => {
    if (!autoShowHowToPlay) return;
    try {
      const k = `mfg-howto-${gameId}`;
      if (sessionStorage.getItem(k)) return;
      setHelpOpen(true);
      sessionStorage.setItem(k, '1');
    } catch {
      /* private mode */
    }
  }, [gameId, autoShowHowToPlay]);

  /** Full viewport: Tailwind `h-screen`/`w-screen` = 100vh / 100vw; `min-h-[100dvh]` helps mobile dynamic toolbars. */
  const fsOverrides =
    '[&:fullscreen]:fixed [&:fullscreen]:inset-0 [&:fullscreen]:z-[2147483646] [&:fullscreen]:m-0 [&:fullscreen]:box-border [&:fullscreen]:flex [&:fullscreen]:flex-col [&:fullscreen]:h-screen [&:fullscreen]:min-h-[100dvh] [&:fullscreen]:w-screen [&:fullscreen]:max-w-none [&:fullscreen]:rounded-none [&:fullscreen]:border-0 [&:fullscreen]:p-3 [&:fullscreen]:shadow-none [&:fullscreen]:overflow-hidden';

  return (
    <div className="safe-pb flex min-h-0 w-full max-w-4xl flex-1 flex-col items-center gap-3 overflow-hidden self-center">
      <div className="flex w-full shrink-0 flex-nowrap items-center justify-between gap-2">
        <Link to="/" className={poki.chromeBtn}>
          <ArrowLeft className="h-4 w-4 shrink-0" />
          All games
        </Link>
        {/* Fullscreen temporarily hidden
        <button
          type="button"
          onClick={toggleFs}
          className={poki.chromeBtn}
          aria-label={fs ? 'Exit fullscreen' : 'Enter fullscreen'}
        >
          {fs ? <Minimize className="h-4 w-4 shrink-0" /> : <Maximize className="h-4 w-4 shrink-0" />}
          {fs ? 'Exit' : 'Fullscreen'}
        </button>
        */}
      </div>
      <GuestBanner />

      <motion.div
        ref={cardRef}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className={`flex w-full min-h-0 flex-1 flex-col ${poki.bezel} ${fsOverrides}`}
      >
        <span className={poki.bezelInner} aria-hidden />
        <div className="relative z-[1] flex shrink-0 flex-col gap-2 px-3 pb-2 pt-3 sm:px-4 sm:pt-4">
          <div className="flex flex-wrap items-center gap-2 sm:gap-3">
            <h1 className={`flex-1 ${poki.title}`}>{title}</h1>
            <button
              type="button"
              className={poki.helpBtn}
              aria-label="How to play"
              onClick={() => setHelpOpen(true)}
            >
              <CircleHelp className="h-5 w-5" strokeWidth={2.4} />
            </button>
          </div>
          {hud ? <div className={poki.hudBar}>{hud}</div> : null}
          {actions ? (
            <div className="flex flex-wrap items-center gap-2 border-b border-slate-200/70 pb-3 dark:border-slate-600/70">
              {actions}
            </div>
          ) : null}
        </div>

        <div
          className={`relative z-[1] flex min-h-0 flex-1 flex-col overflow-hidden ${poki.screen} ${fs ? 'mx-0 mb-0 min-h-0 flex-1' : 'mx-2 mb-2 sm:mx-3 sm:mb-3'}`}
        >
          <div
            className={`flex min-h-0 w-full flex-1 flex-col overflow-y-auto overflow-x-hidden p-3 sm:p-4 ${fs ? 'min-h-0 flex-1 items-stretch justify-stretch p-2 sm:p-3' : 'items-center justify-start'}`}
          >
            <GameFullscreenProvider fullscreen={fs}>{children}</GameFullscreenProvider>
          </div>
        </div>
      </motion.div>

      <GameHowToPlayModal
        open={helpOpen}
        onClose={() => setHelpOpen(false)}
        gameId={gameId}
        title={title}
        extra={howToPlayExtra}
      />

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
