import { Router } from 'express';
import { getDb } from '../db/index.js';
import { authOptional } from '../middleware/auth.js';

const router = Router();

router.get('/', authOptional, async (_req, res) => {
  try {
    const db = await getDb();
    const configs = await db.listGameConfigs();
    res.json({ games: configs });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed to list games' });
  }
});

router.get('/:gameId/config', authOptional, async (req, res) => {
  try {
    const db = await getDb();
    const c = await db.getGameConfig(req.params.gameId);
    if (!c) {
      res.status(404).json({ error: 'Unknown game' });
      return;
    }
    res.json(c);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
