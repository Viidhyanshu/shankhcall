import { Router, Request, Response } from 'express';
import { db, users, sessions } from '../db/index.js';
import { eq, and, gt } from 'drizzle-orm';
import crypto from 'crypto';

const router = Router();

function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString('hex');
  const hash = crypto.scryptSync(password, salt, 64).toString('hex');
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, combined: string): boolean {
  try {
    const [salt, key] = combined.split(':');
    if (!salt || !key) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString('hex');
    return crypto.timingSafeEqual(Buffer.from(key, 'hex'), Buffer.from(hash, 'hex'));
  } catch {
    return false;
  }
}

async function createSession(userId: string, res: Response) {
  const sessionId = 'sess-' + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  res.cookie('session_token', sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    expires: expiresAt,
  });

  return sessionId;
}

// POST /api/auth/signup
router.post('/signup', async (req: Request, res: Response) => {
  try {
    const { name, email, phone, role, password } = req.body;

    if (!name || !email) {
      return res.status(400).json({ success: false, error: 'Name and email are required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    // Check existing
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return res.status(400).json({ success: false, error: 'This email is already in use.' });
    }

    const userId = 'usr-' + Date.now() + '-' + Math.random().toString(36).slice(2, 7);
    const hashedPassword = password ? hashPassword(password) : null;

    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        name: String(name).trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: phone ? String(phone).trim() : null,
        role: role || 'citizen',
      })
      .returning();

    await createSession(newUser.id, res);

    return res.status(201).json({
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      },
    });
  } catch (err: any) {
    console.error('Signup error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Signup failed' });
  }
});

// POST /api/auth/signin
router.post('/signin', async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email) {
      return res.status(400).json({ success: false, error: 'Email is required.' });
    }

    const normalizedEmail = String(email).trim().toLowerCase();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return res.status(401).json({ success: false, error: 'Invalid email or password.' });
    }

    if (user.password && password) {
      const isValid = verifyPassword(password, user.password);
      if (!isValid) {
        return res.status(401).json({ success: false, error: 'Invalid email or password.' });
      }
    }

    await createSession(user.id, res);

    return res.json({
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    });
  } catch (err: any) {
    console.error('Signin error:', err);
    return res.status(500).json({ success: false, error: err.message || 'Signin failed' });
  }
});

// GET /api/auth/me
router.get('/me', async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies?.session_token;

    if (!sessionId) {
      return res.json({ success: true, user: null });
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
      .where(and(eq(sessions.id, sessionId), gt(sessions.expiresAt, now)))
      .limit(1);

    if (rows.length === 0) {
      return res.json({ success: true, user: null });
    }

    return res.json({
      success: true,
      user: {
        id: rows[0].id,
        name: rows[0].name,
        email: rows[0].email,
        role: rows[0].role,
        phone: rows[0].phone,
      },
    });
  } catch (err: any) {
    console.error('Get user error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/auth/signout
router.post('/signout', async (req: Request, res: Response) => {
  try {
    const sessionId = req.cookies?.session_token;

    if (sessionId) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    res.clearCookie('session_token');
    return res.json({ success: true });
  } catch (err: any) {
    console.error('Signout error:', err);
    return res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
