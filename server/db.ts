import { drizzle } from "drizzle-orm/node-postgres";
import pg from "pg";
import * as schema from "@shared/schema";

const { Pool } = pg;

if (!process.env.DATABASE_URL) {
  console.warn(
    "DATABASE_URL not set. storage/db.ts will not export a valid database connection.",
  );
}

export const pool = process.env.DATABASE_URL
  ? new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  })
  : null;
export const db = pool ? drizzle(pool, { schema }) : null;

// Don't connect specifically on startup to avoid unhandled rejections in Vercel.
// The connection will be lazily established when the first query is run by Drizzle/Pool.
// if (pool) { ... }
