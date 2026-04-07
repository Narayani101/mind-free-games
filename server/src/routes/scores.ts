import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/', authRequired, async (req, res) => {
  try {
    const { gameId, score } = req.body as { gameId?: string; score?: number };
    if (gameId === undefined || typeof score !== 'number') {
      res.status(400).json({ error: 'gameId and numeric score required' });
      return;
    }
    const db = await getDb();
    const userId = req.user!.userId;
    const now = new Date().toISOString();
    const prev = await db.getScore(userId, gameId);
    const bestScore = prev ? Math.max(prev.bestScore, score) : score;
    const totalPlays = (prev?.totalPlays ?? 0) + 1;
    await db.upsertScore({
      userId,
      gameId,
      bestScore,
      lastScore: score,
      totalPlays,
      updatedAt: now,
    });
    res.json({
      bestScore,
      lastScore: score,
      totalPlays,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to save score' });
  }
});

router.get('/mine', authRequired, async (req, res) => {
  try {
    const db = await getDb();
    const scores = await db.listScores(req.user!.userId);
    res.json({ scores });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
