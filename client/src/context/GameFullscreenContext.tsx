import { createContext, useContext, type ReactNode } from 'react';

const GameFullscreenContext = createContext(false);

export function GameFullscreenProvider({ fullscreen, children }: { fullscreen: boolean; children: ReactNode }) {
  return <GameFullscreenContext.Provider value={fullscreen}>{children}</GameFullscreenContext.Provider>;
}

/** True when this game’s shell is in browser fullscreen — use to scale the playfield. */
export function useGameFullscreen() {
  return useContext(GameFullscreenContext);
}
