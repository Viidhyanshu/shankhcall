"use server";
import { db, reports, users, NewReport } from "@/db";
import { desc, eq } from "drizzle-orm";
import { neon } from "@neondatabase/serverless";

// 1. Fetch all reports ordered by newest first
export async function getReports() {
  try {
    return await db.select().from(reports).orderBy(desc(reports.ts));
  } catch (error) {
    console.error("Failed to fetch reports from Neon:", error);
    return [];
  }
}

// 2. Add reported data to Neon database
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
  media?: Array<{ type: 'image' | 'video'; data: string; name: string }>;
}) {
  try {
    const [inserted] = await db.insert(reports).values({
      id: report.id,
      lat: report.lat,
      lng: report.lng,
      type: report.type,
      description: report.description,
      src: report.src || 'citizen',
      verified: report.verified ?? false,
      ts: report.ts,
      lang: report.lang || 'en',
      sentiment: report.sentiment ?? 0,
      media: report.media || [],
    }).returning();

    return { success: true, data: inserted };
  } catch (error: any) {
    console.error("Failed to add report to Neon DB:", error);
    return { success: false, error: error.message };
  }
}

// 3. Verify a report in Neon database
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

// 4. Save/update user profile in Neon database
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
        email: user.email,
        phone: user.phone || null,
        role: user.role || 'citizen',
      })
      .onConflictDoUpdate({
        target: users.id,
        set: {
          name: user.name,
          phone: user.phone || null,
          role: user.role || 'citizen',
        },
      })
      .returning();

    return { success: true, data: inserted };
  } catch (error: any) {
    console.error("Failed to save user in Neon DB:", error);
    return { success: false, error: error.message };
  }
}

// 5. Raw SQL query test function
export async function getData() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  const sql = neon(process.env.DATABASE_URL);
  const data = await sql`SELECT NOW()`;
  return data;
}
