"use server";
import { neon } from "@neondatabase/serverless";

export async function getData() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not defined in environment variables");
  }

  const sql = neon(process.env.DATABASE_URL);
  // Replace the query below with your actual database query
  const data = await sql`SELECT NOW()`;
  return data;
}
