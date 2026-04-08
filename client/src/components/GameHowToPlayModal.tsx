import type { ReactNode } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleHelp, Target, Gamepad2, Lightbulb } from 'lucide-react';
import { GAME_RULES, type GameRuleSet } from '@/data/gameRules';
import { PlayfulButton } from '@/components/ui/PlayfulButton';

export function GameHowToPlayModal({
  open,
  onClose,
  gameId,
  title,
  extra,
}: {
  open: boolean;
  onClose: () => void;
  gameId: string;
  title: string;
  extra?: ReactNode;
}) {
  const rules: GameRuleSet = GAME_RULES[gameId] ?? {
    goal: 'Have fun and try for a high score.',
    controls: 'Use mouse, touch, or keys as shown in-game.',
    tip: 'Take breaks — it is Mind-Free time.',
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[120] flex items-end justify-center p-3 sm:items-center sm:p-6"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
        >
          <button
            type="button"
            className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm dark:bg-black/60"
            aria-label="Close how to play"
            onClick={onClose}
          />
          <motion.div
            role="dialog"
            aria-modal="true"
            aria-labelledby="how-to-play-title"
            initial={{ opacity: 0, y: 24, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 16, scale: 0.98 }}
            transition={{ type: 'spring', stiffness: 380, damping: 28 }}
            className="relative z-10 w-full max-w-md overflow-hidden rounded-[24px] border-2 border-white/60 bg-gradient-to-br from-white via-[#f8fbff] to-[#fff5f5] p-5 shadow-[0_24px_64px_rgba(15,23,42,0.2)] dark:border-slate-600 dark:from-slate-800 dark:via-slate-900 dark:to-[#0f172a] dark:shadow-black/50 sm:p-6"
          >
            <div className="mb-4 flex items-start gap-3">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-[#5DADE2] to-[#A78BFA] text-white shadow-lg">
                <CircleHelp className="h-6 w-6" strokeWidth={2.5} />
              </span>
              <div>
                <h2 id="how-to-play-title" className="text-lg font-black text-slate-800 dark:text-white sm:text-xl">
                  How to play · {title}
                </h2>
                <p className="mt-1 text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Read once — you can reopen anytime with the ? button.
                </p>
              </div>
            </div>

            <ul className="space-y-3 text-sm">
              <li className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-600 dark:bg-slate-800/50">
                <Target className="mt-0.5 h-5 w-5 shrink-0 text-[#FF6B6B]" />
                <div>
                  <p className="font-black text-slate-800 dark:text-slate-100">Goal</p>
                  <p className="mt-0.5 font-medium leading-snug text-slate-600 dark:text-slate-300">{rules.goal}</p>
                </div>
              </li>
              <li className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-600 dark:bg-slate-800/50">
                <Gamepad2 className="mt-0.5 h-5 w-5 shrink-0 text-[#5DADE2]" />
                <div>
                  <p className="font-black text-slate-800 dark:text-slate-100">Controls</p>
                  <p className="mt-0.5 font-medium leading-snug text-slate-600 dark:text-slate-300">{rules.controls}</p>
                </div>
              </li>
              <li className="flex gap-3 rounded-2xl border border-slate-200/80 bg-white/70 p-3 dark:border-slate-600 dark:bg-slate-800/50">
                <Lightbulb className="mt-0.5 h-5 w-5 shrink-0 text-[#7ED957]" />
                <div>
                  <p className="font-black text-slate-800 dark:text-slate-100">Pro tip</p>
                  <p className="mt-0.5 font-medium leading-snug text-slate-600 dark:text-slate-300">{rules.tip}</p>
                </div>
              </li>
            </ul>

            {extra ? <div className="mt-4 rounded-2xl border border-dashed border-[#5DADE2]/50 bg-sky-50/80 p-3 text-sm dark:bg-sky-950/30">{extra}</div> : null}

            <PlayfulButton variant="primary" className="mt-5 w-full !rounded-2xl !py-3.5 !text-base" onClick={onClose}>
              Let&apos;s play
            </PlayfulButton>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
