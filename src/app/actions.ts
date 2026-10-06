"use server";
import { db, reports, users, sessions } from "@/db";
import { desc, eq, and, gt } from "drizzle-orm";
import { cookies } from "next/headers";
import crypto from "crypto";

// Password hashing helpers
function hashPassword(password: string): string {
  const salt = crypto.randomBytes(16).toString("hex");
  const hash = crypto.scryptSync(password, salt, 64).toString("hex");
  return `${salt}:${hash}`;
}

function verifyPassword(password: string, combined: string): boolean {
  try {
    const [salt, key] = combined.split(":");
    if (!salt || !key) return false;
    const hash = crypto.scryptSync(password, salt, 64).toString("hex");
    return crypto.timingSafeEqual(Buffer.from(key, "hex"), Buffer.from(hash, "hex"));
  } catch {
    return false;
  }
}

// Server-side Session Helper: writes to Neon and sets HTTP-only cookie
async function createServerSession(userId: string) {
  const sessionId = "sess-" + crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000); // 7 days

  // Persist session in Neon PostgreSQL
  await db.insert(sessions).values({
    id: sessionId,
    userId,
    expiresAt,
  });

  // Set HTTP-only secure cookie
  const cookieStore = await cookies();
  cookieStore.set("session_token", sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    expires: expiresAt,
  });

  return sessionId;
}

// 1. Sign Up (Neon Server-Side Auth)
export async function signUpAction(params: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  password?: string;
}) {
  try {
    const normalizedEmail = params.email.trim().toLowerCase();

    // Check if user already exists in Neon
    const existing = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (existing.length > 0) {
      return { success: false, error: "This email address is already in use." };
    }

    const userId = "usr-" + Date.now() + "-" + Math.random().toString(36).slice(2, 7);
    const hashedPassword = params.password ? hashPassword(params.password) : null;

    const [newUser] = await db
      .insert(users)
      .values({
        id: userId,
        name: params.name.trim(),
        email: normalizedEmail,
        password: hashedPassword,
        phone: params.phone?.trim() || null,
        role: params.role || "citizen",
      })
      .returning();

    // Establish Neon server-side session
    await createServerSession(newUser.id);

    return {
      success: true,
      user: {
        id: newUser.id,
        name: newUser.name,
        email: newUser.email,
        role: newUser.role,
        phone: newUser.phone,
      },
    };
  } catch (error: any) {
    console.error("Sign up error in Neon:", error);
    return { success: false, error: error.message || "Failed to create account." };
  }
}

// 2. Sign In (Neon Server-Side Auth)
export async function signInAction(params: {
  email: string;
  password?: string;
}) {
  try {
    const normalizedEmail = params.email.trim().toLowerCase();

    const [user] = await db
      .select()
      .from(users)
      .where(eq(users.email, normalizedEmail))
      .limit(1);

    if (!user) {
      return { success: false, error: "Invalid email or password." };
    }

    // Verify password if set
    if (user.password && params.password) {
      const isValid = verifyPassword(params.password, user.password);
      if (!isValid) {
        return { success: false, error: "Invalid email or password." };
      }
    }

    // Establish Neon server-side session
    await createServerSession(user.id);

    return {
      success: true,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
      },
    };
  } catch (error: any) {
    console.error("Sign in error in Neon:", error);
    return { success: false, error: error.message || "Sign in failed." };
  }
}

// 3. Get Current User (Neon Server-Side Verification)
export async function getCurrentUserAction() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_token")?.value;

    if (!sessionId) {
      return null;
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
      return null;
    }

    return {
      id: rows[0].id,
      name: rows[0].name,
      email: rows[0].email,
      role: rows[0].role,
      phone: rows[0].phone,
    };
  } catch (error) {
    console.error("Error fetching current user from Neon:", error);
    return null;
  }
}

// 4. Sign Out (Neon Server-Side Logout)
export async function signOutAction() {
  try {
    const cookieStore = await cookies();
    const sessionId = cookieStore.get("session_token")?.value;

    if (sessionId) {
      await db.delete(sessions).where(eq(sessions.id, sessionId));
    }

    cookieStore.delete("session_token");
    return { success: true };
  } catch (error) {
    console.error("Sign out error in Neon:", error);
    return { success: false };
  }
}

// 5. Fetch Reports (Neon PostgreSQL)
export async function getReports() {
  try {
    return await db.select().from(reports).orderBy(desc(reports.ts));
  } catch (error) {
    console.error("Failed to fetch reports from Neon:", error);
    return [];
  }
}

// 6. Add Report (Neon PostgreSQL)
export async function addReportAction(report: {
  id: string;
  lat: number;
  lng: number;
  type: string;
  description: string;
  src?: string;
  verified?: boolean;
  ts: number;
  lang?: string;
  sentiment?: number;
  media?: Array<{ type: "image" | "video"; data: string; name: string }>;
}) {
  try {
    const [inserted] = await db
      .insert(reports)
      .values({
        id: report.id,
        lat: report.lat,
        lng: report.lng,
        type: report.type,
        description: report.description,
        src: report.src || "citizen",
        verified: report.verified ?? false,
        ts: report.ts,
        lang: report.lang || "en",
        sentiment: report.sentiment ?? 0,
        media: report.media || [],
      })
      .returning();

    return { success: true, data: inserted };
  } catch (error: any) {
    console.error("Failed to add report to Neon DB:", error);
    return { success: false, error: error.message };
  }
}

// 7. Verify Report (Neon PostgreSQL)
export async function verifyReportAction(id: string) {
  try {
    const [updated] = await db
      .update(reports)
      .set({ verified: true })
      .where(eq(reports.id, id))
      .returning();

    return { success: true, data: updated };
  } catch (error: any) {
    console.error("Failed to verify report in Neon DB:", error);
    return { success: false, error: error.message };
  }
}
