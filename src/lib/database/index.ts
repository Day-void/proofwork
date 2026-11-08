import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import { env } from "@/config/env";
import { databaseSchema } from "@/lib/database/schema";

export const db = env.DATABASE_URL
  ? drizzle({ client: neon(env.DATABASE_URL), schema: databaseSchema })
  : undefined;
