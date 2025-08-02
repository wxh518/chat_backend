import { Request, Response, NextFunction } from 'express';
import { verifyToken } from '../utils/auth';

export function authMiddleware(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers['authorization'];
  if (!authHeader) {
    res.status(401).json({ message: 'No token provided' });
    return;
  }
  const token = authHeader.replace(/^Bearer\s+/i, '');
  const payload = verifyToken(token);
  if (!payload) {
    res.status(401).json({ message: 'Invalid or expired token' });
    return;
  }
  // @ts-ignore
  req.user = payload;
  next();
  return;
}
