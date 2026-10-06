"use server";
import { db, reports, users } from "@/db";
import { desc, eq } from "drizzle-orm";
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

// 1. Sign Up User (Neon PostgreSQL)
export async function signUpAction(params: {
  name: string;
  email: string;
  phone?: string;
  role: string;
  password?: string;
}) {
  try {
    const normalizedEmail = params.email.trim().toLowerCase();

    // Check if user already exists
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

// 2. Sign In User (Neon PostgreSQL)
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

    // If a password was stored, verify it
    if (user.password && params.password) {
      const isValid = verifyPassword(params.password, user.password);
      if (!isValid) {
        return { success: false, error: "Invalid email or password." };
      }
    }

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

// 3. Fetch Reports (Neon PostgreSQL)
export async function getReports() {
  try {
    return await db.select().from(reports).orderBy(desc(reports.ts));
  } catch (error) {
    console.error("Failed to fetch reports from Neon:", error);
    return [];
  }
}

// 4. Add Report (Neon PostgreSQL)
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

// 5. Verify Report (Neon PostgreSQL)
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

// 6. Save/update user profile (Neon PostgreSQL)
export async function saveUserAction(user: {
  id: string;
  name: string;
  email: string;
  phone?: string;
  role?: string;
}) {
  try {
    const [inserted] = await db
      .insert(users)
      .values({
        id: user.id,
        name: user.name,
        email: user.email.trim().toLowerCase(),
        phone: user.phone || null,
        role: user.role || "citizen",
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: user.name,
          phone: user.phone || null,
          role: user.role || "citizen",
        },
      })
      .returning();

    return { success: true, data: inserted };
  } catch (error: any) {
    console.error("Failed to save user in Neon DB:", error);
    return { success: false, error: error.message };
  }
}
