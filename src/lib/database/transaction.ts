import { Pool } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-serverless";
import { env } from "@/config/env";
import { databaseSchema } from "@/lib/database/schema";

const pool = env.DATABASE_URL_UNPOOLED
  ? new Pool({ connectionString: env.DATABASE_URL_UNPOOLED, max: 2 })
  : undefined;

export const transactionalDb = pool
  ? drizzle({ client: pool, schema: databaseSchema })
  : undefined;
