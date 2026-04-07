import { ChevronDown, ChevronLeft, ChevronRight, ChevronUp } from 'lucide-react';

const padBtn =
  'flex h-12 w-12 items-center justify-center rounded-xl border-2 border-slate-200 bg-white text-slate-700 shadow-md active:scale-95 active:bg-slate-50 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 dark:active:bg-slate-700 sm:h-14 sm:w-14 touch-manipulation select-none';

/** 4-way control for Snake, Maze, etc. */
export function DirectionPad({
  onDir,
  className,
}: {
  onDir: (dx: number, dy: number) => void;
  className?: string;
}) {
  return (
    <div
      className={`mx-auto grid w-[168px] grid-cols-3 grid-rows-3 gap-1.5 sm:w-[188px] ${className ?? ''}`}
      role="group"
      aria-label="Direction controls"
    >
      <button type="button" className={`${padBtn} col-start-2 row-start-1`} aria-label="Up" onClick={() => onDir(0, -1)}>
        <ChevronUp className="h-6 w-6" strokeWidth={2.5} />
      </button>
      <button type="button" className={`${padBtn} col-start-1 row-start-2`} aria-label="Left" onClick={() => onDir(-1, 0)}>
        <ChevronLeft className="h-6 w-6" strokeWidth={2.5} />
      </button>
      <button type="button" className={`${padBtn} col-start-3 row-start-2`} aria-label="Right" onClick={() => onDir(1, 0)}>
        <ChevronRight className="h-6 w-6" strokeWidth={2.5} />
      </button>
      <button type="button" className={`${padBtn} col-start-2 row-start-3`} aria-label="Down" onClick={() => onDir(0, 1)}>
        <ChevronDown className="h-6 w-6" strokeWidth={2.5} />
      </button>
    </div>
  );
}

const laneBtn =
  'min-h-[48px] flex-1 rounded-2xl border-2 border-slate-200 bg-white py-3 text-sm font-black text-slate-800 shadow-md active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 touch-manipulation sm:text-base';

/** Left / right for lane-based runners */
export function LaneNudge({
  onLeft,
  onRight,
  className,
}: {
  onLeft: () => void;
  onRight: () => void;
  className?: string;
}) {
  return (
    <div className={`mx-auto flex w-full max-w-lg gap-3 px-1 ${className ?? ''}`}>
      <button type="button" className={laneBtn} onClick={onLeft} aria-label="Move left">
        ◀ Left
      </button>
      <button type="button" className={laneBtn} onClick={onRight} aria-label="Move right">
        Right ▶
      </button>
    </div>
  );
}

/** Jump / action — Endless Runner etc. */
export function JumpButton({
  onJump,
  label = 'Jump',
  className,
}: {
  onJump: () => void;
  label?: string;
  className?: string;
}) {
  return (
    <button
      type="button"
      className={`mx-auto min-h-[52px] w-full max-w-lg rounded-2xl border-2 border-sky-400 bg-gradient-to-b from-sky-100 to-sky-200 py-3.5 text-base font-black text-sky-950 shadow-md active:scale-[0.99] dark:border-sky-500 dark:from-sky-900/60 dark:to-sky-950/80 dark:text-sky-50 touch-manipulation sm:py-4 sm:text-lg ${className ?? ''}`}
      onClick={onJump}
    >
      {label}
    </button>
  );
}
