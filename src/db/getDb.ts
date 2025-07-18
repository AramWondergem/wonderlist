import { server$ } from "@builder.io/qwik-city";
import { drizzle } from "drizzle-orm/better-sqlite3";
import Database from "better-sqlite3";
import { schema } from "../../drizzle/schema";

export const getDb = server$(function () {
  const dbPath = this.env.get('DATABASE_PATH') || "./drizzle/db/db.sqlite";
  const sqlite = new Database(dbPath);
  return drizzle(sqlite, { schema });
}); 