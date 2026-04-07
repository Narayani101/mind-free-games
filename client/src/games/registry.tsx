import type { ComponentType } from 'react';
import SnakeGame from './Snake';
import TicTacToeGame from './TicTacToe';
import BrickBreakerGame from './BrickBreaker';
import BubbleShooterGame from './BubbleShooter';
import MazeGame from './Maze';
import JigsawGame from './Jigsaw';
import BlockPuzzleGame from './BlockPuzzle';
import CrosswordGame from './Crossword';
import MathQuizGame from './MathQuiz';
import MagicSortGame from './MagicSort';
import IdleClickerGame from './IdleClicker';
import PlinkoGame from './Plinko';
import SpinWheelGame from './SpinWheel';
import DiceGame from './DiceGame';
import EndlessRunnerGame from './EndlessRunner';
import CarRunnerGame from './CarRunner';
import Match3Game from './Match3';
import BubblePopGame from './BubblePop';

export const GAME_COMPONENTS: Record<string, ComponentType> = {
  snake: SnakeGame,
  'tic-tac-toe': TicTacToeGame,
  'brick-breaker': BrickBreakerGame,
  'bubble-shooter': BubbleShooterGame,
  maze: MazeGame,
  jigsaw: JigsawGame,
  'block-puzzle': BlockPuzzleGame,
  crossword: CrosswordGame,
  'math-quiz': MathQuizGame,
  'magic-sort': MagicSortGame,
  'idle-clicker': IdleClickerGame,
  plinko: PlinkoGame,
  'spin-wheel': SpinWheelGame,
  'dice-game': DiceGame,
  'endless-runner': EndlessRunnerGame,
  'car-runner': CarRunnerGame,
  'match-3': Match3Game,
  'bubble-pop': BubblePopGame,
};
