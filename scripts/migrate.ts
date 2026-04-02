import postgres from "postgres";
import { drizzle } from "drizzle-orm/postgres-js";
import { migrate } from "drizzle-orm/postgres-js/migrator";

import { loadLocalEnv } from "./load-env";

loadLocalEnv();

const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ?? process.env.POSTGRES_URL;

if (!connectionString) {
  throw new Error("Missing POSTGRES_URL_NON_POOLING or POSTGRES_URL");
}

const migrationClient = postgres(connectionString, {
  max: 1,
  prepare: false,
});

const db = drizzle(migrationClient);

async function run() {
  await migrate(db, {
    migrationsFolder: "drizzle",
  });

  await migrationClient.end();
}

run().catch(async (error) => {
  await migrationClient.end();
  throw error;
});
