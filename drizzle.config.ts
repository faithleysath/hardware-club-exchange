import { loadEnvFile } from "node:process";
import { defineConfig } from "drizzle-kit";

loadEnvFile(".env.development.local");

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL_NON_POOLING or POSTGRES_URL");
}

export default defineConfig({
  schema: "./lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: {
    url: connectionString,
  },
  verbose: true,
  strict: true,
});
