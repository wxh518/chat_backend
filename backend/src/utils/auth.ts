import jwt from 'jsonwebtoken';

const SECRET = process.env.JWT_SECRET || 'dev_secret'; // 生产环境请用更安全的密钥
const EXPIRES_IN = '7d'; // token 有效期

export interface JwtPayload {
  userId: string;
}

export function signToken(payload: JwtPayload): string {
  return jwt.sign(payload, SECRET, { expiresIn: EXPIRES_IN });
}

export function verifyToken(token: string): JwtPayload | null {
  try {
    return jwt.verify(token, SECRET) as JwtPayload;
  } catch {
    return null;
  }
}
