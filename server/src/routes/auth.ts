import { Router } from 'express';
import bcrypt from 'bcryptjs';
import { randomUUID } from 'crypto';
import { getDb } from '../db/index.js';
import { signToken, authRequired } from '../middleware/auth.js';

const router = Router();

router.post('/register', async (req, res) => {
  try {
    const { email, password, name } = req.body as {
      email?: string;
      password?: string;
      name?: string;
    };
    if (!email || !password || password.length < 6) {
      res.status(400).json({ error: 'Valid email and password (6+ chars) required' });
      return;
    }
    const db = await getDb();
    const existing = await db.getUserByEmail(email);
    if (existing) {
      res.status(409).json({ error: 'Email already registered' });
      return;
    }
    const userId = randomUUID();
    const passwordHash = await bcrypt.hash(password, 10);
    const createdAt = new Date().toISOString();
    const displayName = typeof name === 'string' && name.trim() ? name.trim() : undefined;
    await db.createUser({
      userId,
      email: email.trim(),
      name: displayName,
      passwordHash,
      createdAt,
    });
    const token = signToken({ userId, email: email.trim() });
    res.status(201).json({
      token,
      user: { userId, email: email.trim(), name: displayName ?? null },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Registration failed' });
  }
});

router.post('/login', async (req, res) => {
  try {
    const { email, password } = req.body as { email?: string; password?: string };
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password required' });
      return;
    }
    const db = await getDb();
    const user = await db.getUserByEmail(email);
    if (!user || !(await bcrypt.compare(password, user.passwordHash))) {
      res.status(401).json({ error: 'Invalid credentials' });
      return;
    }
    const token = signToken({ userId: user.userId, email: user.email });
    res.json({
      token,
      user: { userId: user.userId, email: user.email, name: user.name ?? null },
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Login failed' });
  }
});

router.get('/me', authRequired, async (req, res) => {
  try {
    const db = await getDb();
    const u = await db.getUserById(req.user!.userId);
    if (!u) {
      res.status(404).json({ error: 'User not found' });
      return;
    }
    res.json({
      userId: u.userId,
      email: u.email,
      name: u.name ?? null,
      createdAt: u.createdAt,
    });
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: 'Failed' });
  }
});

export default router;
