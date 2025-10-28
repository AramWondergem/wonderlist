import { server$ } from "@builder.io/qwik-city";
import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "../../drizzle/schema";
import { Pool } from "pg";

export const getDb = server$(function () {
  const pool = new Pool({
    connectionString: this.env.get('DB_URL'),
  });
  return drizzle(pool, { schema });
}); 