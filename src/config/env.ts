import { z } from 'zod/v4';

const envSchema = z.object({
  // Database
  DATABASE_URL: z.url().optional(),

  // Authentication
  BETTER_AUTH_SECRET: z.string().min(32).optional(),
  BETTER_AUTH_URL: z.url().default('http://localhost:3000'),
  RESEND_API_KEY: z.string().optional(),
  AUTH_EMAIL_FROM: z.string().optional(),

  // OpenAI
  OPENAI_API_KEY: z.string().optional(),
  OPENAI_MODEL: z.string().default('gpt-4.1-mini'),
  CRON_SECRET: z.string().min(32).optional(),

  // Cloudflare R2
  R2_ACCOUNT_ID: z.string().optional(),
  R2_ACCESS_KEY_ID: z.string().optional(),
  R2_SECRET_ACCESS_KEY: z.string().optional(),
  R2_BUCKET_NAME: z.string().optional(),

  // Application
  NEXT_PUBLIC_APP_URL: z.url().default('http://localhost:3000'),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
});

export type Env = z.infer<typeof envSchema>;

function getEnv(): Env {
  const parsed = envSchema.safeParse(process.env);

  if (!parsed.success) {
    console.error(
      '❌ Invalid environment variables:',
      z.prettifyError(parsed.error)
    );
    // In development, allow startup with warnings
    // In production, this should throw
    if (process.env.NODE_ENV === 'production') {
      throw new Error('Invalid environment variables');
    }
    // Return defaults for development
    return envSchema.parse({
      NODE_ENV: process.env.NODE_ENV || 'development',
    });
  }

  return parsed.data;
}

export const env = getEnv();
