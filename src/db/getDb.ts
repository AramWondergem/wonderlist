import { server$ } from "@builder.io/qwik-city";
import { drizzle } from "drizzle-orm/node-postgres";
import { schema } from "../../drizzle/schema";
import { Pool } from "pg";

export const getDb = server$(function () {
  const pool = new Pool({
    host: this.env.get('DB_HOST'),
    port: parseInt(this.env.get('DB_PORT') || '5432'),
    database: this.env.get('DB_NAME'),
    user: this.env.get('DB_USERNAME'),
    password: this.env.get('DB_PASSWORD'),
    ssl: this.env.get('DB_SSL') === 'true',
  });
  return drizzle(pool, { schema });
}); 