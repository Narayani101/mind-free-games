export type GameCategory =
  | 'arcade'
  | 'puzzle'
  | 'action'
  | 'runner'
  | 'match';

export interface ServerSession {
  sessionId: string;
  userId: string;
  gameId: string;
  state: Record<string, unknown>;
  status: 'active' | 'completed' | 'abandoned';
  difficulty?: string;
  updatedAt: string;
  createdAt: string;
}
