import { useCallback, useEffect, useState } from 'react';
import { GameShell } from '@/components/GameShell';
import { useGameSession } from '@/hooks/useGameSession';
import { PlayfulButton } from '@/components/ui/PlayfulButton';

const GAME_ID = 'math-quiz';
const MAX_ROUNDS = 10;

function makeQuestion(diff: 'easy' | 'medium' | 'hard') {
  const a =
    diff === 'easy'
      ? Math.floor(Math.random() * 12) + 1
      : diff === 'medium'
        ? Math.floor(Math.random() * 30) + 5
        : Math.floor(Math.random() * 50) + 10;
  const b =
    diff === 'easy'
      ? Math.floor(Math.random() * 12) + 1
      : diff === 'medium'
        ? Math.floor(Math.random() * 30) + 5
        : Math.floor(Math.random() * 50) + 10;
  const ops = ['+', '-', '*'] as const;
  const op = ops[Math.floor(Math.random() * (diff === 'easy' ? 2 : 3))]!;
  let ans = 0;
  if (op === '+') ans = a + b;
  if (op === '-') ans = a - b;
  if (op === '*') ans = a * b;
  return { text: `${a} ${op} ${b}`, answer: ans };
}

export default function MathQuizGame() {
  const { reportScore, saveState } = useGameSession(GAME_ID);
  const [diff, setDiff] = useState<'easy' | 'medium' | 'hard'>('medium');
  const [round, setRound] = useState(1);
  const [q, setQ] = useState(() => makeQuestion('medium'));
  const [input, setInput] = useState('');
  const [streak, setStreak] = useState(0);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(8);
  const [finished, setFinished] = useState(false);
  const [finalScore, setFinalScore] = useState(0);

  useEffect(() => {
    if (finished) return;
    setQ(makeQuestion(diff));
    setTimeLeft(8);
  }, [round, diff, finished]);

  useEffect(() => {
    if (finished) return;
    if (timeLeft <= 0) return;
    const t = window.setInterval(() => setTimeLeft((s) => s - 1), 1000);
    return () => window.clearInterval(t);
  }, [round, timeLeft, finished]);

  useEffect(() => {
    if (finished || timeLeft > 0) return;
    setStreak(0);
    if (round >= MAX_ROUNDS) {
      setFinished(true);
      setFinalScore(score);
      void reportScore(score);
      saveState({ done: true }, { status: 'completed' });
      return;
    }
    setRound((r) => r + 1);
  }, [timeLeft, round, finished, score, reportScore, saveState]);

  const submit = useCallback(() => {
    if (finished) return;
    const n = Number(input);
    if (Number.isNaN(n)) return;
    let nextScore = score;
    if (n === q.answer) {
      const add = 10 + streak * 5;
      nextScore = score + add;
      setScore(nextScore);
      setStreak((s) => s + 1);
      void reportScore(nextScore);
      saveState({ score: nextScore, round });
    } else {
      setStreak(0);
    }
    setInput('');
    if (round >= MAX_ROUNDS) {
      setFinished(true);
      setFinalScore(nextScore);
      void reportScore(nextScore);
      saveState({ done: true }, { status: 'completed' });
      return;
    }
    setRound((r) => r + 1);
  }, [input, q.answer, round, reportScore, saveState, score, streak, finished]);

  const resetQuiz = () => {
    setRound(1);
    setScore(0);
    setStreak(0);
    setInput('');
    setFinished(false);
    setFinalScore(0);
    setQ(makeQuestion(diff));
    setTimeLeft(8);
  };

  return (
    <GameShell
      gameId={GAME_ID}
      title="Math Quiz"
      actions={
        <div className="flex flex-wrap items-center gap-3 text-sm font-bold text-slate-700 dark:text-slate-200">
          <span>
            Score: <span className="font-mono text-[#5DADE2] dark:text-[#38BDF8]">{score}</span>
          </span>
          <span>
            Round {Math.min(round, MAX_ROUNDS)}/{MAX_ROUNDS}
          </span>
          <span className="rounded-full bg-gradient-to-r from-[#FFE8E8] to-[#FFD6A5] px-2 py-0.5 text-slate-800 dark:from-slate-700 dark:to-slate-600 dark:text-slate-100">
            Time: {timeLeft}s
          </span>
          <select
            value={diff}
            onChange={(e) => setDiff(e.target.value as typeof diff)}
            className="rounded-lg border-2 border-slate-200 bg-white px-2 py-1 text-xs font-bold text-slate-800 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 sm:text-sm"
            disabled={finished}
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
      }
      resultModal={
        finished
          ? {
              open: true,
              kind: 'win',
              title: 'Quiz complete!',
              message: 'Great mental workout — here is how you scored.',
              score: finalScore,
              onPlayAgain: () => resetQuiz(),
            }
          : undefined
      }
    >
      {!finished ? (
        <>
          <p className="mb-6 text-center text-3xl font-mono font-bold text-slate-800 dark:text-slate-100">
            {q.text} = ?
          </p>
          <div className="mx-auto flex max-w-xs gap-2">
            <input
              type="number"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && submit()}
              className="flex-1 rounded-lg border-2 border-slate-200 bg-white px-3 py-2 font-semibold text-slate-900 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100"
              placeholder="Answer"
            />
            <PlayfulButton type="button" className="!px-4 !py-2 !text-sm" onClick={submit}>
              OK
            </PlayfulButton>
          </div>
          <p className="mt-4 text-center text-sm font-semibold text-slate-600 dark:text-slate-400">Streak: {streak}</p>
        </>
      ) : null}
    </GameShell>
  );
}
