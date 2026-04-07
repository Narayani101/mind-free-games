import { forwardRef, type ButtonHTMLAttributes } from 'react';

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: 'primary' | 'secondary' | 'ghost';
};

export const PlayfulButton = forwardRef<HTMLButtonElement, Props>(
  ({ className = '', variant = 'primary', children, type = 'button', ...rest }, ref) => {
    const base =
      'inline-flex items-center justify-center gap-2 rounded-[20px] px-6 py-3 text-base font-bold transition-all duration-200 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-45';
    const styles =
      variant === 'primary'
        ? 'bg-gradient-to-r from-[#FF8A65] to-[#FF6B6B] text-white shadow-md shadow-orange-200/80 hover:from-[#ff7a54] hover:to-[#ff5a5a] hover:-translate-y-0.5 hover:shadow-lg dark:from-[#38BDF8] dark:to-[#818CF8] dark:shadow-sky-900/40'
        : variant === 'secondary'
          ? 'bg-gradient-to-r from-[#5DADE2] to-[#7ED957] text-white shadow-md shadow-sky-200/80 hover:from-[#4eb8e0] hover:to-[#6fce4a] hover:-translate-y-0.5 dark:from-[#0EA5E9] dark:to-[#22C55E] dark:shadow-slate-900/40'
          : 'bg-white/90 text-slate-800 border-2 border-slate-200 hover:bg-sky-50 hover:border-[#5DADE2] hover:text-slate-900 dark:border-slate-600 dark:bg-slate-800/90 dark:text-slate-100 dark:hover:bg-slate-700 dark:hover:border-[#38BDF8] dark:hover:text-white';
    return (
      <button ref={ref} type={type} className={`${base} ${styles} ${className}`} {...rest}>
        {children}
      </button>
    );
  }
);
PlayfulButton.displayName = 'PlayfulButton';
