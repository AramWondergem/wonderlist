import { defineConfig } from "drizzle-kit";

const dbUrl = process.env.DATABASE_PATH || "./drizzle/db/db.sqlite";

export default defineConfig({
  dialect: "sqlite",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations/",
  dbCredentials: {
    url: dbUrl,
  },
});
