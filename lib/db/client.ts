import "server-only";

import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import { serverEnv } from "@/lib/env/server";
import * as schema from "@/lib/db/schema";

const connectionUrl =
  serverEnv.POSTGRES_URL_NON_POOLING ?? serverEnv.POSTGRES_URL;

const connection = postgres(connectionUrl, {
  prepare: false,
  // A small pool keeps parallel page queries responsive without opening too
  // many direct Postgres connections for this internal app.
  max: 3,
});

export const db = drizzle(connection, {
  schema,
});
