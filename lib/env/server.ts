import "server-only";

import { z } from "zod";

import { publicEnv } from "@/lib/env/public";

const serverEnvSchema = z.object({
  POSTGRES_URL: z.string().min(1),
  POSTGRES_URL_NON_POOLING: z.string().min(1).optional(),
  SUPABASE_SERVICE_ROLE_KEY: z.string().min(1),
});

export const serverEnv = {
  ...publicEnv,
  ...serverEnvSchema.parse({
    POSTGRES_URL: process.env.POSTGRES_URL,
    POSTGRES_URL_NON_POOLING: process.env.POSTGRES_URL_NON_POOLING,
    SUPABASE_SERVICE_ROLE_KEY: process.env.SUPABASE_SERVICE_ROLE_KEY,
  }),
};
