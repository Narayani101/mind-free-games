import type { DbAdapter } from './interface.js';
import type { GameConfigDoc, ScoreDoc, SessionDoc, UserDoc } from '../types.js';
import { defaultGameConfigs } from '../gameConfigs.js';

export class MemoryDb implements DbAdapter {
  users = new Map<string, UserDoc>();
  usersByEmail = new Map<string, string>();
  sessions = new Map<string, SessionDoc>();
  scores = new Map<string, ScoreDoc>();
  configs = new Map<string, GameConfigDoc>();

  async ensureTables(): Promise<void> {
    for (const c of defaultGameConfigs) {
      this.configs.set(c.gameId, c);
    }
  }

  async createUser(user: UserDoc): Promise<void> {
    this.users.set(user.userId, user);
    this.usersByEmail.set(user.email.toLowerCase(), user.userId);
  }

  async getUserByEmail(email: string): Promise<UserDoc | null> {
    const id = this.usersByEmail.get(email.toLowerCase());
    if (!id) return null;
    return this.users.get(id) ?? null;
  }

  async getUserById(userId: string): Promise<UserDoc | null> {
    return this.users.get(userId) ?? null;
  }

  async upsertSession(s: SessionDoc): Promise<void> {
    this.sessions.set(s.sessionId, { ...s });
  }

  async getSession(sessionId: string): Promise<SessionDoc | null> {
    return this.sessions.get(sessionId) ?? null;
  }

  async listSessionsForUser(userId: string, gameId?: string): Promise<SessionDoc[]> {
    const list = [...this.sessions.values()].filter((x) => x.userId === userId);
    const filtered = gameId ? list.filter((x) => x.gameId === gameId) : list;
    return filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  }

  async upsertScore(s: ScoreDoc): Promise<void> {
    const key = `${s.userId}#${s.gameId}`;
    this.scores.set(key, { ...s });
  }

  async getScore(userId: string, gameId: string): Promise<ScoreDoc | null> {
    return this.scores.get(`${userId}#${gameId}`) ?? null;
  }

  async listScores(userId: string): Promise<ScoreDoc[]> {
    return [...this.scores.values()].filter((x) => x.userId === userId);
  }

  async getGameConfig(gameId: string): Promise<GameConfigDoc | null> {
    return this.configs.get(gameId) ?? null;
  }

  async listGameConfigs(): Promise<GameConfigDoc[]> {
    return [...this.configs.values()];
  }

  async putGameConfig(c: GameConfigDoc): Promise<void> {
    this.configs.set(c.gameId, c);
  }
}
