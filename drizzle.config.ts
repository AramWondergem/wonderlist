import { defineConfig } from "drizzle-kit";
import { config } from 'dotenv';

config({ path: '.env' });
config({ path: '.env.local', override: true });

export default defineConfig({
  dialect: "postgresql",
  schema: "./drizzle/schema.ts",
  out: "./drizzle/migrations/",
  dbCredentials: {
    url: process.env.DB_URL!,
  },
});
