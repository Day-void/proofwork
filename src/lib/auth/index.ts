import { after } from "next/server";
import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { env } from "@/config/env";
import { db } from "@/lib/database";
import { authSchema } from "@/lib/database/schema";
import { sendPasswordResetEmail } from "@/lib/auth/email";

export const auth = betterAuth({
  appName: "ProofWork",
  baseURL: env.BETTER_AUTH_URL,
  ...(env.BETTER_AUTH_SECRET ? { secret: env.BETTER_AUTH_SECRET } : {}),
  trustedOrigins: [...new Set([env.BETTER_AUTH_URL, env.NEXT_PUBLIC_APP_URL])],
  ...(db
    ? {
        database: drizzleAdapter(db, {
          provider: "pg",
          schema: authSchema,
          // Neon HTTP does not provide interactive transactions.
          transaction: false,
        }),
      }
    : {}),
  user: {
    additionalFields: {
      role: {
        type: "string",
        required: false,
        defaultValue: "learner",
        input: false,
      },
    },
  },
  emailAndPassword: {
    enabled: true,
    minPasswordLength: 8,
    maxPasswordLength: 128,
    revokeSessionsOnPasswordReset: true,
    resetPasswordTokenExpiresIn: 60 * 60,
    sendResetPassword: async ({ user, url }) => {
      after(async () => {
        try {
          await sendPasswordResetEmail(user.email, url);
        } catch (error) {
          const message = error instanceof Error ? error.message : "Unknown mail provider error.";
          console.error("Could not send ProofWork password reset email:", message);
        }
      });
    },
  },
  rateLimit: {
    enabled: true,
    customRules: {
      "/request-password-reset": { window: 60, max: 5 },
      "/reset-password": { window: 60, max: 5 },
    },
  },
  session: {
    expiresIn: 60 * 60 * 24 * 7,
    updateAge: 60 * 60 * 24,
  },
});
