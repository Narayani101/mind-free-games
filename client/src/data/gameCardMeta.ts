import type { LucideIcon } from 'lucide-react';
import {
  Car,
  Candy,
  CircleDot,
  Dice5,
  Gamepad2,
  Gem,
  Grid3x3,
  Joystick,
  Layers,
  MousePointer2,
  Puzzle,
  Route,
  Sparkles,
  Target,
  Waves,
  Zap,
} from 'lucide-react';

export type CardVariant = 0 | 1 | 2 | 3 | 4;

export type GameCardMeta = {
  emoji: string;
  Icon: LucideIcon;
  cardVariant: CardVariant;
  /** use custom image in preview area */
  preview: 'icon' | 'car' | 'candy' | 'runner';
};

export const GAME_CARD_META: Record<string, GameCardMeta> = {
  snake: { emoji: '🐍', Icon: Joystick, cardVariant: 0, preview: 'icon' },
  'tic-tac-toe': { emoji: '❌⭕', Icon: Grid3x3, cardVariant: 1, preview: 'icon' },
  'brick-breaker': { emoji: '🧱', Icon: Layers, cardVariant: 2, preview: 'icon' },
  'bubble-shooter': { emoji: '🫧', Icon: CircleDot, cardVariant: 3, preview: 'icon' },
  maze: { emoji: '🌀', Icon: Route, cardVariant: 4, preview: 'icon' },
  jigsaw: { emoji: '🧩', Icon: Puzzle, cardVariant: 0, preview: 'icon' },
  'block-puzzle': { emoji: '🟦', Icon: Grid3x3, cardVariant: 1, preview: 'icon' },
  crossword: { emoji: '📝', Icon: Target, cardVariant: 2, preview: 'icon' },
  'math-quiz': { emoji: '➗', Icon: Sparkles, cardVariant: 3, preview: 'icon' },
  'magic-sort': { emoji: '🧪', Icon: Waves, cardVariant: 4, preview: 'icon' },
  'idle-clicker': { emoji: '👆', Icon: MousePointer2, cardVariant: 0, preview: 'icon' },
  plinko: { emoji: '📍', Icon: CircleDot, cardVariant: 1, preview: 'icon' },
  'spin-wheel': { emoji: '🎡', Icon: Zap, cardVariant: 2, preview: 'icon' },
  'dice-game': { emoji: '🎲', Icon: Dice5, cardVariant: 3, preview: 'icon' },
  'endless-runner': { emoji: '🏃', Icon: Gamepad2, cardVariant: 4, preview: 'runner' },
  'car-runner': { emoji: '🚗', Icon: Car, cardVariant: 0, preview: 'car' },
  'match-3': { emoji: '🍬', Icon: Gem, cardVariant: 1, preview: 'candy' },
  'bubble-pop': { emoji: '💥', Icon: Candy, cardVariant: 2, preview: 'icon' },
};

export const CARD_BG_CLASSES: string[] = [
  'bg-[#FFF4E6] border-[#FFD8A8]',
  'bg-[#E8F8F5] border-[#9EE5D6]',
  'bg-[#FDEDEC] border-[#F5B7B1]',
  'bg-[#F4ECF7] border-[#D7BDE2]',
  'bg-[#EAF2F8] border-[#A9CCE3]',
];
