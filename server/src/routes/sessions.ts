import { Router } from 'express';
import { randomUUID } from 'crypto';
import { getDb } from '../db/index.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.get('/active/list', authRequired, async (req, res) => {
  try {
    const gameId = req.query.gameId as string | undefined;
    const db = await getDb();
    const list = await db.listSessionsForUser(req.user!.userId, gameId);
    const active = list.filter((x) => x.status === 'active');
    res.json({ sessions: active });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed' });
  }
});

router.post('/', authRequired, async (req, res) => {
  try {
    const { gameId, state, status, difficulty, sessionId } = req.body as {
      gameId?: string;
      state?: Record<string, unknown>;
      status?: 'active' | 'completed' | 'abandoned';
      difficulty?: string;
      sessionId?: string;
    };
    if (!gameId) {
      res.status(400).json({ error: 'gameId required' });
      return;
    }
    const db = await getDb();
    const userId = req.user!.userId;
    const now = new Date().toISOString();
    const sid = sessionId && (await db.getSession(sessionId))?.userId === userId
      ? sessionId
      : randomUUID();
    const existing = await db.getSession(sid);
    const doc = {
      sessionId: sid,
      userId,
      gameId,
      state: state ?? existing?.state ?? {},
      status: status ?? existing?.status ?? 'active',
      difficulty: difficulty ?? existing?.difficulty,
      updatedAt: now,
      createdAt: existing?.createdAt ?? now,
    };
    await db.upsertSession(doc);
    res.json({ session: doc });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save session' });
  }
});

router.get('/:sessionId', authRequired, async (req, res) => {
  try {
    const db = await getDb();
    const s = await db.getSession(req.params.sessionId);
    if (!s || s.userId !== req.user!.userId) {
      res.status(404).json({ error: 'Not found' });
      return;
    }
    res.json({ session: s });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
