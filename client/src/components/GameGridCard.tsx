import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleHelp, Play } from 'lucide-react';
import type { GameConfig } from '@/api/client';
import { GAME_CARD_META } from '@/data/gameCardMeta';
import { GAME_RULES } from '@/data/gameRules';
import { PlayfulButton } from '@/components/ui/PlayfulButton';
import { CarPreviewArt, CandyPreviewArt, RunnerPreviewArt } from '@/components/GamePreviewArt';
import { CARD_GRADIENTS_LIGHT, CARD_SHADOW } from '@/data/cardGradients';

function Preview({ gameId }: { gameId: string }) {
  const meta = GAME_CARD_META[gameId];
  const kind = meta?.preview ?? 'icon';
  if (kind === 'car') return <CarPreviewArt className="h-full w-full rounded-xl" />;
  if (kind === 'candy') return <CandyPreviewArt className="h-full w-full rounded-xl" />;
  if (kind === 'runner') return <RunnerPreviewArt className="h-full w-full rounded-xl" />;
  const Icon = meta?.Icon;
  if (!Icon) return null;
  return (
    <div className="flex h-full min-h-[72px] items-center justify-center rounded-xl bg-white/50 dark:bg-slate-800/50">
      <Icon className="h-14 w-14 text-[#FF6B6B] dark:text-[#38BDF8]" strokeWidth={1.75} />
    </div>
  );
}

export function GameGridCard({
  game,
  onStart,
  cardIndex = 0,
}: {
  game: GameConfig;
  onStart: () => void;
  cardIndex?: number;
}) {
  const navigate = useNavigate();
  const meta = GAME_CARD_META[game.gameId] ?? {
    emoji: '🎮',
    Icon: Play,
    cardVariant: 0 as const,
    preview: 'icon' as const,
  };
  const rules = GAME_RULES[game.gameId];
  const grad = CARD_GRADIENTS_LIGHT[cardIndex % CARD_GRADIENTS_LIGHT.length];

  return (
    <motion.article
      layout
      whileHover={{ y: -6, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 420, damping: 24 }}
      className={`flex min-h-[240px] flex-col overflow-hidden rounded-[18px] border-2 border-white/70 bg-gradient-to-br ${grad} ${CARD_SHADOW} transition-shadow duration-300 hover:shadow-[0_14px_32px_rgba(0,0,0,0.12)] dark:border-slate-600 dark:bg-gradient-to-br dark:from-[#1E293B] dark:to-[#0F172A] dark:shadow-[0_8px_28px_rgba(0,0,0,0.45)]`}
    >
      <div className="flex items-start justify-between gap-2 p-3 pb-0">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-2xl leading-none drop-shadow-sm" aria-hidden>
            {meta.emoji}
          </span>
          <h3 className="text-base font-black leading-tight text-slate-800 dark:text-[#E2E8F0] sm:text-lg">
            {game.name}
          </h3>
          {rules && (
            <span className="group relative inline-flex shrink-0">
              <span className="rounded-full p-1 text-[#5DADE2] transition group-hover:scale-110 dark:text-[#38BDF8]">
                <CircleHelp className="h-5 w-5" strokeWidth={2.2} />
              </span>
              <span className="pointer-events-none absolute bottom-full left-1/2 z-30 mb-2 hidden w-[min(92vw,17rem)] -translate-x-1/2 rounded-2xl border-2 border-slate-200 bg-white p-3 text-left text-xs font-medium text-slate-700 shadow-2xl group-hover:block group-focus-within:block dark:border-slate-600 dark:bg-slate-800 dark:text-slate-200">
                <span className="font-black text-[#FF6B6B]">{game.name}</span>
                <p className="mt-1">
                  <span className="font-bold">Goal:</span> {rules.goal}
                </p>
                <p className="mt-1">
                  <span className="font-bold">Controls:</span> {rules.controls}
                </p>
                <p className="mt-1">
                  <span className="font-bold text-[#22C55E]">Tip:</span> {rules.tip}
                </p>
              </span>
            </span>
          )}
        </div>
      </div>
      <div className="min-h-0 flex-1 px-3 pt-2">
        <div className="h-[84px] overflow-hidden rounded-xl border border-white/60 shadow-inner dark:border-slate-600 sm:h-[92px]">
          <Preview gameId={game.gameId} />
        </div>
        <p className="mt-2 line-clamp-2 text-xs font-semibold text-slate-600 dark:text-slate-400">{game.description}</p>
      </div>
      <div className="p-3 pt-2">
        <PlayfulButton
          className="w-full !rounded-[20px] !px-7 !py-3.5 !text-base"
          variant="primary"
          onClick={() => {
            onStart();
            navigate(`/play/${game.gameId}`);
          }}
        >
          <Play className="h-5 w-5" />
          Start
        </PlayfulButton>
      </div>
    </motion.article>
  );
}
