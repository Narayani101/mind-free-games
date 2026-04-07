export type GameCategory =
  | 'arcade'
  | 'puzzle'
  | 'action'
  | 'runner'
  | 'match';

export interface GameConfigDoc {
  gameId: string;
  name: string;
  category: GameCategory;
  description: string;
  difficulties: string[];
  levels?: { id: string; name: string; config: Record<string, unknown> }[];
  settings: Record<string, unknown>;
}

export interface UserDoc {
  userId: string;
  email: string;
  name?: string;
  passwordHash: string;
  createdAt: string;
}

export interface SessionDoc {
  sessionId: string;
  userId: string;
  gameId: string;
  state: Record<string, unknown>;
  status: 'active' | 'completed' | 'abandoned';
  difficulty?: string;
  updatedAt: string;
  createdAt: string;
}

export interface ScoreDoc {
  userId: string;
  gameId: string;
  bestScore: number;
  lastScore: number;
  totalPlays: number;
  updatedAt: string;
}
