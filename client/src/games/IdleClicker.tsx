import { useEffect, useRef, useState } from 'react';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';
import { PlayfulButton } from '@/components/ui/PlayfulButton';

const GAME_ID = 'idle-clicker';
const ROUND_SECONDS = 90;

export default function IdleClickerGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const [coins, setCoins] = useState(0);
  const coinsRef = useRef(0);
  coinsRef.current = coins;
  const [perClick, setPerClick] = useState(1);
  const [auto, setAuto] = useState(0);
  const [roundActive, setRoundActive] = useState(false);
  const [roundLeft, setRoundLeft] = useState(ROUND_SECONDS);
  const [roundOver, setRoundOver] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => {
      setCoins((c) => {
        const nc = c + auto;
        saveState({ coins: nc, perClick, auto });
        return nc;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [auto, perClick, saveState]);

  useEffect(() => {
    if (!roundActive || roundOver) return;
    const id = window.setInterval(() => {
      setRoundLeft((s) => {
        if (s <= 1) {
          setRoundActive(false);
          const fs = Math.floor(coinsRef.current);
          setFinalScore(fs);
          setRoundOver(true);
          void reportScore(fs);
          return 0;
        }
        return s - 1;
      });
    }, 1000);
    return () => window.clearInterval(id);
  }, [roundActive, roundOver, reportScore]);

  const click = () => {
    setCoins((c) => {
      const nc = c + perClick;
      void reportScore(nc);
      saveState({ coins: nc, perClick, auto });
      return nc;
    });
  };

  const buyClick = () => {
    const cost = 25 * perClick;
    setCoins((c) => {
      if (c < cost) return c;
      const nc = c - cost;
      setPerClick((p) => p + 1);
      saveState({ coins: nc, perClick: perClick + 1, auto });
      return nc;
    });
  };

  const buyAuto = () => {
    const cost = 50 * (auto + 1);
    setCoins((c) => {
      if (c < cost) return c;
      const nc = c - cost;
      setAuto((a) => a + 1);
      saveState({ coins: nc, perClick, auto: auto + 1 });
      return nc;
    });
  };

  const startRound = () => {
    setRoundOver(false);
    setRoundLeft(ROUND_SECONDS);
    setRoundActive(true);
  };

  return (
    <GameShell
      gameId={GAME_ID}
      title="Idle Clicker"
      actions={
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
          <span>
            Coins: <span className="font-mono text-[#5DADE2] dark:text-[#38BDF8]">{Math.floor(coins)}</span>
          </span>
          {roundActive && (
            <span className="rounded-full bg-gradient-to-r from-[#FF8A65] to-[#FF6B6B] px-3 py-1 text-white shadow-sm">
              Round: {roundLeft}s
            </span>
          )}
        </div>
      }
      resultModal={
        roundOver
          ? {
              open: true,
              kind: 'win',
              title: 'Round complete!',
              message: `Your ${ROUND_SECONDS}s run is over.`,
              score: finalScore,
              onPlayAgain: () => {
                setRoundOver(false);
                setCoins(0);
                setPerClick(1);
                setAuto(0);
                setFinalScore(0);
              },
            }
          : undefined
      }
    >
      <p className="mb-4 text-center text-sm font-medium text-slate-600 dark:text-slate-400">
        Tap for coins, buy upgrades, or start a <strong>{ROUND_SECONDS}s</strong> timed round — your coin total
        when time hits zero is saved as your score.
      </p>
      <div className="flex flex-col items-center gap-6">
        <PlayfulButton
          variant="primary"
          className="!h-36 !w-36 !rounded-full !p-0 !text-xl"
          type="button"
          onClick={click}
        >
          Tap!
        </PlayfulButton>
        <div className="flex flex-wrap justify-center gap-3">
          <PlayfulButton variant="secondary" type="button" className="!text-sm" onClick={buyClick}>
            +1 / click — {25 * perClick} coins
          </PlayfulButton>
          <PlayfulButton variant="secondary" type="button" className="!text-sm" onClick={buyAuto}>
            +1 / sec — {50 * (auto + 1)} coins
          </PlayfulButton>
          <PlayfulButton variant="ghost" type="button" className="!text-sm" onClick={startRound} disabled={roundActive}>
            Start {ROUND_SECONDS}s round
          </PlayfulButton>
        </div>
        <p className="text-center text-sm font-semibold text-slate-600 dark:text-slate-400">
          Per tap: {perClick} · Auto: {auto}/s
        </p>
      </div>
    </GameShell>
  );
}
