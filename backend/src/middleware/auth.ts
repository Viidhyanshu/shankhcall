import { Request, Response, NextFunction } from 'express';
import { db, users, sessions } from '../db/index.js';
import { eq, and, gt } from 'drizzle-orm';

export interface AuthenticatedUser {
  id: string;
  name: string;
  email: string;
  role: string;
  phone?: string | null;
}

export interface AuthRequest extends Request {
  user?: AuthenticatedUser;
}

// Extract session token from either HTTP-only cookie or Authorization Bearer header
function extractToken(req: Request): string | null {
  if (req.cookies?.session_token) {
    return req.cookies.session_token;
  }

  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7).trim();
  }

  return null;
}

// 1. Mandatory Authentication Middleware: Rejects if session is missing, expired, or invalid
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionToken = extractToken(req);

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No active session. Please log in.',
      });
    }

    const now = new Date();
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, sessionToken), gt(sessions.expiresAt, now)))
      .limit(1);

    if (rows.length === 0) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Session is invalid or has expired.',
      });
    }

    req.user = {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      role: rows[0].role,
      phone: rows[0].phone,
    };

    return next();
  } catch (error: any) {
    console.error('Authentication middleware error:', error);
    return res.status(500).json({
      success: false,
      error: 'Internal server error during authentication.',
    });
  }
}

// 2. Optional Authentication Middleware: Attaches user if token exists, but doesn't block request
export async function optionalAuth(
  req: AuthRequest,
  _res: Response,
  next: NextFunction
) {
  try {
    const sessionToken = extractToken(req);

    if (!sessionToken) {
      return next();
    }

    const now = new Date();
    const rows = await db
      .select({
        id: users.id,
        name: users.name,
        email: users.email,
        role: users.role,
        phone: users.phone,
        expiresAt: sessions.expiresAt,
      })
      .from(sessions)
      .innerJoin(users, eq(sessions.userId, users.id))
      .where(and(eq(sessions.id, sessionToken), gt(sessions.expiresAt, now)))
      .limit(1);

    if (rows.length > 0) {
      req.user = {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        role: rows[0].role,
        phone: rows[0].phone,
      };
    }

    return next();
  } catch (error) {
    console.error('Optional auth middleware error:', error);
    return next();
  }
}

// 3. Role-Based Authorization Middleware: Checks if user possesses allowed role(s)
export function requireRole(...allowedRoles: string[]) {
  return (req: AuthRequest, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: Please log in first.',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        success: false,
        error: `Forbidden: This action requires one of the following roles: [${allowedRoles.join(', ')}]. Your current role is "${req.user.role}".`,
      });
    }

    return next();
  };
}

// 4. Official Guard: Specialized middleware for disaster verification & official tasks
export const requireOfficial = requireRole('official', 'admin');
