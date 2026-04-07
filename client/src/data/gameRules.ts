export type GameRuleSet = {
  goal: string;
  controls: string;
  tip: string;
};

export const GAME_RULES: Record<string, GameRuleSet> = {
  snake: {
    goal: 'Eat food, grow longer, and avoid hitting walls or yourself.',
    controls: 'Arrow keys to steer. Press Start to begin.',
    tip: 'Plan corners early — your tail follows you.',
  },
  'tic-tac-toe': {
    goal: 'Get 3 in a row before your opponent.',
    controls: 'Click a square to place your mark. Keys 1–9 map to squares (top-left to bottom-right).',
    tip: 'Try to control the center first.',
  },
  'brick-breaker': {
    goal: 'Break all bricks by bouncing the ball with your paddle.',
    controls: 'Move the mouse to slide the paddle. Reset restarts the run.',
    tip: 'Hit bricks from the side to change the ball angle.',
  },
  'bubble-shooter': {
    goal: 'Drop bubbles so 3+ connected same colors clear.',
    controls: 'Tap a column to shoot your next bubble there.',
    tip: 'Aim for clusters touching many of the same color.',
  },
  maze: {
    goal: 'Reach the gold goal cell from the start.',
    controls: 'Arrow keys to move one step at a time.',
    tip: 'Try a smaller maze first to learn the layout.',
  },
  jigsaw: {
    goal: 'Swap tiles until the gradient order is restored (1 → 9).',
    controls: 'Tap one tile, then another to swap them.',
    tip: 'Find corners and edges first.',
  },
  'block-puzzle': {
    goal: 'Place shapes to complete full rows or columns and clear them.',
    controls: 'Pick a shape, then tap Place to try the default spot.',
    tip: 'Save space for the awkward L shapes.',
  },
  crossword: {
    goal: 'Fill every letter using the clues, then check your answers.',
    controls: 'Type one letter per cell. Disabled cells are blocked.',
    tip: 'Do the longest word first.',
  },
  'math-quiz': {
    goal: 'Answer before time runs out. Streaks add bonus points.',
    controls: 'Type the answer and press OK or Enter.',
    tip: 'Mental shortcuts beat panic typing.',
  },
  'magic-sort': {
    goal: 'Each tube should hold only one color (or be empty). Pour top balls between tubes.',
    controls: 'Tap source tube, then destination. Only matching colors stack; empty tubes accept any first ball.',
    tip: 'Use empty tubes as temporary storage.',
  },
  'idle-clicker': {
    goal: 'Grow your coin count with taps and upgrades.',
    controls: 'Tap the big button. Buy upgrades when you can afford them.',
    tip: 'Auto income compounds while you read this tip.',
  },
  plinko: {
    goal: 'Drop chips and collect multiplier points at the bottom.',
    controls: 'Click Drop; the chip bounces through pegs.',
    tip: 'Edges are risky — center run is steadier.',
  },
  'spin-wheel': {
    goal: 'Spin the wheel and add the landed sector to your score.',
    controls: 'Click Spin and wait for it to stop.',
    tip: 'High sectors are rarer — enjoy when you hit them.',
  },
  'dice-game': {
    goal: `Beat the house: your total after 5 rolls should meet or beat the target.`,
    controls: 'Click Roll. Watch the dice animate, then see your sum grow.',
    tip: 'Expect roughly 35–40 over 5 rolls — plan around the target.',
  },
  'endless-runner': {
    goal: 'Survive as long as you can; speed slowly increases.',
    controls: 'Space to jump over orange obstacles.',
    tip: 'Jump early — hitboxes are unforgiving.',
  },
  'car-runner': {
    goal: 'Dodge traffic in your lane. You get 3 crashes before game over.',
    controls: 'Left / Right arrows to switch lanes.',
    tip: 'Change lanes before the car reaches you.',
  },
  'match-3': {
    goal: 'Swap adjacent gems to make lines of 3+ and score.',
    controls: 'Tap one gem, then an adjacent gem to swap.',
    tip: 'Look for setup moves that create two clears at once.',
  },
  'bubble-pop': {
    goal: 'Pop groups of 2+ connected same-color bubbles. Bigger groups score more.',
    controls: 'Tap any bubble in a valid group.',
    tip: 'Scan for the largest blob before tapping.',
  },
};
