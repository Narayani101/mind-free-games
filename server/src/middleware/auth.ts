import type { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';

export interface AuthPayload {
  userId: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

function secret(): string {
  return process.env.JWT_SECRET || 'dev-insecure-jwt-secret-change-me';
}

export function signToken(payload: AuthPayload): string {
  return jwt.sign(payload, secret(), { expiresIn: '30d' });
}

export function verifyToken(token: string): AuthPayload {
  return jwt.verify(token, secret()) as AuthPayload;
}

export function authOptional(req: Request, _res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (h?.startsWith('Bearer ')) {
    try {
      req.user = verifyToken(h.slice(7));
    } catch {
      req.user = undefined;
    }
  }
  next();
}

export function authRequired(req: Request, res: Response, next: NextFunction) {
  const h = req.headers.authorization;
  if (!h?.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Unauthorized' });
    return;
  }
  try {
    req.user = verifyToken(h.slice(7));
    next();
  } catch {
    res.status(401).json({ error: 'Invalid token' });
  }
}
