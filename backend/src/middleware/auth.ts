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

// Middleware to verify session_token from HTTP-only cookie against Neon sessions table
export async function authenticate(
  req: AuthRequest,
  res: Response,
  next: NextFunction
) {
  try {
    const sessionToken = req.cookies?.session_token;

    if (!sessionToken) {
      return res.status(401).json({
        success: false,
        error: 'Unauthorized: No active session.',
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

    // Attach validated user to the request object
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
