import { CircleHelp } from 'lucide-react';
import type { GameRuleSet } from '@/data/gameRules';

export function GameRulesTooltip({ gameName, rules }: { gameName: string; rules: GameRuleSet }) {
  return (
    <span className="group relative inline-flex items-center">
      <button
        type="button"
        className="ml-1.5 rounded-full p-1 text-[#5DADE2] transition hover:bg-sky-100 hover:text-sky-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-[#FFD93D]"
        aria-label={`How to play ${gameName}`}
      >
        <CircleHelp className="h-5 w-5" strokeWidth={2.2} />
      </button>
      <span
        role="tooltip"
        className="pointer-events-none absolute left-1/2 top-full z-50 mt-2 hidden w-[min(100vw-2rem,22rem)] -translate-x-1/2 rounded-2xl border-2 border-slate-200 bg-white p-4 text-left text-sm text-slate-700 shadow-xl group-hover:block group-focus-within:block"
      >
        <span className="font-bold text-[#FF8A65]">{gameName}</span>
        <p className="mt-2">
          <span className="font-semibold text-slate-900">Goal:</span> {rules.goal}
        </p>
        <p className="mt-2">
          <span className="font-semibold text-slate-900">Controls:</span> {rules.controls}
        </p>
        <p className="mt-2">
          <span className="font-semibold text-[#7ED957]">Tip:</span> {rules.tip}
        </p>
      </span>
    </span>
  );
}
