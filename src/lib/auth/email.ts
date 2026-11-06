import { env } from "@/config/env";

export function isAuthEmailConfigured() {
  return Boolean(env.RESEND_API_KEY && env.AUTH_EMAIL_FROM);
}

export async function sendPasswordResetEmail(to: string, url: string) {
  if (!env.RESEND_API_KEY || !env.AUTH_EMAIL_FROM) {
    throw new Error("Password reset email is not configured.");
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${env.RESEND_API_KEY}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: env.AUTH_EMAIL_FROM,
      to: [to],
      subject: "Reset your ProofWork password",
      text: [
        "We received a request to reset your ProofWork password.",
        "",
        `Use this link to choose a new password: ${url}`,
        "",
        "This link expires in one hour. If you did not request a reset, you can ignore this email.",
      ].join("\n"),
    }),
  });

  if (!response.ok) {
    throw new Error(`Password reset email provider returned ${response.status}.`);
  }
}
