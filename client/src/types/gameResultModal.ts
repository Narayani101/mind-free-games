import type { ResultKind } from '@/components/GameResultModal';

/** Optional outcome modal wired through GameShell for consistent UX. */
export type GameShellResultModal = {
  open: boolean;
  kind: ResultKind;
  title: string;
  message?: string;
  score?: number;
  detail?: string;
  onPlayAgain?: () => void;
  continueLabel?: string;
  onContinue?: () => void;
  /** Called when modal closes via backdrop flow (optional). */
  onDismiss?: () => void;
};
