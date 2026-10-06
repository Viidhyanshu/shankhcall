import { pgTable, text, doublePrecision, boolean, bigint, jsonb, timestamp } from 'drizzle-orm/pg-core';

export interface HazardMedia {
  type: 'image' | 'video';
  data: string; // Base64 DataURL or URL
  name: string;
}

export const reports = pgTable('reports', {
  id: text('id').primaryKey(),
  lat: doublePrecision('lat').notNull(),
  lng: doublePrecision('lng').notNull(),
  type: text('type').notNull(),
  description: text('description').notNull(),
  src: text('src').notNull().default('citizen'),
  verified: boolean('verified').default(false),
  ts: bigint('ts', { mode: 'number' }).notNull(),
  lang: text('lang').notNull().default('en'),
  sentiment: doublePrecision('sentiment').default(0),
  media: jsonb('media').$type<HazardMedia[]>().default([]),
});

export const users = pgTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email').notNull().unique(),
  password: text('password'),
  phone: text('phone'),
  role: text('role').notNull().default('citizen'),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export const sessions = pgTable('sessions', {
  id: text('id').primaryKey(),
  userId: text('user_id').notNull().references(() => users.id, { onDelete: 'cascade' }),
  expiresAt: timestamp('expires_at', { withTimezone: true }).notNull(),
  createdAt: timestamp('created_at', { withTimezone: true }).defaultNow(),
});

export type Report = typeof reports.$inferSelect;
export type NewReport = typeof reports.$inferInsert;
export type User = typeof users.$inferSelect;
export type NewUser = typeof users.$inferInsert;
export type Session = typeof sessions.$inferSelect;
export type NewSession = typeof sessions.$inferInsert;
