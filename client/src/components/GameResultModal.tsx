import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { Home, RotateCcw } from 'lucide-react';
import { fireConfetti } from '@/utils/effects';
import { useEffect } from 'react';

export type ResultKind = 'win' | 'lose' | 'warning' | 'gameover';

type Props = {
  open: boolean;
  kind: ResultKind;
  title: string;
  message?: string;
  score?: number;
  /** e.g. remaining lives */
  detail?: string;
  onPlayAgain?: () => void;
  onClose?: () => void;
  /** Warning / info: single continue button */
  continueLabel?: string;
  onContinue?: () => void;
};

export function GameResultModal({
  open,
  kind,
  title,
  message,
  score,
  detail,
  onPlayAgain,
  onClose,
  continueLabel,
  onContinue,
}: Props) {
  const nav = useNavigate();

  useEffect(() => {
    if (open && kind === 'win') void fireConfetti();
  }, [open, kind]);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/50 p-4 backdrop-blur-sm dark:bg-black/70"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <motion.div
            role="dialog"
            aria-modal="true"
            initial={
              kind === 'lose' || kind === 'gameover'
                ? { opacity: 0, x: [-12, 12, 0] }
                : { opacity: 0, scale: 0.85, y: 24 }
            }
            animate={
              kind === 'lose' || kind === 'gameover'
                ? { opacity: 1, x: 0 }
                : { opacity: 1, scale: 1, y: 0 }
            }
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="w-full max-w-sm rounded-[22px] border-2 border-white/30 bg-gradient-to-br from-white via-[#FFF8F0] to-[#E8F7FF] p-8 text-center shadow-2xl dark:border-slate-600 dark:from-[#1E293B] dark:via-[#1E293B] dark:to-[#0F172A] dark:text-[#E2E8F0]"
          >
            <div className="text-5xl" aria-hidden>
              {kind === 'win' && '🎉'}
              {kind === 'lose' && '😢'}
              {kind === 'warning' && '⚠️'}
              {kind === 'gameover' && '💥'}
            </div>
            <h2 className="mt-3 text-2xl font-black text-slate-800 dark:text-[#E2E8F0]">{title}</h2>
            {message && <p className="mt-2 text-sm font-semibold text-slate-600 dark:text-slate-300">{message}</p>}
            {detail && <p className="mt-2 text-sm font-bold text-[#FF8A65] dark:text-[#38BDF8]">{detail}</p>}
            {score !== undefined && (
              <p className="mt-2 text-lg font-black text-slate-800 dark:text-white">
                Score: <span className="text-[#5DADE2]">{score}</span>
              </p>
            )}
            <div className="mt-8 flex flex-col gap-3 sm:flex-row sm:justify-center">
              {onContinue && continueLabel ? (
                <>
                  <PlayfulButton
                    variant="primary"
                    className="!rounded-[20px] !px-7 !py-3.5 !text-base"
                    onClick={() => {
                      onClose?.();
                      onContinue();
                    }}
                  >
                    {continueLabel}
                  </PlayfulButton>
                  <PlayfulButton
                    variant="secondary"
                    className="!rounded-[20px] !px-7 !py-3.5 !text-base"
                    onClick={() => {
                      onClose?.();
                      nav('/');
                    }}
                  >
                    <Home className="h-5 w-5" />
                    Back to games
                  </PlayfulButton>
                </>
              ) : (
                <>
                  {onPlayAgain && (
                    <PlayfulButton
                      variant="primary"
                      className="!rounded-[20px] !px-7 !py-3.5 !text-base"
                      onClick={() => {
                        onClose?.();
                        onPlayAgain();
                      }}
                    >
                      <RotateCcw className="h-5 w-5" />
                      {kind === 'win' ? 'Play again' : 'Retry'}
                    </PlayfulButton>
                  )}
                  <PlayfulButton
                    variant="secondary"
                    className="!rounded-[20px] !px-7 !py-3.5 !text-base"
                    onClick={() => {
                      onClose?.();
                      nav('/');
                    }}
                  >
                    <Home className="h-5 w-5" />
                    Back to games
                  </PlayfulButton>
                </>
              )}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
