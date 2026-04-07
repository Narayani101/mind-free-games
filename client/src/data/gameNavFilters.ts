/** Top-nav category → game ids (strict portal grouping per product spec). */
export const NAV_GAME_IDS: Record<string, readonly string[]> = {
  arcade: ['dice-game', 'tic-tac-toe'],
  puzzle: ['crossword', 'magic-sort'],
  action: ['bubble-shooter', 'bubble-pop'],
  runner: ['endless-runner', 'car-runner'],
  match: ['match-3'],
} as const;

export type NavCategory = keyof typeof NAV_GAME_IDS;

export function isNavCategory(s: string): s is NavCategory {
  return s in NAV_GAME_IDS;
}
