/** Shared Poki-style visual tokens for game chrome and HUD */
export const poki = {
  bezel:
    'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[28px] border border-white/50 bg-gradient-to-br from-white/95 via-[#f0f7ff]/95 to-[#fff5f5]/95 p-1 shadow-[0_20px_50px_-12px_rgba(15,23,42,0.25),0_8px_24px_-8px_rgba(99,102,241,0.15)] ring-1 ring-slate-200/60 backdrop-blur-xl dark:border-slate-600/50 dark:from-slate-900/95 dark:via-slate-900/90 dark:to-[#0f172a]/95 dark:shadow-[0_24px_60px_-12px_rgba(0,0,0,0.55)] dark:ring-slate-700/50',
  bezelInner:
    'pointer-events-none absolute inset-0 rounded-[26px] bg-gradient-to-b from-white/40 to-transparent dark:from-white/5',
  screen:
    'relative flex min-h-0 flex-1 flex-col overflow-hidden rounded-[22px] border border-slate-200/80 bg-gradient-to-b from-slate-50/90 via-white to-[#f8fafc] shadow-inner dark:border-slate-700/80 dark:from-slate-950/90 dark:via-slate-900 dark:to-slate-950',
  title:
    'bg-gradient-to-r from-[#FF6B6B] via-[#A78BFA] to-[#5DADE2] bg-clip-text text-xl font-black tracking-tight text-transparent drop-shadow-sm dark:from-[#38BDF8] dark:via-[#C084FC] dark:to-[#F472B6] sm:text-2xl',
  hudBar:
    'flex flex-wrap items-center gap-2 rounded-2xl border border-slate-200/90 bg-gradient-to-r from-white/90 to-slate-50/90 px-3 py-2 shadow-md dark:border-slate-600 dark:from-slate-800/90 dark:to-slate-900/90',
  hudStat:
    'rounded-xl border border-slate-200/80 bg-white/80 px-3 py-1 text-xs font-black text-slate-700 shadow-sm dark:border-slate-600 dark:bg-slate-800/80 dark:text-slate-100 sm:text-sm',
  helpBtn:
    'inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl border-2 border-slate-200 bg-white text-[#5DADE2] shadow-md transition hover:scale-105 hover:border-[#5DADE2] hover:bg-sky-50 active:scale-95 dark:border-slate-600 dark:bg-slate-800 dark:text-[#38BDF8] dark:hover:border-[#38BDF8]',
  chromeBtn:
    'inline-flex shrink-0 items-center gap-2 rounded-2xl border-2 border-slate-200/90 bg-white/90 px-3 py-2 text-xs font-black text-slate-800 shadow-md transition hover:scale-[1.02] hover:border-[#5DADE2] hover:shadow-lg active:scale-[0.98] dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:border-[#38BDF8] sm:px-4 sm:py-2.5 sm:text-sm',
} as const;
