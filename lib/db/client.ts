import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { serverEnv } from "@/lib/env/server";
import * as schema from "@/lib/db/schema";

const connection = postgres(serverEnv.POSTGRES_URL, {
  prepare: false,
  max: 1,
});

export const db = drizzle(connection, {
  schema,
});
