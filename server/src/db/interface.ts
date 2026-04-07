import type { GameConfigDoc, ScoreDoc, SessionDoc, UserDoc } from '../types.js';

export interface DbAdapter {
  ensureTables(): Promise<void>;
  createUser(user: UserDoc): Promise<void>;
  getUserByEmail(email: string): Promise<UserDoc | null>;
  getUserById(userId: string): Promise<UserDoc | null>;
  upsertSession(s: SessionDoc): Promise<void>;
  getSession(sessionId: string): Promise<SessionDoc | null>;
  listSessionsForUser(userId: string, gameId?: string): Promise<SessionDoc[]>;
  upsertScore(s: ScoreDoc): Promise<void>;
  getScore(userId: string, gameId: string): Promise<ScoreDoc | null>;
  listScores(userId: string): Promise<ScoreDoc[]>;
  getGameConfig(gameId: string): Promise<GameConfigDoc | null>;
  listGameConfigs(): Promise<GameConfigDoc[]>;
  putGameConfig(c: GameConfigDoc): Promise<void>;
}
