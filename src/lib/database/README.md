# Database Library

`index.ts` creates the Neon HTTP Drizzle client when `DATABASE_URL` is configured. The `schema.ts` file is the schema source of truth. Neon HTTP is used for single-query/serverless workloads and runs without interactive transactions.

Authentication API requests return a configuration error when no database URL is set.
